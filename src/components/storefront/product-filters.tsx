"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Gender, MetalType, Purity, Gemstone, Occasion } from "@/generated/prisma/enums";

const FACETS: { key: string; label: string; options: readonly string[] }[] = [
  { key: "gender", label: "Gender", options: Object.values(Gender) },
  { key: "metal", label: "Metal", options: Object.values(MetalType) },
  { key: "purity", label: "Purity", options: Object.values(Purity) },
  { key: "gemstone", label: "Gemstone", options: Object.values(Gemstone) },
  { key: "occasion", label: "Occasion", options: Object.values(Occasion) },
];

export function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  function updateParams(mutator: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutator(params);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleFacet(key: string, value: string) {
    updateParams((params) => {
      const current = params.get(key)?.split(",").filter(Boolean) ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (next.length > 0) {
        params.set(key, next.join(","));
      } else {
        params.delete(key);
      }
    });
  }

  function applyPriceRange() {
    updateParams((params) => {
      if (minPrice) params.set("minPrice", minPrice);
      else params.delete("minPrice");
      if (maxPrice) params.set("maxPrice", maxPrice);
      else params.delete("maxPrice");
    });
  }

  function clearAll() {
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname);
  }

  return (
    <div className="space-y-8 text-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs tracking-[0.2em] uppercase">Filter</p>
        <button onClick={clearAll} className="text-[10px] tracking-[0.15em] text-muted-foreground uppercase link-underline">
          Clear all
        </button>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Sort by</Label>
        <Select
          value={searchParams.get("sort") ?? "newest"}
          onValueChange={(value) => updateParams((params) => params.set("sort", value ?? "newest"))}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price_asc">Price: low to high</SelectItem>
            <SelectItem value="price_desc">Price: high to low</SelectItem>
            <SelectItem value="name_asc">Name: A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Price range (₹)</Label>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Min"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <Input
            placeholder="Max"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <Button type="button" size="sm" variant="outline" onClick={applyPriceRange}>
          Apply
        </Button>
      </div>

      {FACETS.map((facet) => {
        const selected = searchParams.get(facet.key)?.split(",").filter(Boolean) ?? [];
        return (
          <div key={facet.key} className="space-y-2">
            <Label className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              {facet.label}
            </Label>
            <div className="space-y-1.5">
              {facet.options.map((option) => (
                <label key={option} className="flex items-center gap-2 text-xs">
                  <Checkbox
                    checked={selected.includes(option)}
                    onCheckedChange={() => toggleFacet(facet.key, option)}
                  />
                  {option.replace(/_/g, " ")}
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
