"use client";

import dynamic from "next/dynamic";
import type { Gemstone, MetalType } from "@/generated/prisma/enums";

const JewelryViewerCanvas = dynamic(() => import("./jewelry-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
    </div>
  ),
});

export function JewelryViewer({
  modelUrl,
  metal,
  gemstone,
  onModelError,
}: {
  modelUrl: string;
  metal: MetalType;
  gemstone: Gemstone;
  onModelError?: () => void;
}) {
  return (
    <JewelryViewerCanvas modelUrl={modelUrl} metal={metal} gemstone={gemstone} onModelError={onModelError} />
  );
}
