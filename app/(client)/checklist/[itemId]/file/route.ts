import { requireRole } from "@/lib/firebase/session.ts";
import { getUploadedFileStore } from "@/lib/uploaded-file-store.ts";

// "View submitted file": the client's own uploaded PDF, shown inline so
// the browser opens its PDF viewer in the new tab. Only the signed-in
// client's files; nothing is looked up by anything the URL claims.
export async function GET(_request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const { uid } = await requireRole(["client"]);
  const { itemId } = await params;
  const file = getUploadedFileStore().get(uid, itemId);

  if (!file) {
    return new Response(
      "This file isn't available to preview. Sample documents in the demo have no file attached; upload a PDF to preview it.",
      { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  const safeName = file.name.replace(/[^\w.\- ]+/g, "_");
  return new Response(file.bytes as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
