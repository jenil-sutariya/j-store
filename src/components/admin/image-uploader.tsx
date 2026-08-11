"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { uploadImageToCloudinary } from "@/lib/cloudinary-client";

type ImageValue = { url: string; publicId: string };

export function ImageUploader({
  value,
  onChange,
  label,
}: {
  value: ImageValue | null;
  onChange: (value: ImageValue | null) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const uploaded = await uploadImageToCloudinary(file);
      onChange(uploaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium">{label}</p>}
      {value ? (
        <div className="relative h-32 w-32 overflow-hidden rounded-md border">
          <Image src={value.url} alt="" fill className="object-cover" />
        </div>
      ) : (
        <div className="flex h-32 w-32 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
          No image
        </div>
      )}
      <div className="flex gap-2">
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
          {isUploading ? "Uploading..." : value ? "Replace" : "Upload"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            Remove
          </Button>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
