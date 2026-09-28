"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MedusaApi, InternalProductItem, ExternalProductItem, GiftPackagingOption } from "@/lib/medusa";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { FaShieldAlt, FaLock } from "react-icons/fa";

const PACKAGING_OPTIONS: GiftPackagingOption[] = [
  {
    type: "LUXURY_VELVET_BOX",
    name: "Royal Midnight Velvet Box",
    price: 499,
    ribbonColor: "Champagne Gold",
    waxSeal: true,
  },
  {
    type: "WOODEN_KEEPSAKE_CRATE",
    name: "Handcrafted Teakwood Crate",
    price: 799,
    ribbonColor: "Forest Green",
    waxSeal: true,
  },
  {
    type: "MINIMAL_ECO_KRAFT",
    name: "Minimalist Eco-Kraft Box",
    price: 0,
    ribbonColor: "Burgundy",
    waxSeal: false,
  },
];

export default function CreateGiftPage() {
  const router = useRouter();

  // Internal and External items
  const [internalItems, setInternalItems] = useState<InternalProductItem[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [externalItems, setExternalItems] = useState<ExternalProductItem[]>([]);

  // Packaging selection
  const [selectedPackaging, setSelectedPackaging] = useState<GiftPackagingOption>(PACKAGING_OPTIONS[0]);
  const [ribbonColor, setRibbonColor] = useState("Champagne Gold");
  const [includeWaxSeal, setIncludeWaxSeal] = useState(true);

  // Personalized Message + AI Generator
  const [giftMessage, setGiftMessage] = useState(
    "Wishing you a memorable celebration filled with love, laughter, and delightful surprises!"
  );
  const [aiTone, setAiTone] = useState("Heartfelt");
  const [aiGenerating, setAiGenerating] = useState(false);

  // Recipient Information
  const [recipientName, setRecipientName] = useState("Priya Verma");
  const [recipientPhone, setRecipientPhone] = useState("+91 95282 47811");
  const [recipientStreet, setRecipientStreet] = useState("Penthouse 4B, Silver Oak Heights, Indiranagar");
  const [recipientCity, setRecipientCity] = useState("Bengaluru");
  const [recipientState, setRecipientState] = useState("Karnataka");
  const [recipientPostalCode, setRecipientPostalCode] = useState("560038");
  const [giftOccasion, setGiftOccasion] = useState("Birthday Celebration");
  const [deliveryDate, setDeliveryDate] = useState("2026-09-28");

  // Customer info
  const [customerName, setCustomerName] = useState("Rahul Sharma");
  const [customerEmail, setCustomerEmail] = useState("rahul@example.com");

  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch live products from backend to populate in-store hamper selections
  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch("/api/products?limit=20");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.products) && data.products.length > 0) {
            setAvailableProducts(data.products);
            // Pre-select first 2 items from backend
            setInternalItems([
              {
                id: String(data.products[0].id),
                productId: String(data.products[0].id),
                title: data.products[0].title,
                price: data.products[0].price,
                quantity: 1,
                imageUrl: data.products[0].srcUrl,
              },
              {
                id: String(data.products[1].id),
                productId: String(data.products[1].id),
                title: data.products[1].title,
                price: data.products[1].price,
                quantity: 1,
                imageUrl: data.products[1].srcUrl,
              },
            ]);
          }
        }
      } catch (e) {
        console.warn("Could not load backend products for hamper builder:", e);
      }
    }
    loadCatalog();
  }, []);

  // 2. Load external items from localStorage if any
  useEffect(() => {
    try {
      const stored = localStorage.getItem("gift_external_items");
      if (stored) {
        setExternalItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Add / remove store items dynamically
  const handleAddStoreItem = (prod: any) => {
    const exists = internalItems.find((i) => i.id === String(prod.id));
    if (exists) {
      setInternalItems(
        internalItems.map((i) =>
          i.id === String(prod.id) ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setInternalItems([
        ...internalItems,
        {
          id: String(prod.id),
          productId: String(prod.id),
          title: prod.title,
          price: prod.price,
          quantity: 1,
          imageUrl: prod.srcUrl,
        },
      ]);
    }
  };

  const handleRemoveStoreItem = (id: string) => {
    setInternalItems(internalItems.filter((i) => i.id !== id));
  };

  const handleRemoveExternalItem = (id: string) => {
    const updated = externalItems.filter((i) => i.id !== id);
    setExternalItems(updated);
    localStorage.setItem("gift_external_items", JSON.stringify(updated));
  };

  // AI Message Generator handler
  const handleGenerateAIMessage = async () => {
    setAiGenerating(true);
    try {
      const message = await MedusaApi.generateAIGiftMessage({
        recipientName,
        occasion: giftOccasion,
        relationship: "Loved one",
        tone: aiTone,
      });
      setGiftMessage(message);
    } catch (err) {
      console.error(err);
    } finally {
      setAiGenerating(false);
    }
  };

  // Dynamic Calculations
  const internalSubtotal = internalItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const externalSubtotal = externalItems.reduce((acc, i) => acc + i.price, 0);
  const subtotal = internalSubtotal + externalSubtotal;
  const packagingFee = selectedPackaging.price;
  const shippingFee = subtotal >= 999 ? 0 : 99;
  const totalAmount = subtotal + packagingFee + shippingFee;

  // Single Cashfree Checkout Submission
  const handlePayOnce = async (e: React.FormEvent) => {
    e.preventDefault();
    if (internalItems.length === 0 && externalItems.length === 0) {
      alert("Please add at least one gift item to your hamper.");
      return;
    }

    setSubmitting(true);

    const generatedOrderNumber = `DG-IN-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderPayload = {
      orderNumber: generatedOrderNumber,
      customerName,
      customerEmail,
      customerPhone: recipientPhone,
      internalItems,
      externalItems,
      packaging: {
        ...selectedPackaging,
        ribbonColor,
        waxSeal: includeWaxSeal,
      },
      giftMessage,
      recipient: {
        name: recipientName,
        phone: recipientPhone,
        street: recipientStreet,
        city: recipientCity,
        state: recipientState,
        postalCode: recipientPostalCode,
        country: "India",
        deliveryDate,
        giftOccasion,
      },
      subtotal,
      packagingFee,
      shippingFee,
      totalAmount,
      paymentStatus: "PENDING" as const,
      paymentGateway: "CASHFREE" as const,
      currentStage: "ORDER_PLACED" as const,
      stageProgress: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      slaStatus: "ON_TRACK" as const,
      timeline: [
        {
          stage: "ORDER_PLACED" as const,
          title: "Order Initiated & Launching Cashfree Gateway",
          completedAt: new Date().toISOString(),
          notes: "Awaiting instant payment verification via Cashfree PG",
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
          orderAmount: totalAmount,
          customerName,
          customerEmail,
          customerPhone: recipientPhone,
          returnUrl: `${window.location.origin}/payment/verify?order_id={order_id}`,
        }),
      });

      const cfData = await cfRes.json();
      if (!cfData.success || !cfData.paymentSessionId) {
        throw new Error(cfData.error || "Failed to initialize Cashfree payment session.");
      }

      (orderPayload as any).cashfreeOrderId = cfData.cfOrderId;

      // 2. Persist order to Backend PostgreSQL & Medusa
      try {
        await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });
      } catch (err) {
        console.warn("Backend order sync notification:", err);
      }

      // 3. Save order locally
      const existingOrders = JSON.parse(localStorage.getItem("gift_user_orders") || "[]");
      localStorage.setItem("gift_user_orders", JSON.stringify([orderPayload, ...existingOrders]));
      localStorage.setItem("last_placed_order", JSON.stringify(orderPayload));

      // 4. Load Cashfree Web SDK v3
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

      // 5. Launch Cashfree Checkout
      cashfree.checkout({
        paymentSessionId: cfData.paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (err: any) {
      alert(err.message || "Failed to initialize Cashfree Payment Gateway. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
            🎁 Custom Gift Hamper Studio
          </span>
          <h1 className={cn([integralCF.className, "text-3xl sm:text-4xl text-black mt-2 mb-2"])}>
            CREATE YOUR CONSOLIDATED GIFT
          </h1>
          <p className="text-sm text-black/60 max-w-xl mx-auto">
            Combine items from our curated inventory + products from external websites into a single luxury
            hamper. Pay once via Cashfree, and we handle the sourcing, QC, assembly, packing, and delivery.
          </p>
        </div>

        <form onSubmit={handlePayOnce} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Customization Steps */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Hamper Contents */}
            <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/5">
                <h3 className="text-base font-bold text-black flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-mono">1</span>
                  <span>Hamper Items ({internalItems.length + externalItems.length} selected)</span>
                </h3>
                <Link
                  href="/shop-anywhere"
                  className="text-xs font-semibold text-amber-800 hover:text-amber-900 underline"
                >
                  + Add from External Site 🌐
                </Link>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {/* Internal Items */}
                {internalItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#fafafa] border border-black/5 justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <Image src={item.imageUrl || ""} alt={item.title} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            Dua Gifts Store
                          </span>
                        </div>
                        <div className="text-xs font-bold text-black truncate max-w-xs">{item.title}</div>
                        <div className="text-[11px] font-medium text-black/60">Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-sm font-bold text-black">₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStoreItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold px-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                {/* External Items */}
                {externalItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <Image src={item.imageUrl || ""} alt={item.productName} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded">
                            {item.marketplace} Procurement
                          </span>
                        </div>
                        <div className="text-xs font-bold text-black truncate max-w-xs">{item.productName}</div>
                        <div className="text-[10px] text-black/50 truncate">Will be sourced upon payment</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-sm font-bold text-black">₹{item.price.toLocaleString("en-IN")}</div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExternalItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold px-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add More Store Items Picker */}
              {availableProducts.length > 0 && (
                <div className="pt-3 border-t border-black/5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-black/60 block mb-2">
                    Add Items from Dua Gifts Catalog:
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {availableProducts.slice(0, 8).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleAddStoreItem(p)}
                        className="p-2 bg-white rounded-xl border border-black/10 hover:border-black/30 shrink-0 text-left w-36 space-y-1 transition-all"
                      >
                        <div className="w-full h-20 relative rounded-lg overflow-hidden bg-gray-50">
                          <Image src={p.srcUrl} alt={p.title} fill className="object-cover" />
                        </div>
                        <div className="text-[11px] font-bold truncate text-black">{p.title}</div>
                        <div className="text-[10px] font-semibold text-emerald-700">₹{p.price} + Add</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Packaging & Ribbon */}
            <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-xs">
              <h3 className="text-base font-bold text-black flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-mono">2</span>
                <span>Select Luxury Packaging</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                {PACKAGING_OPTIONS.map((pkg) => {
                  const isSelected = selectedPackaging.type === pkg.type;
                  return (
                    <div
                      key={pkg.type}
                      onClick={() => setSelectedPackaging(pkg)}
                      className={cn([
                        "p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between",
                        isSelected
                          ? "border-amber-600 bg-amber-50/40 ring-2 ring-amber-500/20"
                          : "border-black/10 hover:border-black/30 bg-white",
                      ])}
                    >
                      <div>
                        <div className="font-bold text-xs text-black">{pkg.name}</div>
                        <div className="text-[10px] text-black/50 mt-0.5">
                          {pkg.price === 0 ? "Free Included" : "Luxury finish"}
                        </div>
                      </div>
                      <div className="text-sm font-extrabold text-amber-900 mt-3">
                        {pkg.price === 0 ? "Free" : `+₹${pkg.price.toLocaleString("en-IN")}`}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ribbon & Wax Seal Customization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-black/5">
                <div>
                  <label className="block text-xs font-bold text-black mb-1.5">Satin Ribbon Accent</label>
                  <select
                    value={ribbonColor}
                    onChange={(e) => setRibbonColor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-black/15 bg-[#fbfbfb]"
                  >
                    <option value="Champagne Gold">Champagne Gold</option>
                    <option value="Royal Burgundy">Royal Burgundy</option>
                    <option value="Forest Green">Forest Green</option>
                    <option value="Silver Mist">Silver Mist</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="waxSealCheck"
                    checked={includeWaxSeal}
                    onChange={(e) => setIncludeWaxSeal(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <label htmlFor="waxSealCheck" className="text-xs font-semibold text-black cursor-pointer">
                    Hand-stamped Gold Wax Seal on Envelope
                  </label>
                </div>
              </div>
            </div>

            {/* Step 3: Personalized Message */}
            <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-black flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-mono">3</span>
                  <span>Handwritten Greeting Card</span>
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  AI Calligraphy Generator
                </span>
              </div>

              <div className="flex gap-2">
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-black/15 bg-[#fafafa]"
                >
                  <option value="Heartfelt">Heartfelt</option>
                  <option value="Romantic">Romantic</option>
                  <option value="Celebratory">Celebratory</option>
                  <option value="Formal">Formal & Professional</option>
                </select>
                <button
                  type="button"
                  onClick={handleGenerateAIMessage}
                  disabled={aiGenerating}
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {aiGenerating ? "Generating..." : "✨ AI Generate Message"}
                </button>
              </div>

              <textarea
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                rows={3}
                className="w-full p-3 text-xs rounded-xl border border-black/15 font-serif text-black/80 bg-[#fffdfa]"
                placeholder="Write your personal message..."
              />
            </div>

            {/* Step 4: Recipient Address in India */}
            <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-mono">4</span>
                <span>Delivery Address (Pan-India)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-black/70 mb-1">Recipient Full Name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-black/15"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-black/70 mb-1">Recipient Mobile</label>
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-black/15"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-black/70 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={recipientStreet}
                    onChange={(e) => setRecipientStreet(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-black/15"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-black/70 mb-1">City</label>
                  <input
                    type="text"
                    value={recipientCity}
                    onChange={(e) => setRecipientCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-black/15"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-black/70 mb-1">State</label>
                  <input
                    type="text"
                    value={recipientState}
                    onChange={(e) => setRecipientState(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-black/15"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-black/70 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={recipientPostalCode}
                    onChange={(e) => setRecipientPostalCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-black/15"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-black/70 mb-1">Occasion</label>
                  <input
                    type="text"
                    value={giftOccasion}
                    onChange={(e) => setGiftOccasion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-black/15"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Cashfree Pay */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white p-6 rounded-2xl border border-black/10 shadow-lg space-y-5">
              <div className="border-b border-black/10 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Cashfree Official Checkout
                </span>
                <h2 className="text-xl font-black text-black mt-1">PAY ONCE SUMMARY</h2>
                <p className="text-xs text-black/60">
                  One single payment covers our store gifts, external procurement, custom packaging, and delivery.
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-black/70">
                  <span>Our In-Store Gifts ({internalItems.length})</span>
                  <span className="font-semibold text-black">₹{internalSubtotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between text-black/70">
                  <span>External Products ({externalItems.length})</span>
                  <span className="font-semibold text-black">₹{externalSubtotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between text-black/70">
                  <span>Packaging ({selectedPackaging.name})</span>
                  <span className="font-semibold text-black">
                    {packagingFee === 0 ? "Free Included" : `₹${packagingFee.toLocaleString("en-IN")}`}
                  </span>
                </div>

                <div className="flex justify-between text-black/70">
                  <span>Pan-India Delivery</span>
                  <span className={`font-semibold ${shippingFee === 0 ? "text-emerald-700" : "text-black"}`}>
                    {shippingFee === 0 ? "FREE" : `₹${shippingFee.toLocaleString("en-IN")}`}
                  </span>
                </div>

                <div className="border-t border-black/10 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-black">Total Amount</span>
                  <span className="text-2xl font-black text-black">₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Sender Info Inputs */}
              <div className="space-y-3 pt-2 border-t border-black/5">
                <div>
                  <label className="block text-[11px] font-semibold text-black/70 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-black/15"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-black/70 mb-1">Your Email (for live dispatch tracking)</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-black/15"
                    required
                  />
                </div>
              </div>

              {/* Pay Once via Cashfree Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaShieldAlt className="text-sm text-white" />
                <span>
                  {submitting
                    ? "Connecting to Cashfree Gateway..."
                    : `PAY ₹${totalAmount.toLocaleString("en-IN")} VIA CASHFREE →`}
                </span>
              </button>

              <div className="text-[11px] text-center text-black/50 space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <FaLock className="text-emerald-600 text-[10px]" />
                  <span>100% Cashfree Encrypted PG • UPI, Cards &amp; NetBanking</span>
                </div>
                <div>Single payment covers automated procurement, QC check, and live tracking</div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
