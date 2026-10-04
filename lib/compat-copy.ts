/**
 * Compatibility page copy (plan §7.3): templated structure, text driven by
 * the rule tables, varied per pair by deterministic picks so the 288 pages
 * do not read as near-duplicates. Original copy; owner reviews.
 */
import { hash, pick, rng } from "./random";
import type { WesternSign } from "./western";
import type { Animal } from "./chinese";
import type { ChineseRelation, WesternRelation } from "./compatibility";

export interface PairCopy {
  connect: string[];
  strengths: string[];
  challenges: string[];
  advice: string[];
}

/* Character notes per sign: what each brings, needs, and how each loves. */
const SIGN_NOTES: Record<string, { brings: string; needs: string; loves: string; trips: string }> = {
  aries: { brings: "courage and a quick spark", needs: "room to act", loves: "openly and with enthusiasm", trips: "impatience" },
  taurus: { brings: "steadiness and warmth", needs: "security and time", loves: "loyally, through small comforts", trips: "stubbornness" },
  gemini: { brings: "curiosity and lively talk", needs: "variety and conversation", loves: "with words and wit", trips: "restlessness" },
  cancer: { brings: "care and emotional memory", needs: "a sense of home", loves: "protectively and tenderly", trips: "moodiness" },
  leo: { brings: "warmth and generosity", needs: "appreciation", loves: "wholeheartedly and with flair", trips: "pride" },
  virgo: { brings: "thoughtful attention to detail", needs: "order and usefulness", loves: "through quiet acts of service", trips: "overthinking" },
  libra: { brings: "grace and fairness", needs: "harmony and partnership", loves: "romantically and diplomatically", trips: "indecision" },
  scorpio: { brings: "depth and loyalty", needs: "trust and honesty", loves: "intensely and privately", trips: "guardedness" },
  sagittarius: { brings: "optimism and a sense of adventure", needs: "freedom to explore", loves: "playfully and honestly", trips: "bluntness" },
  capricorn: { brings: "patience and reliability", needs: "respect and clear goals", loves: "steadily, building over time", trips: "reserve" },
  aquarius: { brings: "originality and friendship", needs: "independence", loves: "as a friend first", trips: "detachment" },
  pisces: { brings: "imagination and compassion", needs: "gentleness", loves: "dreamily and devotedly", trips: "drifting" },
};

const ANIMAL_NOTES: Record<string, { brings: string; needs: string; style: string; trips: string }> = {
  rat: { brings: "quick thinking and resourcefulness", needs: "a sense of security", style: "clever and sociable", trips: "worry" },
  ox: { brings: "patience and dependability", needs: "steady routines", style: "calm and hard-working", trips: "stubbornness" },
  tiger: { brings: "bravery and big energy", needs: "freedom and challenge", style: "bold and protective", trips: "impulsiveness" },
  rabbit: { brings: "kindness and good taste", needs: "peace and comfort", style: "gentle and tactful", trips: "avoiding conflict" },
  dragon: { brings: "confidence and vision", needs: "room to lead", style: "charismatic and ambitious", trips: "pride" },
  snake: { brings: "insight and quiet wisdom", needs: "privacy and trust", style: "thoughtful and graceful", trips: "secrecy" },
  horse: { brings: "enthusiasm and warmth", needs: "movement and independence", style: "lively and open", trips: "restlessness" },
  goat: { brings: "creativity and care", needs: "reassurance and calm", style: "gentle and artistic", trips: "worry" },
  monkey: { brings: "wit and inventiveness", needs: "fun and stimulation", style: "playful and clever", trips: "scattered focus" },
  rooster: { brings: "honesty and diligence", needs: "recognition and order", style: "confident and precise", trips: "criticism" },
  dog: { brings: "loyalty and fairness", needs: "trust and honesty", style: "faithful and sincere", trips: "anxiety" },
  pig: { brings: "generosity and good humour", needs: "comfort and kindness", style: "warm and easygoing", trips: "over-trusting" },
};

const ELEMENT_WORD = { fire: "fire", earth: "earth", air: "air", water: "water" } as const;

const W_CONNECT: Record<WesternRelation, string[]> = {
  "same-sign": [
    "Two {A}s understand each other almost without words. You share the same rhythm, the same tastes and the same blind spots.",
    "Meeting another {A} can feel like looking in a mirror. That brings instant recognition, and the chance to see yourself more clearly.",
  ],
  "same-element": [
    "{A} and {B} are both {el} signs, so you share a basic temperament. You tend to want similar things from life, which makes everyday harmony easier.",
    "As two {el} signs, {A} and {B} speak the same emotional language. What one needs, the other often understands without being told.",
  ],
  complementary: [
    "{A} is a {elA} sign and {B} is a {elB} sign, a pairing that naturally feeds each other. One supplies what the other is missing.",
    "{elA} and {elB} work well together, and {A} with {B} shows why. You lift each other in ways that feel natural.",
  ],
  opposites: [
    "{A} and {B} sit opposite each other on the zodiac wheel. Opposites share a theme from two directions, which makes this pair magnetic and quietly educational.",
    "Across the wheel from each other, {A} and {B} each hold what the other is learning. The attraction is real, and so is the stretch.",
  ],
  square: [
    "{A} and {B} sit three signs apart, a square. Your instincts often pull in different directions, which creates friction and, with care, a lot of growth.",
    "A square like {A} and {B} brings creative tension. You challenge each other, and that can sharpen both of you.",
  ],
  mismatch: [
    "{A} ({elA}) and {B} ({elB}) approach life in quite different ways. This pair works best when both of you treat the difference as interesting rather than wrong.",
    "{elA} and {elB} can feel like different languages at first. {A} and {B} need patience to learn each other's, and the effort is often worth it.",
  ],
  neutral: [
    "{A} and {B} are close neighbours or easy companions on the wheel. Nothing pulls hard either way, so the relationship becomes what you both make of it.",
    "There is an easy, low-pressure feel between {A} and {B}. You can build something comfortable at your own pace.",
  ],
};

const W_ADVICE: Record<WesternRelation, string[]> = {
  "same-sign": ["Take turns leading so you do not compete for the same role.", "Encourage each other to try things outside your shared comfort zone."],
  "same-element": ["Add a little variety so comfort does not turn into routine.", "Make sure someone in the pair is watching the practical details."],
  complementary: ["Say thank you for the qualities you do not share.", "Let each person lead in the area where they shine."],
  opposites: ["Treat differences as a balance to find, not a contest to win.", "Talk early about how much time together and apart each of you needs."],
  square: ["Slow down before reacting when you disagree.", "Agree on a few shared goals so the tension has somewhere useful to go."],
  mismatch: ["Ask how the other person sees a situation before deciding who is right.", "Build small rituals that both of you enjoy."],
  neutral: ["Keep showing interest in each other's world.", "Plan new experiences together so the bond keeps growing."],
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const fill = (t: string, v: Record<string, string>) => t.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? k);

export function westernCopy(a: WesternSign, b: WesternSign, relation: WesternRelation): PairCopy {
  const r = rng(hash(`wcopy:${[a.slug, b.slug].sort().join("-")}`));
  const na = SIGN_NOTES[a.slug], nb = SIGN_NOTES[b.slug];
  const v = { A: a.name, B: b.name, el: ELEMENT_WORD[a.element], elA: cap(a.element), elB: cap(b.element) };
  const same = a.slug === b.slug;
  const connect = [
    fill(pick(W_CONNECT[relation], r), v),
    same
      ? `${a.name} ${pick(["brings", "offers"], r)} ${na.brings}, and you both need ${na.needs}. When you give each other that, the bond feels easy.`
      : `${a.name} brings ${na.brings}, while ${b.name} brings ${nb.brings}. ${a.name} needs ${na.needs}; ${b.name} needs ${nb.needs}. The more you honour both, the better this works.`,
    same
      ? `In love, ${a.name} gives affection ${na.loves}, so you will recognise each other's gestures.`
      : `${a.name} loves ${na.loves}. ${b.name} loves ${nb.loves}. Learning to read the other's style is the heart of this match.`,
  ];
  const strengths = [
    same ? `You share the same core values and rarely need to explain yourselves.` : `${cap(na.brings)} from ${a.name} meets ${nb.brings} from ${b.name}.`,
    relation === "same-element" || relation === "complementary" ? "Everyday life flows with little effort." : relation === "opposites" ? "Strong attraction and a sense of completing each other." : "Plenty to learn from each other.",
    a.modality === b.modality ? `Both of you are ${a.modality} signs, so you move at a similar pace.` : `As a ${a.modality} and a ${b.modality} sign, you cover different stages of any project.`,
  ];
  const challenges = [
    same ? `You may share the same weak spot: ${na.trips}.` : `${cap(na.trips)} from ${a.name} can clash with ${nb.trips} from ${b.name}.`,
    relation === "square" || relation === "mismatch" ? "Small misunderstandings can grow if left unspoken." : relation === "opposites" ? "You may each want the other to change in your direction." : "Comfort can slide into routine if you stop surprising each other.",
  ];
  const advice = [...W_ADVICE[relation], pick([
    "Make time to talk about what is going well, not only what needs fixing.",
    "Keep your sense of humour close. It solves more than you might think.",
    "Notice the small kindnesses and name them out loud.",
  ], r)];
  return { connect, strengths, challenges, advice };
}

const C_CONNECT: Record<ChineseRelation, string[]> = {
  "three-harmonies": [
    "The {A} and the {B} belong to the same Three Harmonies group, the most supportive grouping in the Chinese zodiac. You tend to share goals and lift each other naturally.",
    "In Chinese tradition, the {A} and the {B} form part of a Three Harmonies triangle. This is a pairing of shared outlook and easy cooperation.",
  ],
  "six-harmonies": [
    "The {A} and the {B} are a Six Harmonies pair, sometimes called secret friends. The bond is quiet, loyal and complementary.",
    "As a Six Harmonies match, the {A} and the {B} fill each other's gaps. It is a steady, supportive pairing.",
  ],
  same: [
    "Two {A}s share the same instincts and values. You understand each other quickly, and you may also share the same habits to watch.",
    "When two {A}s meet, there is instant familiarity. The relationship is comfortable, with a little effort needed to keep it growing.",
  ],
  neutral: [
    "The {A} and the {B} have no special harmony or clash in the traditional tables. That leaves plenty of room to shape the relationship yourselves.",
    "Tradition treats the {A} and the {B} as a neutral pair. With good will, this can become a balanced and rewarding match.",
  ],
  harm: [
    "The {A} and the {B} are one of the Six Harms pairs. Tradition suggests small frictions and misread intentions, which honest talk can ease a great deal.",
    "As a Six Harms pairing, the {A} and the {B} may rub each other the wrong way at times. Patience and clear words go a long way here.",
  ],
  clash: [
    "The {A} and the {B} sit opposite each other in the zodiac cycle, a Six Clashes pair. You see life from different angles, which brings challenge and real chances to grow.",
    "Tradition calls the {A} and the {B} a clash pair. Your rhythms are different, so the relationship asks for understanding and compromise.",
  ],
};

const C_ADVICE: Record<ChineseRelation, string[]> = {
  "three-harmonies": ["Set shared goals. This pair is at its best working toward something together.", "Make sure each person still has room to shine on their own."],
  "six-harmonies": ["Say out loud what you appreciate. Quiet bonds still need words.", "Lean on each other's strengths when life gets busy."],
  same: ["Take turns leading.", "Bring new friends and experiences into your world."],
  neutral: ["Find common ground early, through a shared interest or project.", "Be curious about how the other person sees things."],
  harm: ["Check what the other person meant before reacting.", "Keep promises small and keep them well."],
  clash: ["Give each other space when tempers rise.", "Agree on a few non-negotiables, and be flexible about the rest."],
};

const ELEMENT_RELATION_LINE: Record<string, string> = {
  same: "Your animals share the same fixed element ({ea}), adding a sense of familiarity.",
  generates: "In the five elements, the {A}'s {ea} feeds the {B}'s {eb}, a supportive flow.",
  "generated-by": "In the five elements, the {B}'s {eb} feeds the {A}'s {ea}, a supportive flow.",
  controls: "In the five elements, the {A}'s {ea} tends to check the {B}'s {eb}, so balance takes attention.",
  "controlled-by": "In the five elements, the {B}'s {eb} tends to check the {A}'s {ea}, so balance takes attention.",
};

export function chineseCopy(a: Animal, b: Animal, relation: ChineseRelation, elementRel: string): PairCopy {
  const r = rng(hash(`ccopy:${[a.slug, b.slug].sort().join("-")}`));
  const na = ANIMAL_NOTES[a.slug], nb = ANIMAL_NOTES[b.slug];
  const v = { A: a.name, B: b.name, ea: a.branchElement, eb: b.branchElement };
  const same = a.slug === b.slug;
  const connect = [
    fill(pick(C_CONNECT[relation], r), v),
    same
      ? `The ${a.name} is ${na.style}. Two of you together double that energy, for better and for worse.`
      : `The ${a.name} is ${na.style}, and the ${b.name} is ${nb.style}. The ${a.name} brings ${na.brings}; the ${b.name} brings ${nb.brings}.`,
    fill(ELEMENT_RELATION_LINE[elementRel], v),
  ];
  const strengths = [
    same ? `Shared values and an easy understanding.` : `${cap(na.brings)} meets ${nb.brings}.`,
    relation === "three-harmonies" || relation === "six-harmonies" ? "Trust builds quickly and lasts." : relation === "clash" ? "You can show each other new ways of seeing the world." : "A relationship you can shape together.",
    `The ${a.name} needs ${na.needs}${same ? ", and so do you both" : `; the ${b.name} needs ${nb.needs}`}. Meeting those needs is simple once named.`,
  ];
  const challenges = [
    same ? `A shared tendency toward ${na.trips}.` : `The ${a.name}'s ${na.trips} and the ${b.name}'s ${nb.trips} can collide.`,
    relation === "clash" || relation === "harm" ? "Different rhythms can make plans feel harder than they need to be." : "Comfort can turn into taking each other for granted.",
  ];
  const advice = [...C_ADVICE[relation], pick([
    "Celebrate small wins together.",
    "Keep traditions of your own, however simple.",
    "Remember that a match is made by how you treat each other, not by your birth years.",
  ], r)];
  return { connect, strengths, challenges, advice };
}
