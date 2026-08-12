"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadModelToCloudinary } from "@/lib/cloudinary-client";

export function ModelUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
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
      const uploaded = await uploadModelToCloudinary(file);
      onChange(uploaded.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".glb,.gltf,model/gltf-binary"
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
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
          Clear
        </Button>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
