import Link from "next/link";
import Image from "next/image";
import { ArrowLink } from "@/components/storefront/editorial/arrow-link";
import { Reveal } from "@/components/storefront/reveal";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

const LAYOUT = [
  { col: "md:col-span-7", aspect: "aspect-[4/5]" },
  { col: "md:col-span-5", aspect: "aspect-[4/5]" },
  { col: "md:col-span-4", aspect: "aspect-square" },
  { col: "md:col-span-4", aspect: "aspect-square" },
  { col: "md:col-span-4", aspect: "aspect-square" },
];

export function CollectionComposition({ categories }: { categories: Category[] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <Reveal>
        <p className="mb-3 text-xs tracking-[0.3em] text-muted-foreground uppercase">Shop by Category</p>
        <h2 className="mb-16 font-display text-4xl sm:text-5xl">The Collection</h2>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {categories.slice(0, 5).map((category, index) => {
          const layout = LAYOUT[index] ?? LAYOUT[LAYOUT.length - 1];
          return (
            <Reveal key={category.id} delay={index * 0.05} className={layout.col}>
              <Link
                href={`/categories/${category.slug}`}
                data-cursor-hover
                className={`group relative block ${layout.aspect} overflow-hidden bg-muted`}
              >
                {category.imageUrl && (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-black/10 transition-colors duration-500 group-hover:bg-black/25" />
                <div className="absolute inset-0 flex flex-col items-start justify-end p-6">
                  <h3 className="font-display text-2xl text-white sm:text-3xl">{category.name}</h3>
                  {category.description && (
                    <p className="mt-1 max-w-xs text-xs text-white/75">{category.description}</p>
                  )}
                  <span className="mt-4 text-[10px] tracking-[0.2em] text-white uppercase opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Explore →
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <ArrowLink href="/products">View all jewellery</ArrowLink>
      </div>
    </section>
  );
}
