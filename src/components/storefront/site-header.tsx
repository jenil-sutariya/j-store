import { auth } from "@/lib/auth";
import { getCartItemCount } from "@/lib/queries/cart";
import { getStoreSettings } from "@/lib/queries/settings";
import { HeaderShell } from "@/components/storefront/header-shell";

export async function SiteHeader() {
  const [session, settings] = await Promise.all([auth(), getStoreSettings()]);
  const cartCount = session?.user ? await getCartItemCount(session.user.id) : 0;

  return (
    <HeaderShell
      userName={session?.user?.name}
      isSignedIn={Boolean(session?.user)}
      cartCount={cartCount}
      storeName={settings.storeName}
      logoUrl={settings.logoUrl}
    />
  );
}
