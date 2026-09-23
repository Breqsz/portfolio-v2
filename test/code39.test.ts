import { describe, expect, it } from "vitest";
import { code39, CODE39_ALPHABET, CODE39_PATTERNS } from "@/lib/code39";

/** Larguras de cada símbolo em unidades estreitas: 6 estreitos + 3 largos (×3) = 15. */
const SYMBOL = 6 + 3 * 3;

describe("code39", () => {
  it("emoldura o texto com o asterisco de início e fim e separa os símbolos por um espaço estreito", () => {
    const { bars, width } = code39("GRB");
    // 5 símbolos (* G R B *) de 15 unidades + 4 espaços entre símbolos.
    expect(width).toBe(5 * SYMBOL + 4);
    // Cada símbolo tem 5 barras.
    expect(bars).toHaveLength(5 * 5);
  });

  it("codifica o asterisco como n w n n w n w n n", () => {
    const { bars } = code39("");
    // Só * e *: barras nas posições acumuladas do padrão 010010100 (b s b s b s b s b).
    expect(bars.slice(0, 5)).toEqual([
      { x: 0, w: 1 },
      { x: 4, w: 1 },
      { x: 6, w: 3 },
      { x: 10, w: 3 },
      { x: 14, w: 1 },
    ]);
  });

  it("cada símbolo reproduz o padrão barra-espaço da tabela, com três elementos largos", () => {
    for (const ch of CODE39_ALPHABET) {
      const { bars, width } = code39(ch);
      expect(width).toBe(3 * SYMBOL + 2);
      // Símbolo do meio: barras 5..9; os espaços são os vãos entre barras vizinhas.
      const middle = bars.slice(5, 10);
      const elements: number[] = [];
      middle.forEach((bar, i) => {
        elements.push(bar.w);
        if (i < middle.length - 1) elements.push(middle[i + 1].x - (bar.x + bar.w));
      });
      expect(elements).toHaveLength(9);
      expect(elements.map((w) => (w === 3 ? "1" : "0")).join("")).toBe(CODE39_PATTERNS[ch]);
      expect(elements.filter((w) => w === 3)).toHaveLength(3);
      expect(elements.every((w) => w === 1 || w === 3)).toBe(true);
    }
  });

  it("aceita a razão larga como parâmetro", () => {
    const narrow = code39("A", 2);
    expect(narrow.width).toBe(3 * (6 + 3 * 2) + 2);
  });

  it("rejeita caractere fora do alfabeto", () => {
    expect(() => code39("grb")).toThrow(/g/);
    expect(() => code39("Ç")).toThrow();
    expect(() => code39("G*B")).toThrow();
  });

  it("é determinístico", () => {
    expect(code39("GRB")).toEqual(code39("GRB"));
  });
});
