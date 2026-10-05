"use client";
/**
 * Saved people (docs/research/FEATURES.md #8): chips that fill a birth form,
 * a "Save this person" control and a "Forget" button per person.
 *
 * Kept ONLY in this browser's localStorage (lib/people.ts): nothing here sends
 * a request, and the host forms never submit to the server either (CLAUDE.md
 * owner rule: birth details never leave the browser). The list is read through
 * useSyncExternalStore with a null server snapshot, so the server render and
 * the first client render agree (no hydration mismatch).
 *
 * This is not a <form>: it sits inside the host form, so every button is
 * type="button" and Enter in the name field saves instead of submitting.
 */
import { useId, useMemo, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import Glyph from "@/components/Glyph";
import { readStore, writeStore } from "@/lib/client";
import { defineMessages, khmerDigits } from "@/lib/i18n";
import { MAX_LABEL, MAX_PEOPLE, PEOPLE_KEY, cleanLabel, forgetPerson, parsePeople, savePerson, serializePeople, type Person } from "@/lib/people";
import { useLang } from "./LangProvider";

const T = defineMessages({
  en: {
    saved: "Saved people",
    fill: (n: string) => `Fill in ${n}`,
    forget: (n: string) => `Forget ${n}`,
    save: "Save this person",
    name: "Name to save them under",
    nameHint: "For example Me, Mum or a friend's first name.",
    saveBtn: "Save",
    note: (max: number) => `Up to ${max} people, kept only in this browser. Nothing is sent to us.`,
    filled: (n: string) => `Filled in ${n}.`,
    forgot: (n: string) => `Forgot ${n}.`,
    didSave: (n: string) => `Saved ${n} in this browser.`,
    needDate: "Enter a birth date first, then save.",
    needName: "Give this person a name first.",
    full: (max: number) => `You can save up to ${max} people. Forget one first.`,
    blocked: "This browser is not letting the site store anything, so the person was not saved.",
  },
  km: {
    saved: "មនុស្សដែលបានរក្សាទុក",
    fill: (n: string) => `បំពេញព័ត៌មានរបស់ ${n}`,
    forget: (n: string) => `លុប ${n}`,
    save: "រក្សាទុកមនុស្សនេះ",
    name: "ឈ្មោះសម្រាប់រក្សាទុក",
    nameHint: "ឧទាហរណ៍ ខ្ញុំ ម្ដាយ ឬឈ្មោះមិត្តភក្ដិ។",
    saveBtn: "រក្សាទុក",
    note: (max: number) => `រហូតដល់ ${khmerDigits(max)} នាក់ រក្សាទុកតែក្នុងកម្មវិធីរុករកនេះប៉ុណ្ណោះ។ គ្មានអ្វីត្រូវបានផ្ញើមកយើងទេ។`,
    filled: (n: string) => `បានបំពេញព័ត៌មានរបស់ ${n}។`,
    forgot: (n: string) => `បានលុប ${n}។`,
    didSave: (n: string) => `បានរក្សាទុក ${n} ក្នុងកម្មវិធីរុករកនេះ។`,
    needDate: "សូមបញ្ចូលថ្ងៃខែឆ្នាំកំណើតជាមុនសិន រួចរក្សាទុក។",
    needName: "សូមដាក់ឈ្មោះឱ្យមនុស្សនេះជាមុនសិន។",
    full: (max: number) => `អ្នកអាចរក្សាទុកបានរហូតដល់ ${khmerDigits(max)} នាក់។ សូមលុបម្នាក់ជាមុនសិន។`,
    blocked: "កម្មវិធីរុករកនេះមិនអនុញ្ញាតឱ្យគេហទំព័ររក្សាទុកអ្វីទេ ដូច្នេះមនុស្សនេះមិនត្រូវបានរក្សាទុកទេ។",
  },
});

/** Same-tab broadcast; the `storage` event covers other tabs. */
const PEOPLE_EVENT = "people:change";
function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => { if (e.key === null || e.key === PEOPLE_KEY) cb(); };
  window.addEventListener("storage", onStorage);
  window.addEventListener(PEOPLE_EVENT, cb);
  return () => { window.removeEventListener("storage", onStorage); window.removeEventListener(PEOPLE_EVENT, cb); };
}
function store(people: Person[]): boolean {
  const value = people.length ? serializePeople(people) : null;
  writeStore(PEOPLE_KEY, value);
  window.dispatchEvent(new Event(PEOPLE_EVENT));
  return readStore(PEOPLE_KEY) === value;
}

export interface PersonDraft { date: string; time?: string; city?: string }

export default function PeoplePicker({ current, onPick }: { current: PersonDraft; onPick: (p: Person) => void }) {
  const id = useId();
  const t = T[useLang()];
  const raw = useSyncExternalStore(subscribe, () => readStore(PEOPLE_KEY), () => null);
  const people = useMemo(() => parsePeople(raw), [raw]);
  const [label, setLabel] = useState("");
  const [status, setStatus] = useState<{ text: string; error?: boolean } | null>(null);

  function save() {
    const name = cleanLabel(label);
    if (!current.date) return setStatus({ text: t.needDate, error: true });
    if (!name) return setStatus({ text: t.needName, error: true });
    const r = savePerson(people, { label: name, date: current.date, time: current.time || undefined, city: current.city || undefined });
    if (!r.ok) return setStatus({ text: r.reason === "full" ? t.full(MAX_PEOPLE) : t.needDate, error: true });
    if (!store(r.people)) return setStatus({ text: t.blocked, error: true });
    setLabel("");
    setStatus({ text: t.didSave(name) });
  }
  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); save(); }
  }

  return (
    <div className="flex flex-col gap-3 border-b border-rule pb-5">
      {people.length > 0 && (
        <div>
          <p id={`${id}-h`} className="label">{t.saved}</p>
          <ul className="flex flex-wrap gap-2" aria-labelledby={`${id}-h`}>
            {people.map((p) => (
              <li key={p.label} className="inline-flex items-center rounded-full border border-rule">
                <button type="button" className="min-h-tap rounded-full pl-4 pr-2 text-ink" aria-label={t.fill(p.label)}
                  onClick={() => { onPick(p); setStatus({ text: t.filled(p.label) }); }}>
                  {p.label}
                </button>
                <button type="button" className="inline-flex size-tap items-center justify-center rounded-full text-muted" aria-label={t.forget(p.label)}
                  onClick={() => { store(forgetPerson(people, p.label)); setStatus({ text: t.forgot(p.label) }); }}>
                  <Glyph name="close" set="ui" className="size-4" />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-small text-muted">{t.note(MAX_PEOPLE)}</p>
        </div>
      )}
      <details>
        <summary className="link inline-flex min-h-tap cursor-pointer items-center">{t.save}</summary>
        <div className="mt-3">
          <label className="label" htmlFor={`${id}-name`}>{t.name}</label>
          <div className="flex flex-wrap items-start gap-3">
            <input className="field max-w-full" id={`${id}-name`} maxLength={MAX_LABEL} autoComplete="off" value={label}
              onChange={(e) => setLabel(e.target.value)} onKeyDown={onKey} aria-describedby={`${id}-hint`} />
            <button type="button" className="btn-secondary" onClick={save}>{t.saveBtn}</button>
          </div>
          <p id={`${id}-hint`} className="mt-2 text-small text-muted">{t.nameHint}{people.length ? "" : ` ${t.note(MAX_PEOPLE)}`}</p>
        </div>
      </details>
      <p aria-live="polite" className={status?.error ? "text-small font-semibold text-cinnabar" : "text-small text-muted"}>{status?.text ?? ""}</p>
    </div>
  );
}
