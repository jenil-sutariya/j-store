"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { AccountMenu } from "@/components/storefront/account-menu";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/collections", label: "Collections" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function HeaderShell({
  userName,
  isSignedIn,
  cartCount,
  storeName,
  logoUrl,
}: {
  userName: string | null | undefined;
  isSignedIn: boolean;
  cartCount: number;
  storeName: string;
  logoUrl: string | null;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 40);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b border-transparent bg-background/95 backdrop-blur-sm transition-all duration-300",
          scrolled ? "border-border py-3" : "py-6",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <Link href="/" data-cursor-hover className="flex items-center">
            {logoUrl ? (
              <Image src={logoUrl} alt={storeName} height={32} width={128} className="h-8 w-auto" />
            ) : (
              <span className="font-display text-2xl tracking-[0.08em] text-primary">
                {storeName}
              </span>
            )}
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-cursor-hover
                className="link-underline pb-0.5 text-xs tracking-[0.18em] uppercase"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/wishlist"
              data-cursor-hover
              className="link-underline pb-0.5 text-xs tracking-[0.18em] uppercase"
            >
              Wishlist
            </Link>
            <Link
              href="/cart"
              data-cursor-hover
              className="link-underline pb-0.5 text-xs tracking-[0.18em] uppercase"
            >
              Bag ({cartCount})
            </Link>
            {isSignedIn ? (
              <AccountMenu userName={userName} />
            ) : (
              <Link
                href="/login"
                data-cursor-hover
                className="link-underline pb-0.5 text-xs tracking-[0.18em] uppercase"
              >
                Sign in
              </Link>
            )}
          </div>

          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="-mr-2 flex flex-col items-end gap-1.5 p-2 md:hidden"
          >
            <span className="h-px w-6 bg-foreground" />
            <span className="h-px w-4 bg-foreground" />
          </button>
        </div>
      </header>

      {menuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] flex flex-col bg-background md:hidden"
        >
          <div className="flex items-center justify-between px-6 py-6">
            {logoUrl ? (
              <Image src={logoUrl} alt={storeName} height={32} width={128} className="h-8 w-auto" />
            ) : (
              <span className="font-display text-2xl tracking-[0.08em] text-primary">
                {storeName}
              </span>
            )}
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="-mr-2 p-2 text-2xl"
            >
              ×
            </button>
          </div>
          <nav className="flex flex-1 flex-col items-start justify-center gap-6 px-8">
            {[...NAV_LINKS, { href: "/wishlist", label: "Wishlist" }, { href: "/cart", label: `Bag (${cartCount})` }].map(
              (link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-display text-4xl"
                >
                  {link.label}
                </Link>
              ),
            )}
            {isSignedIn ? (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="font-display text-4xl"
              >
                Sign out
              </button>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="font-display text-4xl">
                Sign in
              </Link>
            )}
          </nav>
        </motion.div>
      )}
    </>
  );
}
