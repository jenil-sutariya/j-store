import { prisma } from "@/lib/prisma";
import { approveReview, rejectReview } from "@/lib/actions/review";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { Button } from "@/components/ui/button";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true } }, user: { select: { name: true, email: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reviews</h1>

      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-md border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{review.product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {review.user.name ?? review.user.email} · ★ {review.rating}/5
                </p>
              </div>
              <Badge variant={review.isApproved ? "default" : "secondary"}>
                {review.isApproved ? "Approved" : "Pending"}
              </Badge>
            </div>
            {review.title && <p className="mt-2 text-sm font-medium">{review.title}</p>}
            {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}

            <div className="mt-3 flex gap-2">
              {!review.isApproved && (
                <ApproveButton reviewId={review.id} />
              )}
              <DeleteButton
                onDelete={rejectReview.bind(null, review.id)}
                confirmMessage="Delete this review?"
              />
            </div>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-muted-foreground">No reviews yet.</p>}
      </div>
    </div>
  );
}

function ApproveButton({ reviewId }: { reviewId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await approveReview(reviewId);
      }}
    >
      <Button type="submit" size="sm" variant="outline">
        Approve
      </Button>
    </form>
  );
}
