import { defaultLocale, isLocale } from "@/lib/i18n";
import { getCases } from "@/lib/content";
import { OG_SIZE, renderOg } from "@/lib/og";
import { SITE, caseSlugs, isCaseSlug } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = SITE.name;

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: rawLocale, slug: rawSlug } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const slug = isCaseSlug(rawSlug) ? rawSlug : caseSlugs[0];
  const c = getCases(locale)[slug];
  return renderOg({
    kicker: `${SITE.name} — ${c.kind}`,
    lines: [{ text: c.name, accent: true }],
    size: c.name.length > 10 ? 118 : 150,
    footer: c.hook,
  });
}
