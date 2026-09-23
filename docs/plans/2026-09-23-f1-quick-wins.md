# F1 — Quick wins do redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar as quick wins da F1 do dossiê “Evidência ao máximo”:
- menu mobile;
- header fixo com índice e progresso de leitura;
- link certo no footer;
- status e relógio no contato;
- mídia monocromática;
- View Transitions de título;
- corte da abertura “Trabalho”;
- status visual no índice de cases.

Tudo sem lib nova no runtime.

**Architecture:** Next 16.3 App Router, SSG. Três regras guiam a implementação:
- Toda lógica testável vai para `lib/` como função pura, coberta por Vitest em ambiente `node`.
- O comportamento de UI é verificado por um harness de QA (`scripts/qa.mjs`) que dirige o Chrome via DevTools Protocol contra `next start` e roda axe-core, overflow, sticky, âncoras, menu e erros de console.
- Motion só em CSS nativo (`animation-timeline`, `@starting-style`, `<ViewTransition>` do React).

**Tech Stack:**
- Next 16.3.4 · React 19.2.8 (o App Router usa o canary embutido, que tem `ViewTransition`)
- Tailwind 4 (`@theme` em `app/globals.css`) · lucide-react
- Vitest 5 + fast-check
- axe-core (nova devDependency, só para o QA)

**Spec:** Dossiê “Evidência ao máximo” (artifact https://claude.ai/artifact/Kt6SyHnSchvQaSPA7N3Bqi), §06, §07, §15 (quick wins 1–8) e §16 (F1). Resumo na Wiki: `projects/portfolio/research/0002-dossie-redesign-v2-evidencia-ao-maximo.md`.

## Global Constraints

- **Nenhuma dependência nova de runtime.** DevDependency nova permitida: só `axe-core`.
- **Nada de lib de motion, three.js, GSAP ou Lenis** (ADR 0003).
- **Cor e tipo só por token** do `@theme`. Nenhum hex solto em componente. A exceção é o que já existe.
- **PT e EN com as mesmas chaves.** O teste de paridade `test/content.test.ts` tem que continuar verde.
- **`prefers-reduced-motion: reduce`:** nenhuma animação nova roda (progresso, tint de mídia, sheet do menu, view transitions).
- **Nenhum dado inventado.** Não entram data de disponibilidade nem CV: dependem das respostas pendentes na Wiki.
- **Commits:** um comportamento por commit, autor `Breqsz <capitaoxd97@gmail.com>`, **sem** trailer `Co-Authored-By` e sem menção a Claude.
- **Sem `git push` e sem deploy** sem ok explícito do Breq.
- **Gate final:** `npm test`, `npm run lint`, `npm run build`, `npm run typecheck` (depois do build) e `npm run qa` verdes. axe com 0 violações.

## Review Focus

1. **Âncoras sob o header fixo.** “Ver o trabalho”, o índice e o menu têm que parar com o alvo **abaixo** do header, não escondido atrás dele. Coberto no QA (Task 5).
2. **Link de menu para âncora na mesma página.** O `<dialog>` modal deixa o resto da página inerte. O toque no link precisa fechar o menu e rolar até o alvo. Coberto no QA (Task 6).
3. **Touch em navegador sem scroll-timeline** (Firefox estável). A mídia nunca pode ficar presa em cinza. Coberto por teste de CSS (Task 8).
4. **Relógio no HTML estático.** Não pode haver erro de hidratação no console. Coberto por formatter puro + QA de console (Task 7).
5. **Usuário com reduced-motion** não recebe view transition nem animação nova. Coberto por teste de CSS (Tasks 5, 8 e 9).

---

## Mapa de arquivos

| Arquivo | Responsabilidade | Task |
|---|---|---|
| `scripts/qa.mjs` (novo) | Harness de QA via CDP: sobe Chrome headless, visita URLs, roda checks e axe | 1 |
| `package.json` | script `qa`, devDep `axe-core` | 1 |
| `lib/site.ts` | `SITE.source` → repo da V2 | 2 |
| `test/site.test.ts` (novo) | regressão do link de código | 2 |
| `content/cases/types.ts`, `pt.ts`, `en.ts` | campo `status` por case | 3 |
| `components/status-dot.tsx` (novo) | ponto de estado (decorativo, `aria-hidden`) | 3 |
| `components/home/hero.tsx` | índice com status | 3 |
| `app/[locale]/page.tsx`, `content/dictionary.ts` | abertura “Trabalho” vira h2 `sr-only` | 4 |
| `components/site-header.tsx` | header fixo + barra de progresso + índice xl | 5 |
| `components/header-index.tsx` (novo) | índice 01–04 com seção ativa (IO) | 5 |
| `app/globals.css` | `--header-h`, scroll-margin, progresso, tint, sheet, view transitions | 5, 6, 8, 9 |
| `components/home/chapters.tsx`, `components/case/case-parts.tsx` | offsets de `sticky` | 5, 9 |
| `lib/nav.ts` (novo) + `test/nav.test.ts` (novo) | itens do menu | 6 |
| `components/mobile-menu.tsx` (novo) | botão + `<dialog>` em folha | 6 |
| `lib/format.ts` + `test/format.test.ts` | `saoPauloTime()` | 7 |
| `components/local-time.tsx` (novo) | relógio client | 7 |
| `components/contact.tsx` | linha de status | 7 |
| `components/media-frame.tsx` | classe `media-mono` | 8 |
| `test/css.test.ts` (novo) | invariantes de CSS (grayscale gated, reduced-motion) | 5, 8, 9 |
| `lib/view-transition.ts` (novo) + `test/view-transition.test.ts` (novo) | nomes de transição | 9 |
| `components/home/chapter-parts.tsx` | `ChapterTitle` com `ViewTransition` | 9 |

---

### Task 1: Harness de QA (CDP + axe) e linha de base

**Files:**
- Create: `scripts/qa.mjs`
- Modify: `package.json` (script `qa` + devDep `axe-core`)

**Interfaces:**
- Produz: `npm run qa`. Lê `QA_BASE` (padrão `http://localhost:3100`) e `CHROME_PATH` (padrão `C:/Program Files/Google/Chrome/Application/chrome.exe`). Sai com código 1 se algum check falhar.
- Produz: o array `CHECKS` em `scripts/qa.mjs`, no formato `{ name, path, width, height, run: async (page) => string | null }`, onde `null` é OK e a string é a mensagem de falha. As próximas tasks **acrescentam** checks nesse array.
- Produz: o helper `page` com `eval(expr)` (retorna o valor), `key(name)`, `sleep(ms)`, `consoleErrors` (array).

- [ ] **Step 1: Instalar axe-core**

Run: `npm i -D axe-core@4`
Expected: `package.json` ganha `"axe-core": "^4.x"` em devDependencies.

- [ ] **Step 2: Escrever `scripts/qa.mjs`**

```js
// QA de navegador sem Playwright: Chrome headless via DevTools Protocol.
// Uso: npm run build && npx next start -p 3100 (em outro terminal) → npm run qa
import { spawn } from "node:child_process";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const BASE = process.env.QA_BASE ?? "http://localhost:3100";
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9335;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const noOverflow = async (page) => {
  const [sw, iw] = await page.eval("[document.documentElement.scrollWidth, window.innerWidth]");
  return sw > iw ? `overflow horizontal: ${sw}px > ${iw}px` : null;
};

const axe = async (page) => {
  await page.eval(AXE + ";0");
  const res = await page.eval(
    `axe.run(document, { runOnly: ["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"] }).then(r => r.violations.map(v => v.id + " (" + v.nodes.length + ")"))`,
    true,
  );
  return res.length ? `axe: ${res.join(", ")}` : null;
};

const consoleClean = async (page) =>
  page.consoleErrors.length ? `console: ${page.consoleErrors.slice(0, 3).join(" | ")}` : null;

export const CHECKS = [];
for (const path of ["/pt", "/en", "/pt/work/carga", "/en/work/autofix"]) {
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    CHECKS.push({ name: `axe ${path} @${width}`, path, width, height, run: axe });
    CHECKS.push({ name: `overflow ${path} @${width}`, path, width, height, run: noOverflow });
    CHECKS.push({ name: `console ${path} @${width}`, path, width, height, run: consoleClean });
  }
}
CHECKS.push({ name: "overflow /pt @1024", path: "/pt", width: 1024, height: 768, run: noOverflow });

// --- checks das tasks seguintes são acrescentados abaixo desta linha ---

async function main() {
  const profile = mkdtempSync(join(tmpdir(), "qa-chrome-"));
  const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, "--hide-scrollbars", `--user-data-dir=${profile}`, "about:blank"]);
  let target;
  for (let i = 0; i < 40 && !target; i++) {
    await sleep(250);
    try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === "page"); } catch {}
  }
  if (!target) throw new Error("Chrome não abriu o DevTools");
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  const consoleErrors = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === "Runtime.exceptionThrown") consoleErrors.push(m.params.exceptionDetails.text);
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error")
      consoleErrors.push(m.params.args.map((a) => a.value ?? a.description).join(" "));
  };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send("Page.enable");
  await send("Runtime.enable");
  const page = {
    consoleErrors,
    sleep,
    async eval(expression, awaitPromise = false) {
      const m = await send("Runtime.evaluate", { expression, awaitPromise, returnByValue: true });
      if (m.result?.exceptionDetails) throw new Error(m.result.exceptionDetails.exception?.description ?? "eval falhou");
      return m.result?.result?.value;
    },
    async key(key) {
      const code = key === "Escape" ? "Escape" : key;
      await send("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: key === "Escape" ? 27 : 0 });
      await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: key === "Escape" ? 27 : 0 });
    },
  };

  const failures = [];
  for (const c of CHECKS) {
    consoleErrors.length = 0;
    await send("Emulation.setDeviceMetricsOverride", { width: c.width, height: c.height, deviceScaleFactor: 1, mobile: c.width < 600 });
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: c.reducedMotion ? "reduce" : "no-preference" }] });
    await send("Page.navigate", { url: BASE + c.path });
    await sleep(1800);
    let msg;
    try { msg = await c.run(page); } catch (err) { msg = `erro: ${err.message}`; }
    console.log(`${msg ? "FAIL" : "ok  "}  ${c.name}${msg ? " — " + msg : ""}`);
    if (msg) failures.push(c.name);
  }
  ws.close();
  chrome.kill();
  console.log(`\n${CHECKS.length - failures.length}/${CHECKS.length} checks ok`);
  process.exit(failures.length ? 1 : 0);
}

main().catch((err) => { console.error(err); process.exit(1); });
```

- [ ] **Step 3: Adicionar o script em `package.json`**

Em `"scripts"`, acrescentar `"qa": "node scripts/qa.mjs"`.

- [ ] **Step 4: Rodar a linha de base**

Run (terminal A): `npm run build && npx next start -p 3100`
Run (terminal B): `npm run qa`

Expected: cada check imprime `ok` ou `FAIL`. **Registre a linha de base** no corpo do commit. Hoje o axe nunca rodou na Hero nova, então é possível que haja violação.
- Se o axe acusar violação **pré-existente**, corrija só se for trivial (contraste ou `aria` faltando) e registre no commit.
- Senão, anote como dívida para o review final. Não mascare.

- [ ] **Step 5: Commit**

```bash
git add scripts/qa.mjs package.json package-lock.json
git commit -m "Adiciona QA de navegador via DevTools Protocol com axe-core

Linha de base: <colar o resumo 'N/M checks ok' e as falhas, se houver>."
```

---

### Task 2: Link do código aponta para o repo da V2

**Files:**
- Create: `test/site.test.ts`
- Modify: `lib/site.ts:10`

**Interfaces:**
- Produz: `SITE.source === "https://github.com/Breqsz/portfolio-v2"`.

- [ ] **Step 1: Teste que falha**

```ts
import { describe, expect, it } from "vitest";
import { SITE } from "@/lib/site";

describe("SITE", () => {
  it("o link de código aponta para o repositório da V2, não para o do V1", () => {
    expect(SITE.source).toBe("https://github.com/Breqsz/portfolio-v2");
    expect(SITE.source).not.toMatch(/portfoliov2$/);
  });
});
```

- [ ] **Step 2:** `npx vitest run test/site.test.ts`. Esperado: FAIL (recebe `.../portfoliov2`).
- [ ] **Step 3:** em `lib/site.ts`, trocar `source: "https://github.com/Breqsz/portfoliov2",` por `source: "https://github.com/Breqsz/portfolio-v2",`.
- [ ] **Step 4:** `npx vitest run test/site.test.ts`. Esperado: PASS.
- [ ] **Step 5: Commit**

```bash
git add lib/site.ts test/site.test.ts
git commit -m "Aponta \"Código deste site\" para o repositório da V2"
```

---

### Task 3: Status de cada case no índice da Hero

O índice mostra hoje só o texto `kind`. O case passa a ter um `status` tipado, e o índice ganha um ponto de estado antes do `kind`. O texto continua sendo o rótulo (o ponto é `aria-hidden`), então nada muda para leitor de tela e nenhum copy é inventado.

**Files:**
- Modify: `content/cases/types.ts`, `content/cases/pt.ts`, `content/cases/en.ts`
- Create: `components/status-dot.tsx`
- Modify: `components/home/hero.tsx` (span do `c.kind` no índice)
- Test: `test/content.test.ts`

**Interfaces:**
- Produz: `export type CaseStatus = "live" | "demo" | "study";` e `CaseContent.status: CaseStatus`.
- Produz: `StatusDot({ status }: { status: CaseStatus })`.

- [ ] **Step 1: Teste que falha.** Acrescentar em `test/content.test.ts`, dentro do `describe("paridade entre idiomas", ...)`:

```ts
  it("cada case tem o mesmo status nos dois idiomas, e o status bate com a natureza do trabalho", () => {
    const expected = { carga: "study", hold: "live", neurorace: "live", autofix: "demo" } as const;
    for (const slug of caseSlugs) {
      expect(casesPt[slug].status).toBe(expected[slug]);
      expect(casesEn[slug].status).toBe(expected[slug]);
    }
  });
```

- [ ] **Step 2:** `npx vitest run test/content.test.ts`. Esperado: FAIL (`status` undefined) e erro de tipo.
- [ ] **Step 3: Implementar**

Em `content/cases/types.ts`, antes de `export type CaseContent`:

```ts
/** Estado público do trabalho: no ar para quem quiser ver, demo sob acesso, ou estudo sem produção. */
export type CaseStatus = "live" | "demo" | "study";
```

e, em `CaseContent`, logo abaixo de `kind: string;`:

```ts
  status: CaseStatus;
```

Em `content/cases/pt.ts` e `content/cases/en.ts`, acrescentar uma linha **logo abaixo** da linha `kind:` de cada case:
- carga (pt:10, en:9): `status: "study",`
- hold (pt:152, en:151): `status: "live",`
- neurorace (pt:281, en:280): `status: "live",`
- autofix (pt:387, en:386): `status: "demo",`

Criar `components/status-dot.tsx`:

```tsx
import type { CaseStatus } from "@/content/cases/types";

const TONE: Record<CaseStatus, string> = {
  live: "bg-state-cabe",
  demo: "bg-state-apertada",
  study: "bg-ink-3",
};

/** Codifica o estado em forma além do texto: o rótulo ao lado continua sendo a informação. */
export function StatusDot({ status }: { status: CaseStatus }) {
  return <span aria-hidden="true" className={`inline-block size-1.5 shrink-0 rounded-full ${TONE[status]}`} />;
}
```

Em `components/home/hero.tsx`, importar `import { StatusDot } from "@/components/status-dot";` e trocar

```tsx
                  <span className="mt-auto pt-1 text-xs text-ink-3">{c.kind}</span>
```

por

```tsx
                  <span className="mt-auto flex items-center gap-2 pt-1 text-xs text-ink-3">
                    <StatusDot status={c.status} />
                    {c.kind}
                  </span>
```

- [ ] **Step 4:** `npm test && npm run lint`. Esperado: tudo PASS.
- [ ] **Step 5: Commit**

```bash
git add content/cases components/status-dot.tsx components/home/hero.tsx test/content.test.ts
git commit -m "Marca o status de cada case no índice da Hero"
```

---

### Task 4: Corta a abertura “O trabalho, de perto.”

A seção `#trabalho` continua existindo (é o alvo do CTA e do menu) e mantém o `h2`, agora só para leitor de tela: os capítulos são `h3` e precisam dele na hierarquia. Saem a frase de introdução e cerca de 220 px de papel.

**Files:**
- Modify: `app/[locale]/page.tsx:62-67`
- Modify: `content/dictionary.ts` (remove `work.intro` em pt e en)
- Test: `test/content.test.ts`

- [ ] **Step 1: Teste que falha.** Em `test/content.test.ts`, no `describe("paridade entre idiomas", ...)`:

```ts
  it("a home não tem mais a frase de abertura da seção Trabalho", () => {
    expect("intro" in dictionary.pt.work).toBe(false);
    expect("intro" in dictionary.en.work).toBe(false);
  });
```

- [ ] **Step 2:** `npx vitest run test/content.test.ts`. Esperado: FAIL.
- [ ] **Step 3: Implementar**
  - Em `content/dictionary.ts`, remover a linha `intro: "Quatro contextos. Decisões diferentes. O mesmo cuidado em fazer funcionar.",` do `work` em pt e a linha `intro:` correspondente do `work` em en. O `intro` do `simulator` **fica**.
  - Em `app/[locale]/page.tsx`, trocar o bloco

```tsx
          <div className="shell grid-12 gap-y-6 pb-16 pt-24 lg:pb-24 lg:pt-36">
            <h2 id="trabalho-title" className="col-span-12 text-2xl font-bold tracking-[-0.02em] lg:col-span-6">
              {t.work.title}
            </h2>
            <p className="col-span-12 max-w-[40ch] self-end text-lg text-ink-2 lg:col-span-4 lg:col-start-9">{t.work.intro}</p>
          </div>
```

por

```tsx
          <h2 id="trabalho-title" className="sr-only">
            {t.work.title}
          </h2>
```

  - Como o capítulo Carga passa a começar logo depois do índice, adicionar `mt-16 lg:mt-24` na `className` do `<article>` do `ChapterCarga` (`components/home/chapters.tsx:29`), para o índice respirar antes do bloco escuro.

- [ ] **Step 4:** `npm test && npm run lint && npm run build`. Esperado: tudo verde.
- [ ] **Step 5: Commit**

```bash
git add app content/dictionary.ts components/home/chapters.tsx test/content.test.ts
git commit -m "Remove a abertura redundante da seção Trabalho"
```

---

### Task 5: Header fixo, progresso de leitura e índice no desktop

**Files:**
- Modify: `components/site-header.tsx`
- Create: `components/header-index.tsx`
- Modify: `app/globals.css`
- Modify: `components/home/chapters.tsx:31,52,88` e `components/case/case-parts.tsx:133` (offsets de sticky)
- Modify: `app/[locale]/page.tsx` e `app/[locale]/work/[slug]/page.tsx` (passar `cases` ao header)
- Create: `test/css.test.ts`
- Modify: `scripts/qa.mjs` (checks)

**Interfaces:**
- Consome: `CaseBook` e `caseSlugs`.
- Produz: `SiteHeader({ locale, t, cases }: { locale: Locale; t: Dictionary; cases: CaseBook })`. **A assinatura muda**: todo uso precisa passar `cases`.
- Produz: variável CSS `--header-h` (3.5rem; 4rem a partir de 64rem), usada nos offsets.
- Produz: `test/css.test.ts`, com o helper `css()` que lê `app/globals.css`. As Tasks 8 e 9 acrescentam testes nele.

- [ ] **Step 1: Testes que falham**

Criar `test/css.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

export const css = () => readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

describe("header fixo", () => {
  it("âncoras param abaixo do header", () => {
    expect(css()).toMatch(/scroll-margin-top:\s*calc\(var\(--header-h\)/);
  });
  it("a barra de progresso só anima com scroll-timeline e sem reduced-motion", () => {
    const block = css().split("@supports (animation-timeline: scroll())")[1] ?? "";
    expect(block).toMatch(/prefers-reduced-motion:\s*no-preference/);
    expect(block).toMatch(/\.header-progress/);
  });
});
```

Em `scripts/qa.mjs`, abaixo do marcador, acrescentar:

```js
CHECKS.push({
  name: "header fixo continua no topo depois do scroll", path: "/pt", width: 1440, height: 900,
  run: async (p) => {
    await p.eval("window.scrollTo(0, 3000)"); await p.sleep(300);
    const top = await p.eval("document.querySelector('header').getBoundingClientRect().top");
    return top === 0 ? null : `header.top = ${top}`;
  },
});
for (const [width, height] of [[1440, 900], [390, 844]]) {
  CHECKS.push({
    name: `âncora #hold fica abaixo do header @${width}`, path: "/pt#hold", width, height,
    run: async (p) => {
      await p.sleep(400);
      const [h, t] = await p.eval("[document.querySelector('header').getBoundingClientRect().bottom, document.getElementById('hold').getBoundingClientRect().top]");
      return t >= h - 1 ? null : `alvo em ${t}px, header termina em ${h}px`;
    },
  });
}
```

- [ ] **Step 2:** `npx vitest run test/css.test.ts`. Esperado: FAIL. Com o servidor no ar (`npm run build && npx next start -p 3100`), `npm run qa`: os 3 checks novos em FAIL.

- [ ] **Step 3: CSS.** Em `app/globals.css`:
  - Dentro do `:root` já existente, acrescentar `--header-h: 3.5rem;`. Logo depois do bloco `:root { ... }`, acrescentar:

```css
@media (min-width: 64rem) {
  :root {
    --header-h: 4rem;
  }
}
```

  - Trocar `scroll-margin-top: 1.5rem;` (dentro de `[id]`) por `scroll-margin-top: calc(var(--header-h) + 1.5rem);`.
  - No fim do arquivo, **antes** do `@media (prefers-reduced-motion: reduce)` global:

```css
/* Progresso de leitura: um fio de sinal na base do header. Sem suporte, não aparece. */
.header-progress {
  position: absolute;
  inset-inline: 0;
  bottom: -1px;
  height: 2px;
  background: var(--color-signal);
  transform-origin: 0 50%;
  transform: scaleX(0);
  pointer-events: none;
}
@supports (animation-timeline: scroll()) {
  @media (prefers-reduced-motion: no-preference) {
    .header-progress {
      animation: read-progress linear both;
      animation-timeline: scroll(root block);
    }
  }
}
@keyframes read-progress {
  to {
    transform: scaleX(1);
  }
}
```

- [ ] **Step 4: `components/header-index.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CaseSlug } from "@/lib/site";

type Item = { slug: CaseSlug; name: string };
type Props = { locale: string; items: Item[]; label: string };

/**
 * Índice 01–04 no header largo. Na home, marca o capítulo em leitura; nos
 * cases, os capítulos não existem na página e nada fica marcado.
 */
export function HeaderIndex({ locale, items, label }: Props) {
  const [active, setActive] = useState<CaseSlug | null>(null);

  useEffect(() => {
    const targets = items.map((i) => document.getElementById(i.slug)).filter((el): el is HTMLElement => el !== null);
    if (!targets.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id as CaseSlug);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label={label} className="hidden xl:block">
      <ol className="flex items-center gap-6 text-sm font-semibold">
        {items.map((item, i) => {
          const on = item.slug === active;
          return (
            <li key={item.slug}>
              <Link
                href={`/${locale}#${item.slug}`}
                aria-current={on ? "location" : undefined}
                className={`group inline-flex min-h-11 items-baseline gap-1.5 transition-colors duration-150 ${on ? "text-ink" : "text-ink-2 hover:text-ink"}`}
              >
                <span className={`tabular text-xs ${on ? "text-signal-strong" : "text-ink-3"}`}>{String(i + 1).padStart(2, "0")}</span>
                <span className={`link-sweep ${on ? "[background-size:100%_1px]" : ""}`}>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 5: `components/site-header.tsx`**
  - Assinatura nova: `type Props = { locale: Locale; t: Dictionary; cases: CaseBook };`.
  - Imports: `import type { CaseBook } from "@/content/cases/types";`, `import { caseSlugs } from "@/lib/site";` e `import { HeaderIndex } from "@/components/header-index";`.
  - `<header>`: trocar a classe por `className="sticky top-0 z-[var(--z-header)] border-b border-line bg-bg/90 backdrop-blur-md"`.
  - `<div className="shell flex h-18 items-center gap-6">` vira `<div className="shell flex h-[var(--header-h)] items-center gap-6">`.
  - Logo depois do `<Link>` do nome (que tem `mr-auto`), inserir:

```tsx
        <HeaderIndex
          locale={locale}
          label={t.hero.indexLabel}
          items={caseSlugs.map((slug) => ({ slug, name: cases[slug].name }))}
        />
```

  - Antes de fechar `</header>`, inserir `<span aria-hidden="true" className="header-progress" />`.
  - Em `app/[locale]/page.tsx` e `app/[locale]/work/[slug]/page.tsx`: `<SiteHeader locale={locale} t={t} cases={cases} />`. As duas páginas já têm `cases`.
  - Conferir o 404 (`app/[locale]/not-found.tsx` e `app/[locale]/[...rest]/page.tsx`): se usarem `SiteHeader`, passar `cases={getCases(locale)}` com o import de `@/lib/content`. Se o `tsc` acusar outro uso, corrigir do mesmo jeito.

- [ ] **Step 6: Offsets de sticky**
  - `components/home/chapters.tsx`: nas 3 ocorrências de `lg:top-10`, trocar por `lg:top-[calc(var(--header-h)+2.5rem)]`.
  - `components/case/case-parts.tsx:133`: trocar `lg:top-8` por `lg:top-[calc(var(--header-h)+2rem)]`.

- [ ] **Step 7:** `npm test && npm run lint && npm run build && npm run typecheck`, depois `npx next start -p 3100` e `npm run qa`. Esperado: tudo verde, inclusive os 3 checks novos.
- [ ] **Step 8: Commit**

```bash
git add app components scripts/qa.mjs test/css.test.ts
git commit -m "Header fixo com índice dos cases e progresso de leitura"
```

---

### Task 6: Menu mobile em folha (`<dialog>`)

**Files:**
- Create: `lib/nav.ts`, `test/nav.test.ts`, `components/mobile-menu.tsx`
- Modify: `components/site-header.tsx`, `content/dictionary.ts` (`nav.menu`, `nav.close`, `nav.menuLabel`), `app/globals.css`, `scripts/qa.mjs`

**Interfaces:**
- Consome: `SiteHeader({ locale, t, cases })` (Task 5).
- Produz: `export type NavItem = { href: string; label: string; index?: string };` e `menuItems(locale: Locale, t: Dictionary, cases: CaseBook): NavItem[]`.
- Produz: `MobileMenu({ items, t }: { items: NavItem[]; t: Dictionary["nav"] })`.

- [ ] **Step 1: Testes que falham.** Criar `test/nav.test.ts`:

```ts
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
```

Em `scripts/qa.mjs`, acrescentar:

```js
CHECKS.push({
  name: "menu mobile abre, fecha com Esc e devolve o foco", path: "/pt", width: 390, height: 844,
  run: async (p) => {
    const visible = await p.eval("!!document.querySelector('[aria-controls=\"menu-mobile\"]')?.offsetParent");
    if (!visible) return "botão do menu não está visível em 390px";
    await p.eval("document.querySelector('[aria-controls=\"menu-mobile\"]').click()"); await p.sleep(400);
    if (!(await p.eval("document.getElementById('menu-mobile').open"))) return "o dialog não abriu";
    await p.key("Escape"); await p.sleep(300);
    if (await p.eval("document.getElementById('menu-mobile').open")) return "Esc não fechou";
    const back = await p.eval("document.activeElement?.getAttribute('aria-controls')");
    return back === "menu-mobile" ? null : `foco foi para ${back}`;
  },
});
CHECKS.push({
  name: "link do menu fecha a folha e rola até o alvo", path: "/pt", width: 390, height: 844,
  run: async (p) => {
    await p.eval("document.querySelector('[aria-controls=\"menu-mobile\"]').click()"); await p.sleep(400);
    await p.eval("document.querySelector('#menu-mobile a[href$=\"#contato\"]').click()"); await p.sleep(1200);
    const [open, top] = await p.eval("[document.getElementById('menu-mobile').open, document.getElementById('contato').getBoundingClientRect().top]");
    if (open) return "o menu continuou aberto";
    return top < 300 ? null : `#contato ficou em ${top}px`;
  },
});
CHECKS.push({
  name: "botão do menu some no desktop", path: "/pt", width: 1440, height: 900,
  run: async (p) => ((await p.eval("!!document.querySelector('[aria-controls=\"menu-mobile\"]')?.offsetParent")) ? "botão visível em 1440px" : null),
});
```

- [ ] **Step 2:** `npx vitest run test/nav.test.ts`. Esperado: FAIL (módulo não existe).

- [ ] **Step 3: `lib/nav.ts`**

```ts
import type { CaseBook } from "@/content/cases/types";
import type { Dictionary } from "@/content/dictionary";
import type { Locale } from "@/lib/i18n";
import { caseSlugs } from "@/lib/site";

export type NavItem = { href: string; label: string; index?: string };

/** O índice do site no celular: os cases na ordem da home, depois trajetória e contato. */
export function menuItems(locale: Locale, t: Dictionary, cases: CaseBook): NavItem[] {
  return [
    ...caseSlugs.map((slug, i) => ({
      href: `/${locale}#${slug}`,
      label: cases[slug].name,
      index: String(i + 1).padStart(2, "0"),
    })),
    { href: `/${locale}#trajetoria`, label: t.nav.path },
    { href: `/${locale}#contato`, label: t.nav.contact },
  ];
}
```

- [ ] **Step 4:** `npx vitest run test/nav.test.ts`. Esperado: PASS.

- [ ] **Step 5: Dicionário.** Em `nav`, pt: `menu: "Menu", close: "Fechar", menuLabel: "Índice do site",`. Em en: `menu: "Menu", close: "Close", menuLabel: "Site index",`.

- [ ] **Step 6: `components/mobile-menu.tsx`**

```tsx
"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import type { Dictionary } from "@/content/dictionary";
import type { NavItem } from "@/lib/nav";

type Props = { items: NavItem[]; t: Dictionary["nav"] };

/**
 * Folha de baixo para cima com o índice do site. É um <dialog> nativo: foco
 * preso, Esc fecha e o foco volta ao botão. Fechar antes de navegar deixa a
 * página sair de `inert` a tempo de rolar até a âncora.
 */
export function MobileMenu({ items, t }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = () => ref.current?.close();

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-controls="menu-mobile"
        aria-haspopup="dialog"
        onClick={() => ref.current?.showModal()}
        className="inline-flex min-h-11 items-center border border-current/25 px-3 text-sm font-semibold"
      >
        {t.menu}
      </button>
      <dialog
        ref={ref}
        id="menu-mobile"
        aria-label={t.menuLabel}
        className="sheet"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="flex items-center justify-between border-b border-line px-[var(--gutter)] py-3">
          <p className="text-sm font-semibold text-ink-2">{t.menuLabel}</p>
          <button type="button" onClick={close} className="inline-flex size-11 items-center justify-center" aria-label={t.close}>
            <X aria-hidden="true" size={20} strokeWidth={1.75} />
          </button>
        </div>
        <ul className="px-[var(--gutter)] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
          {items.map((item) => (
            <li key={item.href} className="border-b border-line last:border-b-0">
              <Link href={item.href} onClick={close} className="flex min-h-14 items-baseline gap-3 py-3">
                {item.index ? <span className="tabular text-xs font-semibold text-signal-strong">{item.index}</span> : null}
                <span className="font-display text-[2rem] font-extrabold leading-none">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </dialog>
    </div>
  );
}
```

- [ ] **Step 7: CSS da folha.** Em `app/globals.css`, antes do bloco `@media (prefers-reduced-motion: reduce)` global:

```css
/* Menu mobile: folha que sobe do polegar. Entrada 280 ms, saída 180 ms. */
.sheet {
  position: fixed;
  inset: auto 0 0 0;
  margin: 0;
  width: 100%;
  max-width: none;
  max-height: 85dvh;
  padding: 0;
  border: 0;
  background: var(--color-bg);
  color: var(--color-ink);
  transform: translateY(100%);
  transition:
    transform 180ms var(--ease-in-quart),
    overlay 180ms allow-discrete,
    display 180ms allow-discrete;
}
.sheet[open] {
  transform: none;
  transition-duration: 280ms;
  transition-timing-function: var(--ease-out-expo);
}
@starting-style {
  .sheet[open] {
    transform: translateY(100%);
  }
}
.sheet::backdrop {
  background: color-mix(in oklch, var(--color-night) 55%, transparent);
}
html:has(.sheet[open]) {
  overflow: hidden;
}
```

  O bloco global de reduced-motion já zera `transition-duration` com `*`, e isso cobre `.sheet`.

- [ ] **Step 8: Header.** Em `components/site-header.tsx`:
  - importar `MobileMenu` e `menuItems`;
  - trocar as classes dos `<li>` do nav para `hidden md:block` em todos (apagar a propriedade `mobile` do array `links`);
  - antes do `<LangSwitch ... />`, inserir `<MobileMenu items={menuItems(locale, t, cases)} t={t.nav} />`.

- [ ] **Step 9:** `npm test && npm run lint && npm run build && npm run typecheck`, depois o servidor e `npm run qa`. Esperado: tudo verde, inclusive os 3 checks do menu.
- [ ] **Step 10: Commit**

```bash
git add lib/nav.ts test/nav.test.ts components content/dictionary.ts app/globals.css scripts/qa.mjs
git commit -m "Menu mobile em folha com dialog nativo"
```

---

### Task 7: Linha de status e hora de São Paulo no contato

Só o que já é fato público: aberto a oportunidades, CLT ou PJ, São Paulo, e a hora local. **Sem data de disponibilidade e sem CV** (pendências da Wiki).

**Files:**
- Modify: `lib/format.ts`, `test/format.test.ts`, `components/contact.tsx`, `content/dictionary.ts`, `scripts/qa.mjs`
- Create: `components/local-time.tsx`

**Interfaces:**
- Produz: `saoPauloTime(date: Date, locale: Locale): string`, no formato “HH:MM” de 24 h.
- Produz: `LocalTime({ locale, label }: { locale: Locale; label: string })`.

- [ ] **Step 1: Teste que falha.** Em `test/format.test.ts`, trocar o import por `import { fill, formatNumber, saoPauloTime } from "@/lib/format";` e acrescentar:

```ts
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
```

- [ ] **Step 2:** `npx vitest run test/format.test.ts`. Esperado: FAIL.
- [ ] **Step 3: Implementar em `lib/format.ts`**

```ts
/** Hora local de São Paulo, 24 h. Serve ao recrutador de outro fuso. */
export function saoPauloTime(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(htmlLang[locale], {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}
```

- [ ] **Step 4:** `npx vitest run test/format.test.ts`. Esperado: PASS.
- [ ] **Step 5: `components/local-time.tsx`**

```tsx
"use client";

import { useSyncExternalStore } from "react";
import { saoPauloTime } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 20_000);
  return () => window.clearInterval(id);
}

/**
 * A página é estática: no servidor a hora é null, e o HTML sai com “--:--”.
 * No cliente, useSyncExternalStore troca pela hora de São Paulo sem
 * divergência de hidratação e atualiza a cada 20 s.
 */
export function LocalTime({ locale, label }: { locale: Locale; label: string }) {
  const time = useSyncExternalStore(subscribe, () => saoPauloTime(new Date(), locale), () => null);
  return (
    <time aria-label={time ? `${label}: ${time}` : label} className="tabular">
      {time ?? "--:--"}
    </time>
  );
}
```

- [ ] **Step 6: Dicionário.** Em `contact`, pt: `status: "Aberto a oportunidades · CLT ou PJ", city: "São Paulo", timeLabel: "Hora em São Paulo",`. Em en: `status: "Open to opportunities · full-time or contract", city: "São Paulo", timeLabel: "Time in São Paulo",`.
- [ ] **Step 7: `components/contact.tsx`**
  - `Contact` passa a receber `locale`: `export function Contact({ t, locale }: { t: Dictionary; locale: Locale })`, com `import type { Locale } from "@/lib/i18n";` e `import { LocalTime } from "@/components/local-time";`.
  - Logo antes do `<h2 id="contato-title" ...>`, inserir:

```tsx
        <p className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold lg:mb-12">
          <span aria-hidden="true" className="inline-block size-2 rounded-full bg-ink" />
          <span>{contact.status}</span>
          <span aria-hidden="true">·</span>
          <span>
            {contact.city} <LocalTime locale={locale} label={contact.timeLabel} />
          </span>
        </p>
```

  - Atualizar os usos (`app/[locale]/page.tsx` e `app/[locale]/work/[slug]/page.tsx`): `<Contact t={t} locale={locale} />`. Se o `tsc` apontar outro uso (404), passar `locale` do mesmo jeito.

- [ ] **Step 8: QA.** Em `scripts/qa.mjs`:

```js
CHECKS.push({
  name: "hora de São Paulo aparece no contato sem erro de hidratação", path: "/pt", width: 1440, height: 900,
  run: async (p) => {
    const txt = await p.eval("document.querySelector('#contato time')?.textContent");
    if (!/^\d{2}:\d{2}$/.test(txt ?? "")) return `hora = ${txt}`;
    const hyd = p.consoleErrors.find((e) => /hydrat/i.test(e));
    return hyd ? `hidratação: ${hyd}` : null;
  },
});
```

- [ ] **Step 9:** `npm test && npm run lint && npm run build && npm run typecheck`, depois o servidor e `npm run qa`. Esperado: tudo verde.
- [ ] **Step 10: Commit**

```bash
git add lib/format.ts test/format.test.ts components content/dictionary.ts app scripts/qa.mjs
git commit -m "Status e hora de São Paulo no bloco de contato"
```

---

### Task 8: Mídia monocromática que ganha cor no centro da tela

As capturas de cliente entram em monocromático quente e ganham cor quando cruzam o centro da viewport (scroll-driven) ou no hover (ponteiro fino). **Regra de segurança:** o cinza só existe onde há um caminho garantido de volta à cor. Sem scroll-timeline e sem hover (touch no Firefox), a imagem fica colorida desde o início.

**Files:**
- Modify: `components/media-frame.tsx`, `app/globals.css`, `test/css.test.ts`

- [ ] **Step 1: Testes que falham.** Em `test/css.test.ts`:

```ts
describe("mídia monocromática", () => {
  it("todo grayscale está atrás de scroll-timeline ou de hover fino, nunca solto", () => {
    const text = css();
    const tint = text.slice(text.indexOf("/* Mídia monocromática"));
    expect(tint.length).toBeGreaterThan(40);
    const top = tint.split(/@supports|@media/)[0];
    expect(top).not.toMatch(/grayscale/);
  });
  it("sem suporte a scroll-timeline, o cinza só aparece com hover fino", () => {
    const block = css().split("@supports not (animation-timeline: view())")[1] ?? "";
    expect(block).toMatch(/@media \(hover: hover\) and \(pointer: fine\)/);
  });
});
```

- [ ] **Step 2:** `npx vitest run test/css.test.ts`. Esperado: FAIL.
- [ ] **Step 3: CSS.** Em `app/globals.css`, antes do `@media (prefers-reduced-motion: reduce)` global:

```css
/* Mídia monocromática: a captura do cliente não sequestra a paleta.
   A cor chega quando a imagem cruza o centro da tela ou recebe o ponteiro. */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .media-mono img {
      animation: media-tint linear both;
      animation-timeline: view();
      animation-range: cover 0% cover 100%;
    }
    @media (hover: hover) and (pointer: fine) {
      .media-mono:hover img {
        animation: none;
        filter: none;
      }
    }
  }
}
@supports not (animation-timeline: view()) {
  @media (hover: hover) and (pointer: fine) {
    .media-mono img {
      filter: grayscale(1) sepia(0.12);
      transition: filter 400ms var(--ease-out-quart);
    }
    .media-mono:hover img {
      filter: none;
    }
  }
}
@keyframes media-tint {
  0%,
  22% {
    filter: grayscale(1) sepia(0.12);
  }
  42%,
  62% {
    filter: none;
  }
  82%,
  100% {
    filter: grayscale(1) sepia(0.12);
  }
}
```

  O `@keyframes` fica no nível de topo. O teste confere que ele vem **depois** do primeiro `@supports`, então não conta como `grayscale` solto.

- [ ] **Step 4: `components/media-frame.tsx`.** No `<div>` que envolve a `<Image>`, acrescentar `media-mono` à lista de classes, logo depois de `reveal-clip`.
- [ ] **Step 5:** `npm test && npm run lint && npm run build`, depois o servidor, `npm run qa` e uma inspeção visual rápida em 1440 do capítulo Hold (a imagem no centro colorida, as outras em mono).
- [ ] **Step 6: Commit**

```bash
git add components/media-frame.tsx app/globals.css test/css.test.ts
git commit -m "Capturas em monocromático que ganham cor no centro da tela"
```

---

### Task 9: View Transitions no título do case

A tese (`hook`) do capítulo na home morfa para a tese no topo do case. O nome em “Próximo case” morfa para o `h1` do próximo case. Custo: 0 KB.

**Files:**
- Create: `lib/view-transition.ts`, `test/view-transition.test.ts`
- Modify: `components/home/chapter-parts.tsx`, `components/home/chapters.tsx`, `components/case/case-parts.tsx`, `app/globals.css`, `test/css.test.ts`

**Interfaces:**
- Produz: `vtName.hook(slug: CaseSlug): string` e `vtName.name(slug: CaseSlug): string`.
- Modifica: `ChapterTitle({ id, slug, children })`. `slug: CaseSlug` passa a ser obrigatório.

- [ ] **Step 1: Testes que falham.** Criar `test/view-transition.test.ts`:

```ts
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
```

Em `test/css.test.ts`:

```ts
describe("view transitions", () => {
  it("reduced-motion desliga as transições de página", () => {
    expect(css()).toMatch(/prefers-reduced-motion: reduce\)\s*\{[^}]*::view-transition-group\(\*\)/);
  });
});
```

- [ ] **Step 2:** `npx vitest run test/view-transition.test.ts test/css.test.ts`. Esperado: FAIL.
- [ ] **Step 3: `lib/view-transition.ts`**

```ts
import type { CaseSlug } from "@/lib/site";

/** Nomes compartilhados entre a home e o case: o mesmo nome morfa entre as páginas. */
export const vtName = {
  hook: (slug: CaseSlug) => `case-hook-${slug}`,
  name: (slug: CaseSlug) => `case-name-${slug}`,
};
```

- [ ] **Step 4: Componentes**
  - `components/home/chapter-parts.tsx`: importar `import { ViewTransition } from "react";`, `import { vtName } from "@/lib/view-transition";` e `import type { CaseSlug } from "@/lib/site";`, e trocar `ChapterTitle` por:

```tsx
export function ChapterTitle({ id, slug, children }: { id: string; slug: CaseSlug; children: React.ReactNode }) {
  return (
    <ViewTransition name={vtName.hook(slug)}>
      <h3 id={id} className="mt-6 max-w-[18ch] font-display text-3xl font-extrabold">
        {children}
      </h3>
    </ViewTransition>
  );
}
```

  - `components/home/chapters.tsx`: nos 4 usos, `<ChapterTitle id={`${c.slug}-title`} slug={c.slug}>`.
  - `components/case/case-parts.tsx`, com os mesmos imports de `ViewTransition` e `vtName`:
    - envolver o `<h1 ...>{c.name}</h1>` do `CaseHero` em `<ViewTransition name={vtName.name(c.slug)}>…</ViewTransition>`;
    - envolver o `<p ...>{c.hook}</p>` logo abaixo em `<ViewTransition name={vtName.hook(c.slug)}>…</ViewTransition>`;
    - no `NextCase`, envolver o `<span ...>{next.name}</span>` em `<ViewTransition name={vtName.name(next.slug)}>…</ViewTransition>`.

- [ ] **Step 5: CSS.** Em `app/globals.css`, antes do bloco global de reduced-motion:

```css
/* Transição de página: o título voa, o resto cruza em 200 ms. */
::view-transition-group(*) {
  animation-duration: 420ms;
  animation-timing-function: var(--ease-out-expo);
}
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 200ms;
}
```

  **Dentro** do `@media (prefers-reduced-motion: reduce) { ... }` global que já existe, logo no começo:

```css
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
```

- [ ] **Step 6:** `npm test && npm run lint && npm run build && npm run typecheck`, depois o servidor e `npm run qa`. Validação manual no Chrome: home → “Ler o case completo” do Hold. A tese voa até o topo do case. “Próximo case” → o nome vira o `h1`. Com reduced-motion emulado no DevTools, a troca é seca.
- [ ] **Step 7: Commit**

```bash
git add lib/view-transition.ts test app components
git commit -m "View Transitions: a tese do capítulo vira o título do case"
```

---

### Task 10: Verificação final, review e registro

- [ ] **Step 1:** `npm test && npm run lint && npm run build && npm run typecheck`. Todos verdes, com a saída colada no relatório.
- [ ] **Step 2:** `npx next start -p 3100` e `npm run qa`: `N/N checks ok`.
- [ ] **Step 3:** capturas headless em 1440×900 e 390×844 da home, com o menu aberto no mobile, para o Breq revisar.
- [ ] **Step 4: Review gate.** Revisão do diff inteiro `git diff c1458e7..HEAD`, excluindo `package-lock.json` (c1458e7 é o commit de restauração). Corrigir o que for apontado antes de seguir.
- [ ] **Step 5:** registrar na Wiki (`projects/portfolio/current-status.md` + sessão) o que entrou, a linha de base do axe e o que ficou pendente (CV, data de disponibilidade, troca da foto da Hold, conexão Vercel ↔ Git).
- [ ] **Step 6:** **pedir ok** ao Breq para `git push`. Sem deploy.
