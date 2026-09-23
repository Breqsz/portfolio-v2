import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CargaSimulator } from "@/components/carga-simulator";
import {
  Bullets,
  CaseGallery,
  CaseHero,
  CaseSection,
  CaseSummary,
  Decision,
  NextCase,
  SecondaryDecisions,
  ValidationList,
} from "@/components/case/case-parts";
import { Ceiling } from "@/components/ceiling";
import { Contact } from "@/components/contact";
import { FlowDiagram } from "@/components/flow-diagram";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCases, getDictionary } from "@/lib/content";
import { isLocale, ogLocale } from "@/lib/i18n";
import { SITE, caseSlugs, isCaseSlug } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return caseSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/work/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isCaseSlug(slug)) return {};
  const c = getCases(locale)[slug];
  return {
    title: c.seo.title,
    description: c.seo.description,
    alternates: {
      canonical: `/${locale}/work/${slug}`,
      languages: { "pt-BR": `/pt/work/${slug}`, en: `/en/work/${slug}`, "x-default": `/pt/work/${slug}` },
    },
    openGraph: {
      type: "article",
      title: c.seo.title,
      description: c.seo.description,
      url: `/${locale}/work/${slug}`,
      siteName: SITE.name,
      locale: ogLocale[locale],
    },
    twitter: { card: "summary_large_image", title: c.seo.title, description: c.seo.description },
  };
}

export default async function CasePage({ params }: PageProps<"/[locale]/work/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isCaseSlug(slug)) notFound();
  const t = getDictionary(locale);
  const cases = getCases(locale);
  const c = cases[slug];
  const next = cases[caseSlugs[(caseSlugs.indexOf(slug) + 1) % caseSlugs.length]];
  const L = t.caseLabels;

  return (
    <>
      <SiteHeader locale={locale} t={t} cases={cases} />
      <main id="conteudo">
        <CaseHero c={c} t={t} locale={locale} />
        <CaseSummary c={c} L={L} />
        <CaseGallery media={c.media} label={L.media} />

        {slug === "carga" ? (
          <section aria-labelledby="simulador-title" className="on-dark bg-night text-on-night">
            <div className="shell grid-12 gap-y-8 py-20 lg:py-28">
              <h2 id="simulador-title" className="col-span-12 text-xl font-bold tracking-[-0.015em] lg:col-span-3">
                {L.simulator}
              </h2>
              <div className="col-span-12 lg:col-span-8 lg:col-start-5">
                <CargaSimulator locale={locale} t={t.simulator} headingLevel={3} />
              </div>
            </div>
          </section>
        ) : null}

        {c.ceiling ? (
          <div className="shell py-16 lg:py-24">
            <div className="lg:w-2/3">
              <Ceiling items={c.ceiling} label={t.work.ceilingLabel} />
            </div>
          </div>
        ) : null}

        <div className="shell">
          <CaseSection id="contexto" title={L.context}>
            {c.context.map((p) => (
              <p key={p} className="max-w-[68ch]">
                {p}
              </p>
            ))}
          </CaseSection>
          <CaseSection id="restricoes" title={L.constraints}>
            <Bullets items={c.constraints} />
          </CaseSection>
          <CaseSection id="decisao" title={L.decision}>
            <Decision c={c} L={L} />
          </CaseSection>
          <CaseSection id="outras-decisoes" title={L.secondary}>
            <SecondaryDecisions items={c.secondary} />
          </CaseSection>
          <CaseSection id="arquitetura" title={L.architecture}>
            <p className="max-w-[68ch]">{c.architecture.caption}</p>
            <div className="pt-4 text-ink">
              <FlowDiagram
                nodes={c.architecture.nodes}
                frame={c.architecture.frame}
                loop={c.architecture.loop}
                plannedLabel={L.planned}
              />
            </div>
          </CaseSection>
          <CaseSection id="validacao" title={L.validation}>
            <ValidationList items={c.validation} note={L.validationNote} />
          </CaseSection>
          <CaseSection id="limites" title={L.limits}>
            <Bullets items={c.limits} />
          </CaseSection>
          <CaseSection id="aprendizado" title={L.learning}>
            <p className="max-w-[60ch] text-xl leading-snug text-ink">{c.learning}</p>
          </CaseSection>
        </div>

        <NextCase locale={locale} next={next} L={L} />
        <Contact t={t} />
      </main>
      <SiteFooter t={t} />
    </>
  );
}
