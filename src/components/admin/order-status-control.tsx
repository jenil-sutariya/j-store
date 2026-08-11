"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateOrderStatus, markCodPaymentCollected } from "@/lib/actions/order";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderStatus } from "@/generated/prisma/enums";

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURN_REQUESTED",
  "RETURNED",
  "REFUNDED",
];

export function OrderStatusControl({
  orderId,
  currentStatus,
  isCodUnpaid,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  isCodUnpaid: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    const result = await updateOrderStatus(orderId, status);
    setIsSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Order status updated.");
    router.refresh();
  }

  async function handleMarkPaid() {
    setIsMarkingPaid(true);
    const result = await markCodPaymentCollected(orderId);
    setIsMarkingPaid(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Marked as paid.");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {option.replace(/_/g, " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm" disabled={isSaving || status === currentStatus} onClick={handleSave}>
        {isSaving ? "Saving..." : "Update status"}
      </Button>
      {isCodUnpaid && (
        <Button size="sm" variant="outline" disabled={isMarkingPaid} onClick={handleMarkPaid}>
          {isMarkingPaid ? "Saving..." : "Mark COD as paid"}
        </Button>
      )}
    </div>
  );
}
