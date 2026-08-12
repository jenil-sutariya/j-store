import {
  getFeaturedProducts,
  getFeaturedCollections,
  getTestimonials,
  getTopCategoriesForNav,
} from "@/lib/queries/storefront";
import { getSiteContentMap } from "@/lib/queries/content";
import { Hero } from "@/components/storefront/home/hero";
import { ArtOfThePiece } from "@/components/storefront/home/art-of-the-piece";
import { CollectionComposition } from "@/components/storefront/home/collection-composition";
import { SignatureCollection } from "@/components/storefront/home/signature-collection";
import { ProductShowcase } from "@/components/storefront/home/product-showcase";
import { Craftsmanship } from "@/components/storefront/home/craftsmanship";
import { MaterialStory } from "@/components/storefront/home/material-story";
import { EditorialGallery } from "@/components/storefront/home/editorial-gallery";
import { BrandStory } from "@/components/storefront/home/brand-story";
import { Testimonials } from "@/components/storefront/home/testimonials";

const HOME_CONTENT_KEYS = [
  "home_hero",
  "home_art_of_piece",
  "home_craftsmanship",
  "home_material_1",
  "home_material_2",
  "home_gallery_1",
  "home_gallery_2",
  "home_gallery_3",
  "home_gallery_4",
  "home_brand_story",
];

export default async function HomePage() {
  const [featuredProducts, featuredCollections, testimonials, categories, content] =
    await Promise.all([
      getFeaturedProducts(6),
      getFeaturedCollections(1),
      getTestimonials(3),
      getTopCategoriesForNav(),
      getSiteContentMap(HOME_CONTENT_KEYS),
    ]);

  const signatureCollection = featuredCollections[0];

  const hero = content.home_hero;
  const artOfPiece = content.home_art_of_piece;
  const craftsmanship = content.home_craftsmanship;
  const material1 = content.home_material_1;
  const material2 = content.home_material_2;
  const brandStory = content.home_brand_story;

  const materials =
    material1 && material2
      ? [
          { name: material1.title ?? "", copy: material1.body ?? "", image: material1.imageUrl ?? "" },
          { name: material2.title ?? "", copy: material2.body ?? "", image: material2.imageUrl ?? "" },
        ]
      : undefined;

  const galleryKeys = ["home_gallery_1", "home_gallery_2", "home_gallery_3", "home_gallery_4"];
  const galleryImageUrls = galleryKeys.every((key) => content[key]?.imageUrl)
    ? galleryKeys.map((key) => content[key].imageUrl as string)
    : undefined;

  return (
    <div>
      <Hero
        kicker={hero?.tagline ?? undefined}
        headline={hero?.title ?? undefined}
        subtext={hero?.body ?? undefined}
        ctaLabel={hero?.linkLabel ?? undefined}
        ctaHref={hero?.linkHref ?? undefined}
      />
      <ArtOfThePiece
        kicker={artOfPiece?.tagline ?? undefined}
        heading={artOfPiece?.title ?? undefined}
        body={artOfPiece?.body ?? undefined}
        imageUrl={artOfPiece?.imageUrl ?? undefined}
      />
      {categories.length > 0 && <CollectionComposition categories={categories} />}
      {signatureCollection?.bannerUrl && <SignatureCollection collection={signatureCollection} />}
      {featuredProducts.length > 0 && <ProductShowcase products={featuredProducts} />}
      <Craftsmanship
        kicker={craftsmanship?.tagline ?? undefined}
        heading={craftsmanship?.title ?? undefined}
        body={craftsmanship?.body ?? undefined}
        imageUrl={craftsmanship?.imageUrl ?? undefined}
      />
      <MaterialStory materials={materials} />
      <EditorialGallery imageUrls={galleryImageUrls} />
      <BrandStory
        kicker={brandStory?.tagline ?? undefined}
        heading={brandStory?.title ?? undefined}
        body={brandStory?.body ?? undefined}
      />
      <Testimonials testimonials={testimonials} />
    </div>
  );
}
