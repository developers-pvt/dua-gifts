import React from "react";
import Rating from "../ui/Rating";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product.types";

type ProductCardProps = {
  data: Product;
  priority?: boolean;
};

const ProductCard = ({ data, priority = false }: ProductCardProps) => {
  const formatPrice = (val: number) => `₹${Math.round(val).toLocaleString("en-IN")}`;
  const discountedPrice =
    data.discount.percentage > 0
      ? Math.round(data.price - (data.price * data.discount.percentage) / 100)
      : data.discount.amount > 0
      ? data.price - data.discount.amount
      : data.price;

  return (
    <Link
      href={`/shop/product/${data.id}/${data.title.split(" ").join("-")}`}
      className="group flex flex-col items-start w-full bg-white p-3 rounded-2xl border border-black/[0.06] hover:border-black/20 hover:shadow-lg transition-all duration-300"
    >
      <div className="bg-[#f5f5f7] rounded-xl w-full aspect-square mb-3 overflow-hidden relative flex items-center justify-center">
        <Image
          src={data.srcUrl}
          width={295}
          height={298}
          className="rounded-lg w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500 ease-out"
          alt={data.title}
          loading={priority ? undefined : "lazy"}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {data.discount.percentage > 0 && (
          <span className="absolute top-2.5 left-2.5 font-semibold text-[11px] py-0.5 px-2 rounded-full bg-black text-white tracking-wide">
            {`-${data.discount.percentage}%`}
          </span>
        )}
      </div>

      <div className="w-full flex flex-col flex-1 justify-between">
        <div>
          <span className="text-[11px] font-medium tracking-wide uppercase text-black/40 mb-1 block">
            {data.category || "Curated Gift"}
          </span>
          <h3 className="text-black font-semibold text-sm xl:text-base line-clamp-2 leading-snug group-hover:text-black/80 transition-colors">
            {data.title}
          </h3>
        </div>

        <div className="mt-2.5 pt-2 border-t border-black/[0.04] w-full">
          <div className="flex items-center mb-1.5">
            <Rating
              initialValue={data.rating}
              allowFraction
              SVGclassName="inline-block"
              emptyClassName="fill-gray-100"
              size={14}
              readonly
            />
            <span className="text-black/70 font-medium text-xs ml-1.5">
              {data.rating.toFixed(1)}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-bold text-black text-base xl:text-lg tracking-tight">
              {formatPrice(discountedPrice)}
            </span>
            {(data.discount.percentage > 0 || data.discount.amount > 0) && (
              <span className="font-medium text-black/40 line-through text-xs xl:text-sm">
                {formatPrice(data.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
