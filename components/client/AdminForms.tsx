"use client";
/**
 * Admin client forms: sign-in, sign-out, readings, content, Songkran, feedback,
 * admins, backups. Same-origin JSON fetches. Bilingual like the rest of the
 * site (docs/I18N.md): the page language comes from useLang(), and every API
 * call carries `?lang=` so the server's messages come back in that language
 * (lib/http.ts requestLang).
 */
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { defineMessages, khmerDigits, type Lang } from "@/lib/i18n";
import { useLang, useLocalePath } from "./LangProvider";

const T = defineMessages({
  en: {
    network: "Network error. Try again.",
    signInFailed: "Sign-in failed.",
    username: "Username",
    password: "Password",
    signIn: "Sign in",
    signOut: "Sign out",
    approved: "Approved",
    saved: "Saved",
    saveFailed: "Save failed",
    textFor: (id: string) => `Text for ${id}`,
    khmer: "Khmer",
    khmerHint: "(empty shows the English text on Khmer pages)",
    save: "Save",
    saveApprove: "Save and approve",
    backToDraft: "Back to draft",
    saveDraft: "Save as draft",
    officialMoment: "Official Moha Songkran moment, Cambodian time",
    calculated: (c: string) => `Calculated: ${c}. Leave empty to use the calculation.`,
    saying: "The year's traditional saying (ទំនាយ), neutral or positive items only",
    source: "Source",
    sourcePlaceholder: "Ministry of Cults and Religion, Moha Songkran booklet 2027",
    confirmReset: "Go back to the original file? Your edit will be deleted.",
    savedLive: "Saved. The page shows it now.",
    resetDone: "Reset to the original file.",
    markdown: "Text (Markdown)",
    resetOriginal: "Reset to original",
    confirmDelete: (n: number) => `Delete ${n} feedback ${n === 1 ? "item" : "items"}? This cannot be undone.`,
    done: "Done",
    failed: "Failed",
    selectAll: "Select all",
    markRead: "Mark read",
    markUnread: "Mark unread",
    delete: "Delete",
    selectFeedback: (id: number) => `Select feedback ${id}`,
    helpful: "Helpful",
    notHelpful: "Not helpful",
    isNew: " · New",
    utc: (at: string) => `${at} UTC`,
    adminAdded: "Admin added",
    atLeast: (n: number) => `(at least ${n} characters)`,
    addAdmin: "Add admin",
    confirmRemove: (u: string) => `Remove ${u}? They are signed out at once.`,
    remove: "Remove",
    noMatch: "The new passwords do not match.",
    currentPassword: "Current password",
    newPassword: "New password",
    newAgain: "New password again",
    changePassword: "Change password",
    backingUp: "Backing up and verifying…",
    backupSaved: "Backup saved and verified",
    backupFailed: "Backup failed",
    backUpNow: "Back up now",
  },
  km: {
    network: "បណ្ដាញមានបញ្ហា។ សូមព្យាយាមម្ដងទៀត។",
    signInFailed: "ចូលមិនបានសម្រេច។",
    username: "ឈ្មោះអ្នកប្រើ",
    password: "ពាក្យសម្ងាត់",
    signIn: "ចូល",
    signOut: "ចាកចេញ",
    approved: "បានអនុម័ត។",
    saved: "បានរក្សាទុក។",
    saveFailed: "រក្សាទុកមិនបានសម្រេច។",
    textFor: (id: string) => `អត្ថបទសម្រាប់ ${id}`,
    khmer: "ភាសាខ្មែរ",
    khmerHint: "(ទុកទទេ ទំព័រខ្មែរនឹងបង្ហាញអត្ថបទអង់គ្លេស)",
    save: "រក្សាទុក",
    saveApprove: "រក្សាទុក និងអនុម័ត",
    backToDraft: "ត្រឡប់ទៅសេចក្ដីព្រាងវិញ",
    saveDraft: "រក្សាទុកជាសេចក្ដីព្រាង",
    officialMoment: "ពេលវេលាមហាសង្ក្រាន្តផ្លូវការ តាមម៉ោងកម្ពុជា",
    calculated: (c: string) => `ពេលដែលគណនាបាន៖ ${khmerDigits(c)}។ ទុកទទេ ដើម្បីប្រើពេលដែលគណនាបាន។`,
    saying: "ទំនាយប្រចាំឆ្នាំ (សូមដាក់តែចំណុចអព្យាក្រឹត ឬវិជ្ជមាន)",
    source: "ប្រភព",
    sourcePlaceholder: "ក្រសួងធម្មការ និងសាសនា សៀវភៅមហាសង្ក្រាន្តឆ្នាំ២០២៧",
    confirmReset: "ត្រឡប់ទៅឯកសារដើមវិញឬ? ការកែសម្រួលរបស់អ្នកនឹងត្រូវលុប។",
    savedLive: "បានរក្សាទុក។ ទំព័របង្ហាញវាឥឡូវនេះ។",
    resetDone: "បានត្រឡប់ទៅឯកសារដើមវិញ។",
    markdown: "អត្ថបទ (Markdown)",
    resetOriginal: "ត្រឡប់ទៅឯកសារដើម",
    confirmDelete: (n: number) => `លុបមតិយោបល់ចំនួន ${khmerDigits(n)}? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។`,
    done: "រួចរាល់។",
    failed: "មិនបានសម្រេច។",
    selectAll: "ជ្រើសរើសទាំងអស់",
    markRead: "សម្គាល់ថាបានអាន",
    markUnread: "សម្គាល់ថាមិនទាន់អាន",
    delete: "លុប",
    selectFeedback: (id: number) => `ជ្រើសរើសមតិយោបល់ ${id}`,
    helpful: "មានប្រយោជន៍",
    notHelpful: "គ្មានប្រយោជន៍",
    isNew: " · ថ្មី",
    utc: (at: string) => `${khmerDigits(at)} UTC`,
    adminAdded: "បានបន្ថែមអ្នកគ្រប់គ្រង។",
    atLeast: (n: number) => `(យ៉ាងតិច ${khmerDigits(n)} តួអក្សរ)`,
    addAdmin: "បន្ថែមអ្នកគ្រប់គ្រង",
    confirmRemove: (u: string) => `ដក ${u} ចេញឬ? គណនីនេះនឹងត្រូវចាកចេញភ្លាមៗ។`,
    remove: "ដកចេញ",
    noMatch: "ពាក្យសម្ងាត់ថ្មីទាំងពីរមិនដូចគ្នាទេ។",
    currentPassword: "ពាក្យសម្ងាត់បច្ចុប្បន្ន",
    newPassword: "ពាក្យសម្ងាត់ថ្មី",
    newAgain: "ពាក្យសម្ងាត់ថ្មីម្ដងទៀត",
    changePassword: "ប្ដូរពាក្យសម្ងាត់",
    backingUp: "កំពុងបម្រុងទុក និងផ្ទៀងផ្ទាត់…",
    backupSaved: "ការបម្រុងទុកត្រូវបានរក្សាទុក និងផ្ទៀងផ្ទាត់រួចហើយ។",
    backupFailed: "ការបម្រុងទុកមិនបានសម្រេច។",
    backUpNow: "បម្រុងទុកឥឡូវនេះ",
  },
});

/** API URLs stay unprefixed; the language travels as `?lang=` (or `&lang=`). */
function withLang(url: string, lang: Lang): string {
  return `${url}${url.includes("?") ? "&" : "?"}lang=${lang}`;
}

async function send(url: string, method: string, lang: Lang, body?: unknown): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(withLang(url, lang), { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: res.ok, error: data.error };
  } catch {
    return { ok: false, error: T[lang].network };
  }
}

export function LoginForm() {
  const router = useRouter();
  const lang = useLang();
  const lp = useLocalePath();
  const t = T[lang];
  const id = useId();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form className="mt-6 flex max-w-[var(--size-rail)] flex-col gap-4" onSubmit={async (e) => {
      e.preventDefault();
      setBusy(true);
      const fd = new FormData(e.currentTarget);
      const r = await send("/api/admin/login", "POST", lang, { username: fd.get("username"), password: fd.get("password") });
      setBusy(false);
      if (r.ok) router.replace(lp("/admin")); else setError(r.error ?? t.signInFailed);
    }}>
      <div><label className="label" htmlFor={`${id}-u`}>{t.username}</label><input className="field" id={`${id}-u`} name="username" autoComplete="username" required /></div>
      <div><label className="label" htmlFor={`${id}-p`}>{t.password}</label><input className="field" id={`${id}-p`} name="password" type="password" autoComplete="current-password" required /></div>
      {error && <p className="text-small font-semibold text-cinnabar" role="alert">{error}</p>}
      <div><button className="btn-primary" type="submit" disabled={busy}>{t.signIn}</button></div>
    </form>
  );
}

export function SignOut() {
  const router = useRouter();
  const lang = useLang();
  const lp = useLocalePath();
  return <button type="button" className="btn-secondary" onClick={async () => { await send("/api/admin/login", "DELETE", lang); router.replace(lp("/admin/login")); }}>{T[lang].signOut}</button>;
}

export function BlockEditor({ id, text, textKm, review }: { id: string; text: string; textKm: string; review: "draft" | "approved" }) {
  const router = useRouter();
  const lang = useLang();
  const t = T[lang];
  const [value, setValue] = useState(text);
  const [valueKm, setValueKm] = useState(textKm);
  const [msg, setMsg] = useState<string | null>(null);
  const save = async (nextReview: "draft" | "approved") => {
    const r = await send(`/api/admin/blocks/${id}`, "PATCH", lang, { text: value, text_km: valueKm, review: nextReview });
    setMsg(r.ok ? (nextReview === "approved" ? t.approved : t.saved) : r.error ?? t.saveFailed);
    if (r.ok) router.refresh();
  };
  return (
    <div className="mt-2">
      <label className="sr-only" htmlFor={`b-${id}`}>{t.textFor(id)}</label>
      <textarea id={`b-${id}`} lang="en" className="field py-2 reading" rows={3} value={value} onChange={(e) => setValue(e.target.value)} />
      <label className="mt-2 block text-small text-muted" htmlFor={`bk-${id}`}>{t.khmer} <span className="font-normal">{t.khmerHint}</span></label>
      <textarea id={`bk-${id}`} lang="km" className="field py-2 reading" rows={3} value={valueKm} onChange={(e) => setValueKm(e.target.value)} />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary" onClick={() => save("approved")}>{review === "approved" ? t.save : t.saveApprove}</button>
        {review === "approved" && <button type="button" className="btn-secondary" onClick={() => save("draft")}>{t.backToDraft}</button>}
        {review === "draft" && (value !== text || valueKm !== textKm) && <button type="button" className="btn-secondary" onClick={() => save("draft")}>{t.saveDraft}</button>}
        {msg && <span className="text-small text-muted" role="status">{msg}</span>}
      </div>
    </div>
  );
}

export function SongkranForm({ year, officialAt, tumneay, source, calculated }: { year: number; officialAt: string; tumneay: string; source: string; calculated: string }) {
  const router = useRouter();
  const lang = useLang();
  const t = T[lang];
  const id = useId();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form className="mt-4 flex flex-col gap-4" onSubmit={async (e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const r = await send(`/api/admin/songkran/${year}`, "PUT", lang, { officialAt: fd.get("officialAt"), tumneay: fd.get("tumneay"), source: fd.get("source") });
      setMsg(r.ok ? t.saved : r.error ?? t.saveFailed);
      if (r.ok) router.refresh();
    }}>
      <div>
        <label className="label" htmlFor={`${id}-at`}>{t.officialMoment}</label>
        {/* The value is typed in Western digits (the API's format), so the placeholder stays Western too. */}
        <input className="field tabular" id={`${id}-at`} name="officialAt" lang="en" defaultValue={officialAt} placeholder={calculated} />
        <p className="mt-1 text-small text-muted">{t.calculated(calculated)}</p>
      </div>
      <div>
        <label className="label" htmlFor={`${id}-t`}>{t.saying}</label>
        <textarea className="field py-2" id={`${id}-t`} name="tumneay" rows={5} defaultValue={tumneay} />
      </div>
      <div>
        <label className="label" htmlFor={`${id}-s`}>{t.source}</label>
        <input className="field" id={`${id}-s`} name="source" defaultValue={source} placeholder={t.sourcePlaceholder} />
      </div>
      <div className="flex items-center gap-3"><button className="btn-primary" type="submit">{t.save}</button>{msg && <span className="text-small text-muted" role="status">{msg}</span>}</div>
    </form>
  );
}

/** Edit one long-form page (Markdown with front matter); save or reset to the original file. */
export function ContentEditor({ path, lang: textLang, initial, edited }: { path: string; lang: "en" | "km"; initial: string; edited: boolean }) {
  const router = useRouter();
  const lang = useLang();
  const t = T[lang];
  const id = useId();
  const [value, setValue] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async (method: "PUT" | "DELETE") => {
    if (method === "DELETE" && !confirm(t.confirmReset)) return;
    setBusy(true);
    // `lang` in the body is the language of the TEXT being edited; `?lang=` is the page's.
    const r = await send("/api/admin/content", method, lang, method === "PUT" ? { path, lang: textLang, source: value } : { path, lang: textLang });
    setBusy(false);
    setMsg(r.ok ? (method === "PUT" ? t.savedLive : t.resetDone) : r.error ?? t.saveFailed);
    if (r.ok) router.refresh();
  };
  return (
    <div className="mt-5">
      <label className="label" htmlFor={id}>{t.markdown}</label>
      <textarea id={id} lang={textLang} className="field py-2 text-small" rows={28} value={value} spellCheck={textLang === "en"} onChange={(e) => setValue(e.target.value)} />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary" disabled={busy} onClick={() => run("PUT")}>{t.save}</button>
        {edited && <button type="button" className="btn-secondary" disabled={busy} onClick={() => run("DELETE")}>{t.resetOriginal}</button>}
        {msg && <span className="text-small text-muted" role="status">{msg}</span>}
      </div>
    </div>
  );
}

type FeedbackItem = { id: number; path: string; verdict: "helpful" | "not_helpful"; comment: string; created_at: string; read_at: string | null };

/** Feedback list with selection: mark read/unread or delete the selected rows. */
export function FeedbackActions({ rows }: { rows: FeedbackItem[] }) {
  const router = useRouter();
  const lang = useLang();
  const t = T[lang];
  const [picked, setPicked] = useState<number[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const all = picked.length === rows.length;
  const act = async (method: "PATCH" | "DELETE", read?: boolean) => {
    if (method === "DELETE" && !confirm(t.confirmDelete(picked.length))) return;
    const r = await send("/api/admin/feedback", method, lang, method === "PATCH" ? { ids: picked, read } : { ids: picked });
    setMsg(r.ok ? t.done : r.error ?? t.failed);
    if (r.ok) { setPicked([]); router.refresh(); }
  };
  return (
    <>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-small">
        <label className="inline-flex min-h-tap items-center gap-2"><input type="checkbox" className="size-5 shrink-0" checked={all} onChange={() => setPicked(all ? [] : rows.map((r) => r.id))} />{t.selectAll}</label>
        <button type="button" className="btn-secondary" disabled={!picked.length} onClick={() => act("PATCH", true)}>{t.markRead}</button>
        <button type="button" className="btn-secondary" disabled={!picked.length} onClick={() => act("PATCH", false)}>{t.markUnread}</button>
        <button type="button" className="btn-secondary" disabled={!picked.length} onClick={() => act("DELETE")}>{t.delete}</button>
        {msg && <span className="text-muted" role="status">{msg}</span>}
      </div>
      <ul className="mt-2">
        {rows.map((f) => (
          <li key={f.id} className="flex gap-3 border-b border-rule py-3 text-small">
            <input type="checkbox" className="mt-1 size-5 shrink-0" aria-label={t.selectFeedback(f.id)} checked={picked.includes(f.id)} onChange={() => setPicked((p) => (p.includes(f.id) ? p.filter((x) => x !== f.id) : [...p, f.id]))} />
            <div className="min-w-0">
              <span className={f.verdict === "helpful" ? "font-semibold text-jade" : "font-semibold text-clay"}>{f.verdict === "helpful" ? t.helpful : t.notHelpful}</span>
              {!f.read_at && <span className="font-semibold">{t.isNew}</span>}
              {" · "}<a className="link break-all" href={f.path} target="_blank" rel="noopener">{f.path}</a>
              {" · "}<span className="tabular text-muted">{t.utc(f.created_at)}</span>
              {f.comment && <p className="mt-1 break-words">{f.comment}</p>}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export function AddAdminForm({ min }: { min: number }) {
  const router = useRouter();
  const lang = useLang();
  const t = T[lang];
  const id = useId();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form className="mt-4 flex flex-col gap-4" onSubmit={async (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const fd = new FormData(form);
      const r = await send("/api/admin/users", "POST", lang, { username: fd.get("username"), password: fd.get("password") });
      setMsg(r.ok ? t.adminAdded : r.error ?? t.failed);
      if (r.ok) { form.reset(); router.refresh(); }
    }}>
      <div><label className="label" htmlFor={`${id}-u`}>{t.username}</label><input className="field" id={`${id}-u`} name="username" autoComplete="off" required minLength={3} maxLength={32} /></div>
      <div><label className="label" htmlFor={`${id}-p`}>{t.password} <span className="font-normal text-muted">{t.atLeast(min)}</span></label><input className="field" id={`${id}-p`} name="password" type="password" autoComplete="new-password" required minLength={min} /></div>
      <div className="flex items-center gap-3"><button className="btn-secondary" type="submit">{t.addAdmin}</button>{msg && <span className="text-small text-muted" role="status">{msg}</span>}</div>
    </form>
  );
}

export function RemoveAdminButton({ id, username }: { id: number; username: string }) {
  const router = useRouter();
  const lang = useLang();
  const t = T[lang];
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <span className="flex items-center gap-2">
      {msg && <span className="text-small text-muted" role="status">{msg}</span>}
      <button type="button" className="btn-secondary" onClick={async () => {
        if (!confirm(t.confirmRemove(username))) return;
        const r = await send("/api/admin/users", "DELETE", lang, { id });
        if (r.ok) router.refresh(); else setMsg(r.error ?? t.failed);
      }}>{t.remove}</button>
    </span>
  );
}

export function ChangePasswordForm({ min }: { min: number }) {
  const router = useRouter();
  const lang = useLang();
  const lp = useLocalePath();
  const t = T[lang];
  const id = useId();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form className="mt-4 flex flex-col gap-4" onSubmit={async (e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      if (fd.get("next") !== fd.get("again")) { setMsg(t.noMatch); return; }
      const r = await send("/api/admin/password", "POST", lang, { current: fd.get("current"), next: fd.get("next") });
      if (r.ok) router.replace(lp("/admin/login")); else setMsg(r.error ?? t.failed);
    }}>
      <div><label className="label" htmlFor={`${id}-c`}>{t.currentPassword}</label><input className="field" id={`${id}-c`} name="current" type="password" autoComplete="current-password" required /></div>
      <div><label className="label" htmlFor={`${id}-n`}>{t.newPassword} <span className="font-normal text-muted">{t.atLeast(min)}</span></label><input className="field" id={`${id}-n`} name="next" type="password" autoComplete="new-password" required minLength={min} /></div>
      <div><label className="label" htmlFor={`${id}-a`}>{t.newAgain}</label><input className="field" id={`${id}-a`} name="again" type="password" autoComplete="new-password" required minLength={min} /></div>
      <div className="flex items-center gap-3"><button className="btn-secondary" type="submit">{t.changePassword}</button>{msg && <span className="text-small font-semibold text-cinnabar" role="alert">{msg}</span>}</div>
    </form>
  );
}

export function BackupNow() {
  const router = useRouter();
  const lang = useLang();
  const t = T[lang];
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <span className="flex flex-wrap items-center gap-3">
      <button type="button" className="btn-primary" disabled={busy} onClick={async () => {
        setBusy(true); setMsg(t.backingUp);
        const r = await send("/api/admin/backups", "POST", lang);
        setBusy(false); setMsg(r.ok ? t.backupSaved : r.error ?? t.backupFailed);
        if (r.ok) router.refresh();
      }}>{t.backUpNow}</button>
      {msg && <span className="text-small text-muted" role="status">{msg}</span>}
    </span>
  );
}
