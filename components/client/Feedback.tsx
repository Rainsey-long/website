"use client";
/**
 * "Was this helpful?" (research feature #16). Deliberately not "was this
 * accurate?": that invites confirmation bias and implies a prediction we
 * disclaim. Anonymous; stores the page, the verdict, the block ids and an
 * optional comment, nothing about the visitor.
 */
import { useState } from "react";
import { useLang } from "./LangProvider";
import { defineMessages } from "@/lib/i18n";

const T = defineMessages({
  en: {
    thanks: "Thanks. Your note helps us improve the readings.", helpful: "Was this reading helpful?", yes: "Yes", notReally: "Not really",
    better: "What could be better?", optional: "(optional)", send: "Send", error: "That didn't send. Try again in a minute.",
  },
  km: {
    thanks: "សូមអរគុណ។ មតិរបស់អ្នកជួយយើងកែលម្អការអាន។", helpful: "តើការអាននេះមានប្រយោជន៍ទេ?", yes: "បាទ/ចាស", notReally: "មិនសូវទេ",
    better: "តើអ្វីអាចល្អជាងនេះ?", optional: "(មិនចាំបាច់)", send: "ផ្ញើ", error: "ផ្ញើមិនបានទេ។ សូមព្យាយាមម្ដងទៀតក្នុងមួយនាទីទៀត។",
  },
});

export default function Feedback({ path, blockIds }: { path: string; blockIds: string[] }) {
  const [state, setState] = useState<"idle" | "comment" | "sent" | "error">("idle");
  const [verdict, setVerdict] = useState<"helpful" | "not_helpful">("helpful");
  const [comment, setComment] = useState("");
  const m = T[useLang()];

  async function send(v: "helpful" | "not_helpful", text = "") {
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, verdict: v, blockIds, comment: text }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") return <p className="mt-6 text-small text-muted" role="status">{m.thanks}</p>;
  return (
    <section className="mt-6" aria-labelledby={`fb-${path}`}>
      <h2 id={`fb-${path}`} className="text-small font-semibold" style={{ fontFamily: "var(--font-sans)" }}>{m.helpful}</h2>
      {state !== "comment" ? (
        <div className="mt-2 flex gap-3">
          <button type="button" className="btn-secondary" onClick={() => { setVerdict("helpful"); void send("helpful"); }}>{m.yes}</button>
          <button type="button" className="btn-secondary" onClick={() => { setVerdict("not_helpful"); setState("comment"); }}>{m.notReally}</button>
        </div>
      ) : (
        <form className="mt-2" onSubmit={(e) => { e.preventDefault(); void send(verdict, comment); }}>
          <label className="label" htmlFor={`fbc-${path}`}>{m.better} <span className="font-normal text-muted">{m.optional}</span></label>
          <textarea id={`fbc-${path}`} className="field py-2" rows={3} maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} />
          <button type="submit" className="btn-primary mt-3">{m.send}</button>
        </form>
      )}
      {state === "error" && <p className="mt-2 text-small font-semibold text-cinnabar" role="alert">{m.error}</p>}
    </section>
  );
}
