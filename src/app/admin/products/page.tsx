import Link from "next/link";
import { getAllProducts } from "@/lib/queries/product";
import { getCategoryTree } from "@/lib/queries/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductsTable } from "@/components/admin/products-table";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string }>;
}) {
  const { q, category, status } = await searchParams;
  const normalizedStatus = status === "published" || status === "draft" ? status : undefined;
  const normalizedCategory = category && category !== "all" ? category : undefined;

  const [products, categories] = await Promise.all([
    getAllProducts({ q, categorySlug: normalizedCategory, status: normalizedStatus }),
    getCategoryTree(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Button render={<Link href="/admin/products/new" />}>New product</Button>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="w-56 space-y-1">
          <label htmlFor="q" className="text-xs text-muted-foreground">
            Name or SKU
          </label>
          <Input id="q" name="q" placeholder="Search products..." defaultValue={q ?? ""} />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Category</label>
          <Select name="category" defaultValue={category ?? "all"}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.slug}>
                  {"—".repeat(c.depth)} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Status</label>
          <Select name="status" defaultValue={normalizedStatus ?? "all"}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" variant="outline">
          Filter
        </Button>
        {(q || category || status) && (
          <Button type="button" variant="ghost" render={<Link href="/admin/products" />}>
            Clear
          </Button>
        )}
      </form>

      <ProductsTable products={products} />
    </div>
  );
}
