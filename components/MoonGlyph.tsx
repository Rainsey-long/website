/** Small phase-accurate moon (same geometry as the DayDial's), decorative. */
export default function MoonGlyph({ angle, size = 20 }: { angle: number; size?: number }) {
  const R = 9, c = 10, D = Math.PI / 180;
  const a = ((angle % 360) + 360) % 360;
  const waxing = a < 180, gibbous = a > 90 && a < 270;
  const rx = Math.round(R * Math.abs(Math.cos(a * D)) * 100) / 100;
  const top = `${c} ${c - R}`, bottom = `${c} ${c + R}`;
  const full = a >= 172 && a <= 188, isNew = a <= 8 || a >= 352;
  const d = waxing
    ? `M${top}A${R} ${R} 0 0 1 ${bottom}A${rx} ${R} 0 0 ${gibbous ? 1 : 0} ${top}Z`
    : `M${top}A${R} ${R} 0 0 0 ${bottom}A${rx} ${R} 0 0 ${gibbous ? 0 : 1} ${top}Z`;
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
      <circle cx={c} cy={c} r={R} fill="var(--paper)" stroke="var(--brass)" strokeWidth="1.25" />
      {full ? <circle cx={c} cy={c} r={R} fill="var(--brass)" /> : !isNew && <path d={d} fill="var(--brass)" />}
    </svg>
  );
}
