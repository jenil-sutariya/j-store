import Image from "next/image";
import { Reveal } from "@/components/storefront/reveal";

const MATERIALS = [
  {
    name: "18K Gold",
    copy: "Warm, enduring and unmistakably timeless.",
    image: "https://picsum.photos/seed/aurelia-material-gold/900/1100",
  },
  {
    name: "Diamonds",
    copy: "Cut to capture light from every angle.",
    image: "https://picsum.photos/seed/aurelia-material-diamond/900/1100",
  },
];

export function MaterialStory() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <Reveal>
        <p className="mb-16 text-center text-xs tracking-[0.3em] text-muted-foreground uppercase">
          Materials
        </p>
      </Reveal>
      <div className="grid gap-10 sm:grid-cols-2 sm:gap-16">
        {MATERIALS.map((material, index) => (
          <Reveal key={material.name} delay={index * 0.1}>
            <div className="relative mb-6 aspect-[3/4] overflow-hidden">
              <Image src={material.image} alt={material.name} fill className="object-cover" />
            </div>
            <h3 className="font-display text-2xl">{material.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{material.copy}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
