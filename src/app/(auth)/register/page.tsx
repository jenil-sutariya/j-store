"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { sendRegistrationOtp, verifyOtpAndRegister } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RESEND_COOLDOWN_SECONDS = 30;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, []);

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownTimer.current = setInterval(() => {
      setCooldown((value) => {
        if (value <= 1 && cooldownTimer.current) clearInterval(cooldownTimer.current);
        return Math.max(0, value - 1);
      });
    }, 1000);
  }

  async function handleSendOtp(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await sendRegistrationOtp({ name, email, password });
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    setStep("otp");
    startCooldown();
  }

  async function handleResendOtp() {
    if (cooldown > 0) return;
    setError(null);
    setIsSubmitting(true);
    const result = await sendRegistrationOtp({ name, email, password });
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    startCooldown();
  }

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await verifyOtpAndRegister({ name, email, password, code });

    if (!result.success) {
      setIsSubmitting(false);
      setError(result.error);
      return;
    }

    const signInResult = await signIn("credentials", { email, password, redirect: false });
    setIsSubmitting(false);

    if (signInResult?.error) {
      router.push("/login");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md border border-border bg-card p-6 sm:p-8 md:p-10">
        <p className="mb-3 text-xs tracking-[0.3em] text-muted-foreground uppercase">Aurelia</p>
        <h1 className="mb-8 font-display text-3xl sm:text-4xl">
          {step === "details" ? "Create an Account" : "Verify Your Email"}
        </h1>

        <div>
          {step === "details" ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending code..." : "Send verification code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              <p className="text-sm text-muted-foreground">
                We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
              </p>
              <div className="space-y-2">
                <Label htmlFor="code">Verification code</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting || code.length !== 6}>
                {isSubmitting ? "Verifying..." : "Verify & create account"}
              </Button>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs text-muted-foreground"
                  disabled={isSubmitting}
                  onClick={() => {
                    setStep("details");
                    setCode("");
                    setError(null);
                  }}
                >
                  Change details
                </Button>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs text-muted-foreground"
                  disabled={isSubmitting || cooldown > 0}
                  onClick={handleResendOtp}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
