import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";

const MAX_INLINE_BYTES = 3 * 1024 * 1024; // documents are stored inline as data URLs up to 3 MB

export async function GET(request: Request) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  const { searchParams } = new URL(request.url);
  const ownerId = searchParams.get("ownerId");
  const upi = searchParams.get("upi");
  const status = searchParams.get("status");
  try {
    const documents = await prisma.landDocument.findMany({
      where: { ...(ownerId ? { ownerId } : {}), ...(upi ? { upi } : {}), ...(status ? { status } : {}) },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(documents);
  } catch (error) {
    console.error("GET documents error:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    if (!body.name || !body.category || !body.url) {
      return NextResponse.json({ error: "Document name, category and file are required" }, { status: 400 });
    }
    if (typeof body.url === "string" && body.url.startsWith("data:") && body.url.length * 0.75 > MAX_INLINE_BYTES) {
      return NextResponse.json({ error: "The file is larger than 3 MB" }, { status: 413 });
    }
    const document = await prisma.landDocument.create({
      data: {
        name: body.name,
        category: body.category,
        url: body.url,
        upi: body.upi || null,
        ownerId: auth.userId,
        fileDate: body.fileDate || new Date().toISOString().slice(0, 10),
        description: body.description || null,
        isEncrypted: true,
      },
    });
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    const err = error as Error;
    console.error("POST document error:", err);
    return NextResponse.json({ error: "Failed to upload document", details: err.message }, { status: 500 });
  }
}
