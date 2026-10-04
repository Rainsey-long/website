# Khmer traditional fortune-telling: what can be computed

Research date: 2026-10-04. Purpose: decide which Khmer traditions a horoscope/almanac site can compute from a birth date (and optionally a birth time) with no human astrologer.

**Source labels used throughout**

- **PRIMARY**: I read the page, PDF or code myself, and ran the code where noted.
- **SUMMARY**: the claim comes from search-result snippets, or from my own background knowledge. It has not been checked against a primary source.

**Copyright.** Reuse facts and tables only. Do not reuse prose.

- Khmer Wikipedia is CC BY-SA 4.0. Its prose needs attribution and share-alike, so rewrite the text in your own words and use the tables as facts.
- momentkh, chhankitek and flutter_khmer_chankitec are MIT-licensed, so their code can be reused with the copyright notice kept.
- François Bizot's article is copyrighted academic prose. Use its structure as facts and cite it.

**Fetch notes**

- These worked: GitHub clones, the Khmer Wikipedia raw wikitext (through `curl`), the Bizot PDF, arXiv, Nagoya CALE and Packagist.
- These failed:
  - `khmer-calendar.tovnah.com` (Phylypo Tum's site): HTTP 503.
  - web.archive.org: blocked by the egress policy.
  - `dahlina.com` (the New Year algorithm write-up): 404.
  - th.wikipedia and en.wikipedia "Nang Songkran": 404.
  - `openbooks.lib.msu.edu` and phoenixvoyages: 403.
- No Ministry of Cults and Religion page could be found or fetched.

---

## 0. Summary of the candidate systems

| # | System | Inputs | Deterministic? | Confidence | Build? |
|---|---|---|---|---|---|
| 1 | Khmer lunisolar date (Chhankitek): lunar day, waxing or waning, month, BE year, animal year, sak | Date (time only matters on transition days) | **Yes**: published algorithm, MIT code | High | **Yes** (foundation) |
| 2 | Moha Songkran date and time, plus the year's New Year angel (Tevoda) | Year | **Yes** | High for date and angel; medium for exact minutes | **Yes** |
| 3 | Birth weekday (ថ្ងៃកំណើត): planet, colour, angel, personality | Date | **Yes** (a plain weekday) | High for planet and colour; medium for personality text | **Yes** |
| 4 | Buddhist holy days (ថ្ងៃសីល) and festival dates | Date | **Yes**, derived from #1 | High | **Yes** (almanac) |
| 5 | Daksa / Taksa clothing colours (8 roles per birth weekday) | Birth weekday | **Yes** | Medium for the algorithm (Thai form, Khmer use unverified) | Maybe, labelled "Thai-Khmer tradition" |
| 6 | Reasey (រាសី), the sidereal sun sign | Date | **Yes** | Medium | Maybe |
| 7 | Bizot's "eight influences" (អដ្ឋគ្រោះ) and Reamker "seat" | Sex, age, birth year | Yes | High that it exists; the readings concern illness and ghosts | **No**: sensitive |
| 8 | 27 nakshatra (ឫក្ស), daily | Date and time | Yes in principle, but the Khmer almanac method is unknown | Low | Not yet |
| 9 | Yearly "Tumneay" (ទំនាយ): rain, harvest, war, disease | Year | Partly | Low to medium | Show only the soft parts |
| 10 | "Good days" (ថ្ងៃល្អ) for weddings or house moves; number/name "teay" | Varies | **No published rule found**; an achar decides | Low | **No** |

---

## 1. The Khmer lunisolar calendar (ចន្ទគតិ, Chhankitek)

### 1.1 Sources

| Source | What it is | Licence | Label |
|---|---|---|---|
| github.com/ThyrithSor/momentkh (npm `@thyrith/momentkh`, v3.0.3) | TypeScript, zero dependencies: Gregorian ↔ Khmer conversion, BE/JS year, animal year, sak, Moha Songkran time | **MIT**, © 2018 ThyrithSor | **PRIMARY**: cloned, read `momentkh.ts`, ran it |
| github.com/HELMAB/chhankitek (Packagist `asorasoft/chhankitek`) | PHP port | **MIT**, © Mab Hel | **PRIMARY** (LICENSE and README) |
| pub.dev `flutter_khmer_chankitec` (github.com/vengann/flutter_khmer_chankitec) | Dart port with Sila-day detection | **MIT**, © 2026 Veng Ann | SUMMARY (pub.dev page read; the GitHub page returned 404) |
| Phylypo Tum, "Khmer Calendar", khmer-calendar.tovnah.com/calendar/chhankitek.php | The original description of the algorithm. Every port credits it. | Unknown (site down) | Not fetched (503; archive blocked) |
| H.E. Roath Kim Soeun, 22 e-books on calculating the Cambodian lunisolar calendar, results for 1–3316 AD (cale.law.nagoya-u.ac.jp/reference/reference-1011) | Authoritative Cambodian reference tables. They can be used to validate the code. | Free download with the author's consent; no formal licence | **PRIMARY** (landing page only; books not downloaded) |
| Khmer Wikipedia article «ចន្ទគតិ» | Month lengths, leap types, sak list | CC BY-SA | **PRIMARY** (raw wikitext) |
| Vernotte & Kichenassamy (2017), "A study of ancient Khmer ephemerides", arXiv:1709.09620 | Faraut's 1910 Khmer ephemerides are of Indian origin, adapted to a Burmese longitude | arXiv non-exclusive | **PRIMARY** (abstract only) |
| J.C. Eade, "Rules for interpolation in the Thai calendar", JSS 88 | Thai and Burmese Chula Sakarat background; the same Surya-Siddhanta family | n/a | SUMMARY |

I could not find the book "Pratitin Soriyatra Lerng Sak" by name. The Roath Kim Soeun series at Nagoya is the closest verifiable Cambodian publication.

### 1.2 Algorithm (from momentkh source, PRIMARY)

**Year eras**

| Era | Conversion |
|---|---|
| BE (ពុទ្ធសករាជ) | BE = AD + 544 on or after 1 waning (១រោច) of Pisakh; AD + 543 before it. The BE year changes at midnight of 1 rōc Pisakh, the day after Visak Bochea. |
| JS (ចុល្លសករាជ, Chula Sakarat) | JS = AD − 638 = BE − 1182 |

**Core quantities, indexed by BE year**

```
aharkun(BE)    = floor((BE*292207 + 499) / 800) + 4      // ហារគុណ: days elapsed
kromthupul(BE) = 800 - ((BE*292207 + 499) mod 800)        // ក្រមធុពល
avoman(BE)     = (aharkun*11 + 25) mod 692                // អវមាន
bodithey(BE)   = (floor((aharkun*11 + 25)/692) + aharkun + 29) mod 30   // បូតិថី
isSolarLeap(BE) = kromthupul <= 207                       // 366-day solar year
```

**Leap month (អធិកមាស)**: a 13-month year of 384 days.

```
isLeapMonth(BE) =
  NOT (bodithey==25 && bodithey(BE+1)==5) AND
  ( (bodithey==24 && bodithey(BE+1)==6) || bodithey>=25 || bodithey<6 )
```

**Leap day (ចន្ទ្រាធិមាស / អធិកវារៈ)**: Jesth gets 30 days, giving 355 days.

```
isLeapDay(BE):
  if avoman==0 && avoman(BE-1)==137 -> true
  elif isSolarLeap -> avoman < 127
  elif avoman==137 && avoman(BE+1)==0 -> false
  elif avoman < 138 -> true
  else false
```

The leap type is decided in this order:

1. If the year is a leap-month year, it is a leap-month year.
2. Otherwise, if it is a leap-day year, it is a leap-day year.
3. Otherwise, if the previous year was a leap-month year, the leap day is pushed forward. Walk back through consecutive leap-month years; if any of them had a leap day, this year takes it.

A leap-month year and a leap-day year never coincide. The leap day is carried to the next year.

**Months (PRIMARY: momentkh and km.wikipedia)**

Normal months alternate 29 and 30 days. The year starts at Migasir for counting purposes, but the BE year changes at Pisakh.

| Idx | Khmer | Romanised | Days | Approx. Gregorian |
|---|---|---|---|---|
| 0 | មិគសិរ | Migasir (Mikasé) | 29 | Nov–Dec |
| 1 | បុស្ស | Boss (Bos) | 30 | Dec–Jan |
| 2 | មាឃ | Meak | 29 | Jan–Feb |
| 3 | ផល្គុន | Phalkun | 30 | Feb–Mar |
| 4 | ចេត្រ | Cheit (Chetr) | 29 | Mar–Apr (New Year) |
| 5 | ពិសាខ | Pisakh | 30 | Apr–May (Visak Bochea, 15 kaeut) |
| 6 | ជេស្ឋ | Jesth (Jes) | 29, or **30 in a leap-day year** | May–Jun |
| 7 | អាសាឍ | Asadh | 30 (replaced in a leap-month year) | Jun–Jul |
| 12 | បឋមាសាឍ | Pathamasadh (1st Asadh) | 30, leap-month years only | |
| 13 | ទុតិយាសាឍ | Tutiyasadh (2nd Asadh) | 30, leap-month years only | |
| 8 | ស្រាពណ៍ | Srap | 29 | Jul–Aug |
| 9 | ភទ្របទ | Phatrabot (Photrobot) | 30 | Aug–Sep (Pchum Ben ends 15 rōc) |
| 10 | អស្សុជ | Assoch | 29 | Sep–Oct |
| 11 | កត្តិក | Kadeuk | 30 | Oct–Nov (Water Festival, 15 kaeut) |

In a leap-month year the order is Jesth → Pathamasadh → Tutiyasadh → Srap; plain Asadh is skipped.

**Days.** Days run 1–15 កើត (kaeut, waxing), then 1–14 or 1–15 រោច (rōc, waning). A 29-day month ends on 14 rōc; a 30-day month ends on 15 rōc.

**Conversion method.** The epoch is 1 Jan 1900 = 1 kaeut of Boss. The converter walks forward by whole Khmer years (354, 355 or 384 days), then by months, then by days.

**Animal year (ឆ្នាំ)**

- Formula: `((BE + 4) mod 12)` gives an index into the table below.
- The animal advances at the **exact Moha Songkran moment**, not at Chinese New Year and not at the BE change.

| Idx | Khmer | Romanised | English |
|---|---|---|---|
| 0 | ជូត | Chhut | Rat |
| 1 | ឆ្លូវ | Chlov | Ox |
| 2 | ខាល | Khal | Tiger |
| 3 | ថោះ | Thos | Rabbit |
| 4 | រោង | Rong | Dragon |
| 5 | ម្សាញ់ | Masagn | Snake |
| 6 | មមី | Momee | Horse |
| 7 | មមែ | Momae | Goat |
| 8 | វក | Vok | Monkey |
| 9 | រកា | Roka | Rooster |
| 10 | ច | Cho | Dog |
| 11 | កុរ | Kor | Pig |

**Sak (ស័ក), a 10-year cycle**

- Formula: `JS mod 10`.
- The sak advances at **midnight starting Leung Sak day** (the 3rd or 4th day of the New Year).

| JS mod 10 | Khmer | Romanised |
|---|---|---|
| 1 | ឯកស័ក | Ek sak |
| 2 | ទោស័ក | To sak |
| 3 | ត្រីស័ក | Trei sak |
| 4 | ចត្វាស័ក | Chattva sak |
| 5 | បញ្ចស័ក | Pancha sak |
| 6 | ឆស័ក | Chha sak |
| 7 | សប្តស័ក | Sapta sak |
| 8 | អដ្ឋស័ក | Attha sak |
| 9 | នព្វស័ក | Nobpa sak |
| 0 | សំរឹទ្ធិស័ក | Samrith sak |

**Weekdays**: អាទិត្យ, ចន្ទ, អង្គារ, ពុធ, ព្រហស្បតិ៍, សុក្រ, សៅរ៍.

**Lunar-day glyphs**: momentkh ships the Unicode lunar-date symbols ᧡–᧿ (U+19E0 block).

### 1.3 Verification (PRIMARY: ran momentkh 3.0.3)

| Gregorian | momentkh output | Known fact |
|---|---|---|
| 2025-05-11 | 15 kaeut Pisakh, BE 2568, Snake, Sapta sak | Visak Bochea 2025 ✓ |
| 2025-09-22 | 15 rōc Phatrabot | Pchum Ben main day 2025 ✓ |
| 2024-05-22 | 15 kaeut Pisakh | Visak Bochea 2024 ✓ |
| 2026-05-01 | 15 kaeut Pisakh | Visak Bochea 2026 ✓ (matches the published holiday, as far as I know) |
| 2026-10-11 | 15 rōc Phatrabot, BE 2570, Horse, Attha sak | Pchum Ben 2026 (10–12 Oct) ✓ |
| 2026-10-04 (today) | 8 rōc Phatrabot, BE 2570, ឆ្នាំមមី អដ្ឋស័ក | |

**Caveats**

- momentkh's own tests are regression tests generated from its own output. They are not an independent ground truth.
- Before launch, validate against Roath Kim Soeun's tables or printed Khmer calendars for a few hundred dates.
- momentkh uses the host's local time zone in `new Date(...)`. Run it with TZ=Asia/Phnom_Penh (UTC+7), or patch the Date calls, so that transition moments are right.

---

## 2. Moha Songkran (មហាសង្ក្រាន្ត) and the New Year angel (ទេវតាឆ្នាំថ្មី)

### 2.1 Date and time (PRIMARY: momentkh `getNewYearInfo` / `getSunInfo`)

The New Year is the moment the sun enters sidereal Aries (មេស), computed with the traditional Surya-Siddhanta-style integer arithmetic. The JS-year forms of the constants differ from the BE forms:

```
aharkunJs = floor((JS*292207 + 373)/800) + 1
avomanJs = (aharkunJs*11 + 650) mod 692
kromthupulJs = 800 - ((292207*JS + 373) mod 800)
```

Steps:

1. **Mean sun.** For candidate day counts (sotin) 363–366, or 362–365 if the previous year was not 366 days: `r2 = 800*sotin + kromthupul(JS-1)`. Then reasey = floor(r2/24350), angsar = floor((r2 mod 24350)/811), and libda from the remainder.
2. **Equation of centre.** Apply a 6-step "chhaya" table: multiplicity 35, 32, 27, 22, 13, 5 with offsets 0, 35, 67, 94, 116, 129, and 134 beyond that. This gives the true sun.
3. **New Year day.** It is the candidate where angsar = 0. The time is `24*60 − libda*24` minutes.
4. **Festival length.**
   - Vanabat days (វារៈវ័នបត) = 2 if the first candidate already has angsar 0, otherwise 1.
   - So the festival is 4 days or 3 days long.
   - Leung Sak (វារៈឡើងស័ក) is the last day. Its lunar date comes from bodithey: day (bodithey − 1) of Cheit if bodithey ≥ 6, otherwise day bodithey of Pisakh.
5. **Overrides.** momentkh hard-codes exceptional years (1879, 1897, 2011–2015, 2024) to match the officially announced times. For example, 2024 is announced as 13 Apr 22:17. The Khmer Wikipedia table says 22:24 for 2024, so sources disagree by minutes. **Recommendation:** show the date confidently. Show the time as "≈", or keep an admin-editable override table filled from each year's Ministry of Cults and Religion announcement.

momentkh output, cross-checked against the Khmer Wikipedia table «ថ្ងៃនៃមហាសង្ក្រាន្ត» (PRIMARY):

| Year | momentkh (UTC+7) | km.wikipedia | Weekday → angel |
|---|---|---|---|
| 2020 | 13 Apr 20:48 | 13 Apr 20:48, គោរាគៈទេវី | Mon ✓ |
| 2021 | 14 Apr 04:00 | 14 Apr 04:00, មណ្ឌាទេវី | Wed ✓ |
| 2022 | 14 Apr 10:00 | 14 Apr 10:00, កិរិណីទេវី | Thu ✓ |
| 2023 | 14 Apr 16:00 | 14 Apr 16:00, កិមិរាទេវី | Fri ✓ |
| 2024 | 13 Apr 22:17 | 13 Apr 22:24, មហោទរាទេវី | Sat ✓ (minutes differ) |
| 2025 | 14 Apr 04:48 | 14 Apr 04:48, គោរាគៈទេវី | Mon ✓ |
| 2026 | 14 Apr 10:48 | 14 Apr 10:48, រាក្យៈសាទេវី | Tue ✓ |
| 2027 | 14 Apr 16:48 | (Wed) | Wed → មណ្ឌាទេវី |

**Rule: the angel is the daughter of the weekday on which Moha Songkran falls.** This is fully deterministic.

### 2.2 The seven angels (PRIMARY: km.wikipedia «ចូលឆ្នាំខ្មែរ», section «ទេវតាសង្ក្រាន្តទាំង៧»)

The table there is attributed to the Khmer Customs Committee of the Buddhist Institute (ក្រុមជំនុំទំនៀមទម្លាប់ខ្មែរ ពុទ្ធសាសនបណ្ឌិត្យ), 1960. They are the seven daughters of Kabil Moha Prom (កបិលមហាព្រហ្ម).

| Day | Name (Khmer) | Romanised | Day colour (robe) | Ear flower | Jewel | Food | Left hand / Right hand | Mount |
|---|---|---|---|---|---|---|---|---|
| Sun | ទុង្សាទេវី | Tungsa Tevy | Red (ក្រហម) | Pomegranate flower (ផ្កាទទឹម) | Ruby (បទុមរាគ / ត្បូងទទឹម) | Figs (ផ្លែល្វា / ឧទុម្ពរ) | Conch (ស័ង្ខ) / Discus (កងចក្រ) | Garuda (គ្រុឌ) |
| Mon | គោរាគៈទេវី | Koreak Tevy | Ripe yellow / orange (លឿងទុំ, #FFAA1D) | Angkeabos flower (ផ្កាអង្គាបុស្ប) | Pearl (កែវមុក្តា) | Oil: sesame or bean (ប្រេង) | Walking staff (ឈើច្រត់) / Sword (ព្រះខ័ន) | Tiger (ខ្លាធំ) |
| Tue | រាក្យៈសាទេវី | Reaksa Tevy | Purple (ស្វាយ) | Lotus (ផ្កាឈូក) | Coral (កែវមោរ៉ា) | Blood (លោហិត) | Bow (ធ្នូ) / Trident (ត្រីសូល៍) | **Horse** (សេះ). Thailand's equivalent rides a boar. |
| Wed | មណ្ឌាទេវី | Mondea Tevy | Olive / green-gold (ស៊ីលៀប) | Champa (ផ្កាចម្ប៉ា) | Cat's-eye (កែវពិទូរ្យ) | Ghee / milk (ទឹកដោះសប្បិ) | Staff (ឈើច្រត់) / Needle (ម្ជុល) | Donkey (លា) |
| Thu | កិរិណីទេវី | Kirinei Tevy | Green (បៃតង) | Mandara flower (ផ្កាមន្ទារ) | Emerald (មរកត) | Beans and sesame (សណ្ដែក ល្ង) | Gun / vajra (កាំភ្លើង) / Elephant hook (កង្វេរ) | Elephant (ដំរី) |
| Fri | កិមិរាទេវី | Kimira Tevy | Blue (ខៀវ) | Romchang flower (ផ្ការំចង់ / ចង្កុលណី) | Topaz (ផុស្សរាគ) | Bananas (ចេកណាំវ៉ា) | Lute (ពិណ) / Sword (ព្រះខ័ន) | Water buffalo (ក្របី) |
| Sat | មហោទរាទេវី | Mohorea Tevy | Dark purple (ព្រីងទុំ) | Trakiet flower (ផ្កាត្រកៀត) | Sapphire (និលរ័តន៍) | Venison: deer or muntjac (សាច់ក្ដាន់ ឈ្លូស) | Trident (ត្រីសូល៍) / Discus (កងចក្រ) | Peacock (ក្ងោក) |

**Variants.** The names are spelled differently across sources:

- jiras.se (PRIMARY, English): Tungsa, Koreakak, Reaksa, Mondar, Keriny, Kemira, Mohurea.
- RFA Khmer 2017 (PRIMARY): ទុង្សាទេវី, គោរាគទេវី, រាក្យៈសាទេវី, មណ្ឌាទេវី, កិរិណីទេវី, កិមិរាទេវី, មហោទរាទេវី.

The jiras.se attributes match the Khmer table, apart from a few translations ("gun" for the vajra, "Violet" for romchang). The robe colours are disputed: the same Wikipedia article notes that newer books changed Wednesday, Friday and Saturday to sky-blue, white and blue, while "ancestral" usage keeps olive, blue and dark purple. RFA 2017 describes Kimira in white. **Recommendation:** use the table above and add a "colours vary by almanac" footnote.

**Posture by arrival time (PRIMARY, same article).** It depends on the Songkran time, so it is computable.

| Arrival time | Posture |
|---|---|
| 06:00–12:00 | Standing (ទ្រង់ឈរ) |
| 12:00–18:00 | Sitting (ទ្រង់អង្គុយ) |
| 18:00–24:00 | Reclining, eyes open (ផ្ទំបើកព្រះនេត្រ) |
| 00:00–06:00 | Reclining, eyes closed (ផ្ទំបិទព្រះនេត្រ) |

The Thai Nang Songkran system is the same (SUMMARY: thailandfoundation, wu.ac.th snippets).

### 2.3 Yearly prediction (ទំនាយ / សិទ្ធិការ្យ)

**The angel's omen (PRIMARY, km.wikipedia «សិទ្ធិការ្យ ទេវតាមហាសង្ក្រាន្ត»):**

| Angel | Omen |
|---|---|
| Sun | Drought and crop trouble |
| Mon | Officials lose rank |
| Tue | War, conflict with other countries, many epidemics |
| Wed | Rulers and officials are honoured abroad, but small children fall ill |
| Thu | Monks and elders are troubled; storms and thunder |
| Fri | Abundant rice and crops, but strong winds and storms |
| Sat | Fire danger, money trouble, much theft |

The article itself says ancient masters did **not** reveal these predictions publicly because they cause unrest. Most are negative or concern health and war.

**The Ministry's yearly booklet.** The fuller yearly Tumneay is published in the annual Moha Songkran booklet (សៀវភៅមហាសង្ក្រាន្ត) under the Ministry of Cults and Religion (SUMMARY: search snippets). It covers rain, the number of nagas giving water (នាគឲ្យទឹក), rice yield and similar items. I found no published derivation formula for the Khmer version; the Thai one uses year arithmetic (SUMMARY, Thairath snippets). An RFA 2017 example (PRIMARY) reads: "crops half-damaged by insects".

**Recommendation for the Tumneay**

- Show the angel, her attributes and the posture.
- Show only neutral or positive items, such as rain or harvest, as "traditional saying".
- Do **not** show war, epidemic, illness or official-downfall omens.
- Optionally let an admin paste in the official yearly Tumneay with attribution.

---

## 3. Birth weekday (ថ្ងៃកំណើត)

The inputs are the date only. The **Khmer day boundary** for astrology is traditionally sunrise rather than midnight (SUMMARY, general Indic practice). If a birth time is supplied, consider treating births before about 06:00 as the previous day, and offer this as a toggle.

| Day | Khmer | Ruling planet / deity | Bizot number | Colour (km.wikipedia, Khmer ancestral) | Meaning given | Thai colour, for contrast |
|---|---|---|---|---|---|---|
| Sun | អាទិត្យ | Sun (ព្រះអាទិត្យ) | 1 | Red (ក្រហម) | Courage | Red |
| Mon | ចន្ទ | Moon (ព្រះចន្ទ) | 2 | Ripe yellow / orange (លឿងទុំ) | Joy, cheerfulness | Yellow |
| Tue | អង្គារ | Mars (ព្រះអង្គារ) | 3 | Purple (ស្វាយ) | Self-confidence | Pink |
| Wed | ពុធ | Mercury (ព្រះពុធ) | 4 | Olive green (ស៊ីលៀប) | Optimism, leadership | Green |
| Thu | ព្រហស្បតិ៍ | Jupiter (ព្រះព្រហស្បតិ៍) | 5 | Green (បៃតង) | Judgement, prosperity | Orange |
| Fri | សុក្រ | Venus (ព្រះសុក្រ) | 6 | Blue (ខៀវ) | Determination, perseverance | Light blue |
| Sat | សៅរ៍ | Saturn (ព្រះសៅរ៍) | 7 | Dark purple / plum (ព្រីងទុំ) | Friendliness, realism | Purple |
| (Rahu) | រាហ៊ូ | Rahu | 8 | n/a | Inserted between Thu and Fri in the Khmer grids (Bizot). In Thai practice it is Wednesday night. | |

Sources and labels:

- Planets and numbers: **PRIMARY**, Bizot 2013, p.176: "Dimanche a le nombre 1 … samedi 7, Rāhū 8". The weekday names *are* the Navagraha names.
- Colours and meanings: **PRIMARY**, km.wikipedia «អត្ថន័យនៃពណ៌មង្គលប្រចាំថ្ងៃទាំង៧». That section also gives a short character sketch per birth weekday, which can be paraphrased as facts. Example: Sunday-born people are quick to anger and red helps them master their emotions.
- Other variants (SUMMARY, snippets): Monday orange, Wednesday "mustard / green with red sheen", Saturday "burgundy" or "brown".
- Thai colours: SUMMARY.

The colours are the same as the angels' robe colours, so the birth-weekday angel is also a natural "personal angel" (Sunday-born → Tungsa Tevy, and so on). This is an inference that the article supports. It is popular on Khmer social media (SUMMARY).

---

## 4. Buddhist holy days (ថ្ងៃសីល) and festivals

**Sila days (ថ្ងៃសីល)** fall on 8 កើត, 15 កើត, 8 រោច, and the last day of the month: 14 រោច in a 29-day month, 15 រោច in a 30-day month. Four per month.

- Source: SUMMARY. This is standard Theravada uposatha. The flutter package advertises Sila detection, but I could not read its code.
- Deterministic once #1 is computed. High confidence.

**Festivals computable from #1** (dates PRIMARY via momentkh checks; the month table also appears in km.wikipedia):

| Festival | Lunar date |
|---|---|
| Meak Bochea | 15 kaeut Meak |
| Visak Bochea | 15 kaeut Pisakh |
| Royal Ploughing Ceremony (ច្រត់ព្រះនង្គ័ល) | 4 rōc Pisakh (SUMMARY) |
| Chol Vossa, start of Lent | 15 kaeut Asadh, or Tutiyasadh in a leap year |
| Pchum Ben | Dak Ben from 1 rōc Phatrabot to Pchum Ben on 15 rōc Phatrabot |
| Chenh Vossa, end of Lent | 15 kaeut Assoch |
| Water Festival / Ok Ambok | 14 and 15 kaeut Kadeuk, plus 1 rōc |

---

## 5. Daksa / Taksa (ទក្សា): eight roles and clothing colours (SUMMARY)

This is the Thai *Taksa* system. Khmer calendars publish similar per-day "victory / lucky / unlucky colour" lists. I **could not** find a primary Khmer source; Khmer searches returned nothing relevant.

The algorithm as known from Thai practice (my background knowledge; **verify before use**):

1. Fix the ring order of the eight planets: Sun(1) → Moon(2) → Mars(3) → Mercury(4) → Saturn(7) → Jupiter(5) → Rahu(8) → Venus(6). It wraps around.
2. Start at the planet of the birth weekday.
3. Assign these roles in order:

| Order | Role | Meaning |
|---|---|---|
| 1 | Boriwan (បរិវារ) | Retinue |
| 2 | Ayu (អាយុ) | Longevity |
| 3 | Det (តេជះ) | Power |
| 4 | Sri (សិរី) | Fortune |
| 5 | Mula (មូល) | Foundation |
| 6 | Utsaha (ឧស្សាហ៍) | Diligence |
| 7 | Montri (មន្ត្រី) | Patronage |
| 8 | Kalakini (កាលកិណី) | Misfortune |

4. The colour of the weekday holding each role is that role's colour.

Example: a Sunday-born person has Kalakini = Venus, i.e. Friday's blue, so blue is "avoid". Monday-born avoids red.

Bizot gives a different Khmer ordering, 1 2 3 4 5 8 7 6 for women and 7 5 8 6 1 2 3 4 for men. It is used for an age-cycling grid, not for Taksa. This shows the Khmer manuals use the same 8-planet set with Rahu, but a Khmer Taksa table is still unverified.

**Recommendation:** either skip this, or label it "Thai–Khmer Daksa tradition" until a Khmer almanac page is checked. Show "unlucky colour" softly, e.g. "colour to go easy on".

---

## 6. Reasey (រាសី): the sidereal sun sign

**Facts**

- The Khmer Gregorian month names are the rasi names (PRIMARY: momentkh constants and km.wikipedia): មករា = Capricorn (Makara), កុម្ភៈ = Aquarius, មីនា = Pisces, មេសា = Aries, ឧសភា = Taurus, មិថុនា = Gemini, កក្កដា = Cancer, សីហា = Leo, កញ្ញា = Virgo, តុលា = Libra, វិច្ឆិកា = Scorpio, ធ្នូ = Sagittarius. Today these are fixed Gregorian months, not sign boundaries.
- The traditional New Year is the sun's entry into **sidereal** Mesha (~13–14 April), not the tropical equinox (~20 March).
- The traditional algorithm in momentkh `getSunInfo` returns the sun's reasey, angsar (degree) and libda (minute). PRIMARY code. It is called only around New Year, but it is a general Surya-Siddhanta mean-plus-equation solar longitude.

Sign names for the UI, as Khmer/Pali forms: មេស, ឧសភ, មិថុន, កក្កដ, សីហ, កញ្ញ, តុល, វិច្ឆិក, ធ្នូ, មករ, កុម្ភ, មីន (SUMMARY on spelling).

**How to compute**

- Option (a): generalise `getSunInfo` to any day. This is self-consistent with the Khmer New Year, so the sun enters Mesha exactly at Songkran. Needs some engineering and verification.
- Option (b): use a modern ephemeris with an ayanamsa. Calibrate it so that sun-into-Mesha matches the Songkran moments in §2.1. The traditional Surya-Siddhanta Songkran (~13/14 Apr) is close to Lahiri; Lahiri's ayanamsa is ~24.2° in 2026 (SUMMARY).
- Either way, the sign changes around the 13th–17th of each Gregorian month.

**Confidence: medium.** Most Cambodians know their animal year and birth weekday far better than their reasey (SUMMARY: the Metfone "astroreka" site centres on the 12 animals). A full Khmer natal horoscope (ascendant, planets) needs an achar's method that I could not verify. **Do not build it.**

---

## 7. Bizot's "eight influences" and Reamker seats (PRIMARY, but sensitive)

François Bizot, «L'horoscope perdu des devins du Cambodge», *Extrême-Orient Extrême-Occident* 35 (2013), from five rescued manuscripts (TK 280/287/300/307/480).

**Animal year → "race" and "seat" (dinaṃṅ, ទីនាំង)** (footnote 14):

| Animal | Race | Seat |
|---|---|---|
| Rat | Gods | Bibhek |
| Ox | Humans | Preah Ream |
| Tiger | Yakkha | Khar |
| Rabbit | Humans | Preah Leak |
| Dragon | Gods | Neang Seda |
| Snake | Humans | Hanuman |
| Horse | Gods | Reap (Ravana) |
| Goat | Gods | Bibhek |
| Monkey | Yakkha | Preah Ream |
| Rooster | Yakkha | Reap |
| Dog | Yakkha | Preah Leak |
| Pig | Humans | Neang Seda |

The rule given is that a demon-race person and a god-race person (for example Reap and Seda) cannot marry safely. Bizot notes these tables are "incomplete, scattered … little used by diviners".

**The "eight influences" (អដ្ឋគ្រោះ) method.** Count your age along a 32-cell grid in a different order for men and women. This gives a direction (1 NE, 2 E, 3 SE, 4 S, 7 SW, 5 W, 8 NW, 6 N), then a Reamker character, then one of four life-stage episodes. The episodes mostly diagnose **illness caused by ghosts (ខ្មោច)** and prescribe offerings. Bizot also describes a second method, the "Arrows of Preah Ream".

**Verdict.** It is deterministic and authentically Khmer. But:

- the readings concern illness, spirits and marriage bans;
- the episode texts are Bizot's copyrighted translations;
- it would encourage paid rituals.

**Do not build it.** At most, mention the Reamker seat as a cultural fact.

---

## 8. The 27 nakshatras (ឫក្ស)

Khmer almanacs list a daily *rœks* (SUMMARY). The Khmer lunar month names come from nakshatras, and a vandalised km.wikipedia list pairs each lunar month with a "ឫក្ស" animal. Low confidence; it is not usable.

The computation is the moon's sidereal longitude divided by 13°20′. Which model Khmer almanacs use, and whether they use 27 or 28 mansions, is unverified. **Not recommended** until a printed Khmer almanac page is checked.

---

## 9. Not computable, or should be avoided

| Practice | Why not |
|---|---|
| Choosing a wedding or house-move "good day" (ថ្ងៃល្អ / ពិធីរើសថ្ងៃ) | Families ask an **achar** (Wikipedia "Courtship, marriage, and divorce in Cambodia": "the families consult an achar to set the wedding date", PRIMARY). I found no published rule set. Weddings are commonly avoided during Vossa (Asadh to Assoch) (SUMMARY, background knowledge). You *could* list the Vossa period and the sila days as "traditionally avoided or observed", which is factual. Do not label days "good" or "bad". |
| Number / name divination, "teay" (ទាយ) | No primary algorithm found. Practices vary by fortune-teller (គ្រូទាយ). |
| Palm, face or mole reading; "Arrows of Preah Ream"; card or stick (ចាប់ឆ្នោត / កៀមស៊ីម) temple divination | Needs a human or a random draw. Random draws are fine as entertainment, but they are not a "computed" tradition. |
| Death, illness, accident or "bad year" (ឆ្នាំឆុង-style clash) warnings, and paid ritual remedies (ស្តោះគ្រោះ, បង្វិលគ្រោះ, buying amulets) | Harm and exploitation risk. Avoid them, or soften to "a year to take care". |

---

## 10. Recommendation

### Build these, in order

1. **Khmer date and year card** (§1). Shows the lunar date, waxing or waning, month, BE year, animal year and sak (e.g. «ថ្ងៃអាទិត្យ ៨រោច ខែភទ្របទ ឆ្នាំមមី អដ្ឋស័ក ព.ស. ២៥៧០») for today and for the user's birth date.
   - Implementation: momentkh (MIT).
   - **Important:** the Khmer animal year changes at Moha Songkran, not at Chinese New Year. Someone born 1–13 April can have a different Chinese and Khmer animal. The site already handles this; reuse momentkh as the source of truth.
2. **Birth-weekday profile** (§3). Shows the weekday, ruling planet, lucky colour, personal angel and a short trait list. It is the most loved and easiest feature, and nothing about it is sensitive.
3. **Khmer New Year page** (§2):
   - a countdown to Moha Songkran (date plus "≈ time");
   - this year's angel with her attributes and posture;
   - the 3 or 4 days and their names (Moha Songkran, Vanabat, Leung Sak);
   - an admin-editable official time and Tumneay;
   - only neutral or positive omens.
4. **Khmer almanac strip** (§4). Shows sila days, the major Buddhist festivals and the Vossa period. It complements the Chinese tong shu without making "good or bad day" claims.
5. Optional and clearly labelled: the **sidereal Reasey** (§6), and the **Daksa daily colours** (§5) once a Khmer source is verified.

### UI

- **Tradition switch**: Western · Chinese · Khmer, with multi-select allowed so a combined view shows a card per tradition. Remember the choice per visitor.
- **Inside Khmer**, a sub-toggle for "Animal year by Khmer New Year (mid-April)" versus "by Chinese New Year". Show a note when the two differ for the user's birth date.
- **Optional birth time**, used for three things:
  - the exact side of the New Year moment (animal year) and of Leung Sak (sak);
  - an optional "count days from sunrise" toggle for the weekday;
  - the reasey on transition days.
- **Language**: Khmer script first, with romanisation and English. Use Khmer numerals in Khmer mode.
- **A "source / variant" info icon** on colour and angel tables, because almanacs differ.
- **Disclaimers**: present this as cultural tradition and entertainment. Show no health, death, war or ritual-payment content.

### Validate before launch

- Check momentkh against Roath Kim Soeun's tables (Nagoya CALE) or printed Khmer calendars for at least 200 dates, including leap-month and leap-day years.
- Check the last 10 Songkran times against the Ministry's announcements.
- Run with TZ = Asia/Phnom_Penh.
- Ask a native Khmer reader to review the spellings, because the angel names vary (គោរាគទេវី / គោរាគៈទេវី and so on).
