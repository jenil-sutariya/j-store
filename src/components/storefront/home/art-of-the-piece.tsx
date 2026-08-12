import Image from "next/image";
import { Reveal } from "@/components/storefront/reveal";

export function ArtOfThePiece({
  kicker = "The Art of the Piece",
  heading = "Some pieces are worn.\nSome become part of you.",
  body = "We don't design for a moment — we design for the years after it. Every curve of metal, every angle of a cut stone, is considered for how it will feel a decade from now, not just how it photographs today.",
  imageUrl = "https://picsum.photos/seed/aurelia-art-of-piece/1000/1250",
}: {
  kicker?: string;
  heading?: string;
  body?: string;
  imageUrl?: string;
}) {
  const lines = heading.split("\n");

  return (
    <section id="story" className="mx-auto grid max-w-7xl gap-10 px-6 py-28 md:grid-cols-2 md:items-center md:gap-16">
      <Reveal>
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={imageUrl}
            alt="Close detail of a hand-finished jewellery piece"
            fill
            className="object-cover"
          />
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <p className="mb-6 text-xs tracking-[0.3em] text-muted-foreground uppercase">{kicker}</p>
        <h2 className="font-display text-4xl leading-[1.05] sm:text-5xl">
          {lines.length > 1
            ? lines.map((line, index) => (
                <span key={index}>
                  {line}
                  {index < lines.length - 1 && <br />}
                </span>
              ))
            : heading}
        </h2>
        <p className="mt-8 max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p>
      </Reveal>
    </section>
  );
}
