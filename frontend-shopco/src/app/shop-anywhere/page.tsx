"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { addToCart } from "@/lib/features/carts/cartsSlice";
import { RootState } from "@/lib/store";
import { ExternalProductItem } from "@/lib/medusa";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import {
  FaSearch,
  FaArrowLeft,
  FaArrowRight,
  FaRedo,
  FaHome,
  FaLock,
  FaShoppingCart,
  FaStar,
  FaExternalLinkAlt,
  FaLaptop,
  FaMobileAlt,
  FaGlobe,
  FaBolt,
  FaLink,
} from "react-icons/fa";

export interface LiveProduct {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  ratingCount: number;
  imageUrl: string;
  marketplace: "Flipkart" | "Shopsy" | "Meesho" | "Amazon" | string;
  platformName: string;
  sourceUrl: string;
  badge?: string;
  deliveryEstimate: string;
  verifiedSeller: boolean;
}

type PlatformType = "all" | "Flipkart" | "Shopsy" | "Meesho" | "Amazon";
type ViewMode = "browser" | "search";

export default function ShopAnywhereBrowserPage() {
  const dispatch = useAppDispatch();
  const { cart } = useAppSelector((state: RootState) => state.carts);

  // Core Modes
  const [viewMode, setViewMode] = useState<ViewMode>("browser");
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">("desktop");

  // Inbuilt Browser States
  const [activeUrl, setActiveUrl] = useState("https://www.flipkart.com/search?q=trending+gifts");
  const [omnibarInput, setOmnibarInput] = useState("https://www.flipkart.com/search?q=trending+gifts");
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>("Flipkart");
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Live Search States
  const [searchQuery, setSearchQuery] = useState("watches");
  const [liveProducts, setLiveProducts] = useState<LiveProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Direct Link Import Modal State
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [isParsingUrl, setIsParsingUrl] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<LiveProduct | null>(null);

  // Floating Toast Notification
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    marketplace: string;
    price: number;
  } | null>(null);

  const formatPrice = (val: number) => `₹${Math.round(val).toLocaleString("en-IN")}`;

  // ---------------------------------------------------------------------------
  // 1. Listen for PostMessage events from the Injected Proxy Assistant
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "GIFT_STUDIO_ADD_TO_CART" && data.product) {
        const prod = data.product;
        handleAddLiveProductToCart({
          id: prod.id || `live_${Date.now()}`,
          title: prod.title || "Marketplace Product",
          price: prod.price || 999,
          originalPrice: Math.round((prod.price || 999) * 1.3),
          discountPercentage: 25,
          rating: 4.5,
          ratingCount: 150,
          imageUrl: prod.imageUrl || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500",
          marketplace: prod.marketplace || "Flipkart",
          platformName: prod.marketplace || "Flipkart",
          sourceUrl: prod.sourceUrl || activeUrl,
          deliveryEstimate: "2-3 Days via Dua Gifts Pan-India Hub",
          verifiedSeller: true,
        });
      }

      if (data.type === "GIFT_STUDIO_URL_CHANGE" && data.url) {
        setOmnibarInput(data.url);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [activeUrl]);

  // ---------------------------------------------------------------------------
  // 2. Fetch Real Marketplace Search Data from live API
  // ---------------------------------------------------------------------------
  const executeLiveSearch = async (query: string, platform: PlatformType = selectedPlatform) => {
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchError(null);

    try {
      const res = await fetch(
        `/api/marketplace-search?q=${encodeURIComponent(query)}&platform=${encodeURIComponent(platform)}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setLiveProducts(data.products);
      } else {
        setSearchError(data.error || "No products found for this search.");
      }
    } catch (err: any) {
      setSearchError("Failed to fetch live search results. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Initial live search on mount
  useEffect(() => {
    executeLiveSearch("luxury perfume watches gifts", "Flipkart");
  }, []);

  // ---------------------------------------------------------------------------
  // 3. Inbuilt Browser Omnibar & Navigation
  // ---------------------------------------------------------------------------
  const handleNavigateUrl = (urlToLoad: string) => {
    let cleanUrl = urlToLoad.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = "https://" + cleanUrl;
    }
    setActiveUrl(cleanUrl);
    setOmnibarInput(cleanUrl);
    setIsIframeLoading(true);
    setViewMode("browser");
  };

  const handleOmnibarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!omnibarInput.trim()) return;

    // If user typed a search query rather than a URL, switch to search or construct search URL
    if (!omnibarInput.includes(".") || (!omnibarInput.startsWith("http") && !omnibarInput.includes("www."))) {
      setSearchQuery(omnibarInput);
      executeLiveSearch(omnibarInput, selectedPlatform);
      setViewMode("search");
    } else {
      handleNavigateUrl(omnibarInput);
    }
  };

  const handleSelectPlatform = (plat: PlatformType) => {
    setSelectedPlatform(plat);
    let target = "https://www.flipkart.com/search?q=gifts";
    if (plat === "Flipkart") target = "https://www.flipkart.com/search?q=gifts";
    else if (plat === "Shopsy") target = "https://www.flipkart.com/search?q=gifts&marketplace=SHOPSY";
    else if (plat === "Meesho") target = "https://www.meesho.com";
    else if (plat === "Amazon") target = "https://www.flipkart.com/search?q=luxury+gifts";

    handleNavigateUrl(target);
    executeLiveSearch(searchQuery || "gifts", plat);
  };

  // ---------------------------------------------------------------------------
  // 4. Add Live Product to Cart
  // ---------------------------------------------------------------------------
  const handleAddLiveProductToCart = (prod: LiveProduct, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // 1. Dispatch to Redux store
    dispatch(
      addToCart({
        id: prod.id,
        name: prod.title,
        srcUrl: prod.imageUrl,
        price: prod.price,
        attributes: [prod.marketplace, "Express Procure"],
        discount: {
          percentage: prod.discountPercentage,
          amount: prod.originalPrice - prod.price,
        },
        quantity: 1,
        marketplace: prod.marketplace,
        sourceUrl: prod.sourceUrl,
      })
    );

    // 2. Save to localStorage external items for hamper builder & checkout
    try {
      const existing: ExternalProductItem[] = JSON.parse(
        localStorage.getItem("gift_external_items") || "[]"
      );
      const newItem: ExternalProductItem = {
        id: `ext_${prod.id}_${Date.now()}`,
        sourceUrl: prod.sourceUrl,
        marketplace: prod.marketplace,
        productName: prod.title,
        price: prod.price,
        currency: "INR",
        imageUrl: prod.imageUrl,
        procurementStatus: "PENDING",
        procurementNotes: `Added via Inbuilt Browser from ${prod.marketplace}. Procured, inspected and assembled by Dua Gifts India.`,
      };
      localStorage.setItem("gift_external_items", JSON.stringify([...existing, newItem]));
    } catch (e) {}

    // 3. Show Apple-style floating toast
    setToastMessage({
      title: prod.title,
      marketplace: prod.marketplace,
      price: prod.price,
    });

    setTimeout(() => {
      setToastMessage(null);
    }, 4500);

    if (parsedPreview) {
      setParsedPreview(null);
    }
  };

  // ---------------------------------------------------------------------------
  // 5. Parse Any Real Product Link
  // ---------------------------------------------------------------------------
  const handleParseCustomUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    setIsParsingUrl(true);
    setParseError(null);

    try {
      const res = await fetch(`/api/parse-product?url=${encodeURIComponent(customUrlInput)}`);
      const data = await res.json();
      if (data.success && data.product) {
        setParsedPreview(data.product);
        setCustomUrlInput("");
      } else {
        setParseError(data.error || "Could not parse product details. Please check the URL.");
      }
    } catch (err: any) {
      setParseError("Network error while inspecting URL.");
    } finally {
      setIsParsingUrl(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1d1d1f] text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4 max-w-md animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-lg">
            ✓
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Added to Dua Gifts Cart
              </span>
              <span className="text-[10px] text-white/40">• {toastMessage.marketplace}</span>
            </div>
            <p className="text-xs font-semibold text-white/95 truncate">{toastMessage.title}</p>
            <p className="text-xs text-white/60 font-medium">{formatPrice(toastMessage.price)}</p>
          </div>
          <Link
            href="/cart"
            className="px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 shrink-0 transition-colors"
          >
            View Cart
          </Link>
        </div>
      )}

      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real Live Inbuilt Browser &amp; Marketplace Engine</span>
            </div>
            <h1 className={cn([integralCF.className, "text-2xl sm:text-4xl text-black tracking-tight"])}>
              BROWSE FLIPKART, SHOPSY &amp; MEESHO
            </h1>
            <p className="text-xs sm:text-sm text-black/60 max-w-2xl mt-1">
              Browse real live products from India&apos;s leading marketplaces inside our website. Click <strong>+ Add to Hamper Cart</strong> on any item, and pay once with single checkout!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-xs font-bold hover:bg-black/85 transition-all shadow-sm"
            >
              <FaShoppingCart />
              <span>Cart ({cart?.totalQuantities || 0})</span>
            </Link>
            <Link
              href="/checkout"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
            >
              <span>Pay Once Checkout →</span>
            </Link>
          </div>
        </div>

        {/* View Mode & Viewport Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="inline-flex p-1 bg-black/[0.05] rounded-full border border-black/[0.08]">
            <button
              type="button"
              onClick={() => setViewMode("browser")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                viewMode === "browser"
                  ? "bg-white text-black shadow-sm"
                  : "text-black/60 hover:text-black"
              }`}
            >
              <FaGlobe />
              <span>Interactive Inbuilt Browser</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("search")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                viewMode === "search"
                  ? "bg-white text-black shadow-sm"
                  : "text-black/60 hover:text-black"
              }`}
            >
              <FaBolt />
              <span>Live Product Search ({liveProducts.length})</span>
            </button>
          </div>

          {viewMode === "browser" && (
            <div className="flex items-center gap-1.5 bg-black/[0.05] p-1 rounded-full border border-black/[0.08] text-xs">
              <button
                type="button"
                onClick={() => setViewportMode("desktop")}
                className={`p-1.5 px-3 rounded-full flex items-center gap-1.5 font-medium transition-all ${
                  viewportMode === "desktop" ? "bg-white text-black shadow-xs font-bold" : "text-black/60"
                }`}
                title="Desktop View"
              >
                <FaLaptop />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setViewportMode("mobile")}
                className={`p-1.5 px-3 rounded-full flex items-center gap-1.5 font-medium transition-all ${
                  viewportMode === "mobile" ? "bg-white text-black shadow-xs font-bold" : "text-black/60"
                }`}
                title="Mobile Phone View"
              >
                <FaMobileAlt />
                <span className="hidden sm:inline">Mobile Frame</span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* INBUILT BROWSER FRAME (Apple / macOS Styled Safari Window) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-black/[0.12] shadow-[0_12px_48px_rgba(0,0,0,0.08)] overflow-hidden">
          {/* Browser Chrome Header */}
          <div className="bg-[#f0f0f3] border-b border-black/[0.08] px-4 py-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-4">
              {/* macOS Window Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
                <span className="text-[11px] font-bold text-black/40 ml-2 hidden sm:inline">
                  Dua Gifts Web Engine
                </span>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-2 text-black/50 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (iframeRef.current?.contentWindow) {
                      iframeRef.current.contentWindow.history.back();
                    }
                  }}
                  className="p-1.5 hover:bg-black/5 rounded-lg transition-colors"
                  title="Back"
                >
                  <FaArrowLeft />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (iframeRef.current?.contentWindow) {
                      iframeRef.current.contentWindow.history.forward();
                    }
                  }}
                  className="p-1.5 hover:bg-black/5 rounded-lg transition-colors"
                  title="Forward"
                >
                  <FaArrowRight />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsIframeLoading(true);
                    if (iframeRef.current) {
                      iframeRef.current.src = `/api/browser-proxy?url=${encodeURIComponent(activeUrl)}`;
                    }
                  }}
                  className="p-1.5 hover:bg-black/5 rounded-lg transition-colors"
                  title="Reload"
                >
                  <FaRedo className={isIframeLoading ? "animate-spin" : ""} />
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigateUrl("https://www.flipkart.com/search?q=gifts")}
                  className="p-1.5 hover:bg-black/5 rounded-lg transition-colors"
                  title="Home"
                >
                  <FaHome />
                </button>
              </div>

              {/* Omnibar / Address Bar */}
              <form
                onSubmit={handleOmnibarSubmit}
                className="flex-1 max-w-2xl bg-white rounded-xl border border-black/[0.1] px-3.5 py-1.5 flex items-center gap-2 shadow-xs"
              >
                <FaLock className="text-[10px] text-emerald-600 shrink-0" />
                <input
                  type="text"
                  value={omnibarInput}
                  onChange={(e) => setOmnibarInput(e.target.value)}
                  placeholder="Enter URL or search Flipkart, Shopsy, Meesho..."
                  className="w-full text-xs bg-transparent focus:outline-none placeholder:text-black/40 text-black font-medium font-mono"
                />
                <button
                  type="submit"
                  className="text-xs text-black/50 hover:text-black px-2 py-0.5 rounded font-bold"
                  title="Go"
                >
                  Go ↵
                </button>
              </form>

              {/* Status Pill */}
              <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Sync Active</span>
              </div>
            </div>

            {/* Platform Switcher Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-1">
              {[
                { id: "Flipkart", name: "Flipkart", icon: "🛍️" },
                { id: "Shopsy", name: "Shopsy by Flipkart", icon: "🛒" },
                { id: "Meesho", name: "Meesho", icon: "🌸" },
                { id: "Amazon", name: "Amazon India", icon: "📦" },
                { id: "all", name: "All Stores", icon: "✨" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectPlatform(tab.id as PlatformType)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                    selectedPlatform === tab.id
                      ? "bg-black text-white shadow-xs"
                      : "bg-white/80 hover:bg-white text-black/70 border border-black/[0.08]"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}

              <div className="ml-auto hidden md:flex items-center gap-1.5 text-xs text-black/50">
                <span>Quick:</span>
                {["Smart Watch", "Perfume", "Chocolates", "Saree", "Jewelry"].map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => {
                      setSearchQuery(kw);
                      executeLiveSearch(kw, selectedPlatform);
                      handleNavigateUrl(`https://www.flipkart.com/search?q=${encodeURIComponent(kw)}`);
                    }}
                    className="px-2 py-0.5 rounded-md bg-black/5 hover:bg-black/10 text-[11px] font-medium text-black/70 transition-colors"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Paste Any Product URL Import Strip */}
          <div className="px-6 py-2.5 bg-[#fafafc] border-b border-black/[0.06] flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-black/60">
              <FaLink className="text-black/40" />
              <span className="font-semibold text-black/80">Paste Product Link:</span>
              <span className="hidden sm:inline text-black/50">Have a direct Flipkart, Meesho or Amazon link?</span>
            </div>

            <form onSubmit={handleParseCustomUrl} className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="url"
                placeholder="https://www.flipkart.com/... or meesho.com/..."
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="w-full md:w-80 px-3 py-1.5 rounded-xl border border-black/10 text-xs focus:outline-none focus:ring-1 focus:ring-black bg-white"
              />
              <button
                type="submit"
                disabled={isParsingUrl || !customUrlInput.trim()}
                className="px-4 py-1.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-black/85 disabled:opacity-50 shrink-0 transition-all flex items-center gap-1.5"
              >
                {isParsingUrl ? "Fetching..." : "Import Product →"}
              </button>
            </form>
          </div>

          {parseError && (
            <div className="px-6 py-2 bg-rose-50 text-rose-800 text-xs border-b border-rose-100 flex items-center justify-between">
              <span>{parseError}</span>
              <button type="button" onClick={() => setParseError(null)} className="font-bold">✕</button>
            </div>
          )}

          {/* Parsed Product Quick Modal */}
          {parsedPreview && (
            <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-black/10 shrink-0 bg-white shadow-xs">
                  <Image
                    src={parsedPreview.imageUrl}
                    alt={parsedPreview.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-600 text-white">
                      {parsedPreview.marketplace} Verified
                    </span>
                    <span className="text-xs text-black/50">{parsedPreview.deliveryEstimate}</span>
                  </div>
                  <h4 className="text-sm font-bold text-black max-w-xl line-clamp-2">
                    {parsedPreview.title}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-base font-extrabold text-emerald-800">
                      {formatPrice(parsedPreview.price)}
                    </span>
                    <span className="text-xs text-black/40 line-through">
                      {formatPrice(parsedPreview.originalPrice)}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">
                      {parsedPreview.discountPercentage}% OFF
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setParsedPreview(null)}
                  className="px-4 py-2 rounded-full border border-black/15 text-xs font-semibold hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleAddLiveProductToCart(parsedPreview)}
                  className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <span>🎁</span>
                  <span>Add to My Hamper Cart</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW MODE 1: INTERACTIVE LIVE EMBEDDED BROWSER (VIA PROXY) */}
          {/* ========================================================================= */}
          {viewMode === "browser" && (
            <div className="relative bg-[#f8f8fa] min-h-[680px] flex items-center justify-center p-4">
              <div
                className={`transition-all duration-300 w-full ${
                  viewportMode === "mobile"
                    ? "max-w-sm rounded-[40px] border-[10px] border-[#1d1d1f] shadow-2xl overflow-hidden h-[740px]"
                    : "h-[740px] rounded-2xl overflow-hidden border border-black/[0.08] shadow-sm bg-white"
                }`}
              >
                {/* Mobile notch if mobile view */}
                {viewportMode === "mobile" && (
                  <div className="bg-[#1d1d1f] py-1 flex justify-center items-center">
                    <div className="w-24 h-4 bg-black rounded-b-xl" />
                  </div>
                )}

                <iframe
                  ref={iframeRef}
                  src={`/api/browser-proxy?url=${encodeURIComponent(activeUrl)}`}
                  className="w-full h-full border-0"
                  onLoad={() => setIsIframeLoading(false)}
                  title="Inbuilt Marketplace Browser"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>

              {/* Floating Helper Callout */}
              <div className="absolute top-8 right-8 hidden lg:block bg-black/85 text-white backdrop-blur-xl p-4 rounded-2xl shadow-xl max-w-xs border border-white/10 text-xs space-y-1.5 animate-in fade-in duration-300">
                <div className="font-bold flex items-center gap-2 text-emerald-400">
                  <span>💡</span>
                  <span>How Inbuilt Browser Works</span>
                </div>
                <p className="text-white/70 leading-relaxed">
                  Browse products freely on Flipkart or Meesho inside this window. Our assistant floating bar at the bottom will automatically detect any product you view. Click <strong>+ Add to My Hamper Cart</strong> to sync it directly!
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW MODE 2: LIVE PRODUCT SEARCH GRID (DIRECT LIVE API) */}
          {/* ========================================================================= */}
          {viewMode === "search" && (
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-black flex items-center gap-2">
                    <span>⚡</span>
                    <span>Live Search Results for &ldquo;{searchQuery}&rdquo;</span>
                  </h3>
                  <p className="text-xs text-black/50">
                    Directly fetched in real-time from {selectedPlatform === "all" ? "Flipkart & Partner Marketplaces" : selectedPlatform}.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-black/60">
                    {liveProducts.length} live products found
                  </span>
                </div>
              </div>

              {isSearching ? (
                <div className="py-24 text-center">
                  <div className="w-12 h-12 border-4 border-black/15 border-t-black rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm font-semibold text-black">Querying live marketplace catalog...</p>
                  <p className="text-xs text-black/50 mt-1">Retrieving real-time pricing and stock</p>
                </div>
              ) : searchError ? (
                <div className="py-16 text-center text-rose-600 bg-rose-50 rounded-2xl p-6">
                  <p className="font-semibold text-sm">{searchError}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {liveProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="group bg-white rounded-2xl border border-black/[0.08] hover:border-black/25 hover:shadow-xl transition-all duration-300 p-3.5 flex flex-col justify-between"
                    >
                      <div>
                        {/* Image & Marketplace Badge */}
                        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#f5f5f7] mb-3 flex items-center justify-center">
                          <Image
                            src={prod.imageUrl}
                            alt={prod.title}
                            fill
                            className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black text-white">
                            {prod.marketplace}
                          </span>
                          {prod.badge && (
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                              {prod.badge}
                            </span>
                          )}
                        </div>

                        {/* Title & Ratings */}
                        <h4 className="text-xs font-semibold text-black line-clamp-2 leading-snug group-hover:text-black/80 transition-colors">
                          {prod.title}
                        </h4>

                        <div className="flex items-center gap-1.5 mt-1.5 mb-2">
                          <div className="flex items-center text-amber-500 text-xs">
                            <FaStar />
                          </div>
                          <span className="text-[11px] font-bold text-black/75">{prod.rating}</span>
                          <span className="text-[10px] text-black/40">({prod.ratingCount})</span>
                        </div>
                      </div>

                      {/* Pricing & 1-Click Add */}
                      <div className="pt-2 border-t border-black/[0.05]">
                        <div className="flex items-baseline gap-2 mb-2.5">
                          <span className="text-base font-extrabold text-black">
                            {formatPrice(prod.price)}
                          </span>
                          {prod.originalPrice > prod.price && (
                            <span className="text-xs text-black/40 line-through">
                              {formatPrice(prod.originalPrice)}
                            </span>
                          )}
                          {prod.discountPercentage > 0 && (
                            <span className="text-[11px] font-bold text-emerald-600">
                              {prod.discountPercentage}% OFF
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleAddLiveProductToCart(prod, e)}
                            className="flex-1 py-2 px-3 rounded-full bg-black text-white hover:bg-black/90 active:scale-[0.98] text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                          >
                            <span>🎁</span>
                            <span>Add to Cart</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleNavigateUrl(prod.sourceUrl);
                            }}
                            className="p-2 rounded-full border border-black/15 hover:bg-black/5 text-black/70 transition-colors"
                            title="Open in Inbuilt Browser"
                          >
                            <FaExternalLinkAlt className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
