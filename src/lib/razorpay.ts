import Razorpay from "razorpay";
import crypto from "crypto";

let client: Razorpay | null = null;

function getClient() {
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });
  }
  return client;
}

export async function createRazorpayOrder(amountInRupees: number, receipt: string) {
  return getClient().orders.create({
    amount: Math.round(amountInRupees * 100),
    currency: "INR",
    receipt,
  });
}

export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return safeCompare(expected, signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET as string)
    .update(rawBody)
    .digest("hex");

  return safeCompare(expected, signature);
}

function safeCompare(expected: string, actual: string) {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}
