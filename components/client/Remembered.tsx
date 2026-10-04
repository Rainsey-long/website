"use client";
/** Small islands that depend on the remembered sign. */
import { useSyncExternalStore } from "react";
import { MY_SIGN_EVENT, MY_SIGN_KEY, readStore, toast, writeStore } from "@/lib/client";
import { useMySign } from "./HeaderControls";

/** Rings the remembered sign's chip (§6.2). Renders nothing itself. */
export function RememberedChipStyle() {
  const sign = useMySign();
  if (!sign || !/^[a-z]+$/.test(sign)) return null;
  return <style>{`[data-remember] .chip[data-slug="${sign}"]{border:2px solid var(--cinnabar)}`}</style>;
}

function subscribe(cb: () => void) {
  window.addEventListener(MY_SIGN_EVENT, cb);
  return () => window.removeEventListener(MY_SIGN_EVENT, cb);
}

/** "Make Scorpio my sign" (§8.1). */
export function SaveSign({ slug, name }: { slug: string; name: string }) {
  const mine = useSyncExternalStore(subscribe, () => readStore(MY_SIGN_KEY) === slug, () => false);
  if (mine) return null;
  return (
    <button type="button" className="btn-secondary" onClick={() => {
      writeStore(MY_SIGN_KEY, slug);
      window.dispatchEvent(new Event(MY_SIGN_EVENT));
      toast(`Sign saved: ${name}`);
    }}>Make {name} my sign</button>
  );
}
