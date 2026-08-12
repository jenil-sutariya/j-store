import Link from "next/link";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export default async function OrdersPage() {
  const session = await requireUser("/account/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { placedAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <p className="mb-3 text-xs tracking-[0.3em] text-muted-foreground uppercase">Account</p>
      <h1 className="mb-8 font-display text-3xl sm:text-4xl">Your Orders</h1>

      {orders.length === 0 ? (
        <p className="text-muted-foreground">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="divide-y divide-border border-t border-border">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.orderNumber}`}
              data-cursor-hover
              className="flex flex-col gap-2 p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-mono text-sm break-words">{order.orderNumber}</p>
                <Badge variant="secondary">{order.status.replace(/_/g, " ")}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {order.items.length} item(s) · {formatINR(Number(order.grandTotal))} ·{" "}
                {order.placedAt.toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
