"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import type { Dictionary } from "@/content/dictionary";
import type { NavItem } from "@/lib/nav";

type Props = { items: NavItem[]; t: Dictionary["nav"] };

/**
 * Folha de baixo para cima com o índice do site. É um <dialog> nativo: foco
 * preso, Esc fecha e o foco volta ao botão. Fechar antes de navegar deixa a
 * página sair de `inert` a tempo de rolar até a âncora.
 */
export function MobileMenu({ items, t }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = () => ref.current?.close();

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-controls="menu-mobile"
        aria-haspopup="dialog"
        onClick={() => ref.current?.showModal()}
        className="inline-flex min-h-11 items-center border border-current/25 px-3 text-sm font-semibold"
      >
        {t.menu}
      </button>
      <dialog
        ref={ref}
        id="menu-mobile"
        aria-label={t.menuLabel}
        className="sheet"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="flex items-center justify-between border-b border-line px-[var(--gutter)] py-3">
          <p className="text-sm font-semibold text-ink-2">{t.menuLabel}</p>
          <button type="button" onClick={close} className="inline-flex size-11 items-center justify-center" aria-label={t.close}>
            <X aria-hidden="true" size={20} strokeWidth={1.75} />
          </button>
        </div>
        <ul className="px-[var(--gutter)] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
          {items.map((item) => (
            <li key={item.href} className="border-b border-line last:border-b-0">
              <Link href={item.href} onClick={close} className="flex min-h-14 items-baseline gap-3 py-3">
                {item.index ? <span className="tabular text-xs font-semibold text-signal-strong">{item.index}</span> : null}
                <span className="font-display text-[2rem] font-extrabold leading-none">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </dialog>
    </div>
  );
}
