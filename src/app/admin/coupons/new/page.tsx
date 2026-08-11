import { CouponForm } from "@/components/admin/coupon-form";

export default function NewCouponPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New coupon</h1>
      <CouponForm />
    </div>
  );
}
