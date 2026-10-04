import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import Glyph from "@/components/Glyph";
import EnergyMeter from "@/components/EnergyMeter";
import { ANIMALS } from "@/lib/chinese";
import { yearlyForecast } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "2027 Year of the Fire Goat forecasts", description: "What the 2027 Year of the Fire Goat may bring for each Chinese zodiac animal: love, career, money and month-by-month highlights.", path: "/chinese-zodiac/2027" });

export default function Forecasts2027() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Chinese zodiac", href: "/chinese-zodiac" }, { name: "2027", href: "/chinese-zodiac/2027" }]} />
      <div className="mx-auto max-w-page safe-x py-6">
        <h1 className="text-h1">2027, the Year of the Fire Goat</h1>
        <p className="reading mt-3">The Fire Goat year begins at Lunar New Year on 6 February 2027 and runs until 25 January 2028. In Cambodia the Goat year begins at Khmer New Year on 14 April 2027. Fire brings warmth and visibility; the Goat brings gentleness, creativity and care for home.</p>
        <ul className="mt-6">
          {ANIMALS.map((a) => {
            const f = yearlyForecast(a.slug)?.fm;
            return (
              <li key={a.slug} className="border-t border-rule py-4">
                <Link href={`/chinese-zodiac/${a.slug}/2027`} className="group flex items-center gap-4 no-underline">
                  <Glyph name={a.slug} set="animal" className="size-glyph-lg shrink-0" />
                  <span className="flex-1">
                    <span className="serif text-h3 group-hover:underline">{a.name} in 2027</span>
                    {f?.summary && <span className="mt-1 block text-muted">{f.summary}</span>}
                  </span>
                  {f?.outlook ? <EnergyMeter value={f.outlook} label="Outlook" /> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
