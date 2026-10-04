/**
 * Birth chart wording (drafts, awaiting owner review like every reading text;
 * CONTENT_GUIDELINES.md). Each planet names a part of life; each sign names a
 * style, a gift and a growth area (the "gifts and challenges" framing readers
 * praise in the feature research), so "Venus in Taurus" reads as the topic of
 * Venus expressed in the style of Taurus. Growth areas are invitations, never
 * warnings.
 */
import type { AspectKind, BodyKey } from "./natal";
import { khmerDigits, type Lang } from "./i18n";

export const BODY_COPY: Record<BodyKey, { name: string; topic: string }> = {
  sun: { name: "Sun", topic: "Who you are at your core and what lights you up" },
  moon: { name: "Moon", topic: "What you need to feel safe, and how your feelings move" },
  mercury: { name: "Mercury", topic: "How you think, learn and talk" },
  venus: { name: "Venus", topic: "How you love, and what you find beautiful" },
  mars: { name: "Mars", topic: "How you act, compete and go after what you want" },
  jupiter: { name: "Jupiter", topic: "Where you grow, hope and find luck" },
  saturn: { name: "Saturn", topic: "Where you build patience, skill and lasting structure" },
  uranus: { name: "Uranus", topic: "Where you want freedom and do things your own way" },
  neptune: { name: "Neptune", topic: "Where you dream, imagine and feel connected to something larger" },
  pluto: { name: "Pluto", topic: "Where you change deeply and find your inner strength" },
};

/** Indexed by sign (0 = Aries). */
export const SIGN_COPY: Array<{ style: string; gift: string; growth: string }> = [
  { style: "direct, quick and brave, happiest when starting something", gift: "courage to go first", growth: "pausing long enough to bring others along" },
  { style: "steady, patient and sensual, building things that last", gift: "calm reliability", growth: "letting change in before it has to push" },
  { style: "curious, quick-witted and many-sided", gift: "making connections between ideas and people", growth: "staying with one thing long enough to go deep" },
  { style: "caring, protective and guided by feeling", gift: "making people feel at home", growth: "asking for care as easily as you give it" },
  { style: "warm, expressive and generous", gift: "bringing joy and confidence into a room", growth: "trusting you matter even when no one is watching" },
  { style: "careful, practical and helpful", gift: "noticing what needs doing and doing it well", growth: "allowing good enough to be enough" },
  { style: "fair, graceful and drawn to partnership", gift: "seeing every side and finding balance", growth: "saying what you want, not only what keeps the peace" },
  { style: "intense, private and loyal", gift: "depth, focus and staying power", growth: "letting people in before you are sure of them" },
  { style: "open, optimistic and searching for meaning", gift: "widening everyone's horizons", growth: "following through once the excitement fades" },
  { style: "ambitious, responsible and quietly determined", gift: "turning long goals into real results", growth: "resting without needing to earn it" },
  { style: "independent, inventive and thinking of the group", gift: "seeing what could be better for everyone", growth: "staying close when feelings get personal" },
  { style: "gentle, imaginative and deeply empathic", gift: "compassion and creative vision", growth: "keeping clear edges around your energy" },
];

export const HOUSE_TOPIC = [
  "self and first impressions", "money, possessions and what you value", "learning, talking and the neighbourhood",
  "home, family and roots", "creativity, play and romance", "daily work, routines and health habits",
  "partnerships and close one-to-one bonds", "shared resources, trust and deep change", "travel, study and big ideas",
  "career and public life", "friends, groups and hopes", "rest, solitude and the inner life",
];

export const ASPECT_COPY: Record<AspectKind, { name: string; meaning: string }> = {
  conjunction: { name: "conjunction", meaning: "these two work as one, blending their strengths" },
  sextile: { name: "sextile", meaning: "an easy opening between them, there when you reach for it" },
  square: { name: "square", meaning: "a creative tension that pushes you to grow" },
  trine: { name: "trine", meaning: "a natural flow between them, a talent that comes easily" },
  opposition: { name: "opposition", meaning: "two sides to balance, often learned through other people" },
};

export const ORDINAL = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

/* ---------- Khmer (drafts for native review, docs/KHMER-REVIEW.md) ---------- */

export const BODY_COPY_KM: Record<BodyKey, { name: string; topic: string }> = {
  sun: { name: "ព្រះអាទិត្យ", topic: "អ្នកជានរណានៅក្នុងស្នូល និងអ្វីដែលធ្វើឱ្យអ្នកភ្លឺស្វាង" },
  moon: { name: "ព្រះចន្ទ", topic: "អ្វីដែលអ្នកត្រូវការដើម្បីមានអារម្មណ៍សុវត្ថិភាព និងរបៀបដែលអារម្មណ៍អ្នកប្រែប្រួល" },
  mercury: { name: "ព្រះពុធ", topic: "របៀបដែលអ្នកគិត រៀន និងនិយាយ" },
  venus: { name: "ព្រះសុក្រ", topic: "របៀបដែលអ្នកស្រឡាញ់ និងអ្វីដែលអ្នកយល់ថាស្រស់ស្អាត" },
  mars: { name: "ព្រះអង្គារ", topic: "របៀបដែលអ្នកធ្វើសកម្មភាព ប្រកួតប្រជែង និងតាមរកអ្វីដែលអ្នកចង់បាន" },
  jupiter: { name: "ព្រះព្រហស្បតិ៍", topic: "កន្លែងដែលអ្នករីកចម្រើន មានក្ដីសង្ឃឹម និងជួបសំណាង" },
  saturn: { name: "ព្រះសៅរ៍", topic: "កន្លែងដែលអ្នកកសាងការអត់ធ្មត់ ជំនាញ និងគ្រឹះដ៏រឹងមាំ" },
  uranus: { name: "អ៊ុយរ៉ានុស", topic: "កន្លែងដែលអ្នកចង់បានសេរីភាព និងធ្វើតាមរបៀបរបស់ខ្លួន" },
  neptune: { name: "ណិបទូន", topic: "កន្លែងដែលអ្នកសុបិន ស្រមើស្រមៃ និងមានអារម្មណ៍ភ្ជាប់ទៅនឹងអ្វីមួយដ៏ធំ" },
  pluto: { name: "ភ្លុយតូ", topic: "កន្លែងដែលអ្នកផ្លាស់ប្ដូរយ៉ាងជ្រៅ និងរកឃើញកម្លាំងខាងក្នុង" },
};

export const SIGN_COPY_KM: Array<{ style: string; gift: string; growth: string }> = [
  { style: "ត្រង់ រហ័ស និងក្លាហាន សប្បាយចិត្តបំផុតពេលចាប់ផ្ដើមអ្វីថ្មី", gift: "ភាពក្លាហានដើរមុនគេ", growth: "ឈប់បន្តិច ដើម្បីនាំអ្នកដទៃមកជាមួយ" },
  { style: "នឹងនរ អត់ធ្មត់ និងចូលចិត្តភាពស្រណុក កសាងអ្វីដែលស្ថិតស្ថេរ", gift: "ភាពស្ងប់ និងអាចទុកចិត្តបាន", growth: "ទទួលយកការផ្លាស់ប្ដូរ មុនពេលវាត្រូវរុញ" },
  { style: "ចង់ដឹង ឆ្លាតវៃរហ័ស និងមានច្រើនជ្រុង", gift: "ភ្ជាប់គំនិត និងមនុស្សចូលគ្នា", growth: "នៅជាមួយរឿងមួយឱ្យបានយូរ ដើម្បីស្វែងយល់ឱ្យជ្រៅ" },
  { style: "យកចិត្តទុកដាក់ ចេះការពារ និងដើរតាមអារម្មណ៍", gift: "ធ្វើឱ្យមនុស្សមានអារម្មណ៍ដូចនៅផ្ទះ", growth: "សុំការយកចិត្តទុកដាក់ ឱ្យងាយដូចពេលអ្នកផ្ដល់ឱ្យគេ" },
  { style: "កក់ក្ដៅ ចេះបញ្ចេញ និងសប្បុរស", gift: "នាំក្ដីរីករាយ និងទំនុកចិត្តចូលក្នុងបន្ទប់", growth: "ជឿថាអ្នកមានតម្លៃ ទោះគ្មាននរណាមើលក៏ដោយ" },
  { style: "ប្រុងប្រយ័ត្ន ជាក់ស្ដែង និងចូលចិត្តជួយ", gift: "មើលឃើញអ្វីដែលត្រូវធ្វើ ហើយធ្វើវាបានល្អ", growth: "ទទួលយកថា ល្អល្មមគឺគ្រប់គ្រាន់ហើយ" },
  { style: "យុត្តិធម៌ ថ្លៃថ្នូរ និងស្រឡាញ់ភាពជាដៃគូ", gift: "មើលឃើញគ្រប់ជ្រុង និងរកតុល្យភាព", growth: "និយាយពីអ្វីដែលអ្នកចង់បាន មិនមែនតែអ្វីដែលរក្សាសន្តិភាពទេ" },
  { style: "ខ្លាំងក្លា ឯកជន និងស្មោះស្ម័គ្រ", gift: "ជម្រៅ ការផ្ដោតអារម្មណ៍ និងភាពស៊ូទ្រាំ", growth: "បើកចិត្តឱ្យគេចូល មុនពេលអ្នកប្រាកដពីពួកគេ" },
  { style: "បើកចំហ សុទិដ្ឋិនិយម និងស្វែងរកអត្ថន័យ", gift: "ពង្រីកទស្សនៈរបស់អ្នកជុំវិញខ្លួន", growth: "ធ្វើឱ្យចប់ ទោះពេលភាពរំភើបរសាត់បាត់" },
  { style: "មានមហិច្ឆតា ទទួលខុសត្រូវ និងប្ដេជ្ញាចិត្តដោយស្ងៀមស្ងាត់", gift: "ប្រែគោលដៅវែងឆ្ងាយឱ្យក្លាយជាលទ្ធផលពិត", growth: "សម្រាកដោយមិនបាច់ខិតខំដើម្បីសមនឹងវា" },
  { style: "ឯករាជ្យ ច្នៃប្រឌិត និងគិតពីក្រុម", gift: "មើលឃើញអ្វីដែលអាចល្អប្រសើរសម្រាប់គ្រប់គ្នា", growth: "នៅជិតគេ ពេលអារម្មណ៍ក្លាយជារឿងផ្ទាល់ខ្លួន" },
  { style: "ទន់ភ្លន់ ស្រមើស្រមៃ និងយល់ចិត្តគេយ៉ាងជ្រៅ", gift: "ក្ដីមេត្តា និងចក្ខុវិស័យច្នៃប្រឌិត", growth: "រក្សាព្រំដែនច្បាស់លាស់ជុំវិញថាមពលរបស់អ្នក" },
];

export const HOUSE_TOPIC_KM = [
  "ខ្លួនឯង និងការចាប់អារម្មណ៍ដំបូង", "ប្រាក់កាស ទ្រព្យសម្បត្តិ និងអ្វីដែលអ្នកឱ្យតម្លៃ", "ការរៀន ការនិយាយ និងសង្កាត់ជុំវិញ",
  "ផ្ទះ គ្រួសារ និងឫសគល់", "ការច្នៃប្រឌិត ការលេង និងស្នេហា", "ការងារប្រចាំថ្ងៃ ទម្លាប់ និងទម្លាប់សុខភាព",
  "ដៃគូ និងចំណងពីរនាក់ដ៏ជិតស្និទ្ធ", "ធនធានរួម ការទុកចិត្ត និងការផ្លាស់ប្ដូរជ្រៅ", "ការធ្វើដំណើរ ការសិក្សា និងគំនិតធំៗ",
  "អាជីព និងជីវិតសាធារណៈ", "មិត្តភក្ដិ ក្រុម និងក្ដីសង្ឃឹម", "ការសម្រាក ភាពឯកោ និងជីវិតខាងក្នុង",
];

export const ASPECT_COPY_KM: Record<AspectKind, { name: string; meaning: string }> = {
  conjunction: { name: "ការរួមគ្នា", meaning: "ភពទាំងពីរធ្វើការដូចតែមួយ លាយបញ្ចូលចំណុចខ្លាំងរបស់គ្នា" },
  sextile: { name: "មុំ ៦០ ដឺក្រេ", meaning: "ច្រកងាយស្រួលរវាងភពទាំងពីរ ដែលនៅទីនោះពេលអ្នកចង់ប្រើ" },
  square: { name: "មុំកែង", meaning: "ភាពតានតឹងដែលជំរុញការច្នៃប្រឌិត និងរុញអ្នកឱ្យលូតលាស់" },
  trine: { name: "មុំ ១២០ ដឺក្រេ", meaning: "លំហូរធម្មជាតិរវាងភពទាំងពីរ ជាទេពកោសល្យដែលមកដោយងាយ" },
  opposition: { name: "ការទល់មុខគ្នា", meaning: "ជ្រុងពីរដែលត្រូវរកតុល្យភាព ច្រើនតែរៀនតាមរយៈមនុស្សផ្សេង" },
};

/** "1st house" / "ផ្ទះទី១". */
export const houseLabel = (n: number, lang: Lang = "en") => (lang === "km" ? `ផ្ទះទី${khmerDigits(n)}` : `${ORDINAL[n - 1]} house`);

export const natalCopy = (lang: Lang) =>
  lang === "km"
    ? { body: BODY_COPY_KM, sign: SIGN_COPY_KM, house: HOUSE_TOPIC_KM, aspect: ASPECT_COPY_KM }
    : { body: BODY_COPY, sign: SIGN_COPY, house: HOUSE_TOPIC, aspect: ASPECT_COPY };
