import { notFound } from "next/navigation";
import { getCategoryById, getCategoryTree } from "@/lib/queries/category";
import { CategoryForm } from "@/components/admin/category-form";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category, categories] = await Promise.all([getCategoryById(id), getCategoryTree()]);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit category</h1>
      <CategoryForm
        categoryId={category.id}
        parentOptions={categories}
        defaultValues={{
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          imageUrl: category.imageUrl ?? "",
          imagePublicId: category.imagePublicId ?? "",
          parentId: category.parentId ?? "none",
          sortOrder: category.sortOrder,
          isActive: category.isActive,
        }}
      />
    </div>
  );
}
