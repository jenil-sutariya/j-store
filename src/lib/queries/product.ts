import { prisma } from "@/lib/prisma";

export type ProductListFilters = {
  q?: string;
  categorySlug?: string;
  status?: "published" | "draft";
};

export async function getAllProducts(filters: ProductListFilters = {}) {
  const where: Record<string, unknown> = {};

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { variants: { some: { sku: { contains: filters.q, mode: "insensitive" } } } },
    ];
  }

  if (filters.categorySlug) {
    where.categories = { some: { category: { slug: filters.categorySlug } } };
  }

  if (filters.status) {
    where.isPublished = filters.status === "published";
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      variants: { select: { stockQuantity: true, isActive: true } },
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      categories: { where: { isPrimary: true }, include: { category: true }, take: 1 },
    },
  });

  // Prisma's Decimal fields aren't plain objects, so this needs to be
  // converted to plain numbers before it can cross into a Client Component.
  return products.map((product) => ({
    ...product,
    basePrice: Number(product.basePrice),
    gstRate: Number(product.gstRate),
    ratingAvg: Number(product.ratingAvg),
  }));
}

export type AdminProductRow = Awaited<ReturnType<typeof getAllProducts>>[number];

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
