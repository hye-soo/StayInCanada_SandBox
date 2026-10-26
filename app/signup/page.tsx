import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Sign up</h1>
      <p className="text-sm text-muted-foreground">
        New client accounts are created through an invitation from your advisor, sent after your
        consultation — there&apos;s no open sign-up form. If you have an invitation link, open it
        directly to create your account.
      </p>
      <p className="text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="underline">Log in</Link>
      </p>
    </main>
  );
}
