"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

type Props = { email: string; label: string; done: string };

export function CopyEmail({ email, label, done }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2400);
    return () => window.clearTimeout(id);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  }

  const Icon = copied ? Check : Copy;
  return (
    <button type="button" onClick={copy} className="inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold">
      <Icon aria-hidden="true" size={16} strokeWidth={1.75} />
      <span className="link-sweep" aria-live="polite">
        {copied ? done : label}
      </span>
    </button>
  );
}
