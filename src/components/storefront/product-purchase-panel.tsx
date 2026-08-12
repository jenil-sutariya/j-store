"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductVisual } from "@/components/storefront/product-visual";
import { VariantSelector } from "@/components/storefront/variant-selector";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { Reveal } from "@/components/storefront/reveal";
import { formatINR } from "@/lib/format";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Gemstone, MetalType } from "@/generated/prisma/enums";

type GalleryImage = { url: string; altText: string | null };
type Variant = {
  id: string;
  metalType: string;
  purity: string;
  size: string | null;
  price: unknown;
  compareAtPrice: unknown;
  stockQuantity: number;
  weightGrams: unknown;
};

export function ProductPurchasePanel({
  productId,
  productName,
  description,
  primaryCategoryName,
  images,
  variants,
  modelUrl,
  gemstones,
  ratingAvg,
  ratingCount,
  gstRate,
  basePrice,
  initialWishlisted,
}: {
  productId: string;
  productName: string;
  description: string;
  primaryCategoryName: string | undefined;
  images: GalleryImage[];
  variants: Variant[];
  modelUrl: string | null;
  gemstones: Gemstone[];
  occasions: string[];
  styleTags: string[];
  ratingAvg: number;
  ratingCount: number;
  gstRate: number;
  basePrice: number;
  initialWishlisted: boolean;
}) {
  const [metal, setMetal] = useState<MetalType>((variants[0]?.metalType as MetalType) ?? "GOLD");

  const taxableValue = basePrice / (1 + gstRate / 100);
  const gstAmount = basePrice - taxableValue;

  const purities = [...new Set(variants.map((v) => v.purity))];
  const weights = variants.map((v) => Number(v.weightGrams));
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const gemstoneLabel = gemstones.find((g) => g !== "NONE");

  return (
    <div className="grid gap-12 md:grid-cols-2 md:gap-16">
      <Reveal y={12}>
        <ProductVisual
          images={images}
          productName={productName}
          modelUrl={modelUrl}
          metal={metal}
          availableGemstones={gemstones}
        />
      </Reveal>

      <div className="space-y-8 md:pt-4">
        <div>
          {primaryCategoryName && (
            <p className="mb-3 text-xs tracking-[0.25em] text-muted-foreground uppercase">
              {primaryCategoryName}
            </p>
          )}
          <h1 className="font-display text-3xl leading-tight break-words sm:text-4xl md:text-5xl">
            {productName}
          </h1>
          {ratingCount > 0 && (
            <p className="mt-3 text-xs tracking-[0.1em] text-muted-foreground uppercase">
              {"★".repeat(Math.round(ratingAvg))} {ratingAvg.toFixed(1)} ({ratingCount} reviews)
            </p>
          )}
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>

        <VariantSelector variants={variants} onMetalChange={(value) => setMetal(value as MetalType)} />

        <p className="text-[11px] text-muted-foreground">
          Inclusive of {gstRate}% GST ({formatINR(gstAmount)}) on a taxable value of{" "}
          {formatINR(taxableValue)}
        </p>

        <WishlistButton productId={productId} initialWishlisted={initialWishlisted} />

        <Accordion multiple={false} className="border-t border-border">
          <AccordionItem value="details">
            <AccordionTrigger className="text-xs tracking-[0.15em] uppercase">Details</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{description}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="materials">
            <AccordionTrigger className="text-xs tracking-[0.15em] uppercase">Materials</AccordionTrigger>
            <AccordionContent className="space-y-1 text-sm text-muted-foreground">
              <p>Purity: {purities.join(", ")}</p>
              <p>
                Weight: {minWeight === maxWeight ? `${minWeight}g` : `${minWeight}g – ${maxWeight}g`}
              </p>
              {gemstoneLabel && <p>Gemstone: {gemstoneLabel.toLowerCase()}</p>}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="craftsmanship">
            <AccordionTrigger className="text-xs tracking-[0.15em] uppercase">
              Craftsmanship
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              Hand-finished by a single goldsmith from first sketch to final polish, and checked
              against the original design at every stage.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="delivery">
            <AccordionTrigger className="text-xs tracking-[0.15em] uppercase">Delivery</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              Free shipping on orders above ₹2,000, dispatched within 1–2 business days. See our{" "}
              <Link href="/legal/shipping-policy" data-cursor-hover className="link-underline text-foreground">
                shipping policy
              </Link>{" "}
              for details.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="care">
            <AccordionTrigger className="text-xs tracking-[0.15em] uppercase">Care</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              Store separately in a soft pouch, away from moisture and perfume. Wipe with a soft
              cloth after wear to keep its finish.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
