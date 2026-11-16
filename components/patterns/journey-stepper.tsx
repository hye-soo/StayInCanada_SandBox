import Image from "next/image";
import { cn } from "cn";

type StepState = "done" | "current" | "upcoming";

const MARK: Record<StepState, { src: string; size: number }> = {
  done: { src: "/overview/step-done.svg", size: 30 },
  current: { src: "/overview/step-current.svg", size: 38 },
  upcoming: { src: "/overview/step-upcoming.svg", size: 24 },
};

// Figma "CheckPoint": steps before `currentStep` (1-based) are done,
// joined by lime lines; the rest are grey.
export function JourneyStepper({ steps, currentStep }: { steps: readonly string[]; currentStep: number }) {
  return (
    <ol className="flex items-start">
      {steps.map((label, index) => {
        const state: StepState =
          index + 1 < currentStep ? "done" : index + 1 === currentStep ? "current" : "upcoming";
        const { src, size } = MARK[state];
        return (
          <li key={label} className="relative flex flex-1 flex-col items-center gap-2">
            {index < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute top-[18px] left-1/2 h-0.5 w-full",
                  index + 1 < currentStep ? "bg-lime" : "bg-track"
                )}
              />
            ) : null}
            <span className="relative flex size-[38px] items-center justify-center">
              <Image src={src} alt="" width={size} height={size} style={{ width: size, height: size }} />
            </span>
            <span
              aria-current={state === "current" ? "step" : undefined}
              className="text-sm font-medium whitespace-nowrap text-foreground"
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
