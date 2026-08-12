import Link from "next/link";
import { getProductsForListing, getTopCategoriesForNav } from "@/lib/queries/storefront";
import { parseListingSearchParams } from "@/lib/listing-params";
import { ProductCard } from "@/components/storefront/product-card";
import { FilterBar } from "@/components/storefront/filter-bar";
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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mb-8 text-center sm:mb-10">
        <p className="mb-3 text-xs tracking-[0.3em] text-muted-foreground uppercase">Aurelia</p>
        <h1 className="font-display text-4xl sm:text-5xl">All Jewellery</h1>
      </div>

      <nav aria-label="Shop by category" className="mb-10 border-y border-border py-5 sm:mb-12">
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
      <FilterBar resultCount={total} />

      {products.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No products match these filters.</p>
      ) : (
        <RevealGroup className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4">
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
  );
}
