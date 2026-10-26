import Link from "next/link";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire } from "@/lib/client-questionnaire.ts";
import { PASSPORT_FIELDS } from "@/lib/questionnaire-fields.ts";
import { Button } from "@/components/ui/button";
import { savePassport } from "./actions.ts";

export default async function PassportPage() {
  const { uid } = await requireRole(["client"]);
  const { passport } = getClientQuestionnaire(uid);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <Link href="/questionnaire" className="text-sm text-muted-foreground hover:underline">
        Back to Client Information Form
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Passport</h1>

      <form action={savePassport} className="flex flex-col gap-3">
        {PASSPORT_FIELDS.map((field) => (
          <label key={field.name as string} className="flex flex-col gap-1 text-sm">
            {field.label}
            <input
              type="text"
              name={field.name as string}
              defaultValue={passport[field.name] ?? ""}
              className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
            />
          </label>
        ))}
        <Button type="submit" className="self-start">
          Save and finish
        </Button>
      </form>
    </main>
  );
}
