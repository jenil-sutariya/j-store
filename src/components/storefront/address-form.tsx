"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { addressSchema, type AddressInput } from "@/lib/validators/address";
import { createAddress, updateAddress } from "@/lib/actions/address";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function AddressForm({
  addressId,
  defaultValues,
  onSaved,
}: {
  addressId?: string;
  defaultValues?: Partial<AddressInput>;
  onSaved?: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      type: "SHIPPING",
      fullName: "",
      phone: "",
      line1: "",
      line2: "",
      landmark: "",
      city: "",
      state: "",
      postalCode: "",
      isDefault: false,
      ...defaultValues,
    },
  });

  async function onSubmit(values: AddressInput) {
    setIsSubmitting(true);
    setServerError(null);

    const result = addressId ? await updateAddress(addressId, values) : await createAddress(values);

    setIsSubmitting(false);

    if (!result.success) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success("Address saved.");
    onSaved?.();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" {...form.register("fullName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...form.register("phone")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="line1">Address line 1</Label>
        <Input id="line1" {...form.register("line1")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="line2">Address line 2</Label>
        <Input id="line2" {...form.register("line2")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="landmark">Landmark</Label>
        <Input id="landmark" {...form.register("landmark")} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...form.register("city")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" {...form.register("state")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal code</Label>
          <Input id="postalCode" {...form.register("postalCode")} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={form.watch("isDefault")}
          onCheckedChange={(checked) => form.setValue("isDefault", checked)}
        />
        <Label>Set as default address</Label>
      </div>

      {Object.values(form.formState.errors)[0] && (
        <p className="text-sm text-destructive">{Object.values(form.formState.errors)[0]?.message}</p>
      )}
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Saving..." : addressId ? "Save changes" : "Add address"}
      </Button>
    </form>
  );
}
