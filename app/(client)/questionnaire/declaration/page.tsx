import Link from "next/link";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire } from "@/lib/client-questionnaire.ts";
import { DECLARATION_FIELDS } from "@/lib/questionnaire-fields.ts";
import { Button } from "@/components/ui/button";
import { saveDeclaration } from "./actions.ts";

export default async function DeclarationPage() {
  const { uid } = await requireRole(["client"]);
  const { declaration } = getClientQuestionnaire(uid);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <Link href="/questionnaire" className="text-sm text-muted-foreground hover:underline">
        Back to Client Information Form
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Declaration</h1>
      <p className="text-sm font-medium">
        Read the following carefully and answer truthfully. Have you OR any of your family
        members ever:
      </p>

      <form action={saveDeclaration} className="flex flex-col gap-4">
        {DECLARATION_FIELDS.map((field) => (
          <label key={field.name as string} className="flex flex-col gap-1 text-sm">
            {field.label}
            <select
              name={field.name as string}
              defaultValue={declaration[field.name] ?? ""}
              className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Select one
              </option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
        ))}
        <Button type="submit" className="self-start">
          Save and finish
        </Button>
      </form>
    </main>
  );
}
