import { describe, expect, it } from "vitest";
import { vtName } from "@/lib/view-transition";
import { caseSlugs } from "@/lib/site";

describe("vtName", () => {
  it("gera identificadores CSS válidos e únicos por case e por papel", () => {
    const names = caseSlugs.flatMap((s) => [vtName.hook(s), vtName.name(s)]);
    expect(new Set(names).size).toBe(names.length);
    for (const n of names) expect(n).toMatch(/^[a-z][a-z0-9-]*$/);
  });
});
