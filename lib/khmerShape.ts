/**
 * Khmer text for share images (app/og). The image renderer (satori) does no
 * complex-script shaping, so Khmer came out with visible coeng marks and
 * vowels in the wrong place. This shapes the text with HarfBuzz (the engine
 * browsers use) and returns it as an SVG of glyph outlines, which the image
 * renderer draws as a picture. Server-only.
 *
 * The self-hosted fonts are WOFF 1 (@fontsource); HarfBuzz reads SFNT
 * (TrueType/OpenType), so woffToSfnt() unpacks them: WOFF 1 is the same
 * tables, each zlib-compressed, behind a different header.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

/** WOFF 1 → SFNT (TrueType/OpenType) bytes. */
export function woffToSfnt(woff: Buffer): Buffer {
  if (woff.readUInt32BE(0) !== 0x774f4646) throw new Error("not a WOFF 1 font");
  const flavor = woff.readUInt32BE(4);
  const numTables = woff.readUInt16BE(12);
  const tables = Array.from({ length: numTables }, (_, i) => {
    const o = 44 + i * 20;
    const tag = woff.readUInt32BE(o), offset = woff.readUInt32BE(o + 4), compLength = woff.readUInt32BE(o + 8), origLength = woff.readUInt32BE(o + 12), checksum = woff.readUInt32BE(o + 16);
    const raw = woff.subarray(offset, offset + compLength);
    const data = compLength < origLength ? zlib.inflateSync(raw) : raw;
    return { tag, checksum, data };
  });
  let entrySelector = 0;
  while (2 ** (entrySelector + 1) <= numTables) entrySelector++;
  const searchRange = 2 ** entrySelector * 16;
  const headerSize = 12 + numTables * 16;
  const total = tables.reduce((n, t) => n + ((t.data.length + 3) & ~3), headerSize);
  const out = Buffer.alloc(total);
  out.writeUInt32BE(flavor, 0);
  out.writeUInt16BE(numTables, 4);
  out.writeUInt16BE(searchRange, 6);
  out.writeUInt16BE(entrySelector, 8);
  out.writeUInt16BE(numTables * 16 - searchRange, 10);
  let offset = headerSize;
  tables.forEach((t, i) => {
    const o = 12 + i * 16;
    out.writeUInt32BE(t.tag, o);
    out.writeUInt32BE(t.checksum, o + 4);
    out.writeUInt32BE(offset, o + 8);
    out.writeUInt32BE(t.data.length, o + 12);
    t.data.copy(out, offset);
    offset += (t.data.length + 3) & ~3;
  });
  return out;
}

export type KhmerFace = "serif" | "sans";
const FONT_FILES: Record<KhmerFace, string> = {
  serif: "@fontsource/noto-serif-khmer/files/noto-serif-khmer-khmer-500-normal.woff",
  sans: "@fontsource/kantumruy-pro/files/kantumruy-pro-khmer-600-normal.woff",
};

type Hb = typeof import("harfbuzzjs");
type HbFont = InstanceType<Hb["Font"]>;
const store = globalThis as unknown as { __alHb?: Promise<{ hb: Hb; fonts: Record<KhmerFace, { font: HbFont; upem: number }> }> };

function load() {
  store.__alHb ??= (async () => {
    const hb = await import("harfbuzzjs");
    const make = (face: KhmerFace) => {
      const sfnt = woffToSfnt(fs.readFileSync(path.join(process.cwd(), "node_modules", FONT_FILES[face])));
      const f = new hb.Face(new hb.Blob(new Uint8Array(sfnt)));
      return { font: new hb.Font(f), upem: f.upem };
    };
    return { hb, fonts: { serif: make("serif"), sans: make("sans") } };
  })();
  return store.__alHb;
}

/**
 * Shape one line of text and return it as an SVG data URI with its pixel size.
 * Latin digits and spaces in the line are drawn from the same font (both
 * faces cover them). `color` is a literal (the image renderer cannot read CSS
 * variables), so callers pass the token value.
 */
export async function shapedLine(text: string, opts: { size: number; face: KhmerFace; color: string }): Promise<{ src: string; width: number; height: number }> {
  const { hb, fonts } = await load();
  const { font, upem } = fonts[opts.face];
  const buf = new hb.Buffer();
  buf.addText(text);
  buf.guessSegmentProperties();
  hb.shape(font, buf);
  const scale = opts.size / upem;
  let x = 0;
  const paths: string[] = [];
  const infos = buf.getGlyphInfos();
  const pos = buf.getGlyphPositions();
  infos.forEach((g, i) => {
    const d = font.glyphToPath(g.codepoint);
    const p = pos[i];
    if (d) paths.push(`<path transform="translate(${(x + p.xOffset) * scale} ${p.yOffset * scale}) scale(${scale} ${-scale})" d="${d}"/>`);
    x += p.xAdvance;
  });
  // Khmer stacks above and below the line: leave room for both.
  const ascent = opts.size * 1.15, descent = opts.size * 0.55;
  const width = Math.ceil(x * scale) + 2, height = Math.ceil(ascent + descent);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 ${-ascent} ${width} ${height}" fill="${opts.color}">${paths.join("")}</svg>`;
  return { src: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`, width, height };
}
