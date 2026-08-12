"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteProduct, bulkUpdateProducts } from "@/lib/actions/product";
import type { AdminProductRow } from "@/lib/queries/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteButton } from "@/components/admin/delete-button";

const LOW_STOCK_THRESHOLD = 5;

export function ProductsTable({ products }: { products: AdminProductRow[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkActing, setIsBulkActing] = useState(false);

  const allSelected = products.length > 0 && selectedIds.size === products.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(products.map((p) => p.id)));
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkAction(action: "publish" | "unpublish" | "delete") {
    if (action === "delete" && !window.confirm("Delete the selected products? This cannot be undone.")) {
      return;
    }

    setIsBulkActing(true);
    const result = await bulkUpdateProducts([...selectedIds], action);
    setIsBulkActing(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    if (action === "delete") {
      const deletedCount = selectedIds.size - (result.skipped?.length ?? 0);
      toast.success(
        result.skipped && result.skipped.length > 0
          ? `Deleted ${deletedCount}, skipped ${result.skipped.length} (has order history).`
          : `Deleted ${deletedCount}.`,
      );
    } else {
      toast.success(`${action === "publish" ? "Published" : "Unpublished"} ${selectedIds.size} product(s).`);
    }

    setSelectedIds(new Set());
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
          <p className="text-sm text-muted-foreground">{selectedIds.size} selected</p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isBulkActing}
              onClick={() => handleBulkAction("publish")}
            >
              Publish
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isBulkActing}
              onClick={() => handleBulkAction("unpublish")}
            >
              Unpublish
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isBulkActing}
              onClick={() => handleBulkAction("delete")}
            >
              Delete
            </Button>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={toggleAll}
              />
            </TableHead>
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
            const hasLowStockVariant = product.variants.some(
              (v) => v.isActive && v.stockQuantity < LOW_STOCK_THRESHOLD,
            );
            const primaryCategory = product.categories[0]?.category?.name ?? "—";

            return (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(product.id)}
                    onCheckedChange={() => toggleOne(product.id)}
                  />
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell className="text-muted-foreground">{primaryCategory}</TableCell>
                <TableCell>₹{product.basePrice.toString()}</TableCell>
                <TableCell>{totalStock}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant={product.isPublished ? "default" : "secondary"}>
                      {product.isPublished ? "Published" : "Draft"}
                    </Badge>
                    {hasLowStockVariant && <Badge variant="destructive">Low stock</Badge>}
                  </div>
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
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No products yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
