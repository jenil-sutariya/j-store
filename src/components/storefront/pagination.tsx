import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(page: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === "page" || value === undefined) continue;
      params.set(key, Array.isArray(value) ? value.join(",") : value);
    }
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={hrefFor(page)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md text-sm",
            page === currentPage
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          {page}
        </Link>
      ))}
    </div>
  );
}
