import { getCategoryTree } from "@/lib/queries/category";
import { CategoryForm } from "@/components/admin/category-form";

export default async function NewCategoryPage() {
  const categories = await getCategoryTree();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New category</h1>
      <CategoryForm parentOptions={categories} />
    </div>
  );
}
