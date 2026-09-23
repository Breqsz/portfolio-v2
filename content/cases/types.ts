import type { StaticImageData } from "next/image";
import type { CaseSlug } from "@/lib/site";

export type Media = {
  src: StaticImageData;
  alt: string;
  caption?: string;
  device: "desktop" | "mobile";
};

export type Metric = {
  value: string;
  label: string;
  /** Mês/ano da medição, como registrada. */
  when: string;
  /** Em que condição o número vale. Sem ela, o número engana. */
  condition?: string;
};

export type FlowNode = { title: string; detail?: string; planned?: boolean };

export type CaseContent = {
  slug: CaseSlug;
  name: string;
  kind: string;
  year: string;
  role: string;
  /** A frase de capítulo. */
  hook: string;
  problem: string;
  summary: { what: string; did: string; proves: string };
  home: { lead: string; facts: string[] };
  /** Só onde o limite é a tese: o que o sistema se recusa a fazer. */
  ceiling?: string[];
  context: string[];
  constraints: string[];
  decision: { chosen: string; discarded: string; why: string };
  secondary: { title: string; body: string }[];
  architecture: { caption: string; frame?: string; nodes: FlowNode[]; loop?: string };
  validation: Metric[];
  limits: string[];
  learning: string;
  stack: string[];
  links: { label: string; href: string }[];
  /** Por que não há link público, quando não há. */
  linksNote?: string;
  media: Media[];
  seo: { title: string; description: string };
};

export type CaseBook = Record<CaseSlug, CaseContent>;
