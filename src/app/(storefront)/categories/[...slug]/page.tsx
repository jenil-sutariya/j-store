import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlugWithBreadcrumb, getProductsForListing } from "@/lib/queries/storefront";
import { parseListingSearchParams } from "@/lib/listing-params";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductFilters } from "@/components/storefront/product-filters";
import { MobileFilterSheet } from "@/components/storefront/mobile-filter-sheet";
import { Pagination } from "@/components/storefront/pagination";
import { RevealGroup, RevealItem } from "@/components/storefront/reveal";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const lastSlug = slug[slug.length - 1];

  const result = await getCategoryBySlugWithBreadcrumb(lastSlug);
  if (!result) {
    notFound();
  }
  const { category, breadcrumb } = result;

  const filters = parseListingSearchParams(resolvedSearchParams);
  const { products, total, totalPages, page } = await getProductsForListing({
    ...filters,
    categorySlug: category.slug,
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <nav className="mb-8 flex items-center gap-1.5 text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
        <Link href="/products" className="link-underline pb-0.5">
          All
        </Link>
        {breadcrumb.map((crumb) => (
          <span key={crumb.id} className="flex items-center gap-1.5">
            <span>/</span>
            <Link href={`/categories/${crumb.slug}`} className="link-underline pb-0.5">
              {crumb.name}
            </Link>
          </span>
        ))}
      </nav>

      <div className="mb-16 text-center">
        <h1 className="font-display text-4xl sm:text-5xl">{category.name}</h1>
        {category.description && (
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">{category.description}</p>
        )}
      </div>

      {category.children.length > 0 && (
        <div className="mb-16 flex flex-wrap justify-center gap-6">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/categories/${child.slug}`}
              className="link-underline pb-0.5 text-xs tracking-[0.15em] uppercase"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}

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
            <p className="text-muted-foreground">No products in this category yet.</p>
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
            basePath={`/categories/${category.slug}`}
            searchParams={resolvedSearchParams}
          />
        </div>
      </div>
    </div>
  );
}
