import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_ROUTE,
  LIMITS,
  PRESETS,
  ROUTE,
  VEHICLE,
  assess,
  energy,
  stateFor,
  type RouteInput,
} from "@/lib/carga-model";

const within = (key: keyof RouteInput) => fc.integer({ min: LIMITS[key].min, max: LIMITS[key].max });
const route = fc.record({
  stops: within("stops"),
  distanceKm: within("distanceKm"),
  payloadKg: within("payloadKg"),
  sohPct: within("sohPct"),
  startSocPct: within("startSocPct"),
});

const grow = (key: keyof RouteInput) => (r: RouteInput, by: number) => ({
  ...r,
  [key]: Math.min(r[key] + by, LIMITS[key].max),
});

describe("gate de realidade", () => {
  // As mesmas faixas que o Carga fixou antes de implementar o próprio modelo.
  it("uma rota urbana típica consome entre 25 e 45 Wh/km", () => {
    expect(assess(DEFAULT_ROUTE).whPerKm).toBeGreaterThan(25);
    expect(assess(DEFAULT_ROUTE).whPerKm).toBeLessThan(45);
  });

  it("a autonomia de bateria nova fica entre 80 e 120 km", () => {
    const autonomyKm = VEHICLE.nominalKwh / (assess(DEFAULT_ROUTE).whPerKm / 1000);
    expect(autonomyKm).toBeGreaterThan(80);
    expect(autonomyKm).toBeLessThan(120);
  });
});

describe("energia da rota", () => {
  it.each(["stops", "distanceKm", "payloadKg"] as const)("mais %s nunca custa menos energia", (key) => {
    fc.assert(
      fc.property(route, fc.integer({ min: 1, max: 30 }), (r, by) => {
        expect(energy(grow(key)(r, by)).totalKwh).toBeGreaterThanOrEqual(energy(r).totalKwh);
      }),
    );
  });

  it("as três parcelas somam o total", () => {
    fc.assert(
      fc.property(route, (r) => {
        const e = energy(r);
        expect(e.distanceKwh + e.stopsKwh + e.onboardKwh).toBeCloseTo(e.totalKwh, 12);
      }),
    );
  });

  it("saúde e carga de saída não mudam o consumo, só o que há para gastar", () => {
    fc.assert(
      fc.property(route, (r) => {
        const base = energy(r).totalKwh;
        expect(energy({ ...r, sohPct: LIMITS.sohPct.max }).totalKwh).toBe(base);
        expect(energy({ ...r, startSocPct: LIMITS.startSocPct.min }).totalKwh).toBe(base);
      }),
    );
  });
});

describe("margem na volta", () => {
  it("o estado segue a margem, com as fronteiras do Carga", () => {
    expect(stateFor(-0.1)).toBe("sem-margem");
    expect(stateFor(0)).toBe("apertada");
    expect(stateFor(9.99)).toBe("apertada");
    expect(stateFor(ROUTE.tightMarginPp)).toBe("cabe");
    fc.assert(
      fc.property(route, (r) => {
        const a = assess(r);
        expect(a.state).toBe(stateFor(a.marginPp));
        expect(a.marginPp).toBeCloseTo(a.endSocPct - ROUTE.reservePct, 9);
      }),
    );
  });

  it.each(["sohPct", "startSocPct"] as const)("mais %s nunca diminui a margem", (key) => {
    fc.assert(
      fc.property(route, fc.integer({ min: 1, max: 30 }), (r, by) => {
        expect(assess(grow(key)(r, by)).marginPp).toBeGreaterThanOrEqual(assess(r).marginPp - 1e-9);
      }),
    );
  });

  it("a curva sai da carga de saída, nunca sobe e termina na carga de volta", () => {
    fc.assert(
      fc.property(route, (r) => {
        const a = assess(r);
        const first = a.trace[0];
        const last = a.trace[a.trace.length - 1];
        expect(first.km).toBe(0);
        expect(first.socPct).toBeCloseTo(a.input.startSocPct, 9);
        expect(last.km).toBeCloseTo(a.input.distanceKm, 9);
        expect(last.socPct).toBeCloseTo(a.endSocPct, 6);
        for (let i = 1; i < a.trace.length; i++) {
          expect(a.trace[i].socPct).toBeLessThanOrEqual(a.trace[i - 1].socPct + 1e-9);
          expect(a.trace[i].km).toBeGreaterThanOrEqual(a.trace[i - 1].km);
        }
      }),
    );
  });

  it("marca o cruzamento da reserva exatamente quando a rota fica sem margem", () => {
    fc.assert(
      fc.property(route, (r) => {
        const a = assess(r);
        const crossesDuringRoute = a.input.startSocPct >= ROUTE.reservePct && a.state === "sem-margem";
        expect(a.reserveCrossKm !== null).toBe(crossesDuringRoute);
        if (a.reserveCrossKm !== null && a.stopsBeforeReserve !== null) {
          expect(a.reserveCrossKm).toBeGreaterThanOrEqual(0);
          expect(a.reserveCrossKm).toBeLessThanOrEqual(a.input.distanceKm);
          expect(a.stopsBeforeReserve).toBeGreaterThanOrEqual(0);
          expect(a.stopsBeforeReserve).toBeLessThanOrEqual(a.input.stops);
        }
      }),
    );
  });

  it("entrada fora da faixa é limitada em vez de quebrar", () => {
    const a = assess({ stops: -5, distanceKm: 1e6, payloadKg: Number.NaN, sohPct: 10, startSocPct: 400 });
    expect(a.input).toEqual({
      stops: LIMITS.stops.min,
      distanceKm: LIMITS.distanceKm.max,
      payloadKg: DEFAULT_ROUTE.payloadKg,
      sohPct: LIMITS.sohPct.min,
      startSocPct: LIMITS.startSocPct.max,
    });
    expect(Number.isFinite(a.marginPp)).toBe(true);
  });
});

describe("cenários da página", () => {
  // A copy de cada cenário conta uma história; se o modelo mudar e a
  // história deixar de ser verdade, este teste falha antes da página mentir.
  it("a moto que chegou primeiro, com 44%, volta sem margem e cruza a reserva no meio da rota", () => {
    const a = assess(PRESETS.arrival);
    expect(a.state).toBe("sem-margem");
    expect(a.stopsBeforeReserve).not.toBeNull();
    expect(a.stopsBeforeReserve!).toBeLessThan(PRESETS.arrival.stops);
  });

  it("a mesma rota com uma moto a 90% volta apertada", () => {
    expect(assess(PRESETS.current).state).toBe("apertada");
  });

  it("com uma bateria saudável, cabe", () => {
    expect(assess(PRESETS.healthy).state).toBe("cabe");
  });
});
