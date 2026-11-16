import type { ReactNode } from "react";
import Image from "next/image";
import { Logo } from "@/components/ui/logo";

interface AuthShellProps {
  heroTitle: ReactNode;
  heroBody: ReactNode;
  title: ReactNode;
  children: ReactNode;
}

// Shared skeleton for the auth screens (A01 accept invitation, A02 sign
// in): brand image + message on the left, form card on the right.
// The hero is hidden below lg; the card carries the logo too.
export function AuthShell({ heroTitle, heroBody, title, children }: AuthShellProps) {
  return (
    <main className="relative flex min-h-dvh flex-1 bg-navy p-4 sm:p-8 lg:p-0">
      {/* Full background below lg (card floats on it); from lg it fills the
          hero and runs 50px under the card so the rounded corner shows it.
          Anchored top-right to keep the green corner of the gradient. */}
      <div className="absolute inset-0 lg:right-[calc(min(50%,45rem)-50px)]">
        <Image
          src="/onboarding_image.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover object-right-top"
        />
      </div>
      <section className="relative hidden flex-1 flex-col gap-10 px-16 pt-52 pb-16 text-primary-foreground lg:flex">
        <Logo className="absolute left-16 top-[72px] size-12 text-white" />
        <p className="relative max-w-[38rem] text-5xl font-extralight leading-[56px]">{heroTitle}</p>
        <div className="relative flex max-w-[38rem] flex-col gap-10 text-2xl font-semibold">{heroBody}</div>
      </section>

      <section className="relative flex w-full flex-col justify-center bg-background px-6 py-12 sm:px-12 rounded-[30px] lg:w-1/2 lg:max-w-[45rem] lg:rounded-none lg:rounded-l-[50px] lg:px-[72px]">
        <div className="mx-auto flex w-full max-w-[36rem] flex-col gap-6">
          <div className="flex flex-col gap-1 text-foreground">
            <Logo className="size-9 text-navy" />
            <h1 className="text-[32px] font-bold leading-10">{title}</h1>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
