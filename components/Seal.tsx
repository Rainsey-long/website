/** Seal — the cinnabar almanac stamp (§6.5), the only filled cinnabar shape. Decorative; a label carries the meaning. */
export default function Seal({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <svg viewBox="0 0 32 32" className={`seal ${size}`} aria-hidden="true">
      <circle cx="16" cy="16" r="15" className="disc" />
      <path d="M10 11h12M16 8v16M11 16h10M10.5 21h11" className="mark" />
    </svg>
  );
}
