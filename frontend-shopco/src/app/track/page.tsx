"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MedusaApi, GiftOrder, OrderStage } from "@/lib/medusa";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";

const STAGES: Array<{ key: OrderStage; label: string; desc: string; icon: string }> = [
  { key: "ORDER_PLACED", label: "Order Placed", desc: "Single payment verified & tasks generated", icon: "💳" },
  { key: "PROCUREMENT_INVENTORY", label: "Procurement & Inventory", desc: "Sourcing external items & reserving store stock", icon: "🌐" },
  { key: "QUALITY_CHECK", label: "Quality Check", desc: "100% inspection of authentic products", icon: "🔍" },
  { key: "GIFT_ASSEMBLY", label: "Gift Assembly", desc: "Artisan arrangement into luxury box with ribbon", icon: "🎁" },
  { key: "PACKING", label: "Luxury Packing", desc: "Wax seal application & tamper-proof wrapping", icon: "📦" },
  { key: "SHIPPED", label: "Shipped", desc: "Dispatched with express delivery carrier", icon: "🚚" },
  { key: "DELIVERED", label: "Delivered", desc: "Delivered directly to happy recipient", icon: "🎉" },
];

function TrackContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("id") || searchParams.get("orderNumber") || "";

  const [orderQuery, setOrderQuery] = useState(initialQuery);
  const [order, setOrder] = useState<GiftOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return;
    setLoading(true);
    setError(null);

    const q = queryToSearch.trim().toLowerCase();

    // 1. Check local storage orders first for immediate client reference
    try {
      const storedOrders = JSON.parse(localStorage.getItem("gift_user_orders") || "[]");
      const matchedLocal = storedOrders.find(
        (o: any) =>
          o.orderNumber?.toLowerCase().includes(q) ||
          o.id?.toLowerCase().includes(q)
      );
      if (matchedLocal) {
        setOrder(matchedLocal);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Could not read local orders");
    }

    // 2. Fetch directly from Backend Orders API
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(queryToSearch.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      console.warn("Backend orders API query failed:", err.message);
    }

    // 3. Try Medusa API directly
    try {
      const res = await MedusaApi.getGiftOrders(queryToSearch.trim());
      if (res.orders.length > 0) {
        setOrder(res.orders[0]);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      // Not found
    }

    // If order does not exist in backend or local storage, show real error (no fake data)
    setOrder(null);
    setError(`No order found matching "${queryToSearch.trim()}". Please check your Order ID from your Cashfree receipt or contact WhatsApp support at +91 95282 47811.`);
    setLoading(false);
  };

  useEffect(() => {
    if (initialQuery) {
      fetchOrder(initialQuery);
    }
  }, [initialQuery]);

  const getCurrentStageIndex = (stage: OrderStage) => {
    return STAGES.findIndex((s) => s.key === stage);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
            Real-Time Consolidated Tracking
          </span>
          <h1 className={cn([integralCF.className, "text-3xl sm:text-4xl text-black mt-2 mb-2"])}>
            TRACK YOUR GIFT ORDER
          </h1>
          <p className="text-sm text-black/60 max-w-lg mx-auto">
            Follow every step from external sourcing and inventory allocation to quality inspection, artisan
            assembly, and express courier dispatch.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-xs mb-10 max-w-xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchOrder(orderQuery);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Enter Order # (e.g. GFT-84920)"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-black/15 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-medium"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-black/85 transition-colors disabled:opacity-50"
            >
              {loading ? "Searching..." : "Track Gift"}
            </button>
          </form>
          {error && <p className="text-xs text-red-600 mt-2 text-center">{error}</p>}
          <p className="text-xs text-black/50 mt-3 text-center">
            Need urgent delivery support? Call/WhatsApp Dua Gifts:{" "}
            <a href="https://wa.me/919528247811" className="font-bold underline text-black">
              +91 95282 47811
            </a>
          </p>
        </div>

        {order && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Order Overview Card */}
            <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-black">Order #{order.orderNumber}</h2>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {order.paymentStatus === "PAID" ? "Paid Once (Verified)" : order.paymentStatus}
                  </span>
                </div>
                <div className="text-xs text-black/60 mt-1">
                  Recipient: <strong className="text-black">{order.recipient.name}</strong> • Occasion:{" "}
                  <strong className="text-black">{order.recipient.giftOccasion || "Celebration"}</strong> • Delivery:{" "}
                  <strong className="text-black">{order.recipient.deliveryDate || "Standard"}</strong>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span>🛡️</span>
                    <span>{order.paymentGateway || "CASHFREE"} VERIFIED</span>
                  </span>
                  {order.cashfreePaymentId && (
                    <span className="text-[11px] font-mono text-black/70 bg-black/[0.04] px-2 py-0.5 rounded border border-black/5">
                      Txn: {order.cashfreePaymentId}
                    </span>
                  )}
                  {order.paymentMethodUsed && (
                    <span className="text-[11px] font-medium text-black/70 bg-black/[0.04] px-2 py-0.5 rounded border border-black/5">
                      Mode: {order.paymentMethodUsed}
                    </span>
                  )}
                  {order.bankReference && (
                    <span className="text-[11px] font-mono text-black/60 bg-black/[0.04] px-2 py-0.5 rounded border border-black/5">
                      Ref: {order.bankReference}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-left md:text-right">
                <div className="text-xs font-semibold text-black/50">Total Amount (Unified)</div>
                <div className="text-2xl font-black text-black">₹{order.totalAmount.toLocaleString("en-IN")}</div>
                <div className="text-[11px] font-semibold text-emerald-600">
                  ● SLA Status: {order.slaStatus.replace("_", " ")}
                </div>
              </div>
            </div>

            {/* Workflow Stage Progress Tracker */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-black/10 shadow-sm">
              <h3 className="text-base font-bold text-black mb-6">Consolidation & Fulfillment Pipeline</h3>

              <div className="relative">
                {/* Horizontal line on desktop */}
                <div className="hidden lg:block absolute top-6 left-8 right-8 h-1 bg-gray-200 -z-0" />
                <div
                  className="hidden lg:block absolute top-6 left-8 h-1 bg-amber-600 transition-all duration-500 -z-0"
                  style={{ width: `${order.stageProgress}%` }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 relative z-10">
                  {STAGES.map((s, idx) => {
                    const currentIdx = getCurrentStageIndex(order.currentStage);
                    const isCompleted = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div
                        key={s.key}
                        className={cn([
                          "p-3 rounded-xl border flex lg:flex-col items-center gap-3 text-left lg:text-center transition-all",
                          isCurrent
                            ? "bg-amber-50 border-amber-600 ring-2 ring-amber-500/20 shadow-xs"
                            : isCompleted
                            ? "bg-white border-emerald-400"
                            : "bg-[#fafafa] border-black/5 opacity-60",
                        ])}
                      >
                        <div
                          className={cn([
                            "w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 font-bold",
                            isCurrent
                              ? "bg-amber-600 text-white"
                              : isCompleted
                              ? "bg-emerald-500 text-white"
                              : "bg-gray-200 text-gray-400",
                          ])}
                        >
                          {isCompleted && !isCurrent ? "✓" : s.icon}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-black">{s.label}</div>
                          <div className="text-[10px] text-black/50 line-clamp-2 mt-0.5">{s.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sourcing & Consolidation Split: Our Products vs. External Products */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Store Inventory Items */}
              <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/5">
                  <h4 className="text-sm font-bold text-black flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Our Store Gifts (Reserved in Inventory)</span>
                  </h4>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Ready at Hub
                  </span>
                </div>

                <div className="space-y-3">
                  {order.internalItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-black/5">
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-200 shrink-0">
                        <Image src={item.imageUrl || ""} alt={item.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-black truncate">{item.title}</div>
                        <div className="text-[11px] text-black/60">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-xs font-extrabold text-black">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* External Procurement Items */}
              <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/5">
                  <h4 className="text-sm font-bold text-black flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>External Products (Procurement Pipeline)</span>
                  </h4>
                  <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {order.externalItems.length} Sourced
                  </span>
                </div>

                <div className="space-y-3">
                  {order.externalItems.map((ext) => (
                    <div key={ext.id} className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 space-y-1.5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-200 shrink-0">
                          <Image src={ext.imageUrl || ""} alt={ext.productName} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200 px-1 rounded">
                              {ext.marketplace}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700">
                              Status: {ext.procurementStatus}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-black truncate">{ext.productName}</div>
                          <div className="text-[11px] font-bold text-black">₹{ext.price.toLocaleString("en-IN")}</div>
                        </div>
                      </div>
                      {ext.procurementNotes && (
                        <div className="text-[11px] text-black/60 bg-white/80 p-2 rounded border border-amber-200/40">
                          📝 {ext.procurementNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Packaging, Wax Seal & Greeting Card Preview */}
            <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-xs">
              <h4 className="text-sm font-bold text-black mb-3">Custom Packaging & Personalized Card</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#fafafa] border border-black/5 text-xs space-y-1.5">
                  <div className="font-bold text-black">Packaging Style: {order.packaging.name}</div>
                  <div className="text-black/60">Satin Accent: {order.packaging.ribbonColor} ribbon</div>
                  <div className="text-black/60">
                    Wax Seal: {order.packaging.waxSeal ? "✓ Gold wax seal stamped" : "No wax seal"}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#fffdf9] border border-amber-200/80 font-serif text-xs leading-relaxed text-black/80">
                  <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-800 mb-1">
                    Card Inscription
                  </div>
                  &ldquo;{order.giftMessage}&rdquo;
                </div>
              </div>
            </div>
          </div>
        )}

        {!order && !loading && !error && (
          <div className="bg-white rounded-3xl p-8 border border-black/[0.08] shadow-xs text-center max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center text-2xl mx-auto font-bold">
              📦
            </div>
            <h3 className="text-base font-bold text-black">Live Order Tracking</h3>
            <p className="text-xs text-black/60 leading-relaxed">
              Enter your Dua Gifts Order ID (received upon Cashfree payment confirmation, e.g. <span className="font-mono font-semibold text-black">DG-IN-XXXXXX</span>) above to view real-time assembly, quality inspection, and carrier dispatch updates.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-left">
              <div className="p-2.5 rounded-xl bg-[#fafafc] border border-black/5">
                <span className="text-[10px] font-bold uppercase text-emerald-700 block">Step 1</span>
                <span className="text-xs font-semibold text-black">Cashfree Verified</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#fafafc] border border-black/5">
                <span className="text-[10px] font-bold uppercase text-amber-700 block">Step 2</span>
                <span className="text-xs font-semibold text-black">Hub Assembly</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#fafafc] border border-black/5">
                <span className="text-[10px] font-bold uppercase text-purple-700 block">Step 3</span>
                <span className="text-xs font-semibold text-black">Wax Seal &amp; QC</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#fafafc] border border-black/5">
                <span className="text-[10px] font-bold uppercase text-blue-700 block">Step 4</span>
                <span className="text-xs font-semibold text-black">Express Transit</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50/70 border border-red-200 rounded-3xl p-6 text-center max-w-md mx-auto space-y-3">
            <span className="text-2xl">⚠️</span>
            <h4 className="text-sm font-bold text-red-900">Order Not Found</h4>
            <p className="text-xs text-red-700 leading-relaxed">{error}</p>
            <div className="pt-2">
              <a
                href="https://wa.me/919528247811"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold transition-colors"
              >
                <span>Chat on WhatsApp (+91 95282 47811)</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#fafafa] flex items-center justify-center text-xs font-semibold text-black/50">Loading gift tracker...</div>}>
      <TrackContent />
    </React.Suspense>
  );
}
