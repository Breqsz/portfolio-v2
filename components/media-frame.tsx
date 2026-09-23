import Image from "next/image";
import type { Media } from "@/content/cases/types";

type Props = {
  media: Media;
  sizes: string;
  className?: string;
  /** Mostra a legenda abaixo da imagem, quando houver. */
  caption?: boolean;
  tone?: "light" | "dark";
};

/** Captura de tela real, sem moldura de dispositivo falsa: borda fina e mais nada. */
export function MediaFrame({ media, sizes, className = "", caption = true, tone = "light" }: Props) {
  return (
    <figure className={className}>
      <div
        className={`reveal-clip overflow-hidden border ${
          tone === "dark" ? "border-night-line bg-night-2" : "border-line bg-surface"
        }`}
      >
        <Image src={media.src} alt={media.alt} sizes={sizes} placeholder="blur" className="h-auto w-full" />
      </div>
      {caption && media.caption ? (
        <figcaption className={`mt-3 max-w-[60ch] text-sm ${tone === "dark" ? "text-on-night-2" : "text-ink-2"}`}>
          {media.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
