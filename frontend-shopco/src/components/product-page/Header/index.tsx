import React from "react";
import PhotoSection from "./PhotoSection";
import { Product } from "@/types/product.types";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import Rating from "@/components/ui/Rating";
import ColorSelection from "./ColorSelection";
import SizeSelection from "./SizeSelection";
import AddToCardSection from "./AddToCardSection";

const Header = ({ data }: { data: Product }) => {
  const formatPrice = (val: number) => `₹${Math.round(val).toLocaleString("en-IN")}`;
  const discountedPrice =
    data.discount.percentage > 0
      ? Math.round(data.price - (data.price * data.discount.percentage) / 100)
      : data.discount.amount > 0
      ? data.price - data.discount.amount
      : data.price;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <div>
        <PhotoSection data={data} />
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-bold uppercase tracking-wider text-black/40 mb-1">
          {data.category || "Curated Indian Gift"}
        </span>
        <h1
          className={cn([
            integralCF.className,
            "text-2xl md:text-3xl lg:text-4xl text-black mb-3 leading-tight",
          ])}
        >
          {data.title}
        </h1>

        <div className="flex items-center mb-4">
          <Rating
            initialValue={data.rating}
            allowFraction
            SVGclassName="inline-block"
            emptyClassName="fill-gray-100"
            size={20}
            readonly
          />
          <span className="text-black font-semibold text-xs sm:text-sm ml-2.5">
            {data.rating.toFixed(1)}
            <span className="text-black/40 font-normal"> / 5.0</span>
          </span>
          <span className="mx-2 text-black/20">•</span>
          <span className="text-xs text-emerald-700 font-medium">Pan-India Express Ready</span>
        </div>

        <div className="flex items-baseline gap-3 mb-5 p-3 rounded-2xl bg-[#f5f5f7] border border-black/[0.04]">
          <span className="font-black text-black text-2xl sm:text-3xl tracking-tight">
            {formatPrice(discountedPrice)}
          </span>
          {(data.discount.percentage > 0 || data.discount.amount > 0) && (
            <span className="font-medium text-black/40 line-through text-base sm:text-lg">
              {formatPrice(data.price)}
            </span>
          )}
          {data.discount.percentage > 0 && (
            <span className="font-bold text-xs py-1 px-3 rounded-full bg-black text-white">
              {`-${data.discount.percentage}% OFF`}
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-black/70 mb-5 leading-relaxed whitespace-pre-line">
          {data.description ||
            "Handcrafted personalized gift item from Dua Gifts India. Custom engraving, personalization names, dates, and signature wax-seal gift wrapping included."}
        </p>

        <div className="p-3 mb-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
          <span>🎁</span>
          <span>
            Combine this item with products from Flipkart, Shopsy or Meesho in our{" "}
            <a href="/shop-anywhere" className="font-bold underline text-black">
              Inbuilt Browser
            </a>
          </span>
        </div>

        <hr className="h-[1px] border-t-black/[0.06] mb-5" />
        <ColorSelection />
        <hr className="h-[1px] border-t-black/[0.06] my-5" />
        <SizeSelection />
        <hr className="hidden md:block h-[1px] border-t-black/[0.06] my-5" />
        <AddToCardSection data={data} />
      </div>
    </div>
  );
};

export default Header;
