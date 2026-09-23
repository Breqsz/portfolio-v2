// Capturas reais dos produtos, feitas em 2026-09-10 (Carga servido do build
// estático local; Hold e NeuroRace dos sites no ar — o NeuroRace do deploy
// atual, neurorace-v2). Nenhuma captura mostra dado de pessoa.
import cargaBancada from "@/media/carga/bancada.webp";
import cargaComparativo from "@/media/carga/comparativo.webp";
import cargaMobile from "@/media/carga/mobile.webp";
import cargaPremissas from "@/media/carga/premissas.webp";
import holdConsorcios from "@/media/hold/consorcios.webp";
import holdContato from "@/media/hold/contato.webp";
import holdHome from "@/media/hold/home.webp";
import holdSaude from "@/media/hold/saude.webp";
import neuroHome from "@/media/neurorace/home.webp";
import neuroMobile from "@/media/neurorace/mobile.webp";
import neuroSobre from "@/media/neurorace/sobre.webp";
import portrait from "@/media/portrait.webp";

export const images = {
  portrait,
  carga: { comparativo: cargaComparativo, bancada: cargaBancada, premissas: cargaPremissas, mobile: cargaMobile },
  hold: { home: holdHome, saude: holdSaude, consorcios: holdConsorcios, contato: holdContato },
  neurorace: { home: neuroHome, sobre: neuroSobre, mobile: neuroMobile },
};
