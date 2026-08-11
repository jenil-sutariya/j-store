import { prisma } from "@/lib/prisma";

export async function getAllProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      variants: { select: { stockQuantity: true } },
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      categories: { where: { isPrimary: true }, include: { category: true }, take: 1 },
    },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: { createdAt: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
      categories: true,
      collections: true,
    },
  });
}
