import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { AddressManager } from "@/components/storefront/address-manager";

export default async function AddressesPage() {
  const session = await requireUser("/account/addresses");

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <p className="mb-3 text-xs tracking-[0.3em] text-muted-foreground uppercase">Account</p>
      <h1 className="mb-8 font-display text-3xl sm:text-4xl">Your Addresses</h1>
      <AddressManager addresses={addresses} />
    </div>
  );
}
