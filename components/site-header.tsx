import Link from "next/link";
import { LangSwitch } from "@/components/lang-switch";
import type { Dictionary } from "@/content/dictionary";
import type { Locale } from "@/lib/i18n";

type Props = { locale: Locale; t: Dictionary };

export function SiteHeader({ locale, t }: Props) {
  const home = `/${locale}`;
  const links = [
    { href: `${home}#trabalho`, label: t.nav.work, mobile: false },
    { href: `${home}#trajetoria`, label: t.nav.path, mobile: false },
    { href: `${home}#contato`, label: t.nav.contact, mobile: true },
  ];

  return (
    <header className="relative z-[var(--z-header)] border-b border-line bg-bg">
      <div className="shell flex h-18 items-center gap-6">
        <Link href={home} aria-label={t.nav.home} className="mr-auto flex items-baseline gap-1.5 whitespace-nowrap py-2 text-[0.9375rem] font-semibold leading-tight tracking-[-0.01em]">
          <span className="sm:hidden">Guilherme Bianchini</span>
          <span className="hidden sm:inline">Guilherme Rocha Bianchini</span>
          <span aria-hidden="true" className="inline-block size-1.5 bg-signal" />
        </Link>
        <div className="flex items-center gap-5 md:gap-8">
          <nav aria-label={t.nav.label}>
            <ul className="flex items-center gap-5 text-sm font-semibold md:gap-7">
              {links.map((link) => (
                <li key={link.href} className={link.mobile ? "hidden sm:block" : "hidden md:block"}>
                  <a href={link.href} className="link-sweep inline-flex min-h-11 items-center">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <LangSwitch locale={locale} label={t.lang.label} names={t.lang.names} />
        </div>
      </div>
    </header>
  );
}
