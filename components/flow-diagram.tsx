import { CornerDownLeft } from "lucide-react";
import type { FlowNode } from "@/content/cases/types";

type Props = {
  nodes: FlowNode[];
  plannedLabel: string;
  frame?: string;
  loop?: string;
  compact?: boolean;
  /** Fundo da seção, para o rótulo da moldura recortar a linha tracejada. */
  surface?: "bg" | "surface";
};

/**
 * Arquitetura como sequência numerada: legível em qualquer largura, e o
 * leitor de tela ouve uma lista ordenada. Tracejado = planejado.
 */
export function FlowDiagram({ nodes, plannedLabel, frame, loop, compact = false, surface = "bg" }: Props) {
  const list = (
    <ol>
      {nodes.map((node, i) => {
        const next = nodes[i + 1];
        const dashedLink = Boolean(node.planned || next?.planned);
        return (
          <li key={node.title} className={`relative grid grid-cols-[2.25rem_1fr] gap-x-4 ${next ? (compact ? "pb-5" : "pb-7") : ""}`}>
            {next ? (
              <span
                aria-hidden="true"
                className={`absolute bottom-0 left-[1.0625rem] top-9 w-0 border-l ${
                  dashedLink ? "border-dashed border-ink-3" : "border-solid border-ink"
                }`}
              />
            ) : null}
            <span
              className={`relative grid size-9 place-items-center border text-xs font-semibold tabular ${
                node.planned ? "border-dashed border-ink-3 bg-bg text-ink-3" : "border-ink bg-ink text-bg"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="pt-1.5">
              <p className={`font-semibold leading-snug ${compact ? "text-[0.9375rem]" : "text-base"} ${node.planned ? "text-ink-2" : ""}`}>
                {node.title}
                {node.planned ? <span className="ml-2 text-xs font-medium text-ink-3">({plannedLabel})</span> : null}
              </p>
              {node.detail ? <p className="mt-1 text-sm text-ink-2">{node.detail}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );

  return (
    <figure>
      {frame ? (
        <div className="relative border border-dashed border-ink-3 px-5 pb-6 pt-8 sm:px-7">
          <span className={`absolute -top-3 left-4 px-2 text-xs font-semibold text-ink-2 ${surface === "bg" ? "bg-bg" : "bg-surface"}`}>
            {frame}
          </span>
          {list}
        </div>
      ) : (
        list
      )}
      {loop ? (
        <figcaption className="mt-5 flex items-start gap-2 text-sm text-ink-2">
          <CornerDownLeft aria-hidden="true" size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
          {loop}
        </figcaption>
      ) : null}
    </figure>
  );
}
