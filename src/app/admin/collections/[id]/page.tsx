import { notFound } from "next/navigation";
import { getCollectionById, getCollectionProducts } from "@/lib/queries/collection";
import { CollectionForm } from "@/components/admin/collection-form";
import { CollectionProductsManager } from "@/components/admin/collection-products-manager";
import { Separator } from "@/components/ui/separator";

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [collection, productLinks] = await Promise.all([
    getCollectionById(id),
    getCollectionProducts(id),
  ]);

  if (!collection) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Edit collection</h1>
        <CollectionForm
          collectionId={collection.id}
          defaultValues={{
            name: collection.name,
            slug: collection.slug,
            tagline: collection.tagline ?? "",
            storyContent: collection.storyContent ?? "",
            bannerUrl: collection.bannerUrl ?? "",
            bannerPublicId: collection.bannerPublicId ?? "",
            startsAt: toDateInputValue(collection.startsAt),
            endsAt: toDateInputValue(collection.endsAt),
            isFeatured: collection.isFeatured,
            isActive: collection.isActive,
          }}
        />
      </div>

      <Separator className="max-w-xl" />

      <div className="max-w-xl">
        <h2 className="mb-4 text-lg font-semibold">Products in this collection</h2>
        <CollectionProductsManager
          collectionId={collection.id}
          initialProducts={productLinks.map((link) => ({
            productId: link.productId,
            name: link.product.name,
          }))}
        />
      </div>
    </div>
  );
}
