import Link from "next/link";
import { requireRole } from "@/lib/firebase/session.ts";
import { getClientQuestionnaire } from "@/lib/client-questionnaire.ts";
import { Button } from "@/components/ui/button";
import { saveLanguageTest } from "./actions.ts";

export default async function LanguageTestPage() {
  const { uid } = await requireRole(["client"]);
  const { languageTest } = getClientQuestionnaire(uid);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <Link href="/questionnaire" className="text-sm text-muted-foreground hover:underline">
        Back to Client Information Form
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Language Test</h1>

      <form action={saveLanguageTest} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Have you taken any language proficiency test?
          <select
            name="hasTakenTest"
            defaultValue={languageTest.hasTakenTest ?? ""}
            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Select one
            </option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
        <Button type="submit" className="self-start">
          Save and finish
        </Button>
      </form>
    </main>
  );
}
