"use client";

import dynamic from "next/dynamic";
import type { RefObject } from "react";

const JewelryScene = dynamic(() => import("./jewelry-scene"), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

export function JewelryHero({
  scrollProgressRef,
}: {
  scrollProgressRef?: RefObject<number>;
}) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <JewelryScene scrollProgressRef={scrollProgressRef} />
    </div>
  );
}
