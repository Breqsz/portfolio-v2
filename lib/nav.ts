import type { CaseBook } from "@/content/cases/types";
import type { Dictionary } from "@/content/dictionary";
import type { Locale } from "@/lib/i18n";
import { caseSlugs } from "@/lib/site";

export type NavItem = { href: string; label: string; index?: string };

/** O índice do site no celular: os cases na ordem da home, depois trajetória e contato. */
export function menuItems(locale: Locale, t: Dictionary, cases: CaseBook): NavItem[] {
  return [
    ...caseSlugs.map((slug, i) => ({
      href: `/${locale}#${slug}`,
      label: cases[slug].name,
      index: String(i + 1).padStart(2, "0"),
    })),
    { href: `/${locale}#trajetoria`, label: t.nav.path },
    { href: `/${locale}#contato`, label: t.nav.contact },
  ];
}
