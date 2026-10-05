// Design-system guard (DESIGN_SYSTEM.md §10.2): no hardcoded hex/rgb colours,
// px font sizes, off-scale spacing or off-scale radii in components, layouts
// and pages. Raw values live only in app/styles/tokens.css (and the OG card
// renderer, which cannot read CSS variables).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["app", "components"];
// tokens.css holds the values; the OG renderer and the theme-color meta cannot read CSS variables.
const ALLOW_FILES = new Set(["app/styles/tokens.css", "app/og/[slug]/route.tsx", "app/layout.tsx", "app/manifest.ts", "app/styleguide/page.tsx"]); // og, layout (theme-color) and manifest cannot read CSS variables
const SCALE = new Set([0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128]);
const files = [];
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|css)$/.test(p)) files.push(p);
  }
};
ROOTS.forEach(walk);

const problems = [];
for (const file of files) {
  if (ALLOW_FILES.has(file)) continue;
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    const at = `${file}:${i + 1}`;
    if (/@media|theme-color/.test(line)) return; // breakpoints and the browser-chrome colour meta need literals
    if (/#[0-9a-fA-F]{3,8}\b(?![^"]*\]\])/.test(line) && !/href=|#main|#\$\{|"#"|'#'|location\.hash|`#/.test(line)) problems.push(`${at} hex colour`);
    if (/\brgba?\(/.test(line)) problems.push(`${at} rgb colour`);
    if (/font-size:\s*\d+(\.\d+)?(px|rem)/.test(line)) problems.push(`${at} raw font size`);
    if (/\b(?:text|p[xytrbl]?|m[xytrbl]?|gap|w|h|size|min-[wh]|max-[wh]|rounded)-\[\d/.test(line)) problems.push(`${at} arbitrary Tailwind value`);
    for (const m of line.matchAll(/(?<!border-)\b(?:padding|margin|gap|top|right|bottom|left|min-height|width|height)(?:-[a-z]+)?:\s*([^;"]+)/g)) {
      for (const px of m[1].matchAll(/(\d+(?:\.\d+)?)px/g)) {
        if (!SCALE.has(Number(px[1]))) problems.push(`${at} off-scale ${px[0]}`);
      }
    }
    for (const r of line.matchAll(/border-radius:\s*(\d+)px/g)) if (!["4", "9999"].includes(r[1])) problems.push(`${at} off-scale radius ${r[1]}px`);
  });
}
if (problems.length) { console.error(problems.join("\n")); console.error(`${problems.length} token violations`); process.exit(1); }
console.log(`Tokens OK across ${files.length} files.`);
