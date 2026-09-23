/**
 * Code 39 (ISO/IEC 16388) — o código de barras do crachá. Cada símbolo tem 9
 * elementos (5 barras e 4 espaços), 3 deles largos; o texto vai emoldurado
 * por asteriscos e os símbolos se separam por um espaço estreito. Padrões em
 * ordem barra-espaço-barra-…: 1 = largo, 0 = estreito.
 */
export const CODE39_PATTERNS: Record<string, string> = {
  "0": "000110100", "1": "100100001", "2": "001100001", "3": "101100000", "4": "000110001",
  "5": "100110000", "6": "001110000", "7": "000100101", "8": "100100100", "9": "001100100",
  A: "100001001", B: "001001001", C: "101001000", D: "000011001", E: "100011000",
  F: "001011000", G: "000001101", H: "100001100", I: "001001100", J: "000011100",
  K: "100000011", L: "001000011", M: "101000010", N: "000010011", O: "100010010",
  P: "001010010", Q: "000000111", R: "100000110", S: "001000110", T: "000010110",
  U: "110000001", V: "011000001", W: "111000000", X: "010010001", Y: "110010000",
  Z: "011010000", "-": "010000101", ".": "110000100", " ": "011000100", $: "010101000",
  "/": "010100010", "+": "010001010", "%": "000101010", "*": "010010100",
};

/** Caracteres que o chamador pode codificar (o asterisco é só de início e fim). */
export const CODE39_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%";

export type Bar = { x: number; w: number };

/** Barras em unidades estreitas, prontas para virar `<rect>`; `wide` é a razão largo:estreito. */
export function code39(text: string, wide = 3): { bars: Bar[]; width: number } {
  for (const ch of text) {
    if (!CODE39_ALPHABET.includes(ch)) throw new Error(`Caractere fora do Code 39: "${ch}"`);
  }
  const bars: Bar[] = [];
  let x = 0;
  [...`*${text}*`].forEach((ch, i) => {
    if (i > 0) x += 1;
    const pattern = CODE39_PATTERNS[ch];
    for (let k = 0; k < pattern.length; k++) {
      const w = pattern[k] === "1" ? wide : 1;
      if (k % 2 === 0) bars.push({ x, w });
      x += w;
    }
  });
  return { bars, width: x };
}
