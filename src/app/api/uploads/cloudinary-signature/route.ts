import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createUploadSignature } from "@/lib/cloudinary";

export async function POST() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const signature = createUploadSignature({});
  return NextResponse.json(signature);
}
