/** Static OG cards: one per sign (today's energy), one per animal, and a default. */
import type { APIRoute } from "astro";
import { SIGNS } from "../../lib/western";
import { ANIMALS } from "../../lib/chinese";
import { dailyReading } from "../../lib/reading-engine";
import { buildToday, longDate } from "../../lib/dates";
import { renderCard, type CardInput } from "../../lib/og";
import { SITE_TAGLINE } from "../../config/site";

export function getStaticPaths() {
  const today = buildToday();
  const cards: Array<{ params: { slug: string }; props: { card: CardInput } }> = [
    { params: { slug: "default" }, props: { card: { title: "Today's sky", subtitle: SITE_TAGLINE } } },
  ];
  for (const s of SIGNS) {
    const r = dailyReading(s, today);
    cards.push({ params: { slug: s.slug }, props: { card: { title: s.name, subtitle: longDate(today), glyph: { set: "western", slug: s.slug }, rows: r.topics.map((t) => ({ label: t.label, value: t.energy })) } } });
  }
  for (const a of ANIMALS) {
    cards.push({ params: { slug: `animal-${a.slug}` }, props: { card: { title: a.name, subtitle: "Chinese zodiac", glyph: { set: "animal", slug: a.slug } } } });
  }
  return cards;
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderCard((props as { card: CardInput }).card);
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
