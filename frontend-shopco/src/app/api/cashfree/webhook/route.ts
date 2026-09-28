import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      body = {};
    }

    console.log("Cashfree Webhook Received:", JSON.stringify(body));

    const eventType = body?.type;
    const orderData = body?.data?.order;
    const paymentData = body?.data?.payment;

    // Handle payment success webhook
    if (eventType === "PAYMENT_SUCCESS_WEBHOOK" || paymentData?.payment_status === "SUCCESS") {
      const orderId = orderData?.order_id || paymentData?.order_id;
      const paymentId = paymentData?.cf_payment_id;
      console.log(`Cashfree Webhook: Payment success for order ${orderId} (Payment ID: ${paymentId})`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Cashfree Webhook Error:", error);
    return NextResponse.json({ received: false, error: error.message }, { status: 500 });
  }
}
