import { Reveal, RevealGroup, RevealItem } from "@/components/storefront/reveal";

type Testimonial = {
  id: string;
  rating: number;
  comment: string | null;
  user: { name: string | null };
  product: { name: string };
};

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      <Reveal>
        <p className="mb-16 text-center text-xs tracking-[0.3em] text-muted-foreground uppercase">
          Loved by Our Customers
        </p>
      </Reveal>
      <RevealGroup className="grid gap-12 sm:grid-cols-3">
        {testimonials.map((review) => (
          <RevealItem key={review.id} className="text-center">
            <p className="text-xs tracking-[0.2em] text-muted-foreground">
              {"★".repeat(review.rating)}
            </p>
            <p className="font-display mt-4 text-lg leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
            <p className="mt-4 text-xs tracking-[0.1em] text-muted-foreground uppercase">
              {review.user.name ?? "Verified buyer"} · {review.product.name}
            </p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
