/**
 * Numerology wording (draft, original text, CONTENT_GUIDELINES.md: suggest,
 * never predict; no health or money advice). `core` describes a number as a
 * trait (life path, birthday and name numbers); `cycle` describes a personal
 * year or month (1–9 only). Khmer is a draft awaiting a native reader.
 */
import type { Lang } from "./i18n";

export const CORE: Record<Lang, Record<number, string>> = {
  en: {
    1: "The starter. You tend to go first, think for yourself and enjoy a fresh path.",
    2: "The partner. You notice how others feel and often do your best work alongside people.",
    3: "The storyteller. Words, play and making things come easily, and you can lift a room.",
    4: "The builder. You like a steady plan, careful work and things that last.",
    5: "The explorer. Change, travel and new people keep you curious and lively.",
    6: "The carer. Home, family and looking after others sit close to your heart.",
    7: "The thinker. You enjoy quiet, good questions and getting to the bottom of things.",
    8: "The organiser. You like to take charge, set goals and see them through.",
    9: "The giver. You care about the wider world and find meaning in helping.",
    11: "Master number 11, the intuitive. A sensitive, inspired version of 2: you often sense things before they are said.",
    22: "Master number 22, the master builder. A version of 4 with big plans: you like turning ideas into something real that others can share.",
    33: "Master number 33, the teacher. A version of 6 with a wide heart: you are drawn to encourage and guide others.",
  },
  km: {
    1: "អ្នកចាប់ផ្ដើម។ អ្នកច្រើនតែទៅមុនគេ គិតដោយខ្លួនឯង ហើយចូលចិត្តផ្លូវថ្មី។",
    2: "ដៃគូ។ អ្នកកត់សម្គាល់អារម្មណ៍អ្នកដទៃ ហើយច្រើនតែធ្វើការបានល្អបំផុតពេលនៅជាមួយគេ។",
    3: "អ្នកនិទានរឿង។ ពាក្យសម្ដី ការលេង និងការបង្កើតរបស់ថ្មីៗ មកដល់អ្នកដោយងាយ ហើយអ្នកអាចធ្វើឱ្យបរិយាកាសរស់រវើក។",
    4: "អ្នកសាងសង់។ អ្នកចូលចិត្តផែនការមាំទាំ ការងារយកចិត្តទុកដាក់ និងរបស់ដែលនៅបានយូរ។",
    5: "អ្នករុករក។ ការផ្លាស់ប្ដូរ ការធ្វើដំណើរ និងមនុស្សថ្មីៗ ធ្វើឱ្យអ្នកចង់ដឹងចង់ឃើញ និងរស់រវើក។",
    6: "អ្នកថែទាំ។ ផ្ទះ គ្រួសារ និងការមើលថែអ្នកដទៃ នៅជិតបេះដូងអ្នកបំផុត។",
    7: "អ្នកគិត។ អ្នកចូលចិត្តភាពស្ងប់ស្ងាត់ សំណួរល្អៗ និងការស្វែងយល់ឱ្យដល់ឫសគល់។",
    8: "អ្នករៀបចំ។ អ្នកចូលចិត្តដឹកនាំ កំណត់គោលដៅ ហើយធ្វើវាឱ្យសម្រេច។",
    9: "អ្នកផ្ដល់។ អ្នកយកចិត្តទុកដាក់ចំពោះពិភពលោកទូលំទូលាយ ហើយរកឃើញអត្ថន័យក្នុងការជួយគេ។",
    11: "លេខមេ ១១ អ្នកមានវិចារណញាណ។ ជាទម្រង់លេខ ២ ដែលរសើប និងពោរពេញដោយការបំផុសគំនិត៖ អ្នកច្រើនតែដឹងរឿងមុនគេនិយាយ។",
    22: "លេខមេ ២២ អ្នកសាងសង់ដ៏ធំ។ ជាទម្រង់លេខ ៤ ដែលមានផែនការធំ៖ អ្នកចូលចិត្តប្រែគំនិតឱ្យទៅជារបស់ពិត ដែលអ្នកដទៃប្រើរួមគ្នាបាន។",
    33: "លេខមេ ៣៣ គ្រូ។ ជាទម្រង់លេខ ៦ ដែលមានចិត្តទូលាយ៖ អ្នកចូលចិត្តលើកទឹកចិត្ត និងណែនាំអ្នកដទៃ។",
  },
};

export const CYCLE: Record<Lang, Record<number, string>> = {
  en: {
    1: "A time for beginnings: a good moment to start something of your own.",
    2: "A time for patience and partnership: small steps and kind words go far.",
    3: "A time to express yourself: share ideas, see friends, make something.",
    4: "A time to build: steady effort and good routines tend to pay off.",
    5: "A time for change: say yes to something new and keep plans flexible.",
    6: "A time for home and care: family, friends and promises come first.",
    7: "A time to reflect: rest, read and listen to your own thoughts.",
    8: "A time to take charge: set a clear goal and work towards it.",
    9: "A time to complete: finish, tidy up and let go of what you have outgrown.",
  },
  km: {
    1: "ពេលនៃការចាប់ផ្ដើម៖ ជាពេលល្អដើម្បីចាប់ផ្ដើមអ្វីមួយរបស់អ្នកផ្ទាល់។",
    2: "ពេលនៃការអត់ធ្មត់ និងភាពជាដៃគូ៖ ជំហានតូចៗ និងពាក្យសម្ដីល្អ នាំទៅបានឆ្ងាយ។",
    3: "ពេលបង្ហាញខ្លួនឯង៖ ចែករំលែកគំនិត ជួបមិត្តភក្ដិ បង្កើតអ្វីមួយ។",
    4: "ពេលសាងសង់៖ ការខិតខំជាប់លាប់ និងទម្លាប់ល្អ ច្រើនតែនាំមកនូវផល។",
    5: "ពេលផ្លាស់ប្ដូរ៖ ទទួលយកអ្វីដែលថ្មី ហើយរក្សាផែនការឱ្យបត់បែនបាន។",
    6: "ពេលសម្រាប់ផ្ទះ និងការថែទាំ៖ គ្រួសារ មិត្តភក្ដិ និងពាក្យសន្យា មកមុនគេ។",
    7: "ពេលពិចារណា៖ សម្រាក អានសៀវភៅ ហើយស្ដាប់គំនិតខ្លួនឯង។",
    8: "ពេលដឹកនាំ៖ កំណត់គោលដៅឱ្យច្បាស់ ហើយខិតខំឆ្ពោះទៅរកវា។",
    9: "ពេលបញ្ចប់៖ បញ្ចប់កិច្ចការ រៀបចំឱ្យស្អាត ហើយលែងនូវអ្វីដែលអ្នកលែងត្រូវការ។",
  },
};
