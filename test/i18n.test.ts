import { describe, expect, it } from "vitest";
import { pickLocale, swapLocale } from "@/lib/i18n";

describe("swapLocale", () => {
  it("troca o idioma preservando o resto do caminho", () => {
    expect(swapLocale("/pt/work/carga", "en")).toBe("/en/work/carga");
    expect(swapLocale("/en", "pt")).toBe("/pt");
  });

  it("insere o idioma quando o caminho não tem um", () => {
    expect(swapLocale("/", "en")).toBe("/en");
    expect(swapLocale("/work/hold", "pt")).toBe("/pt/work/hold");
  });
});

describe("pickLocale", () => {
  it("respeita a preferência do navegador", () => {
    expect(pickLocale("en-US,en;q=0.9,pt;q=0.8")).toBe("en");
    expect(pickLocale("pt-BR,pt;q=0.9")).toBe("pt");
    expect(pickLocale("fr-FR,en;q=0.5")).toBe("en");
  });

  it("cai no português sem preferência reconhecível", () => {
    expect(pickLocale(null)).toBe("pt");
    expect(pickLocale("fr-FR,de;q=0.7")).toBe("pt");
  });
});

describe("identidade do site", () => {
  it("as iniciais e as linhas do nome batem com o nome completo", async () => {
    const { SITE } = await import("@/lib/site");
    expect(SITE.nameLines.join(" ")).toBe(SITE.name);
    expect(SITE.initials).toBe(
      SITE.name
        .split(" ")
        .map((w) => w[0])
        .join(""),
    );
  });
});
