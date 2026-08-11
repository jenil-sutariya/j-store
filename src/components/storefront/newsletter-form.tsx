"use client";

import { useState } from "react";
import { subscribeToNewsletter } from "@/lib/actions/newsletter";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);

    const result = await subscribeToNewsletter({ email });

    if (!result.success) {
      setStatus("idle");
      setError(result.error);
      return;
    }
    setStatus("done");
  }

  if (status === "done") {
    return <p className="text-sm text-muted-foreground">You&apos;re on the list.</p>;
  }

  return (
    <div className="max-w-sm">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="min-w-0 flex-1 border-b border-foreground/30 pb-1">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <button
          type="submit"
          data-cursor-hover
          disabled={status === "submitting"}
          className="shrink-0 pb-1 text-xs tracking-[0.18em] uppercase link-underline"
        >
          {status === "submitting" ? "Joining..." : "Join"}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
