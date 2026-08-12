import { LegalContent } from "@/components/storefront/legal-content";
import { getStoreSettings } from "@/lib/queries/settings";

export default async function PrivacyPolicyPage() {
  const settings = await getStoreSettings();
  const legalEntityName = settings.legalEntityName ?? "Aurelia Jewellery Pvt. Ltd.";
  const supportEmail = settings.supportEmail ?? "support@aurelia.example";

  return (
    <LegalContent title="Privacy Policy" updatedLabel="Last updated: August 2026">
      <p>
        {legalEntityName} (&quot;Aurelia&quot;, &quot;we&quot;, &quot;us&quot;) respects
        your privacy. This policy explains what information we collect when you use this website,
        how we use it, and the choices you have.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>Account details: name, email address, phone number, and password (stored as a secure hash, never in plain text).</li>
        <li>Order details: shipping and billing addresses, items purchased, and order value.</li>
        <li>Payment details: we never store your card, UPI, or bank details. Payments are processed directly by Razorpay, our PCI-DSS compliant payment partner.</li>
        <li>Usage data: pages visited and general device/browser information, used only to keep the site working correctly.</li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To process and deliver your orders, and to contact you about them.</li>
        <li>To maintain your account, wishlist, and order history.</li>
        <li>To respond to support requests sent via our contact page.</li>
        <li>To meet tax, accounting, and legal record-keeping obligations under Indian law.</li>
      </ul>

      <h2>Sharing your information</h2>
      <p>
        We share only what&apos;s necessary to fulfil your order: your name, address, and phone
        number with our courier partners, and payment amount with Razorpay. We do not sell your
        personal information to third parties.
      </p>

      <h2>Data retention</h2>
      <p>
        We retain order records for as long as required under applicable tax and consumer
        protection law. You can request deletion of your account by emailing
        {supportEmail}; order records tied to completed transactions may be retained
        separately as required by law.
      </p>

      <h2>Your rights</h2>
      <p>
        You can review or update your account details and addresses at any time from your
        account page. To request a copy of your data or its deletion, contact us at
        {supportEmail}.
      </p>

      <h2>Contact</h2>
      <p>Questions about this policy can be sent to {supportEmail}.</p>
    </LegalContent>
  );
}
