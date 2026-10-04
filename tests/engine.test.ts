import { describe, expect, it } from "vitest";
import * as Astronomy from "astronomy-engine";
import { sunSign, signBySlug } from "../lib/western";
import { zodiacYearForDate, zodiacLabel, animalBySlug, lunarNewYear, luckyNumbers } from "../lib/chinese";
import { chineseScore, westernScore, pairSlug } from "../lib/compatibility";
import { ascendant, ascendantFromRamc, meanObliquity, moonInfo, skyForDay } from "../lib/sky";
import { hash, rng } from "../lib/random";
import { traditions, traditionsDiffer } from "../lib/sea-variants";
import { almanacDay } from "../lib/almanac";
import { localToUtc, baziYear } from "../lib/calculator";
import { Solar } from "lunar-javascript";
import { khmerDay, songkran, khmerAnimalAt } from "../lib/khmer";

const noonUtc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d, 12));
const label = (y: number, m: number, d: number) => zodiacLabel(zodiacYearForDate(y, m, d));

describe("plan §6 required cases", () => {
  it("1990-03-15: Pisces, Metal Horse", () => {
    expect(sunSign(noonUtc(1990, 3, 15)).sign.name).toBe("Pisces");
    expect(label(1990, 3, 15)).toBe("Metal Horse");
  });

  it("1990-01-20: Aquarius only if Sun lon ≥ 300°, cusp flagged; Earth Snake", () => {
    const r = sunSign(noonUtc(1990, 1, 20));
    expect(r.sign.name).toBe(r.longitude >= 300 ? "Aquarius" : "Capricorn");
    expect(r.cusp).not.toBeNull();
    expect(lunarNewYear(1990)).toBe("1990-01-27");
    expect(label(1990, 1, 20)).toBe("Earth Snake");
  });

  it("2000-02-04: Earth Rabbit (LNY 2000 = 5 Feb)", () => {
    expect(lunarNewYear(2000)).toBe("2000-02-05");
    expect(label(2000, 2, 4)).toBe("Earth Rabbit");
  });

  it("2026-02-16 Wood Snake, 2026-02-17 Fire Horse", () => {
    expect(label(2026, 2, 16)).toBe("Wood Snake");
    expect(label(2026, 2, 17)).toBe("Fire Horse");
  });

  it("2027-02-06: Fire Goat", () => {
    expect(lunarNewYear(2027)).toBe("2027-02-06");
    expect(label(2027, 2, 6)).toBe("Fire Goat");
    expect(label(2027, 2, 5)).toBe("Fire Horse");
  });

  it("Rat + Dragon: Three Harmonies, ≥ 90", () => {
    const s = chineseScore(animalBySlug("rat")!, animalBySlug("dragon")!);
    expect(s.relation).toBe("three-harmonies");
    expect(s.score).toBeGreaterThanOrEqual(90);
  });

  it("Rat + Horse: Six Clashes, ≤ 40", () => {
    const s = chineseScore(animalBySlug("rat")!, animalBySlug("horse")!);
    expect(s.relation).toBe("clash");
    expect(s.score).toBeLessThanOrEqual(40);
  });
});

describe("Chinese details", () => {
  it("BaZi year pillar turns at Lichun, not Lunar New Year", () => {
    // 2027-02-05: after Lichun (4 Feb) but before LNY (6 Feb)
    expect(baziYear(new Date("2027-02-05T12:00:00Z")).pillar).toBe("Ding Wei");
    expect(baziYear(new Date("2027-02-03T12:00:00Z")).pillar).toBe("Bing Wu");
    expect(label(2027, 2, 5)).toBe("Fire Horse");
  });
  it("pair scores are symmetric", () => {
    const a = animalBySlug("tiger")!, b = animalBySlug("pig")!;
    expect(chineseScore(a, b)).toEqual(chineseScore(b, a));
    const x = signBySlug("aries")!, y = signBySlug("libra")!;
    expect(westernScore(x, y)).toEqual(westernScore(y, x));
    expect(pairSlug("leo", "aries")).toBe("aries-and-leo");
  });
  it("lucky numbers are deterministic", () => {
    expect(luckyNumbers("fire", animalBySlug("goat")!)).toEqual([2, 7, 8]);
  });
});

describe("seeded RNG", () => {
  it("same seed, same sequence", () => {
    const a = rng(hash("scorpio2026-10-05"));
    const b = rng(hash("scorpio2026-10-05"));
    const seqA = Array.from({ length: 5 }, a);
    expect(Array.from({ length: 5 }, b)).toEqual(seqA);
    expect(hash("aries")).toBe(hash("aries"));
    expect(hash("aries")).not.toBe(hash("taurus"));
  });
});

describe("houses (solar-sign)", () => {
  it("house = ((moon − sun + 12) mod 12) + 1", async () => {
    const { solarHouse } = await import("../lib/reading-engine");
    expect(solarHouse(0, 0)).toBe(1);
    expect(solarHouse(7, 0)).toBe(8);
    expect(solarHouse(0, 11)).toBe(2);
    expect(solarHouse(10, 11)).toBe(12);
  });
});

describe("Khmer variant boundary", () => {
  it("between Lunar New Year and Khmer New Year the traditions differ", () => {
    // 2026-03-01: Fire Horse by LNY (17 Feb), still Snake by Khmer New Year (14 Apr)
    const t = traditions(2026, 3, 1);
    expect(t[0].animal.slug).toBe("horse");
    expect(t[1].animal.slug).toBe("snake");
    expect(traditionsDiffer(t)).toBe(true);
    expect(t[2].animalName).toContain("Horse");
  });
  it("after Khmer New Year they agree", () => {
    const t = traditions(2026, 5, 1);
    expect(traditionsDiffer(t)).toBe(false);
  });
  it("Vietnamese uses Cat for Rabbit", () => {
    expect(traditions(2023, 6, 1)[2].animalName).toContain("Cat");
  });
});

describe("rising sign", () => {
  it("matches the London table of houses at RAMC 0° (Asc 26°36′ Cancer)", () => {
    const asc = ascendantFromRamc(0, 51.5, 23.44);
    expect(asc).toBeGreaterThan(116.4);
    expect(asc).toBeLessThan(116.8);
  });
  it("is Libra 0° at RAMC 90° for any latitude, Cancer 0° at the equator at RAMC 0°", () => {
    expect(ascendantFromRamc(90, 40, 23.44)).toBeCloseTo(180, 6);
    expect(ascendantFromRamc(0, 0, 23.44)).toBeCloseTo(90, 6);
  });

  // Five reference charts: verify independently that the computed ascendant
  // sits on the horizon (altitude 0) on the eastern side.
  const charts = [
    { name: "London", date: "1990-03-15T09:30:00Z", lat: 51.5074, lon: -0.1278 },
    { name: "New York", date: "1985-07-04T16:00:00Z", lat: 40.7128, lon: -74.006 },
    { name: "Phnom Penh", date: "2000-01-01T03:00:00Z", lat: 11.5564, lon: 104.9282 },
    { name: "Sydney", date: "1975-11-20T22:15:00Z", lat: -33.8688, lon: 151.2093 },
    { name: "Reykjavík", date: "2010-06-21T12:00:00Z", lat: 64.1466, lon: -21.9426 },
  ];
  for (const c of charts) {
    it(`${c.name}: ascendant is on the eastern horizon`, () => {
      const date = new Date(c.date);
      const asc = ascendant(date, c.lat, c.lon);
      const D = Math.PI / 180;
      const eps = meanObliquity(date) * D;
      const lam = asc * D;
      const ra = Math.atan2(Math.sin(lam) * Math.cos(eps), Math.cos(lam));
      const dec = Math.asin(Math.sin(eps) * Math.sin(lam));
      const lst = (Astronomy.SiderealTime(date) * 15 + c.lon) * D;
      const H = lst - ra;
      const alt = Math.asin(Math.sin(c.lat * D) * Math.sin(dec) + Math.cos(c.lat * D) * Math.cos(dec) * Math.cos(H));
      expect(Math.abs(alt / D)).toBeLessThan(1e-6);
      expect(Math.sin(H)).toBeLessThan(0); // east of the meridian
    });
  }
});

describe("sky and almanac", () => {
  it("moon info has a sane phase and illumination", () => {
    const m = moonInfo(noonUtc(2026, 10, 5));
    expect(m.illumination).toBeGreaterThanOrEqual(0);
    expect(m.illumination).toBeLessThanOrEqual(100);
    expect(m.signIndex).toBeGreaterThanOrEqual(0);
  });
  it("sky day is deterministic", () => {
    expect(skyForDay("2026-10-05")).toEqual(skyForDay("2026-10-05"));
  });
  it("every almanac term across 2025–2028 has an English label", () => {
    let d = Solar.fromYmd(2025, 1, 1);
    for (let i = 0; i < 365 * 4; i++) {
      expect(() => almanacDay(d.toYmd())).not.toThrow();
      d = d.next(1);
    }
  });
  it("almanac day exposes a clash animal", () => {
    expect(almanacDay("2026-10-04").clash.slug).toBe("snake");
  });
});

describe("calculator time handling", () => {
  it("converts local time in a time zone to UTC", () => {
    expect(localToUtc("1990-03-15", "09:30", "Asia/Phnom_Penh").toISOString()).toBe("1990-03-15T02:30:00.000Z");
    expect(localToUtc("2021-07-01", "12:00", "Europe/London").toISOString()).toBe("2021-07-01T11:00:00.000Z");
  });
});

describe("reading engine", () => {
  it("is deterministic per sign and date", async () => {
    const { dailyReading } = await import("../lib/reading-engine");
    const s = signBySlug("scorpio")!;
    expect(dailyReading(s, "2026-10-05")).toEqual(dailyReading(s, "2026-10-05"));
  });

  it("no full reading repeats for any sign within 30 days, across a full year", async () => {
    const { dailyReading } = await import("../lib/reading-engine");
    const { skyForDay } = await import("../lib/sky");
    const { SIGNS } = await import("../lib/western");
    const { addDays } = await import("../lib/dates");
    const days: string[] = [];
    for (let i = 0; i < 365; i++) days.push(addDays("2026-10-01", i));
    const skies = new Map(days.map((d) => [d, skyForDay(d)]));
    for (const sign of SIGNS) {
      const keys = days.map((d) => dailyReading(sign, d, skies.get(d)).topics.map((t) => t.blockIds.join("+")).join("|"));
      for (let i = 0; i < keys.length; i++) {
        for (let j = i + 1; j < Math.min(keys.length, i + 31); j++) {
          expect(keys[i] === keys[j], `${sign.slug} ${days[i]} vs ${days[j]}`).toBe(false);
        }
      }
    }
  }, 120_000);
});

describe("Lunar New Year table", () => {
  it("matches lunar-javascript for 1900–2100", async () => {
    const { Lunar } = await import("lunar-javascript");
    for (let y = 1900; y <= 2100; y++) {
      expect(lunarNewYear(y)).toBe(Lunar.fromYmd(y, 1, 1).getSolar().toYmd());
    }
  });
});

describe("Khmer calendar (Chhankitek via momentkh)", () => {
  it("matches known festival dates", () => {
    expect(khmerDay("2025-05-11").festival?.id).toBe("visak-bochea");
    expect(khmerDay("2024-05-22").festival?.id).toBe("visak-bochea");
    expect(khmerDay("2026-05-01").festival?.id).toBe("visak-bochea");
    expect(khmerDay("2025-09-22").festival?.id).toBe("pchum-ben");
    expect(khmerDay("2026-10-11").festival?.id).toBe("pchum-ben");
  });
  it("labels today's date the Khmer way", () => {
    expect(khmerDay("2026-10-04").labelKm).toBe("ថ្ងៃអាទិត្យ ៨រោច ខែភទ្របទ ឆ្នាំមមី អដ្ឋស័ក ព.ស. ២៥៧០");
    expect(khmerDay("2026-10-04").sila).toBe(true);
  });
  it("puts four holy days in every lunar month", () => {
    let count = 0;
    for (let d = new Date(Date.UTC(2026, 0, 1)); d.getUTCFullYear() === 2026; d.setUTCDate(d.getUTCDate() + 1)) {
      if (khmerDay(d.toISOString().slice(0, 10)).sila) count++;
    }
    expect(count).toBeGreaterThanOrEqual(48);
    expect(count).toBeLessThanOrEqual(52);
  });
  it("Moha Songkran moment and angel match km.wikipedia 2020–2026", () => {
    const expected: Array<[number, string, string, string]> = [
      [2020, "2020-04-13", "20:48", "Koreak Tevy"], [2021, "2021-04-14", "04:00", "Mondea Tevy"],
      [2022, "2022-04-14", "10:00", "Kirinei Tevy"], [2023, "2023-04-14", "16:00", "Kimira Tevy"],
      [2024, "2024-04-13", "22:17", "Mohorea Tevy"], [2025, "2025-04-14", "04:48", "Koreak Tevy"],
      [2026, "2026-04-14", "10:48", "Reaksa Tevy"],
    ];
    for (const [y, date, time, angel] of expected) {
      const s = songkran(y);
      expect([s.date, s.time, s.angel.roman]).toEqual([date, time, angel]);
    }
  });
  it("an official override replaces the calculated moment", () => {
    const s = songkran(2024, { date: "2024-04-13", time: "22:24" });
    expect(s.time).toBe("22:24");
    expect(s.source).toBe("official");
  });
  it("the Khmer animal turns at the Songkran minute, not the day", () => {
    expect(khmerAnimalAt("2026-04-14", "10:47").slug).toBe("snake");
    expect(khmerAnimalAt("2026-04-14", "10:49").slug).toBe("horse");
  });
});

describe("sky events against published 2026 tables", () => {
  it("retrograde stations", async () => {
    const { retrogradesForYear } = await import("../lib/skyEvents");
    const r = retrogradesForYear(2026).map((x) => `${x.planet} ${x.stationRx.at.slice(0, 10)} ${x.stationD.at.slice(0, 10)}`);
    expect(r).toContain("mercury 2026-02-26 2026-03-20");
    expect(r).toContain("mercury 2026-06-29 2026-07-23");
    expect(r).toContain("mercury 2026-10-24 2026-11-13");
    expect(r).toContain("venus 2026-10-03 2026-11-14");
    expect(r.some((x) => x.startsWith("mars"))).toBe(false); // Mars turns retrograde in January 2027
  }, 30_000);
  it("eclipses", async () => {
    const { eclipsesForYear } = await import("../lib/skyEvents");
    expect(eclipsesForYear(2026).map((e) => `${e.body} ${e.kind} ${e.at.slice(0, 10)}`)).toEqual([
      "sun annular 2026-02-17", "moon total 2026-03-03", "sun total 2026-08-12", "moon partial 2026-08-28",
    ]);
  });
  it("moon phases for October 2026", async () => {
    const { moonPhases } = await import("../lib/skyEvents");
    expect(moonPhases("2026-10-01T00:00:00Z", "2026-11-01T00:00:00Z").map((p) => `${p.name} ${p.at.slice(0, 10)}`)).toEqual([
      "Last quarter 2026-10-03", "New moon 2026-10-10", "First quarter 2026-10-18", "Full moon 2026-10-26",
    ]);
  });
});
