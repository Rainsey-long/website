"use client";
/** Compatibility checker: pick a system and two of each, go to the pair page. */
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

type Opt = { slug: string; name: string };
export default function Checker({ signs, animals }: { signs: Opt[]; animals: Opt[] }) {
  const router = useRouter();
  const id = useId();
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
      router.push(`/${type === "western" ? "compatibility" : "chinese-compatibility"}/${x}-and-${y}`);
    }}>
      <fieldset>
        <legend className="label">System</legend>
        <div className="flex flex-wrap gap-5">
          <label className="inline-flex min-h-tap items-center gap-2"><input type="radio" name="type" className="size-5" checked={type === "western"} onChange={() => pick("western")} /> Western signs</label>
          <label className="inline-flex min-h-tap items-center gap-2"><input type="radio" name="type" className="size-5" checked={type === "chinese"} onChange={() => pick("chinese")} /> Zodiac animals (Chinese and Khmer)</label>
        </div>
      </fieldset>
      <div>
        <label className="label" htmlFor={`${id}-a`}>First</label>
        <select className="field" id={`${id}-a`} value={a} onChange={(e) => setA(e.target.value)}>{list.map((o) => <option key={o.slug} value={o.slug}>{o.name}</option>)}</select>
      </div>
      <div>
        <label className="label" htmlFor={`${id}-b`}>Second</label>
        <select className="field" id={`${id}-b`} value={b} onChange={(e) => setB(e.target.value)}>{list.map((o) => <option key={o.slug} value={o.slug}>{o.name}</option>)}</select>
      </div>
      <div><button type="submit" className="btn-primary">Check compatibility</button></div>
    </form>
  );
}
