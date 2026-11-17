// ponytail: uploaded PDFs held in memory (max 4 MB each) so the client
// can preview what they sent. Swap for real file storage (and staff
// access) once there's a backend.
export interface UploadedFile {
  name: string;
  bytes: Uint8Array;
}

export interface UploadedFileStore {
  save(clientId: string, itemId: string, file: UploadedFile): void;
  get(clientId: string, itemId: string): UploadedFile | undefined;
}

class InMemoryUploadedFileStore implements UploadedFileStore {
  private readonly files = new Map<string, UploadedFile>();

  save(clientId: string, itemId: string, file: UploadedFile): void {
    this.files.set(`${clientId}/${itemId}`, file);
  }

  get(clientId: string, itemId: string): UploadedFile | undefined {
    return this.files.get(`${clientId}/${itemId}`);
  }
}

// Kept on globalThis: the preview route handler is bundled apart from the
// pages and server actions, and a plain module variable would give it
// its own, empty copy.
const holder = globalThis as typeof globalThis & { __flowouiUploadedFiles?: UploadedFileStore };

export function getUploadedFileStore(): UploadedFileStore {
  // After a code change in dev the old instance (old class) is replaced,
  // so it never lacks newly added methods.
  if (!(holder.__flowouiUploadedFiles instanceof InMemoryUploadedFileStore)) holder.__flowouiUploadedFiles = new InMemoryUploadedFileStore();
  return holder.__flowouiUploadedFiles;
}

// Demo only: forget every uploaded file.
export function resetUploadedFileStore(): void {
  holder.__flowouiUploadedFiles = undefined;
}
