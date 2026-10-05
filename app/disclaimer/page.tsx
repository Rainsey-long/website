import TextPage from "@/components/TextPage";
import { DISCLAIMER } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { getLang } from "@/lib/langServer";

const META = {
  en: { title: "Disclaimer", description: "Readings on this site are for entertainment and reflection, not advice." },
};

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, ...META[lang], path: "/disclaimer" });
}

export default async function Disclaimer() {
  return (
    <TextPage title="Disclaimer" path="/disclaimer">
      <p>{DISCLAIMER}</p>
      <p>Astrology, the Chinese almanac and Khmer calendar traditions are cultural practices. We present them with care, but they can&apos;t predict events, and nothing here replaces advice from a qualified professional.</p>
      <p>Sky positions are calculated with open astronomy software. Almanac entries come from the traditional Chinese calendar, and Khmer dates from the Chhankitek method. Compatibility scores are a playful summary of traditional rules, not a measure of any real relationship.</p>
    </TextPage>
  );
}
