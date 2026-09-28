import { NextRequest, NextResponse } from "next/server";
import { createCashfreeOrder } from "@/lib/cashfree";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, orderAmount, customerName, customerEmail, customerPhone, returnUrl } = body;

    if (!orderId || !orderAmount) {
      return NextResponse.json(
        { success: false, error: "Missing required order details (orderId, orderAmount)" },
        { status: 400 }
      );
    }

    // Call Cashfree PG Orders API
    const cfOrder = await createCashfreeOrder({
      orderId,
      orderAmount: Number(orderAmount),
      customerName: customerName || "Customer",
      customerEmail: customerEmail || "customer@duagifts.com",
      customerPhone: customerPhone || "9528247811",
      returnUrl,
      orderNote: `Dua Gifts Order ${orderId}`,
    });

    return NextResponse.json({
      success: true,
      paymentSessionId: cfOrder.payment_session_id,
      orderId: cfOrder.order_id,
      cfOrderId: cfOrder.cf_order_id,
      orderStatus: cfOrder.order_status,
      orderAmount: cfOrder.order_amount,
    });
  } catch (error: any) {
    console.error("Cashfree Order Creation Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to initialize Cashfree payment session",
      },
      { status: 500 }
    );
  }
}
