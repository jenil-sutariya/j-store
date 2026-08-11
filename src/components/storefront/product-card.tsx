import Link from "next/link";
import Image from "next/image";
import { formatINR, getMinVariantPrice, isInStock } from "@/lib/format";

type CardProduct = {
  id: string;
  name: string;
  slug: string;
  basePrice: unknown;
  images: { url: string; altText: string | null }[];
  variants: { price: unknown; stockQuantity: number }[];
  categories: { category: { name: string } }[];
};

export function ProductCard({ product }: { product: CardProduct }) {
  const minPrice = getMinVariantPrice(product.variants) ?? Number(product.basePrice);
  const inStock = isInStock(product.variants);
  const image = product.images[0];
  const categoryName = product.categories[0]?.category.name;

  return (
    <Link href={`/products/${product.slug}`} data-cursor-hover className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
        {!inStock && (
          <span className="absolute top-3 left-3 border border-primary/40 bg-background/90 px-2 py-0.5 text-[10px] tracking-[0.15em] text-primary uppercase">
            Sold out
          </span>
        )}
      </div>
      <div className="mt-4 space-y-1">
        {categoryName && (
          <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">{categoryName}</p>
        )}
        <h3 className="font-display text-lg">{product.name}</h3>
        <p className="text-xs text-muted-foreground">From {formatINR(minPrice)}</p>
      </div>
    </Link>
  );
}
