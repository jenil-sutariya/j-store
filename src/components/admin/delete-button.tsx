"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/category";

export function DeleteButton({
  onDelete,
  confirmMessage = "Delete this item? This cannot be undone.",
}: {
  onDelete: () => Promise<ActionResult>;
  confirmMessage?: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleClick() {
    if (!window.confirm(confirmMessage)) return;

    setIsDeleting(true);
    const result = await onDelete();
    setIsDeleting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Deleted.");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" disabled={isDeleting} onClick={handleClick}>
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
