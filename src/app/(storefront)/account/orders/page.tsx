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
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Your orders</h1>

      {orders.length === 0 ? (
        <p className="text-muted-foreground">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.orderNumber}`}
              className="block rounded-md border p-4 hover:bg-muted/50"
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm">{order.orderNumber}</p>
                <Badge variant="secondary">{order.status.replace(/_/g, " ")}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
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
