import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

const INK = "#1b1412";
const INK_2 = "#59514d";
const PAPER = "#f9f6f5";
const SIGNAL = "#dd5403";
const PLATE = "#030302";

async function loadAssets() {
  const root = process.cwd();
  const [display, sans, portrait] = await Promise.all([
    readFile(join(root, "assets/fonts/SofiaSansExtraCondensed-800.woff")),
    readFile(join(root, "assets/fonts/SofiaSans-500.woff")),
    readFile(join(root, "assets/og-portrait.jpg")),
  ]);
  return { display, sans, portrait: `data:image/jpeg;base64,${portrait.toString("base64")}` };
}

type OgInput = {
  kicker: string;
  lines: { text: string; accent?: boolean }[];
  size?: number;
  footer: string;
};

/** A mesma composição da Hero: papel à esquerda, placa com o retrato à direita. */
export async function renderOg({ kicker, lines, size = 148, footer }: OgInput) {
  const { display, sans, portrait } = await loadAssets();
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: PAPER, color: INK }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 780,
            padding: "56px 40px 52px 64px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "Sofia", fontSize: 26 }}>
            {kicker}
            <div style={{ width: 10, height: 10, background: SIGNAL }} />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: "SofiaXC",
              fontSize: size,
              lineHeight: 0.88,
              textTransform: "uppercase",
            }}
          >
            {lines.map((line) => (
              <span key={line.text} style={{ color: line.accent ? SIGNAL : INK }}>
                {line.text}
              </span>
            ))}
          </div>
          <div style={{ fontFamily: "Sofia", fontSize: 26, color: INK_2 }}>{footer}</div>
        </div>
        <div style={{ display: "flex", flex: 1, background: PLATE, alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (Satori) só aceita <img> */}
          <img src={portrait} width={420} height={420} alt="" style={{ objectFit: "cover" }} />
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "SofiaXC", data: display, weight: 800, style: "normal" },
        { name: "Sofia", data: sans, weight: 500, style: "normal" },
      ],
    },
  );
}
