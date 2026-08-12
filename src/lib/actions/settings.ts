"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { settingsSchema } from "@/lib/validators/settings";
import { SETTINGS_ID } from "@/lib/queries/settings";
import type { ActionResult } from "@/lib/actions/category";

export async function updateStoreSettings(input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  const values = {
    storeName: data.storeName,
    tagline: data.tagline || null,
    logoUrl: data.logoUrl || null,
    logoPublicId: data.logoPublicId || null,
    legalEntityName: data.legalEntityName || null,
    gstin: data.gstin || null,
    registeredAddress: data.registeredAddress || null,
    supportEmail: data.supportEmail || null,
    supportPhone: data.supportPhone || null,
    instagramUrl: data.instagramUrl || null,
    facebookUrl: data.facebookUrl || null,
    shippingFlatFee: data.shippingFlatFee,
    freeShippingThreshold: data.freeShippingThreshold,
  };

  try {
    await prisma.storeSettings.upsert({
      where: { id: SETTINGS_ID },
      update: values,
      create: { id: SETTINGS_ID, ...values },
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update settings." };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");

  return { success: true };
}
