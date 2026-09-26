import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { GENESIS_HASH, computeTxHash } from "@/lib/ledger";

export async function GET(request: Request) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const upi = searchParams.get("upi");

    const transactions = await prisma.transaction.findMany({
      where: {
        ...(name ? { OR: [{ sellerName: { equals: name, mode: "insensitive" } }, { buyerName: { equals: name, mode: "insensitive" } }] } : {}),
        ...(upi ? { upi } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("GET transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    if (!body.upi) {
      return NextResponse.json({ error: "UPI is required" }, { status: 400 });
    }

    // Tamper-evident ledger: link this record to the latest record of the same parcel.
    const lastTx = await prisma.transaction.findFirst({ where: { upi: body.upi }, orderBy: { createdAt: "desc" } });
    const previousHash = lastTx?.txHash || GENESIS_HASH;
    const blockNumber = (lastTx?.blockNumber || 0) + 1;
    const date = new Date().toISOString();
    const type = body.type || "TRANSFER";
    const price = body.price ? String(body.price) : null;
    const sellerName = body.sellerName ?? null;
    const buyerName = body.buyerName ?? null;
    const txHash = computeTxHash({ previousHash, blockNumber, upi: body.upi, type, sellerName, buyerName, price, date });

    const transaction = await prisma.transaction.create({
      data: {
        title: body.title || `Transfer of ${body.upi}`,
        upi: body.upi,
        type,
        status: body.status || "PENDING_NOTARY",
        date,
        step: body.step || "Initiated",
        progress: body.progress || 10,
        sellerName,
        buyerName,
        price,
        txHash,
        blockNumber,
        previousHash,
        gasFee: null,
      },
    });
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("POST transaction error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
