import Image from "next/image";
import { Reveal } from "@/components/storefront/reveal";

const LAYOUT = [
  { span: "full", aspect: "aspect-[16/9]" },
  { span: "half", aspect: "aspect-[3/4]" },
  { span: "half", aspect: "aspect-[3/4]" },
  { span: "full", aspect: "aspect-[16/10]" },
];

const DEFAULT_IMAGE_URLS = [
  "https://picsum.photos/seed/aurelia-gallery-1/1800/1000",
  "https://picsum.photos/seed/aurelia-gallery-2/900/1200",
  "https://picsum.photos/seed/aurelia-gallery-3/900/1200",
  "https://picsum.photos/seed/aurelia-gallery-4/1800/1100",
];

export function EditorialGallery({
  imageUrls = DEFAULT_IMAGE_URLS,
}: {
  imageUrls?: string[];
}) {
  const images = LAYOUT.map((layout, index) => ({
    ...layout,
    src: imageUrls[index] ?? DEFAULT_IMAGE_URLS[index],
  }));

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-6 py-28">
      <Reveal>
        <p className="mb-16 text-center text-xs tracking-[0.3em] text-muted-foreground uppercase">
          In the Atelier
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {images.map((image, index) => (
          <Reveal
            key={index}
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
