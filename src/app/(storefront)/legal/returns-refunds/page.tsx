import { LegalContent } from "@/components/storefront/legal-content";

export default function ReturnsRefundsPage() {
  return (
    <LegalContent title="Returns & Refunds Policy" updatedLabel="Last updated: August 2026">
      <p>
        We want you to love what you order. If something isn&apos;t right, here&apos;s how returns
        and refunds work.
      </p>

      <h2>Return window</h2>
      <p>
        Most items can be returned within 7 days of delivery, unworn and in their original
        packaging with all tags and certificates intact.
      </p>

      <h2>Non-returnable items</h2>
      <ul>
        <li>Customised or engraved pieces made to order.</li>
        <li>Earrings, for hygiene reasons, unless received damaged or defective.</li>
        <li>Items showing signs of wear, alteration, or resizing by a third party.</li>
      </ul>

      <h2>How to start a return</h2>
      <p>
        Email support@aurelia.example with your order number and reason for return. We&apos;ll
        arrange a reverse pickup where available, or share a return shipping address.
      </p>

      <h2>Refunds</h2>
      <p>
        Once we receive and inspect the returned item, refunds are processed within 5–7 business
        days to your original payment method. Cash on Delivery orders are refunded via bank
        transfer or UPI — we&apos;ll ask for your details when processing the return.
      </p>

      <h2>Damaged or incorrect items</h2>
      <p>
        If your order arrives damaged or incorrect, contact us within 48 hours of delivery with
        photos of the item and packaging, and we&apos;ll arrange a free replacement or full refund.
      </p>

      <h2>Exchanges</h2>
      <p>
        Need a different size or metal? Let us know when you request your return, and we&apos;ll
        prioritise the exchange once the original item is received.
      </p>
    </LegalContent>
  );
}
