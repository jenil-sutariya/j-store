import Link from "next/link";
import { getProductsForListing, getTopCategoriesForNav } from "@/lib/queries/storefront";
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
  const [{ products, total, totalPages, page }, categories] = await Promise.all([
    getProductsForListing(filters),
    getTopCategoriesForNav(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10 text-center">
        <p className="mb-3 text-xs tracking-[0.3em] text-muted-foreground uppercase">Aurelia</p>
        <h1 className="font-display text-4xl sm:text-5xl">All Jewellery</h1>
      </div>

      <nav aria-label="Shop by category" className="mb-12 border-y border-border py-5">
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
          <Link
            href="/products"
            className="link-underline w-fit pb-0.5 text-xs tracking-[0.15em] uppercase"
          >
            All Jewellery
          </Link>
          {categories.map((category) =>
            category.children.length > 0 ? (
              <details key={category.id} className="group relative w-fit">
                <summary className="link-underline flex cursor-pointer list-none items-center gap-2 pb-0.5 text-xs tracking-[0.15em] uppercase [&::-webkit-details-marker]:hidden">
                  {category.name}
                  <span
                    aria-hidden="true"
                    className="text-base leading-none transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="absolute left-0 z-20 mt-3 min-w-48 border border-border bg-background p-4 shadow-lg">
                  <Link
                    href={`/categories/${category.slug}`}
                    className="mb-3 block text-[10px] tracking-[0.15em] uppercase link-underline"
                  >
                    All {category.name}
                  </Link>
                  <div className="flex flex-col items-start gap-2">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/categories/${child.slug}`}
                        className="w-fit text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </details>
            ) : (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="link-underline w-fit pb-0.5 text-xs tracking-[0.15em] uppercase"
              >
                {category.name}
              </Link>
            ),
          )}
        </div>
      </nav>
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
