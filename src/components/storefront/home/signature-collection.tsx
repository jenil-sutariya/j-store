import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/storefront/reveal";

type Collection = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  bannerUrl: string | null;
};

export function SignatureCollection({ collection }: { collection: Collection }) {
  return (
    <section className="relative h-[85vh] w-full overflow-hidden bg-foreground">
      {collection.bannerUrl && (
        <Image
          src={collection.bannerUrl}
          alt={collection.name}
          fill
          className="object-cover opacity-70"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <Reveal>
          <p className="mb-4 text-xs tracking-[0.3em] text-white/70 uppercase">The Signature Collection</p>
          <h2 className="font-display text-5xl text-white sm:text-7xl">{collection.name}</h2>
          {collection.tagline && (
            <p className="mx-auto mt-6 max-w-md text-sm text-white/80">{collection.tagline}</p>
          )}
          <div className="mt-10">
            <Link
              href={`/collections/${collection.slug}`}
              data-cursor-hover
              className="inline-flex items-center gap-2 text-xs tracking-[0.2em] text-white uppercase"
            >
              <span className="link-underline pb-0.5">Discover the collection</span>
              <span>→</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
