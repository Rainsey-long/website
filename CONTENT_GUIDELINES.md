# Content guidelines (plan 2.8)

Every piece of copy, human- or machine-drafted, passes this checklist before it ships.

## Voice
- Warm, plain, encouraging. Second person. Sentence case.
- Short sentences, one idea each.
- Suggest, don't predict: "A good day to talk things through", never "Disaster awaits".
- Same name for the same thing everywhere: "Lucky days", "Find my sign", "Check compatibility".

## Never
- Health diagnoses, medical advice, body-part rulerships, illness.
- Specific financial actions ("invest in", "buy stocks").
- Certainty, guarantees, "destiny", fear.
- Exclamation marks, emoji, all caps, dramatic bold or italics.
- Text copied or closely paraphrased from any other site.

## Text blocks (`content/blocks/*.json`)
- Every block has English `text` and a Khmer draft `text_km` (the generator keeps `text_km` when it regenerates). The owner edits both in `/admin/readings`.
- The owner edits wording in `/admin/readings`. Edits and approvals live in the database and are never overwritten by a deploy.
- Developers add or restructure blocks in `scripts/blocks-source.py` and re-run it. Untouched drafts follow code changes; owner-edited ones don't.
- Each topic needs exactly 3 base blocks per house (the variety rotation relies on it).
- `npm run validate:blocks` runs on every build and fails on malformed blocks, banned wording, or missing coverage.
- Target for launch: grow to ≈ 6 variants per house. Changing the count means updating the rotation in `lib/reading-engine.ts` and its test.

## Long-form (`content/profiles`, `content/yearly`)
- Khmer versions live at the same path under `content/km/`. The owner can also edit either language in `/admin/content`; those edits override the file until reset.
- Frontmatter fields are read by the pages; keep `summary` ≤ 155 characters. `slug`, `animal`, `relation` and `outlook` are read by code: never change them in a translation.
- Check every year/element against `zodiacYear()` before publishing.

## Review status
- Profiles, forecasts and blocks are drafts awaiting owner review (`docs/OWNER-ACTIONS.md`).
- Khmer strings await a native speaker (`docs/KHMER-REVIEW.md`).

## Khmer traditions
- Present them as cultural tradition. Use the tables in `lib/khmer.ts`; note that almanacs vary.
- Never: illness, death, war or accident omens; "bad year" warnings; anything that sells a ritual or amulet; choosing wedding or house-moving days.
