import { prisma } from "@/lib/prisma";
import { getCategoryDescendantIds } from "@/lib/queries/category";
import type { Gender, Gemstone, MetalType, Occasion, Purity } from "@/generated/prisma/enums";

const PRODUCT_CARD_INCLUDE = {
  images: { take: 1, orderBy: { sortOrder: "asc" as const } },
  variants: {
    where: { isActive: true },
    select: { price: true, stockQuantity: true, metalType: true, purity: true },
  },
  categories: { where: { isPrimary: true }, include: { category: true }, take: 1 },
};

export async function getTopCategoriesForNav() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    include: {
      children: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getTestimonials(limit = 3) {
  return prisma.review.findMany({
    where: { isApproved: true, rating: { gte: 4 }, comment: { not: null } },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: { user: { select: { name: true } }, product: { select: { name: true } } },
  });
}

export async function getFeaturedCollections(limit = 4) {
  return prisma.collection.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isPublished: true, isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: PRODUCT_CARD_INCLUDE,
  });
}

export type ProductListFilters = {
  categorySlug?: string;
  collectionSlug?: string;
  genders?: Gender[];
  metalTypes?: MetalType[];
  purities?: Purity[];
  gemstones?: Gemstone[];
  occasions?: Occasion[];
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "name_asc";
  page?: number;
  pageSize?: number;
};

export async function getProductsForListing(filters: ProductListFilters) {
  const pageSize = filters.pageSize ?? 12;
  const page = filters.page ?? 1;

  const where: Record<string, unknown> = { isPublished: true };

  if (filters.categorySlug) {
    const category = await prisma.category.findUnique({ where: { slug: filters.categorySlug } });
    if (category) {
      const descendantIds = await getCategoryDescendantIds(category.id);
      const categoryIds = [category.id, ...descendantIds];
      where.categories = { some: { categoryId: { in: categoryIds } } };
    } else {
      where.categories = { some: { categoryId: "__none__" } };
    }
  }

  if (filters.collectionSlug) {
    where.collections = { some: { collection: { slug: filters.collectionSlug } } };
  }

  if (filters.genders?.length) {
    where.gender = { in: filters.genders };
  }

  if (filters.occasions?.length) {
    where.occasions = { hasSome: filters.occasions };
  }

  if (filters.gemstones?.length) {
    where.gemstones = { hasSome: filters.gemstones };
  }

  const variantFilter: Record<string, unknown> = { isActive: true };
  if (filters.metalTypes?.length) variantFilter.metalType = { in: filters.metalTypes };
  if (filters.purities?.length) variantFilter.purity = { in: filters.purities };
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    variantFilter.price = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }
  if (Object.keys(variantFilter).length > 1 || filters.metalTypes?.length || filters.purities?.length) {
    where.variants = { some: variantFilter };
  }

  const orderBy =
    filters.sort === "price_asc"
      ? { basePrice: "asc" as const }
      : filters.sort === "price_desc"
        ? { basePrice: "desc" as const }
        : filters.sort === "name_asc"
          ? { name: "asc" as const }
          : { createdAt: "desc" as const };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: PRODUCT_CARD_INCLUDE,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isPublished: true },
    include: {
      variants: { where: { isActive: true }, orderBy: { createdAt: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
      categories: { include: { category: true } },
      collections: { include: { collection: true } },
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });
}

export async function getRelatedProducts(productId: string, primaryCategoryId: string | undefined, limit = 4) {
  if (!primaryCategoryId) return [];

  return prisma.product.findMany({
    where: {
      isPublished: true,
      id: { not: productId },
      categories: { some: { categoryId: primaryCategoryId } },
    },
    take: limit,
    include: PRODUCT_CARD_INCLUDE,
  });
}

export async function getCategoryBySlugWithBreadcrumb(slug: string) {
  const category = await prisma.category.findFirst({
    where: { slug, isActive: true },
    include: {
      children: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  if (!category) return null;

  const breadcrumb: { id: string; name: string; slug: string; parentId: string | null }[] = [category];
  let parentId = category.parentId;
  while (parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parentId } });
    if (!parent) break;
    breadcrumb.unshift(parent);
    parentId = parent.parentId;
  }

  return { category, breadcrumb };
}

export async function getCollectionBySlug(slug: string) {
  return prisma.collection.findFirst({
    where: { slug, isActive: true },
  });
}

export async function getCollectionProductsForStorefront(collectionId: string) {
  const links = await prisma.productCollection.findMany({
    where: { collectionId, product: { isPublished: true } },
    orderBy: { sortOrder: "asc" },
    include: { product: { include: PRODUCT_CARD_INCLUDE } },
  });

  return links.map((link) => link.product);
}
