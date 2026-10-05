/** Admin: the admin accounts. Add one, remove one (never yourself or the last), change your password. */
import { redirect } from "next/navigation";
import { AddAdminForm, ChangePasswordForm, RemoveAdminButton } from "@/components/client/AdminForms";
import { ADMIN_PASSWORD_MIN, getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { defineMessages, localePath } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";

export const dynamic = "force-dynamic";

const T = defineMessages({
  en: {
    title: "Admins",
    you: " (you)",
    since: (d: string) => `since ${d}`,
    add: "Add an admin",
    change: "Change your password",
    changeLead: "You will be signed out everywhere and sign in again with the new password.",
  },
});

export default async function Accounts() {
  const lang = await getLang();
  const s = await getSession();
  if (!s) redirect(localePath("/admin/login", lang));
  const t = T[lang];
  const users = getDb().prepare("SELECT id, username, created_at FROM users ORDER BY id").all() as Array<{ id: number; username: string; created_at: string }>;
  return (
    <section className="grid gap-8 lg:grid-cols-2">
      <div>
        <h1 className="text-h1">{t.title}</h1>
        <ul className="mt-4">
          {users.map((u) => (
            <li key={u.id} className="flex min-h-tap items-center justify-between gap-3 border-b border-rule py-2">
              <span><span lang="en">{u.username}</span>{u.id === s.uid && <span className="text-small text-muted">{t.you}</span>}<span className="block text-small text-muted tabular">{t.since(u.created_at.slice(0, 10))}</span></span>
              {u.id !== s.uid && users.length > 1 && <RemoveAdminButton id={u.id} username={u.username} />}
            </li>
          ))}
        </ul>
        <h2 className="mt-7 text-h2">{t.add}</h2>
        <AddAdminForm min={ADMIN_PASSWORD_MIN} />
      </div>
      <div>
        <h2 className="text-h2">{t.change}</h2>
        <p className="mt-2 text-small text-muted">{t.changeLead}</p>
        <ChangePasswordForm min={ADMIN_PASSWORD_MIN} />
      </div>
    </section>
  );
}
