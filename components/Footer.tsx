/** Footer (§6.10): section links, legal pages, the disclaimer line. */
import Link from "next/link";
import { DISCLAIMER, SITE_NAME } from "@/lib/site";

const SECTIONS: Array<{ title: string; links: Array<[string, string]> }> = [
  { title: "Readings", links: [["/horoscope", "Daily horoscopes"], ["/chinese-zodiac", "Chinese zodiac"], ["/chinese-zodiac/2027", "2027 Year of the Fire Goat"], ["/khmer", "Khmer traditions"]] },
  { title: "Calendars", links: [["/lucky-days", "Lucky days"], ["/khmer/new-year", "Khmer New Year"], ["/sky/moon", "Moon calendar"], ["/sky/retrogrades", "Retrogrades and eclipses"]] },
  { title: "Tools", links: [["/tools/zodiac-calculator", "Find my sign"], ["/tools/compatibility-checker", "Compatibility checker"], ["/compatibility", "Western compatibility"], ["/chinese-compatibility", "Chinese compatibility"]] },
  { title: "About", links: [["/zodiac", "Western signs"], ["/southeast-asian-zodiac", "Southeast Asian zodiac"], ["/feeds", "Calendar feeds"], ["/about", "About"], ["/contact", "Contact"], ["/privacy", "Privacy"], ["/terms", "Terms"], ["/disclaimer", "Disclaimer"]] },
];

export default function Footer() {
  return (
    <footer className="mt-9 border-t border-rule" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="mx-auto max-w-page safe-x py-7">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {SECTIONS.map((s) => (
            <nav key={s.title} aria-label={s.title}>
              <h2 className="mb-3 text-small font-semibold text-muted" style={{ fontFamily: "var(--font-sans)" }}>{s.title}</h2>
              <ul className="flex flex-col gap-2">
                {s.links.map(([href, label]) => <li key={href}><Link className="link" href={href}>{label}</Link></li>)}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-7 border-t border-rule pt-5 text-small text-muted">{DISCLAIMER}</p>
        <p className="mt-2 text-small text-muted">© {new Date().getUTCFullYear()} {SITE_NAME}</p>
      </div>
    </footer>
  );
}
