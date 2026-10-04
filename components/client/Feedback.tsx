"use client";
/**
 * "Was this helpful?" (research feature #16). Deliberately not "was this
 * accurate?": that invites confirmation bias and implies a prediction we
 * disclaim. Anonymous; stores the page, the verdict, the block ids and an
 * optional comment, nothing about the visitor.
 */
import { useState } from "react";

export default function Feedback({ path, blockIds }: { path: string; blockIds: string[] }) {
  const [state, setState] = useState<"idle" | "comment" | "sent" | "error">("idle");
  const [verdict, setVerdict] = useState<"helpful" | "not_helpful">("helpful");
  const [comment, setComment] = useState("");

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

  if (state === "sent") return <p className="mt-6 text-small text-muted" role="status">Thanks. Your note helps us improve the readings.</p>;
  return (
    <section className="mt-6" aria-labelledby={`fb-${path}`}>
      <h2 id={`fb-${path}`} className="text-small font-semibold" style={{ fontFamily: "var(--font-sans)" }}>Was this reading helpful?</h2>
      {state !== "comment" ? (
        <div className="mt-2 flex gap-3">
          <button type="button" className="btn-secondary" onClick={() => { setVerdict("helpful"); void send("helpful"); }}>Yes</button>
          <button type="button" className="btn-secondary" onClick={() => { setVerdict("not_helpful"); setState("comment"); }}>Not really</button>
        </div>
      ) : (
        <form className="mt-2" onSubmit={(e) => { e.preventDefault(); void send(verdict, comment); }}>
          <label className="label" htmlFor={`fbc-${path}`}>What could be better? <span className="font-normal text-muted">(optional)</span></label>
          <textarea id={`fbc-${path}`} className="field py-2" rows={3} maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} />
          <button type="submit" className="btn-primary mt-3">Send</button>
        </form>
      )}
      {state === "error" && <p className="mt-2 text-small font-semibold text-cinnabar" role="alert">That didn&apos;t send. Try again in a minute.</p>}
    </section>
  );
}
