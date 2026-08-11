import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM ?? "Aurelia <onboarding@resend.dev>";

export async function sendOtpEmail(email: string, code: string) {
  // resend.emails.send() resolves with { data, error } instead of throwing on
  // API-level failures (e.g. sandbox domain restrictions) — it must be
  // checked explicitly, or a rejected send silently looks like a success.
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `${code} is your Aurelia verification code`,
    html: `
      <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto; padding: 32px 24px;">
        <p style="font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; color: #666;">Aurelia — Est. Fine Jewellery</p>
        <h1 style="font-size: 28px; margin: 16px 0;">Verify your email</h1>
        <p style="color: #444;">Use this code to finish creating your account. It expires in 10 minutes.</p>
        <p style="font-size: 32px; font-weight: 600; letter-spacing: 0.2em; margin: 24px 0;">${code}</p>
        <p style="color: #888; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}
