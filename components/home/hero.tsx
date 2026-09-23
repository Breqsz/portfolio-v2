import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/home/badge";
import type { CaseBook } from "@/content/cases/types";
import type { Dictionary } from "@/content/dictionary";
import { SITE, caseSlugs } from "@/lib/site";

type Props = { t: Dictionary; cases: CaseBook };

const delay = (i: number) => ({ "--i": i }) as React.CSSProperties;

/**
 * Papel com a declaração à esquerda e, à direita, o crachá de acesso pendurado
 * no cordão — o objeto diz o que o site quer antes de qualquer frase. No
 * celular, o texto vem primeiro e o crachá desce depois, com cordão curto.
 */
export function Hero({ t, cases }: Props) {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-x-clip">
      <div className="shell">
        <div className="grid-12 items-start gap-y-14 lg:min-h-[max(36rem,calc(100svh-12rem))]">
          <div className="col-span-12 pt-20 lg:col-span-8 lg:self-center lg:pb-10 lg:pt-16">
            <p className="fade-up text-sm font-semibold text-ink-2" style={delay(0)}>
              {t.hero.role}
            </p>
            <h1 id="hero-title" className="mt-5 font-display text-hero font-extrabold uppercase">
              <span className="mask-line w-max" style={delay(0)}>
                <span>{t.hero.line1}</span>
              </span>
              <span className="mask-line w-max text-signal" style={delay(1)}>
                <span>{t.hero.line2}</span>
              </span>
            </h1>
            <p className="fade-up mt-8 max-w-[36ch] text-lg text-ink-2" style={delay(2)}>
              {t.hero.lead}
            </p>

            <dl className="mt-7 flex max-w-[44rem] flex-wrap gap-x-8 gap-y-2 border-y border-line py-3 text-sm">
              {t.hero.spec.map((row, i) => (
                <div key={row.label} className="fade-up flex items-baseline gap-2" style={delay(i + 3)}>
                  <dt className="text-ink-3">{row.label}</dt>
                  <dd className="font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className="fade-up mt-7 flex flex-wrap items-center gap-x-7 gap-y-3" style={delay(6)}>
              <a
                href="#trabalho"
                className="arrow-nudge-down inline-flex min-h-12 items-center gap-3 bg-ink px-6 text-[0.9375rem] font-semibold text-bg transition-[background-color,transform] duration-150 hover:bg-[color-mix(in_oklch,var(--color-ink)_82%,var(--color-signal))] active:scale-[0.98]"
              >
                {t.hero.cta}
                <ArrowDown aria-hidden="true" size={18} strokeWidth={1.75} />
              </a>
              <a href={`mailto:${SITE.email}`} className="link-sweep inline-flex min-h-11 items-center text-[0.9375rem] font-semibold">
                {t.hero.email}
              </a>
              <a
                href={SITE.linkedin}
                target="_blank"
                rel="noreferrer"
                data-external=""
                className="arrow-nudge inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] font-semibold"
              >
                <span className="link-sweep">LinkedIn</span>
                <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} />
                <span className="sr-only"> ({t.work.newTab})</span>
              </a>
            </div>
          </div>

          <div className="col-span-12 pb-4 lg:col-span-4 lg:col-start-9 lg:self-start lg:pb-0">
            <Badge t={t.hero} />
          </div>
        </div>
      </div>

      <nav aria-label={t.hero.indexLabel} className="shell relative z-[var(--z-raised)] mt-10 bg-bg lg:mt-4">
        <ol className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {caseSlugs.map((slug, i) => {
            const c = cases[slug];
            return (
              <li
                key={slug}
                className="fade-up border-b border-line sm:odd:border-r sm:odd:pr-6 sm:even:pl-6 lg:border-b-0 lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0 lg:odd:pr-6 lg:even:pl-6"
                style={delay(i + 7)}
              >
                <a href={`#${slug}`} className="group flex h-full flex-col gap-1.5 py-5">
                  <span className="flex items-baseline gap-3">
                    <span className="tabular text-xs font-semibold text-signal-strong">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-[1.75rem] font-extrabold leading-none transition-colors duration-200 group-hover:text-signal-strong">
                      {c.name}
                    </span>
                  </span>
                  <span className="text-sm text-ink-2">{c.hook}</span>
                  <span className="mt-auto pt-1 text-xs text-ink-3">{c.kind}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </section>
  );
}
