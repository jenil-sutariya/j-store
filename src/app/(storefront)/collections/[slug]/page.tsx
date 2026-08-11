import { notFound } from "next/navigation";
import { getCollectionBySlug, getCollectionProductsForStorefront } from "@/lib/queries/storefront";
import { ProductCard } from "@/components/storefront/product-card";
import { RevealGroup, RevealItem } from "@/components/storefront/reveal";
import { CollectionBanner, CollectionStoryText } from "@/components/storefront/collection-story";

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const products = await getCollectionProductsForStorefront(collection.id);

  return (
    <div>
      {collection.bannerUrl && (
        <CollectionBanner
          bannerUrl={collection.bannerUrl}
          name={collection.name}
          tagline={collection.tagline}
        />
      )}

      <div className="mx-auto max-w-6xl px-6 py-10">
        {!collection.bannerUrl && (
          <h1 className="mb-2 text-2xl font-semibold">{collection.name}</h1>
        )}
        {collection.storyContent && <CollectionStoryText content={collection.storyContent} />}

        {products.length === 0 ? (
          <p className="text-muted-foreground">No products in this collection yet.</p>
        ) : (
          <RevealGroup className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <RevealItem key={product.id}>
                <ProductCard product={product} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </div>
  );
}
