import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ChipGrid from "@/components/ChipGrid";
import { animalChips } from "@/lib/pages";
import { ELEMENT_NAME, lunarNewYear, zodiacYear } from "@/lib/chinese";
import { longDate } from "@/lib/dates";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Chinese zodiac animals and years", description: "The 12 Chinese zodiac animals: personality profiles, the years for each animal, the five elements and when each year begins.", path: "/chinese-zodiac" });

export default function ChineseIndex() {
  const years = Array.from({ length: 12 }, (_, i) => 2020 + i).map((y) => ({ y, z: zodiacYear(y), lny: lunarNewYear(y) }));
  return (
    <>
      <Breadcrumbs items={[{ name: "Chinese zodiac", href: "/chinese-zodiac" }]} />
      <div className="mx-auto max-w-page safe-x py-6">
        <h1 className="text-h1">Chinese zodiac</h1>
        <p className="reading mt-3 text-muted">Twelve animals take turns ruling the years, each paired with one of five elements. A zodiac year starts at Lunar New Year, so January and early February birthdays often belong to the year before.</p>
        <div className="mt-6"><ChipGrid items={animalChips(2026)} set="animal" /></div>
        <p className="mt-5"><Link className="link" href="/chinese-zodiac/2027">2027 Year of the Fire Goat forecasts</Link> · <Link className="link" href="/tools/zodiac-calculator">Find your animal</Link></p>
        <section className="mt-7 border-t border-rule pt-5" aria-labelledby="years-h">
          <h2 id="years-h" className="text-h2">Recent zodiac years</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left tabular">
              <thead className="text-small text-muted"><tr><th className="py-2 pr-4 font-medium">Year</th><th className="py-2 pr-4 font-medium">Animal</th><th className="py-2 font-medium">Starts</th></tr></thead>
              <tbody>
                {years.map(({ y, z, lny }) => (
                  <tr key={y} className="border-t border-rule">
                    <td className="py-3 pr-4">{y}</td>
                    <td className="py-3 pr-4"><Link className="link" href={`/chinese-zodiac/${z.animal.slug}`}>{ELEMENT_NAME[z.element]} {z.animal.name}</Link></td>
                    <td className="py-3">{longDate(lny)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
