import { notFound } from "next/navigation";
import { getCouponById } from "@/lib/queries/coupon";
import { CouponForm } from "@/components/admin/coupon-form";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coupon = await getCouponById(id);

  if (!coupon) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit coupon</h1>
      <CouponForm
        couponId={coupon.id}
        defaultValues={{
          code: coupon.code,
          type: coupon.type,
          value: Number(coupon.value),
          minOrderValue: coupon.minOrderValue ? Number(coupon.minOrderValue) : null,
          maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : null,
          usageLimit: coupon.usageLimit,
          usageLimitPerUser: coupon.usageLimitPerUser ?? 1,
          validFrom: toDateInputValue(coupon.validFrom),
          validUntil: toDateInputValue(coupon.validUntil),
          isActive: coupon.isActive,
        }}
      />
    </div>
  );
}
