"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addProductToCollection, removeProductFromCollection } from "@/lib/actions/collection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ExistingProduct = { productId: string; name: string };
type SearchResult = { id: string; name: string; slug: string; basePrice: string };

export function CollectionProductsManager({
  collectionId,
  initialProducts,
}: {
  collectionId: string;
  initialProducts: ExistingProduct[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    const excludeIds = initialProducts.map((p) => p.productId).join(",");
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/admin/products/search?q=${encodeURIComponent(query)}&exclude=${excludeIds}`,
          { signal: controller.signal },
        );
        const data = await response.json();
        setResults(data.products ?? []);
      } catch {
        // ignore aborted requests
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, initialProducts]);

  async function handleAdd(productId: string) {
    setPendingId(productId);
    const result = await addProductToCollection(collectionId, productId);
    setPendingId(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setQuery("");
    setResults([]);
    router.refresh();
  }

  async function handleRemove(productId: string) {
    setPendingId(productId);
    const result = await removeProductFromCollection(collectionId, productId);
    setPendingId(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input
          placeholder="Search products by name to add..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isSearching && <p className="text-xs text-muted-foreground">Searching...</p>}
        {results.length > 0 && (
          <div className="rounded-md border">
            {results.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between border-b px-3 py-2 last:border-b-0"
              >
                <span className="text-sm">{product.name}</span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pendingId === product.id}
                  onClick={() => handleAdd(product.id)}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialProducts.map((product) => (
            <TableRow key={product.productId}>
              <TableCell>{product.name}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pendingId === product.productId}
                  onClick={() => handleRemove(product.productId)}
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {initialProducts.length === 0 && (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-muted-foreground">
                No products in this collection yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
