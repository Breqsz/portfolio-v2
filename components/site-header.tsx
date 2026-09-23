import Link from "next/link";
import { HeaderIndex } from "@/components/header-index";
import { LangSwitch } from "@/components/lang-switch";
import { MobileMenu } from "@/components/mobile-menu";
import type { CaseBook } from "@/content/cases/types";
import type { Dictionary } from "@/content/dictionary";
import type { Locale } from "@/lib/i18n";
import { menuItems } from "@/lib/nav";
import { caseSlugs } from "@/lib/site";

type Props = { locale: Locale; t: Dictionary; cases: CaseBook };

export function SiteHeader({ locale, t, cases }: Props) {
  const home = `/${locale}`;
  const links = [
    { href: `${home}#trabalho`, label: t.nav.work },
    { href: `${home}#trajetoria`, label: t.nav.path },
    { href: `${home}#contato`, label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-[var(--z-header)] border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="shell flex h-[var(--header-h)] items-center gap-6">
        <Link href={home} aria-label={t.nav.home} className="mr-auto flex items-baseline gap-1.5 whitespace-nowrap py-2 text-[0.9375rem] font-semibold leading-tight tracking-[-0.01em]">
          <span className="sm:hidden">Guilherme Bianchini</span>
          <span className="hidden sm:inline">Guilherme Rocha Bianchini</span>
          <span aria-hidden="true" className="inline-block size-1.5 bg-signal" />
        </Link>
        <HeaderIndex
          locale={locale}
          label={t.hero.indexLabel}
          items={caseSlugs.map((slug) => ({ slug, name: cases[slug].name }))}
        />
        <div className="flex items-center gap-5 md:gap-8">
          <nav aria-label={t.nav.label}>
            <ul className="flex items-center gap-5 text-sm font-semibold md:gap-7">
              {links.map((link) => (
                <li key={link.href} className="hidden md:block">
                  <a href={link.href} className="link-sweep inline-flex min-h-11 items-center">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <MobileMenu items={menuItems(locale, t, cases)} t={t.nav} />
          <LangSwitch locale={locale} label={t.lang.label} names={t.lang.names} />
        </div>
      </div>
      <span aria-hidden="true" className="header-progress" />
    </header>
  );
}
