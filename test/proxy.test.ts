import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "@/proxy";

const request = (path: string, acceptLanguage?: string) =>
  new NextRequest(`https://breq.com.br${path}`, {
    headers: acceptLanguage ? { "accept-language": acceptLanguage } : {},
  });

describe("proxy de idioma", () => {
  it("manda a raiz para o idioma do navegador", () => {
    const res = proxy(request("/", "en-US,en;q=0.9"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://breq.com.br/en");
  });

  it("prefixa em português um caminho sem idioma", () => {
    const res = proxy(request("/work/carga"));
    expect(res.headers.get("location")).toBe("https://breq.com.br/pt/work/carga");
  });

  it("deixa passar o que já tem idioma", () => {
    const res = proxy(request("/en/work/hold", "pt-BR"));
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });
});
