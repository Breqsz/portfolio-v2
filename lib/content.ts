import { casesEn } from "@/content/cases/en";
import { casesPt } from "@/content/cases/pt";
import type { CaseBook } from "@/content/cases/types";
import { dictionary, type Dictionary } from "@/content/dictionary";
import type { Locale } from "@/lib/i18n";

export function getCases(locale: Locale): CaseBook {
  return locale === "pt" ? casesPt : casesEn;
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionary[locale];
}
