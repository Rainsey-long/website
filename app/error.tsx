"use client";
import Link from "next/link";
/** Page-level error boundary (CamboMath pattern). Says what happened and what to do; never apologises (§6.14). */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-reading safe-x py-7">
      <h1 className="text-h1">This page didn&apos;t load.</h1>
      <p className="reading mt-3">Something went wrong on our side. Try again, or go back to the homepage.</p>
      <p className="mt-5 flex gap-3"><button type="button" className="btn-primary" onClick={reset}>Try again</button><Link className="btn-secondary" href="/">Homepage</Link></p>
    </div>
  );
}
