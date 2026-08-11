export function formatINR(value: number | string) {
  const amount = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getMinVariantPrice(variants: { price: unknown; stockQuantity: number }[]) {
  if (variants.length === 0) return null;
  const prices = variants.map((v) => Number(v.price));
  return Math.min(...prices);
}

export function isInStock(variants: { stockQuantity: number }[]) {
  return variants.some((v) => v.stockQuantity > 0);
}
