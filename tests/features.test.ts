/**
 * Good hours, lucky-date finder and birth chart. Pinned to published values or
 * published rules, not to the code's own output (.claude/testing.md).
 */
import { describe, expect, it } from "vitest";
import { Solar } from "lunar-javascript";
import { chineseHours, planetaryHours } from "../lib/goodHours";
import { findLuckyDays, OCCASIONS } from "../lib/luckyFinder";
import { findAspects, midheaven, natalChart } from "../lib/natal";
import { addDays } from "../lib/dates";

const ZHI = "子丑寅卯辰巳午未申酉戌亥";

describe("Chinese good hours", () => {
  // The published rule (黄道吉时): the Azure Dragon hour starts at 申 on 子/午
  // days, 戌 on 丑/未, 子 on 寅/申, 寅 on 卯/酉, 辰 on 辰/戌, 午 on 巳/亥, and
  // the auspicious hours are the 1st, 2nd, 5th, 6th, 8th and 11th from it.
  const START = [8, 10, 0, 2, 4, 6, 8, 10, 0, 2, 4, 6];
  const GOOD = new Set([0, 1, 4, 5, 7, 10]);
  it("matches the Azure Dragon rule on 60 consecutive days", () => {
    for (let i = 0; i < 60; i++) {
      const date = addDays("2026-10-01", i);
      const [y, m, d] = date.split("-").map(Number);
      const dayZhi = ZHI.indexOf(Solar.fromYmd(y, m, d).getLunar().getDayZhi());
      for (const h of chineseHours(date).slice(0, 12)) {
        const offset = (ZHI.indexOf(h.branchHanzi) - START[dayZhi] + 12) % 12;
        expect(h.good, `${date} ${h.branchHanzi}`).toBe(GOOD.has(offset));
      }
    }
  });
  it("covers the whole day in 13 rows", () => {
    const rows = chineseHours("2026-10-04");
    expect(rows).toHaveLength(13);
    expect(rows[0].start).toBe("00:00");
    expect(rows[12].end).toBe("24:00");
    expect(rows[3].start).toBe("05:00");
    expect(rows[3].animal.slug).toBe("rabbit");
    expect(rows[3].clash.slug).toBe("rooster"); // 卯 clashes with 酉
  });
});

describe("planetary hours", () => {
  it("starts at the published sunrise (London, 21 June 2026, 04:43 BST)", () => {
    const d = planetaryHours("2026-06-21", 51.5074, -0.1278, "Europe/London");
    expect(d.fallback).toBe(false);
    const rise = new Date(d.sunrise!).getTime();
    expect(Math.abs(rise - Date.parse("2026-06-21T03:43:00Z"))).toBeLessThan(2 * 60_000);
  });
  it("gives a Sunday's first hour to the Sun and follows the Chaldean order", () => {
    const d = planetaryHours("2026-10-04", 11.5564, 104.9282, "Asia/Phnom_Penh"); // a Sunday
    expect(d.hours).toHaveLength(24);
    expect(d.hours.slice(0, 8).map((h) => h.planet)).toEqual(["sun", "venus", "mercury", "moon", "saturn", "jupiter", "mars", "sun"]);
    for (let i = 1; i < 24; i++) expect(d.hours[i].start).toBe(d.hours[i - 1].end);
    // The next day's first hour belongs to the Moon (Monday): 24 hours later in the cycle.
    expect(["sun", "venus", "mercury", "moon", "saturn", "jupiter", "mars"][24 % 7]).toBe("moon");
  });
  it("falls back to equal hours in the polar night", () => {
    const d = planetaryHours("2026-12-21", 78.22, 15.65, "Arctic/Longyearbyen");
    expect(d.fallback).toBe(true);
    expect(d.hours).toHaveLength(24);
  });
});

describe("lucky-date finder", () => {
  it("only returns days the almanac lists for the occasion, without clashes", () => {
    const wedding = OCCASIONS.find((o) => o.slug === "wedding")!;
    const res = findLuckyDays({ occasion: wedding, from: "2026-10-01", days: 120, avoidAnimals: ["rabbit", "dog"] });
    expect(res.length).toBeGreaterThan(5);
    for (const r of res) {
      expect(r.day.goodRaw).toContain("嫁娶");
      expect(r.day.avoidRaw).not.toContain("嫁娶");
      expect(["rabbit", "dog"]).not.toContain(r.day.clash.slug);
      expect(r.day.quality).not.toBe("challenging");
      expect(r.matched).toContain("Weddings");
    }
  });
  it("caps the range", () => {
    const travel = OCCASIONS.find((o) => o.slug === "travel")!;
    const res = findLuckyDays({ occasion: travel, from: "2026-01-01", days: 10_000, avoidAnimals: [] });
    expect(res.every((r) => r.day.date <= addDays("2026-01-01", 185))).toBe(true);
  });
});

describe("birth chart", () => {
  it("finds the 2020 great conjunction of Jupiter and Saturn at 0° Aquarius", () => {
    const c = natalChart({ date: "2020-12-21", time: "18:00", tz: "UTC", place: { lat: 51.5, lon: 0 } });
    const j = c.placements.find((p) => p.body === "jupiter")!;
    const s = c.placements.find((p) => p.body === "saturn")!;
    expect(j.signIndex).toBe(10);
    expect(s.signIndex).toBe(10);
    expect(j.degree).toBeLessThan(1);
    const asp = c.aspects.find((a) => a.a === "jupiter" && a.b === "saturn")!;
    expect(asp.kind).toBe("conjunction");
    expect(asp.orb).toBeLessThan(0.2);
  });
  it("places the Midheaven at 0° Aries when the meridian's right ascension is 0", () => {
    // Find an instant where sidereal time at longitude 0 is ~0h: the MC is then ~0°.
    const mc = midheaven(new Date("2026-09-22T23:56:00Z"), 0);
    expect(Math.min(mc, 360 - mc)).toBeLessThan(2);
  });
  it("uses whole-sign houses from the rising sign", () => {
    const c = natalChart({ date: "1990-05-15", time: "08:30", tz: "Asia/Phnom_Penh", place: { lat: 11.5564, lon: 104.9282 } });
    const ascSign = Math.floor(c.ascendant! / 30);
    for (const p of c.placements) expect(p.house).toBe(((p.signIndex - ascSign + 12) % 12) + 1);
  });
  it("flags an unknown-time Moon that changes sign that day, and drops houses", () => {
    // The Moon enters Cancer on 2 October 2026 at about 19:54 UTC.
    const c = natalChart({ date: "2026-10-02", time: null, tz: "UTC", place: null });
    expect(c.ascendant).toBeNull();
    expect(c.placements.every((p) => p.house === null)).toBe(true);
    expect(c.placements.find((p) => p.body === "moon")!.uncertain).toBe(true);
    expect(c.placements.find((p) => p.body === "saturn")!.uncertain).toBe(false);
  });
  it("leaves out aspects between two generational planets", () => {
    const asp = findAspects([{ body: "uranus", longitude: 10 }, { body: "neptune", longitude: 11 }, { body: "sun", longitude: 20 }]);
    expect(asp.map((a) => `${a.a}-${a.b}`).sort()).toEqual(["neptune-sun", "uranus-sun"]);
  });
});
