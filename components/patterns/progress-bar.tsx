// Figma intake progress: label left, percent right, gradient fill.
export function ProgressBar({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-sm font-medium">
        <span className="text-foreground">{label}</span>
        <span className="text-primary">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-3 overflow-hidden rounded-lg bg-secondary"
      >
        <div
          className="h-full rounded-lg bg-linear-to-r from-primary via-leaf to-lime"
          style={{ width: `${Math.max(percent, 2)}%` }}
        />
      </div>
    </div>
  );
}
