import { auth } from "@/lib/auth";
import { getCartItemCount } from "@/lib/queries/cart";
import { HeaderShell } from "@/components/storefront/header-shell";

export async function SiteHeader() {
  const session = await auth();
  const cartCount = session?.user ? await getCartItemCount(session.user.id) : 0;

  return (
    <HeaderShell
      userName={session?.user?.name}
      isSignedIn={Boolean(session?.user)}
      cartCount={cartCount}
    />
  );
}
