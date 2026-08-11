import Link from "next/link";
import { getAllOrders } from "@/lib/queries/order";
import { formatINR } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OrderStatus } from "@/generated/prisma/enums";

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURN_REQUESTED",
  "RETURNED",
  "REFUNDED",
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const orders = await getAllOrders(status as OrderStatus | undefined);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Orders</h1>

      <div className="flex flex-wrap gap-2">
        <Button variant={!status ? "default" : "outline"} size="sm" render={<Link href="/admin/orders" />}>
          All
        </Button>
        {STATUS_OPTIONS.map((option) => (
          <Button
            key={option}
            variant={status === option ? "default" : "outline"}
            size="sm"
            render={<Link href={`/admin/orders?status=${option}`} />}
          >
            {option.replace(/_/g, " ")}
          </Button>
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
              <TableCell>{order.user.name ?? order.user.email}</TableCell>
              <TableCell>{order.items.length}</TableCell>
              <TableCell>{formatINR(Number(order.grandTotal))}</TableCell>
              <TableCell>
                {order.paymentMethod} · {order.payment?.status}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{order.status.replace(/_/g, " ")}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" render={<Link href={`/admin/orders/${order.id}`} />}>
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No orders yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
