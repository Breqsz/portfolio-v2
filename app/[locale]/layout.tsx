import type { Metadata, Viewport } from "next";
import { Sofia_Sans, Sofia_Sans_Extra_Condensed } from "next/font/google";
import { notFound } from "next/navigation";
import { dictionary } from "@/content/dictionary";
import { htmlLang, isLocale, locales } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { template: `%s · ${SITE.shortName}`, default: SITE.name },
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  formatDetection: { telephone: false, email: false, address: false },
};

const sofia = Sofia_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sofia",
  display: "swap",
});

const sofiaExtraCondensed = Sofia_Sans_Extra_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["700", "800"],
  variable: "--font-sofia-xc",
  display: "swap",
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#f9f6f5",
  colorScheme: "light",
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={htmlLang[locale]} className={`${sofia.variable} ${sofiaExtraCondensed.variable}`}>
      <body>
        <a href="#conteudo" className="skip-link">
          {dictionary[locale].skip}
        </a>
        {children}
      </body>
    </html>
  );
}
