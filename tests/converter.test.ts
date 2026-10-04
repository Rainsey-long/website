/**
 * Date converter (lib/converter.ts). Pinned to published dates, not to the
 * code's own output: Visak Bochea and Pchum Ben as the Cambodian public
 * holiday calendars list them (the same cases tests/engine.test.ts pins for
 * the forward direction), and Chinese festivals from the published Chinese
 * calendar (Spring Festival, Mid-Autumn) plus the 2025 leap sixth month.
 */
import { describe, expect, it } from "vitest";
import { ageFacts, ageInYears, chineseNominalAge, daysToBirthday } from "@/lib/age";
import { convert, findChineseDate, findKhmerDates, isChineseQuery, isKhmerQuery, parseDateKey } from "@/lib/converter";

describe("Khmer lunar date to Gregorian", () => {
  it("finds Visak Bochea (15 waxing Pisakh)", () => {
    expect(findKhmerDates({ year: 2025, month: 5, phase: "waxing", day: 15 })).toEqual(["2025-05-11"]);
    expect(findKhmerDates({ year: 2026, month: 5, phase: "waxing", day: 15 })).toEqual(["2026-05-01"]);
  });
  it("finds Pchum Ben (15 waning Phatrabot)", () => {
    expect(findKhmerDates({ year: 2025, month: 9, phase: "waning", day: 15 })).toEqual(["2025-09-22"]);
    expect(findKhmerDates({ year: 2026, month: 9, phase: "waning", day: 15 })).toEqual(["2026-10-11"]);
  });
  it("round-trips with the forward conversion over a whole year", () => {
    for (const date of ["2027-01-03", "2027-04-14", "2027-08-30", "2027-12-31"]) {
      const k = convert(date, "2026-10-04").khmer;
      expect(findKhmerDates({ year: 2027, month: k.monthIndex, phase: k.phase, day: k.day })).toContain(date);
    }
  });
  it("validates queries", () => {
    expect(isKhmerQuery({ year: 2026, month: 5, phase: "waxing", day: 15 })).toBe(true);
    expect(isKhmerQuery({ year: 2026, month: 14, phase: "waxing", day: 15 })).toBe(false);
    expect(isKhmerQuery({ year: 2026, month: 5, phase: "waxing", day: 16 })).toBe(false);
    expect(isKhmerQuery({ year: 1800, month: 5, phase: "waxing", day: 1 })).toBe(false);
  });
});

describe("Chinese lunar date to Gregorian", () => {
  it("finds Spring Festival and Mid-Autumn", () => {
    expect(findChineseDate({ year: 2026, month: 1, day: 1, leap: false })).toMatchObject({ ok: true, date: "2026-02-17" });
    expect(findChineseDate({ year: 2025, month: 8, day: 15, leap: false })).toMatchObject({ ok: true, date: "2025-10-06" });
    expect(findChineseDate({ year: 2026, month: 8, day: 15, leap: false })).toMatchObject({ ok: true, date: "2026-09-25" });
  });
  it("knows 2025's leap sixth month and refuses one that does not exist", () => {
    expect(findChineseDate({ year: 2025, month: 6, day: 1, leap: true })).toMatchObject({ ok: true, date: "2025-07-25", leapMonth: 6 });
    expect(findChineseDate({ year: 2026, month: 6, day: 1, leap: true })).toMatchObject({ ok: false, reason: "no-leap" });
  });
  it("says so when a month has no 30th day instead of rolling over", () => {
    const r = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => findChineseDate({ year: 2026, month: m, day: 30, leap: false }));
    expect(r.some((x) => !x.ok && x.reason === "no-day-30")).toBe(true);
    expect(r.some((x) => x.ok)).toBe(true);
  });
  it("validates queries", () => {
    expect(isChineseQuery({ year: 2026, month: 8, day: 15, leap: false })).toBe(true);
    expect(isChineseQuery({ year: 2026, month: 13, day: 1, leap: false })).toBe(false);
    expect(isChineseQuery({ year: 2026, month: 8, day: 31, leap: false })).toBe(false);
  });
});

describe("ages and parsing", () => {
  it("counts completed years", () => {
    expect(ageInYears("1990-10-05", "2026-10-04")).toBe(35);
    expect(ageInYears("1990-10-04", "2026-10-04")).toBe(36);
    expect(ageInYears("2000-02-29", "2026-02-28")).toBe(25);
  });
  it("counts the Chinese nominal age (one at birth, plus one at each Lunar New Year)", () => {
    // Born 1 Feb 2000 (before LNY 5 Feb 2000, so a Rabbit-year baby of 1999).
    expect(chineseNominalAge("2000-02-01", "2000-02-04")).toBe(1);
    expect(chineseNominalAge("2000-02-01", "2000-02-05")).toBe(2);
    expect(chineseNominalAge("2000-02-01", "2026-10-04")).toBe(28);
  });
  it("parses only real dates in range", () => {
    expect(parseDateKey("2026-02-29")).toBeNull();
    expect(parseDateKey("2024-02-29")).toBe("2024-02-29");
    expect(parseDateKey("1899-12-31")).toBeNull();
    expect(parseDateKey("2026-1-1")).toBeNull();
  });
  it("counts days to the next birthday", () => {
    expect(daysToBirthday("1990-10-05", "2026-10-04")).toBe(1);
    expect(daysToBirthday("1990-10-04", "2026-10-04")).toBe(0);
    expect(daysToBirthday("2000-02-29", "2026-02-28")).toBe(1);
    expect(convert("2027-01-01", "2026-10-04").daysFromToday).toBe(89);
  });
  it("gives the Khmer BE year, animal and sak of a birth date", () => {
    // Born 1 January 1990: Khmer year of the Snake (Masagn) until Songkran 1990, BE 2533.
    const f = ageFacts("1990-01-01", "2026-10-04");
    expect(f.khmer.beYear).toBe(2533);
    expect(f.khmer.animal.slug).toBe("snake");
    expect(f.chinese.animal.slug).toBe("snake");
    expect(f.weekday.en).toBe("Monday");
  });
});
