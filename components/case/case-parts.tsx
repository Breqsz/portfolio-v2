import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ArrowLink } from "@/components/arrow-link";
import { MediaFrame } from "@/components/media-frame";
import type { CaseContent, Media, Metric } from "@/content/cases/types";
import type { Dictionary } from "@/content/dictionary";
import type { Locale } from "@/lib/i18n";

type Labels = Dictionary["caseLabels"];

export function CaseHero({ c, t, locale }: { c: CaseContent; t: Dictionary; locale: Locale }) {
  const L = t.caseLabels;
  return (
    <header className="shell pb-16 pt-6 lg:pb-24 lg:pt-10">
      <Link
        href={`/${locale}#${c.slug}`}
        className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-2 transition-colors duration-150 hover:text-ink"
      >
        <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.75} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
        {L.back}
      </Link>
      <div className="grid-12 mt-10 gap-y-12 lg:mt-14">
        <div className="col-span-12 lg:col-span-8">
          <p className="text-sm text-ink-2">
            {c.kind} · {c.year}
          </p>
          <h1 className="mt-4 font-display text-[clamp(4rem,1.8rem+8.4vw,9rem)] font-extrabold uppercase leading-[0.86]">{c.name}</h1>
          <p className="mt-8 max-w-[20ch] font-display text-[clamp(1.875rem,1.3rem+2.2vw,3.25rem)] font-bold leading-none text-signal-strong">
            {c.hook}
          </p>
          <p className="mt-6 max-w-[58ch] text-lg text-ink-2">{c.problem}</p>
        </div>
        <dl className="col-span-12 self-end border-t border-line text-sm lg:col-span-4">
          <Row label={L.role}>{c.role}</Row>
          <Row label={L.stack}>{c.stack.join(" · ")}</Row>
          <Row label={L.links}>
            {c.links.length ? (
              <span className="flex flex-col">
                {c.links.map((link) => (
                  <ArrowLink key={link.href} href={link.href} external newTabLabel={t.work.newTab} className="text-sm">
                    {link.label}
                  </ArrowLink>
                ))}
              </span>
            ) : (
              <span className="text-ink-2">{c.linksNote}</span>
            )}
          </Row>
        </dl>
      </div>
    </header>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-4 border-b border-line py-3.5">
      <dt className="text-ink-3">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function CaseSummary({ c, L }: { c: CaseContent; L: Labels }) {
  const rows = [
    [L.what, c.summary.what],
    [L.did, c.summary.did],
    [L.proves, c.summary.proves],
  ] as const;
  return (
    <section aria-labelledby="resumo-title" className="bg-surface">
      <div className="shell py-14 lg:py-20">
        <h2 id="resumo-title" className="text-sm font-semibold text-ink-2">
          {L.summary}
        </h2>
        <dl className="mt-8 grid gap-x-10 gap-y-10 md:grid-cols-3">
          {rows.map(([label, value]) => (
            <div key={label} className="border-t border-ink pt-4">
              <dt className="text-lg font-semibold">{label}</dt>
              <dd className="mt-2 text-ink-2">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

const SPAN: Record<number, string> = {
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  8: "md:col-span-8",
  9: "md:col-span-9",
};

/** Primeira tela grande; as outras em grade, com o celular na proporção do celular. */
export function CaseGallery({ media, label }: { media: Media[]; label: string }) {
  if (!media.length) return null;
  const [first, ...rest] = media;
  const desktop = rest.filter((m) => m.device === "desktop");
  const mobile = rest.filter((m) => m.device === "mobile");
  const mobileSpan = mobile.length ? (desktop.length >= 2 ? 2 : 3) : 0;
  const desktopSpan = desktop.length ? Math.min(9, Math.floor((12 - mobileSpan * mobile.length) / desktop.length)) : 0;

  return (
    <section aria-label={label} className="shell space-y-12 py-16 lg:py-24">
      <MediaFrame media={first} sizes="(min-width: 90rem) 1312px, 100vw" />
      {rest.length ? (
        <div className="grid items-start gap-10 md:grid-cols-12">
          {desktop.map((m) => (
            <MediaFrame key={m.alt} media={m} sizes="(min-width: 768px) 45vw, 100vw" className={SPAN[desktopSpan] ?? "md:col-span-6"} />
          ))}
          {mobile.map((m) => (
            <MediaFrame
              key={m.alt}
              media={m}
              sizes="(min-width: 768px) 16vw, 60vw"
              className={`mx-auto w-2/3 max-w-[16rem] md:w-full ${SPAN[mobileSpan] ?? "md:col-span-3"}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function CaseSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid-12 gap-y-6 border-t border-line py-14 lg:py-20">
      <h2 id={id} className="col-span-12 text-xl font-bold tracking-[-0.015em] lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:col-span-3 lg:self-start">
        {title}
      </h2>
      <div className="col-span-12 space-y-5 text-ink-2 lg:col-span-8 lg:col-start-5">{children}</div>
    </section>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3.5">
      {items.map((item) => (
        <li key={item} className="flex max-w-[68ch] gap-4">
          <span aria-hidden="true" className="mt-[0.8em] h-px w-4 shrink-0 bg-ink-3" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Decision({ c, L }: { c: CaseContent; L: Labels }) {
  return (
    <>
      <div className="grid gap-px border border-line bg-line md:grid-cols-2">
        <div className="bg-bg p-6">
          <p className="text-xs font-semibold text-signal-strong">{L.chosen}</p>
          <p className="mt-3 text-lg font-semibold leading-snug text-ink">{c.decision.chosen}</p>
        </div>
        <div className="bg-bg p-6">
          <p className="text-xs font-semibold text-ink-3">{L.discarded}</p>
          <p className="mt-3 text-lg leading-snug text-ink-2">{c.decision.discarded}</p>
        </div>
      </div>
      <p className="max-w-[68ch]">
        <span className="font-semibold text-ink">{L.why}.</span> {c.decision.why}
      </p>
    </>
  );
}

export function SecondaryDecisions({ items }: { items: CaseContent["secondary"] }) {
  return (
    <div className="space-y-9">
      {items.map((item) => (
        <div key={item.title}>
          <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
          <p className="mt-2 max-w-[68ch]">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

export function ValidationList({ items, note }: { items: Metric[]; note: string }) {
  return (
    <>
      <p className="text-sm">{note}</p>
      <dl className="border-t border-line">
        {items.map((m) => (
          <div key={m.value + m.label} className="grid gap-x-8 gap-y-2 border-b border-line py-6 sm:grid-cols-[minmax(9rem,13rem)_1fr]">
            <dt className="tabular font-display text-[2.5rem] font-extrabold leading-none text-ink">{m.value}</dt>
            <dd>
              <p className="text-ink">{m.label}</p>
              <p className="mt-1.5 text-sm text-ink-3">
                {m.when}
                {m.condition ? ` · ${m.condition}` : ""}
              </p>
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}

export function NextCase({ locale, next, L }: { locale: Locale; next: CaseContent; L: Labels }) {
  return (
    <nav aria-label={L.next} className="border-t border-line">
      <Link href={`/${locale}/work/${next.slug}`} className="group shell flex flex-col gap-3 py-16 lg:py-24">
        <span className="text-sm font-semibold text-ink-2">{L.next}</span>
        <span className="flex items-end justify-between gap-6">
          <span className="font-display text-[clamp(3.5rem,2rem+7vw,8rem)] font-extrabold uppercase leading-[0.86] transition-colors duration-200 group-hover:text-signal-strong">
            {next.name}
          </span>
          <ArrowRight aria-hidden="true" strokeWidth={1.5} className="mb-2 size-10 shrink-0 transition-transform duration-200 group-hover:translate-x-2" />
        </span>
        <span className="max-w-[48ch] text-ink-2">{next.hook}</span>
      </Link>
    </nav>
  );
}
