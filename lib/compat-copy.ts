/**
 * Compatibility page copy (plan §7.3): templated structure, text driven by
 * the rule tables, varied per pair by deterministic picks so the 288 pages
 * do not read as near-duplicates. Original copy; owner reviews.
 */
import { hash, pick, rng } from "./random";
import type { WesternSign } from "./western";
import type { Animal } from "./chinese";
import type { ChineseRelation, WesternRelation } from "./compatibility";
import type { Lang } from "./i18n";
import { animalName, elementName, signName } from "./names";

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

/* ---------- Khmer (drafts for native review, docs/KHMER-REVIEW.md) ---------- */

const SIGN_NOTES_KM: Record<string, { brings: string; needs: string; loves: string; trips: string }> = {
  aries: { brings: "ភាពក្លាហាន និងថាមពលរហ័ស", needs: "សេរីភាពក្នុងការធ្វើសកម្មភាព", loves: "ដោយបើកចំហ និងពេញដោយភាពរំភើប", trips: "ភាពអន្ទះអន្ទែង" },
  taurus: { brings: "ភាពនឹងនរ និងភាពកក់ក្ដៅ", needs: "សុវត្ថិភាព និងពេលវេលា", loves: "ដោយស្មោះត្រង់ តាមរយៈការយកចិត្តទុកដាក់តូចៗ", trips: "ភាពរឹងរូស" },
  gemini: { brings: "ចិត្តចង់ដឹង និងការសន្ទនាដ៏រស់រវើក", needs: "ភាពចម្រុះ និងការជជែកគ្នា", loves: "តាមរយៈពាក្យសម្ដី និងភាពឆ្លាតវៃ", trips: "ភាពមិនស្ងប់" },
  cancer: { brings: "ការយកចិត្តទុកដាក់ និងការចងចាំអារម្មណ៍", needs: "អារម្មណ៍នៃផ្ទះ", loves: "ដោយការការពារ និងទន់ភ្លន់", trips: "អារម្មណ៍ប្រែប្រួល" },
  leo: { brings: "ភាពកក់ក្ដៅ និងចិត្តសប្បុរស", needs: "ការកោតសរសើរ", loves: "ដោយអស់ពីចិត្ត និងមានរចនាបថ", trips: "មោទនភាព" },
  virgo: { brings: "ការយកចិត្តទុកដាក់យ៉ាងល្អិតល្អន់", needs: "សណ្ដាប់ធ្នាប់ និងភាពមានប្រយោជន៍", loves: "តាមរយៈការជួយដោយស្ងៀមស្ងាត់", trips: "ការគិតច្រើនពេក" },
  libra: { brings: "ភាពថ្លៃថ្នូរ និងយុត្តិធម៌", needs: "ភាពសុខដុម និងដៃគូ", loves: "ដោយមនោសញ្ចេតនា និងការសម្របសម្រួល", trips: "ការស្ទាក់ស្ទើរ" },
  scorpio: { brings: "ជម្រៅចិត្ត និងភាពស្មោះស្ម័គ្រ", needs: "ការទុកចិត្ត និងភាពស្មោះត្រង់", loves: "យ៉ាងជ្រាលជ្រៅ និងឯកជន", trips: "ការប្រុងប្រយ័ត្នខ្លួនពេក" },
  sagittarius: { brings: "សុទិដ្ឋិនិយម និងស្មារតីផ្សងព្រេង", needs: "សេរីភាពក្នុងការស្វែងយល់", loves: "ដោយលេងសើច និងស្មោះត្រង់", trips: "ការនិយាយត្រង់ពេក" },
  capricorn: { brings: "ការអត់ធ្មត់ និងភាពអាចទុកចិត្តបាន", needs: "ការគោរព និងគោលដៅច្បាស់លាស់", loves: "ដោយនឹងនរ កសាងបន្តិចម្ដងៗ", trips: "ភាពស្ងៀមស្ងាត់ពេក" },
  aquarius: { brings: "គំនិតថ្មីៗ និងមិត្តភាព", needs: "ឯករាជ្យភាព", loves: "ដោយចាប់ផ្ដើមពីមិត្តភាព", trips: "ភាពឃ្លាតឆ្ងាយ" },
  pisces: { brings: "ការស្រមើស្រមៃ និងក្ដីមេត្តា", needs: "ភាពទន់ភ្លន់", loves: "ដោយសុបិន និងលះបង់", trips: "ការវង្វេងគំនិត" },
};

const W_CONNECT_KM: Record<WesternRelation, string[]> = {
  "same-sign": [
    "អ្នករាសី{A}ពីរនាក់ យល់ចិត្តគ្នាស្ទើរតែមិនបាច់និយាយ។ អ្នកទាំងពីរមានចង្វាក់ដូចគ្នា រសនិយមដូចគ្នា និងចំណុចដែលមើលមិនឃើញដូចគ្នា។",
    "ការជួបអ្នករាសី{A}ម្នាក់ទៀត អាចមានអារម្មណ៍ដូចមើលកញ្ចក់។ វានាំមកនូវការស្គាល់គ្នាភ្លាមៗ និងឱកាសមើលឃើញខ្លួនឯងកាន់តែច្បាស់។",
  ],
  "same-element": [
    "រាសី{A} និងរាសី{B} សុទ្ធតែជារាសីធាតុ{el} ដូច្នេះអ្នកមាននិស្ស័យមូលដ្ឋានដូចគ្នា។ អ្នកទាំងពីរច្រើនចង់បានអ្វីស្រដៀងគ្នាក្នុងជីវិត ដែលធ្វើឱ្យភាពសុខដុមប្រចាំថ្ងៃកាន់តែងាយស្រួល។",
    "ក្នុងនាមជារាសីធាតុ{el}ពីរ រាសី{A} និងរាសី{B} និយាយភាសាអារម្មណ៍តែមួយ។ អ្វីដែលម្នាក់ត្រូវការ ម្នាក់ទៀតច្រើនតែយល់ ដោយមិនបាច់ប្រាប់។",
  ],
  complementary: [
    "រាសី{A} ជារាសីធាតុ{elA} ហើយរាសី{B} ជារាសីធាតុ{elB} ដែលជាគូចិញ្ចឹមគ្នាទៅវិញទៅមកដោយធម្មជាតិ។ ម្នាក់ផ្ដល់នូវអ្វីដែលម្នាក់ទៀតខ្វះ។",
    "ធាតុ{elA} និងធាតុ{elB} ដើរជាមួយគ្នាបានល្អ ហើយរាសី{A} ជាមួយរាសី{B} បង្ហាញពីហេតុផល។ អ្នកលើកស្ទួយគ្នាតាមរបៀបដែលមានអារម្មណ៍ធម្មជាតិ។",
  ],
  opposites: [
    "រាសី{A} និងរាសី{B} ស្ថិតទល់មុខគ្នានៅលើកង់រាសី។ រាសីទល់មុខគ្នាចែករំលែកប្រធានបទតែមួយពីទិសពីរផ្សេងគ្នា ដែលធ្វើឱ្យគូនេះទាក់ទាញគ្នា និងផ្ដល់មេរៀនដោយស្ងៀមស្ងាត់។",
    "នៅទល់មុខគ្នាលើកង់រាសី រាសី{A} និងរាសី{B} ម្នាក់ៗកាន់នូវអ្វីដែលម្នាក់ទៀតកំពុងរៀន។ ការទាក់ទាញគឺពិតប្រាកដ ហើយការប្រឹងពង្រីកខ្លួនក៏ពិតដែរ។",
  ],
  square: [
    "រាសី{A} និងរាសី{B} ឃ្លាតគ្នាបីរាសី ហៅថាមុំកែង។ សភាវគតិរបស់អ្នកច្រើនទាញទៅទិសផ្សេងគ្នា ដែលបង្កការកកិត ហើយបើយកចិត្តទុកដាក់ ក៏នាំមកនូវការលូតលាស់ច្រើនដែរ។",
    "មុំកែងដូចរាសី{A} និងរាសី{B} នាំមកនូវភាពតានតឹងដែលជំរុញការច្នៃប្រឌិត។ អ្នកជំរុញគ្នាទៅវិញទៅមក ហើយនោះអាចធ្វើឱ្យអ្នកទាំងពីរកាន់តែមុតស្រួច។",
  ],
  mismatch: [
    "រាសី{A} (ធាតុ{elA}) និងរាសី{B} (ធាតុ{elB}) មើលជីវិតតាមរបៀបខុសគ្នាច្រើន។ គូនេះដើរបានល្អបំផុត នៅពេលអ្នកទាំងពីរចាត់ទុកភាពខុសគ្នាថាជារឿងគួរឱ្យចាប់អារម្មណ៍ មិនមែនជារឿងខុសនោះទេ។",
    "ធាតុ{elA} និងធាតុ{elB} អាចមានអារម្មណ៍ដូចជាភាសាពីរផ្សេងគ្នានៅដំបូង។ រាសី{A} និងរាសី{B} ត្រូវការការអត់ធ្មត់ ដើម្បីរៀនភាសារបស់គ្នាទៅវិញទៅមក ហើយការខិតខំនោះច្រើនតែមានតម្លៃ។",
  ],
  neutral: [
    "រាសី{A} និងរាសី{B} ជាអ្នកជិតខាង ឬជាដៃគូងាយស្រួលនៅលើកង់រាសី។ គ្មានអ្វីទាញខ្លាំងទៅទិសណាមួយទេ ដូច្នេះទំនាក់ទំនងនេះនឹងក្លាយជាអ្វីដែលអ្នកទាំងពីររួមគ្នាកសាង។",
    "មានអារម្មណ៍ស្រួល និងគ្មានសម្ពាធ រវាងរាសី{A} និងរាសី{B}។ អ្នកអាចកសាងអ្វីមួយដែលកក់ក្ដៅ តាមល្បឿនរបស់អ្នកផ្ទាល់។",
  ],
};

const W_ADVICE_KM: Record<WesternRelation, string[]> = {
  "same-sign": ["ផ្លាស់វេនគ្នាដឹកនាំ ដើម្បីកុំឱ្យប្រជែងគ្នាលើតួនាទីតែមួយ។", "លើកទឹកចិត្តគ្នាឱ្យសាកល្បងអ្វីថ្មីៗ ក្រៅពីរឿងដែលអ្នកទាំងពីរធ្លាប់ស្រួល។"],
  "same-element": ["បន្ថែមភាពចម្រុះបន្តិច ដើម្បីកុំឱ្យភាពស្រួលក្លាយជាទម្លាប់ដដែលៗ។", "ត្រូវប្រាកដថា មានម្នាក់ក្នុងចំណោមអ្នកទាំងពីរ មើលរឿងលម្អិតជាក់ស្ដែង។"],
  complementary: ["និយាយអរគុណចំពោះគុណសម្បត្តិដែលអ្នកមិនមានដូចគ្នា។", "ទុកឱ្យម្នាក់ៗដឹកនាំក្នុងផ្នែកដែលខ្លួនពូកែ។"],
  opposites: ["ចាត់ទុកភាពខុសគ្នាជាតុល្យភាពដែលត្រូវស្វែងរក មិនមែនជាការប្រកួតដែលត្រូវឈ្នះទេ។", "និយាយគ្នាតាំងពីដំបូង អំពីពេលនៅជាមួយគ្នា និងពេលនៅម្នាក់ឯង ដែលម្នាក់ៗត្រូវការ។"],
  square: ["ឈប់សម្រាកបន្តិច មុននឹងប្រតិកម្ម នៅពេលមិនយល់ស្របគ្នា។", "ព្រមព្រៀងលើគោលដៅរួមមួយចំនួន ដើម្បីឱ្យភាពតានតឹងមានទិសដៅដែលមានប្រយោជន៍។"],
  mismatch: ["សួរថាម្នាក់ទៀតមើលស្ថានការណ៍យ៉ាងណា មុននឹងសម្រេចថាអ្នកណាត្រូវ។", "បង្កើតទម្លាប់តូចៗ ដែលអ្នកទាំងពីរចូលចិត្ត។"],
  neutral: ["បន្តចាប់អារម្មណ៍លើពិភពរបស់គ្នាទៅវិញទៅមក។", "គ្រោងបទពិសោធន៍ថ្មីៗជាមួយគ្នា ដើម្បីឱ្យចំណងនេះបន្តរីកចម្រើន។"],
};

const W_EXTRA = [
  "Make time to talk about what is going well, not only what needs fixing.",
  "Keep your sense of humour close. It solves more than you might think.",
  "Notice the small kindnesses and name them out loud.",
];
const W_EXTRA_KM = [
  "ឆ្លៀតពេលនិយាយអំពីអ្វីដែលកំពុងដើរបានល្អ មិនមែនតែអ្វីដែលត្រូវកែប៉ុណ្ណោះទេ។",
  "រក្សាភាពកំប្លែងឱ្យនៅជិតខ្លួន។ វាដោះស្រាយបានច្រើនជាងអ្នកគិត។",
  "កត់សម្គាល់ទឹកចិត្តល្អតូចៗ ហើយនិយាយវាចេញមក។",
];

const MODALITY_KM: Record<string, string> = { cardinal: "ចាប់ផ្ដើម", fixed: "ថេរ", mutable: "ប្រែប្រួល" };

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const fill = (t: string, v: Record<string, string>) => t.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? k);

/*
 * Both languages make the SAME rng calls in the same order, so a pair reads
 * the same variant in English and Khmer.
 */
export function westernCopy(a: WesternSign, b: WesternSign, relation: WesternRelation, lang: Lang = "en"): PairCopy {
  const r = rng(hash(`wcopy:${[a.slug, b.slug].sort().join("-")}`));
  const same = a.slug === b.slug;
  if (lang === "km") {
    const na = SIGN_NOTES_KM[a.slug], nb = SIGN_NOTES_KM[b.slug];
    const A = signName(a.slug, "km"), B = signName(b.slug, "km");
    const v = { A, B, el: elementName(a.element, "km"), elA: elementName(a.element, "km"), elB: elementName(b.element, "km") };
    const connect = [
      fill(pick(W_CONNECT_KM[relation], r), v),
      same
        ? `រាសី${A}${pick(["នាំមកនូវ", "ផ្ដល់នូវ"], r)}${na.brings} ហើយអ្នកទាំងពីរត្រូវការ${na.needs}។ ពេលអ្នកផ្ដល់ឱ្យគ្នានូវរឿងនោះ ចំណងនេះនឹងមានអារម្មណ៍ងាយស្រួល។`
        : `រាសី${A}នាំមកនូវ${na.brings} ចំណែករាសី${B}នាំមកនូវ${nb.brings}។ រាសី${A}ត្រូវការ${na.needs} រាសី${B}ត្រូវការ${nb.needs}។ កាន់តែគោរពតម្រូវការទាំងពីរ គូនេះកាន់តែដើរបានល្អ។`,
      same
        ? `ក្នុងស្នេហា រាសី${A}ផ្ដល់ក្ដីស្រឡាញ់${na.loves} ដូច្នេះអ្នកនឹងស្គាល់កាយវិការរបស់គ្នាទៅវិញទៅមក។`
        : `រាសី${A}ស្រឡាញ់${na.loves}។ រាសី${B}ស្រឡាញ់${nb.loves}។ ការរៀនយល់ពីរបៀបរបស់គ្នា គឺជាបេះដូងនៃគូនេះ។`,
    ];
    const strengths = [
      same ? "អ្នកមានតម្លៃស្នូលដូចគ្នា ហើយកម្រត្រូវពន្យល់ខ្លួនឯងណាស់។" : `${na.brings}ពីរាសី${A} ជួបនឹង${nb.brings}ពីរាសី${B}។`,
      relation === "same-element" || relation === "complementary" ? "ជីវិតប្រចាំថ្ងៃដើរទៅដោយមិនសូវប្រឹងប្រែង។" : relation === "opposites" ? "ការទាក់ទាញខ្លាំង និងអារម្មណ៍ថាបំពេញគ្នាទៅវិញទៅមក។" : "មានរឿងច្រើនដែលអាចរៀនពីគ្នា។",
      a.modality === b.modality
        ? `អ្នកទាំងពីរជារាសីប្រភេទ${MODALITY_KM[a.modality]} ដូច្នេះអ្នកដើរក្នុងល្បឿនស្រដៀងគ្នា។`
        : `ក្នុងនាមជារាសីប្រភេទ${MODALITY_KM[a.modality]} និងប្រភេទ${MODALITY_KM[b.modality]} អ្នកទាំងពីរមើលការខុសត្រូវដំណាក់កាលខុសៗគ្នានៃគម្រោងណាមួយ។`,
    ];
    const challenges = [
      same ? `អ្នកប្រហែលជាមានចំណុចខ្សោយដូចគ្នា គឺ${na.trips}។` : `${na.trips}របស់រាសី${A} អាចប៉ះទង្គិចជាមួយ${nb.trips}របស់រាសី${B}។`,
      relation === "square" || relation === "mismatch" ? "ការយល់ច្រឡំតូចៗអាចរីកធំ បើមិននិយាយចេញមក។" : relation === "opposites" ? "ម្នាក់ៗប្រហែលជាចង់ឱ្យម្នាក់ទៀតផ្លាស់ប្ដូរតាមទិសរបស់ខ្លួន។" : "ភាពស្រួលអាចរអិលទៅជាទម្លាប់ដដែលៗ បើអ្នកឈប់ធ្វើឱ្យគ្នាភ្ញាក់ផ្អើល។",
    ];
    const advice = [...W_ADVICE_KM[relation], pick(W_EXTRA_KM, r)];
    return { connect, strengths, challenges, advice };
  }
  const na = SIGN_NOTES[a.slug], nb = SIGN_NOTES[b.slug];
  const v = { A: a.name, B: b.name, el: ELEMENT_WORD[a.element], elA: cap(a.element), elB: cap(b.element) };
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
  const advice = [...W_ADVICE[relation], pick(W_EXTRA, r)];
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

const ANIMAL_NOTES_KM: Record<string, { brings: string; needs: string; style: string; trips: string }> = {
  rat: { brings: "ការគិតរហ័ស និងភាពប៉ិនប្រសប់", needs: "អារម្មណ៍សុវត្ថិភាព", style: "ឆ្លាតវៃ និងចូលចិត្តជួបជុំ", trips: "ការព្រួយបារម្ភ" },
  ox: { brings: "ការអត់ធ្មត់ និងភាពអាចពឹងពាក់បាន", needs: "ទម្លាប់នឹងនរ", style: "ស្ងប់ស្ងាត់ និងឧស្សាហ៍", trips: "ភាពរឹងរូស" },
  tiger: { brings: "ភាពក្លាហាន និងថាមពលខ្លាំង", needs: "សេរីភាព និងបញ្ហាប្រឈម", style: "ហ៊ាន និងចេះការពារ", trips: "ការធ្វើអ្វីភ្លាមៗដោយមិនគិត" },
  rabbit: { brings: "ចិត្តល្អ និងរសនិយមល្អ", needs: "សន្តិភាព និងភាពស្រួល", style: "ទន់ភ្លន់ និងចេះសម្របសម្រួល", trips: "ការគេចពីជម្លោះ" },
  dragon: { brings: "ទំនុកចិត្ត និងចក្ខុវិស័យ", needs: "ឱកាសដឹកនាំ", style: "មានមន្តស្នេហ៍ និងមហិច្ឆតា", trips: "មោទនភាព" },
  snake: { brings: "ការយល់ដឹងជ្រៅ និងប្រាជ្ញាស្ងៀមស្ងាត់", needs: "ភាពឯកជន និងការទុកចិត្ត", style: "គិតពិចារណា និងថ្លៃថ្នូរ", trips: "ការលាក់ទុក" },
  horse: { brings: "ភាពរំភើប និងភាពកក់ក្ដៅ", needs: "ចលនា និងឯករាជ្យភាព", style: "រស់រវើក និងបើកចំហ", trips: "ភាពមិនស្ងប់" },
  goat: { brings: "ការច្នៃប្រឌិត និងការយកចិត្តទុកដាក់", needs: "ការលើកទឹកចិត្ត និងភាពស្ងប់", style: "ទន់ភ្លន់ និងមានសិល្បៈ", trips: "ការព្រួយបារម្ភ" },
  monkey: { brings: "ភាពឆ្លាតវៃ និងគំនិតច្នៃប្រឌិត", needs: "ភាពសប្បាយ និងរឿងថ្មីៗ", style: "លេងសើច និងឆ្លាត", trips: "ការផ្ដោតអារម្មណ៍មិនជាប់" },
  rooster: { brings: "ភាពស្មោះត្រង់ និងការឧស្សាហ៍", needs: "ការទទួលស្គាល់ និងសណ្ដាប់ធ្នាប់", style: "មានទំនុកចិត្ត និងហ្មត់ចត់", trips: "ការរិះគន់" },
  dog: { brings: "ភាពស្មោះស្ម័គ្រ និងយុត្តិធម៌", needs: "ការទុកចិត្ត និងភាពស្មោះត្រង់", style: "ស្មោះស្ម័គ្រ និងស្មោះត្រង់", trips: "ការថប់បារម្ភ" },
  pig: { brings: "ចិត្តសប្បុរស និងអារម្មណ៍កំប្លែង", needs: "ភាពស្រួល និងចិត្តល្អ", style: "កក់ក្ដៅ និងងាយស្រួល", trips: "ការទុកចិត្តគេពេក" },
};

const C_CONNECT_KM: Record<ChineseRelation, string[]> = {
  "three-harmonies": [
    "ឆ្នាំ{A} និងឆ្នាំ{B} ស្ថិតក្នុងក្រុមត្រីសុខដុមតែមួយ ដែលជាក្រុមគាំទ្រគ្នាខ្លាំងបំផុតក្នុងរាសីចិន។ អ្នកច្រើនមានគោលដៅដូចគ្នា ហើយលើកស្ទួយគ្នាដោយធម្មជាតិ។",
    "តាមប្រពៃណីចិន ឆ្នាំ{A} និងឆ្នាំ{B} ជាផ្នែកមួយនៃត្រីកោណត្រីសុខដុម។ នេះជាគូដែលមានទស្សនៈដូចគ្នា និងសហការគ្នាបានងាយស្រួល។",
  ],
  "six-harmonies": [
    "ឆ្នាំ{A} និងឆ្នាំ{B} ជាគូឆសុខដុម ដែលពេលខ្លះគេហៅថាមិត្តសម្ងាត់។ ចំណងនេះស្ងៀមស្ងាត់ ស្មោះស្ម័គ្រ និងបំពេញគ្នា។",
    "ក្នុងនាមជាគូឆសុខដុម ឆ្នាំ{A} និងឆ្នាំ{B} បំពេញចន្លោះខ្វះខាតរបស់គ្នា។ វាជាគូដែលនឹងនរ និងគាំទ្រគ្នា។",
  ],
  same: [
    "អ្នកឆ្នាំ{A}ពីរនាក់មានសភាវគតិ និងតម្លៃដូចគ្នា។ អ្នកយល់គ្នាបានលឿន ហើយប្រហែលជាមានទម្លាប់ដូចគ្នាដែលត្រូវប្រយ័ត្នផងដែរ។",
    "នៅពេលអ្នកឆ្នាំ{A}ពីរនាក់ជួបគ្នា មានអារម្មណ៍ស្គាល់គ្នាភ្លាមៗ។ ទំនាក់ទំនងនេះស្រួល ដោយត្រូវការការខិតខំបន្តិច ដើម្បីឱ្យវាបន្តរីកចម្រើន។",
  ],
  neutral: [
    "ឆ្នាំ{A} និងឆ្នាំ{B} គ្មានភាពសុខដុម ឬការប៉ះទង្គិចពិសេសក្នុងតារាងប្រពៃណីទេ។ នោះទុកចន្លោះច្រើនឱ្យអ្នកទាំងពីររួមគ្នាកសាងទំនាក់ទំនងនេះ។",
    "ប្រពៃណីចាត់ទុកឆ្នាំ{A} និងឆ្នាំ{B} ជាគូអព្យាក្រឹត។ ដោយចិត្តល្អ នេះអាចក្លាយជាគូដែលមានតុល្យភាព និងផ្ដល់ផលល្អ។",
  ],
  harm: [
    "ឆ្នាំ{A} និងឆ្នាំ{B} ជាគូមួយក្នុងចំណោមគូឆគ្រោះ។ ប្រពៃណីបង្ហាញថាអាចមានការកកិតតូចៗ និងការយល់ខុសពីចេតនា ដែលការនិយាយគ្នាដោយស្មោះត្រង់អាចបន្ធូរបានច្រើន។",
    "ក្នុងនាមជាគូឆគ្រោះ ឆ្នាំ{A} និងឆ្នាំ{B} អាចធ្វើឱ្យគ្នាមិនស្រួលចិត្តម្ដងម្កាល។ ការអត់ធ្មត់ និងពាក្យសម្ដីច្បាស់លាស់ ជួយបានច្រើននៅទីនេះ។",
  ],
  clash: [
    "ឆ្នាំ{A} និងឆ្នាំ{B} ស្ថិតទល់មុខគ្នាក្នុងវដ្ដរាសី ជាគូឆប៉ះទង្គិច។ អ្នកមើលជីវិតពីមុំផ្សេងគ្នា ដែលនាំមកនូវបញ្ហាប្រឈម និងឱកាសពិតប្រាកដដើម្បីលូតលាស់។",
    "ប្រពៃណីហៅឆ្នាំ{A} និងឆ្នាំ{B} ថាជាគូប៉ះទង្គិច។ ចង្វាក់ជីវិតរបស់អ្នកខុសគ្នា ដូច្នេះទំនាក់ទំនងនេះត្រូវការការយោគយល់ និងការសម្របសម្រួល។",
  ],
};

const C_ADVICE_KM: Record<ChineseRelation, string[]> = {
  "three-harmonies": ["កំណត់គោលដៅរួម។ គូនេះល្អបំផុតពេលធ្វើការរួមគ្នាឆ្ពោះទៅរកអ្វីមួយ។", "ត្រូវប្រាកដថាម្នាក់ៗនៅតែមានឱកាសបញ្ចេញសមត្ថភាពផ្ទាល់ខ្លួន។"],
  "six-harmonies": ["និយាយចេញមកនូវអ្វីដែលអ្នកកោតសរសើរ។ ចំណងស្ងៀមស្ងាត់ក៏នៅតែត្រូវការពាក្យសម្ដីដែរ។", "ពឹងលើចំណុចខ្លាំងរបស់គ្នា ពេលជីវិតមមាញឹក។"],
  same: ["ផ្លាស់វេនគ្នាដឹកនាំ។", "នាំមិត្តភក្ដិ និងបទពិសោធន៍ថ្មីៗចូលក្នុងពិភពរបស់អ្នក។"],
  neutral: ["ស្វែងរកចំណុចរួមតាំងពីដំបូង តាមរយៈចំណូលចិត្ត ឬគម្រោងរួម។", "ចង់ដឹងពីរបៀបដែលម្នាក់ទៀតមើលរឿងនានា។"],
  harm: ["សួរឱ្យច្បាស់ថាម្នាក់ទៀតចង់និយាយយ៉ាងណា មុននឹងប្រតិកម្ម។", "សន្យាតែរឿងតូចៗ ហើយរក្សាវាឱ្យបានល្អ។"],
  clash: ["ទុកចន្លោះឱ្យគ្នា ពេលកំហឹងកើនឡើង។", "ព្រមព្រៀងលើរឿងសំខាន់មួយចំនួនដែលមិនផ្លាស់ប្ដូរ ហើយបត់បែនលើរឿងផ្សេងទៀត។"],
};

const ELEMENT_RELATION_LINE_KM: Record<string, string> = {
  same: "សត្វរាសីរបស់អ្នកមានធាតុថេរដូចគ្នា (ធាតុ{ea}) ដែលបន្ថែមអារម្មណ៍ស្គាល់គ្នា។",
  generates: "ក្នុងធាតុទាំងប្រាំ ធាតុ{ea}របស់ឆ្នាំ{A} ចិញ្ចឹមធាតុ{eb}របស់ឆ្នាំ{B} ជាលំហូរដែលគាំទ្រគ្នា។",
  "generated-by": "ក្នុងធាតុទាំងប្រាំ ធាតុ{eb}របស់ឆ្នាំ{B} ចិញ្ចឹមធាតុ{ea}របស់ឆ្នាំ{A} ជាលំហូរដែលគាំទ្រគ្នា។",
  controls: "ក្នុងធាតុទាំងប្រាំ ធាតុ{ea}របស់ឆ្នាំ{A} ច្រើនតែទប់ធាតុ{eb}របស់ឆ្នាំ{B} ដូច្នេះតុល្យភាពត្រូវការការយកចិត្តទុកដាក់។",
  "controlled-by": "ក្នុងធាតុទាំងប្រាំ ធាតុ{eb}របស់ឆ្នាំ{B} ច្រើនតែទប់ធាតុ{ea}របស់ឆ្នាំ{A} ដូច្នេះតុល្យភាពត្រូវការការយកចិត្តទុកដាក់។",
};

const C_EXTRA = [
  "Celebrate small wins together.",
  "Keep traditions of your own, however simple.",
  "Remember that a match is made by how you treat each other, not by your birth years.",
];
const C_EXTRA_KM = [
  "អបអរជោគជ័យតូចៗជាមួយគ្នា។",
  "រក្សាប្រពៃណីផ្ទាល់ខ្លួនរបស់អ្នក ទោះបីសាមញ្ញក៏ដោយ។",
  "ចងចាំថា គូមួយកើតឡើងពីរបៀបដែលអ្នកប្រព្រឹត្តចំពោះគ្នា មិនមែនពីឆ្នាំកំណើតទេ។",
];

export function chineseCopy(a: Animal, b: Animal, relation: ChineseRelation, elementRel: string, lang: Lang = "en"): PairCopy {
  const r = rng(hash(`ccopy:${[a.slug, b.slug].sort().join("-")}`));
  const same = a.slug === b.slug;
  if (lang === "km") {
    const na = ANIMAL_NOTES_KM[a.slug], nb = ANIMAL_NOTES_KM[b.slug];
    const A = animalName(a.slug, "km"), B = animalName(b.slug, "km");
    const v = { A, B, ea: elementName(a.branchElement, "km"), eb: elementName(b.branchElement, "km") };
    const connect = [
      fill(pick(C_CONNECT_KM[relation], r), v),
      same
        ? `អ្នកឆ្នាំ${A} ${na.style}។ ពេលអ្នកពីរនាក់នៅជាមួយគ្នា ថាមពលនោះកើនទ្វេដង ទាំងល្អ និងមិនល្អ។`
        : `អ្នកឆ្នាំ${A} ${na.style} ហើយអ្នកឆ្នាំ${B} ${nb.style}។ ឆ្នាំ${A}នាំមកនូវ${na.brings} ចំណែកឆ្នាំ${B}នាំមកនូវ${nb.brings}។`,
      fill(ELEMENT_RELATION_LINE_KM[elementRel], v),
    ];
    const strengths = [
      same ? "តម្លៃដូចគ្នា និងការយល់ចិត្តគ្នាដោយងាយ។" : `${na.brings} ជួបនឹង${nb.brings}។`,
      relation === "three-harmonies" || relation === "six-harmonies" ? "ការទុកចិត្តកើតឡើងលឿន ហើយស្ថិតស្ថេរ។" : relation === "clash" ? "អ្នកអាចបង្ហាញគ្នានូវរបៀបថ្មីៗក្នុងការមើលពិភពលោក។" : "ជាទំនាក់ទំនងដែលអ្នកអាចរួមគ្នាកសាង។",
      `អ្នកឆ្នាំ${A}ត្រូវការ${na.needs}${same ? " ហើយអ្នកទាំងពីរក៏ដូច្នោះដែរ" : ` អ្នកឆ្នាំ${B}ត្រូវការ${nb.needs}`}។ ការបំពេញតម្រូវការទាំងនោះងាយស្រួល ពេលបាននិយាយចេញមក។`,
    ];
    const challenges = [
      same ? `ទំនោរដូចគ្នាទៅរក${na.trips}។` : `${na.trips}របស់ឆ្នាំ${A} និង${nb.trips}របស់ឆ្នាំ${B} អាចប៉ះទង្គិចគ្នា។`,
      relation === "clash" || relation === "harm" ? "ចង្វាក់ខុសគ្នាអាចធ្វើឱ្យផែនការហាក់ពិបាកជាងការពិត។" : "ភាពស្រួលអាចប្រែក្លាយជាការមើលរំលងគ្នា។",
    ];
    const advice = [...C_ADVICE_KM[relation], pick(C_EXTRA_KM, r)];
    return { connect, strengths, challenges, advice };
  }
  const na = ANIMAL_NOTES[a.slug], nb = ANIMAL_NOTES[b.slug];
  const v = { A: a.name, B: b.name, ea: a.branchElement, eb: b.branchElement };
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
  const advice = [...C_ADVICE[relation], pick(C_EXTRA, r)];
  return { connect, strengths, challenges, advice };
}
