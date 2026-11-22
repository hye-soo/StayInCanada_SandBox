import { requireRole } from "@/lib/firebase/session.ts";
import { getUploadedFileStore, uploadedFileResponse } from "@/lib/uploaded-file-store.ts";

// "View submitted file": the client's own uploaded PDF, shown inline so
// the browser opens its PDF viewer in the new tab. Only the signed-in
// client's files; nothing is looked up by anything the URL claims.
export async function GET(_request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const { uid } = await requireRole(["client"]);
  const { itemId } = await params;
  return uploadedFileResponse(getUploadedFileStore().get(uid, itemId));
}
