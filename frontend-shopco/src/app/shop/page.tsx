"use client";

import React, { useState, useEffect } from "react";
import BreadcrumbShop from "@/components/shop-page/BreadcrumbShop";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MobileFilters from "@/components/shop-page/filters/MobileFilters";
import { FiSliders } from "react-icons/fi";
import ProductCard from "@/components/common/ProductCard";
import { Product } from "@/types/product.types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";

interface CategoryOption {
  id: string;
  name: string;
  description?: string;
}

export default function ShopPage() {
  const [selectedSort, setSelectedSort] = useState("most-popular");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<CategoryOption[]>([
    { id: "all", name: "All Gifts" },
    { id: "Boxes", name: "Gift Boxes & Hampers" },
    { id: "Wedding", name: "Wedding Specials" },
    { id: "Frames", name: "Photo & LED Frames" },
    { id: "Spiritual", name: "Artisanal & Car Keepsakes" },
    { id: "Drinkware", name: "Custom Mugs & Bottles" },
    { id: "Apparel", name: "Apparel & Keepsakes" },
  ]);
  const [loading, setLoading] = useState(true);

  const pageSize = 12;

  // 1. Fetch categories from backend API on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
          }
        }
      } catch (e) {
        console.warn("Failed to load live categories:", e);
      }
    }
    loadCategories();
  }, []);

  // 2. Fetch products dynamically from backend API
  useEffect(() => {
    let isCancelled = false;

    async function loadProducts() {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          category: selectedCategory,
          sort: selectedSort,
          page: String(currentPage),
          limit: String(pageSize),
        });

        const res = await fetch(`/api/products?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.success) {
            setProducts(data.products || []);
            setTotalProducts(data.total || 0);
            setTotalPages(data.totalPages || 1);
          }
        }
      } catch (err) {
        console.warn("Error fetching dynamic products from backend:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      isCancelled = true;
    };
  }, [selectedCategory, selectedSort, currentPage]);

  return (
    <main className="pb-20 pt-2 bg-[#fafafc] min-h-screen">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/[0.06] mb-5 sm:mb-6" />
        <BreadcrumbShop />

        {/* Category Pills - Dynamic Backend Categories */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-black text-white shadow-sm"
                  : "bg-white text-black/70 border border-black/[0.08] hover:bg-black/5"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex md:space-x-6 items-start">
          {/* Left Sidebar Filter */}
          <div className="hidden md:block min-w-[280px] max-w-[280px] bg-white border border-black/[0.08] rounded-3xl p-5 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <span className="font-bold text-black text-lg tracking-tight">Occasions</span>
              <FiSliders className="text-xl text-black/40" />
            </div>
            <div className="flex flex-col space-y-1 text-xs text-black/70">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c.id);
                    setCurrentPage(1);
                  }}
                  className={`text-left py-2.5 px-3 rounded-xl transition-all cursor-pointer ${
                    selectedCategory === c.id
                      ? "bg-black text-white font-semibold"
                      : "hover:bg-[#f5f5f7] text-black/80"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <hr className="border-t-black/[0.06]" />

            <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-4 text-xs text-black/70 leading-relaxed space-y-2">
              <div className="font-bold text-black flex items-center gap-1.5">
                <span>🛍️</span>
                <span>Inbuilt Indian Browser</span>
              </div>
              <p className="text-[11px] text-black/60">
                Want to combine products from Flipkart, Shopsy, Meesho, or Amazon India into this gift hamper?
              </p>
              <Link
                href="/shop-anywhere"
                className="inline-block w-full text-center py-2 bg-black hover:bg-black/85 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Launch Browser →
              </Link>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex flex-col w-full space-y-5">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
              <div className="flex items-center justify-between">
                <h1 className="font-bold text-xl md:text-2xl text-black">
                  {selectedCategory === "all"
                    ? "Curated Indian Gifts"
                    : categories.find((c) => c.id === selectedCategory)?.name || "Selected Gifts"}
                </h1>
                <MobileFilters />
              </div>
              <div className="flex flex-col sm:items-center sm:flex-row mt-2 lg:mt-0 gap-2">
                <span className="text-xs text-black/50">
                  {totalProducts > 0 ? (
                    <>
                      Showing {(currentPage - 1) * pageSize + 1}-
                      {Math.min(currentPage * pageSize, totalProducts)} of {totalProducts} Items
                    </>
                  ) : (
                    "Live Backend Catalog"
                  )}
                </span>
                <div className="flex items-center text-xs text-black/60 font-medium">
                  Sort by:
                  <Select value={selectedSort} onValueChange={setSelectedSort}>
                    <SelectTrigger className="font-semibold text-xs px-2 text-black bg-transparent shadow-none border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="most-popular">Featured</SelectItem>
                      <SelectItem value="low-price">Price: Low to High</SelectItem>
                      <SelectItem value="high-price">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-8">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-3xl p-4 border border-black/[0.06] animate-pulse space-y-3">
                    <div className="w-full h-56 bg-black/[0.05] rounded-2xl" />
                    <div className="h-4 bg-black/[0.05] rounded w-3/4" />
                    <div className="h-3 bg-black/[0.04] rounded w-1/2" />
                    <div className="h-5 bg-black/[0.05] rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} data={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-black/[0.08] p-8">
                <p className="text-base font-bold text-black mb-1">No gifts found</p>
                <p className="text-xs text-black/50 mb-4">Try selecting another occasion category or reset filter.</p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setCurrentPage(1);
                  }}
                  className="px-5 py-2.5 bg-black text-white text-xs font-semibold rounded-full hover:bg-black/85 transition-colors"
                >
                  View All Gifts
                </button>
              </div>
            )}

            <hr className="border-t-black/[0.06]" />

            {totalPages > 1 && (
              <Pagination className="justify-between">
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={`border border-black/[0.08] rounded-full text-xs ${
                    currentPage === 1 ? "pointer-events-none opacity-40" : ""
                  }`}
                />
                <PaginationContent>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <PaginationItem key={idx}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(idx + 1);
                        }}
                        className="text-black/70 font-semibold text-xs rounded-full"
                        isActive={currentPage === idx + 1}
                      >
                        {idx + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                </PaginationContent>

                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={`border border-black/[0.08] rounded-full text-xs ${
                    currentPage === totalPages ? "pointer-events-none opacity-40" : ""
                  }`}
                />
              </Pagination>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
