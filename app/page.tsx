import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/session.ts";
import { ROLE_LANDING } from "@/lib/role-landing.ts";

export default async function Home() {
  const user = await getSessionUser();
  redirect(user ? ROLE_LANDING[user.role] : "/login");
}
