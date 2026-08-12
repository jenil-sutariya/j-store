import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { RevealGroup, RevealItem } from "@/components/storefront/reveal";

export default async function CollectionsPage() {
  const collections = await prisma.collection.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mb-16 text-center">
        <p className="mb-3 text-xs tracking-[0.3em] text-muted-foreground uppercase">Aurelia</p>
        <h1 className="font-display text-4xl sm:text-5xl">Collections</h1>
      </div>
      <RevealGroup className="grid gap-8 sm:grid-cols-2">
        {collections.map((collection) => (
          <RevealItem key={collection.id}>
            <Link
              href={`/collections/${collection.slug}`}
              data-cursor-hover
              className="group relative block aspect-[16/9] overflow-hidden bg-muted"
            >
              {collection.bannerUrl && (
                <Image
                  src={collection.bannerUrl}
                  alt={collection.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 flex flex-col items-start justify-end bg-gradient-to-t from-black/60 via-black/0 p-6">
                <p className="font-display text-2xl text-white">{collection.name}</p>
                {collection.tagline && <p className="text-sm text-white/80">{collection.tagline}</p>}
              </div>
            </Link>
          </RevealItem>
        ))}
        {collections.length === 0 && (
          <p className="text-muted-foreground">No collections yet.</p>
        )}
      </RevealGroup>
    </div>
  );
}
