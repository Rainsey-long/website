/** Footer (§6.10): section links, legal pages, the disclaimer line. */
import Link from "./client/LocaleLink";
import LanguageSwitch from "./client/LanguageSwitch";
import { getLang } from "@/lib/langServer";
import type { Lang } from "@/lib/i18n";
import { DISCLAIMER, DISCLAIMER_KM, SITE_NAME } from "@/lib/site";

type L = Record<Lang, string>;
const SECTIONS: Array<{ title: L; links: Array<[string, L]> }> = [
  { title: { en: "Readings", km: "ការទស្សន៍ទាយ" }, links: [
    ["/horoscope", { en: "Daily horoscopes", km: "ហោរាសាស្ត្រប្រចាំថ្ងៃ" }],
    ["/chinese-zodiac", { en: "Chinese zodiac", km: "ឆ្នាំចិន" }],
    ["/chinese-zodiac/2027", { en: "2027 Year of the Fire Goat", km: "ឆ្នាំមមែភ្លើង ២០២៧" }],
    ["/khmer", { en: "Khmer traditions", km: "ប្រពៃណីខ្មែរ" }],
  ] },
  { title: { en: "Calendars", km: "ប្រតិទិន" }, links: [
    ["/lucky-days", { en: "Lucky days", km: "ថ្ងៃល្អ" }],
    ["/lucky-days/finder", { en: "Find a lucky date", km: "ស្វែងរកថ្ងៃល្អ" }],
    ["/good-hours", { en: "Good hours", km: "ម៉ោងល្អ" }],
    ["/khmer/new-year", { en: "Khmer New Year", km: "ចូលឆ្នាំខ្មែរ" }],
    ["/khmer/colours", { en: "Colour of the day", km: "ពណ៌ប្រចាំថ្ងៃ" }],
    ["/sky/moon", { en: "Moon calendar", km: "ប្រតិទិនព្រះចន្ទ" }],
    ["/sky/retrogrades", { en: "Retrogrades and eclipses", km: "ភពដើរថយក្រោយ និងសូរ្យគ្រាស ចន្ទគ្រាស" }],
    ["/sky/week", { en: "This week in the sky", km: "មេឃសប្ដាហ៍នេះ" }],
    ["/sky/solar-terms", { en: "The 24 solar terms", km: "រដូវកាលព្រះអាទិត្យទាំង ២៤" }],
  ] },
  { title: { en: "Tools", km: "ឧបករណ៍" }, links: [
    ["/tools/zodiac-calculator", { en: "Find my sign", km: "ស្វែងរករាសីខ្ញុំ" }],
    ["/tools/birth-chart", { en: "Birth chart", km: "តារាងកំណើត" }],
    ["/tools/date-converter", { en: "Date converter", km: "បម្លែងកាលបរិច្ឆេទ" }],
    ["/tools/numerology", { en: "Numerology", km: "លេខវិទ្យា" }],
    ["/search", { en: "Search", km: "ស្វែងរក" }],
    ["/tools/compatibility-checker", { en: "Compatibility checker", km: "ពិនិត្យភាពត្រូវគ្នា" }],
    ["/compatibility", { en: "Western compatibility", km: "ភាពត្រូវគ្នាតាមរាសី" }],
    ["/chinese-compatibility", { en: "Chinese compatibility", km: "ភាពត្រូវគ្នាតាមឆ្នាំ" }],
  ] },
  { title: { en: "About", km: "អំពី" }, links: [
    ["/zodiac", { en: "Western signs", km: "រាសីទាំង ១២" }],
    ["/southeast-asian-zodiac", { en: "Southeast Asian zodiac", km: "ឆ្នាំនៅអាស៊ីអាគ្នេយ៍" }],
    ["/feeds", { en: "Calendar feeds", km: "ប្រតិទិនសម្រាប់ទូរស័ព្ទ" }],
    ["/about", { en: "About", km: "អំពីយើង" }],
    ["/contact", { en: "Contact", km: "ទំនាក់ទំនង" }],
    ["/privacy", { en: "Privacy", km: "ឯកជនភាព" }],
    ["/terms", { en: "Terms", km: "លក្ខខណ្ឌ" }],
    ["/disclaimer", { en: "Disclaimer", km: "សេចក្ដីប្រកាសបដិសេធ" }],
  ] },
];

export default async function Footer() {
  const lang = await getLang();
  return (
    <footer className="mt-9 border-t border-rule" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="mx-auto max-w-page safe-x py-7">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {SECTIONS.map((s) => (
            <nav key={s.title.en} aria-label={s.title[lang]}>
              <h2 className="mb-3 text-small font-semibold text-muted" style={{ fontFamily: "var(--font-sans)" }}>{s.title[lang]}</h2>
              <ul className="flex flex-col gap-2">
                {s.links.map(([href, label]) => <li key={href}><Link className="link" href={href}>{label[lang]}</Link></li>)}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-7 border-t border-rule pt-5 text-small text-muted">{lang === "km" ? DISCLAIMER_KM : DISCLAIMER}</p>
        <p className="mt-2 text-small"><span className="text-muted">{lang === "km" ? "ភាសា" : "Language"}: </span><LanguageSwitch /></p>
        <p className="mt-2 text-small text-muted">© {new Date().getUTCFullYear()} {SITE_NAME}</p>
      </div>
    </footer>
  );
}
