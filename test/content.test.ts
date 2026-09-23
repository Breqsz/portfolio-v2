import { describe, expect, it } from "vitest";
import { casesEn } from "@/content/cases/en";
import { casesPt } from "@/content/cases/pt";
import type { CaseContent } from "@/content/cases/types";
import { dictionary } from "@/content/dictionary";
import { caseSlugs } from "@/lib/site";

const digits = (s: string) => s.replace(/\D/g, "");

/** Chaves de um objeto, recursivamente, com o tamanho dos arrays — a "forma" do conteúdo. */
function shape(value: unknown, path = ""): string[] {
  if (Array.isArray(value)) return [`${path}[${value.length}]`, ...value.flatMap((v, i) => shape(v, `${path}[${i}]`))];
  if (value && typeof value === "object" && !("src" in (value as object) && "height" in (value as object))) {
    return Object.keys(value as object)
      .sort()
      .flatMap((k) => [`${path}.${k}`, ...shape((value as Record<string, unknown>)[k], `${path}.${k}`)]);
  }
  return [];
}

describe("paridade entre idiomas", () => {
  it.each(caseSlugs)("o case %s tem a mesma estrutura em português e inglês", (slug) => {
    expect(shape(casesEn[slug])).toEqual(shape(casesPt[slug]));
  });

  it.each(caseSlugs)("o case %s tem os mesmos números, links, mídia e nós planejados", (slug) => {
    const pt: CaseContent = casesPt[slug];
    const en: CaseContent = casesEn[slug];
    expect(en.validation.map((m) => digits(m.value))).toEqual(pt.validation.map((m) => digits(m.value)));
    expect(en.validation.map((m) => m.when)).toEqual(pt.validation.map((m) => m.when));
    expect(en.links.map((l) => l.href)).toEqual(pt.links.map((l) => l.href));
    expect(en.media.map((m) => m.src)).toEqual(pt.media.map((m) => m.src));
    expect(en.architecture.nodes.map((n) => Boolean(n.planned))).toEqual(pt.architecture.nodes.map((n) => Boolean(n.planned)));
    expect(en.slug).toBe(slug);
  });

  it("o dicionário tem as mesmas chaves nos dois idiomas", () => {
    expect(shape(dictionary.en)).toEqual(shape(dictionary.pt));
  });

  it("cada case tem o mesmo status nos dois idiomas, e o status bate com a natureza do trabalho", () => {
    const expected = { carga: "study", hold: "live", neurorace: "live", autofix: "demo" } as const;
    for (const slug of caseSlugs) {
      expect(casesPt[slug].status).toBe(expected[slug]);
      expect(casesEn[slug].status).toBe(expected[slug]);
    }
  });
});

describe("higiene do conteúdo público", () => {
  const all = JSON.stringify({ casesPt, casesEn, dictionary });

  it("não tem marca de rascunho", () => {
    // Sensível a caixa: "todo" é palavra do português; "TODO" é marca de rascunho.
    expect(all).not.toMatch(/\bTODO\b|\bFIXME\b|\bXXX\b/);
    expect(all).not.toMatch(/lorem ipsum/i);
  });

  it("não vaza telefone, infraestrutura ou caminho de demo", () => {
    expect(all).not.toMatch(/\+?55[\s-]?\(?\d{2}\)?[\s-]?9?\d{4}[\s-]?\d{4}/);
    expect(all).not.toMatch(/supabase\.co|vercel\.app\/demo|waba|phone_number_id/i);
  });

  it("toda mídia tem texto alternativo de verdade", () => {
    for (const book of [casesPt, casesEn]) {
      for (const slug of caseSlugs) {
        for (const media of book[slug].media) expect(media.alt.length).toBeGreaterThan(30);
      }
    }
  });

  it("todo link externo é https", () => {
    for (const book of [casesPt, casesEn]) {
      for (const slug of caseSlugs) {
        for (const link of book[slug].links) expect(link.href).toMatch(/^https:\/\//);
      }
    }
  });
});
