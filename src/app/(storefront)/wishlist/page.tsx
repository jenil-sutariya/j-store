import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/storefront/product-card";
import { RevealGroup, RevealItem } from "@/components/storefront/reveal";

export default async function WishlistPage() {
  const session = await requireUser("/wishlist");

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          variants: { where: { isActive: true }, select: { price: true, stockQuantity: true } },
          categories: { where: { isPrimary: true }, include: { category: true }, take: 1 },
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <h1 className="mb-10 font-display text-3xl sm:text-4xl">Your Wishlist</h1>
      {items.length === 0 ? (
        <p className="text-muted-foreground">Nothing saved yet.</p>
      ) : (
        <RevealGroup className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <RevealItem key={item.id}>
              <ProductCard product={item.product} />
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </div>
  );
}
