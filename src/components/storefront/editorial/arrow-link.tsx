import Link from "next/link";
import { cn } from "@/lib/utils";

export function ArrowLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      data-cursor-hover
      className={cn(
        "group inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase",
        className,
      )}
    >
      <span className="link-underline pb-0.5">{children}</span>
      <span className="transition-transform duration-300 ease-out group-hover:translate-x-1.5">
        →
      </span>
    </Link>
  );
}
