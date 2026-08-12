import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "store-settings-singleton";

export type StoreSettingsData = {
  id: string;
  storeName: string;
  tagline: string | null;
  logoUrl: string | null;
  logoPublicId: string | null;
  legalEntityName: string | null;
  gstin: string | null;
  registeredAddress: string | null;
  supportEmail: string | null;
  supportPhone: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  shippingFlatFee: number;
  freeShippingThreshold: number;
};

const DEFAULT_SETTINGS: StoreSettingsData = {
  id: SETTINGS_ID,
  storeName: "Aurelia",
  tagline: "Fine jewellery, made once and worn always.",
  logoUrl: null,
  logoPublicId: null,
  legalEntityName: "Aurelia Jewellery Pvt. Ltd.",
  gstin: null,
  registeredAddress: "4th Floor, Zaveri Bazaar Road, Mumbai, Maharashtra 400002, India",
  supportEmail: "support@aurelia.example",
  supportPhone: "+91 98765 43210",
  instagramUrl: null,
  facebookUrl: null,
  shippingFlatFee: 99,
  freeShippingThreshold: 2000,
};

export async function getStoreSettings(): Promise<StoreSettingsData> {
  const settings = await prisma.storeSettings.findFirst();
  if (!settings) return DEFAULT_SETTINGS;

  return {
    ...settings,
    shippingFlatFee: Number(settings.shippingFlatFee),
    freeShippingThreshold: Number(settings.freeShippingThreshold),
  };
}

export { SETTINGS_ID };
