// Builds the daily reading buffer (plan §10, 2.7): ≥ 365 days of readings
// → content/data/daily/YYYY-MM-DD.json, and checks no full reading repeats
// for a sign within 30 days. Pages compute readings with the same engine, so
// this buffer is the audit trail and the export source for social posts.
// Usage: npm run generate:daily -- [startDate] [days]
import { mkdirSync, writeFileSync, readdirSync, rmSync } from "node:fs";
import { readingsForDay } from "../src/lib/reading-engine";
import { addDays, buildToday } from "../src/lib/dates";

const start = process.argv[2] ?? addDays(buildToday(), -1);
const count = Number(process.argv[3] ?? 366);
const dir = new URL("../content/data/daily/", import.meta.url);
mkdirSync(dir, { recursive: true });
for (const f of readdirSync(dir)) if (f.endsWith(".json") && f < `${start}.json`) rmSync(new URL(f, dir));

const history = new Map<string, Array<{ date: string; key: string }>>();
let repeats = 0;
for (let i = 0; i < count; i++) {
  const date = addDays(start, i);
  const readings = readingsForDay(date);
  const out = readings.map((r) => ({
    sign: r.sign.slug, house: r.house,
    topics: r.topics.map((t) => ({ topic: t.topic, energy: t.energy, text: t.text, blocks: t.blockIds })),
    lucky: r.lucky,
  }));
  for (const r of readings) {
    const key = r.topics.map((t) => t.blockIds.join("+")).join("|");
    const h = history.get(r.sign.slug) ?? [];
    if (h.some((p) => p.key === key)) { repeats++; console.error(`repeat: ${r.sign.slug} ${date}`); }
    h.push({ date, key });
    if (h.length > 30) h.shift();
    history.set(r.sign.slug, h);
  }
  writeFileSync(new URL(`${date}.json`, dir), JSON.stringify({ date, moon: readings[0].sky.moon, readings: out }) + "\n");
}
console.log(`daily: ${count} days from ${start}, ${repeats} repeats within 30 days`);
if (repeats) process.exit(1);
