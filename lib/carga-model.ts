/**
 * Modelo SIMPLIFICADO de viabilidade energética de uma rota de última milha.
 *
 * Escrito para esta página — não é o núcleo do Carga. O Carga completo usa
 * elevação real por trecho, massa que diminui a cada entrega, saúde de bateria
 * estimada por idade e quilometragem quando não há leitura de BMS, e aloca
 * moto↔rota pelo algoritmo húngaro. Aqui ficam os termos que explicam a
 * decisão: rolamento, arrasto, o custo de parar e retomar e o consumo de bordo.
 *
 * Mesma saída e mesmo vocabulário do produto: margem de carga na volta, contra
 * uma reserva de 15%, classificada em cabe · apertada · sem margem.
 * Temperatura fica de fora pelo mesmo motivo que no Carga: um controle que não
 * muda o resultado de verdade só cria a ilusão de que muda.
 */

export type RouteInput = {
  /** Entregas na rota. */
  stops: number;
  distanceKm: number;
  payloadKg: number;
  /** Saúde da bateria (State of Health), em %. */
  sohPct: number;
  /** Estado de carga na saída da base, em %. */
  startSocPct: number;
};

export type RouteState = "cabe" | "apertada" | "sem-margem";

export type EnergyBreakdown = {
  /** Rolamento + arrasto + anda-e-para do trânsito. */
  distanceKwh: number;
  /** Frear e retomar em cada entrega + bordo ligado durante o atendimento. */
  stopsKwh: number;
  /** Painel, luzes e eletrônica enquanto roda. */
  onboardKwh: number;
  totalKwh: number;
};

export type TracePoint = { km: number; socPct: number };

export type Assessment = {
  input: RouteInput;
  energy: EnergyBreakdown;
  /** Capacidade útil da bateria (nominal × saúde). */
  capacityKwh: number;
  /** Estado de carga esperado na volta à base, em %. */
  endSocPct: number;
  /** Pontos percentuais acima da reserva na volta (negativo = abaixo). */
  marginPp: number;
  state: RouteState;
  whPerKm: number;
  /** Km em que a curva cruza a reserva, se cruzar. */
  reserveCrossKm: number | null;
  /** Entregas concluídas antes de cruzar a reserva, se cruzar. */
  stopsBeforeReserve: number | null;
  trace: TracePoint[];
};

/** Scooter elétrica de entrega — parâmetros de literatura pública e fabricante. */
export const VEHICLE = {
  nominalKwh: 3.5,
  massKg: 110,
  riderKg: 75,
  rollingResistance: 0.022,
  dragCoefficient: 0.9,
  frontalAreaM2: 0.9,
  powertrainEfficiency: 0.85,
  regenEfficiency: 0.45,
  auxW: 100,
} as const;

export const ROUTE = {
  cruiseSpeedMps: 7,
  averageSpeedKmh: 22,
  trafficStopsPerKm: 1,
  serviceTimeS: 105,
  reservePct: 15,
  /** Abaixo desta margem a rota é "apertada" — convenção da interface do Carga. */
  tightMarginPp: 10,
  airDensityKgM3: 1.2,
} as const;

export const LIMITS = {
  stops: { min: 10, max: 130, step: 1 },
  distanceKm: { min: 10, max: 90, step: 1 },
  payloadKg: { min: 0, max: 40, step: 1 },
  sohPct: { min: 70, max: 100, step: 1 },
  startSocPct: { min: 30, max: 100, step: 1 },
} as const satisfies Record<keyof RouteInput, { min: number; max: number; step: number }>;

/** Rota de 37 paradas e 59 km, saindo com uma moto a 90% e saúde de 70%. */
export const DEFAULT_ROUTE: RouteInput = {
  stops: 37,
  distanceKm: 59,
  payloadKg: 20,
  sohPct: 70,
  startSocPct: 90,
};

/** A mesma rota, três motos diferentes: a tese do Carga em três cliques. */
export const PRESETS = {
  arrival: { ...DEFAULT_ROUTE, startSocPct: 44 },
  current: DEFAULT_ROUTE,
  healthy: { ...DEFAULT_ROUTE, sohPct: 96 },
} as const satisfies Record<string, RouteInput>;

const GRAVITY = 9.81;
const J_PER_KWH = 3.6e6;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function normalize(input: RouteInput): RouteInput {
  const out = {} as RouteInput;
  for (const key of Object.keys(LIMITS) as (keyof RouteInput)[]) {
    const value = Number.isFinite(input[key]) ? input[key] : DEFAULT_ROUTE[key];
    out[key] = clamp(value, LIMITS[key].min, LIMITS[key].max);
  }
  return out;
}

export function capacityKwh(sohPct: number): number {
  return VEHICLE.nominalKwh * (sohPct / 100);
}

/** Energia para frear e retomar a velocidade de cruzeiro uma vez. */
function stopGoKwh(massKg: number): number {
  const kineticJ = 0.5 * massKg * ROUTE.cruiseSpeedMps ** 2;
  const regainJ = kineticJ / VEHICLE.powertrainEfficiency - kineticJ * VEHICLE.regenEfficiency;
  return regainJ / J_PER_KWH;
}

function perKmKwh(massKg: number): number {
  const rollingN = VEHICLE.rollingResistance * massKg * GRAVITY;
  const aeroN =
    0.5 * ROUTE.airDensityKgM3 * VEHICLE.dragCoefficient * VEHICLE.frontalAreaM2 * ROUTE.cruiseSpeedMps ** 2;
  const tractionKwh = ((rollingN + aeroN) * 1000) / VEHICLE.powertrainEfficiency / J_PER_KWH;
  return tractionKwh + ROUTE.trafficStopsPerKm * stopGoKwh(massKg);
}

function perStopKwh(massKg: number): number {
  return stopGoKwh(massKg) + (VEHICLE.auxW * ROUTE.serviceTimeS) / J_PER_KWH;
}

const ONBOARD_PER_KM_KWH = VEHICLE.auxW / 1000 / ROUTE.averageSpeedKmh;

export function energy(raw: RouteInput): EnergyBreakdown {
  const input = normalize(raw);
  const mass = VEHICLE.massKg + VEHICLE.riderKg + input.payloadKg;
  const distanceKwh = perKmKwh(mass) * input.distanceKm;
  const stopsKwh = perStopKwh(mass) * input.stops;
  const onboardKwh = ONBOARD_PER_KM_KWH * input.distanceKm;
  return { distanceKwh, stopsKwh, onboardKwh, totalKwh: distanceKwh + stopsKwh + onboardKwh };
}

export function stateFor(marginPp: number): RouteState {
  if (marginPp < 0) return "sem-margem";
  if (marginPp < ROUTE.tightMarginPp) return "apertada";
  return "cabe";
}

export function assess(raw: RouteInput): Assessment {
  const input = normalize(raw);
  const breakdown = energy(input);
  const capacity = capacityKwh(input.sohPct);
  const start = capacity * (input.startSocPct / 100);
  const toPct = (usedKwh: number) => ((start - usedKwh) / capacity) * 100;

  const mass = VEHICLE.massKg + VEHICLE.riderKg + input.payloadKg;
  const driveKwhPerKm = perKmKwh(mass) + ONBOARD_PER_KM_KWH;
  const stopKwh = perStopKwh(mass);

  // Curva de carga: desce com a distância e dá um degrau a cada entrega.
  // Entregas distribuídas uniformemente ao longo da rota.
  const trace: TracePoint[] = [];
  const spacing = input.distanceKm / (input.stops + 1);
  let used = 0;
  let reserveCrossKm: number | null = null;
  let stopsBeforeReserve: number | null = null;

  const push = (km: number, stopsDone: number) => {
    const socPct = toPct(used);
    const prev = trace[trace.length - 1];
    if (reserveCrossKm === null && prev && prev.socPct >= ROUTE.reservePct && socPct < ROUTE.reservePct) {
      const span = prev.socPct - socPct;
      reserveCrossKm = km > prev.km ? prev.km + ((prev.socPct - ROUTE.reservePct) / span) * (km - prev.km) : km;
      stopsBeforeReserve = stopsDone;
    }
    trace.push({ km, socPct });
  };

  push(0, 0);
  for (let i = 1; i <= input.stops; i++) {
    used += driveKwhPerKm * spacing;
    push(i * spacing, i - 1);
    used += stopKwh;
    push(i * spacing, i - 1);
  }
  used += driveKwhPerKm * spacing;
  push(input.distanceKm, input.stops);

  const endSocPct = toPct(breakdown.totalKwh);
  const marginPp = endSocPct - ROUTE.reservePct;

  return {
    input,
    energy: breakdown,
    capacityKwh: capacity,
    endSocPct,
    marginPp,
    state: stateFor(marginPp),
    whPerKm: (breakdown.totalKwh * 1000) / input.distanceKm,
    reserveCrossKm,
    stopsBeforeReserve,
    trace,
  };
}
