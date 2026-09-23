import { ArrowLink } from "@/components/arrow-link";
import { CargaSimulator } from "@/components/carga-simulator";
import { Ceiling } from "@/components/ceiling";
import { FlowDiagram } from "@/components/flow-diagram";
import { MediaFrame } from "@/components/media-frame";
import type { CaseContent } from "@/content/cases/types";
import type { Dictionary } from "@/content/dictionary";
import type { Locale } from "@/lib/i18n";
import { ChapterMeta, ChapterTitle, FactList } from "./chapter-parts";

type Props = { locale: Locale; t: Dictionary; c: CaseContent; index: number };

function Actions({ locale, t, c }: Omit<Props, "index">) {
  return (
    <div className="mt-8 flex flex-wrap gap-x-7 gap-y-1">
      <ArrowLink href={`/${locale}/work/${c.slug}`}>{t.work.readCase}</ArrowLink>
      {c.links.map((link) => (
        <ArrowLink key={link.href} href={link.href} external newTabLabel={t.work.newTab}>
          {link.label}
        </ArrowLink>
      ))}
    </div>
  );
}

/** Carga: o único capítulo escuro, porque é onde está o experimento. */
export function ChapterCarga({ locale, t, c, index }: Props) {
  return (
    <article id={c.slug} aria-labelledby={`${c.slug}-title`} className="on-dark mt-16 bg-night text-on-night lg:mt-24">
      <div className="shell grid-12 gap-y-14 py-24 lg:py-32">
        <div className="col-span-12 lg:sticky lg:top-[calc(var(--header-h)+2.5rem)] lg:col-span-5 lg:self-start lg:pr-4">
          <ChapterMeta index={index} c={c} tone="dark" />
          <ChapterTitle id={`${c.slug}-title`} slug={c.slug}>{c.hook}</ChapterTitle>
          <p className="mt-6 max-w-[46ch] text-lg text-on-night-2">{c.home.lead}</p>
          <FactList facts={c.home.facts} tone="dark" className="mt-10" />
          <Actions locale={locale} t={t} c={c} />
        </div>
        <div className="col-span-12 lg:col-span-7">
          <CargaSimulator locale={locale} t={t.simulator} />
        </div>
      </div>
    </article>
  );
}

/** Hold: capítulo guiado por imagem — o trabalho de cliente se mostra. */
export function ChapterHold({ locale, t, c, index }: Props) {
  const [home, saude, contato] = c.media;
  return (
    <article id={c.slug} aria-labelledby={`${c.slug}-title`} className="bg-bg">
      <div className="shell grid-12 gap-y-14 py-24 lg:py-36">
        <div className="col-span-12 lg:sticky lg:top-[calc(var(--header-h)+2.5rem)] lg:col-span-5 lg:self-start lg:pr-4">
          <ChapterMeta index={index} c={c} />
          <ChapterTitle id={`${c.slug}-title`} slug={c.slug}>{c.hook}</ChapterTitle>
          <p className="mt-6 max-w-[46ch] text-lg text-ink-2">{c.home.lead}</p>
          <FactList facts={c.home.facts} className="mt-10" />
          <Actions locale={locale} t={t} c={c} />
        </div>
        <div className="col-span-12 lg:col-span-7 lg:col-start-6">
          <MediaFrame media={home} sizes="(min-width: 1280px) 52vw, (min-width: 1024px) 62vw, 100vw" />
          <div className="mt-10 grid items-start gap-8 sm:grid-cols-[1fr_1.15fr]">
            <MediaFrame media={saude} sizes="(min-width: 640px) 28vw, 100vw" className="sm:mt-20" />
            <MediaFrame media={contato} sizes="(min-width: 640px) 32vw, 100vw" />
          </div>
        </div>
      </div>
    </article>
  );
}

/** NeuroRace: invertido — a imagem vem primeiro no desktop. */
export function ChapterNeurorace({ locale, t, c, index }: Props) {
  const [home, sobre, mobile] = c.media;
  return (
    <article id={c.slug} aria-labelledby={`${c.slug}-title`} className="bg-surface">
      <div className="shell grid-12 gap-y-14 py-24 lg:py-36">
        <div className="order-2 col-span-12 lg:order-1 lg:col-span-7">
          <div className="relative">
            <MediaFrame media={home} sizes="(min-width: 1024px) 55vw, 100vw" className="sm:pr-[18%]" />
            <div className="absolute -bottom-12 right-0 hidden w-[24%] sm:block">
              <div className="ring-8 ring-surface">
                <MediaFrame media={mobile} sizes="16vw" caption={false} />
              </div>
            </div>
          </div>
          <MediaFrame media={sobre} sizes="(min-width: 1024px) 40vw, 100vw" className="mt-20 sm:w-[76%]" />
        </div>
        <div className="order-1 col-span-12 lg:sticky lg:top-[calc(var(--header-h)+2.5rem)] lg:order-2 lg:col-span-4 lg:col-start-9 lg:self-start">
          <ChapterMeta index={index} c={c} />
          <ChapterTitle id={`${c.slug}-title`} slug={c.slug}>{c.hook}</ChapterTitle>
          <p className="mt-6 max-w-[46ch] text-lg text-ink-2">{c.home.lead}</p>
          <FactList facts={c.home.facts} className="mt-10" />
          <Actions locale={locale} t={t} c={c} />
        </div>
      </div>
    </article>
  );
}

/** AutoFix: sem tela pública — o limite do sistema é a imagem. */
export function ChapterAutofix({ locale, t, c, index }: Props) {
  return (
    <article id={c.slug} aria-labelledby={`${c.slug}-title`} className="bg-bg">
      <div className="shell grid-12 gap-y-14 py-24 lg:py-36">
        <div className="col-span-12 lg:col-span-5">
          <ChapterMeta index={index} c={c} />
          <ChapterTitle id={`${c.slug}-title`} slug={c.slug}>{c.hook}</ChapterTitle>
          <p className="mt-6 max-w-[46ch] text-lg text-ink-2">{c.home.lead}</p>
          <FactList facts={c.home.facts} className="mt-10" />
          <Actions locale={locale} t={t} c={c} />
        </div>
        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          {c.ceiling ? <Ceiling items={c.ceiling} label={t.work.ceilingLabel} /> : null}
          <div className="mt-14">
            <FlowDiagram nodes={c.architecture.nodes} loop={c.architecture.loop} plannedLabel={t.caseLabels.planned} compact />
          </div>
        </div>
      </div>
    </article>
  );
}
