/**
 * Share cards (design system §6.13): paper, ink, one cinnabar rule. Rendered
 * with next/og. Colours are literals here because the renderer cannot read CSS
 * variables; keep them in step with app/styles/tokens.css (light theme).
 */
import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { signBySlug } from "@/lib/western";
import { animalBySlug } from "@/lib/chinese";
import { ANIMAL_GLYPHS, WESTERN_GLYPHS, type GlyphPart } from "@/lib/glyphs";
import { dailyReading } from "@/lib/reading-engine";
import { longDate } from "@/lib/dates";
import { dateInZone } from "@/lib/today";
import { DEFAULT_TZ, DOMAIN, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const T = { paper: "#F6F7F4", ink: "#1C2340", muted: "#555C78", rule: "#D9DCE3", cinnabar: "#B8301E" };
const fontFile = (p: string) => fs.readFileSync(path.join(process.cwd(), "node_modules", p));

function glyphUri(parts: GlyphPart[]): string {
  const inner = parts.map(([tag, a]) => `<${tag} ${Object.entries(a).map(([k, v]) => `${k}="${v}"`).join(" ")}/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${T.ink}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let title = "Today's sky";
  let subtitle = SITE_TAGLINE;
  let glyph: GlyphPart[] | null = null;
  let rows: Array<{ label: string; value: number }> = [];
  const sign = signBySlug(slug);
  const animal = slug.startsWith("animal-") ? animalBySlug(slug.slice(7)) : undefined;
  if (sign) {
    const date = dateInZone(DEFAULT_TZ);
    title = sign.name;
    subtitle = longDate(date);
    glyph = WESTERN_GLYPHS[sign.slug];
    rows = dailyReading(sign, date).topics.map((t) => ({ label: t.label, value: t.energy }));
  } else if (animal) {
    title = animal.name;
    subtitle = "Chinese and Khmer zodiac";
    glyph = ANIMAL_GLYPHS[animal.slug];
  } else if (slug !== "default") {
    return new Response("Not found", { status: 404 });
  }
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", flexDirection: "column", background: T.paper, color: T.ink, padding: 72, fontFamily: "Figtree" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32, flex: 1 }}>
          {glyph ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={glyphUri(glyph)} width={180} height={180} alt="" />
          ) : (
            <div style={{ display: "flex" }} />
          )}
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ fontFamily: "Newsreader", fontSize: 96, lineHeight: 1 }}>{title}</div>
            <div style={{ fontSize: 32, color: T.muted, marginTop: 20 }}>{subtitle}</div>
          </div>
          {rows.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {rows.map((r) => (
                <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: 300, gap: 24 }}>
                  <div style={{ fontSize: 30 }}>{r.label}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <div key={i} style={{ width: 18, height: 18, borderRadius: 9, border: `2px solid ${i < r.value ? T.ink : T.rule}`, background: i < r.value ? T.ink : "transparent" }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `3px solid ${T.cinnabar}`, paddingTop: 28, fontSize: 28 }}>
          <div style={{ fontFamily: "Newsreader", fontSize: 36 }}>{SITE_NAME}</div>
          <div style={{ color: T.muted }}>{DOMAIN}</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Newsreader", data: fontFile("@fontsource/newsreader/files/newsreader-latin-500-normal.woff"), weight: 500, style: "normal" },
        { name: "Figtree", data: fontFile("@fontsource/figtree/files/figtree-latin-600-normal.woff"), weight: 600, style: "normal" },
      ],
      headers: { "Cache-Control": "public, max-age=3600" },
    },
  );
}
