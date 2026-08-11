"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleWishlist } from "@/lib/actions/wishlist";
import { Button } from "@/components/ui/button";

export function WishlistButton({
  productId,
  initialWishlisted,
}: {
  productId: string;
  initialWishlisted: boolean;
}) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setIsPending(true);
    const result = await toggleWishlist(productId);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setWishlisted(Boolean(result.wishlisted));
    router.refresh();
  }

  return (
    <Button type="button" variant="outline" disabled={isPending} onClick={handleClick}>
      {wishlisted ? "♥ Saved" : "♡ Save to wishlist"}
    </Button>
  );
}
