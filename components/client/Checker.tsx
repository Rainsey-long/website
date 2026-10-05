"use client";
import { useLang, useLocalePath } from "./LangProvider";
import { defineMessages } from "@/lib/i18n";

const T = defineMessages({
  en: { system: "System", western: "Western signs", animals: "Zodiac animals (Chinese and Khmer)", first: "First", second: "Second", check: "Check compatibility" },
});
/** Compatibility checker: pick a system and two of each, go to the pair page. */
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

type Opt = { slug: string; name: string };
export default function Checker({ signs, animals }: { signs: Opt[]; animals: Opt[] }) {
  const router = useRouter();
  const lp = useLocalePath();
  const id = useId();
  const m = T[useLang()];
  const [type, setType] = useState<"western" | "chinese">("western");
  const list = type === "western" ? signs : animals;
  const [a, setA] = useState(signs[0].slug);
  const [b, setB] = useState(signs[4].slug);
  const pick = (t: "western" | "chinese") => {
    const l = t === "western" ? signs : animals;
    setType(t); setA(l[0].slug); setB(l[4].slug);
  };
  return (
    <form className="mt-6 flex flex-col gap-5" onSubmit={(e) => {
      e.preventDefault();
      const [x, y] = [a, b].sort();
      router.push(lp(`/${type === "western" ? "compatibility" : "chinese-compatibility"}/${x}-and-${y}`));
    }}>
      <fieldset>
        <legend className="label">{m.system}</legend>
        <div className="flex flex-wrap gap-5">
          <label className="inline-flex min-h-tap items-center gap-2"><input type="radio" name="type" className="size-5" checked={type === "western"} onChange={() => pick("western")} /> {m.western}</label>
          <label className="inline-flex min-h-tap items-center gap-2"><input type="radio" name="type" className="size-5" checked={type === "chinese"} onChange={() => pick("chinese")} /> {m.animals}</label>
        </div>
      </fieldset>
      <div>
        <label className="label" htmlFor={`${id}-a`}>{m.first}</label>
        <select className="field" id={`${id}-a`} value={a} onChange={(e) => setA(e.target.value)}>{list.map((o) => <option key={o.slug} value={o.slug}>{o.name}</option>)}</select>
      </div>
      <div>
        <label className="label" htmlFor={`${id}-b`}>{m.second}</label>
        <select className="field" id={`${id}-b`} value={b} onChange={(e) => setB(e.target.value)}>{list.map((o) => <option key={o.slug} value={o.slug}>{o.name}</option>)}</select>
      </div>
      <div><button type="submit" className="btn-primary">{m.check}</button></div>
    </form>
  );
}
