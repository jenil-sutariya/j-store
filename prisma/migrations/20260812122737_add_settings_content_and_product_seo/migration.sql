-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT;

-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" TEXT NOT NULL,
    "storeName" TEXT NOT NULL DEFAULT 'Aurelia',
    "tagline" TEXT,
    "logoUrl" TEXT,
    "logoPublicId" TEXT,
    "legalEntityName" TEXT,
    "gstin" TEXT,
    "registeredAddress" TEXT,
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "shippingFlatFee" DECIMAL(10,2) NOT NULL DEFAULT 99,
    "freeShippingThreshold" DECIMAL(10,2) NOT NULL DEFAULT 2000,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteContent" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "title" TEXT,
    "tagline" TEXT,
    "body" TEXT,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "linkLabel" TEXT,
    "linkHref" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteContent_key_key" ON "SiteContent"("key");
