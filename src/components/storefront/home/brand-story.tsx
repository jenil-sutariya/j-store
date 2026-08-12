import { Reveal } from "@/components/storefront/reveal";

export function BrandStory({
  kicker = "Why We Create",
  heading = "We believe jewellery\nis more than\nan accessory.",
  body = "It's the thing you reach for without thinking, the piece that outlasts the outfit it was bought for. We make jewellery for people who wear it until it becomes part of how they're recognised — not for a single photograph.",
}: {
  kicker?: string;
  heading?: string;
  body?: string;
}) {
  const lines = heading.split("\n");

  return (
    <section className="mx-auto max-w-3xl px-6 py-28 text-center">
      <Reveal>
        <p className="mb-6 text-xs tracking-[0.3em] text-muted-foreground uppercase">{kicker}</p>
        <h2 className="font-display text-4xl leading-[1.15] sm:text-5xl">
          {lines.length > 1
            ? lines.map((line, index) => (
                <span key={index}>
                  {line}
                  {index < lines.length - 1 && <br />}
                </span>
              ))
            : heading}
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="mx-auto mt-8 max-w-lg text-sm leading-relaxed text-muted-foreground">
          {body}
        </p>
      </Reveal>
    </section>
  );
}
