import Link from "@/components/client/LocaleLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import ChipGrid from "@/components/ChipGrid";
import { signChips } from "@/lib/pages";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Daily horoscopes for all 12 signs", description: "Today's horoscope for every zodiac sign: love, career, money and mood, written from where the Moon really is today.", path: "/horoscope" });

export default function HoroscopeIndex() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Horoscopes", href: "/horoscope" }]} />
      <div className="mx-auto max-w-page safe-x py-6">
        <h1 className="text-h1">Daily horoscopes</h1>
        <p className="reading mt-3 text-muted">Pick your sign for today&apos;s reading. Each one follows the Moon&apos;s real position through the zodiac, so it changes every day.</p>
        <div className="mt-6"><ChipGrid items={signChips()} set="western" remember /></div>
        <p className="mt-5">Not sure of your sign? <Link className="link" href="/tools/zodiac-calculator">Find my sign</Link></p>
      </div>
    </>
  );
}
