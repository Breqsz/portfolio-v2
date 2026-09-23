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
