import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [productCount, categoryCount, collectionCount, orderCount, lowStockCount, pendingReviewCount] =
    await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.collection.count(),
      prisma.order.count(),
      prisma.productVariant.count({ where: { stockQuantity: { lt: 5 }, isActive: true } }),
      prisma.review.count({ where: { isApproved: false } }),
    ]);

  const stats = [
    { label: "Products", value: productCount },
    { label: "Categories", value: categoryCount },
    { label: "Collections", value: collectionCount },
    { label: "Orders", value: orderCount },
    { label: "Low stock variants", value: lowStockCount },
    { label: "Pending reviews", value: pendingReviewCount },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
