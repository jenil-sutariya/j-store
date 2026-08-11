import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true, addresses: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Customers</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Addresses</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.name ?? "—"}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer._count.orders}</TableCell>
              <TableCell>{customer._count.addresses}</TableCell>
              <TableCell>{customer.createdAt.toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
          {customers.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No customers yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
