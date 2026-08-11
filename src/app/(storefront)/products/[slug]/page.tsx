import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/storefront";
import { ProductPurchasePanel } from "@/components/storefront/product-purchase-panel";
import { ProductCard } from "@/components/storefront/product-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/storefront/reveal";
import { Separator } from "@/components/ui/separator";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, session] = await Promise.all([getProductBySlug(slug), auth()]);

  if (!product) {
    notFound();
  }

  const primaryCategory = product.categories.find((c) => c.isPrimary)?.category;

  const [related, wishlistItem] = await Promise.all([
    getRelatedProducts(product.id, primaryCategory?.id, 4),
    session?.user
      ? prisma.wishlistItem.findUnique({
          where: { userId_productId: { userId: session.user.id, productId: product.id } },
        })
      : null,
  ]);

  const gstRate = Number(product.gstRate);
  const basePrice = Number(product.basePrice);

  const variants = product.variants.map((variant) => ({
    ...variant,
    weightGrams: Number(variant.weightGrams),
    priceAdjustment: Number(variant.priceAdjustment),
    price: Number(variant.price),
    compareAtPrice: variant.compareAtPrice !== null ? Number(variant.compareAtPrice) : null,
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <ProductPurchasePanel
        productId={product.id}
        productName={product.name}
        description={product.description}
        primaryCategoryName={primaryCategory?.name}
        images={product.images}
        variants={variants}
        modelUrl={product.model3dUrl}
        gemstones={product.gemstones}
        occasions={product.occasions}
        styleTags={product.styleTags}
        ratingAvg={Number(product.ratingAvg)}
        ratingCount={product.ratingCount}
        gstRate={gstRate}
        basePrice={basePrice}
        initialWishlisted={Boolean(wishlistItem)}
      />

      <Separator className="my-20" />

      <div className="mx-auto max-w-2xl">
        <p className="mb-8 text-center text-xs tracking-[0.3em] text-muted-foreground uppercase">
          Reviews {product.ratingCount > 0 ? `(${product.ratingCount})` : ""}
        </p>
        {product.reviews.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div key={review.id} className="border-b border-border pb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{review.user.name ?? "Customer"}</span>
                  <span className="text-xs text-muted-foreground">★ {review.rating}/5</span>
                </div>
                {review.title && <p className="mt-1 text-sm font-medium">{review.title}</p>}
                {review.comment && (
                  <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {related.length > 0 && (
        <>
          <Separator className="my-20" />
          <div>
            <Reveal>
              <p className="mb-10 text-center text-xs tracking-[0.3em] text-muted-foreground uppercase">
                You May Also Like
              </p>
            </Reveal>
            <RevealGroup className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {related.map((item) => (
                <RevealItem key={item.id}>
                  <ProductCard product={item} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </>
      )}
    </div>
  );
}
