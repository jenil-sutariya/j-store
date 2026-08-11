"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AccountMenu({ userName }: { userName: string | null | undefined }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-cursor-hover
        className="link-underline pb-0.5 text-xs tracking-[0.18em] uppercase"
      >
        {userName ? userName.split(" ")[0] : "Account"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link href="/account/orders" />}>My orders</DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/account/addresses" />}>Addresses</DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/wishlist" />}>Wishlist</DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
