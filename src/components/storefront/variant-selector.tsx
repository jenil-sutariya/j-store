"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";
import { addToCart } from "@/lib/actions/cart";
import { METAL_MATERIALS } from "@/lib/jewelry-materials";
import { Button } from "@/components/ui/button";
import type { MetalType } from "@/generated/prisma/enums";

type Variant = {
  id: string;
  metalType: string;
  purity: string;
  size: string | null;
  price: unknown;
  compareAtPrice: unknown;
  stockQuantity: number;
};

export function VariantSelector({
  variants,
  onMetalChange,
}: {
  variants: Variant[];
  onMetalChange?: (metal: string) => void;
}) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const metals = useMemo(() => [...new Set(variants.map((v) => v.metalType))], [variants]);
  const [metal, setMetal] = useState(metals[0]);

  const purities = useMemo(
    () => [...new Set(variants.filter((v) => v.metalType === metal).map((v) => v.purity))],
    [variants, metal],
  );
  const [purity, setPurity] = useState(purities[0]);

  const sizes = useMemo(
    () => [
      ...new Set(
        variants
          .filter((v) => v.metalType === metal && v.purity === purity)
          .map((v) => v.size)
          .filter((s): s is string => Boolean(s)),
      ),
    ],
    [variants, metal, purity],
  );
  const [size, setSize] = useState(sizes[0]);

  useEffect(() => {
    if (metal) onMetalChange?.(metal);
  }, [metal, onMetalChange]);

  const selectedVariant = variants.find(
    (v) => v.metalType === metal && v.purity === purity && v.size === size,
  );

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant?.id]);

  function handleMetalChange(value: string) {
    setMetal(value);
    const nextPurities = [...new Set(variants.filter((v) => v.metalType === value).map((v) => v.purity))];
    setPurity(nextPurities[0]);
    const nextSizes = [
      ...new Set(
        variants
          .filter((v) => v.metalType === value && v.purity === nextPurities[0])
          .map((v) => v.size)
          .filter((s): s is string => Boolean(s)),
      ),
    ];
    setSize(nextSizes[0]);
  }

  async function handleAddToCart() {
    if (!selectedVariant) return;
    setIsAdding(true);
    const result = await addToCart(selectedVariant.id, quantity);
    setIsAdding(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Added to bag.");
    router.refresh();
  }

  async function handleBuyNow() {
    if (!selectedVariant) return;
    setIsAdding(true);
    const result = await addToCart(selectedVariant.id, quantity);
    setIsAdding(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.push("/checkout");
  }

  function handlePurityChange(value: string) {
    setPurity(value);
    const nextSizes = [
      ...new Set(
        variants
          .filter((v) => v.metalType === metal && v.purity === value)
          .map((v) => v.size)
          .filter((s): s is string => Boolean(s)),
      ),
    ];
    setSize(nextSizes[0]);
  }

  return (
    <div className="space-y-6">
      {metals.length > 1 && (
        <div>
          <p className="mb-2.5 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Metal — {METAL_MATERIALS[metal as MetalType]?.label}
          </p>
          <div className="flex gap-3">
            {metals.map((option) => (
              <button
                key={option}
                type="button"
                aria-label={METAL_MATERIALS[option as MetalType]?.label ?? option}
                onClick={() => handleMetalChange(option)}
                className={`size-9 rounded-full border transition-all ${
                  metal === option ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                }`}
                style={{ backgroundColor: METAL_MATERIALS[option as MetalType]?.color }}
              />
            ))}
          </div>
        </div>
      )}
      {purities.length > 1 && (
        <OptionGroup label="Purity" value={purity} options={purities} onChange={handlePurityChange} />
      )}
      {sizes.length > 1 && <OptionGroup label="Size" value={size} options={sizes} onChange={setSize} />}

      {selectedVariant ? (
        <div className="space-y-4">
          <div className="flex items-baseline gap-3">
            <p className="font-display text-3xl">{formatINR(Number(selectedVariant.price))}</p>
            {Boolean(selectedVariant.compareAtPrice) && (
              <p className="text-sm text-muted-foreground line-through">
                {formatINR(Number(selectedVariant.compareAtPrice))}
              </p>
            )}
          </div>
          <p className="text-xs tracking-[0.1em] text-muted-foreground uppercase">
            {selectedVariant.stockQuantity > 0
              ? `${selectedVariant.stockQuantity} in stock`
              : "Out of stock"}
          </p>

          <div className="flex items-center gap-4">
            <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Qty</p>
            <div className="flex items-center border border-border">
              <button
                type="button"
                className="px-3 py-1.5 text-sm"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="px-3 text-sm">{quantity}</span>
              <button
                type="button"
                className="px-3 py-1.5 text-sm"
                disabled={quantity >= selectedVariant.stockQuantity}
                onClick={() => setQuantity((q) => Math.min(selectedVariant.stockQuantity, q + 1))}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-none"
              disabled={isAdding || selectedVariant.stockQuantity === 0}
              onClick={handleAddToCart}
            >
              {selectedVariant.stockQuantity === 0 ? "Out of stock" : "Add to Bag"}
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-none"
              disabled={isAdding || selectedVariant.stockQuantity === 0}
              onClick={handleBuyNow}
            >
              {isAdding ? "Please wait..." : "Buy Now"}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">This combination is unavailable.</p>
      )}
    </div>
  );
}

function OptionGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | undefined;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2.5 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`border px-3.5 py-1.5 text-xs tracking-wide uppercase transition-colors ${
              value === option ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"
            }`}
          >
            {option.replace(/_/g, " ")}
          </button>
        ))}
      </div>
    </div>
  );
}
