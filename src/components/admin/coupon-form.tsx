"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { couponSchema, type CouponInput } from "@/lib/validators/coupon";
import { createCoupon, updateCoupon } from "@/lib/actions/coupon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CouponForm({
  couponId,
  defaultValues,
}: {
  couponId?: string;
  defaultValues?: Partial<CouponInput>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CouponInput>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      type: "PERCENTAGE",
      value: 10,
      minOrderValue: null,
      maxDiscountAmount: null,
      usageLimit: null,
      usageLimitPerUser: 1,
      validFrom: "",
      validUntil: "",
      isActive: true,
      ...defaultValues,
    },
  });

  async function onSubmit(values: CouponInput) {
    setIsSubmitting(true);
    setServerError(null);

    const result = couponId ? await updateCoupon(couponId, values) : await createCoupon(values);

    setIsSubmitting(false);

    if (!result.success) {
      setServerError(result.error);
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-6">
      <div className="space-y-2">
        <Label htmlFor="code">Code</Label>
        <Input
          id="code"
          {...form.register("code", { onChange: (e) => (e.target.value = e.target.value.toUpperCase()) })}
        />
        {form.formState.errors.code && (
          <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={form.watch("type")}
            onValueChange={(value) => form.setValue("type", value as CouponInput["type"])}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENTAGE">Percentage</SelectItem>
              <SelectItem value="FIXED_AMOUNT">Fixed amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Value</Label>
          <Input id="value" type="number" step="0.01" {...form.register("value", { valueAsNumber: true })} />
          {form.formState.errors.value && (
            <p className="text-sm text-destructive">{form.formState.errors.value.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minOrderValue">Min order value (₹)</Label>
          <Input
            id="minOrderValue"
            type="number"
            step="0.01"
            {...form.register("minOrderValue", { valueAsNumber: true, setValueAs: (v) => (v === "" || Number.isNaN(v) ? null : v) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxDiscountAmount">Max discount (₹)</Label>
          <Input
            id="maxDiscountAmount"
            type="number"
            step="0.01"
            {...form.register("maxDiscountAmount", { valueAsNumber: true, setValueAs: (v) => (v === "" || Number.isNaN(v) ? null : v) })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="usageLimit">Total usage limit</Label>
          <Input
            id="usageLimit"
            type="number"
            {...form.register("usageLimit", { valueAsNumber: true, setValueAs: (v) => (v === "" || Number.isNaN(v) ? null : v) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="usageLimitPerUser">Per-customer limit</Label>
          <Input
            id="usageLimitPerUser"
            type="number"
            {...form.register("usageLimitPerUser", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="validFrom">Valid from</Label>
          <Input id="validFrom" type="date" {...form.register("validFrom")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="validUntil">Valid until</Label>
          <Input id="validUntil" type="date" {...form.register("validUntil")} />
          {form.formState.errors.validUntil && (
            <p className="text-sm text-destructive">{form.formState.errors.validUntil.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={form.watch("isActive")}
          onCheckedChange={(checked) => form.setValue("isActive", checked)}
        />
        <Label>Active</Label>
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : couponId ? "Save changes" : "Create coupon"}
      </Button>
    </form>
  );
}
