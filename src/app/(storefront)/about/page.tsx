import Image from "next/image";
import { Reveal } from "@/components/storefront/reveal";

export default function AboutPage() {
  return (
    <div>
      <section className="relative h-72 w-full overflow-hidden sm:h-96">
        <Image
          src="https://picsum.photos/seed/aurelia-atelier/1600/800"
          alt="Aurelia atelier"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Our story</h1>
        </div>
      </section>

      <div className="mx-auto max-w-2xl space-y-8 px-6 py-16 text-sm leading-relaxed text-muted-foreground">
        <Reveal>
          <p>
            Aurelia started with a simple idea: jewellery you actually reach for every day
            shouldn&apos;t mean compromising on craft. Every piece we make is designed first for
            wear — balanced weight, settings that hold up to daily life, and metals we&apos;re
            proud to stand behind.
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <p>
            We work with a small circle of goldsmiths and setters, mostly based out of Mumbai and
            Jaipur, who&apos;ve spent decades perfecting hand-finishing techniques that get lost in
            mass production. Every gemstone is checked, every setting is tested, before it ever
            reaches you.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <p>
            We&apos;re a small team, and we read every message that comes through{" "}
            <a href="/contact" className="underline">
              our contact page
            </a>
            . If something about your order isn&apos;t right, tell us — we&apos;ll make it right.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
