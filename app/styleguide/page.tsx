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
import { RELATION_NAME, chineseScore } from "@/lib/compatibility";
import { signChips } from "@/lib/pages";
import { pageMetadata } from "@/lib/seo";
import { today } from "@/lib/today";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata({ title: "Styleguide", description: "Design tokens and components.", path: "/styleguide", noindex: true });

const COLORS = ["paper", "paper-raised", "ink", "ink-muted", "rule", "rule-strong", "cinnabar", "on-accent", "night", "brass", "jade", "clay", "el-fire", "el-earth", "el-air", "el-water", "el-wood", "kh-sun", "kh-mon", "kh-tue", "kh-wed", "kh-thu", "kh-fri", "kh-sat"];
const TYPE: Array<[string, string]> = [["display", "Scorpio"], ["h1", "Page title"], ["h2", "Section title"], ["h3", "Topic title"], ["reading", "Reading text sits in Newsreader with generous leading."], ["body", "UI copy in Figtree."], ["small", "Captions and metadata."]];
const SPACE = [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128];

export default async function Styleguide() {
  const date = await today();
  const sky = skyForDay(date);
  const reading = dailyReading(SIGNS[7], date, sky);
  const rat = animalBySlug("rat")!, dragon = animalBySlug("dragon")!;
  const cs = chineseScore(rat, dragon);
  return (
    <div className="mx-auto max-w-page safe-x py-6">
      <h1 className="text-h1">Styleguide</h1>
      <p className="mt-2 text-muted">Source of truth: DESIGN_SYSTEM.md. Left light, right dark.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {["theme-light", "theme-dark"].map((theme) => (
          <div key={theme} className={`${theme} bg-paper p-5 text-ink`}>
            <h2 className="text-h2">{theme === "theme-light" ? "Light" : "Dark"}</h2>
            <h3 className="mt-6 text-h3">Colour tokens</h3>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{COLORS.map((c) => <li key={c} className="flex items-center gap-2 text-small"><span className="swatch" style={{ background: `var(--${c})`, width: 24, height: 24 }} />{c}</li>)}</ul>
            <h3 className="mt-6 text-h3">Type scale</h3>
            {TYPE.map(([t, sample]) => (
              <p key={t} className={t === "reading" ? "reading mt-3" : `mt-3 text-${t} ${["display", "h1", "h2", "h3"].includes(t) ? "serif" : ""}`}>
                <span className="block text-small text-muted" style={{ fontFamily: "var(--font-sans)" }}>{t}</span>{sample}
              </p>
            ))}
            <p lang="km" className="mt-3 reading">ថ្ងៃអាទិត្យ ៨រោច ខែភទ្របទ ឆ្នាំមមី អដ្ឋស័ក</p>
            <h3 className="mt-6 text-h3">Buttons, links, fields</h3>
            <div className="mt-3 flex flex-wrap items-center gap-3"><button className="btn-primary" type="button">Show my signs</button><button className="btn-secondary" type="button">Read tomorrow</button><a className="link" href="#">Text link</a></div>
            <label className="label mt-4" htmlFor={`f-${theme}`}>Birth date</label>
            <input className="field" type="date" id={`f-${theme}`} />
            <label className="label mt-3" htmlFor={`e-${theme}`}>With an error</label>
            <input className="field" id={`e-${theme}`} aria-invalid="true" defaultValue="31/02/1990" />
            <p className="mt-2 text-small font-semibold text-cinnabar">Enter a date between 1900 and today.</p>
            <h3 className="mt-6 text-h3">Meter, seal, moon</h3>
            <div className="mt-3 flex flex-wrap items-center gap-5"><EnergyMeter value={1} /><EnergyMeter value={3} /><EnergyMeter value={5} /><Seal /><Seal size="sm" /><span className="cal-sila" />{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <MoonGlyph key={a} angle={a} />)}</div>
            <h3 className="mt-6 text-h3">Glyphs</h3>
            <div className="mt-3 flex flex-wrap gap-3">{SIGNS.map((s) => <Glyph key={s.slug} name={s.slug} set="western" label={s.name} className="size-glyph-lg" />)}</div>
            <div className="mt-3 flex flex-wrap gap-3">{ANIMALS.map((a) => <Glyph key={a.slug} name={a.slug} set="animal" label={a.name} className="size-glyph-lg" />)}</div>
            <div className="mt-6"><LuckyRow color={reading.lucky.color} number={reading.lucky.number} hour={reading.lucky.hour} seal={["Travel", "Signing contracts"]} headingId={`lr-${theme}`} /></div>
          </div>
        ))}
      </div>
      <section className="mt-8">
        <h2 className="text-h2">Spacing and radius</h2>
        <ul className="mt-4 flex flex-col gap-2">{SPACE.map((s, i) => <li key={s} className="flex items-center gap-4 text-small tabular"><span className="w-9">space-{i}</span><span className="h-3 bg-ink" style={{ width: s }} />{s}px</li>)}</ul>
      </section>
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="night-band p-5"><h2 className="text-h2">DayDial on night</h2><div className="mt-4"><DayDial sky={sky} tone="night" selected="scorpio" id="sg-1" /></div></div>
        <div className="p-5"><h2 className="text-h2">DayDial small on paper</h2><div className="mt-4"><DayDial sky={sky} size="small" selected="scorpio" id="sg-2" /></div></div>
      </section>
      <section className="mt-8"><h2 className="text-h2">ChipGrid</h2><div className="mt-4"><ChipGrid items={signChips()} set="western" selected="scorpio" /></div></section>
      <section className="mt-8 max-w-reading"><h2 className="text-h2">ReadingSection</h2><ReadingSection reading={reading} showHeader={false} /></section>
      <section className="mt-8 max-w-reading"><h2 className="text-h2">CompatibilityResult</h2><CompatibilityResult a={rat} b={dragon} set="animal" relationName={RELATION_NAME[cs.relation]} score={cs} /></section>
      <section className="mt-8 grid gap-6 lg:grid-cols-2"><KhmerDayCard day={khmerDay(date)} headingId="sg-kh" /><AngelCard weekday={WEEKDAYS[2]} /></section>
    </div>
  );
}
