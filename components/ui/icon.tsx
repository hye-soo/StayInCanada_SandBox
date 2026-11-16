import { cn } from "cn";

// Renders an icon SVG from public/ as a mask so it takes the current
// text color: one asset works for active, inactive and inverse states.
export function Icon({ src, className }: { src: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-5 shrink-0 bg-current", className)}
      style={{
        maskImage: `url(${src})`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
      }}
    />
  );
}
