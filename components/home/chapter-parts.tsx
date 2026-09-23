import type { CaseContent } from "@/content/cases/types";

type Tone = "light" | "dark";

export function ChapterMeta({ index, c, tone = "light" }: { index: number; c: CaseContent; tone?: Tone }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
      <span className={`tabular font-semibold ${tone === "dark" ? "text-signal" : "text-signal-strong"}`}>
        {String(index).padStart(2, "0")}
      </span>
      <span className="font-semibold">{c.name}</span>
      <span aria-hidden="true" className={`hidden sm:inline ${tone === "dark" ? "text-on-night-2" : "text-ink-3"}`}>
        /
      </span>
      <span className={`basis-full sm:basis-auto ${tone === "dark" ? "text-on-night-2" : "text-ink-2"}`}>
        {c.kind} · {c.year}
      </span>
    </p>
  );
}

export function ChapterTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="mt-6 max-w-[18ch] font-display text-3xl font-extrabold">
      {children}
    </h3>
  );
}

export function FactList({ facts, tone = "light", className = "" }: { facts: string[]; tone?: Tone; className?: string }) {
  const line = tone === "dark" ? "border-night-line" : "border-line";
  return (
    <ul className={`border-t ${line} ${className}`}>
      {facts.map((fact) => (
        <li key={fact} className={`flex gap-4 border-b ${line} py-4 text-[0.9375rem] leading-relaxed`}>
          <span aria-hidden="true" className="mt-[0.6em] size-1.5 shrink-0 bg-signal" />
          <span className={tone === "dark" ? "text-on-night" : "text-ink"}>{fact}</span>
        </li>
      ))}
    </ul>
  );
}
