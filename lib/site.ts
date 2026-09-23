export const SITE = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://breq.com.br",
  name: "Guilherme Rocha Bianchini",
  shortName: "Guilherme Bianchini",
  /** Como o nome quebra no crachá, e as iniciais que o código de barras dele codifica. */
  nameLines: ["Guilherme", "Rocha Bianchini"],
  initials: "GRB",
  email: "guirochabianchini@gmail.com",
  linkedin: "https://www.linkedin.com/in/guilhermebreq",
  source: "https://github.com/Breqsz/portfolio-v2",
} as const;

export const caseSlugs = ["carga", "hold", "neurorace", "autofix"] as const;
export type CaseSlug = (typeof caseSlugs)[number];

export function isCaseSlug(value: string): value is CaseSlug {
  return (caseSlugs as readonly string[]).includes(value);
}
