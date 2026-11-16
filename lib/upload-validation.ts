import { MAX_UPLOAD_BYTES } from "./checklist-transitions.ts";

// Figma "Upload flow • 04 • File validation error": the same check runs
// in the browser (before uploading) and in the server action.
export function validateUploadFile(file: { name: string; size: number; type: string }): string | undefined {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "Only PDF files can be added. Save your document as a PDF and try again.";
  if (file.size === 0) return "This file is empty. Choose another file and try again.";
  if (file.size > MAX_UPLOAD_BYTES) return "The file is larger than 4 MB. Choose a file within the limit and try again.";
  return undefined;
}

// Server-side: the bytes must start with "%PDF-", whatever the file is
// called, before it's kept and served back as a PDF.
export function isPdfBytes(bytes: Uint8Array): boolean {
  const header = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
  return bytes.length >= header.length && header.every((byte, index) => bytes[index] === byte);
}

// "2.4 MB", or "180 KB" for small files.
export function formatFileSize(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
