import { redirect } from "next/navigation";
import { requireUser } from "@/lib/require-user";
import { getCartWithItems } from "@/lib/queries/cart";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/storefront/checkout-form";

export default async function CheckoutPage() {
  const session = await requireUser("/checkout");
  const items = await getCartWithItems(session.user.id);

  if (items.length === 0) {
    redirect("/cart");
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  const subtotal = items.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mb-8 sm:mb-10">
        <p className="mb-3 text-xs tracking-[0.3em] text-muted-foreground uppercase">Aurelia</p>
        <h1 className="font-display text-3xl sm:text-4xl">Checkout</h1>
      </div>
      <CheckoutForm addresses={addresses} items={items} subtotal={subtotal} />
    </div>
  );
}
