// Builds src/data/lny.json: Lunar New Year dates 1900–2100 from lunar-javascript.
// The table lets the browser find the zodiac animal without shipping the library.
import { writeFileSync } from "node:fs";
import lunar from "lunar-javascript";
const out = {};
for (let y = 1900; y <= 2100; y++) out[y] = lunar.Lunar.fromYmd(y, 1, 1).getSolar().toYmd().slice(5);
writeFileSync(new URL("../src/data/lny.json", import.meta.url), JSON.stringify(out) + "\n");
console.log("wrote", Object.keys(out).length, "years");
