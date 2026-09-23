import { notFound } from "next/navigation";

// Qualquer caminho sem rota dentro de /pt ou /en cai aqui e renderiza o
// not-found do idioma — dentro do layout, com a identidade do site.
export const dynamicParams = true;

export default function CatchAll() {
  notFound();
}
