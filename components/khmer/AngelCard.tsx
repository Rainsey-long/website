/** A New Year angel (one of the seven daughters of Kabil Moha Prom) and her attributes. */
import type { Weekday } from "@/lib/khmer";

export default function AngelCard({ weekday, headingLevel = "h3" }: { weekday: Weekday; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  const a = weekday.angel;
  return (
    <section className="border-t-2 border-ink pt-4">
      <H className="text-h3"><span lang="km">{a.km}</span> <span className="text-muted">{a.roman}</span></H>
      <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3 text-small">
        <div><dt className="text-muted">Her day</dt><dd>{weekday.en} (<span lang="km">{weekday.km}</span>)</dd></div>
        <div><dt className="text-muted">Robe</dt><dd className="flex items-center gap-2"><span className="swatch" style={{ background: `var(--${weekday.swatch})` }} aria-hidden="true" />{weekday.colourEn}</dd></div>
        <div><dt className="text-muted">Flower</dt><dd>{a.flower}</dd></div>
        <div><dt className="text-muted">Jewel</dt><dd>{a.jewel}</dd></div>
        <div><dt className="text-muted">Food</dt><dd>{a.food}</dd></div>
        <div><dt className="text-muted">Holds</dt><dd>{a.hands}</dd></div>
        <div><dt className="text-muted">Rides</dt><dd>{a.mount}</dd></div>
      </dl>
    </section>
  );
}
