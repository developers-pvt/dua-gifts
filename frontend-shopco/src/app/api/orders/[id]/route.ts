import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000";
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_giftstudio_web_99182";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const res = await fetch(`${MEDUSA_URL}/store/gift-orders/${encodeURIComponent(id)}`, {
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (data.order) {
        return NextResponse.json({ success: true, order: data.order });
      }
    }
  } catch (err: any) {
    console.error("Order lookup error:", err.message);
  }

  return NextResponse.json(
    { success: false, error: `Order '${id}' not found in live system.` },
    { status: 404 }
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const body = await req.json();

    const res = await fetch(`${MEDUSA_URL}/store/gift-orders/${encodeURIComponent(id)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ success: true, ...data });
    }
  } catch (err: any) {
    console.error("Order update error:", err.message);
  }

  return NextResponse.json(
    { success: false, error: "Failed to update order on backend." },
    { status: 500 }
  );
}
