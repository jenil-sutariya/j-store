"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";
import { placeOrder, previewCoupon, verifyRazorpayPayment } from "@/lib/actions/checkout";
import { AddressForm } from "@/components/storefront/address-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const SHIPPING_FLAT = 99;
const FREE_SHIPPING_THRESHOLD = 2000;

type Address = {
  id: string;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutForm({
  addresses,
  subtotal,
}: {
  addresses: Address[];
  items: unknown[];
  subtotal: number;
}) {
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? "",
  );
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "RAZORPAY">("RAZORPAY");
  const [isPlacing, setIsPlacing] = useState(false);

  const shippingTotal = subtotal - (appliedDiscount ?? 0) >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const grandTotal = subtotal - (appliedDiscount ?? 0) + shippingTotal;

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);
    const result = await previewCoupon(couponCode.trim(), subtotal);
    setIsApplyingCoupon(false);

    if (!result.valid) {
      setCouponError(result.error ?? "Invalid coupon.");
      setAppliedDiscount(null);
      return;
    }
    setAppliedDiscount(result.discount ?? 0);
    toast.success("Coupon applied.");
  }

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      toast.error("Select a delivery address.");
      return;
    }

    setIsPlacing(true);
    const result = await placeOrder({
      addressId: selectedAddressId,
      couponCode: appliedDiscount !== null ? couponCode.trim() : undefined,
      paymentMethod,
    });

    if (!result.success) {
      setIsPlacing(false);
      toast.error(result.error);
      return;
    }

    if (result.paymentMethod === "COD") {
      setIsPlacing(false);
      router.push(`/checkout/success/${result.orderNumber}`);
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    setIsPlacing(false);

    if (!scriptLoaded) {
      toast.error("Could not load payment gateway. Please try again.");
      return;
    }

    const razorpay = new window.Razorpay({
      key: result.keyId,
      amount: result.amount,
      currency: "INR",
      name: "Aurelia",
      order_id: result.razorpayOrderId,
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        const verified = await verifyRazorpayPayment({
          orderNumber: result.orderNumber,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });

        if (!verified.success) {
          toast.error(verified.error ?? "Payment verification failed.");
          return;
        }
        router.push(`/checkout/success/${result.orderNumber}`);
      },
      modal: {
        ondismiss: () => {
          toast.info("Payment cancelled. Your order is saved as pending payment.");
        },
      },
    });
    razorpay.open();
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Delivery address</h2>
        <div className="space-y-2">
          {addresses.map((address) => (
            <label
              key={address.id}
              className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm ${
                selectedAddressId === address.id ? "border-foreground" : ""
              }`}
            >
              <input
                type="radio"
                name="address"
                className="mt-1"
                checked={selectedAddressId === address.id}
                onChange={() => setSelectedAddressId(address.id)}
              />
              <span>
                <span className="font-medium">{address.fullName}</span>
                <br />
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}{" "}
                {address.postalCode}
              </span>
            </label>
          ))}
        </div>

        <Dialog open={isAddAddressOpen} onOpenChange={setIsAddAddressOpen}>
          <DialogTrigger render={<Button variant="outline" size="sm" />}>
            Add new address
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add address</DialogTitle>
            </DialogHeader>
            <AddressForm
              onSaved={() => {
                setIsAddAddressOpen(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Coupon</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value);
              setAppliedDiscount(null);
              setCouponError(null);
            }}
          />
          <Button type="button" variant="outline" disabled={isApplyingCoupon} onClick={handleApplyCoupon}>
            Apply
          </Button>
        </div>
        {couponError && <p className="text-sm text-destructive">{couponError}</p>}
        {appliedDiscount !== null && (
          <p className="text-sm text-green-600">You saved {formatINR(appliedDiscount)}!</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Payment method</h2>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === "RAZORPAY"}
              onChange={() => setPaymentMethod("RAZORPAY")}
            />
            Pay online (UPI / Card / Netbanking via Razorpay)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === "COD"}
              onChange={() => setPaymentMethod("COD")}
            />
            Cash on Delivery
          </label>
        </div>
      </section>

      <section className="space-y-2 rounded-md border p-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatINR(subtotal)}</span>
        </div>
        {appliedDiscount !== null && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>-{formatINR(appliedDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>{shippingTotal === 0 ? "Free" : formatINR(shippingTotal)}</span>
        </div>
        <div className="flex justify-between border-t pt-2 font-semibold">
          <span>Total</span>
          <span>{formatINR(grandTotal)}</span>
        </div>
      </section>

      <Button size="lg" className="w-full" disabled={isPlacing} onClick={handlePlaceOrder}>
        {isPlacing ? "Placing order..." : `Place order · ${formatINR(grandTotal)}`}
      </Button>
    </div>
  );
}
