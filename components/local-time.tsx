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
