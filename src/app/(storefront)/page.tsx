import {
  getFeaturedProducts,
  getFeaturedCollections,
  getTestimonials,
  getTopCategoriesForNav,
} from "@/lib/queries/storefront";
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

export default async function HomePage() {
  const [featuredProducts, featuredCollections, testimonials, categories] = await Promise.all([
    getFeaturedProducts(6),
    getFeaturedCollections(1),
    getTestimonials(3),
    getTopCategoriesForNav(),
  ]);

  const signatureCollection = featuredCollections[0];

  return (
    <div>
      <Hero />
      <ArtOfThePiece />
      {categories.length > 0 && <CollectionComposition categories={categories} />}
      {signatureCollection?.bannerUrl && <SignatureCollection collection={signatureCollection} />}
      {featuredProducts.length > 0 && <ProductShowcase products={featuredProducts} />}
      <Craftsmanship />
      <MaterialStory />
      <EditorialGallery />
      <BrandStory />
      <Testimonials testimonials={testimonials} />
    </div>
  );
}
