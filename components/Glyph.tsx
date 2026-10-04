/**
 * Glyph — original zodiac glyph or UI icon (DESIGN_SYSTEM.md §4.4).
 * name: sign slug, animal slug or UI icon; set: "western" | "animal" | "ui";
 * label: accessible name (omit for decorative → aria-hidden).
 */
import { ANIMAL_GLYPHS, UI_ICONS, WESTERN_GLYPHS, type GlyphPart } from "@/lib/glyphs";

export function GlyphParts({ parts }: { parts: GlyphPart[] }) {
  return (
    <>
      {parts.map(([tag, attrs], i) =>
        tag === "path" ? <path key={i} {...attrs} /> : tag === "circle" ? <circle key={i} {...attrs} /> : <ellipse key={i} {...attrs} />,
      )}
    </>
  );
}

export default function Glyph({ name, set, label, className = "size-glyph" }: { name: string; set: "western" | "animal" | "ui"; label?: string; className?: string }) {
  const table = set === "western" ? WESTERN_GLYPHS : set === "animal" ? ANIMAL_GLYPHS : UI_ICONS;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false">
      <GlyphParts parts={table[name] ?? []} />
    </svg>
  );
}
