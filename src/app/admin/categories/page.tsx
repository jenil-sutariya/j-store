import Link from "next/link";
import { getCategoryTree } from "@/lib/queries/category";
import { deleteCategory } from "@/lib/actions/category";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function CategoriesPage() {
  const categories = await getCategoryTree();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Button render={<Link href="/admin/categories/new" />}>New category</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Sort order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                <span style={{ paddingLeft: `${category.depth * 1.25}rem` }}>
                  {category.depth > 0 ? "└ " : ""}
                  {category.name}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{category.slug}</TableCell>
              <TableCell>{category.sortOrder}</TableCell>
              <TableCell>
                <Badge variant={category.isActive ? "default" : "secondary"}>
                  {category.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  render={<Link href={`/admin/categories/${category.id}`} />}
                >
                  Edit
                </Button>
                <DeleteButton onDelete={deleteCategory.bind(null, category.id)} />
              </TableCell>
            </TableRow>
          ))}
          {categories.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No categories yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
