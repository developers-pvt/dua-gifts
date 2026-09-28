"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { clearCart } from "@/lib/features/carts/cartsSlice";
import { MedusaApi, GiftPackagingOption, GiftOrder } from "@/lib/medusa";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { FaCheckCircle, FaLock, FaTruck, FaShieldAlt } from "react-icons/fa";

const INDIAN_STATES = [
  "Delhi NCR",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Uttar Pradesh",
  "Gujarat",
  "West Bengal",
  "Telangana",
  "Rajasthan",
  "Kerala",
  "Punjab",
  "Haryana",
  "Madhya Pradesh",
  "Bihar",
  "Andhra Pradesh",
  "Odisha",
  "Assam",
  "Goa",
  "Uttarakhand",
  "Himachal Pradesh",
  "Jharkhand",
  "Chhattisgarh",
  "Chandigarh",
  "Jammu & Kashmir",
];

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { cart, adjustedTotalPrice, appliedPromo, promoDiscount } = useAppSelector(
    (state: RootState) => state.carts
  );

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("Maharashtra");
  const [pinCode, setPinCode] = useState("");

  // Delivery Speed
  const [deliverySpeed, setDeliverySpeed] = useState<"standard" | "express" | "sameday">("standard");

  // Gift Hamper Customization
  const [isGiftForSomeone, setIsGiftForSomeone] = useState(true);
  const [recipientName, setRecipientName] = useState("");
  const [giftOccasion, setGiftOccasion] = useState("Birthday Celebration");
  const [giftMessage, setGiftMessage] = useState("");
  const [waxSealColor, setWaxSealColor] = useState("Royal Gold");

  // Payment Method: Exclusively Cashfree Secure Payment Gateway
  const paymentMethod = "cashfree";

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [packagingFee, setPackagingFee] = useState(0);

  useEffect(() => {
    const fee = localStorage.getItem("gift_packaging_fee");
    if (fee) {
      setPackagingFee(Number(fee) || 0);
    }
  }, []);

  const formatPrice = (val: number) => `₹${Math.round(val).toLocaleString("en-IN")}`;

  // Shipping Calculations
  const isFreeDelivery = adjustedTotalPrice >= 999;
  let shippingCost = isFreeDelivery ? 0 : 99;
  if (deliverySpeed === "express") shippingCost += 149;
  if (deliverySpeed === "sameday") shippingCost += 299;

  const totalPayable = Math.max(0, adjustedTotalPrice - promoDiscount + shippingCost + packagingFee);

  // If cart is empty and not submitting, redirect to cart
  const items = cart?.items || [];

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Your cart is empty. Please add products before placing an order.");
      return;
    }

    setIsSubmitting(true);

    const generatedOrderNumber = `DG-IN-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderData: Partial<GiftOrder> = {
      orderNumber: generatedOrderNumber,
      customerName: fullName,
      customerEmail: email,
      customerPhone: phone,
      currentStage: "ORDER_PLACED" as const,
      stageProgress: 15,
      internalItems: items
        .filter((item) => !item.marketplace || item.marketplace === "Dua Gifts")
        .map((item) => ({
          id: String(item.id),
          productId: String(item.id),
          title: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.srcUrl,
        })),
      externalItems: items
        .filter((item) => item.marketplace && item.marketplace !== "Dua Gifts")
        .map((item) => ({
          id: `ext_${item.id}`,
          sourceUrl: item.sourceUrl || "https://flipkart.com",
          marketplace: item.marketplace || "Flipkart",
          productName: item.name,
          price: item.price,
          currency: "INR",
          imageUrl: item.srcUrl,
          procurementStatus: "PENDING" as const,
          procurementNotes: `Procure from ${item.marketplace} for delivery to ${city}, ${stateName}`,
        })),
      packaging: {
        type: (packagingFee === 799 ? "WOODEN_KEEPSAKE_CRATE" : packagingFee === 499 ? "LUXURY_VELVET_BOX" : "MINIMAL_ECO_KRAFT") as GiftPackagingOption["type"],
        name: packagingFee === 799 ? "Wooden Keepsake Crate" : packagingFee === 499 ? "Luxury Velvet Box" : "Minimal Eco Kraft",
        price: packagingFee,
        ribbonColor: waxSealColor,
        waxSeal: true,
      },
      giftMessage: giftMessage || "Best wishes on your special celebration!",
      recipient: {
        name: isGiftForSomeone ? recipientName || fullName : fullName,
        phone,
        street,
        city,
        state: stateName,
        postalCode: pinCode,
        country: "India",
        giftOccasion,
      },
      subtotal: adjustedTotalPrice,
      packagingFee,
      shippingFee: shippingCost,
      totalAmount: totalPayable,
      paymentGateway: "CASHFREE" as const,
      paymentStatus: "PENDING" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      slaStatus: "ON_TRACK" as const,
      timeline: [
        {
          stage: "ORDER_PLACED" as const,
          title: "Order Initiated & Launching Cashfree Gateway",
          completedAt: new Date().toISOString(),
          notes: "Awaiting instant payment confirmation via Cashfree PG",
          actor: "Customer Checkout",
        },
      ],
    };

    try {
      // 1. Initialize Cashfree Order session
      const cfRes = await fetch("/api/cashfree/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: generatedOrderNumber,
          orderAmount: totalPayable,
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
          returnUrl: `${window.location.origin}/payment/verify?order_id={order_id}`,
        }),
      });

      const cfData = await cfRes.json();
      if (!cfData.success || !cfData.paymentSessionId) {
        throw new Error(cfData.error || "Failed to initialize Cashfree payment session.");
      }

      // Attach Cashfree Order details
      orderData.cashfreeOrderId = cfData.cfOrderId;

      // 2. Persist order to Backend PostgreSQL & Medusa
      try {
        await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });
      } catch (err) {
        console.warn("Backend order sync notification:", err);
      }

      // 3. Save order locally for instant client state
      const existingOrders = JSON.parse(localStorage.getItem("gift_user_orders") || "[]");
      localStorage.setItem("gift_user_orders", JSON.stringify([orderData, ...existingOrders]));
      localStorage.setItem("last_placed_order", JSON.stringify(orderData));

      // 4. Load Cashfree Web SDK v3 dynamically
      const loadSdk = (): Promise<any> => {
        if ((window as any).Cashfree) return Promise.resolve((window as any).Cashfree);
        return new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
          script.async = true;
          script.onload = () => resolve((window as any).Cashfree);
          script.onerror = () => reject(new Error("Unable to load Cashfree Payment SDK. Please check your internet connection."));
          document.body.appendChild(script);
        });
      };

      const CashfreeConstructor = await loadSdk();
      const cashfree = CashfreeConstructor({
        mode: (process.env.NEXT_PUBLIC_CASHFREE_ENV || "PRODUCTION").toLowerCase() === "production" ? "production" : "sandbox",
      });

      // 5. Launch Cashfree Unified Checkout
      cashfree.checkout({
        paymentSessionId: cfData.paymentSessionId,
        redirectTarget: "_self", // Redirects cleanly to Cashfree and returns to /payment/verify
      });
    } catch (error: any) {
      alert(error.message || "There was an issue connecting to Cashfree Payment Gateway. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Apple Style Top Header */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-black/[0.06]">
          <Link href="/cart" className="flex items-center gap-2 text-xs font-semibold text-black/60 hover:text-black transition-colors">
            <span>←</span>
            <span>Back to Cart</span>
          </Link>
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Unified Single Checkout
            </span>
            <h1 className={cn([integralCF.className, "text-2xl sm:text-3xl text-black mt-1"])}>
              SECURE CHECKOUT
            </h1>
          </div>
          <div className="flex items-center gap-1 text-xs text-black/50">
            <FaLock className="text-emerald-600" />
            <span className="hidden sm:inline">256-bit SSL</span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-black/[0.08] p-8 max-w-md mx-auto">
            <h2 className="text-lg font-bold mb-2">No items to checkout</h2>
            <p className="text-xs text-black/50 mb-6">Your shopping cart is currently empty.</p>
            <ButtonLink href="/shop">Browse Store Gifts</ButtonLink>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Details */}
            <div className="lg:col-span-7 space-y-6">
              {/* Section 1: Customer Contact & Delivery Address in India */}
              <div className="bg-white p-6 rounded-3xl border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                  <h3 className="font-bold text-base text-black flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-mono">1</span>
                    <span>Shipping Address (India)</span>
                  </h3>
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <FaTruck /> Pan-India Express
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-black/70 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-black/[0.12] bg-[#fbfbfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-black/70 mb-1">Email (for live dispatch tracking)</label>
                    <input
                      type="email"
                      required
                      placeholder="rahul@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-black/[0.12] bg-[#fbfbfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-black/70 mb-1">Phone Number (+91)</label>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      placeholder="10-digit mobile (e.g. 9528247811)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-black/[0.12] bg-[#fbfbfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-black/70 mb-1">Street Address, Apartment, Flat / House No.</label>
                    <input
                      type="text"
                      required
                      placeholder="Flat 402, Lotus Towers, MG Road"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-black/[0.12] bg-[#fbfbfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-black/70 mb-1">City</label>
                    <input
                      type="text"
                      required
                      placeholder="Mumbai / Delhi / Bengaluru"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-black/[0.12] bg-[#fbfbfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-black/70 mb-1">State</label>
                    <select
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-black/[0.12] bg-[#fbfbfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-black/70 mb-1">PIN Code (6 digits)</label>
                    <input
                      type="text"
                      required
                      pattern="[0-9]{6}"
                      placeholder="400001"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-black/[0.12] bg-[#fbfbfd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
                    />
                  </div>
                </div>

                {/* Delivery Speed Options */}
                <div className="pt-3 border-t border-black/[0.06]">
                  <label className="block text-xs font-semibold text-black/70 mb-2">Delivery Speed</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: "standard", label: "Standard Delivery", time: "3-5 Business Days", fee: isFreeDelivery ? "FREE" : "₹99" },
                      { id: "express", label: "Express Air Delivery", time: "24-48 Hours", fee: "+₹149" },
                      { id: "sameday", label: "Same-Day Metro", time: "Within 12 Hours", fee: "+₹299" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDeliverySpeed(opt.id as any)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          deliverySpeed === opt.id
                            ? "border-black bg-black/[0.04] shadow-xs"
                            : "border-black/[0.08] hover:border-black/20"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-xs text-black">{opt.label}</span>
                          <span className="text-xs font-bold text-emerald-700">{opt.fee}</span>
                        </div>
                        <p className="text-[10px] text-black/50 mt-0.5">{opt.time}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 2: Gifting & Custom Note */}
              <div className="bg-white p-6 rounded-3xl border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                  <h3 className="font-bold text-base text-black flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-mono">2</span>
                    <span>Gift Personalization & Note</span>
                  </h3>
                  <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold">
                    Wax Seal Included
                  </span>
                </div>

                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-black/70 mb-1">Recipient Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Priya & Karan"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-black/[0.12] bg-[#fbfbfd] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-black/70 mb-1">Celebration Occasion</label>
                      <select
                        value={giftOccasion}
                        onChange={(e) => setGiftOccasion(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-black/[0.12] bg-[#fbfbfd] focus:bg-white focus:outline-none"
                      >
                        <option value="Birthday Celebration">Birthday Celebration</option>
                        <option value="Wedding & Anniversary">Wedding & Anniversary</option>
                        <option value="Diwali & Festive Celebration">Diwali & Festive Celebration</option>
                        <option value="Raksha Bandhan">Raksha Bandhan</option>
                        <option value="Housewarming & Griha Pravesh">Housewarming & Griha Pravesh</option>
                        <option value="Corporate Congratulations">Corporate Congratulations</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-black/70 mb-1">
                      Personal Greeting Message (Handwritten Calligraphy Card)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Write your heart-warming message here. We print and hand-seal it with royal wax into your gift hamper..."
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-black/[0.12] bg-[#fbfbfd] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-black/70 mb-1.5">Wax Seal Stamp Color</label>
                    <div className="flex gap-2">
                      {["Royal Gold", "Ruby Red", "Emerald Green", "Midnight Black"].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setWaxSealColor(color)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            waxSealColor === color
                              ? "bg-black text-white border-black"
                              : "bg-[#f5f5f7] text-black/70 border-black/10 hover:border-black/30"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Exclusive Cashfree Secure Payment Gateway */}
              <div className="bg-white p-6 rounded-3xl border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                  <h3 className="font-bold text-base text-black flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-mono">3</span>
                    <span>Payment Gateway</span>
                  </h3>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Cashfree Official PG
                  </span>
                </div>

                <div className="p-5 rounded-2xl border border-emerald-600/40 bg-emerald-50/30 ring-1 ring-emerald-500/20 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        ₹
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-black">Cashfree Payments India</span>
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            100% SECURE
                          </span>
                        </div>
                        <p className="text-xs text-black/60 mt-0.5">
                          Unified Checkout • Instant Automated Verification • Zero Surcharge
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-white border border-emerald-200 px-2.5 py-1 rounded-lg">
                      <FaShieldAlt className="text-emerald-600" />
                      <span>RBI Regulated</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-emerald-900/10 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-black/50 block">
                      Accepted Payment Methods via Cashfree
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-white border border-black/[0.08] p-2.5 rounded-xl text-center">
                        <span className="font-bold text-xs text-emerald-800 block">UPI &amp; QR</span>
                        <span className="text-[10px] text-black/50">GPay, PhonePe, Paytm</span>
                      </div>
                      <div className="bg-white border border-black/[0.08] p-2.5 rounded-xl text-center">
                        <span className="font-bold text-xs text-blue-800 block">Debit / Credit Cards</span>
                        <span className="text-[10px] text-black/50">RuPay, Visa, MC, Amex</span>
                      </div>
                      <div className="bg-white border border-black/[0.08] p-2.5 rounded-xl text-center">
                        <span className="font-bold text-xs text-purple-800 block">50+ Banks</span>
                        <span className="text-[10px] text-black/50">NetBanking Direct</span>
                      </div>
                      <div className="bg-white border border-black/[0.08] p-2.5 rounded-xl text-center">
                        <span className="font-bold text-xs text-amber-800 block">Wallets &amp; Cred</span>
                        <span className="text-[10px] text-black/50">Instant 1-Click Pay</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-black/50 bg-white/80 p-2.5 rounded-xl border border-black/[0.05] flex items-center gap-2">
                    <FaLock className="text-emerald-600 shrink-0" />
                    <span>
                      256-bit bank grade encryption. When you click proceed, Cashfree will securely launch to complete your transaction and immediately return to your order receipt.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Place Order Button */}
            <div className="lg:col-span-5 sticky top-24 space-y-5">
              <div className="bg-white p-6 rounded-3xl border border-black/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-5">
                <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                  <h2 className="font-bold text-lg text-black tracking-tight">Order Items ({items.length})</h2>
                  <Link href="/cart" className="text-xs font-semibold text-black/50 hover:underline">
                    Edit Cart
                  </Link>
                </div>

                {/* Items Preview */}
                <div className="max-h-60 overflow-y-auto divide-y divide-black/[0.04] pr-1 space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 pt-2">
                      <div className="w-12 h-12 bg-[#f5f5f7] rounded-lg shrink-0 overflow-hidden relative border border-black/[0.04]">
                        <Image
                          src={item.srcUrl}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-black/[0.05]">
                            {item.marketplace || "Dua Gifts"}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-black truncate">{item.name}</h4>
                        <div className="text-[11px] text-black/50">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-xs font-bold text-black">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-2.5 text-xs border-t border-black/[0.06] pt-4">
                  <div className="flex justify-between text-black/70">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-black">{formatPrice(adjustedTotalPrice)}</span>
                  </div>

                  {appliedPromo && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Promo Discount ({appliedPromo.code})</span>
                      <span className="font-semibold">-{formatPrice(promoDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-black/70">
                    <span>Gift Packaging</span>
                    <span className="font-semibold text-black">
                      {packagingFee === 0 ? "Free Included" : formatPrice(packagingFee)}
                    </span>
                  </div>

                  <div className="flex justify-between text-black/70">
                    <span>Pan-India Delivery</span>
                    <span className="font-semibold text-emerald-700">
                      {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                    </span>
                  </div>

                  <div className="border-t border-black/[0.08] pt-3 flex justify-between items-baseline">
                    <div>
                      <span className="text-sm font-bold text-black block">Total Amount</span>
                      <span className="text-[10px] text-black/40">Includes all GST & consolidated packing</span>
                    </div>
                    <span className="text-2xl font-black text-black tracking-tight">
                      {formatPrice(totalPayable)}
                    </span>
                  </div>
                </div>

                {/* Submit Order Button - Exclusively Cashfree */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-full font-bold text-sm tracking-wide shadow-md hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  <FaShieldAlt className="text-sm text-white" />
                  <span>
                    {isSubmitting
                      ? "Connecting to Cashfree Gateway..."
                      : `PAY ${formatPrice(totalPayable)} VIA CASHFREE →`}
                  </span>
                </button>

                <div className="space-y-1.5 pt-2 text-[11px] text-center text-black/45">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-semibold">
                    <FaCheckCircle className="text-xs" />
                    <span>Single Consolidated Shipment Guaranteed</span>
                  </div>
                  <p>All items sourced, quality checked, assembled, and packed in India.</p>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function ButtonLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-block px-6 py-3 rounded-full bg-black text-white text-xs font-semibold hover:bg-black/85 transition-colors"
    >
      {children}
    </Link>
  );
}
