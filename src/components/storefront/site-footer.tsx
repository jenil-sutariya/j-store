import Link from "next/link";
import { NewsletterForm } from "@/components/storefront/newsletter-form";

const LINK_GROUPS = [
  {
    heading: "Shop",
    links: [
      { href: "/products", label: "All jewellery" },
      { href: "/collections", label: "Collections" },
      { href: "/wishlist", label: "Wishlist" },
    ],
  },
  {
    heading: "Studio",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Policies",
    links: [
      { href: "/legal/shipping-policy", label: "Shipping" },
      { href: "/legal/returns-refunds", label: "Returns & refunds" },
      { href: "/legal/terms-and-conditions", label: "Terms & conditions" },
      { href: "/legal/privacy-policy", label: "Privacy policy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-16 md:grid-cols-[1.4fr_2fr]">
          <div>
            <p className="font-display text-2xl tracking-[0.08em] text-primary">AURELIA</p>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Fine jewellery, made once and worn always.
            </p>

            <p className="mt-10 text-xs tracking-[0.2em] uppercase">Join the world of Aurelia</p>
            <div className="mt-4">
              <NewsletterForm />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {LINK_GROUPS.map((group) => (
              <div key={group.heading}>
                <p className="mb-4 text-xs tracking-[0.2em] uppercase text-muted-foreground">
                  {group.heading}
                </p>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} data-cursor-hover className="link-underline pb-0.5 text-sm">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} Aurelia Jewellery Pvt. Ltd. All rights reserved.</p>
          <p>GSTIN: [add your GSTIN] · Secure payments via Razorpay</p>
        </div>
      </div>
    </footer>
  );
}
