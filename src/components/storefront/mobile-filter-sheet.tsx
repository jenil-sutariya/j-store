"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ProductFilters } from "@/components/storefront/product-filters";

export function MobileFilterSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="mb-6 md:hidden">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Filter &amp; Sort
        </Button>
      </div>
      <SheetContent side="left" className="w-full sm:max-w-xs">
        <SheetHeader className="sr-only">
          <SheetTitle>Filter products</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 pt-6">
          <ProductFilters />
        </div>
        <SheetFooter className="border-t border-border">
          <Button onClick={() => setOpen(false)}>Show results</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
