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
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Checkout</h1>
      <CheckoutForm addresses={addresses} items={items} subtotal={subtotal} />
    </div>
  );
}
