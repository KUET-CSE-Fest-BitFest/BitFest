/* Section heading for event pages, drawn exactly like the landing page's: number, rule, label, then a
   plain sentence-case headline. */
export default function SectionHead({
  eyebrow,
  title,
  sub,
  n,
  align = "left",
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
  n?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`flex flex-col gap-5 ${align === "center" ? "items-center text-center" : ""}`}>
      <p data-reveal className="flex items-center gap-3 text-[15px] font-medium text-muted">
        {n && <span className="tabular-nums text-orange">{n}</span>}
        <span aria-hidden className="h-px w-8 bg-line-2" />
        {eyebrow}
      </p>
      <h2 data-reveal className="max-w-[920px] text-[clamp(40px,5.2vw,76px)] font-semibold leading-[0.98] tracking-[-0.04em]">
        {title}
      </h2>
      {sub && (
        <p data-reveal className="max-w-[600px] text-lg leading-relaxed text-soft">
          {sub}
        </p>
      )}
    </div>
  );
}
