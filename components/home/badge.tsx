import Image from "next/image";
import { images } from "@/content/cases/media";
import type { Dictionary } from "@/content/dictionary";
import { code39 } from "@/lib/code39";
import { SITE } from "@/lib/site";

type Props = { t: Dictionary["hero"] };

/** Zona de silêncio do Code 39, em unidades estreitas, de cada lado. */
const QUIET = 10;

/**
 * Crachá de acesso pendurado no cordão. O topo é a placa (#030302), o mesmo
 * preto dos cantos do retrato, então a foto sai do escuro sem borda. A queda
 * e o balanço são CSS; com `prefers-reduced-motion`, o crachá fica parado.
 */
export function Badge({ t }: Props) {
  const barcode = code39(SITE.initials);

  return (
    <div className="badge-hang flex flex-col items-center">
      <div className="badge-sway flex flex-col items-center">
        <span aria-hidden="true" className="block h-16 w-7 bg-ink lg:h-24" />
        <span
          aria-hidden="true"
          className="relative block h-7 w-11 rounded-[4px] bg-linear-to-b from-[oklch(0.86_0.004_45)] via-[oklch(0.58_0.006_45)] to-[oklch(0.76_0.004_45)] shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
        >
          <span className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-night" />
        </span>

        <div className="badge-card relative -mt-1 w-[min(100%,17.5rem)] overflow-hidden rounded-2xl bg-badge text-ink lg:w-[18.5rem]">
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-3 z-[var(--z-raised)] h-1.5 w-9 -translate-x-1/2 rounded-full bg-night-line shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]"
          />
          <div className="bg-plate text-on-night">
            <div className="flex items-baseline justify-between px-6 pb-3 pt-7 text-[0.8125rem] font-semibold tracking-[0.18em]">
              <span>{SITE.initials}</span>
              <span className="font-medium tracking-[0.1em] text-on-night-2">{t.badge.access}</span>
            </div>
            <Image
              src={images.portrait}
              alt={t.portraitAlt}
              width={296}
              height={237}
              loading="eager"
              fetchPriority="high"
              placeholder="blur"
              className="aspect-[5/4] w-full object-cover object-[50%_24%]"
            />
          </div>

          <div className="px-6 pb-6 pt-5">
            <p className="text-[1.375rem] font-bold leading-[1.1] tracking-[-0.01em]">
              {SITE.nameLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <p className="mt-1.5 text-sm text-ink-2">{t.badge.role}</p>

            <div className="mt-5 flex items-end justify-between gap-4 border-t border-line pt-4">
              <div>
                <p className="text-xs text-ink-3">{t.badge.levelLabel}</p>
                <p className="mt-0.5 text-sm font-semibold text-signal-strong">{t.badge.level}</p>
              </div>
              <svg
                aria-hidden="true"
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                className="shrink-0 text-ink-2"
              >
                <path d="M9.5 10.5a5 5 0 0 1 0 7" />
                <path d="M13 7.5a9 9 0 0 1 0 13" />
                <path d="M16.5 4.5a13 13 0 0 1 0 19" />
              </svg>
            </div>

            <svg
              aria-hidden="true"
              viewBox={`${-QUIET} 0 ${barcode.width + QUIET * 2} 12`}
              preserveAspectRatio="none"
              className="mt-5 h-8 w-full fill-ink"
            >
              {barcode.bars.map((bar) => (
                <rect key={bar.x} x={bar.x} y="0" width={bar.w} height="12" />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
