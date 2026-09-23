"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { htmlLang, locales, swapLocale, type Locale } from "@/lib/i18n";

const FLAGS: Record<Locale, string> = { pt: "/flags/br.svg", en: "/flags/us.svg" };

type Props = { locale: Locale; label: string; names: Record<Locale, string> };

/**
 * Bandeira + sigla + nome por extenso para leitor de tela: a bandeira sozinha
 * não é rótulo. Links de verdade (não botões), porque cada idioma é uma URL.
 */
export function LangSwitch({ locale, label, names }: Props) {
  const pathname = usePathname() ?? `/${locale}`;

  return (
    <div role="group" aria-label={label} className="flex items-center gap-0.5 rounded-md border border-current/25 p-0.5">
      {locales.map((target) => {
        const active = target === locale;
        return (
          <Link
            key={target}
            href={swapLocale(pathname, target)}
            hrefLang={htmlLang[target]}
            lang={htmlLang[target]}
            aria-current={active ? "page" : undefined}
            scroll={false}
            className={`flex h-9 min-w-11 items-center justify-center gap-1.5 rounded-[4px] px-2 text-xs font-bold tracking-[0.04em] transition-[background-color,opacity] duration-150 ${
              active ? "bg-current" : "opacity-75 hover:opacity-100"
            }`}
          >
            <Image src={FLAGS[target]} alt="" width={18} height={13} unoptimized className="h-[13px] w-[18px] rounded-[1px] object-cover" />
            <span className={active ? "text-[var(--switch-ink,var(--color-bg))]" : undefined}>{target.toUpperCase()}</span>
            <span className="sr-only">{names[target]}</span>
          </Link>
        );
      })}
    </div>
  );
}
