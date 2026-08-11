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
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Your addresses</h1>
      <AddressManager addresses={addresses} />
    </div>
  );
}
