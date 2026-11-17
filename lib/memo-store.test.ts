import { test } from "node:test";
import assert from "node:assert/strict";
import { getMemoStore } from "./memo-store.ts";

const related = { label: "Document checklist · Passport", href: "/checklist/passport" };

test("a staff memo waits on the client and starts unread; a reply hands it back to the team", () => {
  const store = getMemoStore();
  const memo = store.create("uid-m-1", { from: "staff", authorName: "Alex Morgan", subject: "Passport needs replacing", body: "Please re-upload.", related });
  assert.equal(memo.waitingOn, "client");
  assert.equal(memo.unreadForClient, true);

  store.reply("uid-m-1", memo.id, { from: "client", authorName: "Alice Chang", body: "Uploaded a new scan." });
  const after = store.get("uid-m-1", memo.id)!;
  assert.equal(after.messages.length, 2);
  assert.equal(after.waitingOn, "team");
  assert.equal(after.unreadForClient, false);

  store.markRead("uid-m-1", memo.id);
  assert.equal(store.get("uid-m-1", memo.id)!.unreadForClient, false);
});

test("a client memo can be edited or deleted only until the team replies", () => {
  const store = getMemoStore();
  const memo = store.create("uid-m-2", { from: "client", authorName: "Alice Chang", subject: "Hotel stay", body: "Should I include it?", related });
  assert.equal(memo.waitingOn, "team");
  assert.equal(memo.unreadForClient, false);
  assert.equal(store.edit("uid-m-2", memo.id, { subject: "Hotel stay?", body: "Include the hotel?" }), true);
  assert.equal(store.get("uid-m-2", memo.id)!.messages[0]!.body, "Include the hotel?");

  store.reply("uid-m-2", memo.id, { from: "staff", authorName: "Alex Morgan", body: "Yes, include it." });
  assert.equal(store.edit("uid-m-2", memo.id, { subject: "x", body: "y" }), false);
  assert.equal(store.remove("uid-m-2", memo.id), false);
  assert.equal(store.get("uid-m-2", memo.id)!.unreadForClient, true);
});

test("memos list newest activity first, per client", () => {
  const store = getMemoStore();
  const first = store.create("uid-m-3", { from: "client", authorName: "A", subject: "One", body: "1", related });
  const second = store.create("uid-m-3", { from: "client", authorName: "A", subject: "Two", body: "2", related });
  assert.deepEqual(store.list("uid-m-3").map((memo) => memo.id), [second.id, first.id]);
  assert.equal(store.remove("uid-m-3", second.id), true);
  assert.deepEqual(store.list("uid-m-3").map((memo) => memo.id), [first.id]);
  assert.deepEqual(store.list("uid-m-other"), []);
});

test("staff have their own unread state, and see every client's memos", () => {
  const store = getMemoStore();
  const question = store.create("uid-m-staff-a", { from: "client", authorName: "A", subject: "Hotel?", body: "Include it?", related });
  assert.equal(question.unreadForStaff, true);
  store.markReadByStaff("uid-m-staff-a", question.id);
  assert.equal(store.get("uid-m-staff-a", question.id)!.unreadForStaff, false);

  store.reply("uid-m-staff-a", question.id, { from: "client", authorName: "A", body: "Also the hostel?" });
  assert.equal(store.get("uid-m-staff-a", question.id)!.unreadForStaff, true);
  store.reply("uid-m-staff-a", question.id, { from: "staff", authorName: "Maya", body: "Yes, both." });
  assert.equal(store.get("uid-m-staff-a", question.id)!.unreadForStaff, false);

  const note = store.create("uid-m-staff-b", { from: "staff", authorName: "Maya", subject: "Hi", body: "Welcome", related });
  assert.equal(note.unreadForStaff, false);
  const all = store.listAll().filter(({ clientId }) => clientId.startsWith("uid-m-staff-"));
  assert.deepEqual(all.map(({ clientId, memo }) => [clientId, memo.id]), [
    ["uid-m-staff-b", note.id],
    ["uid-m-staff-a", question.id],
  ]);
});
