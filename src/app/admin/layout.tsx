import { requireAdmin } from "@/lib/require-admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getStoreSettings } from "@/lib/queries/settings";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, settings] = await Promise.all([requireAdmin(), getStoreSettings()]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar
        adminName={session.user.name ?? session.user.email ?? "Admin"}
        storeName={settings.storeName}
      />
      <main className="flex-1 overflow-y-auto bg-muted/30 p-8">{children}</main>
    </div>
  );
}
