// Fails the build on malformed text blocks (plan 2.1).
import { readFileSync, readdirSync } from "node:fs";

const dir = new URL("../content/blocks/", import.meta.url);
const TOPICS = ["love", "career", "money", "mood"];
const PHASES = ["new", "waxing", "full", "waning"];
const PLANETS = ["mercury", "venus", "mars"];
const ELEMENTS = ["fire", "earth", "air", "water"];
const BANNED = [/\bdiagnos/i, /\bdisease\b/i, /\bmedication\b/i, /\bbuy (stocks|shares|crypto)/i, /\binvest in\b/i, /\bguarantee/i, /\bdestiny\b/i, /\bdisaster\b/i, /!/];

const errors: string[] = [];
const ids = new Set<string>();
let count = 0;
for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  const blocks = JSON.parse(readFileSync(new URL(file, dir), "utf8"));
  if (!Array.isArray(blocks)) { errors.push(`${file}: not an array`); continue; }
  const coverage = new Map<number, number>();
  for (const b of blocks) {
    count++;
    const where = `${file}:${b?.id ?? "?"}`;
    if (typeof b.id !== "string" || !/^[a-z0-9-]+$/.test(b.id)) errors.push(`${where}: bad id`);
    if (ids.has(b.id)) errors.push(`${where}: duplicate id`);
    ids.add(b.id);
    if (!TOPICS.includes(b.topic)) errors.push(`${where}: bad topic`);
    if (b.topic !== file.replace(".json", "")) errors.push(`${where}: topic does not match file`);
    if (!["base", "modifier"].includes(b.kind)) errors.push(`${where}: bad kind`);
    if (typeof b.text !== "string" || b.text.length < 20 || b.text.length > 400) errors.push(`${where}: text length`);
    if (b.text && !/[.?]$/.test(b.text)) errors.push(`${where}: text must end with a full stop`);
    for (const re of BANNED) if (re.test(b.text ?? "")) errors.push(`${where}: banned wording ${re}`);
    if (b.text_km !== undefined) {
      // Khmer draft (lib/i18n.ts): ends with the Khmer full stop, no exclamation marks.
      if (typeof b.text_km !== "string" || b.text_km.length < 10 || b.text_km.length > 800) errors.push(`${where}: text_km length`);
      else if (!/[។?]$/.test(b.text_km)) errors.push(`${where}: text_km must end with ។`);
      if (typeof b.text_km === "string" && b.text_km.includes("!")) errors.push(`${where}: text_km has an exclamation mark`);
    }
    const c = b.conditions ?? {};
    const keys = Object.keys(c);
    if (b.kind === "base") {
      if (!Array.isArray(c.house) || !c.house.every((h: number) => Number.isInteger(h) && h >= 1 && h <= 12)) errors.push(`${where}: base needs house 1–12`);
      else c.house.forEach((h: number) => coverage.set(h, (coverage.get(h) ?? 0) + 1));
    } else if (keys.length !== 1) errors.push(`${where}: modifier needs exactly one condition`);
    if (c.moonPhase && !c.moonPhase.every((p: string) => PHASES.includes(p))) errors.push(`${where}: bad moonPhase`);
    if (c.retrograde && !c.retrograde.every((p: string) => PLANETS.includes(p))) errors.push(`${where}: bad retrograde`);
    if (c.moonElement && !c.moonElement.every((p: string) => ELEMENTS.includes(p))) errors.push(`${where}: bad moonElement`);
  }
  for (let h = 1; h <= 12; h++) if ((coverage.get(h) ?? 0) !== 3) errors.push(`${file}: house ${h} needs exactly 3 base variants (the rotation in reading-engine.ts relies on it)`);
}

// Weekly overviews (lib/weekly.ts): exactly one block per Moon phase and house.
const WEEK_PHASES = ["new", "first", "full", "last"];
const weekly = JSON.parse(readFileSync(new URL("../content/weekly/lunations.json", import.meta.url), "utf8"));
const weekSeen = new Set<string>();
for (const b of weekly) {
  count++;
  const where = `weekly:${b?.id ?? "?"}`;
  if (typeof b.id !== "string" || !/^week-[a-z]+-\d+$/.test(b.id) || ids.has(b.id)) errors.push(`${where}: bad or duplicate id`);
  ids.add(b.id);
  if (b.topic !== "week" || b.kind !== "base") errors.push(`${where}: topic must be week, kind base`);
  const ph = b.conditions?.phase, hs = b.conditions?.house;
  if (!WEEK_PHASES.includes(ph) || !Array.isArray(hs) || hs.length !== 1 || !(hs[0] >= 1 && hs[0] <= 12)) errors.push(`${where}: needs one phase and one house`);
  else weekSeen.add(`${ph}-${hs[0]}`);
  if (typeof b.text !== "string" || b.text.length < 20 || b.text.length > 400 || !/[.?]$/.test(b.text)) errors.push(`${where}: text`);
  for (const re of BANNED) if (re.test(b.text ?? "")) errors.push(`${where}: banned wording ${re}`);
  if (typeof b.text_km !== "string" || !/[។?]$/.test(b.text_km) || b.text_km.includes("!")) errors.push(`${where}: text_km`);
}
for (const ph of WEEK_PHASES) for (let h = 1; h <= 12; h++) if (!weekSeen.has(`${ph}-${h}`)) errors.push(`weekly: missing ${ph} moon in house ${h}`);

if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Blocks OK: ${count} blocks.`);
