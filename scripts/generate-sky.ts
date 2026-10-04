// Precomputes daily sky data per year (plan §5.8) → content/data/sky/YYYY.json.
// Usage: npm run generate:sky -- 2026 2027
import { mkdirSync, writeFileSync } from "node:fs";
import { skyForDay } from "../src/lib/sky";
import { addDays } from "../src/lib/dates";

const years = process.argv.slice(2).map(Number).filter(Boolean);
const list = years.length ? years : [new Date().getUTCFullYear(), new Date().getUTCFullYear() + 1];
const dir = new URL("../content/data/sky/", import.meta.url);
mkdirSync(dir, { recursive: true });
for (const y of list) {
  const days = [];
  for (let d = `${y}-01-01`; d.startsWith(String(y)); d = addDays(d, 1)) days.push(skyForDay(d));
  writeFileSync(new URL(`${y}.json`, dir), JSON.stringify(days) + "\n");
  console.log(`sky ${y}: ${days.length} days`);
}
