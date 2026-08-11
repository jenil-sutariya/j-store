"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createReview } from "@/lib/actions/review";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ReviewForm({ orderItemId, productName }: { orderItemId: string; productName: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    const result = await createReview({ orderItemId, rating, title, comment });
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setSubmitted(true);
    toast.success("Review submitted for moderation.");
    router.refresh();
  }

  if (submitted) {
    return <p className="text-sm text-muted-foreground">Thanks! Your review is pending approval.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-md border p-4">
      <p className="text-sm font-medium">Review {productName}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            className={value <= rating ? "text-yellow-500" : "text-muted-foreground"}
          >
            ★
          </button>
        ))}
      </div>
      <Input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea
        placeholder="Share your experience (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  );
}
