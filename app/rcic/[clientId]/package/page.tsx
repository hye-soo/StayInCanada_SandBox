import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientChecklist } from "@/lib/client-checklist.ts";
import { getClientSummary } from "@/lib/client-directory.ts";
import { PrintButton } from "@/components/print-button.tsx";

// A real, downloadable file for a package that's otherwise entirely
// mocked (no file storage exists yet to assemble a real ZIP from —
// see docs/DECISIONS.md). Same browser print-to-PDF approach already
// used for the CIF summary, applied to the package manifest instead.
export default async function RcicPackagePage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  await requireRole(["rcic"]);
  const { clientId } = await params;
  const { items } = getClientChecklist(clientId);
  const summary = getClientSummary(clientId);
  const pkg = summary.submission.package;
  if (!pkg) notFound();

  const approvedItems = items.filter((item) => item.status === "approved");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link href={`/rcic/${clientId}/validation`} className="text-sm text-muted-foreground hover:underline">
          Back to final review
        </Link>
        <PrintButton />
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Application package v{pkg.version}</h1>
        <p className="text-sm text-muted-foreground">
          Client {clientId} • {summary.visaTypeLabel} • Prepared by {pkg.preparedBy} on{" "}
          {new Date(pkg.preparedAt).toLocaleString()}
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Official application forms</h2>
        <p className="text-sm text-muted-foreground">
          Mock preview — no real IRCC form generation exists yet.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">
          Supporting evidence — {approvedItems.length} document{approvedItems.length === 1 ? "" : "s"}
        </h2>
        <ul className="flex flex-col gap-2">
          {approvedItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-[var(--radius-md)] border border-border p-3 text-sm"
            >
              <span>{item.label}</span>
              <span className="text-muted-foreground">{item.fileName ?? "—"}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Client authorization</h2>
        <p className="text-sm text-muted-foreground">Signed — see client intake declaration.</p>
      </section>
    </main>
  );
}
