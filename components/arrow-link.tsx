import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  /** Texto para leitor de tela quando o link abre em nova aba. */
  newTabLabel?: string;
  className?: string;
};

export function ArrowLink({ href, children, external = false, newTabLabel, className = "" }: Props) {
  const Icon = external ? ArrowUpRight : ArrowRight;
  const classes = `arrow-nudge inline-flex min-h-11 items-center gap-2 font-semibold ${className}`;
  const content = (
    <>
      <span className="link-sweep">{children}</span>
      <Icon aria-hidden="true" size={18} strokeWidth={1.75} />
      {external && newTabLabel ? <span className="sr-only"> ({newTabLabel})</span> : null}
    </>
  );

  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={classes} data-external="">
      {content}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
