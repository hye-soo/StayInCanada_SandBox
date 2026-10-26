import Link from "next/link";
import { requireRole } from "@/lib/firebase/session.ts";
import { EMPLOYMENT_ENTRY_FIELDS } from "@/lib/questionnaire-fields.ts";
import { Button } from "@/components/ui/button";
import { addEmploymentEntry } from "./actions.ts";

export default async function NewEmploymentEntryPage() {
  await requireRole(["client"]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <Link href="/questionnaire/employment" className="text-sm text-muted-foreground hover:underline">
        Back to Employment History
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Add employer</h1>

      <form action={addEmploymentEntry} className="flex flex-col gap-3">
        {EMPLOYMENT_ENTRY_FIELDS.map((field) => (
          <label key={field.name as string} className="flex flex-col gap-1 text-sm">
            {field.label}
            <input
              type="text"
              name={field.name as string}
              className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
            />
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="toPresent" />
          To Present
        </label>
        <Button type="submit" className="self-start">
          Save employer
        </Button>
      </form>
    </main>
  );
}
