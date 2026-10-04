// WCAG contrast check for every token pair used for text or UI (design system §2.2).
// Reads the hex values straight from src/styles/tokens.css so it can't drift.
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8");

function block(selector: string): Record<string, string> {
  const start = css.indexOf(selector + " {");
  if (start < 0) throw new Error(`selector not found: ${selector}`);
  const body = css.slice(start, css.indexOf("}", start));
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)) out[m[1]] = m[2];
  return out;
}

const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// [foreground, background, minimum]
const PAIRS: Array<[string, string, number]> = [
  ["ink", "paper", 4.5], ["ink", "paper-raised", 4.5],
  ["ink-muted", "paper", 4.5], ["ink-muted", "paper-raised", 4.5],
  ["cinnabar", "paper", 4.5], ["cinnabar", "paper-raised", 3], // rings and seals only; cinnabar TEXT sits on paper
  ["on-accent", "cinnabar", 4.5],
  ["jade", "paper", 4.5], ["clay", "paper", 4.5],
  ["brass", "paper", 3], ["rule-strong", "paper", 3],
  ["el-fire", "paper", 3], ["el-earth", "paper", 3], ["el-air", "paper", 3], ["el-water", "paper", 3], ["el-wood", "paper", 3],
  ["night-ink", "night", 4.5], ["night-muted", "night", 4.5], ["brass", "night", 3], ["cinnabar-on-night", "night", 3],
];

let failed = 0;
for (const [name, sel] of [["light", ":root"], ["dark", ':root[data-theme="dark"]']] as const) {
  const t = { ...block(":root"), ...(name === "dark" ? block(sel) : {}) };
  for (const [fg, bg, min] of PAIRS) {
    if (!t[fg] || !t[bg]) { console.log(`MISSING ${name} ${fg}/${bg}`); failed++; continue; }
    const r = ratio(t[fg], t[bg]);
    const ok = r >= min;
    if (!ok) failed++;
    console.log(`${ok ? "ok  " : "FAIL"} ${name.padEnd(5)} ${fg.padEnd(18)} on ${bg.padEnd(13)} ${r.toFixed(2)} (min ${min})`);
  }
}
if (failed) { console.error(`${failed} contrast failures`); process.exit(1); }
console.log("All token pairs meet WCAG AA.");
