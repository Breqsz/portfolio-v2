"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CaseSlug } from "@/lib/site";

type Item = { slug: CaseSlug; name: string };
type Props = { locale: string; items: Item[]; label: string };

/**
 * Índice 01–04 no header largo. Na home, marca o capítulo em leitura; nos
 * cases, os capítulos não existem na página e nada fica marcado.
 */
export function HeaderIndex({ locale, items, label }: Props) {
  const [active, setActive] = useState<CaseSlug | null>(null);

  useEffect(() => {
    const targets = items.map((i) => document.getElementById(i.slug)).filter((el): el is HTMLElement => el !== null);
    if (!targets.length) return;
    // Guarda os capítulos na faixa de leitura: fora deles (Hero, Trajetória, Contato), nada fica ativo.
    const inView = new Set<CaseSlug>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const slug = e.target.id as CaseSlug;
          if (e.isIntersecting) inView.add(slug);
          else inView.delete(slug);
        }
        setActive(items.find((i) => inView.has(i.slug))?.slug ?? null);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label={label} className="hidden xl:block">
      <ol className="flex items-center gap-6 text-sm font-semibold">
        {items.map((item, i) => {
          const on = item.slug === active;
          return (
            <li key={item.slug}>
              <Link
                href={`/${locale}#${item.slug}`}
                aria-current={on ? "location" : undefined}
                className={`group inline-flex min-h-11 items-center transition-colors duration-150 ${on ? "text-ink" : "text-ink-2 hover:text-ink"}`}
              >
                <span className="flex items-baseline gap-1.5">
                  <span className={`tabular text-xs ${on ? "text-signal-strong" : "text-ink-3"}`}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={`link-sweep ${on ? "[background-size:100%_1px]" : ""}`}>{item.name}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
