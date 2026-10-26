import Link from "next/link";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire } from "@/lib/client-questionnaire.ts";
import { Button } from "@/components/ui/button";
import { saveTravelledFlag } from "./actions.ts";
import { removeTravelHistoryEntry } from "./[index]/actions.ts";

export default async function TravelHistoryPage() {
  const { uid } = await requireRole(["client"]);
  const { travelHistory } = getClientQuestionnaire(uid);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <Link href="/questionnaire" className="text-sm text-muted-foreground hover:underline">
        Back to Client Information Form
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Travel History</h1>

      <form action={saveTravelledFlag} className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-border bg-card p-4">
        <label className="flex flex-col gap-1 text-sm">
          Since the age of 18 or during the past five years, whichever is more recent, have
          you travelled to any country or territory other than your country of citizenship or
          current residence?
          <select
            name="hasTravelled"
            defaultValue={travelHistory.hasTravelled ?? ""}
            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Select one
            </option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
        <Button type="submit" variant="outline" className="self-start">
          Save
        </Button>
      </form>

      {travelHistory.entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No travel entries added yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {travelHistory.entries.map((entry, index) => (
            <li
              key={index}
              className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-border bg-card p-4"
            >
              <div>
                <p className="font-medium">{entry.countryOrTerritory || "(no country)"}</p>
                <p className="text-sm text-muted-foreground">
                  {entry.from || "?"} - {entry.to || "?"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/questionnaire/travel-history/${index}`}
                  className="text-sm hover:underline"
                >
                  Edit
                </Link>
                <form action={removeTravelHistoryEntry.bind(null, index)}>
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
        render={<Link href="/questionnaire/travel-history/new">Add travel entry</Link>}
      />
    </main>
  );
}
