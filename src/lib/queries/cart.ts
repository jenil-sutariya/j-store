import { prisma } from "@/lib/prisma";

export async function getCartItemCount(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { select: { quantity: true } } },
  });
  if (!cart) return 0;
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export async function getCartWithItems(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          variant: {
            include: {
              product: {
                include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
              },
            },
          },
        },
      },
    },
  });

  return cart?.items ?? [];
}
