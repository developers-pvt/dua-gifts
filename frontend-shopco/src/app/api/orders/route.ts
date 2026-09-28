import { NextRequest, NextResponse } from "next/server";

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000";
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_giftstudio_web_99182";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || searchParams.get("q") || "";

  try {
    const url = query
      ? `${MEDUSA_URL}/store/gift-orders?query=${encodeURIComponent(query)}`
      : `${MEDUSA_URL}/store/gift-orders`;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ success: true, ...data });
    }
  } catch (err: any) {
    console.error("Orders fetch error:", err.message);
  }

  return NextResponse.json({ success: false, orders: [], count: 0 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${MEDUSA_URL}/store/gift-orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ success: true, order: data.order }, { status: 201 });
    }

    const errData = await res.json().catch(() => ({}));
    return NextResponse.json(
      { success: false, error: errData.error || "Failed to create order on backend" },
      { status: res.status }
    );
  } catch (err: any) {
    console.error("Order creation error:", err.message);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to communicate with backend" },
      { status: 500 }
    );
  }
}
