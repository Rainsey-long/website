import Breadcrumbs from "@/components/Breadcrumbs";
import BirthChart from "@/components/client/BirthChart";
import { CITIES } from "@/lib/cities";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Free birth chart: planets, houses and aspects",
  description: "Draw your birth chart with the Sun, Moon, rising sign, all ten planets, whole-sign houses and aspects, with a plain-English reading. Private: it runs in your browser.",
  path: "/tools/birth-chart",
});

export default function BirthChartPage() {
  const cities = [...CITIES].sort((a, b) => a.name.localeCompare(b.name)).map(({ name, country, lat, lon, tz }) => ({ name, country, lat, lon, tz }));
  return (
    <>
      <Breadcrumbs items={[{ name: "Birth chart", href: "/tools/birth-chart" }]} />
      <div className="mx-auto max-w-reading safe-x py-6 box-content">
        <h1 className="text-h1">Birth chart</h1>
        <p className="reading mt-3 text-muted">See where the Sun, Moon and planets were when you were born. Add a time and city for your rising sign and houses. Your details stay on this device.</p>
        <BirthChart cities={cities} />
      </div>
    </>
  );
}
