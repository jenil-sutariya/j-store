"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";
import { updateCartItemQuantity, removeCartItem } from "@/lib/actions/cart";
import { Button } from "@/components/ui/button";

type CartItem = {
  id: string;
  quantity: number;
  variant: {
    id: string;
    sku: string;
    metalType: string;
    purity: string;
    size: string | null;
    price: unknown;
    stockQuantity: number;
    product: {
      name: string;
      slug: string;
      images: { url: string; altText: string | null }[];
    };
  };
};

export function CartItemRow({ item }: { item: CartItem }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const image = item.variant.product.images[0];

  async function handleQuantityChange(quantity: number) {
    setIsPending(true);
    const result = await updateCartItemQuantity(item.id, quantity);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function handleRemove() {
    setIsPending(true);
    const result = await removeCartItem(item.id);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex gap-4 border-b py-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
        {image && (
          <Image src={image.url} alt={image.altText ?? ""} fill className="object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${item.variant.product.slug}`}
            className="font-medium break-words hover:underline"
          >
            {item.variant.product.name}
          </Link>
          <p className="shrink-0 font-medium">
            {formatINR(Number(item.variant.price) * item.quantity)}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {item.variant.metalType.replace(/_/g, " ")} · {item.variant.purity} · {item.variant.size}
        </p>
        <p className="mt-1 text-sm">{formatINR(Number(item.variant.price))}</p>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-md border">
            <button
              type="button"
              disabled={isPending}
              className="px-2 py-1 text-sm"
              onClick={() => handleQuantityChange(item.quantity - 1)}
            >
              -
            </button>
            <span className="px-3 text-sm">{item.quantity}</span>
            <button
              type="button"
              disabled={isPending || item.quantity >= item.variant.stockQuantity}
              className="px-2 py-1 text-sm"
              onClick={() => handleQuantityChange(item.quantity + 1)}
            >
              +
            </button>
          </div>
          <Button type="button" variant="ghost" size="sm" disabled={isPending} onClick={handleRemove}>
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
