import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire } from "@/lib/client-questionnaire.ts";
import { CHILD_ENTRY_FIELDS } from "@/lib/questionnaire-fields.ts";
import { Button } from "@/components/ui/button";
import { updateChildEntry } from "./actions.ts";

export default async function EditChildEntryPage({
  params,
}: {
  params: Promise<{ index: string }>;
}) {
  const { uid } = await requireRole(["client"]);
  const { index: indexParam } = await params;
  const index = Number(indexParam);

  const { children } = getClientQuestionnaire(uid);
  const entry = children[index];
  if (!Number.isInteger(index) || !entry) notFound();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <Link href="/questionnaire/children" className="text-sm text-muted-foreground hover:underline">
        Back to Children
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Edit child</h1>

      <form action={updateChildEntry.bind(null, index)} className="flex flex-col gap-3">
        {CHILD_ENTRY_FIELDS.map((field) => (
          <label key={field.name as string} className="flex flex-col gap-1 text-sm">
            {field.label}
            <input
              type="text"
              name={field.name as string}
              defaultValue={entry[field.name] ?? ""}
              className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
            />
          </label>
        ))}
        <Button type="submit" className="self-start">
          Save changes
        </Button>
      </form>
    </main>
  );
}
