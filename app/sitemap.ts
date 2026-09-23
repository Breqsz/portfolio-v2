import type { MetadataRoute } from "next";
import { SITE, caseSlugs } from "@/lib/site";

const LAST_REVIEW = new Date("2026-09-10");

function entry(path: string, priority: number): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE.url}/pt${path}`,
    lastModified: LAST_REVIEW,
    changeFrequency: "monthly",
    priority,
    alternates: {
      languages: { "pt-BR": `${SITE.url}/pt${path}`, en: `${SITE.url}/en${path}` },
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [entry("", 1), ...caseSlugs.map((slug) => entry(`/work/${slug}`, 0.8))];
}
