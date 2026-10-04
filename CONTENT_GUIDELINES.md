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
- Edit `scripts/blocks-source.py` and re-run it, or edit the JSON directly.
- Each topic needs exactly 3 base blocks per house (the variety rotation relies on it).
- `npm run validate:blocks` runs on every build and fails on malformed blocks, banned wording, or missing coverage.
- Target for launch: grow to ≈ 6 variants per house. Changing the count means updating the rotation in `src/lib/reading-engine.ts` and its test.

## Long-form (`content/profiles`, `content/yearly`)
- Frontmatter fields are read by the pages; keep `summary` ≤ 155 characters.
- Check every year/element against `zodiacYear()` before publishing.

## Review status
- Profiles, forecasts and blocks are drafts awaiting owner review.
- Khmer names and Khmer New Year dates await a native speaker.
