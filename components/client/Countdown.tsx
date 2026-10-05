"use client";
/** Quiet countdown to an instant. Updates once a minute (no ticking seconds: §5 motion). */
import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  const t = setInterval(cb, 60_000);
  return () => clearInterval(t);
}
const minuteNow = () => Math.floor(Date.now() / 60_000) * 60_000;

export default function Countdown({ to }: { to: string }) {
  const now = useSyncExternalStore(subscribe, minuteNow, () => 0);
  if (!now) return null;
  const ms = new Date(to).getTime() - now;
  if (ms <= 0) return <p className="mt-2 font-semibold">Happy Khmer New Year.</p>;
  const d = Math.floor(ms / 86_400_000), h = Math.floor((ms % 86_400_000) / 3_600_000);
  return <p className="mt-2 tabular"><span className="serif text-h2">{d}</span> days <span className="serif text-h2">{h}</span> hours to go</p>;
}
