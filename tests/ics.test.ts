/** Calendar feeds (English only since 2026-10-05): valid folding, stable UIDs. */
import { describe, expect, it } from "vitest";
import { feedEvents, toIcs } from "../lib/ics";

describe("calendar feeds", () => {
  it("keeps the English UIDs and titles, with Khmer tradition names inline", () => {
    const holy = feedEvents("khmer-holy-days", 2026, 2026);
    expect(holy.every((e) => !e.uid.endsWith("-km"))).toBe(true);
    expect(holy[0].title).toBe("Buddhist holy day (ថ្ងៃសីល)");
    const moon = feedEvents("moon-phases", 2026, 2026);
    expect(moon[0].title).toMatch(/ in [A-Z][a-z]+$/);
    expect(feedEvents("khmer-festivals", 2026, 2026).some((e) => e.uid === "kh-new-year-2026" && e.title.startsWith("Khmer New Year:"))).toBe(true);
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
    expect(visakEve.title).toBe("Eve of a Buddhist holy day (ថ្ងៃសីល)");
    // Other feeds ignore the option.
    expect(feedEvents("khmer-festivals", 2026, 2026, "en", { eve: true })).toEqual(feedEvents("khmer-festivals", 2026, 2026, "en"));
  });
  it("folds every line at 75 octets", () => {
    // Festival titles carry Khmer script (3 octets a character), so folding is counted in bytes.
    const body = toIcs("Khmer festivals", feedEvents("khmer-festivals", 2026, 2026));
    for (const line of body.split("\r\n")) expect(Buffer.byteLength(line)).toBeLessThanOrEqual(75);
    expect(body).toContain("PRODID:-//");
    expect(body).toContain("//EN");
  });
});
