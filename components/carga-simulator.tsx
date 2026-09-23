"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Dictionary } from "@/content/dictionary";
import {
  DEFAULT_ROUTE,
  LIMITS,
  PRESETS,
  ROUTE,
  assess,
  type Assessment,
  type RouteInput,
  type RouteState,
} from "@/lib/carga-model";
import { fill, formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

type Key = keyof RouteInput;
type T = Dictionary["simulator"];

const GROUPS: { id: keyof T["groups"]; keys: Key[] }[] = [
  { id: "route", keys: ["stops", "distanceKm", "payloadKg"] },
  { id: "bike", keys: ["startSocPct", "sohPct"] },
];
const PRESET_KEYS = ["arrival", "current", "healthy"] as const;

const STATE_TEXT: Record<RouteState, string> = {
  cabe: "text-state-cabe",
  apertada: "text-state-apertada",
  "sem-margem": "text-state-sem-margem",
};
const STATE_FILL: Record<RouteState, string> = {
  cabe: "fill-state-cabe",
  apertada: "fill-state-apertada",
  "sem-margem": "fill-state-sem-margem",
};

const sameRoute = (a: RouteInput, b: RouteInput) => (Object.keys(LIMITS) as Key[]).every((k) => a[k] === b[k]);

type Props = { locale: Locale; t: T; headingLevel?: 3 | 4 };

/**
 * A tese do Carga em miniatura: a mesma rota, motos diferentes. A resposta é
 * imediata (manipulação direta dispensa animação); o leitor de tela recebe o
 * resultado quando o controle para de mexer.
 */
export function CargaSimulator({ locale, t, headingLevel = 4 }: Props) {
  const [input, setInput] = useState<RouteInput>(DEFAULT_ROUTE);
  const a = useMemo(() => assess(input), [input]);
  const uid = useId();
  const num = (v: number, digits = 0) => formatNumber(locale, v, digits);
  const activePreset = PRESET_KEYS.find((k) => sameRoute(PRESETS[k], input));
  const Heading = `h${headingLevel}` as "h3" | "h4";

  const summary = `${t.states[a.state]}. ${t.returns} ${num(a.endSocPct)}%.`;
  const [announcement, setAnnouncement] = useState("");
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const id = window.setTimeout(() => setAnnouncement(summary), 450);
    return () => window.clearTimeout(id);
  }, [summary]);

  const update = (key: Key, value: number) => setInput((prev) => ({ ...prev, [key]: value }));
  const crossing =
    a.reserveCrossKm !== null && a.stopsBeforeReserve !== null
      ? fill(t.crosses, { n: a.stopsBeforeReserve, km: num(a.reserveCrossKm) })
      : t.clear;

  return (
    <div className="border border-night-line bg-night-2">
      <div className="border-b border-night-line px-5 py-3.5 sm:px-7">
        <p className="text-xs text-on-night-2">{t.label}</p>
      </div>

      <div className="px-5 py-7 sm:px-7 sm:py-8">
        <Heading className="text-xl font-semibold tracking-[-0.01em]">{t.title}</Heading>
        <p className="mt-3 max-w-[54ch] text-sm leading-relaxed text-on-night-2">{t.intro}</p>

        <fieldset className="mt-7">
          <legend className="text-xs font-semibold text-on-night-2">{t.presetsLabel}</legend>
          <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
            {PRESET_KEYS.map((key) => {
              const pressed = activePreset === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => setInput(PRESETS[key])}
                  className={`min-h-14 border px-3.5 py-2.5 text-left transition-[border-color,background-color] duration-150 active:scale-[0.99] ${
                    pressed
                      ? "border-signal bg-signal/12"
                      : "border-night-line hover:border-on-night-2"
                  }`}
                >
                  <span className="block text-sm font-semibold">{t.presets[key].name}</span>
                  <span className="tabular mt-0.5 block text-xs text-on-night-2">{t.presets[key].detail}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-9 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div>
            <p className={`inline-flex items-center gap-2 text-sm font-semibold ${STATE_TEXT[a.state]}`}>
              <StateIcon state={a.state} />
              {t.states[a.state]}
            </p>
            <p className="mt-2 flex items-baseline gap-3">
              <span className="text-sm text-on-night-2">{t.returns}</span>
              <span className="tabular font-display text-[3.5rem] font-extrabold leading-[0.85]">{num(a.endSocPct)}%</span>
            </p>
          </div>
          <div className="max-w-[30ch] space-y-1 text-sm text-on-night-2 sm:text-right">
            <p>{fill(a.marginPp >= 0 ? t.above : t.below, { n: num(Math.abs(a.marginPp)) })}</p>
            <p>{crossing}</p>
          </div>
        </div>

        <SocChart a={a} t={t} locale={locale} />

        <div className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2">
          {GROUPS.map((group) => (
            <fieldset key={group.id}>
              <legend className="text-xs font-semibold text-on-night-2">{t.groups[group.id]}</legend>
              <div className="mt-2 space-y-1">
                {group.keys.map((key) => (
                  <Slider
                    key={key}
                    id={`${uid}-${key}`}
                    label={t.controls[key]}
                    unit={t.units[key]}
                    value={input[key]}
                    limits={LIMITS[key]}
                    onChange={(value) => update(key, value)}
                  />
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <p className="tabular mt-6 text-xs text-on-night-2">
          {fill(t.consumption, { wh: num(a.whPerKm, 1), kwh: num(a.energy.totalKwh, 2) })}
        </p>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3 border-t border-night-line px-5 py-4 sm:px-7">
        <p className="max-w-[72ch] text-xs leading-relaxed text-on-night-2">{t.note}</p>
        <button
          type="button"
          onClick={() => setInput(DEFAULT_ROUTE)}
          disabled={sameRoute(input, DEFAULT_ROUTE)}
          className="link-underline min-h-11 text-xs font-semibold disabled:cursor-default disabled:opacity-40 disabled:no-underline"
        >
          {t.reset}
        </button>
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

type SliderProps = {
  id: string;
  label: string;
  unit: string;
  value: number;
  limits: { min: number; max: number; step: number };
  onChange: (value: number) => void;
};

function Slider({ id, label, unit, value, limits, onChange }: SliderProps) {
  const fillPct = ((value - limits.min) / (limits.max - limits.min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 pt-2">
        <label htmlFor={id} className="text-sm">
          {label}
        </label>
        <output htmlFor={id} className="tabular text-sm font-semibold">
          {value}
          {unit}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={limits.min}
        max={limits.max}
        step={limits.step}
        value={value}
        aria-valuetext={`${value}${unit}`}
        onChange={(event) => onChange(Number(event.target.value))}
        className="range"
        style={{ "--fill": `${fillPct}%` } as React.CSSProperties}
      />
    </div>
  );
}

function StateIcon({ state }: { state: RouteState }) {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14">
      <circle cx="7" cy="7" r="5.5" fill={state === "cabe" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" />
      {state === "apertada" ? <path d="M7 1.5a5.5 5.5 0 0 1 0 11z" fill="currentColor" /> : null}
    </svg>
  );
}

function useWidth(initial: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width;
      if (next) setWidth(Math.round(next));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Curva de carga ao longo da rota, desenhada em pixels reais para o texto não encolher no celular. */
function SocChart({ a, t, locale }: { a: Assessment; t: T; locale: Locale }) {
  const [ref, width] = useWidth(640);
  const ids = useId();
  const height = width < 480 ? 200 : 240;
  const pad = { l: 40, r: 12, t: 16, b: 30 };
  const innerW = Math.max(1, width - pad.l - pad.r);
  const innerH = height - pad.t - pad.b;
  const distance = a.input.distanceKm;
  const x = (km: number) => pad.l + (km / distance) * innerW;
  const y = (soc: number) => pad.t + (1 - Math.max(0, Math.min(100, soc)) / 100) * innerH;

  const line = a.trace.map((p, i) => `${i ? "L" : "M"}${x(p.km).toFixed(1)} ${y(p.socPct).toFixed(1)}`).join(" ");
  const area = `${line} L${x(distance).toFixed(1)} ${y(0)} L${x(0)} ${y(0)} Z`;
  const reserveY = y(ROUTE.reservePct);
  const last = a.trace[a.trace.length - 1];
  const num = (v: number) => formatNumber(locale, v, 0);
  const label = fill(t.chartLabel, { start: num(a.input.startSocPct), end: num(a.endSocPct) });

  return (
    // O tamanho vem do CSS desde o HTML do servidor: os 640 px iniciais alargavam o layout
    // viewport do celular até a medição. A altura segue o mesmo limiar de 480 px do JS.
    <div ref={ref} className="@container mt-6 w-full">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} className="block h-50 w-full text-on-night @min-[480px]:h-60">
        <defs>
          <clipPath id={`${ids}above`}>
            <rect x="0" y="0" width={width} height={reserveY} />
          </clipPath>
          <clipPath id={`${ids}below`}>
            <rect x="0" y={reserveY} width={width} height={height - reserveY} />
          </clipPath>
          <linearGradient id={`${ids}fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.14" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={width - pad.r} y1={y(v)} y2={y(v)} className="stroke-night-line" strokeWidth="1" />
            <text x={pad.l - 8} y={y(v)} dy="0.32em" textAnchor="end" className="tabular fill-on-night-2 text-[11px]">
              {v}%
            </text>
          </g>
        ))}

        <path d={area} fill={`url(#${ids}fill)`} clipPath={`url(#${ids}above)`} />
        <line x1={pad.l} x2={width - pad.r} y1={reserveY} y2={reserveY} className="stroke-signal" strokeWidth="1.25" strokeDasharray="4 5" />
        {/* À esquerda: ali a curva ainda está alta, então o rótulo nunca colide com ela. */}
        <text x={pad.l + 6} y={reserveY - 7} className="fill-signal text-[11px] font-semibold">
          {t.reserve} {ROUTE.reservePct}%
        </text>

        {/* Um traço por entrega, sob o eixo: o "degrau" de cada parada fica visível mesmo quando a curva parece reta. */}
        <g className="stroke-on-night-2" strokeWidth="1" opacity="0.55">
          {Array.from({ length: a.input.stops }, (_, i) => {
            const km = ((i + 1) * distance) / (a.input.stops + 1);
            return <line key={i} x1={x(km)} x2={x(km)} y1={y(0) + 3} y2={y(0) + 8} />;
          })}
        </g>

        <path d={line} fill="none" className="stroke-on-night" strokeWidth="2" strokeLinejoin="round" clipPath={`url(#${ids}above)`} />
        <path d={line} fill="none" className="stroke-state-sem-margem" strokeWidth="2" strokeLinejoin="round" clipPath={`url(#${ids}below)`} />

        {a.reserveCrossKm !== null ? (
          <g>
            <circle cx={x(a.reserveCrossKm)} cy={reserveY} r="9" fill="none" className="pulse-ring stroke-signal" strokeWidth="1.5" />
            <circle cx={x(a.reserveCrossKm)} cy={reserveY} r="4" className="fill-signal" />
          </g>
        ) : null}
        <circle cx={x(last.km)} cy={y(last.socPct)} r="4.5" className={STATE_FILL[a.state]} />

        {[0, distance / 2, distance].map((km, i) => (
          <text
            key={i}
            x={x(km)}
            y={height - 8}
            textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"}
            className="tabular fill-on-night-2 text-[11px]"
          >
            {num(km)} {t.km}
          </text>
        ))}
      </svg>
    </div>
  );
}
