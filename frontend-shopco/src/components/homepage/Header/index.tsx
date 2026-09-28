"use client";

import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";

const Header = () => {
  return (
    <header className="relative bg-gradient-to-b from-[#fafafc] to-[#f5f5f7] pt-8 md:pt-16 pb-12 border-b border-black/[0.06] overflow-hidden">
      <div className="md:max-w-frame mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 items-center gap-8 px-4 xl:px-0">
        <section className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-black/[0.04] text-black/80 border border-black/[0.06] mb-5 backdrop-blur-md"
          >
            <span className="text-amber-600">✦</span>
            <span>India&apos;s 1st Consolidated Gifting & Marketplace Hub</span>
          </motion.div>

          <motion.h1
            initial={{ y: 25, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={cn([
              integralCF.className,
              "text-3xl sm:text-4xl lg:text-[50px] lg:leading-[54px] mb-4 text-black tracking-tight",
            ])}
          >
            COMBINE OUR GIFTS + FLIPKART, SHOPSY & MEESHO
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-black/60 text-sm lg:text-base mb-7 leading-relaxed font-normal"
          >
            Choose from our curated in-store gifts or search products inside our <strong>inbuilt browser</strong> across Flipkart, Shopsy, Meesho & Amazon India.
            <strong> Pay once</strong>, and we procure, QC inspect, package with custom wax-seal, and deliver anywhere across India!
          </motion.p>

          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-3 mb-8"
          >
            <Link
              href="/create-gift"
              className="inline-flex items-center gap-2 bg-black hover:bg-black/90 active:scale-[0.98] transition-all text-white px-7 py-3.5 rounded-full text-sm font-semibold shadow-md hover:shadow-xl"
            >
              <span>🎁</span>
              <span>Create Gift Hamper</span>
            </Link>
            <Link
              href="/shop-anywhere"
              className="inline-flex items-center gap-2 bg-white/80 hover:bg-white active:scale-[0.98] border border-black/10 transition-all text-black px-6 py-3.5 rounded-full text-sm font-semibold shadow-xs backdrop-blur-md"
            >
              <span>🌐</span>
              <span>Inbuilt Browser</span>
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center gap-1.5 px-3 py-3 text-xs font-medium text-black/60 hover:text-black transition-colors"
            >
              Track an existing gift →
            </Link>
          </motion.div>

          {/* Stats Bar - Apple minimal counters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-between sm:justify-start flex-wrap gap-4 sm:gap-8 py-3 border-t border-black/[0.08]"
          >
            <div className="flex flex-col">
              <span className="font-bold text-xl lg:text-2xl text-black tracking-tight">
                <AnimatedCounter from={0} to={100} />%
              </span>
              <span className="text-[11px] text-black/50 font-medium">Quality Checked</span>
            </div>
            <Separator orientation="vertical" className="h-8 bg-black/[0.08] hidden sm:block" />
            <div className="flex flex-col">
              <span className="font-bold text-xl lg:text-2xl text-black tracking-tight">
                28+
              </span>
              <span className="text-[11px] text-black/50 font-medium">Indian States Delivered</span>
            </div>
            <Separator orientation="vertical" className="h-8 bg-black/[0.08] hidden sm:block" />
            <div className="flex flex-col">
              <span className="font-bold text-xl lg:text-2xl text-black tracking-tight">1-Click</span>
              <span className="text-[11px] text-black/50 font-medium">Pay Once Checkout</span>
            </div>
          </motion.div>
        </section>

        {/* Visual Workflow Graphic - Apple Style Card */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center"
        >
          <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-black/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.06)] space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-black/60">
                Consolidated Gifting Engine
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#f5f5f7] border border-black/[0.04]">
                <span className="text-xl">1️⃣</span>
                <div>
                  <div className="font-semibold text-black">Dua Gifts + Flipkart / Shopsy / Meesho</div>
                  <div className="text-[11px] text-black/55">Search inside our inbuilt browser & add products to cart</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#f5f5f7] border border-black/[0.04]">
                <span className="text-xl">2️⃣</span>
                <div>
                  <div className="font-semibold text-black">Luxury Indian Packaging & AI Note</div>
                  <div className="text-[11px] text-black/55">Velvet keepsake box, satin ribbon & wax seal</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#f5f5f7] border border-black/[0.04]">
                <span className="text-xl">3️⃣</span>
                <div>
                  <div className="font-semibold text-black">Pay Once (Single Dynamic Checkout)</div>
                  <div className="text-[11px] text-black/55">UPI, Cards, NetBanking or COD covers everything</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
                <span className="text-xl">4️⃣</span>
                <div>
                  <div className="font-semibold text-amber-950">We Procure → QC Check → Deliver Pan-India!</div>
                  <div className="text-[11px] text-amber-900/80">6-stage live fulfillment pipeline with SMS & tracking</div>
                </div>
              </div>
            </div>

            <Link
              href="/create-gift"
              className="block w-full py-3 text-center bg-black hover:bg-black/90 active:scale-[0.98] text-white rounded-full text-xs font-semibold tracking-wide transition-all shadow-sm"
            >
              Start Building Your Hamper →
            </Link>
          </div>
        </motion.section>
      </div>
    </header>
  );
};

export default Header;
