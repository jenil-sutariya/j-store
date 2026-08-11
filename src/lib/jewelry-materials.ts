import type { Gemstone, MetalType } from "@/generated/prisma/enums";

/**
 * Reusable PBR material presets, keyed by the same enums used in the product
 * schema. Swap the `color`/`metalness`/`roughness` values here to retune the
 * look across every product at once — never hardcode a material on a
 * per-product basis.
 */
export type MetalMaterialConfig = {
  label: string;
  color: string;
  metalness: number;
  roughness: number;
};

export const METAL_MATERIALS: Record<MetalType, MetalMaterialConfig> = {
  GOLD: { label: "Yellow Gold", color: "#d9b26a", metalness: 1, roughness: 0.22 },
  ROSE_GOLD: { label: "Rose Gold", color: "#e8c2b0", metalness: 1, roughness: 0.24 },
  WHITE_GOLD: { label: "White Gold", color: "#e9e7e2", metalness: 1, roughness: 0.2 },
  SILVER: { label: "Silver", color: "#d6d6d6", metalness: 1, roughness: 0.28 },
  PLATINUM: { label: "Platinum", color: "#dfe1e0", metalness: 1, roughness: 0.18 },
};

export type GemstoneMaterialConfig = {
  label: string;
  color: string;
  ior: number;
  transmission: number;
  roughness: number;
};

const GEM_DEFAULT: GemstoneMaterialConfig = {
  label: "Diamond",
  color: "#eaf6ff",
  ior: 2.4,
  transmission: 0.95,
  roughness: 0.02,
};

export const GEMSTONE_MATERIALS: Record<Gemstone, GemstoneMaterialConfig> = {
  DIAMOND: GEM_DEFAULT,
  RUBY: { label: "Ruby", color: "#9b1c3f", ior: 1.77, transmission: 0.55, roughness: 0.05 },
  SAPPHIRE: { label: "Sapphire", color: "#1c3f9b", ior: 1.76, transmission: 0.55, roughness: 0.05 },
  EMERALD: { label: "Emerald", color: "#1f6f54", ior: 1.58, transmission: 0.5, roughness: 0.06 },
  PEARL: { label: "Pearl", color: "#f3ece0", ior: 1.5, transmission: 0.1, roughness: 0.3 },
  CUBIC_ZIRCONIA: { label: "Cubic Zirconia", color: "#eef7ff", ior: 2.2, transmission: 0.9, roughness: 0.03 },
  KUNDAN: { label: "Kundan", color: "#f2d68a", ior: 1.5, transmission: 0.2, roughness: 0.15 },
  POLKI: { label: "Polki", color: "#f4ecd8", ior: 2.0, transmission: 0.7, roughness: 0.08 },
  NONE: GEM_DEFAULT,
};

/** Selectable gemstones for the visual-preview gemstone switcher (cosmetic only — doesn't affect price/stock). */
export const SELECTABLE_GEMSTONES: Gemstone[] = ["DIAMOND", "RUBY", "SAPPHIRE", "EMERALD"];

/** Mesh names (case-insensitive, partial match) the viewer looks for inside a GLB to apply metal/gemstone materials to. */
export const DEFAULT_METAL_MESH_MATCHES = ["metal", "band", "setting", "frame"];
export const DEFAULT_GEMSTONE_MESH_MATCHES = ["gem", "stone", "diamond", "crystal"];
