"use client";

import { useEffect, useState } from "react";

export type WebglSupport = "checking" | "supported" | "unsupported";

/**
 * Detects whether WebGL is available and whether the device looks
 * low-powered enough that we should skip the 3D viewer and fall back to the
 * static image gallery instead.
 */
export function useWebglSupport(): WebglSupport {
  const [status, setStatus] = useState<WebglSupport>("checking");

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const context =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");

      const prefersReducedData =
        "connection" in navigator &&
        // @ts-expect-error -- saveData is non-standard but widely supported
        Boolean(navigator.connection?.saveData);

      const lowPowerDevice =
        typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 2;

      setStatus(context && !prefersReducedData && !lowPowerDevice ? "supported" : "unsupported");
    } catch {
      setStatus("unsupported");
    }
  }, []);

  return status;
}
