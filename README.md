# Portfólio V2 — Guilherme Rocha Bianchini

Site pessoal de contratação, conceito **Evidência**: quatro trabalhos abertos em detalhe, em português e inglês. Estratégia em [`PRODUCT.md`](PRODUCT.md), sistema visual em [`DESIGN.md`](DESIGN.md).

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · lucide-react · Vitest + fast-check. Sem biblioteca de motion e sem backend: todas as páginas são geradas estaticamente; o único código de servidor é o `proxy.ts` (redireciona `/` para o idioma do navegador) e as imagens de Open Graph.

## Rodar

```bash
npm install
npm run dev        # http://localhost:3000 → redireciona para /pt ou /en
npm test           # modelo do simulador (property-based), i18n, proxy, paridade de conteúdo
npm run typecheck
npm run lint
npm run build && npm start
```

## Estrutura

```
app/[locale]/                 layout (fontes, <html lang>), home, 404, imagem de OG
app/[locale]/work/[slug]/     página de case + OG por case
app/[locale]/[...rest]/       qualquer rota inexistente → 404 do idioma
content/dictionary.ts         textos de interface, PT e EN
content/cases/{pt,en}.ts      os quatro cases; números sempre com data e condição
lib/carga-model.ts            modelo simplificado do simulador (escrito para esta página)
proxy.ts                      idioma por Accept-Language
media/                        capturas reais dos produtos (WebP)
```

## Regras de conteúdo

- Todo número publicado tem **data e condição**. O que não está medido não aparece.
- `test/content.test.ts` garante a mesma estrutura, os mesmos números e os mesmos links nos dois idiomas, e barra telefone, infraestrutura e caminho de demo no texto público.
- O simulador do Carga **não é** o núcleo do Carga (repositório privado): é um modelo reduzido, calibrado nas mesmas faixas de realidade (25–45 Wh/km), com a mesma saída (margem contra reserva de 15%) e o mesmo vocabulário (cabe · apertada · sem margem).

## Deploy

Precisa de runtime Node (por causa do `proxy.ts` e das imagens de OG): `next build` + `next start`, na Hostinger (como o V1) ou na Vercel. Defina `NEXT_PUBLIC_SITE_URL` se o domínio não for `https://breq.com.br`.
