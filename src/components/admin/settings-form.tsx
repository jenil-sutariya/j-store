"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { settingsSchema, type SettingsInput } from "@/lib/validators/settings";
import { updateStoreSettings } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/admin/image-uploader";

export function SettingsForm({ defaultValues }: { defaultValues: Partial<SettingsInput> }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      storeName: "",
      tagline: "",
      logoUrl: "",
      logoPublicId: "",
      legalEntityName: "",
      gstin: "",
      registeredAddress: "",
      supportEmail: "",
      supportPhone: "",
      instagramUrl: "",
      facebookUrl: "",
      shippingFlatFee: 99,
      freeShippingThreshold: 2000,
      ...defaultValues,
    },
  });

  async function onSubmit(values: SettingsInput) {
    setIsSubmitting(true);
    setServerError(null);

    const result = await updateStoreSettings(values);

    setIsSubmitting(false);

    if (!result.success) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success("Settings saved.");
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-3xl space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Brand & legal</h2>

        <div className="space-y-2">
          <Label htmlFor="storeName">Store name</Label>
          <Input id="storeName" {...form.register("storeName")} />
          {form.formState.errors.storeName && (
            <p className="text-sm text-destructive">{form.formState.errors.storeName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" {...form.register("tagline")} />
        </div>

        <ImageUploader
          label="Logo"
          value={
            form.watch("logoUrl")
              ? { url: form.watch("logoUrl") as string, publicId: form.watch("logoPublicId") ?? "" }
              : null
          }
          onChange={(value) => {
            form.setValue("logoUrl", value?.url ?? "");
            form.setValue("logoPublicId", value?.publicId ?? "");
          }}
        />

        <div className="space-y-2">
          <Label htmlFor="legalEntityName">Legal entity name</Label>
          <Input id="legalEntityName" {...form.register("legalEntityName")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gstin">GSTIN</Label>
          <Input id="gstin" {...form.register("gstin")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="registeredAddress">Registered address</Label>
          <Textarea id="registeredAddress" rows={3} {...form.register("registeredAddress")} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Contact</h2>

        <div className="space-y-2">
          <Label htmlFor="supportEmail">Support email</Label>
          <Input id="supportEmail" type="email" {...form.register("supportEmail")} />
          {form.formState.errors.supportEmail && (
            <p className="text-sm text-destructive">
              {form.formState.errors.supportEmail.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="supportPhone">Support phone</Label>
          <Input id="supportPhone" {...form.register("supportPhone")} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Shipping</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="shippingFlatFee">Flat shipping fee (₹)</Label>
            <Input
              id="shippingFlatFee"
              type="number"
              step="0.01"
              {...form.register("shippingFlatFee", { valueAsNumber: true })}
            />
            {form.formState.errors.shippingFlatFee && (
              <p className="text-sm text-destructive">
                {form.formState.errors.shippingFlatFee.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="freeShippingThreshold">Free shipping threshold (₹)</Label>
            <Input
              id="freeShippingThreshold"
              type="number"
              step="0.01"
              {...form.register("freeShippingThreshold", { valueAsNumber: true })}
            />
            {form.formState.errors.freeShippingThreshold && (
              <p className="text-sm text-destructive">
                {form.formState.errors.freeShippingThreshold.message}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Social</h2>

        <div className="space-y-2">
          <Label htmlFor="instagramUrl">Instagram URL</Label>
          <Input id="instagramUrl" {...form.register("instagramUrl")} />
          {form.formState.errors.instagramUrl && (
            <p className="text-sm text-destructive">
              {form.formState.errors.instagramUrl.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="facebookUrl">Facebook URL</Label>
          <Input id="facebookUrl" {...form.register("facebookUrl")} />
          {form.formState.errors.facebookUrl && (
            <p className="text-sm text-destructive">{form.formState.errors.facebookUrl.message}</p>
          )}
        </div>
      </section>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
