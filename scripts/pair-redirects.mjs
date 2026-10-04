// Reverse-order pair URLs → canonical alphabetical pair (plan §8).
const SIGNS = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
const ANIMALS = ["rat", "ox", "tiger", "rabbit", "dragon", "snake", "horse", "goat", "monkey", "rooster", "dog", "pig"];

export function pairRedirects() {
  const out = {};
  for (const [base, list] of [["/compatibility/", SIGNS], ["/chinese-compatibility/", ANIMALS]]) {
    for (const a of list) for (const b of list) {
      if (a <= b) continue;
      out[`${base}${a}-and-${b}/`] = `${base}${b}-and-${a}/`;
    }
  }
  return out;
}
