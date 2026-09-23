import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Contact } from "@/components/contact";
import { Capabilities } from "@/components/home/capabilities";
import { ChapterAutofix, ChapterCarga, ChapterHold, ChapterNeurorace } from "@/components/home/chapters";
import { Hero } from "@/components/home/hero";
import { Trajectory } from "@/components/home/trajectory";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCases, getDictionary } from "@/lib/content";
import { isLocale, ogLocale } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: { absolute: t.meta.title },
    description: t.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { "pt-BR": "/pt", en: "/en", "x-default": "/pt" },
    },
    openGraph: {
      type: "profile",
      title: t.meta.title,
      description: t.meta.description,
      url: `/${locale}`,
      siteName: SITE.name,
      locale: ogLocale[locale],
    },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description },
  };
}

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const cases = getCases(locale);

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    jobTitle: "Software Engineer",
    url: `${SITE.url}/${locale}`,
    email: `mailto:${SITE.email}`,
    sameAs: [SITE.linkedin],
    address: { "@type": "PostalAddress", addressLocality: "São Paulo", addressCountry: "BR" },
    knowsAbout: ["TypeScript", "React", "Next.js", "PostgreSQL", "Product engineering", "Automation"],
  };

  return (
    <>
      <SiteHeader locale={locale} t={t} cases={cases} />
      <main id="conteudo">
        <Hero t={t} cases={cases} />

        <section id="trabalho" aria-labelledby="trabalho-title">
          <h2 id="trabalho-title" className="sr-only">
            {t.work.title}
          </h2>
          <ChapterCarga locale={locale} t={t} c={cases.carga} index={1} />
          <ChapterHold locale={locale} t={t} c={cases.hold} index={2} />
          <ChapterNeurorace locale={locale} t={t} c={cases.neurorace} index={3} />
          <ChapterAutofix locale={locale} t={t} c={cases.autofix} index={4} />
        </section>

        <Trajectory t={t} />
        <Capabilities locale={locale} t={t} cases={cases} />
        <Contact t={t} locale={locale} />
      </main>
      <SiteFooter t={t} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
