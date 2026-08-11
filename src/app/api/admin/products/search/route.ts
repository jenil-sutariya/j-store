import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchProducts } from "@/lib/queries/collection";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const query = request.nextUrl.searchParams.get("q") ?? "";
  const excludeParam = request.nextUrl.searchParams.get("exclude") ?? "";
  const excludeIds = excludeParam.split(",").filter(Boolean);

  if (query.trim().length < 2) {
    return NextResponse.json({ products: [] });
  }

  const products = await searchProducts(query, excludeIds);
  return NextResponse.json({ products });
}
