const NEGATION = /^(não|doesn't|don't|won't|never|nunca)$/i;

type Props = { items: string[]; label: string };

/** O que o agente se recusa a fazer, com a negação em destaque. */
export function Ceiling({ items, label }: Props) {
  return (
    <figure>
      <figcaption className="text-sm font-semibold text-ink-2">{label}</figcaption>
      <ul className="mt-5 border-t border-line font-display text-[clamp(2.25rem,1.5rem+3vw,4.5rem)] font-extrabold leading-[0.95]">
        {items.map((item) => (
          <li key={item} className="border-b border-line py-3">
            {item.split(" ").map((word, i) => (
              <span key={`${word}-${i}`} className={NEGATION.test(word) ? "text-signal" : undefined}>
                {i > 0 ? " " : ""}
                {word}
              </span>
            ))}
          </li>
        ))}
      </ul>
    </figure>
  );
}
