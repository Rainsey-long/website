# Khmer text awaiting a native reader

Nothing here has been read by a native Khmer speaker yet. Spellings vary between sources (research §2.2), so please confirm the form you want shown.

| Where | What |
|---|---|
| `lib/khmer.ts` `LUNAR_MONTHS`, `KHMER_ANIMALS`, `SAKS`, `WEEKDAYS` | month, animal, sak and weekday names; planet names; colour names; the seven angels' names (e.g. គោរាគៈទេវី vs គោរាគទេវី) |
| `lib/khmer.ts` festivals | មាឃបូជា, វិសាខបូជា, ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល, ចូលវស្សា, កាន់បិណ្ឌទី១, ភ្ជុំបិណ្ឌ, ចេញវស្សា, បុណ្យអុំទូក; New Year day names; posture names |
| `lib/traditions.ts` | លោកខាងលិច (Western), ចិន, ខ្មែរ |
| Page headings | ប្រពៃណីខ្មែរ, ចូលឆ្នាំខ្មែរ, កើតថ្ងៃ…, ទំនាយ, ថ្ងៃសីល |
| `lib/khmerWeekdayCopy.ts` | English copy built on Khmer associations: check the meanings are faithful |
| Romanisations | Chhut, Chlov, … and angel names (Tungsa Tevy, …) |

## Added 2026-10-04: the whole site in Khmer (`/km`)

Every Khmer string below is a machine-assisted draft. Edit reading text and profiles/forecasts in `/admin`; everything else is in the files named. Mechanism and writing rules: `docs/I18N.md`.

| Where | What to check |
|---|---|
| `lib/names.ts` | Western sign (rasi) names, animal names, elements (លោហៈ for Metal), planets, colours, moon-phase names, reading topics |
| `lib/dates.ts`, `lib/format.ts` | Gregorian month and weekday names; date pattern ទី៥ ខែតុលា ឆ្នាំ២០២៦; time pattern "ម៉ោង" |
| `content/blocks/*.json` `text_km` (196 blocks; also editable in `/admin/readings`) | Tone and meaning. Flagged by the translator: `mood-h1-01` ("take up a little more space" → "dare to show yourself a bit more"), `money-h11-01`, `mood-element-fire-02`, `career-h8-03` (a medical word was replaced) |
| `content/km/profiles/western/*.md` (12) | Terms: cardinal/fixed/mutable = រាសីប្រភេទចាប់ផ្ដើម/ថេរ/ប្រែប្រួល; solstice អយនរដូវ; equinox វិសុវៈ; composed colour names (ផ្កាឈូកស្រាល, បៃតងប្រផេះ, …) |
| `content/km/profiles/chinese/*.md`, `content/km/yearly/2027/*.md` | Animal profiles and the Fire Goat (មមែភ្លើង) forecasts |
| `lib/compat-copy.ts`, `lib/compatibility.ts` | ~2,200 words of compatibility copy; coined relation names ត្រីសុខដុម, ឆសុខដុម, ឆគ្រោះ, ឆប៉ះទង្គិច, គូកញ្ចក់ |
| `lib/natalCopy.ts` | Planet topics, sign gifts/growth, houses; aspect names មុំ ៦០ ដឺក្រេ, មុំ ១២០ ដឺក្រេ, មុំកែង, ការរួមគ្នា, ការទល់មុខគ្នា |
| `lib/reading-engine.ts`, `lib/western.ts`, `lib/sea-variants.ts` | House themes, lucky-colour names, modality and ruler names, tradition labels, Vietnamese animals (ក្របី, ឆ្មា …) |
| `content/data/almanac-terms.json` `km` (114 terms), `lib/almanac.ts` `OFFICERS_KM`, `SPIRITS_KM` | Almanac activities; the twelve officers and spirits are literal renderings |
| `lib/khmer.ts` | Angel attributes (flowers, jewels, food such as ទឹកដោះ និងសប្បិ, held items such as វជ្រ និងកង្វេរ), weekday qualities, short lunar label |
| `lib/khmerWeekdayCopy.ts` `WEEKDAY_COPY_KM` | The seven birth-day portraits |
| `lib/goodHours.ts`, `lib/luckyFinder.ts`, `lib/skyEvents.ts`, `lib/chinese.ts`, `lib/ics.ts`, `lib/cities.ts` | Planetary-hour themes, occasions, eclipse kinds and phase names, lucky colours, feed titles, Cambodian city names |
| `app/privacy`, `app/terms`, `app/disclaimer` | Legal pages: check faithfulness to the English (the Khmer page says English prevails) |
| Every `defineMessages({ en, km })` block in `app/**` and `components/**` | Interface text. Terms to confirm: "Chhankitek" rendered as វិធីគណនាចន្ទគតិប្រពៃណី; Choul Chnam Thmey as បុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ; calendar weekday abbreviations ច/អ/ពុ/ព្រ/សុ/ស/អា; Yang/Yin as យ៉ាង/យីន; clash as ឆុង; the Khmer home title (an original phrasing, not a translation of the English tagline) |
