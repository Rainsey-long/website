import Breadcrumbs from "@/components/Breadcrumbs";
import { FEEDS } from "@/lib/ics";
import { absolute, pageMetadata } from "@/lib/seo";
import { getLang } from "@/lib/langServer";
import { defineMessages } from "@/lib/i18n";

const T = defineMessages({
  en: {
    title: "Calendar feeds: moon phases, retrogrades, Khmer holy days",
    description: "Subscribe in Google Calendar, Apple Calendar or Outlook to moon phases, retrogrades, eclipses, Khmer Buddhist holy days and festivals.",
    h1: "Calendar feeds",
    intro: "Add these to the calendar you already use. They update themselves, and there is nothing to sign up for.",
    subscribe: "Subscribe",
    google: "Add to Google Calendar",
    eve: "Or subscribe with a reminder the day before each holy day",
    note: "",
  },
  km: {
    title: "ប្រតិទិនសម្រាប់ជាវ៖ ដំណាក់កាលព្រះចន្ទ ភពដើរថយក្រោយ ថ្ងៃសីល",
    description: "ជាវក្នុង Google Calendar, Apple Calendar ឬ Outlook នូវដំណាក់កាលព្រះចន្ទ ភពដើរថយក្រោយ សូរ្យគ្រាស និងចន្ទគ្រាស ថ្ងៃសីល និងពិធីបុណ្យខ្មែរ។",
    h1: "ប្រតិទិនសម្រាប់ជាវ",
    intro: "បន្ថែមប្រតិទិនទាំងនេះទៅក្នុងកម្មវិធីប្រតិទិនដែលអ្នកកំពុងប្រើ។ វាធ្វើបច្ចុប្បន្នភាពដោយខ្លួនឯង ហើយមិនចាំបាច់ចុះឈ្មោះអ្វីទេ។",
    subscribe: "ជាវ",
    google: "បន្ថែមទៅ Google Calendar",
    eve: "ឬជាវជាមួយការរំលឹកមួយថ្ងៃមុនថ្ងៃសីលនីមួយៗ",
    note: "",
  },
});

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: T[lang].title, description: T[lang].description, path: "/feeds" });
}

export default async function Feeds() {
  const lang = await getLang();
  const t = T[lang];
  const km = lang === "km";
  return (
    <>
      <Breadcrumbs items={[{ name: t.h1, href: "/feeds" }]} />
      <div className="mx-auto max-w-reading safe-x py-6 box-content">
        <h1 className="text-h1">{t.h1}</h1>
        <p className="reading mt-3">{t.intro}</p>
        {t.note && <p className="mt-2 text-small text-muted">{t.note}</p>}
        <ul className="mt-6">
          {Object.entries(FEEDS).map(([name, f]) => {
            const https = absolute(`/feeds/${name}.ics${km ? "?lang=km" : ""}`);
            const webcal = https.replace(/^https?:/, "webcal:");
            return (
              <li key={name} className="border-b border-rule py-4">
                <h2 className="text-h3">{km ? f.titleKm : f.title}</h2>
                <p className="mt-1 text-muted">{km ? f.aboutKm : f.about.split(/([ក-៿]+)/).map((part, i) => (i % 2 ? <span key={i} lang="km">{part}</span> : part))}</p>
                <p className="mt-3 flex flex-wrap gap-3">
                  <a className="btn-secondary" href={webcal}>{t.subscribe}</a>
                  <a className="btn-secondary" href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`} target="_blank" rel="noopener noreferrer">{t.google}</a>
                </p>
                {name === "khmer-holy-days" && <p className="mt-2 text-small"><a className="link inline-flex min-h-tap items-center" href={absolute(`/feeds/${name}.ics?eve=1${km ? "&lang=km" : ""}`).replace(/^https?:/, "webcal:")}>{t.eve}</a></p>}
                <p className="mt-2 text-small text-muted break-all" lang={km ? "en" : undefined}>{https}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
