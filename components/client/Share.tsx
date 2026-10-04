"use client";
/** Share (§6.13): native Web Share on touch devices; otherwise copy link + network links. */
import { useSyncExternalStore } from "react";
import { toast } from "@/lib/client";
import { useLang } from "./LangProvider";
import { defineMessages } from "@/lib/i18n";

const T = defineMessages({
  en: { share: "Share", copied: "Link copied", failed: "Copy failed. Select the address bar to copy the link.", copy: "Copy link", on: (n: string) => `Share on ${n}` },
  km: { share: "ចែករំលែក", copied: "បានចម្លងតំណ", failed: "ចម្លងមិនបាន។ សូមជ្រើសរើសរបារអាសយដ្ឋាន ដើម្បីចម្លងតំណ។", copy: "ចម្លងតំណ", on: (n: string) => `ចែករំលែកនៅ ${n}` },
});

const canNative = () => typeof navigator.share === "function" && matchMedia("(pointer: coarse)").matches;

export default function Share({ title, text, url }: { title: string; text: string; url: string }) {
  const native = useSyncExternalStore(() => () => {}, canNative, () => false);
  const m = T[useLang()];
  const enc = encodeURIComponent;
  const links: Array<[string, string]> = [
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`],
    ["X", `https://x.com/intent/post?text=${enc(text)}&url=${enc(url)}`],
    ["Telegram", `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`],
    ["WhatsApp", `https://wa.me/?text=${enc(`${text} ${url}`)}`],
  ];
  return (
    <section className="mt-6" aria-label={m.share}>
      <div className="flex flex-wrap items-center gap-3">
        {native && <button type="button" className="btn-secondary" onClick={() => navigator.share({ title, text, url }).catch(() => {})}>{m.share}</button>}
        <button type="button" className="btn-secondary" onClick={async () => {
          try { await navigator.clipboard.writeText(url); toast(m.copied); }
          catch { toast(m.failed); }
        }}>{m.copy}</button>
        {!native && (
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-small">
            {links.map(([name, href]) => <li key={name}><a className="link inline-flex min-h-tap items-center" href={href} target="_blank" rel="noopener noreferrer">{m.on(name)}</a></li>)}
          </ul>
        )}
      </div>
    </section>
  );
}
