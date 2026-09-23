import { NextResponse, type NextRequest } from "next/server";
import { isLocale, pickLocale } from "@/lib/i18n";

/**
 * Todo caminho sem idioma ganha um: `/` vira `/pt` ou `/en` conforme o
 * navegador, e `/work/carga` vira `/pt/work/carga`. Arquivos (sitemap.xml,
 * robots.txt, imagens) ficam de fora pelo matcher.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1] ?? "";
  if (isLocale(first)) return NextResponse.next();

  const url = request.nextUrl.clone();
  const locale = pickLocale(request.headers.get("accept-language"));
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ["/((?!_next/|.*\\.\\w+$).*)"],
};
