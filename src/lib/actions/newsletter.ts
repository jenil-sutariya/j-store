"use server";

import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validators/newsletter";
import type { ActionResult } from "@/lib/actions/category";

export async function subscribeToNewsletter(input: unknown): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid email" };
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      update: {},
      create: { email: parsed.data.email },
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to subscribe. Please try again." };
  }

  return { success: true };
}
