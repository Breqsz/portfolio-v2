import { ArrowUp, ArrowUpRight } from "lucide-react";
import type { Dictionary } from "@/content/dictionary";
import { SITE } from "@/lib/site";

export function SiteFooter({ t }: { t: Dictionary }) {
  return (
    <footer className="on-dark bg-ink text-on-night">
      <div className="shell flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-6 text-sm">
        <p className="text-on-night-2">{t.footer.rights}</p>
        <div className="flex flex-wrap items-center gap-x-7">
          <a href={SITE.source} target="_blank" rel="noreferrer" data-external="" className="arrow-nudge inline-flex min-h-11 items-center gap-1.5">
            <span className="link-sweep">{t.footer.source}</span>
            <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.75} />
            <span className="sr-only"> ({t.work.newTab})</span>
          </a>
          <a href="#" className="group inline-flex min-h-11 items-center gap-1.5">
            <span className="link-sweep">{t.footer.top}</span>
            <ArrowUp aria-hidden="true" size={15} strokeWidth={1.75} className="transition-transform duration-200 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
