import { describe, expect, it } from "vitest";
import { MAX_PEOPLE, cityTextForSlug, citySlug, slugForCityText, forgetPerson, parsePeople, savePerson, serializePeople, validatePerson, type Person } from "@/lib/people";
import { CITIES } from "@/lib/cities";

describe("saved people", () => {
  const me: Person = { label: "Me", date: "1990-05-17", time: "08:30", city: "phnom-penh-cambodia" };

  it("validates and cleans", () => {
    expect(validatePerson(me)).toEqual(me);
    expect(validatePerson({ label: "  Mum \n ", date: "1960-02-29" })).toEqual({ label: "Mum", date: "1960-02-29" });
    expect(validatePerson({ label: "Dad", date: "1961-02-29" })).toBeNull();
    expect(validatePerson({ label: "Dad", date: "1899-12-31" })).toBeNull();
    expect(validatePerson({ label: "", date: "1990-01-01" })).toBeNull();
    expect(validatePerson({ label: "X", date: "1990-01-01", time: "25:00", city: "../etc" })).toEqual({ label: "X", date: "1990-01-01" });
    expect(validatePerson({ label: "x".repeat(40), date: "1990-01-01" })?.label).toHaveLength(24);
  });

  it("caps the list at six and replaces by label", () => {
    let list: Person[] = [];
    for (let i = 0; i < MAX_PEOPLE; i++) {
      const r = savePerson(list, { label: `P${i}`, date: "2000-01-01" });
      if (!r.ok) throw new Error("save failed");
      list = r.people;
    }
    expect(savePerson(list, { label: "Seventh", date: "2000-01-01" })).toEqual({ ok: false, reason: "full" });
    const replaced = savePerson(list, { label: "p0", date: "2001-02-03" });
    expect(replaced.ok && replaced.people[0]).toEqual({ label: "p0", date: "2001-02-03" });
    expect(forgetPerson(list, "P3").map((p) => p.label)).toEqual(["P0", "P1", "P2", "P4", "P5"]);
  });

  it("round-trips and ignores corrupt or foreign storage", () => {
    expect(parsePeople(serializePeople([me]))).toEqual([me]);
    expect(parsePeople(null)).toEqual([]);
    expect(parsePeople("{not json")).toEqual([]);
    expect(parsePeople(JSON.stringify({ v: 99, people: [me] }))).toEqual([]);
    expect(parsePeople(JSON.stringify({ v: 1, people: "x" }))).toEqual([]);
    expect(parsePeople(JSON.stringify({ v: 1, people: [me, { label: "bad" }, { ...me, label: "ME" }] }))).toEqual([me]);
    const many = Array.from({ length: 9 }, (_, i) => ({ label: `P${i}`, date: "2000-01-01" }));
    expect(parsePeople(JSON.stringify({ v: 1, people: many }))).toHaveLength(MAX_PEOPLE);
  });

  it("uses the same city slugs as lib/cities.ts", () => {
    for (const c of CITIES) expect(citySlug(c.name, c.country)).toBe(c.slug);
    expect(CITIES.some((c) => c.slug === "phnom-penh-cambodia")).toBe(true);
    expect(slugForCityText(CITIES, " phnom penh, cambodia ")).toBe("phnom-penh-cambodia");
    expect(slugForCityText(CITIES, "Atlantis")).toBeUndefined();
    expect(cityTextForSlug(CITIES, "phnom-penh-cambodia")).toBe("Phnom Penh, Cambodia");
    expect(cityTextForSlug(CITIES, "nowhere")).toBe("");
  });
});
