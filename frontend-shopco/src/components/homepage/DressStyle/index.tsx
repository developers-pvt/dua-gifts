"use client";

import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import React from "react";
import { motion } from "framer-motion";
import DressStyleCard from "./DressStyleCard";

const DressStyle = () => {
  return (
    <div className="px-4 xl:px-0">
      <section className="max-w-frame mx-auto bg-[#f5f5f7] px-6 pb-8 pt-10 md:p-[60px] rounded-[32px] text-center border border-black/[0.04]">
        <motion.div
          initial={{ y: "40px", opacity: 0 }}
          whileInView={{ y: "0", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 md:mb-12"
        >
          <span className="text-xs uppercase font-semibold tracking-wider text-black/50 mb-2 block">
            Curated For Every Indian Celebration
          </span>
          <h2
            className={cn([
              integralCF.className,
              "text-[28px] leading-[34px] md:text-4xl text-black",
            ])}
          >
            BROWSE BY OCCASION & GIFT STYLE
          </h2>
        </motion.div>

        <motion.div
          initial={{ y: "40px", opacity: 0 }}
          whileInView={{ y: "0", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col sm:flex-row md:h-[260px] space-y-4 sm:space-y-0 sm:space-x-5 mb-4 sm:mb-5"
        >
          <DressStyleCard
            title="Diwali & Festive Hampers"
            url="/shop"
            className="md:max-w-[400px] lg:max-w-[450px] xl:max-w-[500px] h-[190px] md:h-full bg-cover bg-center rounded-2xl bg-[url('https://cdn.shopify.com/s/files/1/0676/0756/0377/files/ChatGPTImageJun11_2026_11_46_54AM.webp?w=800')]"
          />
          <DressStyleCard
            title="Wedding & Anniversary Specials"
            url="/shop"
            className="md:max-w-[684px] h-[190px] md:h-full bg-cover bg-center rounded-2xl bg-[url('https://cdn.shopify.com/s/files/1/0676/0756/0377/files/custom_gift_boxes.jpg?w=800')]"
          />
        </motion.div>

        <motion.div
          initial={{ y: "40px", opacity: 0 }}
          whileInView={{ y: "0", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row md:h-[260px] space-y-5 sm:space-y-0 sm:space-x-5"
        >
          <DressStyleCard
            title="Photo Frames & Warm LED Lamps"
            url="/shop"
            className="md:max-w-[684px] h-[190px] md:h-full bg-cover bg-center rounded-2xl bg-[url('https://cdn.shopify.com/s/files/1/0676/0756/0377/files/anniversary-photo-frame-pakistan-per_sonalized-gift.webp?w=800')]"
          />
          <DressStyleCard
            title="Artisanal Keepsakes & Car Charms"
            url="/shop"
            className="md:max-w-[400px] lg:max-w-[450px] xl:max-w-[500px] h-[190px] md:h-full bg-cover bg-center rounded-2xl bg-[url('https://cdn.shopify.com/s/files/1/0676/0756/0377/files/image-2026-09-05T153513.081.webp?w=800')]"
          />
        </motion.div>
      </section>
    </div>
  );
};

export default DressStyle;
