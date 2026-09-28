"use client";

import { useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const CartBtn = () => {
  const { cart } = useAppSelector((state: RootState) => state.carts);

  return (
    <Link
      href="/cart"
      className="relative p-2 rounded-full hover:bg-black/[0.04] transition-colors flex items-center justify-center"
      aria-label="View Shopping Cart"
    >
      <Image
        src="/icons/cart.svg"
        height={22}
        width={22}
        alt="cart"
        className="w-[20px] h-[20px]"
      />
      {cart && cart.totalQuantities > 0 && (
        <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-75 duration-200">
          {cart.totalQuantities}
        </span>
      )}
    </Link>
  );
};

export default CartBtn;
