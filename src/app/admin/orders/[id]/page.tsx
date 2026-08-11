import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/queries/order";
import { formatINR } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OrderStatusControl } from "@/components/admin/order-status-control";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const isCodUnpaid = order.paymentMethod === "COD" && order.payment?.status !== "PAID";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-2xl font-semibold">{order.orderNumber}</h1>
        <Badge variant="secondary">{order.status.replace(/_/g, " ")}</Badge>
      </div>

      <OrderStatusControl orderId={order.id} currentStatus={order.status} isCodUnpaid={isCodUnpaid} />

      <div className="grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="font-medium">Customer</p>
          <p className="text-muted-foreground">{order.user.name ?? "—"}</p>
          <p className="text-muted-foreground">{order.user.email}</p>
        </div>
        <div>
          <p className="font-medium">Payment</p>
          <p className="text-muted-foreground">
            {order.paymentMethod} · {order.payment?.status ?? "—"}
          </p>
          {order.payment?.razorpayPaymentId && (
            <p className="text-muted-foreground">Razorpay: {order.payment.razorpayPaymentId}</p>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="font-medium">Items</p>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.productNameSnapshot} ({item.skuSnapshot}) × {item.quantity}
            </span>
            <span>{formatINR(Number(item.lineTotal))}</span>
          </div>
        ))}
        <div className="space-y-1 border-t pt-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatINR(Number(order.subtotal))}</span>
          </div>
          {Number(order.discountTotal) > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount {order.coupon ? `(${order.coupon.code})` : ""}</span>
              <span>-{formatINR(Number(order.discountTotal))}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatINR(Number(order.shippingTotal))}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatINR(Number(order.grandTotal))}</span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="text-sm">
        <p className="font-medium">Shipping address</p>
        <p className="text-muted-foreground">
          {order.shippingAddress.fullName}, {order.shippingAddress.line1}, {order.shippingAddress.city},{" "}
          {order.shippingAddress.state} {order.shippingAddress.postalCode}
        </p>
        <p className="text-muted-foreground">{order.shippingAddress.phone}</p>
      </div>

      <Separator />

      <div className="text-sm">
        <p className="mb-2 font-medium">Status history</p>
        {order.statusHistory.map((entry) => (
          <p key={entry.id} className="text-muted-foreground">
            {entry.createdAt.toLocaleString()} — {entry.status.replace(/_/g, " ")}
            {entry.note ? ` (${entry.note})` : ""}
          </p>
        ))}
      </div>
    </div>
  );
}
