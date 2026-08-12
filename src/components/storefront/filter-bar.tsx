"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Gender, MetalType, Purity, Gemstone, Occasion } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

const FACETS = [
  { key: "gender", label: "Gender", options: Object.values(Gender) },
  { key: "metal", label: "Metal", options: Object.values(MetalType) },
  { key: "purity", label: "Purity", options: Object.values(Purity) },
  { key: "gemstone", label: "Gemstone", options: Object.values(Gemstone) },
  { key: "occasion", label: "Occasion", options: Object.values(Occasion) },
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name_asc", label: "Name: A-Z" },
];

function formatOption(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

function pillClasses(active: boolean) {
  return cn(
    "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] tracking-[0.1em] whitespace-nowrap uppercase transition-colors",
    active
      ? "border-primary/50 bg-primary/10 text-primary"
      : "border-border text-foreground hover:border-primary/40 hover:text-primary",
  );
}

export function FilterBar({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [priceOpen, setPriceOpen] = useState(false);

  function updateParams(mutator: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutator(params);
    params.delete("page");
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  }

  function toggleFacet(key: string, value: string) {
    updateParams((params) => {
      const current = params.get(key)?.split(",").filter(Boolean) ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (next.length > 0) params.set(key, next.join(","));
      else params.delete(key);
    });
  }

  function applyPriceRange() {
    updateParams((params) => {
      if (minPrice) params.set("minPrice", minPrice);
      else params.delete("minPrice");
      if (maxPrice) params.set("maxPrice", maxPrice);
      else params.delete("maxPrice");
    });
    setPriceOpen(false);
  }

  function clearPriceRange() {
    setMinPrice("");
    setMaxPrice("");
    updateParams((params) => {
      params.delete("minPrice");
      params.delete("maxPrice");
    });
  }

  function clearAll() {
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname, { scroll: false });
  }

  const activeSort = searchParams.get("sort") ?? "newest";
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const hasPrice = Boolean(minPriceParam || maxPriceParam);

  const activeChips: { key: string; value: string; label: string }[] = [];
  FACETS.forEach((facet) => {
    const selected = searchParams.get(facet.key)?.split(",").filter(Boolean) ?? [];
    selected.forEach((value) => activeChips.push({ key: facet.key, value, label: formatOption(value) }));
  });
  if (hasPrice) {
    activeChips.push({
      key: "price",
      value: "price",
      label: `₹${minPriceParam ?? "0"} – ${maxPriceParam ?? "∞"}`,
    });
  }

  return (
    <div className="mb-10">
      <div className="flex flex-col gap-3 border-y border-border py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6 sm:gap-y-3">
        <div className="no-scrollbar -mx-4 flex min-w-0 items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-1 sm:px-0">
          <span className="mr-1 hidden shrink-0 items-center gap-1.5 text-[10px] tracking-[0.2em] text-muted-foreground uppercase sm:flex">
            <SlidersHorizontal className="size-3" aria-hidden />
            Filter
          </span>

          {FACETS.map((facet) => {
            const selected = searchParams.get(facet.key)?.split(",").filter(Boolean) ?? [];
            return (
              <DropdownMenu key={facet.key}>
                <DropdownMenuTrigger className={pillClasses(selected.length > 0)}>
                  {facet.label}
                  {selected.length > 0 && (
                    <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-primary-foreground">
                      {selected.length}
                    </span>
                  )}
                  <ChevronDown className="size-3 opacity-60" aria-hidden />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-48">
                  <p className="px-1.5 py-1 text-xs tracking-[0.1em] text-muted-foreground uppercase">
                    {facet.label}
                  </p>
                  <DropdownMenuSeparator />
                  {facet.options.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option}
                      checked={selected.includes(option)}
                      onCheckedChange={() => toggleFacet(facet.key, option)}
                      closeOnClick={false}
                    >
                      {formatOption(option)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}

          <DropdownMenu open={priceOpen} onOpenChange={setPriceOpen}>
            <DropdownMenuTrigger className={pillClasses(hasPrice)}>
              Price
              <ChevronDown className="size-3 opacity-60" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 p-4">
              <p className="mb-3 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Price range (₹)</p>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  placeholder="Max"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              <Button type="button" size="sm" className="mt-3 w-full" onClick={applyPriceRange}>
                Apply
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-end gap-5 sm:shrink-0">
          {activeChips.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="link-underline pb-0.5 text-[10px] tracking-[0.15em] text-muted-foreground uppercase"
            >
              Clear all
            </button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              data-cursor-hover
              className="link-underline flex items-center gap-1.5 pb-0.5 text-[11px] tracking-[0.15em] uppercase"
            >
              Sort: {SORT_OPTIONS.find((o) => o.value === activeSort)?.label ?? "Newest"}
              <ChevronDown className="size-3 opacity-60" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={activeSort}
                onValueChange={(value) => updateParams((params) => params.set("sort", String(value)))}
              >
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="text-xs tracking-[0.15em] text-muted-foreground uppercase">
          {resultCount} {resultCount === 1 ? "piece" : "pieces"}
        </p>
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <button
                key={`${chip.key}-${chip.value}`}
                type="button"
                onClick={() => (chip.key === "price" ? clearPriceRange() : toggleFacet(chip.key, chip.value))}
                className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[10px] tracking-[0.05em] text-muted-foreground uppercase transition-colors hover:border-primary/40 hover:text-primary"
              >
                {chip.label}
                <X className="size-3" aria-hidden />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
