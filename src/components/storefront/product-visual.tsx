"use client";

import { useState } from "react";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { JewelryViewer, ViewerPlaceholder } from "@/components/storefront/jewelry-viewer";
import { useWebglSupport } from "@/hooks/use-webgl-support";
import { SELECTABLE_GEMSTONES, GEMSTONE_MATERIALS } from "@/lib/jewelry-materials";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Gemstone, MetalType } from "@/generated/prisma/enums";

type GalleryImage = { url: string; altText: string | null };

export function ProductVisual({
  images,
  productName,
  modelUrl,
  metal,
  availableGemstones,
}: {
  images: GalleryImage[];
  productName: string;
  modelUrl: string | null;
  metal: MetalType;
  availableGemstones: Gemstone[];
}) {
  const webgl = useWebglSupport();
  const [gemstone, setGemstone] = useState<Gemstone>(availableGemstones[0] ?? "DIAMOND");
  const [modelErrored, setModelErrored] = useState(false);
  const [tab, setTab] = useState<"3d" | "photos">("3d");

  const gemstoneOptions = availableGemstones.filter((g) => SELECTABLE_GEMSTONES.includes(g));
  const can3d = Boolean(modelUrl) && webgl !== "unsupported" && !modelErrored;

  if (!can3d) {
    return (
      <div className="space-y-3">
        <ProductGallery images={images} productName={productName} />
        {modelUrl && webgl === "unsupported" && <ViewerPlaceholder reason="unsupported" />}
        {modelUrl && modelErrored && <ViewerPlaceholder reason="error" />}
      </div>
    );
  }

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as "3d" | "photos")}>
      <div className="mb-4 flex items-center justify-between">
        <TabsList className="rounded-none bg-transparent p-0">
          <TabsTrigger
            value="3d"
            className="rounded-none text-[10px] tracking-[0.2em] uppercase data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:underline"
          >
            360° View
          </TabsTrigger>
          <TabsTrigger
            value="photos"
            className="rounded-none text-[10px] tracking-[0.2em] uppercase data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:underline"
          >
            Photos
          </TabsTrigger>
        </TabsList>
        {tab === "3d" && (
          <p className="hidden text-[10px] tracking-[0.15em] text-muted-foreground uppercase sm:block">
            Drag to rotate · Scroll to zoom
          </p>
        )}
      </div>

      <TabsContent value="3d">
        <div className="aspect-square overflow-hidden bg-muted">
          {tab === "3d" && (
            <JewelryViewer
              modelUrl={modelUrl as string}
              metal={metal}
              gemstone={gemstone}
              onModelError={() => setModelErrored(true)}
            />
          )}
        </div>
        {gemstoneOptions.length > 1 && (
          <div className="mt-4">
            <p className="mb-2.5 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Stone — {GEMSTONE_MATERIALS[gemstone].label}
            </p>
            <div className="flex gap-3">
              {gemstoneOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-label={GEMSTONE_MATERIALS[option].label}
                  onClick={() => setGemstone(option)}
                  className={`size-9 rounded-full border transition-all ${
                    gemstone === option ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                  }`}
                  style={{ backgroundColor: GEMSTONE_MATERIALS[option].color }}
                />
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="photos">
        <ProductGallery images={images} productName={productName} />
      </TabsContent>
    </Tabs>
  );
}
