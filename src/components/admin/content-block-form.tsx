"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { siteContentSchema, type SiteContentInput } from "@/lib/validators/content";
import { updateSiteContent } from "@/lib/actions/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/admin/image-uploader";

export function ContentBlockForm({
  contentKey,
  defaultValues,
}: {
  contentKey: string;
  defaultValues?: Partial<SiteContentInput>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<SiteContentInput>({
    resolver: zodResolver(siteContentSchema),
    defaultValues: {
      title: "",
      tagline: "",
      body: "",
      imageUrl: "",
      imagePublicId: "",
      linkLabel: "",
      linkHref: "",
      ...defaultValues,
    },
  });

  async function onSubmit(values: SiteContentInput) {
    setIsSubmitting(true);
    setServerError(null);

    const result = await updateSiteContent(contentKey, values);

    setIsSubmitting(false);

    if (!result.success) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success("Content saved.");
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-6">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Text</h2>

        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" {...form.register("tagline")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...form.register("title")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Body</Label>
          <Textarea id="body" rows={5} {...form.register("body")} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Image</h2>
        <ImageUploader
          label="Image"
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
        {form.formState.errors.imageUrl && (
          <p className="text-sm text-destructive">{form.formState.errors.imageUrl.message}</p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Link</h2>

        <div className="space-y-2">
          <Label htmlFor="linkLabel">Link label</Label>
          <Input id="linkLabel" {...form.register("linkLabel")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkHref">Link URL</Label>
          <Input id="linkHref" {...form.register("linkHref")} />
        </div>
      </section>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
