import { ArrowUpRight } from "lucide-react";
import { CopyEmail } from "@/components/copy-email";
import { LocalTime } from "@/components/local-time";
import type { Dictionary } from "@/content/dictionary";
import type { Locale } from "@/lib/i18n";
import { SITE } from "@/lib/site";

/** O único bloco em cor cheia: a pergunta que encerra toda página. */
export function Contact({ t, locale }: { t: Dictionary; locale: Locale }) {
  const { contact } = t;
  return (
    <section id="contato" aria-labelledby="contato-title" className="on-signal bg-signal text-ink">
      <div className="shell py-24 lg:py-36">
        <p className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold lg:mb-12">
          <span aria-hidden="true" className="inline-block size-2 rounded-full bg-ink" />
          <span>{contact.status}</span>
          <span aria-hidden="true">·</span>
          <span>
            {contact.city} <LocalTime locale={locale} label={contact.timeLabel} />
          </span>
        </p>
        <h2 id="contato-title" className="max-w-[15ch] font-display text-[clamp(3.25rem,1.6rem+6.6vw,9rem)] font-extrabold leading-[0.9]">
          {contact.title}
        </h2>
        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12">
          <p className="max-w-[44ch] text-lg lg:col-span-5">{contact.body}</p>
          <div className="flex flex-col gap-3 lg:col-span-6 lg:col-start-7">
            <a
              href={`mailto:${SITE.email}`}
              className="link-underline w-fit break-all text-[clamp(1.25rem,0.9rem+1.4vw,2rem)] font-semibold leading-tight"
            >
              {SITE.email}
            </a>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-1">
              <CopyEmail email={SITE.email} label={contact.copy} done={contact.copied} />
              <a
                href={SITE.linkedin}
                target="_blank"
                rel="noreferrer"
                data-external=""
                className="arrow-nudge inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] font-semibold"
              >
                <span className="link-sweep">{contact.linkedin}</span>
                <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} />
                <span className="sr-only"> ({t.work.newTab})</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
