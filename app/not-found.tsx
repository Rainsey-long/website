import ChipGrid from "@/components/ChipGrid";
import { signChips } from "@/lib/pages";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-page safe-x py-7">
      <h1 className="text-h1">This page doesn&apos;t exist. Pick your sign below.</h1>
      <div className="mt-6"><ChipGrid items={signChips()} set="western" remember /></div>
    </div>
  );
}
