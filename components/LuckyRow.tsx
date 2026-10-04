/**
 * LuckyRow (§6.5): lucky colour (swatch + name), number, hour. On auspicious
 * days the cinnabar seal with "Good day for …".
 */
import Seal from "./Seal";

export default function LuckyRow({ color, number, hour, seal, heading = "Lucky today", headingId = "lucky-h" }: {
  color?: { name: string; element: string };
  number?: number | string;
  hour?: string;
  seal?: string[] | null;
  heading?: string;
  headingId?: string;
}) {
  const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
  return (
    <section aria-labelledby={headingId} className="border-y-2 border-ink py-5">
      <h2 id={headingId} className="text-h3">{heading}</h2>
      <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {color && (
          <div>
            <dt className="text-small text-muted">Colour</dt>
            <dd className="mt-1 flex items-center gap-2 font-semibold">
              <span className="swatch" style={{ background: `var(--el-${color.element})` }} aria-hidden="true" />{color.name}
            </dd>
          </div>
        )}
        {number !== undefined && (
          <div>
            <dt className="text-small text-muted">Number</dt>
            <dd className="mt-1 serif text-h3 tabular">{number}</dd>
          </div>
        )}
        {hour && (
          <div>
            <dt className="text-small text-muted">Hour</dt>
            <dd className="mt-1 font-semibold tabular">{hour}</dd>
          </div>
        )}
      </dl>
      {seal && seal.length > 0 && (
        <p className="mt-5 flex items-center gap-3">
          <Seal />
          <span><span className="font-semibold">Good day for</span> {seal.map(lower).join(" and ")}.</span>
        </p>
      )}
    </section>
  );
}
