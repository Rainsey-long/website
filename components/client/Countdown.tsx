"use client";
/** Quiet countdown to an instant. Updates once a minute (no ticking seconds: §5 motion). */
import { useSyncExternalStore } from "react";
import { useLang } from "./LangProvider";
import { num } from "@/lib/i18n";

function subscribe(cb: () => void) {
  const t = setInterval(cb, 60_000);
  return () => clearInterval(t);
}
const minuteNow = () => Math.floor(Date.now() / 60_000) * 60_000;

export default function Countdown({ to }: { to: string }) {
  const lang = useLang();
  const now = useSyncExternalStore(subscribe, minuteNow, () => 0);
  if (!now) return null;
  const ms = new Date(to).getTime() - now;
  if (ms <= 0) return <p className="mt-2 font-semibold">{lang === "km" ? "សួស្ដីឆ្នាំថ្មីខ្មែរ។" : "Happy Khmer New Year."}</p>;
  const d = Math.floor(ms / 86_400_000), h = Math.floor((ms % 86_400_000) / 3_600_000);
  if (lang === "km") return <p className="mt-2 tabular">នៅសល់ <span className="serif text-h2">{num(d, lang)}</span> ថ្ងៃ <span className="serif text-h2">{num(h, lang)}</span> ម៉ោងទៀត</p>;
  return <p className="mt-2 tabular"><span className="serif text-h2">{d}</span> days <span className="serif text-h2">{h}</span> hours to go</p>;
}
