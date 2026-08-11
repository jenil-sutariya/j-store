"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { categorySchema, type CategoryInput } from "@/lib/validators/category";
import { createCategory, updateCategory } from "@/lib/actions/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/admin/image-uploader";

type CategoryOption = { id: string; name: string; depth: number };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function CategoryForm({
  categoryId,
  defaultValues,
  parentOptions,
}: {
  categoryId?: string;
  defaultValues?: Partial<CategoryInput>;
  parentOptions: CategoryOption[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues?.slug));

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      imagePublicId: "",
      parentId: "none",
      sortOrder: 0,
      isActive: true,
      ...defaultValues,
    },
  });

  async function onSubmit(values: CategoryInput) {
    setIsSubmitting(true);
    setServerError(null);

    const result = categoryId
      ? await updateCategory(categoryId, values)
      : await createCategory(values);

    setIsSubmitting(false);

    if (!result.success) {
      setServerError(result.error);
      toast.error(result.error);
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
              if (!slugTouched) {
                form.setValue("slug", slugify(e.target.value));
              }
            },
          })}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          {...form.register("slug", {
            onChange: () => setSlugTouched(true),
          })}
        />
        {form.formState.errors.slug && (
          <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...form.register("description")} />
      </div>

      <div className="space-y-2">
        <Label>Parent category</Label>
        <Select
          value={form.watch("parentId") || "none"}
          onValueChange={(value) => form.setValue("parentId", value ?? "none")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="None (top-level)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None (top-level)</SelectItem>
            {parentOptions
              .filter((option) => option.id !== categoryId)
              .map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {"  ".repeat(option.depth)}
                  {option.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortOrder">Sort order</Label>
        <Input
          id="sortOrder"
          type="number"
          {...form.register("sortOrder", { valueAsNumber: true })}
        />
      </div>

      <ImageUploader
        label="Category image"
        value={
          form.watch("imageUrl")
            ? { url: form.watch("imageUrl") as string, publicId: form.watch("imagePublicId") ?? "" }
            : null
        }
        onChange={(value) => {
          form.setValue("imageUrl", value?.url ?? "");
          form.setValue("imagePublicId", value?.publicId ?? "");
        }}
      />

      <div className="flex items-center gap-2">
        <Switch
          checked={form.watch("isActive")}
          onCheckedChange={(checked) => form.setValue("isActive", checked)}
        />
        <Label>Active (visible on storefront)</Label>
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : categoryId ? "Save changes" : "Create category"}
      </Button>
    </form>
  );
}
