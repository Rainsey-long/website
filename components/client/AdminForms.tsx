"use client";
/** Admin client forms: sign-in, sign-out, readings, content, Songkran, feedback, admins, backups. Same-origin JSON fetches. */
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

async function send(url: string, method: string, body?: unknown): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: res.ok, error: data.error };
  } catch {
    return { ok: false, error: "Network error. Try again." };
  }
}

export function LoginForm() {
  const router = useRouter();
  const id = useId();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form className="mt-6 flex max-w-[var(--size-rail)] flex-col gap-4" onSubmit={async (e) => {
      e.preventDefault();
      setBusy(true);
      const fd = new FormData(e.currentTarget);
      const r = await send("/api/admin/login", "POST", { username: fd.get("username"), password: fd.get("password") });
      setBusy(false);
      if (r.ok) router.replace("/admin"); else setError(r.error ?? "Sign-in failed.");
    }}>
      <div><label className="label" htmlFor={`${id}-u`}>Username</label><input className="field" id={`${id}-u`} name="username" autoComplete="username" required /></div>
      <div><label className="label" htmlFor={`${id}-p`}>Password</label><input className="field" id={`${id}-p`} name="password" type="password" autoComplete="current-password" required /></div>
      {error && <p className="text-small font-semibold text-cinnabar" role="alert">{error}</p>}
      <div><button className="btn-primary" type="submit" disabled={busy}>Sign in</button></div>
    </form>
  );
}

export function SignOut() {
  const router = useRouter();
  return <button type="button" className="btn-secondary" onClick={async () => { await send("/api/admin/login", "DELETE"); router.replace("/admin/login"); }}>Sign out</button>;
}

export function BlockEditor({ id, text, textKm, review }: { id: string; text: string; textKm: string; review: "draft" | "approved" }) {
  const router = useRouter();
  const [value, setValue] = useState(text);
  const [valueKm, setValueKm] = useState(textKm);
  const [msg, setMsg] = useState<string | null>(null);
  const save = async (nextReview: "draft" | "approved") => {
    const r = await send(`/api/admin/blocks/${id}`, "PATCH", { text: value, text_km: valueKm, review: nextReview });
    setMsg(r.ok ? (nextReview === "approved" ? "Approved" : "Saved") : r.error ?? "Save failed");
    if (r.ok) router.refresh();
  };
  return (
    <div className="mt-2">
      <label className="sr-only" htmlFor={`b-${id}`}>Text for {id}</label>
      <textarea id={`b-${id}`} className="field py-2 reading" rows={3} value={value} onChange={(e) => setValue(e.target.value)} />
      <label className="mt-2 block text-small text-muted" htmlFor={`bk-${id}`}>Khmer <span className="font-normal">(empty shows the English text on Khmer pages)</span></label>
      <textarea id={`bk-${id}`} lang="km" className="field py-2 reading" rows={3} value={valueKm} onChange={(e) => setValueKm(e.target.value)} />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary" onClick={() => save("approved")}>{review === "approved" ? "Save" : "Save and approve"}</button>
        {review === "approved" && <button type="button" className="btn-secondary" onClick={() => save("draft")}>Back to draft</button>}
        {review === "draft" && (value !== text || valueKm !== textKm) && <button type="button" className="btn-secondary" onClick={() => save("draft")}>Save as draft</button>}
        {msg && <span className="text-small text-muted" role="status">{msg}</span>}
      </div>
    </div>
  );
}

export function SongkranForm({ year, officialAt, tumneay, source, calculated }: { year: number; officialAt: string; tumneay: string; source: string; calculated: string }) {
  const router = useRouter();
  const id = useId();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form className="mt-4 flex flex-col gap-4" onSubmit={async (e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const r = await send(`/api/admin/songkran/${year}`, "PUT", { officialAt: fd.get("officialAt"), tumneay: fd.get("tumneay"), source: fd.get("source") });
      setMsg(r.ok ? "Saved" : r.error ?? "Save failed");
      if (r.ok) router.refresh();
    }}>
      <div>
        <label className="label" htmlFor={`${id}-at`}>Official Moha Songkran moment, Cambodian time</label>
        <input className="field tabular" id={`${id}-at`} name="officialAt" defaultValue={officialAt} placeholder={calculated} />
        <p className="mt-1 text-small text-muted">Calculated: {calculated}. Leave empty to use the calculation.</p>
      </div>
      <div>
        <label className="label" htmlFor={`${id}-t`}>The year&apos;s traditional saying (ទំនាយ), neutral or positive items only</label>
        <textarea className="field py-2" id={`${id}-t`} name="tumneay" rows={5} defaultValue={tumneay} />
      </div>
      <div>
        <label className="label" htmlFor={`${id}-s`}>Source</label>
        <input className="field" id={`${id}-s`} name="source" defaultValue={source} placeholder="Ministry of Cults and Religion, Moha Songkran booklet 2027" />
      </div>
      <div className="flex items-center gap-3"><button className="btn-primary" type="submit">Save</button>{msg && <span className="text-small text-muted" role="status">{msg}</span>}</div>
    </form>
  );
}

/** Edit one long-form page (Markdown with front matter); save or reset to the original file. */
export function ContentEditor({ path, lang, initial, edited }: { path: string; lang: "en" | "km"; initial: string; edited: boolean }) {
  const router = useRouter();
  const id = useId();
  const [value, setValue] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async (method: "PUT" | "DELETE") => {
    if (method === "DELETE" && !confirm("Go back to the original file? Your edit will be deleted.")) return;
    setBusy(true);
    const r = await send("/api/admin/content", method, method === "PUT" ? { path, lang, source: value } : { path, lang });
    setBusy(false);
    setMsg(r.ok ? (method === "PUT" ? "Saved. The page shows it now." : "Reset to the original file.") : r.error ?? "Save failed");
    if (r.ok) router.refresh();
  };
  return (
    <div className="mt-5">
      <label className="label" htmlFor={id}>Text (Markdown)</label>
      <textarea id={id} lang={lang} className="field py-2 text-small" rows={28} value={value} spellCheck={lang === "en"} onChange={(e) => setValue(e.target.value)} />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary" disabled={busy} onClick={() => run("PUT")}>Save</button>
        {edited && <button type="button" className="btn-secondary" disabled={busy} onClick={() => run("DELETE")}>Reset to original</button>}
        {msg && <span className="text-small text-muted" role="status">{msg}</span>}
      </div>
    </div>
  );
}

type FeedbackItem = { id: number; path: string; verdict: "helpful" | "not_helpful"; comment: string; created_at: string; read_at: string | null };

/** Feedback list with selection: mark read/unread or delete the selected rows. */
export function FeedbackActions({ rows }: { rows: FeedbackItem[] }) {
  const router = useRouter();
  const [picked, setPicked] = useState<number[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const all = picked.length === rows.length;
  const act = async (method: "PATCH" | "DELETE", read?: boolean) => {
    if (method === "DELETE" && !confirm(`Delete ${picked.length} feedback ${picked.length === 1 ? "item" : "items"}? This cannot be undone.`)) return;
    const r = await send("/api/admin/feedback", method, method === "PATCH" ? { ids: picked, read } : { ids: picked });
    setMsg(r.ok ? "Done" : r.error ?? "Failed");
    if (r.ok) { setPicked([]); router.refresh(); }
  };
  return (
    <>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-small">
        <label className="inline-flex min-h-tap items-center gap-2"><input type="checkbox" className="size-5 shrink-0" checked={all} onChange={() => setPicked(all ? [] : rows.map((r) => r.id))} />Select all</label>
        <button type="button" className="btn-secondary" disabled={!picked.length} onClick={() => act("PATCH", true)}>Mark read</button>
        <button type="button" className="btn-secondary" disabled={!picked.length} onClick={() => act("PATCH", false)}>Mark unread</button>
        <button type="button" className="btn-secondary" disabled={!picked.length} onClick={() => act("DELETE")}>Delete</button>
        {msg && <span className="text-muted" role="status">{msg}</span>}
      </div>
      <ul className="mt-2">
        {rows.map((f) => (
          <li key={f.id} className="flex gap-3 border-b border-rule py-3 text-small">
            <input type="checkbox" className="mt-1 size-5 shrink-0" aria-label={`Select feedback ${f.id}`} checked={picked.includes(f.id)} onChange={() => setPicked((p) => (p.includes(f.id) ? p.filter((x) => x !== f.id) : [...p, f.id]))} />
            <div className="min-w-0">
              <span className={f.verdict === "helpful" ? "font-semibold text-jade" : "font-semibold text-clay"}>{f.verdict === "helpful" ? "Helpful" : "Not helpful"}</span>
              {!f.read_at && <span className="font-semibold"> · New</span>}
              {" · "}<a className="link break-all" href={f.path} target="_blank" rel="noopener">{f.path}</a>
              {" · "}<span className="tabular text-muted">{f.created_at} UTC</span>
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
  const id = useId();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form className="mt-4 flex flex-col gap-4" onSubmit={async (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const fd = new FormData(form);
      const r = await send("/api/admin/users", "POST", { username: fd.get("username"), password: fd.get("password") });
      setMsg(r.ok ? "Admin added" : r.error ?? "Failed");
      if (r.ok) { form.reset(); router.refresh(); }
    }}>
      <div><label className="label" htmlFor={`${id}-u`}>Username</label><input className="field" id={`${id}-u`} name="username" autoComplete="off" required minLength={3} maxLength={32} /></div>
      <div><label className="label" htmlFor={`${id}-p`}>Password <span className="font-normal text-muted">(at least {min} characters)</span></label><input className="field" id={`${id}-p`} name="password" type="password" autoComplete="new-password" required minLength={min} /></div>
      <div className="flex items-center gap-3"><button className="btn-secondary" type="submit">Add admin</button>{msg && <span className="text-small text-muted" role="status">{msg}</span>}</div>
    </form>
  );
}

export function RemoveAdminButton({ id, username }: { id: number; username: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <span className="flex items-center gap-2">
      {msg && <span className="text-small text-muted" role="status">{msg}</span>}
      <button type="button" className="btn-secondary" onClick={async () => {
        if (!confirm(`Remove ${username}? They are signed out at once.`)) return;
        const r = await send("/api/admin/users", "DELETE", { id });
        if (r.ok) router.refresh(); else setMsg(r.error ?? "Failed");
      }}>Remove</button>
    </span>
  );
}

export function ChangePasswordForm({ min }: { min: number }) {
  const router = useRouter();
  const id = useId();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form className="mt-4 flex flex-col gap-4" onSubmit={async (e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      if (fd.get("next") !== fd.get("again")) { setMsg("The new passwords do not match."); return; }
      const r = await send("/api/admin/password", "POST", { current: fd.get("current"), next: fd.get("next") });
      if (r.ok) router.replace("/admin/login"); else setMsg(r.error ?? "Failed");
    }}>
      <div><label className="label" htmlFor={`${id}-c`}>Current password</label><input className="field" id={`${id}-c`} name="current" type="password" autoComplete="current-password" required /></div>
      <div><label className="label" htmlFor={`${id}-n`}>New password <span className="font-normal text-muted">(at least {min} characters)</span></label><input className="field" id={`${id}-n`} name="next" type="password" autoComplete="new-password" required minLength={min} /></div>
      <div><label className="label" htmlFor={`${id}-a`}>New password again</label><input className="field" id={`${id}-a`} name="again" type="password" autoComplete="new-password" required minLength={min} /></div>
      <div className="flex items-center gap-3"><button className="btn-secondary" type="submit">Change password</button>{msg && <span className="text-small font-semibold text-cinnabar" role="alert">{msg}</span>}</div>
    </form>
  );
}

export function BackupNow() {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <span className="flex flex-wrap items-center gap-3">
      <button type="button" className="btn-primary" disabled={busy} onClick={async () => {
        setBusy(true); setMsg("Backing up and verifying…");
        const r = await send("/api/admin/backups", "POST");
        setBusy(false); setMsg(r.ok ? "Backup saved and verified" : r.error ?? "Backup failed");
        if (r.ok) router.refresh();
      }}>Back up now</button>
      {msg && <span className="text-small text-muted" role="status">{msg}</span>}
    </span>
  );
}
