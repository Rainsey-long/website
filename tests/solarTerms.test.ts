/**
 * The 24 solar terms, pinned to published moments (not the code's own output).
 * Sources:
 *  - Equinoxes and solstices 2026: US Naval Observatory, "Earth's Seasons and
 *    Apsides" (aa.usno.navy.mil/data/Earth_Seasons), in UT: Mar 20 14:46,
 *    Jun 21 08:24, Sep 23 00:05, Dec 21 20:50.
 *  - Lichun 2026: Hong Kong Observatory, "The 24 Solar Terms" 2026 table:
 *    4 February 04:02 Hong Kong time (UTC+8) = 3 February 20:02 UT.
 * The tables are given to the minute, so the tolerance is 3 minutes.
 */
import { describe, expect, it } from "vitest";
import { SOLAR_TERMS, solarTermsForYear } from "../lib/solarTerms";

const near = (iso: string, expected: string, minutes = 3) =>
  expect(Math.abs(new Date(iso).getTime() - new Date(expected).getTime()) / 60_000).toBeLessThanOrEqual(minutes);
const find = (terms: ReturnType<typeof solarTermsForYear>, pinyin: string) => terms.find((t) => t.pinyin === pinyin)!;

describe("solar terms", () => {
  const y2026 = solarTermsForYear(2026);
  it("has 24 terms in order, 15° apart, inside the year", () => {
    expect(y2026).toHaveLength(24);
    expect(SOLAR_TERMS[2]).toMatchObject({ hanzi: "立春", longitude: 315 });
    expect(SOLAR_TERMS[5]).toMatchObject({ hanzi: "春分", longitude: 0 });
    for (let i = 1; i < 24; i++) expect(y2026[i].at > y2026[i - 1].at).toBe(true);
    expect(y2026[0].at.startsWith("2026-01")).toBe(true);
    expect(y2026[23].at.startsWith("2026-12")).toBe(true);
  });
  it("matches the USNO equinoxes and solstices for 2026", () => {
    near(find(y2026, "Chunfen").at, "2026-03-20T14:46:00Z");
    near(find(y2026, "Xiazhi").at, "2026-06-21T08:24:00Z");
    near(find(y2026, "Qiufen").at, "2026-09-23T00:05:00Z");
    near(find(y2026, "Dongzhi").at, "2026-12-21T20:50:00Z");
  });
  it("matches the Hong Kong Observatory's Lichun 2026", () => {
    near(find(y2026, "Lichun").at, "2026-02-03T20:02:00Z");
  });
  it("finds 24 terms at the edges of the supported range", () => {
    expect(solarTermsForYear(1900)).toHaveLength(24);
    expect(solarTermsForYear(2100)[23].at.startsWith("2100-12")).toBe(true);
  });
});
