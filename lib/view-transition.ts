import type { CaseSlug } from "@/lib/site";

/** Nomes compartilhados entre a home e o case: o mesmo nome morfa entre as páginas. */
export const vtName = {
  hook: (slug: CaseSlug) => `case-hook-${slug}`,
  name: (slug: CaseSlug) => `case-name-${slug}`,
};
