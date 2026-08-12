import Link from "next/link";
import { Reveal } from "@/components/storefront/reveal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStoreSettings } from "@/lib/queries/settings";
import { getSiteContent } from "@/lib/queries/content";

export default async function ContactPage() {
  const [settings, content] = await Promise.all([
    getStoreSettings(),
    getSiteContent("contact_page"),
  ]);

  const title = content?.title ?? "Get in Touch";
  const tagline =
    content?.tagline ?? "Questions about an order, sizing, or a custom piece — we're happy to help.";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Reveal>
        <p className="mb-3 text-xs tracking-[0.3em] text-muted-foreground uppercase">Aurelia</p>
        <h1 className="font-display text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{tagline}</p>
      </Reveal>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Reveal delay={0.05}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{settings.supportEmail}</p>
              <p className="mt-1 text-xs text-muted-foreground">We reply within 24 hours, Mon–Sat.</p>
            </CardContent>
          </Card>
        </Reveal>
        <Reveal delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Phone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{settings.supportPhone}</p>
              <p className="mt-1 text-xs text-muted-foreground">10 AM – 7 PM IST, Mon–Sat.</p>
            </CardContent>
          </Card>
        </Reveal>
        <Reveal delay={0.15}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Registered office</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {settings.legalEntityName}
                <br />
                {settings.registeredAddress}
              </p>
            </CardContent>
          </Card>
        </Reveal>
        <Reveal delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Order support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Already placed an order? Track its status from{" "}
                <Link href="/account/orders" data-cursor-hover className="link-underline pb-0.5">
                  your orders
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
