import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function placeholderImage(seed: string, width = 800, height = 800) {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

async function main() {
  const adminEmail = "admin@admin.com";
  const adminPassword = "Admin@12345"; // change after first login

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Store Admin",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });
  console.log(`Admin user ready: ${admin.email} / ${adminPassword}`);

  // ---------------- Categories ----------------
  const categoryTree = [
    {
      name: "Rings",
      children: ["Engagement Rings", "Cocktail Rings", "Bands"],
    },
    {
      name: "Necklaces",
      children: ["Chokers", "Pendant Sets", "Chains"],
    },
    {
      name: "Earrings",
      children: ["Studs", "Jhumkas", "Hoops"],
    },
    { name: "Bangles", children: [] },
    { name: "Bracelets", children: [] },
    { name: "Mangalsutra", children: [] },
    { name: "Men's Jewellery", children: ["Men's Chains", "Men's Bracelets"] },
  ];

  const categoryBySlug = new Map<string, { id: string }>();

  for (const [index, top] of categoryTree.entries()) {
    const parent = await prisma.category.upsert({
      where: { slug: slugify(top.name) },
      update: {},
      create: {
        name: top.name,
        slug: slugify(top.name),
        sortOrder: index,
        imageUrl: placeholderImage(`cat-${slugify(top.name)}`, 600, 400),
      },
    });
    categoryBySlug.set(parent.slug, parent);

    for (const [childIndex, childName] of top.children.entries()) {
      const child = await prisma.category.upsert({
        where: { slug: slugify(childName) },
        update: {},
        create: {
          name: childName,
          slug: slugify(childName),
          parentId: parent.id,
          sortOrder: childIndex,
          imageUrl: placeholderImage(`cat-${slugify(childName)}`, 600, 400),
        },
      });
      categoryBySlug.set(child.slug, child);
    }
  }
  console.log(`Seeded ${categoryBySlug.size} categories.`);

  // ---------------- Collections ----------------
  const collections = [
    {
      name: "New Arrivals",
      tagline: "Fresh off the bench",
      isFeatured: true,
    },
    {
      name: "Bridal Edit",
      tagline: "For your big day",
      isFeatured: true,
    },
  ];

  const collectionBySlug = new Map<string, { id: string }>();
  for (const c of collections) {
    const collection = await prisma.collection.upsert({
      where: { slug: slugify(c.name) },
      update: {},
      create: {
        name: c.name,
        slug: slugify(c.name),
        tagline: c.tagline,
        isFeatured: c.isFeatured,
        bannerUrl: placeholderImage(`col-${slugify(c.name)}`, 1600, 600),
      },
    });
    collectionBySlug.set(collection.id, collection);
  }
  const collectionIds = [...collectionBySlug.keys()];
  console.log(`Seeded ${collectionIds.length} collections.`);

  // ---------------- Products ----------------
  type SeedProduct = {
    name: string;
    description: string;
    basePrice: number;
    gender: "MEN" | "WOMEN" | "KIDS" | "UNISEX";
    occasions: (
      | "BRIDAL"
      | "DAILY_WEAR"
      | "PARTY"
      | "FESTIVE"
      | "OFFICE"
      | "ENGAGEMENT"
      | "ANNIVERSARY"
      | "GIFTING"
    )[];
    gemstones: ("DIAMOND" | "RUBY" | "EMERALD" | "SAPPHIRE" | "PEARL" | "CUBIC_ZIRCONIA" | "KUNDAN" | "POLKI" | "NONE")[];
    styleTags: ("STUD" | "HOOP" | "JHUMKA" | "DROP" | "CHANDBALI" | "SOLITAIRE" | "COCKTAIL" | "BAND" | "CHAIN" | "PENDANT_SET" | "BANGLE" | "CUFF")[];
    categorySlugs: string[];
    inCollections?: boolean;
    variants: {
      metalType: "GOLD" | "ROSE_GOLD" | "WHITE_GOLD" | "SILVER" | "PLATINUM";
      purity: "K14" | "K18" | "K20" | "K22" | "K24" | "S925" | "PT950";
      size: string;
      weightGrams: number;
      priceAdjustment: number;
      stockQuantity: number;
    }[];
  };

  const products: SeedProduct[] = [
    {
      name: "Eternal Solitaire Ring",
      description: "A timeless solitaire ring crafted in 18K gold, designed to catch the light from every angle.",
      basePrice: 45000,
      gender: "WOMEN",
      occasions: ["ENGAGEMENT", "BRIDAL"],
      gemstones: ["DIAMOND"],
      styleTags: ["SOLITAIRE"],
      categorySlugs: ["rings", "engagement-rings"],
      inCollections: true,
      variants: [
        { metalType: "GOLD", purity: "K18", size: "12", weightGrams: 3.2, priceAdjustment: 0, stockQuantity: 5 },
        { metalType: "GOLD", purity: "K18", size: "14", weightGrams: 3.4, priceAdjustment: 500, stockQuantity: 4 },
        { metalType: "WHITE_GOLD", purity: "K18", size: "12", weightGrams: 3.3, priceAdjustment: 1200, stockQuantity: 3 },
      ],
    },
    {
      name: "Petal Cocktail Ring",
      description: "A bold floral-inspired cocktail ring in rose gold with cubic zirconia accents.",
      basePrice: 28000,
      gender: "WOMEN",
      occasions: ["PARTY", "FESTIVE"],
      gemstones: ["CUBIC_ZIRCONIA"],
      styleTags: ["COCKTAIL"],
      categorySlugs: ["rings", "cocktail-rings"],
      variants: [
        { metalType: "ROSE_GOLD", purity: "K18", size: "13", weightGrams: 4.1, priceAdjustment: 0, stockQuantity: 6 },
        { metalType: "ROSE_GOLD", purity: "K14", size: "13", weightGrams: 3.9, priceAdjustment: -3000, stockQuantity: 8 },
      ],
    },
    {
      name: "Classic Wedding Band",
      description: "A minimalist wedding band in your choice of purity, built for everyday wear.",
      basePrice: 32000,
      gender: "UNISEX",
      occasions: ["BRIDAL", "ANNIVERSARY"],
      gemstones: ["NONE"],
      styleTags: ["BAND"],
      categorySlugs: ["rings", "bands"],
      variants: [
        { metalType: "GOLD", purity: "K22", size: "14", weightGrams: 5.0, priceAdjustment: 0, stockQuantity: 10 },
        { metalType: "PLATINUM", purity: "PT950", size: "14", weightGrams: 6.2, priceAdjustment: 15000, stockQuantity: 5 },
      ],
    },
    {
      name: "Rivaana Bridal Choker",
      description: "An opulent kundan choker set designed for the modern bride.",
      basePrice: 125000,
      gender: "WOMEN",
      occasions: ["BRIDAL", "FESTIVE"],
      gemstones: ["KUNDAN", "PEARL"],
      styleTags: ["PENDANT_SET"],
      categorySlugs: ["necklaces", "chokers"],
      inCollections: true,
      variants: [
        { metalType: "GOLD", purity: "K22", size: "ONE_SIZE", weightGrams: 28.5, priceAdjustment: 0, stockQuantity: 2 },
      ],
    },
    {
      name: "Aurora Pendant Set",
      description: "A delicate pendant and earring set with sapphire drops, perfect for evening wear.",
      basePrice: 58000,
      gender: "WOMEN",
      occasions: ["PARTY"],
      gemstones: ["SAPPHIRE"],
      styleTags: ["PENDANT_SET", "DROP"],
      categorySlugs: ["necklaces", "pendant-sets"],
      variants: [
        { metalType: "WHITE_GOLD", purity: "K18", size: "ONE_SIZE", weightGrams: 9.8, priceAdjustment: 0, stockQuantity: 6 },
      ],
    },
    {
      name: "Everyday Rope Chain",
      description: "A sturdy, versatile gold chain that pairs with any pendant.",
      basePrice: 38000,
      gender: "UNISEX",
      occasions: ["DAILY_WEAR"],
      gemstones: ["NONE"],
      styleTags: ["CHAIN"],
      categorySlugs: ["necklaces", "chains"],
      variants: [
        { metalType: "GOLD", purity: "K22", size: "18in", weightGrams: 8.0, priceAdjustment: 0, stockQuantity: 12 },
        { metalType: "GOLD", purity: "K22", size: "20in", weightGrams: 9.2, priceAdjustment: 2500, stockQuantity: 10 },
      ],
    },
    {
      name: "Lumen Diamond Studs",
      description: "Classic four-prong diamond studs, an everyday essential.",
      basePrice: 42000,
      gender: "WOMEN",
      occasions: ["DAILY_WEAR", "OFFICE"],
      gemstones: ["DIAMOND"],
      styleTags: ["STUD"],
      categorySlugs: ["earrings", "studs"],
      inCollections: true,
      variants: [
        { metalType: "GOLD", purity: "K18", size: "ONE_SIZE", weightGrams: 2.1, priceAdjustment: 0, stockQuantity: 9 },
        { metalType: "WHITE_GOLD", purity: "K18", size: "ONE_SIZE", weightGrams: 2.2, priceAdjustment: 800, stockQuantity: 7 },
      ],
    },
    {
      name: "Chandbali Jhumka",
      description: "Traditional chandbali jhumkas with intricate polki work.",
      basePrice: 36000,
      gender: "WOMEN",
      occasions: ["FESTIVE", "PARTY"],
      gemstones: ["POLKI", "PEARL"],
      styleTags: ["JHUMKA", "CHANDBALI"],
      categorySlugs: ["earrings", "jhumkas"],
      variants: [
        { metalType: "GOLD", purity: "K22", size: "ONE_SIZE", weightGrams: 11.4, priceAdjustment: 0, stockQuantity: 5 },
      ],
    },
    {
      name: "Studded Kada Bangle",
      description: "A statement kada bangle with cubic zirconia detailing.",
      basePrice: 68000,
      gender: "WOMEN",
      occasions: ["FESTIVE"],
      gemstones: ["CUBIC_ZIRCONIA"],
      styleTags: ["BANGLE"],
      categorySlugs: ["bangles"],
      variants: [
        { metalType: "GOLD", purity: "K22", size: "2.6", weightGrams: 16.0, priceAdjustment: 0, stockQuantity: 4 },
        { metalType: "GOLD", purity: "K22", size: "2.8", weightGrams: 17.2, priceAdjustment: 1800, stockQuantity: 3 },
      ],
    },
    {
      name: "Signature Men's Cuff",
      description: "A bold sterling silver cuff bracelet for the modern man.",
      basePrice: 21000,
      gender: "MEN",
      occasions: ["DAILY_WEAR", "PARTY"],
      gemstones: ["NONE"],
      styleTags: ["CUFF"],
      categorySlugs: ["men-s-jewellery", "men-s-bracelets"],
      variants: [
        { metalType: "SILVER", purity: "S925", size: "M", weightGrams: 22.0, priceAdjustment: 0, stockQuantity: 8 },
        { metalType: "SILVER", purity: "S925", size: "L", weightGrams: 24.5, priceAdjustment: 500, stockQuantity: 6 },
      ],
    },
  ];

  for (const [productIndex, p] of products.entries()) {
    const slug = slugify(p.name);
    const basePriceRounded = p.basePrice;

    const product = await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        name: p.name,
        slug,
        description: p.description,
        basePrice: basePriceRounded,
        gender: p.gender,
        occasions: p.occasions,
        gemstones: p.gemstones,
        styleTags: p.styleTags,
        isPublished: true,
        isFeatured: productIndex < 3,
      },
    });

    for (const [catIndex, catSlug] of p.categorySlugs.entries()) {
      const category = categoryBySlug.get(catSlug);
      if (!category) continue;
      await prisma.productCategory.upsert({
        where: { productId_categoryId: { productId: product.id, categoryId: category.id } },
        update: {},
        create: {
          productId: product.id,
          categoryId: category.id,
          isPrimary: catIndex === 0,
        },
      });
    }

    if (p.inCollections) {
      for (const collectionId of collectionIds) {
        await prisma.productCollection.upsert({
          where: { productId_collectionId: { productId: product.id, collectionId } },
          update: {},
          create: { productId: product.id, collectionId },
        });
      }
    }

    for (const [variantIndex, v] of p.variants.entries()) {
      const sku = `${slug}-${v.metalType.slice(0, 2)}-${v.size}`.toUpperCase().replace(/\s+/g, "");
      const price = basePriceRounded + v.priceAdjustment;

      await prisma.productVariant.upsert({
        where: { sku },
        update: {},
        create: {
          productId: product.id,
          sku,
          metalType: v.metalType,
          purity: v.purity,
          size: v.size,
          weightGrams: v.weightGrams,
          priceAdjustment: v.priceAdjustment,
          price,
          stockQuantity: v.stockQuantity,
        },
      });

      if (variantIndex === 0) {
        const existingImage = await prisma.productImage.findFirst({
          where: { productId: product.id },
        });
        if (!existingImage) {
          await prisma.productImage.create({
            data: {
              productId: product.id,
              cloudinaryPublicId: `seed/${slug}-1`,
              url: placeholderImage(slug),
              altText: p.name,
              sortOrder: 0,
            },
          });
        }
      }
    }
  }

  console.log(`Seeded ${products.length} products with variants and images.`);

  // ---------------- Store settings ----------------
  await prisma.storeSettings.upsert({
    where: { id: "store-settings-singleton" },
    update: {},
    create: {
      id: "store-settings-singleton",
      storeName: "Aurelia",
      tagline: "Fine jewellery, made once and worn always.",
      legalEntityName: "Aurelia Jewellery Pvt. Ltd.",
      registeredAddress: "4th Floor, Zaveri Bazaar Road, Mumbai, Maharashtra 400002, India",
      supportEmail: "support@aurelia.example",
      supportPhone: "+91 98765 43210",
      shippingFlatFee: 99,
      freeShippingThreshold: 2000,
    },
  });
  console.log("Store settings ready.");

  // ---------------- Site content ----------------
  // Defaults mirror the copy that used to be hardcoded in each component, so
  // seeding this doesn't change anything visually until an admin edits it.
  const contentBlocks = [
    {
      key: "home_hero",
      section: "Homepage",
      label: "Hero",
      tagline: "Aurelia — Est. Fine Jewellery",
      title: "Jewellery, crafted to become forever.",
      body: "Each piece is designed to outlast trend, season, and occasion — made once, worn always.",
      linkLabel: "Explore Collection",
      linkHref: "/collections",
    },
    {
      key: "home_art_of_piece",
      section: "Homepage",
      label: "Art of the Piece",
      tagline: "The Art of the Piece",
      title: "Some pieces are worn.\nSome become part of you.",
      body: "We don't design for a moment — we design for the years after it. Every curve of metal, every angle of a cut stone, is considered for how it will feel a decade from now, not just how it photographs today.",
      imageUrl: placeholderImage("aurelia-art-of-piece", 1000, 1250),
    },
    {
      key: "home_craftsmanship",
      section: "Homepage",
      label: "Craftsmanship",
      tagline: "Craftsmanship",
      title: "Crafted by hand.\nDesigned to last.",
      body: "Every piece passes through the hands of a single goldsmith from first sketch to final polish — not a factory line, a craft, checked against the original design at every stage.",
      imageUrl: placeholderImage("aurelia-craftsmanship", 1800, 1000),
    },
    {
      key: "home_material_1",
      section: "Homepage",
      label: "Material — 1st",
      title: "18K Gold",
      body: "Warm, enduring and unmistakably timeless.",
      imageUrl: placeholderImage("aurelia-material-gold", 900, 1100),
    },
    {
      key: "home_material_2",
      section: "Homepage",
      label: "Material — 2nd",
      title: "Diamonds",
      body: "Cut to capture light from every angle.",
      imageUrl: placeholderImage("aurelia-material-diamond", 900, 1100),
    },
    {
      key: "home_gallery_1",
      section: "Homepage",
      label: "Atelier Gallery — 1st",
      imageUrl: placeholderImage("aurelia-gallery-1", 1800, 1000),
    },
    {
      key: "home_gallery_2",
      section: "Homepage",
      label: "Atelier Gallery — 2nd",
      imageUrl: placeholderImage("aurelia-gallery-2", 900, 1200),
    },
    {
      key: "home_gallery_3",
      section: "Homepage",
      label: "Atelier Gallery — 3rd",
      imageUrl: placeholderImage("aurelia-gallery-3", 900, 1200),
    },
    {
      key: "home_gallery_4",
      section: "Homepage",
      label: "Atelier Gallery — 4th",
      imageUrl: placeholderImage("aurelia-gallery-4", 1800, 1100),
    },
    {
      key: "home_brand_story",
      section: "Homepage",
      label: "Brand Story",
      tagline: "Why We Create",
      title: "We believe jewellery\nis more than\nan accessory.",
      body: "It's the thing you reach for without thinking, the piece that outlasts the outfit it was bought for. We make jewellery for people who wear it until it becomes part of how they're recognised — not for a single photograph.",
    },
    {
      key: "about_page",
      section: "About",
      label: "About Page",
      title: "Our Story",
      imageUrl: placeholderImage("aurelia-atelier", 1600, 800),
      body: "Aurelia started with a simple idea: jewellery you actually reach for every day shouldn't mean compromising on craft. Every piece we make is designed first for wear — balanced weight, settings that hold up to daily life, and metals we're proud to stand behind.\n\nWe work with a small circle of goldsmiths and setters, mostly based out of Mumbai and Jaipur, who've spent decades perfecting hand-finishing techniques that get lost in mass production. Every gemstone is checked, every setting is tested, before it ever reaches you.",
    },
    {
      key: "contact_page",
      section: "Contact",
      label: "Contact Page",
      title: "Get in Touch",
      tagline: "Questions about an order, sizing, or a custom piece — we're happy to help.",
    },
  ];

  for (const block of contentBlocks) {
    await prisma.siteContent.upsert({
      where: { key: block.key },
      update: {},
      create: block,
    });
  }
  console.log(`Seeded ${contentBlocks.length} site content blocks.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
