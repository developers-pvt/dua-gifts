"use client";

import BreadcrumbCart from "@/components/cart-page/BreadcrumbCart";
import ProductCard from "@/components/cart-page/ProductCard";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import { FaArrowRight } from "react-icons/fa6";
import { MdOutlineLocalOffer } from "react-icons/md";
import { TbBasketExclamation } from "react-icons/tb";
import React, { useState } from "react";
import { RootState } from "@/lib/store";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { applyPromo, removePromo } from "@/lib/features/carts/cartsSlice";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { cart, totalPrice, adjustedTotalPrice, appliedPromo, promoDiscount } =
    useAppSelector((state: RootState) => state.carts);

  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [selectedPackaging, setSelectedPackaging] = useState<number>(0); // 0: Standard Kraft, 499: Luxury Velvet, 799: Keepsake Crate

  const formatPrice = (val: number) => `₹${Math.round(val).toLocaleString("en-IN")}`;

  // Dynamic Shipping Calculation: Free on orders >= ₹999, else ₹99
  const isFreeDelivery = adjustedTotalPrice >= 999;
  const deliveryFee = isFreeDelivery ? 0 : 99;
  const packagingFee = selectedPackaging;
  const totalPayable = Math.max(0, adjustedTotalPrice - promoDiscount + deliveryFee + packagingFee);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (["FIRSTGIFT", "DIWALI20", "WELCOME10", "FREESHIP"].includes(code)) {
      dispatch(applyPromo(code));
      setPromoInput("");
    } else {
      setPromoError("Invalid promo code. Try FIRSTGIFT, DIWALI20, or WELCOME10");
    }
  };

  const handleProceedToCheckout = () => {
    // Save chosen packaging to localStorage for unified checkout
    localStorage.setItem("gift_packaging_fee", String(packagingFee));
    router.push("/checkout");
  };

  return (
    <main className="pb-24 pt-4 bg-[#fafafc] min-h-screen">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        {cart && cart.items.length > 0 ? (
          <>
            <BreadcrumbCart />
            <div className="flex items-baseline justify-between mb-6">
              <h1
                className={cn([
                  integralCF.className,
                  "font-bold text-[28px] md:text-[38px] text-black tracking-tight",
                ])}
              >
                YOUR SHOPPING CART
              </h1>
              <span className="text-xs sm:text-sm font-medium text-black/50">
                {cart.totalQuantities} {cart.totalQuantities === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Cart Items List */}
              <div className="w-full flex-1 bg-white p-4 sm:p-6 rounded-3xl border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                  <span className="text-xs uppercase font-semibold text-black/50 tracking-wider">
                    Item Details
                  </span>
                  <Link
                    href="/shop-anywhere"
                    className="text-xs font-semibold text-black hover:underline flex items-center gap-1"
                  >
                    <span>+ Search on Flipkart/Meesho</span>
                  </Link>
                </div>

                <div className="divide-y divide-black/[0.06]">
                  {cart.items.map((product, idx) => (
                    <div key={`${product.id}-${idx}`} className="py-2">
                      <ProductCard data={product} />
                    </div>
                  ))}
                </div>

                {/* Packaging Selection in Cart */}
                <div className="pt-4 border-t border-black/[0.06]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black/60 mb-2.5">
                    Select Gift Presentation Box
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { name: "Minimal Eco Kraft", price: 0, desc: "Eco-friendly craft wrap" },
                      { name: "Luxury Velvet Box", price: 499, desc: "Royal velvet box with satin ribbon" },
                      { name: "Wooden Keepsake Crate", price: 799, desc: "Handcrafted pine wood crate" },
                    ].map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedPackaging(opt.price)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          selectedPackaging === opt.price
                            ? "border-black bg-black/[0.03] shadow-xs"
                            : "border-black/[0.08] bg-[#fbfbfd] hover:border-black/20"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-xs text-black">{opt.name}</span>
                          <span className="text-xs font-bold text-black">
                            {opt.price === 0 ? "Free" : formatPrice(opt.price)}
                          </span>
                        </div>
                        <p className="text-[10px] text-black/50">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary Box */}
              <div className="w-full lg:max-w-[420px] bg-white p-6 rounded-3xl border border-black/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-5 sticky top-24">
                <h2 className="text-xl font-bold text-black tracking-tight border-b border-black/[0.06] pb-3">
                  Order Summary
                </h2>

                <div className="flex flex-col space-y-3.5 text-sm">
                  <div className="flex items-center justify-between text-black/70">
                    <span>Original Price</span>
                    <span className="font-medium text-black">{formatPrice(totalPrice)}</span>
                  </div>

                  {totalPrice > adjustedTotalPrice && (
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>Item Discounts</span>
                      <span className="font-semibold">
                        -{formatPrice(totalPrice - adjustedTotalPrice)}
                      </span>
                    </div>
                  )}

                  {appliedPromo && (
                    <div className="flex items-center justify-between text-emerald-700 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                      <div>
                        <div className="font-semibold text-xs flex items-center gap-1">
                          <span>🏷️</span>
                          <span>{appliedPromo.code}</span>
                        </div>
                        <div className="text-[10px] text-emerald-800/80">
                          {appliedPromo.description}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">-{formatPrice(promoDiscount)}</span>
                        <button
                          type="button"
                          onClick={() => dispatch(removePromo())}
                          className="text-xs text-red-500 hover:text-red-700 font-bold ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-black/70">
                    <span>Gift Packaging</span>
                    <span className="font-medium text-black">
                      {packagingFee === 0 ? "Free Included" : formatPrice(packagingFee)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-black/70">
                    <span>Delivery Across India</span>
                    <span className={`font-semibold ${isFreeDelivery ? "text-emerald-700" : "text-black"}`}>
                      {isFreeDelivery ? "FREE" : formatPrice(deliveryFee)}
                    </span>
                  </div>

                  {!isFreeDelivery && (
                    <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200">
                      Add {formatPrice(999 - adjustedTotalPrice)} more for <strong>Free Delivery</strong> anywhere in India!
                    </div>
                  )}

                  <hr className="border-t-black/[0.08] my-1" />

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-base font-bold text-black block">Total Payable</span>
                      <span className="text-[11px] text-black/40">Includes all GST & taxes</span>
                    </div>
                    <span className="text-2xl font-black text-black tracking-tight">
                      {formatPrice(totalPayable)}
                    </span>
                  </div>
                </div>

                {/* Promo Code Form */}
                <form onSubmit={handleApplyPromo} className="space-y-1.5 pt-1">
                  <div className="flex gap-2">
                    <InputGroup className="bg-[#f5f5f7] border border-black/[0.08] rounded-2xl h-11">
                      <InputGroup.Text>
                        <MdOutlineLocalOffer className="text-black/40 text-xl ml-2" />
                      </InputGroup.Text>
                      <InputGroup.Input
                        type="text"
                        name="code"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Promo code (e.g. FIRSTGIFT)"
                        className="bg-transparent placeholder:text-black/40 text-xs uppercase"
                      />
                    </InputGroup>
                    <Button
                      type="submit"
                      className="bg-black hover:bg-black/85 text-white rounded-2xl px-5 h-11 text-xs font-semibold shrink-0 active:scale-[0.98] transition-all"
                    >
                      Apply
                    </Button>
                  </div>
                  {promoError && (
                    <p className="text-[11px] text-red-600 font-medium pl-1">{promoError}</p>
                  )}
                  <div className="flex gap-2 text-[10px] text-black/50 pt-1">
                    <span>Try:</span>
                    <button
                      type="button"
                      onClick={() => dispatch(applyPromo("FIRSTGIFT"))}
                      className="underline font-semibold text-black/70 hover:text-black"
                    >
                      FIRSTGIFT
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => dispatch(applyPromo("DIWALI20"))}
                      className="underline font-semibold text-black/70 hover:text-black"
                    >
                      DIWALI20
                    </button>
                  </div>
                </form>

                {/* Dynamic Checkout Button */}
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full py-4 bg-black hover:bg-black/90 active:scale-[0.98] text-white rounded-full font-semibold text-sm tracking-wide shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Proceed to Checkout</span>
                  <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="text-[11px] text-center text-black/40 space-y-0.5">
                  <div>🔒 256-bit Encrypted SSL Secure Payment</div>
                  <div>100% Cashfree Secure Gateway • UPI, Cards &amp; NetBanking</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center flex-col text-gray-400 mt-28 max-w-sm mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-black/[0.03] flex items-center justify-center mb-4">
              <TbBasketExclamation strokeWidth={1.5} className="text-4xl text-black/40" />
            </div>
            <h2 className="text-lg font-bold text-black mb-1">Your cart is currently empty</h2>
            <p className="text-xs text-black/50 mb-6">
              Discover personalized in-store gifts or search products on Flipkart, Shopsy & Meesho.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button className="rounded-full flex-1 bg-black hover:bg-black/90" asChild>
                <Link href="/shop">Browse Gifts</Link>
              </Button>
              <Button variant="outline" className="rounded-full flex-1 border-black/15" asChild>
                <Link href="/shop-anywhere">Inbuilt Browser</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
