import Link from "next/link";
import { requireRole } from "@/lib/firebase/session.ts";
import { CHILD_ENTRY_FIELDS } from "@/lib/questionnaire-fields.ts";
import { Button } from "@/components/ui/button";
import { addChildEntry } from "./actions.ts";

export default async function NewChildEntryPage() {
  await requireRole(["client"]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <Link href="/questionnaire/children" className="text-sm text-muted-foreground hover:underline">
        Back to Children
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Add child</h1>

      <form action={addChildEntry} className="flex flex-col gap-3">
        {CHILD_ENTRY_FIELDS.map((field) => (
          <label key={field.name as string} className="flex flex-col gap-1 text-sm">
            {field.label}
            <input
              type="text"
              name={field.name as string}
              className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
            />
          </label>
        ))}
        <Button type="submit" className="self-start">
          Save child
        </Button>
      </form>
    </main>
  );
}
