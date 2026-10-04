/**
 * Deterministic hashing and a seeded RNG. Same seed, same output, always.
 * Public pages seed with hash(sign + YYYY-MM-DD); personal readings with
 * hash(birthdate + YYYY-MM-DD) (build plan §7.1).
 */

/** FNV-1a 32-bit hash of a string. */
export function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: small, fast, good enough for picking text blocks. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(items: readonly T[], random: () => number): T {
  if (items.length === 0) throw new Error("pick() on an empty list");
  return items[Math.floor(random() * items.length)];
}

/** Integer in [min, max], inclusive. */
export function int(min: number, max: number, random: () => number): number {
  return min + Math.floor(random() * (max - min + 1));
}
