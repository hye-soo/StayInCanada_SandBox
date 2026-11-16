import Image from "next/image";
import { cn } from "cn";

// Figma Style Guide "Logo 3 — Bird + F + Check".
//   mark          the symbol alone, in the current text color
//   full          symbol + wordmark for light backgrounds (brand colors)
//   full-on-dark  symbol + wordmark for dark backgrounds (lime + white)
type LogoVariant = "mark" | "full" | "full-on-dark";

const FULL = {
  full: { mark: "/brand/mark.svg", markSize: [63, 72], word: "/brand/wordmark.svg", wordSize: [194, 39] },
  "full-on-dark": {
    mark: "/brand/mark-on-dark.svg",
    markSize: [47, 53],
    word: "/brand/wordmark-on-dark.svg",
    wordSize: [172, 34],
  },
} as const;

export function Logo({ variant = "mark", className }: { variant?: LogoVariant; className?: string }) {
  if (variant === "mark") {
    return (
      <span
        role="img"
        aria-label="FlowOui"
        className={cn("inline-block size-8 shrink-0 bg-current", className)}
        style={{
          maskImage: "url(/brand/mark.svg)",
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
        }}
      />
    );
  }

  const { mark, markSize, word, wordSize } = FULL[variant];
  return (
    <span role="img" aria-label="FlowOui" className={cn("inline-flex h-8 shrink-0 items-center gap-2", className)}>
      <Image src={mark} alt="" width={markSize[0]} height={markSize[1]} className="h-full w-auto" />
      <Image src={word} alt="" width={wordSize[0]} height={wordSize[1]} className="h-[54%] w-auto" />
    </span>
  );
}
