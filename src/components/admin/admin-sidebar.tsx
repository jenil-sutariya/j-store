"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/customers", label: "Customers" },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-background">
      <div className="border-b px-5 py-5">
        <p className="text-sm font-medium text-muted-foreground">Jewellery Shop</p>
        <p className="text-lg font-semibold">Admin</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <p className="truncate px-3 text-xs text-muted-foreground">{adminName}</p>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sign out
        </Button>
      </div>
    </aside>
  );
}
