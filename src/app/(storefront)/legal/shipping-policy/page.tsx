import Link from "next/link";
import { LegalContent } from "@/components/storefront/legal-content";
import { getStoreSettings } from "@/lib/queries/settings";

export default async function ShippingPolicyPage() {
  const settings = await getStoreSettings();

  return (
    <LegalContent title="Shipping Policy" updatedLabel="Last updated: August 2026">
      <p>We ship across India via trusted courier and registered post partners.</p>

      <h2>Shipping charges</h2>
      <ul>
        <li>Free shipping on orders above ₹{settings.freeShippingThreshold.toLocaleString("en-IN")}.</li>
        <li>
          A flat ₹{settings.shippingFlatFee.toLocaleString("en-IN")} shipping fee applies to orders
          below ₹{settings.freeShippingThreshold.toLocaleString("en-IN")}.
        </li>
      </ul>

      <h2>Delivery timelines</h2>
      <ul>
        <li>Ready-to-ship items: dispatched within 1–2 business days of order confirmation.</li>
        <li>Delivery typically takes 3–7 business days depending on your location.</li>
        <li>Remote or non-serviceable pincodes may take longer; we&apos;ll notify you if this applies to your order.</li>
      </ul>

      <h2>Order tracking</h2>
      <p>
        Once your order ships, you can track its status any time from{" "}
        <Link href="/account/orders" data-cursor-hover className="link-underline pb-0.5">
          your order history
        </Link>
        .
      </p>

      <h2>High-value shipments</h2>
      <p>
        For orders above ₹50,000, we may require an additional identity verification step or
        signature on delivery, given the value of the shipment.
      </p>

      <h2>Cash on Delivery</h2>
      <p>
        Cash on Delivery is available for eligible orders and pincodes, shown at checkout. Please
        keep exact change ready for our delivery partner where possible.
      </p>
    </LegalContent>
  );
}
