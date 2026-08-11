"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { productSchema, type ProductInput } from "@/lib/validators/product";
import { saveProduct } from "@/lib/actions/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MetalType, Purity, Gender, Occasion, Gemstone, StyleTag } from "@/generated/prisma/enums";

type CategoryOption = { id: string; name: string; depth: number };
type CollectionOption = { id: string; name: string };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function emptyVariant() {
  return {
    sku: "",
    metalType: "GOLD" as const,
    purity: "K18" as const,
    size: "ONE_SIZE",
    weightGrams: 1,
    priceAdjustment: 0,
    compareAtPrice: null,
    stockQuantity: 0,
    isActive: true,
  };
}

export function ProductForm({
  productId,
  defaultValues,
  categoryOptions,
  collectionOptions,
}: {
  productId?: string;
  defaultValues?: Partial<ProductInput>;
  categoryOptions: CategoryOption[];
  collectionOptions: CollectionOption[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues?.slug));

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      brand: "",
      basePrice: 0,
      gstRate: 3,
      hsnCode: "",
      gender: "UNISEX",
      occasions: [],
      gemstones: [],
      styleTags: [],
      isPublished: false,
      isFeatured: false,
      model3dUrl: "",
      categoryIds: [],
      primaryCategoryId: "",
      collectionIds: [],
      variants: [emptyVariant()],
      ...defaultValues,
    },
  });

  const variantsArray = useFieldArray({ control: form.control, name: "variants" });

  const categoryIds = form.watch("categoryIds");
  const primaryCategoryId = form.watch("primaryCategoryId");

  function toggleArrayValue<T extends string>(field: T[], value: T): T[] {
    return field.includes(value) ? field.filter((v) => v !== value) : [...field, value];
  }

  async function onSubmit(values: ProductInput) {
    setIsSubmitting(true);
    setServerError(null);

    const result = await saveProduct(productId, values);

    setIsSubmitting(false);

    if (!result.success) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    if (productId) {
      toast.success("Product saved.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-3xl space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Core details</h2>

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
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={4} {...form.register("description")} />
          {form.formState.errors.description && (
            <p className="text-sm text-destructive">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" {...form.register("brand")} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="basePrice">Base price (₹)</Label>
            <Input
              id="basePrice"
              type="number"
              step="0.01"
              {...form.register("basePrice", { valueAsNumber: true })}
            />
            {form.formState.errors.basePrice && (
              <p className="text-sm text-destructive">
                {form.formState.errors.basePrice.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gstRate">GST rate (%)</Label>
            <Input
              id="gstRate"
              type="number"
              step="0.01"
              {...form.register("gstRate", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hsnCode">HSN code</Label>
            <Input id="hsnCode" {...form.register("hsnCode")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Gender</Label>
          <Select
            value={form.watch("gender")}
            onValueChange={(value) => form.setValue("gender", value as ProductInput["gender"])}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(Gender).map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <EnumCheckboxGroup
          label="Occasions"
          options={Object.values(Occasion)}
          selected={form.watch("occasions")}
          onChange={(value) =>
            form.setValue("occasions", toggleArrayValue(form.watch("occasions"), value))
          }
        />

        <EnumCheckboxGroup
          label="Gemstones"
          options={Object.values(Gemstone)}
          selected={form.watch("gemstones")}
          onChange={(value) =>
            form.setValue("gemstones", toggleArrayValue(form.watch("gemstones"), value))
          }
        />

        <EnumCheckboxGroup
          label="Style tags"
          options={Object.values(StyleTag)}
          selected={form.watch("styleTags")}
          onChange={(value) =>
            form.setValue("styleTags", toggleArrayValue(form.watch("styleTags"), value))
          }
        />

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch
              checked={form.watch("isPublished")}
              onCheckedChange={(checked) => form.setValue("isPublished", checked)}
            />
            <Label>Published</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.watch("isFeatured")}
              onCheckedChange={(checked) => form.setValue("isFeatured", checked)}
            />
            <Label>Featured</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model3dUrl">3D model URL (.glb)</Label>
          <Input
            id="model3dUrl"
            placeholder="/models/rings/diamond-solitaire.glb"
            {...form.register("model3dUrl")}
          />
          <p className="text-xs text-muted-foreground">
            Path or URL to a .glb file. Leave blank to show the photo gallery only. See{" "}
            <code>public/models/README.md</code> for naming and mesh conventions.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Categories</h2>
        <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border p-3">
          {categoryOptions.map((category) => (
            <div key={category.id} className="flex items-center gap-2">
              <Checkbox
                checked={categoryIds.includes(category.id)}
                onCheckedChange={() =>
                  form.setValue("categoryIds", toggleArrayValue(categoryIds, category.id))
                }
              />
              <span style={{ paddingLeft: `${category.depth * 1}rem` }} className="text-sm">
                {category.name}
              </span>
            </div>
          ))}
        </div>
        {form.formState.errors.categoryIds && (
          <p className="text-sm text-destructive">{form.formState.errors.categoryIds.message}</p>
        )}

        <div className="space-y-2">
          <Label>Primary category</Label>
          <Select
            value={primaryCategoryId}
            onValueChange={(value) => form.setValue("primaryCategoryId", value ?? "")}
          >
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder="Choose primary category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions
                .filter((c) => categoryIds.includes(c.id))
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {form.formState.errors.primaryCategoryId && (
            <p className="text-sm text-destructive">
              {form.formState.errors.primaryCategoryId.message}
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Collections</h2>
        <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-3">
          {collectionOptions.map((collection) => (
            <div key={collection.id} className="flex items-center gap-2">
              <Checkbox
                checked={form.watch("collectionIds").includes(collection.id)}
                onCheckedChange={() =>
                  form.setValue(
                    "collectionIds",
                    toggleArrayValue(form.watch("collectionIds"), collection.id),
                  )
                }
              />
              <span className="text-sm">{collection.name}</span>
            </div>
          ))}
          {collectionOptions.length === 0 && (
            <p className="text-sm text-muted-foreground">No collections yet.</p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Variants</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => variantsArray.append(emptyVariant())}
          >
            Add variant
          </Button>
        </div>
        {form.formState.errors.variants?.root && (
          <p className="text-sm text-destructive">{form.formState.errors.variants.root.message}</p>
        )}

        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Metal</TableHead>
                <TableHead>Purity</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Weight (g)</TableHead>
                <TableHead>Price adj.</TableHead>
                <TableHead>Compare at</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Active</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variantsArray.fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <Input
                      className="w-32"
                      {...form.register(`variants.${index}.sku`)}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={form.watch(`variants.${index}.metalType`)}
                      onValueChange={(value) =>
                        form.setValue(`variants.${index}.metalType`, value as never)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(MetalType).map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={form.watch(`variants.${index}.purity`)}
                      onValueChange={(value) =>
                        form.setValue(`variants.${index}.purity`, value as never)
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Purity).map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input className="w-24" {...form.register(`variants.${index}.size`)} />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="w-24"
                      type="number"
                      step="0.01"
                      {...form.register(`variants.${index}.weightGrams`, { valueAsNumber: true })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="w-24"
                      type="number"
                      step="0.01"
                      {...form.register(`variants.${index}.priceAdjustment`, {
                        valueAsNumber: true,
                      })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="w-24"
                      type="number"
                      step="0.01"
                      {...form.register(`variants.${index}.compareAtPrice`, {
                        valueAsNumber: true,
                      })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="w-20"
                      type="number"
                      {...form.register(`variants.${index}.stockQuantity`, {
                        valueAsNumber: true,
                      })}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={form.watch(`variants.${index}.isActive`)}
                      onCheckedChange={(checked) =>
                        form.setValue(`variants.${index}.isActive`, checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {variantsArray.fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => variantsArray.remove(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : productId ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}

function EnumCheckboxGroup<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: readonly T[];
  selected: T[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-3 rounded-md border p-3">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-1.5 text-sm">
            <Checkbox checked={selected.includes(option)} onCheckedChange={() => onChange(option)} />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}
