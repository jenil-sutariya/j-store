import Link from "next/link";
import { requireUser } from "@/lib/require-user";
import { getCartWithItems } from "@/lib/queries/cart";
import { formatINR } from "@/lib/format";
import { CartItemRow } from "@/components/storefront/cart-item-row";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/storefront/reveal";

export default async function CartPage() {
  const session = await requireUser("/cart");
  const rawItems = await getCartWithItems(session.user.id);
  const items = rawItems.map((item) => ({
    ...item,
    variant: { ...item.variant, price: Number(item.variant.price) },
  }));

  const subtotal = items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mb-8 sm:mb-10">
        <p className="mb-3 text-xs tracking-[0.3em] text-muted-foreground uppercase">Aurelia</p>
        <h1 className="font-display text-3xl sm:text-4xl">Your Bag</h1>
      </div>

      {items.length === 0 ? (
        <div className="space-y-4 border border-border bg-card p-6 text-center sm:p-8">
          <p className="text-muted-foreground">Your bag is empty.</p>
          <Button render={<Link href="/products" />}>Continue shopping</Button>
        </div>
      ) : (
        <Reveal>
          <div className="divide-y divide-border border-y border-border">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-lg font-medium">Subtotal</p>
            <p className="text-lg font-semibold">{formatINR(subtotal)}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Taxes are included in item prices. Shipping calculated at checkout.
          </p>

          <Button size="lg" className="mt-6 w-full" render={<Link href="/checkout" />}>
            Proceed to checkout
          </Button>
        </Reveal>
      )}
    </div>
  );
}
