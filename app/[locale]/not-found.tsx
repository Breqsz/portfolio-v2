"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { dictionary } from "@/content/dictionary";
import { defaultLocale, isLocale } from "@/lib/i18n";

export default function NotFound() {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale && isLocale(params.locale) ? params.locale : defaultLocale;
  const t = dictionary[locale].notFound;

  return (
    <main id="conteudo" className="shell flex min-h-[80svh] flex-col justify-center py-24">
      <p aria-hidden="true" className="font-display text-[clamp(7rem,4rem+14vw,16rem)] font-extrabold leading-[0.8] text-signal">
        404
      </p>
      <h1 className="mt-8 text-2xl font-bold tracking-[-0.02em]">{t.title}</h1>
      <p className="mt-3 max-w-[44ch] text-lg text-ink-2">{t.body}</p>
      <Link href={`/${locale}`} className="group mt-8 inline-flex min-h-12 w-fit items-center gap-3 bg-ink px-6 font-semibold text-bg">
        <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.75} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
        {t.cta}
      </Link>
    </main>
  );
}
