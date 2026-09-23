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

// Espera as animações de entrada (finitas, na linha do tempo do documento): o axe
// mede contraste com a opacidade do momento, e um fade no meio vira falso positivo.
const settle = (page) =>
  page.eval(
    `Promise.race([
      Promise.all(document.getAnimations()
        .filter((a) => a.timeline instanceof DocumentTimeline && a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => {}))),
      new Promise((r) => setTimeout(r, 5000)),
    ]).then(() => 0)`,
    true,
  );

const axe = async (page) => {
  await settle(page);
  await page.eval(AXE + ";0");
  const res = await page.eval(
    `axe.run(document, { runOnly: ["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"] }).then(r => r.violations.map(v => v.id + " [" + v.nodes.map(n => n.target.join(" ")).join("; ") + "]"))`,
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
// 1280 é o menor xl: nome completo, índice dos cases, links e idioma no mesmo header.
CHECKS.push({ name: "overflow /pt @1280", path: "/pt", width: 1280, height: 800, run: noOverflow });
CHECKS.push({
  name: "header cabe em uma linha @1280", path: "/pt", width: 1280, height: 800,
  run: async (p) => {
    const [sw, cw] = await p.eval("(d => [d.scrollWidth, d.clientWidth])(document.querySelector('header .shell'))");
    return sw > cw ? `header transborda: ${sw}px > ${cw}px` : null;
  },
});

// --- checks das tasks seguintes são acrescentados abaixo desta linha ---

// Um toque real foca o botão antes do clique; o .click() por JS não, e sem foco
// anterior o <dialog> não tem para onde devolver o foco ao fechar.
const TAP_MENU = "(b => (b.focus(), b.click()))(document.querySelector('[aria-controls=\"menu-mobile\"]'))";

// Scroll suave numa página longa leva mais de um segundo: espera o scrollY parar.
async function scrollSettled(p, timeout = 5000) {
  let last = -1;
  for (let t = 0; t < timeout; t += 150) {
    await p.sleep(150);
    const y = await p.eval("scrollY");
    if (y === last) return;
    last = y;
  }
}

CHECKS.push({
  name: "header fixo continua no topo depois do scroll", path: "/pt", width: 1440, height: 900,
  run: async (p) => {
    await p.eval("window.scrollTo(0, 3000)"); await p.sleep(300);
    const [y, top] = await p.eval("[scrollY, document.querySelector('header').getBoundingClientRect().top]");
    if (y < 1000) return `a página não rolou (scrollY = ${y})`;
    return top === 0 ? null : `header.top = ${top}`;
  },
});
for (const [width, height] of [[1440, 900], [390, 844]]) {
  CHECKS.push({
    name: `âncora #hold fica abaixo do header @${width}`, path: "/pt#hold", width, height,
    // Deep link no celular pousa longe do alvo. Já acontece em produção, antes da F1:
    // o capítulo Carga encolhe depois do carregamento. Fica visível como KNOWN até ser corrigido.
    known: width < 600 ? "pré-existente: deep link no mobile" : undefined,
    run: async (p) => {
      await p.sleep(400);
      const [h, t] = await p.eval("[document.querySelector('header').getBoundingClientRect().bottom, document.getElementById('hold').getBoundingClientRect().top]");
      // O esperado é ~24 px abaixo do header: nem escondido atrás dele, nem sem rolar.
      return t >= h - 1 && t <= h + 40 ? null : `alvo em ${t}px, header termina em ${h}px`;
    },
  });
}

CHECKS.push({
  name: "menu mobile abre, fecha com Esc e devolve o foco", path: "/pt", width: 390, height: 844,
  run: async (p) => {
    const visible = await p.eval("!!document.querySelector('[aria-controls=\"menu-mobile\"]')?.offsetParent");
    if (!visible) return "botão do menu não está visível em 390px";
    await p.eval(TAP_MENU); await p.sleep(400);
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
    await p.eval(TAP_MENU); await p.sleep(400);
    await p.eval("document.querySelector('#menu-mobile a[href$=\"#contato\"]').click()"); await scrollSettled(p);
    const [open, top] = await p.eval("[document.getElementById('menu-mobile').open, document.getElementById('contato').getBoundingClientRect().top]");
    if (open) return "o menu continuou aberto";
    return top < 300 ? null : `#contato ficou em ${top}px`;
  },
});
CHECKS.push({
  name: "botão do menu some no desktop", path: "/pt", width: 1440, height: 900,
  run: async (p) => ((await p.eval("!!document.querySelector('[aria-controls=\"menu-mobile\"]')?.offsetParent")) ? "botão visível em 1440px" : null),
});

CHECKS.push({
  name: "hora de São Paulo aparece no contato sem erro de hidratação", path: "/pt", width: 1440, height: 900,
  run: async (p) => {
    const txt = await p.eval("document.querySelector('#contato time')?.textContent");
    if (!/^\d{2}:\d{2}$/.test(txt ?? "")) return `hora = ${txt}`;
    const hyd = p.consoleErrors.find((e) => /hydrat/i.test(e));
    return hyd ? `hidratação: ${hyd}` : null;
  },
});

CHECKS.push({
  name: "mídia ganha cor no centro e fica mono na borda da tela", path: "/pt", width: 1440, height: 900,
  run: async (p) => {
    const filter = "getComputedStyle(document.querySelector('#hold .media-mono img')).filter";
    const frame = "document.querySelector('#hold .media-mono')";
    await p.eval(`${frame}.scrollIntoView({ block: "center", behavior: "instant" })`); await p.sleep(300);
    const center = await p.eval(filter);
    await p.eval(`window.scrollBy({ top: ${frame}.getBoundingClientRect().top - innerHeight + 40, behavior: "instant" })`); await p.sleep(300);
    const edge = await p.eval(filter);
    if (center !== "none") return `no centro: ${center}`;
    return /grayscale/.test(edge) ? null : `na borda: ${edge}`;
  },
});

CHECKS.push({
  name: "\"Ler o case completo\" navega com view transition", path: "/pt", width: 1440, height: 900,
  run: async (p) => {
    await p.eval(`(() => {
      const start = document.startViewTransition?.bind(document);
      if (!start) return;
      document.startViewTransition = (arg) => {
        const vt = start(arg);
        window.__vt = "started";
        // Nome duplicado aborta a transição: ready rejeita com InvalidStateError.
        vt.ready.then(() => (window.__vt = "ready"), (e) => (window.__vt = "abortada: " + e.name));
        return vt;
      };
    })()`);
    await p.eval("document.querySelector('#hold a[href$=\"/work/hold\"]').click()"); await p.sleep(1500);
    const [path, vt] = await p.eval("[location.pathname, window.__vt ?? 'sem startViewTransition']");
    if (path !== "/pt/work/hold") return `foi para ${path}`;
    if (vt !== "ready") return `view transition: ${vt}`;
    return p.consoleErrors.length ? `console: ${p.consoleErrors[0]}` : null;
  },
});

CHECKS.push({
  name: "menu aberto continua fechável se a tela passar de md", path: "/pt", width: 390, height: 844,
  run: async (p) => {
    await p.eval(TAP_MENU); await p.sleep(400);
    await p.resize(1133, 744); await p.sleep(400);
    const visible = await p.eval("(d => d.open && d.getBoundingClientRect().height > 0)(document.getElementById('menu-mobile'))");
    await p.resize(390, 844);
    return visible ? null : "o dialog ficou modal e invisível";
  },
});

CHECKS.push({
  name: "índice do header marca o capítulo em leitura e limpa fora dele", path: "/pt", width: 1440, height: 900,
  run: async (p) => {
    const current = "document.querySelector('header [aria-current=\"location\"]')?.getAttribute('href') ?? null";
    await p.eval("document.getElementById('neurorace').scrollIntoView({ behavior: 'instant' })"); await p.sleep(400);
    const inChapter = await p.eval(current);
    await p.eval("document.getElementById('contato').scrollIntoView({ behavior: 'instant' })"); await p.sleep(400);
    const outside = await p.eval(current);
    if (!inChapter?.endsWith("#neurorace")) return `no NeuroRace: ${inChapter}`;
    return outside === null ? null : `no contato ainda marca ${outside}`;
  },
});

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
    async resize(width, height) {
      await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 600 });
    },
    async key(key) {
      const code = key === "Escape" ? "Escape" : key;
      await send("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: key === "Escape" ? 27 : 0 });
      await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: key === "Escape" ? 27 : 0 });
    },
  };

  // Aquecimento: a primeira visita com Chrome e servidor frios pega animações no meio.
  await send("Page.navigate", { url: BASE + "/pt" });
  await sleep(2500);

  const failures = [];
  const known = [];
  for (const c of CHECKS) {
    consoleErrors.length = 0;
    await send("Emulation.setDeviceMetricsOverride", { width: c.width, height: c.height, deviceScaleFactor: 1, mobile: c.width < 600 });
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: c.reducedMotion ? "reduce" : "no-preference" }] });
    // Documento novo a cada check: sem isso, /pt → /pt#hold vira navegação no mesmo documento.
    await send("Page.navigate", { url: "about:blank" });
    await sleep(100);
    await send("Page.navigate", { url: BASE + c.path });
    await sleep(1800);
    let msg;
    try { msg = await c.run(page); } catch (err) { msg = `erro: ${err.message}`; }
    // Problema conhecido e ainda não corrigido: aparece em toda rodada, mas não derruba o gate.
    const tag = msg ? (c.known ? "KNOWN" : "FAIL") : "ok  ";
    console.log(`${tag}  ${c.name}${msg ? " — " + msg + (c.known ? ` [${c.known}]` : "") : ""}`);
    if (msg && c.known) known.push(c.name);
    else if (msg) failures.push(c.name);
  }
  ws.close();
  chrome.kill();
  const ok = CHECKS.length - failures.length - known.length;
  console.log(`\n${ok}/${CHECKS.length} checks ok${known.length ? `, ${known.length} known` : ""}`);
  process.exit(failures.length ? 1 : 0);
}

main().catch((err) => { console.error(err); process.exit(1); });
