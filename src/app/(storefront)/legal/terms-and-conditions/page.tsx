import { LegalContent } from "@/components/storefront/legal-content";

export default function TermsPage() {
  return (
    <LegalContent title="Terms & Conditions" updatedLabel="Last updated: August 2026">
      <p>
        These terms govern your use of this website and any purchase made through it. By placing
        an order with Aurelia Jewellery Pvt. Ltd., you agree to the terms below.
      </p>

      <h2>Product information</h2>
      <p>
        We describe metal purity, weight, and gemstone details as accurately as possible for
        every listing. Weight and dimensions may vary slightly (±5%) due to the handmade nature
        of jewellery. Colours may appear slightly different depending on your screen.
      </p>

      <h2>Pricing and payment</h2>
      <p>
        All prices are listed in Indian Rupees (₹) and are inclusive of applicable GST. We accept
        payment via Razorpay (UPI, cards, netbanking) or Cash on Delivery, where available. An
        order is confirmed only once payment is received (for prepaid orders) or immediately upon
        placement (for Cash on Delivery).
      </p>

      <h2>Order acceptance</h2>
      <p>
        We reserve the right to cancel or refuse any order — for example, in the case of a pricing
        error, stock unavailability discovered after purchase, or suspected fraud. If we cancel a
        prepaid order, we&apos;ll issue a full refund.
      </p>

      <h2>Shipping and delivery</h2>
      <p>
        See our <a href="/legal/shipping-policy" className="underline">Shipping Policy</a> for
        delivery timelines and charges.
      </p>

      <h2>Returns and refunds</h2>
      <p>
        See our{" "}
        <a href="/legal/returns-refunds" className="underline">
          Returns &amp; Refunds Policy
        </a>{" "}
        for details on returns, exchanges, and refund timelines.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        Aurelia is not liable for indirect or consequential loss arising from use of this website
        or delays outside our reasonable control (including courier delays). Our liability for any
        claim is limited to the value of the order in question.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of India, and any dispute is subject to the exclusive
        jurisdiction of the courts of Mumbai, Maharashtra.
      </p>
    </LegalContent>
  );
}
