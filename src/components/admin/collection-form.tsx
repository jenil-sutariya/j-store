"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { collectionSchema, type CollectionInput } from "@/lib/validators/collection";
import { createCollection, updateCollection } from "@/lib/actions/collection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "@/components/admin/image-uploader";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function CollectionForm({
  collectionId,
  defaultValues,
}: {
  collectionId?: string;
  defaultValues?: Partial<CollectionInput>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues?.slug));

  const form = useForm<CollectionInput>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: "",
      slug: "",
      tagline: "",
      storyContent: "",
      bannerUrl: "",
      bannerPublicId: "",
      startsAt: "",
      endsAt: "",
      isFeatured: false,
      isActive: true,
      ...defaultValues,
    },
  });

  async function onSubmit(values: CollectionInput) {
    setIsSubmitting(true);
    setServerError(null);

    const result = collectionId
      ? await updateCollection(collectionId, values)
      : await createCollection(values);

    setIsSubmitting(false);

    if (!result.success) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    if (collectionId) {
      toast.success("Collection saved.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...form.register("name", {
            onChange: (e) => {
              if (!slugTouched) form.setValue("slug", slugify(e.target.value));
            },
          })}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" {...form.register("slug", { onChange: () => setSlugTouched(true) })} />
        {form.formState.errors.slug && (
          <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tagline">Tagline</Label>
        <Input id="tagline" {...form.register("tagline")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="storyContent">Story content</Label>
        <Textarea id="storyContent" rows={5} {...form.register("storyContent")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startsAt">Starts at</Label>
          <Input id="startsAt" type="date" {...form.register("startsAt")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endsAt">Ends at</Label>
          <Input id="endsAt" type="date" {...form.register("endsAt")} />
        </div>
      </div>

      <ImageUploader
        label="Banner image"
        value={
          form.watch("bannerUrl")
            ? { url: form.watch("bannerUrl") as string, publicId: form.watch("bannerPublicId") ?? "" }
            : null
        }
        onChange={(value) => {
          form.setValue("bannerUrl", value?.url ?? "");
          form.setValue("bannerPublicId", value?.publicId ?? "");
        }}
      />

      <div className="flex items-center gap-2">
        <Switch
          checked={form.watch("isFeatured")}
          onCheckedChange={(checked) => form.setValue("isFeatured", checked)}
        />
        <Label>Featured</Label>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={form.watch("isActive")}
          onCheckedChange={(checked) => form.setValue("isActive", checked)}
        />
        <Label>Active (visible on storefront)</Label>
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : collectionId ? "Save changes" : "Create collection"}
      </Button>
    </form>
  );
}
