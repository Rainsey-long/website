"use client";
/** Admin client forms: sign-in, sign-out, block editor, Songkran override. Same-origin JSON fetches. */
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
