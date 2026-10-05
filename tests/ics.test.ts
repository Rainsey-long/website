/** Calendar feeds in both languages: valid folding, distinct UIDs, Khmer titles. */
import { describe, expect, it } from "vitest";
import { feedEvents, toIcs } from "../lib/ics";

describe("calendar feeds", () => {
  it("builds a Khmer edition with its own UIDs and Khmer titles", () => {
    const en = feedEvents("khmer-holy-days", 2026, 2026, "en");
    const km = feedEvents("khmer-holy-days", 2026, 2026, "km");
    expect(km.length).toBe(en.length);
    expect(km[0].uid).toBe(`${en[0].uid}-km`);
    expect(km[0].title).toBe("ថ្ងៃសីល");
    const moon = feedEvents("moon-phases", 2026, 2026, "km");
    expect(moon[0].title).toMatch(/^ព្រះចន្ទ.+ក្នុងរាសី.+/);
    expect(feedEvents("khmer-festivals", 2026, 2026, "km").some((e) => e.title.startsWith("ចូលឆ្នាំខ្មែរ"))).toBe(true);
  });
  it("adds an eve note before each holy day without changing the holy days' UIDs", () => {
    const plain = feedEvents("khmer-holy-days", 2026, 2026, "en");
    const withEve = feedEvents("khmer-holy-days", 2026, 2026, "en", { eve: true });
    const holy = withEve.filter((e) => !e.uid.includes("-eve"));
    expect(holy.map((e) => e.uid)).toEqual(plain.map((e) => e.uid));
    const eves = withEve.filter((e) => e.uid.includes("-eve"));
    expect(eves.length).toBe(plain.length);
    // Visak Bochea 2026 (15 waxing Pisakh) is 1 May 2026, a published
    // Cambodian public holiday (pinned in engine.test.ts); its eve is 30 April.
    expect(plain.some((e) => e.uid === "sila-2026-05-01")).toBe(true);
    const visakEve = eves.find((e) => e.uid === "sila-2026-05-01-eve")!;
    expect(visakEve.start).toBe("2026-04-30");
    expect(visakEve.allDay).toBe(true);
    const km = feedEvents("khmer-holy-days", 2026, 2026, "km", { eve: true });
    expect(km.find((e) => e.uid === "sila-2026-05-01-eve-km")!.title).toBe("ថ្ងៃមុនថ្ងៃសីល");
    // Other feeds ignore the option.
    expect(feedEvents("khmer-festivals", 2026, 2026, "en", { eve: true })).toEqual(feedEvents("khmer-festivals", 2026, 2026, "en"));
  });
  it("folds every line at 75 octets", () => {
    const body = toIcs("ពិធីបុណ្យខ្មែរ", feedEvents("khmer-festivals", 2026, 2026, "km"), "km");
    for (const line of body.split("\r\n")) expect(Buffer.byteLength(line)).toBeLessThanOrEqual(75);
    expect(body).toContain("PRODID:-//");
    expect(body).toContain("//KM");
  });
});
