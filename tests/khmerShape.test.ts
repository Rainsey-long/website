/** Khmer in share images: WOFF unpacking and HarfBuzz shaping (lib/khmerShape.ts). */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as hb from "harfbuzzjs";
import { shapedLine, woffToSfnt } from "../lib/khmerShape";

const woff = fs.readFileSync(path.join(process.cwd(), "node_modules/@fontsource/noto-serif-khmer/files/noto-serif-khmer-khmer-500-normal.woff"));

describe("Khmer shaping for share images", () => {
  it("unpacks WOFF 1 into an SFNT HarfBuzz can read", () => {
    const sfnt = woffToSfnt(woff);
    expect(sfnt.readUInt32BE(0)).toBe(woff.readUInt32BE(4)); // same flavor
    const face = new hb.Face(new hb.Blob(new Uint8Array(sfnt)));
    expect(face.upem).toBeGreaterThan(0);
  });
  it("forms the subscript in ស្ត្រី instead of drawing a visible coeng", () => {
    const face = new hb.Face(new hb.Blob(new Uint8Array(woffToSfnt(woff))));
    const font = new hb.Font(face);
    const buf = new hb.Buffer();
    buf.addText("ស្ត្រី"); // 6 code points: base, coeng, ta, coeng, ro, vowel
    buf.guessSegmentProperties();
    hb.shape(font, buf);
    const coeng = new hb.Buffer();
    coeng.addText("្");
    coeng.guessSegmentProperties();
    hb.shape(font, coeng);
    const lone = coeng.getGlyphInfos()[0].codepoint;
    // Shaped: the coengs become subscript forms, never the stand-alone ្ glyph.
    expect(buf.getGlyphInfos().map((g) => g.codepoint)).not.toContain(lone);
  });
  it("returns an SVG image sized to the text", async () => {
    const l = await shapedLine("វិច្ឆិក", { size: 96, face: "serif", color: "#1C2340" });
    expect(l.src.startsWith("data:image/svg+xml;base64,")).toBe(true);
    expect(l.width).toBeGreaterThan(100);
    expect(Buffer.from(l.src.split(",")[1], "base64").toString()).toContain("<path");
  });
});
