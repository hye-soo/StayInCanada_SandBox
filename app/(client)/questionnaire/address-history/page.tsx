import Link from "next/link";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire } from "@/lib/client-questionnaire.ts";
import { Button } from "@/components/ui/button";
import { removeAddressHistoryEntry } from "./[index]/actions.ts";

export default async function AddressHistoryPage() {
  const { uid } = await requireRole(["client"]);
  const { addressHistory } = getClientQuestionnaire(uid);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <Link href="/questionnaire" className="text-sm text-muted-foreground hover:underline">
        Back to Client Information Form
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">
        Address History (Past 10 Years)
      </h1>

      {addressHistory.length === 0 ? (
        <p className="text-sm text-muted-foreground">No addresses added yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {addressHistory.map((entry, index) => (
            <li
              key={index}
              className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-border bg-card p-4"
            >
              <div>
                <p className="font-medium">{entry.address || "(no address)"}</p>
                <p className="text-sm text-muted-foreground">
                  {entry.from || "?"} - {entry.to || "?"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/questionnaire/address-history/${index}`}
                  className="text-sm hover:underline"
                >
                  Edit
                </Link>
                <form action={removeAddressHistoryEntry.bind(null, index)}>
                  <Button type="submit" variant="outline" size="sm">
                    Remove
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Button
        variant="outline"
        render={<Link href="/questionnaire/address-history/new">Add address</Link>}
      />
    </main>
  );
}
