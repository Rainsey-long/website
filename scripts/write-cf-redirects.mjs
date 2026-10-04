// Writes dist/_redirects for Cloudflare Pages: real 301s for reversed pairs.
import { writeFileSync } from "node:fs";
import { pairRedirects } from "./pair-redirects.mjs";
const lines = Object.entries(pairRedirects()).flatMap(([from, to]) => [`${from} ${to} 301`, `${from.slice(0, -1)} ${to} 301`]);
writeFileSync(new URL("../dist/_redirects", import.meta.url), lines.join("\n") + "\n");
console.log(`_redirects: ${lines.length} rules`);
