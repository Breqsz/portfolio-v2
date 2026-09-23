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

  // Aquecimento: a primeira visita com Chrome e servidor frios pega animações no meio.
  await send("Page.navigate", { url: BASE + "/pt" });
  await sleep(2500);

  const failures = [];
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
    console.log(`${msg ? "FAIL" : "ok  "}  ${c.name}${msg ? " — " + msg : ""}`);
    if (msg) failures.push(c.name);
  }
  ws.close();
  chrome.kill();
  console.log(`\n${CHECKS.length - failures.length}/${CHECKS.length} checks ok`);
  process.exit(failures.length ? 1 : 0);
}

main().catch((err) => { console.error(err); process.exit(1); });
