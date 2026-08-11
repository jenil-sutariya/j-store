import { prisma } from "@/lib/prisma";

export async function getAllCollections() {
  return prisma.collection.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function getCollectionById(id: string) {
  return prisma.collection.findUnique({ where: { id } });
}

export async function getCollectionProducts(id: string) {
  return prisma.productCollection.findMany({
    where: { collectionId: id },
    orderBy: { sortOrder: "asc" },
    include: {
      product: {
        include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
      },
    },
  });
}

export async function searchProducts(query: string, excludeIds: string[] = []) {
  return prisma.product.findMany({
    where: {
      name: { contains: query, mode: "insensitive" },
      id: { notIn: excludeIds },
    },
    take: 10,
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, basePrice: true },
  });
}
