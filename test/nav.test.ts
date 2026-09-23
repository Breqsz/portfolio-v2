import { describe, expect, it } from "vitest";
import { getCases, getDictionary } from "@/lib/content";
import { locales } from "@/lib/i18n";
import { menuItems } from "@/lib/nav";

/** Ids que existem na home e que o menu pode apontar. */
const HOME_IDS = ["carga", "hold", "neurorace", "autofix", "trajetoria", "contato"];

describe("menuItems", () => {
  it.each(locales)("em %s, lista os 4 cases numerados, a trajetória e o contato, nessa ordem", (locale) => {
    const items = menuItems(locale, getDictionary(locale), getCases(locale));
    expect(items.map((i) => i.href)).toEqual(HOME_IDS.map((id) => `/${locale}#${id}`));
    expect(items.slice(0, 4).map((i) => i.index)).toEqual(["01", "02", "03", "04"]);
    expect(items.slice(4).every((i) => i.index === undefined)).toBe(true);
    expect(items.every((i) => i.label.trim().length > 0)).toBe(true);
  });
});
