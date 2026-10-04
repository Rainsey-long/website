/**
 * Build-time Open Graph cards (plan §3, design system §6.13) with satori +
 * resvg. Same visual language as the site: paper, ink, one cinnabar rule.
 * Colours are read from the token values below, kept in step with tokens.css.
 */
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { WESTERN_GLYPHS, ANIMAL_GLYPHS, type GlyphPart } from "../icons/glyphs";
import { SITE_NAME, DOMAIN } from "../config/site";

const require = createRequire(import.meta.url);
const font = (pkg: string) => readFileSync(require.resolve(pkg));
const serif = font("@fontsource/newsreader/files/newsreader-latin-500-normal.woff");
const sans = font("@fontsource/figtree/files/figtree-latin-600-normal.woff");

const T = { paper: "#F6F7F4", ink: "#1C2340", muted: "#555C78", rule: "#D9DCE3", cinnabar: "#B8301E" };

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({ type, props: { style, children } });

function glyphDataUri(parts: GlyphPart[]): string {
  const inner = parts.map(([tag, a]) => `<${tag} ${Object.entries(a).map(([k, v]) => `${k}="${v}"`).join(" ")}/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${T.ink}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function meter(value: number): Node {
  return h("div", { display: "flex", gap: 8 }, Array.from({ length: 5 }, (_, i) =>
    h("div", { width: 18, height: 18, borderRadius: 9, border: `2px solid ${i < value ? T.ink : T.rule}`, background: i < value ? T.ink : "transparent" })));
}

export interface CardInput {
  title: string;
  subtitle?: string;
  glyph?: { set: "western" | "animal"; slug: string };
  rows?: Array<{ label: string; value: number }>;
}

export async function renderCard(c: CardInput): Promise<Buffer> {
  const glyph = c.glyph ? (c.glyph.set === "western" ? WESTERN_GLYPHS : ANIMAL_GLYPHS)[c.glyph.slug] : null;
  const tree = h("div", { width: 1200, height: 630, display: "flex", flexDirection: "column", background: T.paper, color: T.ink, padding: 72, fontFamily: "Figtree" }, [
    h("div", { display: "flex", alignItems: "center", gap: 32, flex: 1 }, [
      glyph ? { type: "img", props: { src: glyphDataUri(glyph), width: 180, height: 180 } } : h("div", { display: "flex" }),
      h("div", { display: "flex", flexDirection: "column", flex: 1 }, [
        h("div", { fontFamily: "Newsreader", fontSize: 96, lineHeight: 1 }, c.title),
        c.subtitle ? h("div", { fontSize: 32, color: T.muted, marginTop: 20 }, c.subtitle) : h("div", { display: "flex" }),
      ]),
      c.rows ? h("div", { display: "flex", flexDirection: "column", gap: 20 }, c.rows.map((r) =>
        h("div", { display: "flex", alignItems: "center", gap: 24, justifyContent: "space-between", width: 300 }, [h("div", { fontSize: 30 }, r.label), meter(r.value)]))) : h("div", { display: "flex" }),
    ]),
    h("div", { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `3px solid ${T.cinnabar}`, paddingTop: 28, fontSize: 28 }, [
      h("div", { fontFamily: "Newsreader", fontSize: 36 }, SITE_NAME),
      h("div", { color: T.muted }, DOMAIN),
    ]),
  ]);
  const svg = await satori(tree as never, {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Newsreader", data: serif, weight: 500, style: "normal" },
      { name: "Figtree", data: sans, weight: 600, style: "normal" },
    ],
  });
  return new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
}
