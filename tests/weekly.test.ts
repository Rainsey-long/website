/**
 * Weekly horoscopes (lib/weekly.ts). Pinned to published sky events: the
 * October 2026 phases (new Moon 10 Oct in Libra, full Moon 26 Oct in Taurus),
 * Mercury's station retrograde on 24 Oct 2026 and the total solar eclipse of
 * 12 Aug 2026, the same values tests/engine.test.ts pins for the sky pages.
 */
import { describe, expect, it } from "vitest";
import { isMonday, mondayOf, weeklyReading, weekSkyEvents, weekSkyYears, WEEKLY_BLOCKS, PHASE_KEYS } from "@/lib/weekly";
import { dailyReading, TOPICS } from "@/lib/reading-engine";
import { SIGNS, signBySlug } from "@/lib/western";
import { addDays } from "@/lib/dates";

const aries = signBySlug("aries")!;

describe("weekly horoscope", () => {
  it("finds the Monday of any day", () => {
    expect(mondayOf("2026-10-05")).toBe("2026-10-05");
    expect(mondayOf("2026-10-11")).toBe("2026-10-05");
    expect(mondayOf("2026-10-12")).toBe("2026-10-12");
    expect(isMonday("2026-10-05")).toBe(true);
    expect(isMonday("2026-10-06")).toBe(false);
  });

  it("keys the overview on the week's new or full Moon and its house", () => {
    // New Moon 10 Oct 2026 in Libra: Aries' 7th house, Libra's 1st.
    const w = weeklyReading(aries, "2026-10-05");
    expect(w.lunation.key).toBe("new");
    expect(w.lunation.at.slice(0, 10)).toBe("2026-10-10");
    expect(w.overview.id).toBe("week-new-7");
    expect(weeklyReading(signBySlug("libra")!, "2026-10-05").overview.id).toBe("week-new-1");
    // Full Moon 26 Oct 2026 in Taurus: Aries' 2nd house.
    expect(weeklyReading(aries, "2026-10-26").overview.id).toBe("week-full-2");
  });

  it("gives the same sign-independent sky events for the /sky/week digest", () => {
    // Mercury turns retrograde on 26 Feb 2026 (the published 2026 table pinned in engine.test.ts).
    const feb = weekSkyEvents("2026-02-23");
    expect(feb.map((e) => `${e.kind} ${e.body} ${e.date}`)).toContain("station-rx mercury 2026-02-26");
    expect(weekSkyEvents("2026-08-10").filter((e) => e.kind === "eclipse").map((e) => `${e.body} ${e.eclipseKind} ${e.date}`)).toEqual(["sun total 2026-08-12"]);
    const withHouses = weeklyReading(aries, "2026-10-19").events.map((e) => { const copy: Partial<typeof e> = { ...e }; delete copy.house; return copy; });
    expect(withHouses).toEqual(weekSkyEvents("2026-10-19"));
    expect(weekSkyYears("2026-12-28")).toEqual([2025, 2026, 2027]);
  });

  it("lists stations and eclipses that fall in the week", () => {
    const rx = weeklyReading(aries, "2026-10-19").events.filter((e) => e.kind === "station-rx");
    expect(rx.map((e) => `${e.body} ${e.date}`)).toContain("mercury 2026-10-24");
    const ecl = weeklyReading(aries, "2026-08-10").events.filter((e) => e.kind === "eclipse");
    expect(ecl.map((e) => `${e.body} ${e.eclipseKind} ${e.date}`)).toEqual(["sun total 2026-08-12"]);
  });

  it("has an overview for every week, including weeks with no principal phase", () => {
    let carried = 0;
    for (let i = 0; i < 160; i++) {
      const monday = addDays("2024-01-01", 7 * i);
      const w = weeklyReading(aries, monday);
      expect(w.overview.text.length).toBeGreaterThan(20);
      if (w.phases.length === 0) { carried++; expect(w.lunation.at < `${monday}T00:00:00.000Z`).toBe(true); }
    }
    expect(carried).toBeGreaterThan(0);
  });

  it("agrees with the daily engine on the best day for each topic", () => {
    const w = weeklyReading(aries, "2026-10-05");
    TOPICS.forEach((topic, t) => {
      const max = Math.max(...w.days.map((d) => dailyReading(aries, d).topics[t].energy));
      expect(w.best[topic].energy).toBe(max);
    });
  });

  it("covers the Moon's path for all seven days and every phase-house block exists", () => {
    const w = weeklyReading(SIGNS[3], "2026-10-05");
    expect(w.moonPath[0].from).toBe("2026-10-05");
    expect(w.moonPath[w.moonPath.length - 1].to).toBe("2026-10-11");
    expect(WEEKLY_BLOCKS).toHaveLength(48);
    for (const ph of PHASE_KEYS) for (let h = 1; h <= 12; h++) expect(WEEKLY_BLOCKS.some((b) => b.conditions.phase === ph && b.conditions.house[0] === h)).toBe(true);
  });

  it("uses the owner's edit over the repository text", () => {
    const edited = weeklyReading(aries, "2026-10-05", new Map([["week-new-7", "Edited."]]), "en");
    expect(edited.overview.text).toBe("Edited.");
  });
});
