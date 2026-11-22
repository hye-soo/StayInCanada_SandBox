import { requireRole } from "@/lib/firebase/session.ts";
import { getUploadedFileStore, uploadedFileResponse } from "@/lib/uploaded-file-store.ts";

// Staff "Open file": any client's uploaded PDF, admin only.
export async function GET(_request: Request, { params }: { params: Promise<{ clientId: string; itemId: string }> }) {
  await requireRole(["admin"]);
  const { clientId, itemId } = await params;
  return uploadedFileResponse(getUploadedFileStore().get(clientId, itemId));
}
