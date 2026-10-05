import Breadcrumbs from "@/components/Breadcrumbs";
import Numerology from "@/components/client/Numerology";
import { pageMetadata } from "@/lib/seo";
import { defineMessages } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";

const T = defineMessages({
  en: {
    title: "Numerology calculator: life path, personal year and name number",
    description: "Find your life path number, birthday number, name number and this year's personal year with the Pythagorean method. Private: it runs in your browser.",
    h1: "Numerology",
    intro: "Find your life path, birthday and name numbers, and the theme of your personal year and month. Your birth date and name stay on this device: nothing is sent anywhere.",
  },
});

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: T[lang].title, description: T[lang].description, path: "/tools/numerology" });
}

export default async function NumerologyPage() {
  const t = T[await getLang()];
  return (
    <>
      <Breadcrumbs items={[{ name: t.h1, href: "/tools/numerology" }]} />
      <div className="mx-auto max-w-reading safe-x py-6 box-content">
        <h1 className="text-h1">{t.h1}</h1>
        <p className="reading mt-3 text-muted">{t.intro}</p>
        <Numerology />
      </div>
    </>
  );
}
