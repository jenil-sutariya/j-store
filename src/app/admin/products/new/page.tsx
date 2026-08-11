import { getCategoryTree } from "@/lib/queries/category";
import { getAllCollections } from "@/lib/queries/collection";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const [categories, collections] = await Promise.all([getCategoryTree(), getAllCollections()]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New product</h1>
      <ProductForm
        categoryOptions={categories}
        collectionOptions={collections.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
