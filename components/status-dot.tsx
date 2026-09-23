import type { CaseStatus } from "@/content/cases/types";

const TONE: Record<CaseStatus, string> = {
  live: "bg-state-cabe",
  demo: "bg-state-apertada",
  study: "bg-ink-3",
};

/** Codifica o estado em forma além do texto: o rótulo ao lado continua sendo a informação. */
export function StatusDot({ status }: { status: CaseStatus }) {
  return <span aria-hidden="true" className={`inline-block size-1.5 shrink-0 rounded-full ${TONE[status]}`} />;
}
