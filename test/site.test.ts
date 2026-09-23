import { describe, expect, it } from "vitest";
import { SITE } from "@/lib/site";

describe("SITE", () => {
  it("o link de código aponta para o repositório da V2, não para o do V1", () => {
    expect(SITE.source).toBe("https://github.com/Breqsz/portfolio-v2");
    expect(SITE.source).not.toMatch(/portfoliov2$/);
  });
});
