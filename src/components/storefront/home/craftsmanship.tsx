import Image from "next/image";
import { Reveal, RevealGroup, RevealItem } from "@/components/storefront/reveal";

const STEPS = ["Design", "Craft", "Stone", "Finish", "Forever"];

export function Craftsmanship() {
  return (
    <section className="relative overflow-hidden bg-foreground py-28 text-background">
      <div className="absolute inset-0 opacity-30">
        <Image
          src="https://picsum.photos/seed/aurelia-craftsmanship/1800/1000"
          alt="Goldsmith at work"
          fill
          className="object-cover"
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <p className="mb-4 text-xs tracking-[0.3em] text-background/60 uppercase">Craftsmanship</p>
          <h2 className="font-display text-4xl leading-tight sm:text-5xl">
            Crafted by hand.
            <br />
            Designed to last.
          </h2>
        </Reveal>

        <RevealGroup className="mt-16 flex flex-wrap items-center justify-center gap-x-3 gap-y-4">
          {STEPS.map((step, index) => (
            <RevealItem key={step} className="flex items-center gap-3">
              <span className="text-sm tracking-[0.25em] uppercase">{step}</span>
              {index < STEPS.length - 1 && <span className="text-background/40">—</span>}
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.15}>
          <p className="mx-auto mt-16 max-w-lg text-sm leading-relaxed text-background/70">
            Every piece passes through the hands of a single goldsmith from first sketch to final
            polish — not a factory line, a craft, checked against the original design at every
            stage.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
