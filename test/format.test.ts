import { describe, expect, it } from "vitest";
import { fill, formatNumber } from "@/lib/format";

describe("fill", () => {
  it("substitui as chaves conhecidas e preserva as desconhecidas", () => {
    expect(fill("Volta com {n}% — {x}", { n: 17 })).toBe("Volta com 17% — {x}");
  });
});

describe("formatNumber", () => {
  it("usa a vírgula decimal em português e o ponto em inglês", () => {
    expect(formatNumber("pt", 17.34, 1)).toBe("17,3");
    expect(formatNumber("en", 17.34, 1)).toBe("17.3");
  });
});
