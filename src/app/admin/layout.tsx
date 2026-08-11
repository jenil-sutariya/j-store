import { requireAdmin } from "@/lib/require-admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar adminName={session.user.name ?? session.user.email ?? "Admin"} />
      <main className="flex-1 overflow-y-auto bg-muted/30 p-8">{children}</main>
    </div>
  );
}
