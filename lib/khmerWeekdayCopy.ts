/**
 * Short birth-weekday portraits. Original wording built on the traditional
 * associations (planet, colour, one keyword per day: km.wikipedia
 * «អត្ថន័យនៃពណ៌មង្គលប្រចាំថ្ងៃទាំង៧», facts only). Owner and a native
 * reader review before launch (docs/KHMER-REVIEW.md).
 */
export const WEEKDAY_COPY: Record<number, { summary: string; body: string[] }> = {
  0: {
    summary: "Sunday-born people carry the Sun's warmth: brave, direct and quick to act.",
    body: [
      "In Khmer tradition Sunday belongs to the Sun, and its colour is red, the colour of courage.",
      "Sunday-born people often step forward first. They speak plainly and like to see results.",
      "The old advice is to let red help you master strong feelings, so that courage stays warm rather than hot.",
    ],
  },
  1: {
    summary: "Monday-born people share the Moon's gentle light: cheerful, caring and easy to talk to.",
    body: [
      "Monday is the Moon's day. Its colour is ripe yellow, linked with joy and good cheer.",
      "Monday-born people tend to notice how others feel and make a room feel welcoming.",
      "Tradition sees their gift as lightness: they can lift a mood without trying.",
    ],
  },
  2: {
    summary: "Tuesday-born people have Mars's spark: confident, energetic and willing to take on a challenge.",
    body: [
      "Tuesday belongs to Mars, and its colour is purple, linked with self-confidence.",
      "Tuesday-born people like a goal to aim at. They tend to keep going when others slow down.",
      "Tradition pairs that drive with patience: confidence is strongest when it listens too.",
    ],
  },
  3: {
    summary: "Wednesday-born people share Mercury's quick mind: hopeful, sociable and good with words.",
    body: [
      "Wednesday is Mercury's day. Its colour is olive green, linked with optimism and leadership.",
      "Wednesday-born people often enjoy conversation, ideas and bringing people together.",
      "Their gift, by tradition, is hope: they can see a way forward and help others see it too.",
    ],
  },
  4: {
    summary: "Thursday-born people are guided by Jupiter: thoughtful, fair and generous.",
    body: [
      "Thursday belongs to Jupiter, the planet of teachers. Its colour is green, linked with good judgement and growth.",
      "Thursday-born people are often the ones others ask for advice, because they weigh things carefully.",
      "Tradition links the day with learning, respect for elders and steady prosperity.",
    ],
  },
  5: {
    summary: "Friday-born people share Venus's grace: determined, artistic and loyal to the people they love.",
    body: [
      "Friday is Venus's day, and its colour is blue, linked with determination and perseverance.",
      "Friday-born people often have an eye for beauty and a quiet staying power.",
      "Tradition sees in them a gift for keeping relationships and projects going over time.",
    ],
  },
  6: {
    summary: "Saturday-born people carry Saturn's steadiness: friendly, realistic and dependable.",
    body: [
      "Saturday belongs to Saturn. Its colour is a deep plum, linked with friendliness and a realistic view of life.",
      "Saturday-born people tend to be patient. They build slowly and keep what they build.",
      "By tradition their gift is reliability: people know they can count on them.",
    ],
  },
};

/**
 * The same seven portraits in Khmer. DRAFT for a native reader
 * (docs/KHMER-REVIEW.md): written to the tone rules in docs/I18N.md, not a
 * word-for-word translation.
 */
export const WEEKDAY_COPY_KM: Record<number, { summary: string; body: string[] }> = {
  0: {
    summary: "អ្នកកើតថ្ងៃអាទិត្យមានភាពកក់ក្ដៅរបស់ព្រះអាទិត្យ៖ ក្លាហាន និយាយត្រង់ និងរហ័សក្នុងការធ្វើ។",
    body: [
      "តាមប្រពៃណីខ្មែរ ថ្ងៃអាទិត្យជាថ្ងៃរបស់ព្រះអាទិត្យ ហើយពណ៌របស់ថ្ងៃនេះគឺក្រហម ជាពណ៌នៃភាពក្លាហាន។",
      "អ្នកកើតថ្ងៃអាទិត្យច្រើនតែជាអ្នកចេញមុខមុនគេ។ ពួកគេនិយាយត្រង់ៗ ហើយចូលចិត្តឃើញលទ្ធផល។",
      "ពាក្យចាស់ណែនាំថា ចូរឲ្យពណ៌ក្រហមជួយអ្នកគ្រប់គ្រងអារម្មណ៍ខ្លាំងៗ ដើម្បីឲ្យភាពក្លាហានរបស់អ្នកនៅតែកក់ក្ដៅ មិនមែនក្ដៅពេក។",
    ],
  },
  1: {
    summary: "អ្នកកើតថ្ងៃច័ន្ទមានពន្លឺទន់ភ្លន់របស់ព្រះចន្ទ៖ រីករាយ យកចិត្តទុកដាក់ និងងាយនិយាយជាមួយ។",
    body: [
      "ថ្ងៃច័ន្ទជាថ្ងៃរបស់ព្រះចន្ទ។ ពណ៌របស់ថ្ងៃនេះគឺលឿងទុំ ដែលភ្ជាប់នឹងសេចក្ដីរីករាយ និងចិត្តស្រស់ស្រាយ។",
      "អ្នកកើតថ្ងៃច័ន្ទច្រើនតែដឹងពីអារម្មណ៍អ្នកដទៃ ហើយធ្វើឲ្យកន្លែងមួយមានភាពកក់ក្ដៅ។",
      "ប្រពៃណីមើលឃើញថា អំណោយរបស់ពួកគេគឺភាពស្រាលចិត្ត៖ ពួកគេអាចធ្វើឲ្យអ្នកដទៃសប្បាយចិត្តដោយមិនបាច់ខំ។",
    ],
  },
  2: {
    summary: "អ្នកកើតថ្ងៃអង្គារមានកម្លាំងរបស់ព្រះអង្គារ៖ ជឿជាក់លើខ្លួនឯង សកម្ម និងហ៊ានទទួលការប្រកួតប្រជែង។",
    body: [
      "ថ្ងៃអង្គារជាថ្ងៃរបស់ព្រះអង្គារ ហើយពណ៌របស់ថ្ងៃនេះគឺស្វាយ ដែលភ្ជាប់នឹងទំនុកចិត្តលើខ្លួនឯង។",
      "អ្នកកើតថ្ងៃអង្គារចូលចិត្តមានគោលដៅច្បាស់។ ពួកគេច្រើនតែបន្តទៅមុខ ពេលអ្នកដទៃចាប់ផ្ដើមយឺត។",
      "ប្រពៃណីផ្គូផ្គងកម្លាំងនេះជាមួយការអត់ធ្មត់៖ ទំនុកចិត្តរឹងមាំបំផុត នៅពេលវាចេះស្ដាប់ផងដែរ។",
    ],
  },
  3: {
    summary: "អ្នកកើតថ្ងៃពុធមានគំនិតរហ័សរបស់ព្រះពុធ៖ មានក្ដីសង្ឃឹម ចូលចិត្តជួបមនុស្ស និងពូកែនិយាយ។",
    body: [
      "ថ្ងៃពុធជាថ្ងៃរបស់ព្រះពុធ។ ពណ៌របស់ថ្ងៃនេះគឺស៊ីលៀប ដែលភ្ជាប់នឹងក្ដីសង្ឃឹម និងភាពជាអ្នកដឹកនាំ។",
      "អ្នកកើតថ្ងៃពុធច្រើនតែចូលចិត្តការសន្ទនា គំនិតថ្មីៗ និងការនាំមនុស្សឲ្យជួបជុំគ្នា។",
      "តាមប្រពៃណី អំណោយរបស់ពួកគេគឺក្ដីសង្ឃឹម៖ ពួកគេមើលឃើញផ្លូវទៅមុខ ហើយជួយឲ្យអ្នកដទៃមើលឃើញដែរ។",
    ],
  },
  4: {
    summary: "អ្នកកើតថ្ងៃព្រហស្បតិ៍មានព្រះព្រហស្បតិ៍ជាអ្នកណែនាំ៖ ចេះគិត យុត្តិធម៌ និងចិត្តទូលាយ។",
    body: [
      "ថ្ងៃព្រហស្បតិ៍ជាថ្ងៃរបស់ព្រះព្រហស្បតិ៍ ដែលជាភពរបស់គ្រូ។ ពណ៌របស់ថ្ងៃនេះគឺបៃតង ដែលភ្ជាប់នឹងការពិចារណាល្អ និងការរីកចម្រើន។",
      "អ្នកកើតថ្ងៃព្រហស្បតិ៍ច្រើនតែជាអ្នកដែលគេមកសុំយោបល់ ព្រោះពួកគេថ្លឹងថ្លែងរឿងនានាដោយប្រុងប្រយ័ត្ន។",
      "ប្រពៃណីភ្ជាប់ថ្ងៃនេះនឹងការសិក្សា ការគោរពចាស់ទុំ និងភាពសម្បូរសប្បាយដែលកើនឡើងបន្តិចម្ដងៗ។",
    ],
  },
  5: {
    summary: "អ្នកកើតថ្ងៃសុក្រមានភាពស្រស់ស្អាតរបស់ព្រះសុក្រ៖ ម៉ឺងម៉ាត់ ចូលចិត្តសិល្បៈ និងស្មោះត្រង់នឹងអ្នកដែលខ្លួនស្រលាញ់។",
    body: [
      "ថ្ងៃសុក្រជាថ្ងៃរបស់ព្រះសុក្រ ហើយពណ៌របស់ថ្ងៃនេះគឺខៀវ ដែលភ្ជាប់នឹងការប្ដេជ្ញាចិត្ត និងការព្យាយាម។",
      "អ្នកកើតថ្ងៃសុក្រច្រើនតែមានភ្នែកមើលឃើញភាពស្រស់ស្អាត និងមានកម្លាំងស៊ូទ្រាំស្ងាត់ៗ។",
      "ប្រពៃណីមើលឃើញថា ពួកគេពូកែថែរក្សាទំនាក់ទំនង និងការងារឲ្យបន្តបានយូរ។",
    ],
  },
  6: {
    summary: "អ្នកកើតថ្ងៃសៅរ៍មានភាពនឹងនរបស់ព្រះសៅរ៍៖ រួសរាយ មើលជីវិតតាមការពិត និងគួរឲ្យទុកចិត្ត។",
    body: [
      "ថ្ងៃសៅរ៍ជាថ្ងៃរបស់ព្រះសៅរ៍។ ពណ៌របស់ថ្ងៃនេះគឺព្រីងទុំ ដែលភ្ជាប់នឹងភាពរួសរាយ និងការមើលជីវិតតាមការពិត។",
      "អ្នកកើតថ្ងៃសៅរ៍ច្រើនតែអត់ធ្មត់។ ពួកគេកសាងបន្តិចម្ដងៗ ហើយរក្សាអ្វីដែលខ្លួនបានកសាង។",
      "តាមប្រពៃណី អំណោយរបស់ពួកគេគឺភាពទុកចិត្តបាន៖ អ្នកដទៃដឹងថាអាចពឹងពួកគេបាន។",
    ],
  },
};
