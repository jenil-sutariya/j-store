import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/storefront/reveal";
import { getSiteContent } from "@/lib/queries/content";

const DEFAULT_IMAGE_URL = "https://picsum.photos/seed/aurelia-atelier/1600/800";
const DEFAULT_TITLE = "Our Story";
const DEFAULT_BODY =
  "Aurelia started with a simple idea: jewellery you actually reach for every day shouldn't mean compromising on craft. Every piece we make is designed first for wear — balanced weight, settings that hold up to daily life, and metals we're proud to stand behind.\n\nWe work with a small circle of goldsmiths and setters, mostly based out of Mumbai and Jaipur, who've spent decades perfecting hand-finishing techniques that get lost in mass production. Every gemstone is checked, every setting is tested, before it ever reaches you.";

export default async function AboutPage() {
  const content = await getSiteContent("about_page");

  const imageUrl = content?.imageUrl ?? DEFAULT_IMAGE_URL;
  const title = content?.title ?? DEFAULT_TITLE;
  const body = content?.body ?? DEFAULT_BODY;
  const paragraphs = body.split("\n\n");

  return (
    <div>
      <section className="relative h-72 w-full overflow-hidden sm:h-96">
        <Image
          src={imageUrl}
          alt="Aurelia atelier"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 px-4 text-center">
          <p className="mb-3 text-xs tracking-[0.3em] text-white/80 uppercase">Aurelia</p>
          <h1 className="font-display text-4xl text-white sm:text-5xl">{title}</h1>
        </div>
      </section>

      <div className="mx-auto max-w-2xl space-y-8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 text-sm leading-relaxed text-muted-foreground">
        {paragraphs.map((paragraph, index) => (
          <Reveal key={index} delay={index * 0.05}>
            <p>{paragraph}</p>
          </Reveal>
        ))}
        <Reveal delay={0.1}>
          <p>
            We&apos;re a small team, and we read every message that comes through{" "}
            <Link href="/contact" data-cursor-hover className="link-underline pb-0.5">
              our contact page
            </Link>
            . If something about your order isn&apos;t right, tell us — we&apos;ll make it right.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
