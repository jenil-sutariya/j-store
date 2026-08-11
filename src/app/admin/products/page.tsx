import Link from "next/link";
import { getAllProducts } from "@/lib/queries/product";
import { deleteProduct } from "@/lib/actions/product";
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

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Button render={<Link href="/admin/products/new" />}>New product</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Base price</TableHead>
            <TableHead>Total stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
            const primaryCategory = product.categories[0]?.category?.name ?? "—";

            return (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell className="text-muted-foreground">{primaryCategory}</TableCell>
                <TableCell>₹{product.basePrice.toString()}</TableCell>
                <TableCell>{totalStock}</TableCell>
                <TableCell>
                  <Badge variant={product.isPublished ? "default" : "secondary"}>
                    {product.isPublished ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href={`/admin/products/${product.id}`} />}
                  >
                    Edit
                  </Button>
                  <DeleteButton onDelete={deleteProduct.bind(null, product.id)} />
                </TableCell>
              </TableRow>
            );
          })}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No products yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
