import type { ProductListFilters } from "@/lib/queries/storefront";

type SearchParams = { [key: string]: string | string[] | undefined };

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : value.split(",").filter(Boolean);
}

export function parseListingSearchParams(
  searchParams: SearchParams,
): Omit<ProductListFilters, "categorySlug" | "collectionSlug"> {
  const sortParam = searchParams.sort;
  const sort =
    sortParam === "price_asc" || sortParam === "price_desc" || sortParam === "name_asc"
      ? sortParam
      : "newest";

  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;
  const page = searchParams.page ? Number(searchParams.page) : 1;

  return {
    genders: toArray(searchParams.gender) as ProductListFilters["genders"],
    metalTypes: toArray(searchParams.metal) as ProductListFilters["metalTypes"],
    purities: toArray(searchParams.purity) as ProductListFilters["purities"],
    gemstones: toArray(searchParams.gemstone) as ProductListFilters["gemstones"],
    occasions: toArray(searchParams.occasion) as ProductListFilters["occasions"],
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    sort,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}
