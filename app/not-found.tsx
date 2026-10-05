import ChipGrid from "@/components/ChipGrid";
import { signChips } from "@/lib/pages";
import { getLang } from "@/lib/langServer";

export default async function NotFound() {
  const lang = await getLang();
  return (
    <div className="mx-auto max-w-page safe-x py-7">
      <h1 className="text-h1">{"This page doesn't exist. Pick your sign below."}</h1>
      <div className="mt-6"><ChipGrid items={signChips(undefined, lang)} set="western" remember /></div>
    </div>
  );
}
