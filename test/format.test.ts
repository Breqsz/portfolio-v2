import { describe, expect, it } from "vitest";
import { fill, formatNumber, saoPauloTime } from "@/lib/format";

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

describe("saoPauloTime", () => {
  it("mostra a hora de São Paulo em 24 h, qualquer que seja o fuso da máquina", () => {
    const d = new Date("2026-09-23T17:32:00Z"); // 14:32 em São Paulo (UTC−3)
    expect(saoPauloTime(d, "pt")).toBe("14:32");
    expect(saoPauloTime(d, "en")).toBe("14:32");
  });
  it("não mostra 24:xx à meia-noite", () => {
    expect(saoPauloTime(new Date("2026-09-24T03:05:00Z"), "en")).toBe("00:05");
  });
});
