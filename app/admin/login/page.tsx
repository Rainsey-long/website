import { redirect } from "next/navigation";
import { LoginForm } from "@/components/client/AdminForms";
import { getSession } from "@/lib/auth";
import { defineMessages, localePath } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";

export const dynamic = "force-dynamic";

const T = defineMessages({
  en: { title: "Sign in", lead: "Site administration." },
});

/** Staff sign-in. Not linked from the public site. */
export default async function AdminLogin() {
  const lang = await getLang();
  if (await getSession()) redirect(localePath("/admin", lang));
  return (
    <>
      <h1 className="text-h1">{T[lang].title}</h1>
      <p className="mt-2 text-muted">{T[lang].lead}</p>
      <LoginForm />
    </>
  );
}
