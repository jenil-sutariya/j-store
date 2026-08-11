import Link from "next/link";
import { getAllCoupons } from "@/lib/queries/coupon";
import { deleteCoupon } from "@/lib/actions/coupon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function CouponsPage() {
  const coupons = await getAllCoupons();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Coupons</h1>
        <Button render={<Link href="/admin/coupons/new" />}>New coupon</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Redemptions</TableHead>
            <TableHead>Valid until</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell className="font-mono">{coupon.code}</TableCell>
              <TableCell>{coupon.type === "PERCENTAGE" ? "Percentage" : "Fixed"}</TableCell>
              <TableCell>
                {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `₹${coupon.value}`}
              </TableCell>
              <TableCell>
                {coupon._count.redemptions}
                {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
              </TableCell>
              <TableCell>{coupon.validUntil.toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant={coupon.isActive ? "default" : "secondary"}>
                  {coupon.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  render={<Link href={`/admin/coupons/${coupon.id}`} />}
                >
                  Edit
                </Button>
                <DeleteButton onDelete={deleteCoupon.bind(null, coupon.id)} />
              </TableCell>
            </TableRow>
          ))}
          {coupons.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No coupons yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
