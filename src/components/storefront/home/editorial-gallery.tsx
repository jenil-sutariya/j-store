import Image from "next/image";
import { Reveal } from "@/components/storefront/reveal";

const IMAGES = [
  { src: "https://picsum.photos/seed/aurelia-gallery-1/1800/1000", span: "full", aspect: "aspect-[16/9]" },
  { src: "https://picsum.photos/seed/aurelia-gallery-2/900/1200", span: "half", aspect: "aspect-[3/4]" },
  { src: "https://picsum.photos/seed/aurelia-gallery-3/900/1200", span: "half", aspect: "aspect-[3/4]" },
  { src: "https://picsum.photos/seed/aurelia-gallery-4/1800/1100", span: "full", aspect: "aspect-[16/10]" },
];

export function EditorialGallery() {
  return (
    <section className="mx-auto max-w-7xl space-y-6 px-6 py-28">
      <Reveal>
        <p className="mb-16 text-center text-xs tracking-[0.3em] text-muted-foreground uppercase">
          In the Atelier
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {IMAGES.map((image, index) => (
          <Reveal
            key={image.src}
            delay={index * 0.05}
            className={image.span === "full" ? "sm:col-span-2" : ""}
          >
            <div className={`relative overflow-hidden bg-muted ${image.aspect}`}>
              <Image src={image.src} alt="" fill className="object-cover" />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
