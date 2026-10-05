/**
 * /styleguide (DESIGN_SYSTEM.md §10.3): every token and component, light and
 * dark side by side. noindex, excluded from the sitemap.
 */
import Glyph from "@/components/Glyph";
import EnergyMeter from "@/components/EnergyMeter";
import Seal from "@/components/Seal";
import LuckyRow from "@/components/LuckyRow";
import DayDial from "@/components/DayDial";
import ChipGrid from "@/components/ChipGrid";
import ReadingSection from "@/components/ReadingSection";
import CompatibilityResult from "@/components/CompatibilityResult";
import KhmerDayCard from "@/components/khmer/KhmerDayCard";
import AngelCard from "@/components/khmer/AngelCard";
import MoonGlyph from "@/components/MoonGlyph";
import { SIGNS } from "@/lib/western";
import { ANIMALS, animalBySlug } from "@/lib/chinese";
import { WEEKDAYS, khmerDay } from "@/lib/khmer";
import { dailyReading } from "@/lib/reading-engine";
import { skyForDay } from "@/lib/sky";
import { chineseScore, relationName } from "@/lib/compatibility";
import { signChips } from "@/lib/pages";
import { pageMetadata } from "@/lib/seo";
import { getLang } from "@/lib/langServer";
import { defineMessages } from "@/lib/i18n";
import { blockTexts } from "@/lib/blockText";
import { signName, animalName } from "@/lib/names";
import { today } from "@/lib/today";

export const dynamic = "force-dynamic";
const T = defineMessages({
  en: {
    title: "Styleguide", description: "Design tokens and components.", intro: "Source of truth: DESIGN_SYSTEM.md. Left light, right dark.",
    light: "Light", dark: "Dark", colours: "Colour tokens", type: "Type scale", buttons: "Buttons, links, fields", primary: "Show my signs", secondary: "Read tomorrow", link: "Text link",
    field: "Birth date", fieldError: "With an error", error: "Enter a date between 1900 and today.", meter: "Meter, seal, moon", glyphs: "Glyphs",
    seal: ["Travel", "Signing contracts"], spacing: "Spacing and radius", dialNight: "DayDial on night", dialSmall: "DayDial small on paper",
    samples: { display: "Scorpio", h1: "Page title", h2: "Section title", h3: "Topic title", reading: "Reading text sits in Newsreader with generous leading.", body: "UI copy in Figtree.", small: "Captions and metadata." },
  },
});

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: T[lang].title, description: T[lang].description, path: "/styleguide", noindex: true });
}

const COLORS = ["paper", "paper-raised", "ink", "ink-muted", "rule", "rule-strong", "cinnabar", "on-accent", "night", "brass", "jade", "clay", "el-fire", "el-earth", "el-air", "el-water", "el-wood", "kh-sun", "kh-mon", "kh-tue", "kh-wed", "kh-thu", "kh-fri", "kh-sat"];
const TYPE = ["display", "h1", "h2", "h3", "reading", "body", "small"] as const;
const SPACE = [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128];

export default async function Styleguide() {
  const lang = await getLang();
  const t = T[lang];
  const date = await today();
  const sky = skyForDay(date);
  const reading = dailyReading(SIGNS[7], date, sky, blockTexts(lang), lang);
  const rat = animalBySlug("rat")!, dragon = animalBySlug("dragon")!;
  const cs = chineseScore(rat, dragon);
  return (
    <div className="mx-auto max-w-page safe-x py-6">
      <h1 className="text-h1">{t.title}</h1>
      <p className="mt-2 text-muted">{t.intro}</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {["theme-light", "theme-dark"].map((theme) => (
          <div key={theme} className={`${theme} bg-paper p-5 text-ink`}>
            <h2 className="text-h2">{theme === "theme-light" ? t.light : t.dark}</h2>
            <h3 className="mt-6 text-h3">{t.colours}</h3>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{COLORS.map((c) => <li key={c} className="flex items-center gap-2 text-small"><span className="swatch" style={{ background: `var(--${c})`, width: 24, height: 24 }} />{c}</li>)}</ul>
            <h3 className="mt-6 text-h3">{t.type}</h3>
            {TYPE.map((k) => (
              <p key={k} className={k === "reading" ? "reading mt-3" : `mt-3 text-${k} ${["display", "h1", "h2", "h3"].includes(k) ? "serif" : ""}`}>
                <span className="block text-small text-muted" style={{ fontFamily: "var(--font-sans)" }} lang="en">{k}</span>{t.samples[k]}
              </p>
            ))}
            <p lang="km" className="mt-3 reading">ថ្ងៃអាទិត្យ ៨រោច ខែភទ្របទ ឆ្នាំមមី អដ្ឋស័ក</p>
            <h3 className="mt-6 text-h3">{t.buttons}</h3>
            <div className="mt-3 flex flex-wrap items-center gap-3"><button className="btn-primary" type="button">{t.primary}</button><button className="btn-secondary" type="button">{t.secondary}</button><a className="link" href="#">{t.link}</a></div>
            <label className="label mt-4" htmlFor={`f-${theme}`}>{t.field}</label>
            <input className="field" type="date" id={`f-${theme}`} />
            <label className="label mt-3" htmlFor={`e-${theme}`}>{t.fieldError}</label>
            <input className="field" id={`e-${theme}`} aria-invalid="true" defaultValue="31/02/1990" />
            <p className="mt-2 text-small font-semibold text-cinnabar">{t.error}</p>
            <h3 className="mt-6 text-h3">{t.meter}</h3>
            <div className="mt-3 flex flex-wrap items-center gap-5"><EnergyMeter value={1} lang={lang} /><EnergyMeter value={3} lang={lang} /><EnergyMeter value={5} lang={lang} /><Seal /><Seal size="sm" /><span className="cal-sila" />{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <MoonGlyph key={a} angle={a} />)}</div>
            <h3 className="mt-6 text-h3">{t.glyphs}</h3>
            <div className="mt-3 flex flex-wrap gap-3">{SIGNS.map((s) => <Glyph key={s.slug} name={s.slug} set="western" label={signName(s.slug, lang)} className="size-glyph-lg" />)}</div>
            <div className="mt-3 flex flex-wrap gap-3">{ANIMALS.map((a) => <Glyph key={a.slug} name={a.slug} set="animal" label={animalName(a.slug, lang)} className="size-glyph-lg" />)}</div>
            <div className="mt-6"><LuckyRow color={reading.lucky.color} number={reading.lucky.number} hour={reading.lucky.hour} seal={t.seal} headingId={`lr-${theme}`} /></div>
          </div>
        ))}
      </div>
      <section className="mt-8">
        <h2 className="text-h2">{t.spacing}</h2>
        <ul className="mt-4 flex flex-col gap-2">{SPACE.map((s, i) => <li key={s} className="flex items-center gap-4 text-small tabular"><span className="w-9">space-{i}</span><span className="h-3 bg-ink" style={{ width: s }} />{s}px</li>)}</ul>
      </section>
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="night-band p-5"><h2 className="text-h2">{t.dialNight}</h2><div className="mt-4"><DayDial sky={sky} tone="night" selected="scorpio" id="sg-1" /></div></div>
        <div className="p-5"><h2 className="text-h2">{t.dialSmall}</h2><div className="mt-4"><DayDial sky={sky} size="small" selected="scorpio" id="sg-2" /></div></div>
      </section>
      <section className="mt-8"><h2 className="text-h2">ChipGrid</h2><div className="mt-4"><ChipGrid items={signChips(undefined, lang)} set="western" selected="scorpio" /></div></section>
      <section className="mt-8 max-w-reading"><h2 className="text-h2">ReadingSection</h2><ReadingSection reading={reading} showHeader={false} /></section>
      <section className="mt-8 max-w-reading"><h2 className="text-h2">CompatibilityResult</h2><CompatibilityResult a={rat} b={dragon} set="animal" relationName={relationName(cs.relation, lang)} score={cs} /></section>
      <section className="mt-8 grid gap-6 lg:grid-cols-2"><KhmerDayCard day={khmerDay(date)} headingId="sg-kh" /><AngelCard weekday={WEEKDAYS[2]} /></section>
    </div>
  );
}
