import { notFound } from "next/navigation";
import { getProductById } from "@/lib/queries/product";
import { getCategoryTree } from "@/lib/queries/category";
import { getAllCollections } from "@/lib/queries/collection";
import { ProductForm } from "@/components/admin/product-form";
import { ProductImagesManager } from "@/components/admin/product-images-manager";
import { Separator } from "@/components/ui/separator";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, collections] = await Promise.all([
    getProductById(id),
    getCategoryTree(),
    getAllCollections(),
  ]);

  if (!product) {
    notFound();
  }

  const activeVariants = product.variants.filter((v) => v.isActive);
  const sharedImages = product.images.filter((img) => !img.variantId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Edit product</h1>
        <ProductForm
          productId={product.id}
          categoryOptions={categories}
          collectionOptions={collections.map((c) => ({ id: c.id, name: c.name }))}
          defaultValues={{
            name: product.name,
            slug: product.slug,
            description: product.description,
            brand: product.brand ?? "",
            basePrice: Number(product.basePrice),
            gstRate: Number(product.gstRate),
            hsnCode: product.hsnCode ?? "",
            gender: product.gender,
            occasions: product.occasions,
            gemstones: product.gemstones,
            styleTags: product.styleTags,
            isPublished: product.isPublished,
            isFeatured: product.isFeatured,
            model3dUrl: product.model3dUrl ?? "",
            categoryIds: product.categories.map((c) => c.categoryId),
            primaryCategoryId: product.categories.find((c) => c.isPrimary)?.categoryId ?? "",
            collectionIds: product.collections.map((c) => c.collectionId),
            variants: activeVariants.map((v) => ({
              id: v.id,
              sku: v.sku,
              metalType: v.metalType,
              purity: v.purity,
              size: v.size ?? "ONE_SIZE",
              weightGrams: Number(v.weightGrams),
              priceAdjustment: Number(v.priceAdjustment),
              compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
              stockQuantity: v.stockQuantity,
              isActive: v.isActive,
            })),
          }}
        />
      </div>

      <Separator className="max-w-3xl" />

      <div className="max-w-3xl space-y-6">
        <div>
          <h2 className="mb-2 text-lg font-semibold">Product gallery</h2>
          <ProductImagesManager
            productId={product.id}
            images={sharedImages.map((img) => ({ id: img.id, url: img.url, altText: img.altText }))}
          />
        </div>

        {activeVariants.map((variant) => {
          const variantImages = product.images.filter((img) => img.variantId === variant.id);
          return (
            <div key={variant.id}>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                {variant.sku} images
              </h3>
              <ProductImagesManager
                productId={product.id}
                variantId={variant.id}
                images={variantImages.map((img) => ({
                  id: img.id,
                  url: img.url,
                  altText: img.altText,
                }))}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
