import Link from "next/link";
import { requireUser } from "@/lib/require-user";
import { getCartWithItems } from "@/lib/queries/cart";
import { formatINR } from "@/lib/format";
import { CartItemRow } from "@/components/storefront/cart-item-row";
import { Button } from "@/components/ui/button";

export default async function CartPage() {
  const session = await requireUser("/cart");
  const rawItems = await getCartWithItems(session.user.id);
  const items = rawItems.map((item) => ({
    ...item,
    variant: { ...item.variant, price: Number(item.variant.price) },
  }));

  const subtotal = items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-10 font-display text-4xl">Your Bag</h1>

      {items.length === 0 ? (
        <div className="space-y-4">
          <p className="text-muted-foreground">Your bag is empty.</p>
          <Button render={<Link href="/products" />}>Continue shopping</Button>
        </div>
      ) : (
        <>
          <div>
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-lg font-medium">Subtotal</p>
            <p className="text-lg font-semibold">{formatINR(subtotal)}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Taxes are included in item prices. Shipping calculated at checkout.
          </p>

          <Button size="lg" className="mt-6 w-full" render={<Link href="/checkout" />}>
            Proceed to checkout
          </Button>
        </>
      )}
    </div>
  );
}
