import { redirect } from "next/navigation";
import { LoginForm } from "@/components/client/AdminForms";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Staff sign-in. Not linked from the public site. */
export default async function AdminLogin() {
  if (await getSession()) redirect("/admin");
  return (
    <>
      <h1 className="text-h1">Sign in</h1>
      <p className="mt-2 text-muted">Site administration.</p>
      <LoginForm />
    </>
  );
}
