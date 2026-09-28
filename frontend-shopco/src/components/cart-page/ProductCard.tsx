"use client";

import React from "react";
import { PiTrashFill } from "react-icons/pi";
import Image from "next/image";
import Link from "next/link";
import CartCounter from "@/components/ui/CartCounter";
import { Button } from "../ui/button";
import {
  addToCart,
  CartItem,
  remove,
  removeCartItem,
} from "@/lib/features/carts/cartsSlice";
import { useAppDispatch } from "@/lib/hooks/redux";

type ProductCardProps = {
  data: CartItem;
};

const ProductCard = ({ data }: ProductCardProps) => {
  const dispatch = useAppDispatch();
  const formatPrice = (val: number) => `₹${Math.round(val).toLocaleString("en-IN")}`;

  const unitDiscounted =
    data.discount && data.discount.percentage > 0
      ? Math.round(data.price - (data.price * data.discount.percentage) / 100)
      : data.discount && data.discount.amount > 0
      ? Math.max(0, data.price - data.discount.amount)
      : data.price;

  const itemTotal = unitDiscounted * (data.quantity || 1);

  // Link URL
  const itemUrl = data.marketplace && data.marketplace !== "Dua Gifts"
    ? `/shop-anywhere`
    : `/shop/product/${data.id}/${data.name.split(" ").join("-")}`;

  return (
    <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-black/[0.02] transition-colors">
      <Link
        href={itemUrl}
        className="bg-[#f5f5f7] rounded-xl w-24 sm:w-28 aspect-square shrink-0 overflow-hidden relative border border-black/[0.04]"
      >
        <Image
          src={data.srcUrl}
          width={124}
          height={124}
          className="rounded-lg w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300"
          alt={data.name}
          loading="lazy"
        />
      </Link>

      <div className="flex-1 flex flex-col justify-between self-stretch">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                data.marketplace === "Flipkart"
                  ? "bg-blue-100 text-blue-800"
                  : data.marketplace === "Shopsy"
                  ? "bg-purple-100 text-purple-800"
                  : data.marketplace === "Meesho"
                  ? "bg-pink-100 text-pink-800"
                  : data.marketplace === "Amazon"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-black/[0.06] text-black/70"
              }`}>
                {data.marketplace || "Dua Gifts"}
              </span>
              {data.discount && data.discount.percentage > 0 && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {data.discount.percentage}% OFF
                </span>
              )}
            </div>

            <Link
              href={itemUrl}
              className="text-black font-semibold text-sm sm:text-base line-clamp-1 hover:text-black/70 transition-colors"
            >
              {data.name}
            </Link>

            {data.attributes && data.attributes.length > 0 && data.attributes[0] && (
              <div className="text-xs text-black/50 mt-0.5">
                <span>Option: {data.attributes.filter(Boolean).join(" • ")}</span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-black/40 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            onClick={() =>
              dispatch(
                remove({
                  id: data.id,
                  attributes: data.attributes,
                  quantity: data.quantity,
                })
              )
            }
          >
            <PiTrashFill className="text-lg" />
          </Button>
        </div>

        <div className="flex items-end justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-black text-base sm:text-lg">
              {formatPrice(itemTotal)}
            </span>
            {unitDiscounted < data.price && (
              <span className="font-medium text-black/40 line-through text-xs sm:text-sm">
                {formatPrice(data.price * data.quantity)}
              </span>
            )}
            <span className="text-xs text-black/40">
              ({formatPrice(unitDiscounted)} each)
            </span>
          </div>

          <CartCounter
            initialValue={data.quantity}
            onAdd={() => dispatch(addToCart({ ...data, quantity: 1 }))}
            onRemove={() =>
              data.quantity === 1
                ? dispatch(
                    remove({
                      id: data.id,
                      attributes: data.attributes,
                      quantity: data.quantity,
                    })
                  )
                : dispatch(
                    removeCartItem({ id: data.id, attributes: data.attributes })
                  )
            }
            isZeroDelete
            className="px-3 py-1.5 max-h-8 min-w-[90px] max-w-[100px] text-xs rounded-full bg-[#f5f5f7]"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
