import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

export const css = () => readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

describe("header fixo", () => {
  it("âncoras param abaixo do header", () => {
    expect(css()).toMatch(/scroll-margin-top:\s*calc\(var\(--header-h\)/);
  });
  it("a barra de progresso só anima com scroll-timeline e sem reduced-motion", () => {
    const block = css().split("@supports (animation-timeline: scroll())")[1] ?? "";
    expect(block).toMatch(/prefers-reduced-motion:\s*no-preference/);
    expect(block).toMatch(/\.header-progress/);
  });
});

describe("mídia monocromática", () => {
  it("todo grayscale está atrás de scroll-timeline ou de hover fino, nunca solto", () => {
    const text = css();
    const tint = text.slice(text.indexOf("/* Mídia monocromática"));
    expect(tint.length).toBeGreaterThan(40);
    const top = tint.split(/@supports|@media/)[0];
    expect(top).not.toMatch(/grayscale/);
  });
  it("sem suporte a scroll-timeline, o cinza só aparece com hover fino", () => {
    const block = css().split("@supports not (animation-timeline: view())")[1] ?? "";
    expect(block).toMatch(/@media \(hover: hover\) and \(pointer: fine\)/);
  });
});

describe("view transitions", () => {
  it("reduced-motion desliga as transições de página", () => {
    expect(css()).toMatch(/prefers-reduced-motion: reduce\)\s*\{[^}]*::view-transition-group\(\*\)/);
  });
});
