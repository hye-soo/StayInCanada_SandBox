// Figma "SmallCards": a label and one big number.
export function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <section className="flex min-h-[154px] flex-col gap-4 rounded-lg border border-border bg-card p-6">
      <h2 className="text-xl font-semibold text-foreground">{label}</h2>
      <p className="text-[32px] font-bold leading-10 text-primary">{value}</p>
    </section>
  );
}
