"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadImageToCloudinary } from "@/lib/cloudinary-client";
import { addProductImage, deleteProductImage } from "@/lib/actions/product-image";

type ProductImage = { id: string; url: string; altText: string | null };

export function ProductImagesManager({
  productId,
  variantId = null,
  images,
}: {
  productId: string;
  variantId?: string | null;
  images: ProductImage[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadImageToCloudinary(file);
      const result = await addProductImage(productId, variantId, uploaded);
      if (!result.success) {
        toast.error(result.error);
      } else {
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(imageId: string) {
    setPendingId(imageId);
    const result = await deleteProductImage(imageId);
    setPendingId(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((image) => (
          <div key={image.id} className="relative h-24 w-24 overflow-hidden rounded-md border">
            <Image src={image.url} alt={image.altText ?? ""} fill className="object-cover" />
            <button
              type="button"
              disabled={pendingId === image.id}
              onClick={() => handleDelete(image.id)}
              className="absolute top-0.5 right-0.5 rounded bg-background/80 px-1 text-xs text-destructive"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? "Uploading..." : "Add image"}
      </Button>
    </div>
  );
}
