import TextPage from "@/components/TextPage";
import { DISCLAIMER } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Disclaimer", description: "Readings on this site are for entertainment and reflection, not advice.", path: "/disclaimer" });

export default function Disclaimer() {
  return (
    <TextPage title="Disclaimer" path="/disclaimer">
      <p>{DISCLAIMER}</p>
      <p>Astrology, the Chinese almanac and Khmer calendar traditions are cultural practices. We present them with care, but they can&apos;t predict events, and nothing here replaces advice from a qualified professional.</p>
      <p>Sky positions are calculated with open astronomy software. Almanac entries come from the traditional Chinese calendar, and Khmer dates from the Chhankitek method. Compatibility scores are a playful summary of traditional rules, not a measure of any real relationship.</p>
    </TextPage>
  );
}
