import { compareArrays } from "@/lib/utils";
import { Discount } from "@/types/product.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  id: number | string;
  name: string;
  srcUrl: string;
  price: number;
  attributes: string[];
  discount: Discount;
  quantity: number;
  marketplace?: string; // "Dua Gifts" | "Flipkart" | "Shopsy" | "Meesho" | "Amazon"
  sourceUrl?: string;
};

export type RemoveCartItem = {
  id: number | string;
  attributes: string[];
};

export type Cart = {
  items: CartItem[];
  totalQuantities: number;
};

export interface PromoCodeState {
  code: string;
  discountPercentage?: number;
  discountAmount?: number;
  description: string;
}

interface CartsState {
  cart: Cart | null;
  totalPrice: number;
  adjustedTotalPrice: number;
  appliedPromo: PromoCodeState | null;
  promoDiscount: number;
  finalTotal: number;
  action: "update" | "add" | "delete" | "clear" | null;
}

const VALID_PROMOS: Record<string, { percent?: number; fixed?: number; desc: string }> = {
  FIRSTGIFT: { fixed: 500, desc: "₹500 off on first consolidated gift order" },
  DIWALI20: { percent: 20, desc: "20% Festive Diwali Discount" },
  WELCOME10: { percent: 10, desc: "10% Welcome Discount" },
  FREESHIP: { fixed: 150, desc: "Free Express Shipping Discount" },
};

const calculateTotals = (
  items: CartItem[],
  appliedPromo: PromoCodeState | null
) => {
  let totalQuantities = 0;
  let totalPrice = 0;
  let adjustedTotalPrice = 0;

  for (const item of items) {
    const qty = Math.max(1, item.quantity || 1);
    totalQuantities += qty;
    totalPrice += item.price * qty;

    const unitPrice =
      item.discount && item.discount.percentage > 0
        ? Math.round(item.price - (item.price * item.discount.percentage) / 100)
        : item.discount && item.discount.amount > 0
        ? Math.max(0, item.price - item.discount.amount)
        : item.price;

    adjustedTotalPrice += unitPrice * qty;
  }

  let promoDiscount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountPercentage) {
      promoDiscount = Math.round(
        (adjustedTotalPrice * appliedPromo.discountPercentage) / 100
      );
    } else if (appliedPromo.discountAmount) {
      promoDiscount = Math.min(adjustedTotalPrice, appliedPromo.discountAmount);
    }
  }

  const finalTotal = Math.max(0, adjustedTotalPrice - promoDiscount);

  return {
    totalQuantities,
    totalPrice,
    adjustedTotalPrice,
    promoDiscount,
    finalTotal,
  };
};

const initialState: CartsState = {
  cart: null,
  totalPrice: 0,
  adjustedTotalPrice: 0,
  appliedPromo: null,
  promoDiscount: 0,
  finalTotal: 0,
  action: null,
};

export const cartsSlice = createSlice({
  name: "carts",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const newItem = {
        ...action.payload,
        marketplace: action.payload.marketplace || "Dua Gifts",
      };

      if (!state.cart || state.cart.items.length === 0) {
        state.cart = {
          items: [newItem],
          totalQuantities: newItem.quantity,
        };
      } else {
        const existingIndex = state.cart.items.findIndex(
          (item) =>
            String(item.id) === String(newItem.id) &&
            compareArrays(item.attributes, newItem.attributes)
        );

        if (existingIndex > -1) {
          state.cart.items[existingIndex].quantity += newItem.quantity;
        } else {
          state.cart.items.push(newItem);
        }
      }

      const totals = calculateTotals(state.cart.items, state.appliedPromo);
      state.cart.totalQuantities = totals.totalQuantities;
      state.totalPrice = totals.totalPrice;
      state.adjustedTotalPrice = totals.adjustedTotalPrice;
      state.promoDiscount = totals.promoDiscount;
      state.finalTotal = totals.finalTotal;
      state.action = "add";
    },

    removeCartItem: (state, action: PayloadAction<RemoveCartItem>) => {
      if (!state.cart) return;

      const existingIndex = state.cart.items.findIndex(
        (item) =>
          String(item.id) === String(action.payload.id) &&
          compareArrays(item.attributes, action.payload.attributes)
      );

      if (existingIndex > -1) {
        if (state.cart.items[existingIndex].quantity > 1) {
          state.cart.items[existingIndex].quantity -= 1;
        } else {
          state.cart.items.splice(existingIndex, 1);
        }
      }

      const totals = calculateTotals(state.cart.items, state.appliedPromo);
      state.cart.totalQuantities = totals.totalQuantities;
      state.totalPrice = totals.totalPrice;
      state.adjustedTotalPrice = totals.adjustedTotalPrice;
      state.promoDiscount = totals.promoDiscount;
      state.finalTotal = totals.finalTotal;
      state.action = "delete";
    },

    remove: (
      state,
      action: PayloadAction<RemoveCartItem & { quantity?: number }>
    ) => {
      if (!state.cart) return;

      state.cart.items = state.cart.items.filter(
        (item) =>
          !(
            String(item.id) === String(action.payload.id) &&
            compareArrays(item.attributes, action.payload.attributes)
          )
      );

      const totals = calculateTotals(state.cart.items, state.appliedPromo);
      state.cart.totalQuantities = totals.totalQuantities;
      state.totalPrice = totals.totalPrice;
      state.adjustedTotalPrice = totals.adjustedTotalPrice;
      state.promoDiscount = totals.promoDiscount;
      state.finalTotal = totals.finalTotal;
      state.action = "delete";
    },

    applyPromo: (state, action: PayloadAction<string>) => {
      const code = action.payload.trim().toUpperCase();
      const match = VALID_PROMOS[code];
      if (match) {
        state.appliedPromo = {
          code,
          discountPercentage: match.percent,
          discountAmount: match.fixed,
          description: match.desc,
        };
        if (state.cart) {
          const totals = calculateTotals(state.cart.items, state.appliedPromo);
          state.promoDiscount = totals.promoDiscount;
          state.finalTotal = totals.finalTotal;
        }
      }
    },

    removePromo: (state) => {
      state.appliedPromo = null;
      state.promoDiscount = 0;
      if (state.cart) {
        state.finalTotal = state.adjustedTotalPrice;
      }
    },

    clearCart: (state) => {
      state.cart = { items: [], totalQuantities: 0 };
      state.totalPrice = 0;
      state.adjustedTotalPrice = 0;
      state.promoDiscount = 0;
      state.finalTotal = 0;
      state.appliedPromo = null;
      state.action = "clear";
    },
  },
});

export const {
  addToCart,
  removeCartItem,
  remove,
  applyPromo,
  removePromo,
  clearCart,
} = cartsSlice.actions;

export default cartsSlice.reducer;
