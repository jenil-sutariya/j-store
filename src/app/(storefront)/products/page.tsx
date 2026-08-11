import { getProductsForListing } from "@/lib/queries/storefront";
import { parseListingSearchParams } from "@/lib/listing-params";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductFilters } from "@/components/storefront/product-filters";
import { MobileFilterSheet } from "@/components/storefront/mobile-filter-sheet";
import { Pagination } from "@/components/storefront/pagination";
import { RevealGroup, RevealItem } from "@/components/storefront/reveal";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const filters = parseListingSearchParams(resolvedSearchParams);
  const { products, total, totalPages, page } = await getProductsForListing(filters);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-16 text-center">
        <p className="mb-3 text-xs tracking-[0.3em] text-muted-foreground uppercase">Aurelia</p>
        <h1 className="font-display text-4xl sm:text-5xl">All Jewellery</h1>
      </div>
      <div className="grid grid-cols-1 gap-12 md:grid-cols-[200px_1fr]">
        <aside className="hidden md:block">
          <ProductFilters />
        </aside>
        <div>
          <MobileFilterSheet />
          <p className="mb-8 text-xs tracking-[0.15em] text-muted-foreground uppercase">
            {total} {total === 1 ? "piece" : "pieces"}
          </p>
          {products.length === 0 ? (
            <p className="text-muted-foreground">No products match these filters.</p>
          ) : (
            <RevealGroup className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3">
              {products.map((product) => (
                <RevealItem key={product.id}>
                  <ProductCard product={product} />
                </RevealItem>
              ))}
            </RevealGroup>
          )}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/products"
            searchParams={resolvedSearchParams}
          />
        </div>
      </div>
    </div>
  );
}
