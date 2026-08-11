"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A subtle desktop-only cursor dot that grows slightly over interactive
 * elements. No-ops on touch devices. Deliberately small — this is meant to
 * feel like a refinement, not a gimmick.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    setEnabled(isFinePointer);
    if (!isFinePointer) return;

    function handleMove(event: PointerEvent) {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      }
    }

    function handleOver(event: PointerEvent) {
      const target = event.target as HTMLElement;
      setHovering(Boolean(target.closest("a, button, [data-cursor-hover]")));
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerover", handleOver);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerover", handleOver);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[100] -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
    >
      <div
        className="rounded-full bg-white transition-[width,height] duration-200 ease-out"
        style={{ width: hovering ? 28 : 8, height: hovering ? 28 : 8 }}
      />
    </div>
  );
}
