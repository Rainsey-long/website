"use client";
/** Share (§6.13): native Web Share on touch devices; otherwise copy link + network links. */
import { useSyncExternalStore } from "react";
import { toast } from "@/lib/client";

const canNative = () => typeof navigator.share === "function" && matchMedia("(pointer: coarse)").matches;

export default function Share({ title, text, url }: { title: string; text: string; url: string }) {
  const native = useSyncExternalStore(() => () => {}, canNative, () => false);
  const enc = encodeURIComponent;
  const links: Array<[string, string]> = [
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`],
    ["X", `https://x.com/intent/post?text=${enc(text)}&url=${enc(url)}`],
    ["Telegram", `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`],
    ["WhatsApp", `https://wa.me/?text=${enc(`${text} ${url}`)}`],
  ];
  return (
    <section className="mt-6" aria-label="Share">
      <div className="flex flex-wrap items-center gap-3">
        {native && <button type="button" className="btn-secondary" onClick={() => navigator.share({ title, text, url }).catch(() => {})}>Share</button>}
        <button type="button" className="btn-secondary" onClick={async () => {
          try { await navigator.clipboard.writeText(url); toast("Link copied"); }
          catch { toast("Copy failed. Select the address bar to copy the link."); }
        }}>Copy link</button>
        {!native && (
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-small">
            {links.map(([name, href]) => <li key={name}><a className="link inline-flex min-h-tap items-center" href={href} target="_blank" rel="noopener noreferrer">Share on {name}</a></li>)}
          </ul>
        )}
      </div>
    </section>
  );
}
