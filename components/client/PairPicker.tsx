"use client";
/** "Try another pair" (wireframe §7.4): two selects → the canonical pair page. */
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

export default function PairPicker({ options, base, a, b, heading = "Try another pair", noun }: {
  options: Array<{ slug: string; name: string }>; base: string; a?: string; b?: string; heading?: string; noun: string;
}) {
  const router = useRouter();
  const id = useId();
  const [x, setX] = useState(a ?? options[0].slug);
  const [y, setY] = useState(b ?? options[1].slug);
  return (
    <form className="mt-7 border-t border-rule pt-5" onSubmit={(e) => {
      e.preventDefault();
      const [p, q] = [x, y].sort();
      router.push(`${base}${p}-and-${q}`);
    }}>
      <h2 className="text-h3">{heading}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label className="label" htmlFor={`${id}-a`}>First {noun}</label>
          <select className="field" id={`${id}-a`} value={x} onChange={(e) => setX(e.target.value)}>{options.map((o) => <option key={o.slug} value={o.slug}>{o.name}</option>)}</select>
        </div>
        <div>
          <label className="label" htmlFor={`${id}-b`}>Second {noun}</label>
          <select className="field" id={`${id}-b`} value={y} onChange={(e) => setY(e.target.value)}>{options.map((o) => <option key={o.slug} value={o.slug}>{o.name}</option>)}</select>
        </div>
        <button className="btn-primary" type="submit">Check compatibility</button>
      </div>
    </form>
  );
}
