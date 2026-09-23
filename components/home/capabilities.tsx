import Link from "next/link";
import type { CaseBook } from "@/content/cases/types";
import type { Dictionary } from "@/content/dictionary";
import type { Locale } from "@/lib/i18n";

/** Nenhuma capacidade sem prova: cada uma aponta para o case onde aparece. */
export function Capabilities({ locale, t, cases }: { locale: Locale; t: Dictionary; cases: CaseBook }) {
  const { capabilities } = t;
  return (
    <section aria-labelledby="capacidades-title">
      <div className="shell grid-12 gap-y-10 pb-24 lg:pb-32">
        <h2 id="capacidades-title" className="col-span-12 text-2xl font-bold tracking-[-0.02em] lg:col-span-4">
          {capabilities.title}
        </h2>
        <dl className="col-span-12 border-t border-line lg:col-span-8">
          {capabilities.items.map((item) => (
            <div key={item.name} className="grid gap-x-10 gap-y-3 border-b border-line py-8 md:grid-cols-[13rem_1fr]">
              <dt className="font-display text-[2.25rem] font-extrabold leading-none">{item.name}</dt>
              <dd>
                <p className="max-w-[56ch] text-ink-2">{item.body}</p>
                <p className="mt-3 text-xs text-ink-3">{item.tech}</p>
                <p className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-1 text-sm">
                  <span className="text-ink-3">{capabilities.evidence}:</span>
                  {item.evidence.map((slug) => (
                    <Link key={slug} href={`/${locale}/work/${slug}`} className="link-underline inline-flex min-h-11 items-center font-semibold">
                      {cases[slug].name}
                    </Link>
                  ))}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
