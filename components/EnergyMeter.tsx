/** EnergyMeter (§6.4): five circles, filled = rating 1–5; text alternative "Energy 4 of 5". */
import { type Lang } from "@/lib/i18n";

/* Used from client components too, so the language arrives as a prop. */
/* `lang` is still accepted from older call sites; the site is English only. */
export default function EnergyMeter({ value, label }: { value: number; label?: string; lang?: Lang }) {
  const v = Math.max(0, Math.min(5, Math.round(value)));
  const name = label ?? "Energy";
  return (
    <span role="img" aria-label={`${name} ${v} of 5`} className="inline-flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 12 12" className="meter-dot" aria-hidden="true">
          <circle cx="6" cy="6" r="4.75" className={i < v ? "on" : "off"} />
        </svg>
      ))}
    </span>
  );
}
