import { dictionary } from "@/content/dictionary";
import { defaultLocale, isLocale } from "@/lib/i18n";
import { OG_SIZE, renderOg } from "@/lib/og";
import { SITE } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = SITE.name;

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const t = dictionary[locale];
  return renderOg({
    kicker: SITE.name,
    lines: [{ text: t.hero.line1 }, { text: t.hero.line2, accent: true }],
    footer: t.hero.role,
  });
}
