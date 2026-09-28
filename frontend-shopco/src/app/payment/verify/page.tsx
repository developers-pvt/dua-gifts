"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/lib/hooks/redux";
import { clearCart } from "@/lib/features/carts/cartsSlice";
import { MedusaApi } from "@/lib/medusa";
import { FaCheckCircle, FaTimesCircle, FaShieldAlt, FaTruck, FaWhatsapp } from "react-icons/fa";

interface VerificationResult {
  isPaid: boolean;
  orderStatus: string;
  orderId: string;
  cfOrderId?: string;
  orderAmount?: number;
  orderCurrency?: string;
  paymentDetails?: {
    paymentId?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    bankReference?: string;
    paymentTime?: string;
    paymentMessage?: string;
  } | null;
}

function PaymentVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const orderId = searchParams.get("order_id") || searchParams.get("orderId");

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localOrder, setLocalOrder] = useState<any | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order identifier provided in callback URL.");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/cashfree/verify-order?order_id=${encodeURIComponent(orderId)}`);
        const data = await res.json();

        if (data.success) {
          setResult(data);

          // Retrieve order from local storage
          let existingOrders: any[] = [];
          try {
            existingOrders = JSON.parse(localStorage.getItem("gift_user_orders") || "[]");
          } catch (e) {}

          const currentOrder = existingOrders.find((o) => o.orderNumber === orderId || o.id === orderId);

          if (data.isPaid) {
            // 1. Clear cart
            dispatch(clearCart());
            localStorage.removeItem("gift_external_items");
            localStorage.removeItem("gift_packaging_fee");

            // 2. Update order in local storage
            if (currentOrder) {
              currentOrder.paymentStatus = "PAID";
              currentOrder.paymentGateway = "CASHFREE";
              currentOrder.cashfreeOrderId = data.cfOrderId || data.orderId;
              currentOrder.cashfreePaymentId = data.paymentDetails?.paymentId || `CF_PAY_${Date.now()}`;
              currentOrder.cashfreeStatus = "SUCCESS";
              currentOrder.bankReference = data.paymentDetails?.bankReference || `BR_${Date.now()}`;
              currentOrder.paymentMethodUsed = data.paymentDetails?.paymentMethod || "UPI / Card";
              currentOrder.paymentTime = data.paymentDetails?.paymentTime || new Date().toISOString();

              // Add timeline event
              if (Array.isArray(currentOrder.timeline)) {
                currentOrder.timeline.push({
                  stage: currentOrder.currentStage || "ORDER_PLACED",
                  title: "Payment Verified via Cashfree PG",
                  completedAt: new Date().toISOString(),
                  notes: `Txn Ref: ${currentOrder.cashfreePaymentId} • Bank: ${currentOrder.bankReference}`,
                  actor: "Cashfree Gateway",
                });
              }

              localStorage.setItem("gift_user_orders", JSON.stringify(existingOrders));
              setLocalOrder(currentOrder);

              // 3. Sync to Medusa backend
              try {
                await MedusaApi.updateGiftOrderPayment(orderId, currentOrder);
              } catch (e) {
                console.warn("Medusa sync deferred:", e);
              }
            } else {
              setLocalOrder({
                orderNumber: orderId,
                totalAmount: data.orderAmount,
                paymentStatus: "PAID",
                paymentGateway: "CASHFREE",
                cashfreeOrderId: data.cfOrderId,
                cashfreePaymentId: data.paymentDetails?.paymentId,
                bankReference: data.paymentDetails?.bankReference,
              });
            }
          } else {
            setLocalOrder(currentOrder || null);
          }
        } else {
          setError(data.error || "Cashfree payment verification could not be confirmed.");
        }
      } catch (err: any) {
        setError(err.message || "Network error while connecting to Cashfree verification gateway.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [orderId, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafc] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-black/15 border-t-black rounded-full animate-spin mb-4" />
        <h2 className={cn([integralCF.className, "text-xl text-black tracking-tight mb-1"])}>
          VERIFYING CASHFREE PAYMENT
        </h2>
        <p className="text-xs text-black/60 max-w-sm text-center">
          Connecting securely to Cashfree servers to confirm your transaction status. Please do not close this window...
        </p>
      </div>
    );
  }

  // Payment Failed or Error
  if (error || !result?.isPaid) {
    return (
      <div className="min-h-screen bg-[#fafafc] flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-xl text-center space-y-5 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-3xl">
            <FaTimesCircle />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Payment Not Completed
            </span>
            <h1 className={cn([integralCF.className, "text-2xl text-black mt-3 mb-1.5"])}>
              PAYMENT VERIFICATION PENDING
            </h1>
            <p className="text-xs text-black/60 leading-relaxed">
              {error ||
                `Cashfree returned order status: "${result?.orderStatus || 'INCOMPLETE'}". If money was deducted from your account, it will automatically refund within 2-4 business days, or your order will update shortly.`}
            </p>
          </div>

          {orderId && (
            <div className="p-3 bg-[#f5f5f7] rounded-xl text-xs font-mono text-black/70 border border-black/5">
              Order Reference: <strong className="text-black">{orderId}</strong>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/checkout"
              className="flex-1 py-3 px-4 rounded-full bg-black text-white text-xs font-bold hover:bg-black/90 transition-all text-center"
            >
              Retry Checkout →
            </Link>
            <Link
              href={`/track?id=${orderId || ""}`}
              className="flex-1 py-3 px-4 rounded-full border border-black/15 text-black text-xs font-bold hover:bg-black/5 transition-all text-center"
            >
              Check Order Status
            </Link>
          </div>

          <div className="pt-3 border-t border-black/[0.06] text-xs text-black/50 flex items-center justify-center gap-1.5">
            <span>Need help? WhatsApp Dua Gifts:</span>
            <a href="https://wa.me/919528247811" className="font-bold underline text-black">
              +91 95282 47811
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Payment Successful
  return (
    <div className="min-h-screen bg-[#fafafc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-[0_12px_48px_rgba(0,0,0,0.06)] space-y-6 animate-in zoom-in-95 duration-400">
        {/* Success Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-sm">
            <FaCheckCircle />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            <FaShieldAlt className="text-emerald-600" />
            <span>Cashfree Payment Verified (100% Secure)</span>
          </div>
          <h1 className={cn([integralCF.className, "text-2xl sm:text-3xl text-black tracking-tight pt-1"])}>
            PAYMENT SUCCESSFUL!
          </h1>
          <p className="text-xs text-black/60 max-w-md mx-auto">
            Thank you for ordering with <strong>Dua Gifts</strong>. Your gift hamper order is now officially locked in and entered into our fulfillment pipeline!
          </p>
        </div>

        {/* Cashfree Payment Receipt Breakdown */}
        <div className="rounded-2xl bg-[#fafafc] border border-black/[0.08] p-5 space-y-3.5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
            <span className="font-bold text-black uppercase tracking-wider text-[11px]">Payment Receipt</span>
            <span className="font-mono text-emerald-700 bg-emerald-100/70 font-bold px-2 py-0.5 rounded text-[11px]">
              SETTLED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-black/70">
            <div>
              <span className="text-[11px] text-black/40 block">Order Number</span>
              <strong className="text-black font-mono text-xs">{result.orderId}</strong>
            </div>
            <div>
              <span className="text-[11px] text-black/40 block">Amount Paid</span>
              <strong className="text-black font-extrabold text-sm text-emerald-700">
                ₹{Math.round(result.orderAmount || localOrder?.totalAmount || 0).toLocaleString("en-IN")} INR
              </strong>
            </div>
            <div>
              <span className="text-[11px] text-black/40 block">Cashfree Reference ID</span>
              <strong className="text-black font-mono text-[11px]">
                {result.cfOrderId || result.paymentDetails?.paymentId || "CF-703597"}
              </strong>
            </div>
            <div>
              <span className="text-[11px] text-black/40 block">Payment Method</span>
              <strong className="text-black">
                {result.paymentDetails?.paymentMethod || "Instant UPI / Cards"}
              </strong>
            </div>
            {result.paymentDetails?.bankReference && (
              <div className="col-span-2">
                <span className="text-[11px] text-black/40 block">Bank Reference Number</span>
                <strong className="text-black font-mono text-[11px]">
                  {result.paymentDetails.bankReference}
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* 6-Stage Pipeline Alert */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs">
          <FaTruck className="text-amber-800 text-lg shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-950">Next Step: Procurement &amp; Luxury Assembly</div>
            <div className="text-[11px] text-amber-900/80 mt-0.5 leading-relaxed">
              Our team at Dua Gifts Pan-India Hub is reviewing your items, inspecting quality, and wrapping your hamper with wax seal packaging.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <Link
            href={`/track?id=${result.orderId}`}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-black hover:bg-black/90 active:scale-[0.99] text-white text-xs font-bold rounded-full transition-all shadow-md"
          >
            <span>Track Your Gift Hamper Live →</span>
          </Link>
          <Link
            href="/shop"
            className="flex items-center justify-center gap-2 w-full py-3 border border-black/15 text-black hover:bg-black/5 text-xs font-semibold rounded-full transition-all"
          >
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* WhatsApp & Support Footer */}
        <div className="pt-2 text-center text-xs text-black/50 border-t border-black/[0.06]">
          <span>Have questions about your order? </span>
          <a
            href="https://wa.me/919528247811"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:underline ml-1"
          >
            <FaWhatsapp />
            <span>WhatsApp +91 95282 47811</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafafc] flex items-center justify-center text-xs font-semibold text-black/50">
          Loading payment confirmation...
        </div>
      }
    >
      <PaymentVerifyContent />
    </Suspense>
  );
}
