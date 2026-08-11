import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/dashboard");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return session;
}
