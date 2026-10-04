// CI check (plan 4.2): warn when fewer than 60 days of reading JSON remain ahead.
import { readdirSync } from "node:fs";
const files = readdirSync(new URL("../content/data/daily/", import.meta.url)).filter((f) => f.endsWith(".json")).sort();
const today = new Date().toISOString().slice(0, 10);
const ahead = files.filter((f) => f.slice(0, 10) >= today).length;
console.log(`${ahead} days of readings ready from ${today}.`);
if (ahead < 60) console.log(`::warning::Only ${ahead} days of daily readings remain. Run npm run generate:daily.`);
