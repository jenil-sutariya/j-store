"use server";

import { randomInt } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";
import { registerSchema, registerWithOtpSchema } from "@/lib/validators/auth";
import type { ActionResult } from "@/lib/actions/category";

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_OTP_ATTEMPTS = 5;

export async function sendRegistrationOtp(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { email } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { success: false, error: "An account with this email already exists." };
  }

  const existingOtp = await prisma.registrationOtp.findUnique({ where: { email } });
  if (existingOtp && existingOtp.createdAt.getTime() > Date.now() - OTP_RESEND_COOLDOWN_MS) {
    return { success: false, error: "Please wait a moment before requesting another code." };
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const codeHash = await bcrypt.hash(code, 8);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.registrationOtp.upsert({
    where: { email },
    create: { email, codeHash, expiresAt },
    update: { codeHash, expiresAt, attempts: 0, createdAt: new Date() },
  });

  try {
    await sendOtpEmail(email, code);
  } catch (error) {
    console.error("Failed to send registration OTP email:", error);
    return { success: false, error: "Could not send verification email. Please try again." };
  }

  return { success: true };
}

export async function verifyOtpAndRegister(input: unknown): Promise<ActionResult> {
  const parsed = registerWithOtpSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, email, password, code } = parsed.data;

  const otp = await prisma.registrationOtp.findUnique({ where: { email } });
  if (!otp || otp.expiresAt < new Date()) {
    return { success: false, error: "That code has expired. Request a new one." };
  }
  if (otp.attempts >= MAX_OTP_ATTEMPTS) {
    return { success: false, error: "Too many incorrect attempts. Request a new code." };
  }

  const isValid = await bcrypt.compare(code, otp.codeHash);
  if (!isValid) {
    await prisma.registrationOtp.update({ where: { email }, data: { attempts: { increment: 1 } } });
    return { success: false, error: "Incorrect code." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    await prisma.registrationOtp.delete({ where: { email } });
    return { success: false, error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await prisma.$transaction([
      prisma.user.create({
        data: { name, email, passwordHash, role: "CUSTOMER", emailVerified: new Date() },
      }),
      prisma.registrationOtp.delete({ where: { email } }),
    ]);
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create account." };
  }

  return { success: true };
}
