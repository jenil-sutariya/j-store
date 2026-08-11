import { Reveal } from "@/components/storefront/reveal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Reveal>
        <h1 className="text-2xl font-semibold">Get in touch</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Questions about an order, sizing, or a custom piece — we&apos;re happy to help.
        </p>
      </Reveal>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Reveal delay={0.05}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">support@aurelia.example</p>
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
              <p className="text-sm text-muted-foreground">+91 98765 43210</p>
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
                Aurelia Jewellery Pvt. Ltd.
                <br />
                4th Floor, Zaveri Bazaar Road
                <br />
                Mumbai, Maharashtra 400002, India
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
                <a href="/account/orders" className="underline">
                  your orders
                </a>
                .
              </p>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
