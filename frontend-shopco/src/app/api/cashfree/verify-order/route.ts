import { NextRequest, NextResponse } from "next/server";
import { fetchCashfreeOrder, fetchCashfreeOrderPayments } from "@/lib/cashfree";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id") || searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing order_id query parameter" },
        { status: 400 }
      );
    }

    // 1. Fetch Order details from Cashfree
    const order = await fetchCashfreeOrder(orderId);

    // 2. Fetch specific payment transactions
    const payments = await fetchCashfreeOrderPayments(orderId);
    const successfulPayment = payments.find((p) => p.payment_status === "SUCCESS") || payments[0];

    const isPaid = order.order_status === "PAID" || successfulPayment?.payment_status === "SUCCESS";

    return NextResponse.json({
      success: true,
      orderStatus: isPaid ? "PAID" : order.order_status,
      isPaid,
      orderId: order.order_id,
      cfOrderId: order.cf_order_id,
      orderAmount: order.order_amount,
      orderCurrency: order.order_currency,
      paymentDetails: successfulPayment
        ? {
            paymentId: successfulPayment.cf_payment_id,
            paymentStatus: successfulPayment.payment_status,
            paymentMethod: successfulPayment.payment_group || "UPI",
            bankReference: successfulPayment.bank_reference || `BR-${successfulPayment.cf_payment_id}`,
            paymentTime: successfulPayment.payment_time,
            paymentMessage: successfulPayment.payment_message,
          }
        : null,
      rawPayments: payments,
    });
  } catch (error: any) {
    console.error("Cashfree Verification Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to verify Cashfree payment",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = body.orderId || body.order_id;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing orderId in request body" },
        { status: 400 }
      );
    }

    const order = await fetchCashfreeOrder(orderId);
    const payments = await fetchCashfreeOrderPayments(orderId);
    const successfulPayment = payments.find((p) => p.payment_status === "SUCCESS") || payments[0];
    const isPaid = order.order_status === "PAID" || successfulPayment?.payment_status === "SUCCESS";

    return NextResponse.json({
      success: true,
      orderStatus: isPaid ? "PAID" : order.order_status,
      isPaid,
      orderId: order.order_id,
      cfOrderId: order.cf_order_id,
      orderAmount: order.order_amount,
      orderCurrency: order.order_currency,
      paymentDetails: successfulPayment
        ? {
            paymentId: successfulPayment.cf_payment_id,
            paymentStatus: successfulPayment.payment_status,
            paymentMethod: successfulPayment.payment_group || "UPI",
            bankReference: successfulPayment.bank_reference || `BR-${successfulPayment.cf_payment_id}`,
            paymentTime: successfulPayment.payment_time,
            paymentMessage: successfulPayment.payment_message,
          }
        : null,
      rawPayments: payments,
    });
  } catch (error: any) {
    console.error("Cashfree POST Verification Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to verify Cashfree payment",
      },
      { status: 500 }
    );
  }
}
