import Image from "next/image";
import Link from "next/link";
import { formatINR, getMinVariantPrice } from "@/lib/format";
import { Reveal } from "@/components/storefront/reveal";

type ShowcaseProduct = {
  id: string;
  name: string;
  slug: string;
  basePrice: unknown;
  images: { url: string; altText: string | null }[];
  variants: { price: unknown; stockQuantity: number; metalType: string; purity: string }[];
  gemstones: string[];
};

function metalLabel(purity: string, metalType: string) {
  const metal = metalType.replace(/_/g, " ").toLowerCase();
  const purityLabel = purity.startsWith("K") ? `${purity.slice(1)}K` : purity;
  return `${purityLabel} ${metal}`;
}

export function ProductShowcase({ products }: { products: ShowcaseProduct[] }) {
  return (
    <section className="py-28">
      <div className="mx-auto mb-16 max-w-7xl px-6">
        <Reveal>
          <p className="mb-3 text-xs tracking-[0.3em] text-muted-foreground uppercase">Featured Pieces</p>
          <h2 className="font-display text-4xl sm:text-5xl">Just In</h2>
        </Reveal>
      </div>

      <div className="flex snap-x snap-mandatory gap-8 overflow-x-auto px-6 pb-4 md:px-[calc((100vw-80rem)/2+1.5rem)]">
        {products.map((product, index) => {
          const variant = product.variants[0];
          const gemstone = product.gemstones.find((g) => g !== "NONE");
          const price = getMinVariantPrice(product.variants) ?? Number(product.basePrice);
          const image = product.images[0];

          return (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              data-cursor-hover
              className="group w-[80vw] flex-shrink-0 snap-start sm:w-[420px]"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                {image && (
                  <Image
                    src={image.url}
                    alt={image.altText ?? product.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                )}
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="font-display mt-1 text-xl">{product.name}</h3>
                  <p className="mt-1 text-xs tracking-[0.1em] text-muted-foreground uppercase">
                    {variant && metalLabel(variant.purity, variant.metalType)}
                    {gemstone ? ` · ${gemstone.toLowerCase()}` : ""}
                  </p>
                </div>
                <p className="shrink-0 text-sm">{formatINR(price)}</p>
              </div>
              <span className="mt-3 inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase opacity-70 transition-opacity group-hover:opacity-100">
                View piece <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
