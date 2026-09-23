import { ArrowLink } from "@/components/arrow-link";
import type { Dictionary } from "@/content/dictionary";

export function Trajectory({ t }: { t: Dictionary }) {
  const { path } = t;
  return (
    <section id="trajetoria" aria-labelledby="trajetoria-title" className="border-t border-line">
      <div className="shell grid-12 gap-y-10 py-24 lg:py-32">
        <h2 id="trajetoria-title" className="col-span-12 text-2xl font-bold tracking-[-0.02em] lg:col-span-4">
          {path.title}
        </h2>
        <div className="col-span-12 lg:col-span-8">
          <ol className="border-t border-line">
            {path.items.map((item) => (
              <li key={item.name} className="grid gap-x-10 gap-y-3 border-b border-line py-8 md:grid-cols-[13rem_1fr]">
                <div>
                  <h3 className="font-display text-[2.25rem] font-extrabold leading-none">{item.name}</h3>
                  <p className="mt-2 text-sm text-ink-2">{item.role}</p>
                </div>
                <div>
                  <p className="max-w-[60ch] text-ink-2">{item.body}</p>
                  {item.link ? (
                    <ArrowLink href={item.link.href} external newTabLabel={t.work.newTab} className="mt-3 text-[0.9375rem]">
                      {item.link.label}
                    </ArrowLink>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-12 bg-surface px-6 py-7 sm:px-8">
            <h3 className="text-lg font-semibold">{path.how.title}</h3>
            <p className="mt-3 max-w-[62ch] text-ink-2">{path.how.body}</p>
          </div>
          <p className="mt-10 text-sm text-ink-2">
            <span className="font-semibold text-ink">{path.education.label}</span> — {path.education.body}
          </p>
        </div>
      </div>
    </section>
  );
}
