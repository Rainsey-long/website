"use client";
/**
 * Header controls (§6.10): "My sign" shortcut once a sign is remembered,
 * the traditions menu, the theme toggle, and the mobile menu sheet.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MY_SIGN_EVENT, MY_SIGN_KEY, SIGN_NAMES, readStore, setCookie, writeStore } from "@/lib/client";
import { ALL_TRADITIONS, TRADITION_LABEL, TRADITIONS_COOKIE, serializeTraditions, type Tradition } from "@/lib/traditions";
import { UI_ICONS } from "@/lib/glyphs";
import { GlyphParts } from "../Glyph";

const Icon = ({ name }: { name: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="size-glyph" aria-hidden="true">
    <GlyphParts parts={UI_ICONS[name]} />
  </svg>
);

function subscribeSign(cb: () => void) {
  window.addEventListener(MY_SIGN_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(MY_SIGN_EVENT, cb); window.removeEventListener("storage", cb); };
}
export function useMySign(): string | null {
  return useSyncExternalStore(subscribeSign, () => readStore(MY_SIGN_KEY), () => null);
}

function subscribeTheme(cb: () => void) {
  const mq = matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => { mq.removeEventListener("change", cb); obs.disconnect(); };
}
const isDarkNow = () => {
  const t = document.documentElement.dataset.theme;
  return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
};

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribeTheme, isDarkNow, () => false);
  return (
    <button type="button" className="inline-flex size-tap items-center justify-center rounded-full text-ink"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => {
        const next = isDarkNow() ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        writeStore("theme", next);
      }}>
      <Icon name={dark ? "sun" : "moon"} />
    </button>
  );
}

export function MySignChip() {
  const sign = useMySign();
  const name = sign ? SIGN_NAMES[sign] : null;
  if (!name) return null;
  return (
    <Link href={`/horoscope/${sign}`} className="hidden items-center gap-2 rounded-full border border-cinnabar px-3 py-1 text-small font-semibold no-underline sm:inline-flex">
      My sign: {name}
    </Link>
  );
}

/** Traditions menu: the visitor decides which traditions the site shows. */
export function TraditionsMenu({ initial }: { initial: Tradition[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<Tradition[]>(initial);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [open]);

  const toggle = (t: Tradition) => {
    const next = picked.includes(t) ? picked.filter((x) => x !== t) : [...picked, t];
    if (next.length === 0) return; // at least one tradition stays on
    setPicked(next);
    setCookie(TRADITIONS_COOKIE, serializeTraditions(next));
    router.refresh();
  };

  return (
    <div className="relative" ref={wrap}>
      <button type="button" className="inline-flex min-h-tap items-center gap-2 rounded-sm px-2 text-small font-semibold" aria-expanded={open} aria-controls="traditions-pop" onClick={() => setOpen((o) => !o)}>
        Traditions
        <span className="text-muted font-normal">{picked.length === 3 ? "All" : picked.map((t) => TRADITION_LABEL[t].en).join(", ")}</span>
      </button>
      {open && (
        <div id="traditions-pop" className="popover absolute right-0 z-40 mt-1 w-[var(--size-rail)] max-w-[calc(100vw-32px)] p-4">
          <fieldset>
            <legend className="font-semibold">Show me</legend>
            <p className="mt-1 text-small text-muted">Choose the traditions you want to see across the site.</p>
            <div className="mt-3 flex flex-col">
              {ALL_TRADITIONS.map((t) => (
                <label key={t} className="flex min-h-tap items-center gap-3">
                  <input type="checkbox" className="size-5" checked={picked.includes(t)} onChange={() => toggle(t)} disabled={picked.length === 1 && picked.includes(t)} />
                  <span>{TRADITION_LABEL[t].en} <span lang="km" className="text-muted">{TRADITION_LABEL[t].km}</span></span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}

export function MenuSheet({ nav }: { nav: Array<{ href: string; label: string }> }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [expanded, setExpanded] = useState(false);
  const sign = useMySign();
  return (
    <>
      <button type="button" className="inline-flex size-tap items-center justify-center rounded-full lg:hidden" aria-label="Open menu" aria-expanded={expanded} aria-controls="menu-sheet"
        onClick={() => { ref.current?.showModal(); setExpanded(true); }}>
        <Icon name="menu" />
      </button>
      <dialog id="menu-sheet" ref={ref} className="menu-sheet" aria-label="Menu" onClose={() => setExpanded(false)}>
        <div className="flex items-center justify-between border-b border-rule safe-x py-3">
          <span className="serif text-h3">Menu</span>
          <button type="button" className="inline-flex size-tap items-center justify-center rounded-full" aria-label="Close menu" onClick={() => ref.current?.close()}>
            <Icon name="close" />
          </button>
        </div>
        <nav aria-label="Main" className="safe-x py-5" onClick={(e) => { if ((e.target as HTMLElement).closest("a")) ref.current?.close(); }}>
          <ul className="flex flex-col">
            {sign && SIGN_NAMES[sign] && <li><Link href={`/horoscope/${sign}`} className="block border-b border-rule py-4 text-h3 serif no-underline">My sign: {SIGN_NAMES[sign]}</Link></li>}
            {nav.map((n) => <li key={n.href}><Link href={n.href} className="block border-b border-rule py-4 text-h3 serif no-underline">{n.label}</Link></li>)}
            <li><Link href="/tools/zodiac-calculator" className="block border-b border-rule py-4 text-h3 serif no-underline">Find my sign</Link></li>
          </ul>
        </nav>
      </dialog>
    </>
  );
}
