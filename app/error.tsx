"use client";
import Link from "@/components/client/LocaleLink";
import { useLang } from "@/components/client/LangProvider";
import { defineMessages } from "@/lib/i18n";

const T = defineMessages({
  en: { title: "This page didn't load.", body: "Something went wrong on our side. Try again, or go back to the homepage.", retry: "Try again", home: "Homepage" },
  km: { title: "ទំព័រនេះមិនបានបើកទេ។", body: "មានបញ្ហាពីខាងយើង។ សូមព្យាយាមម្ដងទៀត ឬត្រឡប់ទៅទំព័រដើមវិញ។", retry: "ព្យាយាមម្ដងទៀត", home: "ទំព័រដើម" },
});

/** Page-level error boundary (CamboMath pattern). Says what happened and what to do; never apologises (§6.14). */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  const t = T[useLang()];
  return (
    <div className="mx-auto max-w-reading safe-x py-7">
      <h1 className="text-h1">{t.title}</h1>
      <p className="reading mt-3">{t.body}</p>
      <p className="mt-5 flex gap-3"><button type="button" className="btn-primary" onClick={reset}>{t.retry}</button><Link className="btn-secondary" href="/">{t.home}</Link></p>
    </div>
  );
}
