// Memo & Updates threads between one client and their case team
// (Figma "Memo & Updates / Client"). A memo is a subject, what it's
// about, and its messages; whoever didn't write the last message is up.

export type MemoAuthor = "staff" | "client";

export interface MemoMessage {
  from: MemoAuthor;
  authorName: string;
  body: string;
  at: number;
}

export interface MemoRelated {
  label: string;
  // Where "Review / Open" takes the client (a checklist item, an intake
  // step, ...). Optional for general questions.
  href?: string;
}

export interface Memo {
  id: string;
  subject: string;
  related: MemoRelated;
  // Label for the client's main button on a staff memo, e.g. "Open document".
  actionLabel?: string;
  messages: MemoMessage[];
  startedBy: MemoAuthor;
  waitingOn: "client" | "team";
  unreadForClient: boolean;
  // Staff side: a client's new memo or reply is unread until a staff
  // member opens it or answers.
  unreadForStaff: boolean;
  createdAt: number;
  updatedAt: number;
  // Monotonic, so ordering is stable even within the same millisecond.
  seq: number;
}

export interface NewMemo {
  from: MemoAuthor;
  authorName: string;
  subject: string;
  body: string;
  related: MemoRelated;
  actionLabel?: string;
}

export interface MemoStore {
  list(clientId: string): Memo[];
  get(clientId: string, memoId: string): Memo | undefined;
  create(clientId: string, memo: NewMemo): Memo;
  reply(clientId: string, memoId: string, message: Omit<MemoMessage, "at">): Memo | undefined;
  markRead(clientId: string, memoId: string): void;
  markReadByStaff(clientId: string, memoId: string): void;
  // Every client's memos, newest activity first (staff Memo & Updates).
  listAll(): { clientId: string; memo: Memo }[];
  // Client's own memo, only while nobody has replied yet.
  edit(clientId: string, memoId: string, changes: { subject: string; body: string }): boolean;
  remove(clientId: string, memoId: string): boolean;
}

// ponytail: in-memory, same pattern as the other stores.
class InMemoryMemoStore implements MemoStore {
  private readonly byClient = new Map<string, Memo[]>();
  private nextId = 1;
  private nextSeq = 1;

  private memos(clientId: string): Memo[] {
    let memos = this.byClient.get(clientId);
    if (!memos) {
      memos = [];
      this.byClient.set(clientId, memos);
    }
    return memos;
  }

  list(clientId: string): Memo[] {
    return [...this.memos(clientId)].sort((a, b) => b.seq - a.seq);
  }

  get(clientId: string, memoId: string): Memo | undefined {
    return this.memos(clientId).find((memo) => memo.id === memoId);
  }

  create(clientId: string, input: NewMemo): Memo {
    const now = Date.now();
    const memo: Memo = {
      id: String(this.nextId++),
      subject: input.subject,
      related: input.related,
      actionLabel: input.actionLabel,
      messages: [{ from: input.from, authorName: input.authorName, body: input.body, at: now }],
      startedBy: input.from,
      waitingOn: input.from === "staff" ? "client" : "team",
      unreadForClient: input.from === "staff",
      unreadForStaff: input.from === "client",
      createdAt: now,
      updatedAt: now,
      seq: this.nextSeq++,
    };
    this.memos(clientId).push(memo);
    return memo;
  }

  reply(clientId: string, memoId: string, message: Omit<MemoMessage, "at">): Memo | undefined {
    const memo = this.get(clientId, memoId);
    if (!memo) return undefined;
    const now = Date.now();
    memo.messages.push({ ...message, at: now });
    memo.waitingOn = message.from === "staff" ? "client" : "team";
    memo.unreadForClient = message.from === "staff";
    memo.unreadForStaff = message.from === "client";
    memo.updatedAt = now;
    memo.seq = this.nextSeq++;
    return memo;
  }

  markRead(clientId: string, memoId: string): void {
    const memo = this.get(clientId, memoId);
    if (memo) memo.unreadForClient = false;
  }

  markReadByStaff(clientId: string, memoId: string): void {
    const memo = this.get(clientId, memoId);
    if (memo) memo.unreadForStaff = false;
  }

  listAll(): { clientId: string; memo: Memo }[] {
    return [...this.byClient.entries()]
      .flatMap(([clientId, memos]) => memos.map((memo) => ({ clientId, memo })))
      .sort((a, b) => b.memo.seq - a.memo.seq);
  }

  private editable(memo: Memo | undefined): memo is Memo {
    return Boolean(memo && memo.startedBy === "client" && memo.messages.length === 1);
  }

  edit(clientId: string, memoId: string, changes: { subject: string; body: string }): boolean {
    const memo = this.get(clientId, memoId);
    if (!this.editable(memo)) return false;
    memo.subject = changes.subject;
    memo.messages[0]!.body = changes.body;
    memo.updatedAt = Date.now();
    return true;
  }

  remove(clientId: string, memoId: string): boolean {
    const memo = this.get(clientId, memoId);
    if (!this.editable(memo)) return false;
    const memos = this.memos(clientId);
    memos.splice(memos.indexOf(memo), 1);
    return true;
  }
}

// Kept on globalThis: in dev, pages, server actions and route handlers
// can be bundled separately, and a plain module variable gives each its
// own empty copy.
const holder = globalThis as typeof globalThis & { __flowouiMemos?: MemoStore };

export function getMemoStore(): MemoStore {
  // After a code change in dev the old instance (old class) is replaced,
  // so it never lacks newly added methods.
  if (!(holder.__flowouiMemos instanceof InMemoryMemoStore)) holder.__flowouiMemos = new InMemoryMemoStore();
  return holder.__flowouiMemos;
}

// Demo only: forget every memo.
export function resetMemoStore(): void {
  holder.__flowouiMemos = undefined;
}
