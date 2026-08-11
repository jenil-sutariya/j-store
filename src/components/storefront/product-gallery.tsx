"use client";

import { useState } from "react";
import Image from "next/image";

type GalleryImage = { url: string; altText: string | null };

export function ProductGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        {active ? (
          <Image src={active.url} alt={active.altText ?? productName} fill className="object-cover" priority />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image available
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.url + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 w-16 overflow-hidden rounded-md border ${
                index === activeIndex ? "border-foreground" : "border-transparent"
              }`}
            >
              <Image src={image.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
