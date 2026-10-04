import Breadcrumbs from "@/components/Breadcrumbs";
import Calculator from "@/components/client/Calculator";
import cities from "@/lib/data/cities.json";
import { chosenTraditions } from "@/lib/traditionsServer";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata({ title: "What's my zodiac sign? Sun, moon, rising, Chinese and Khmer", description: "Find your sun, moon and rising signs, your Chinese animal and element, and your Khmer animal year, birth day and colour. Free, private, works in your browser.", path: "/tools/zodiac-calculator" });

export default async function CalculatorPage() {
  const traditions = await chosenTraditions();
  const sorted = [...cities].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <>
      <Breadcrumbs items={[{ name: "Find my sign", href: "/tools/zodiac-calculator" }]} />
      <div className="mx-auto max-w-reading safe-x py-6 box-content">
        <h1 className="text-h1">Find my sign</h1>
        <p className="reading mt-3 text-muted">Enter your birth date to see your signs. Add a time and place for your moon and rising signs. Your details stay on this device.</p>
        <Calculator cities={sorted} traditions={traditions} />
      </div>
    </>
  );
}
