import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Link from "next/link";
import React from "react";
import { NavMenu } from "../navbar.types";
import { MenuList } from "./MenuList";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { MenuItem } from "./MenuItem";
import ResTopNavbar from "./ResTopNavbar";
import CartBtn from "./CartBtn";

const data: NavMenu = [
  {
    id: 1,
    type: "MenuItem",
    label: "Gifts & Hampers",
    url: "/shop",
    children: [],
  },
  {
    id: 2,
    type: "MenuItem",
    label: "Inbuilt Browser 🌐",
    url: "/shop-anywhere",
    children: [],
  },
  {
    id: 3,
    type: "MenuItem",
    label: "Build Hamper 🎁",
    url: "/create-gift",
    children: [],
  },
  {
    id: 4,
    type: "MenuItem",
    label: "Track Order",
    url: "/track",
    children: [],
  },
];

const TopNavbar = () => {
  return (
    <nav className="sticky top-0 bg-white/80 backdrop-blur-xl z-40 border-b border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all">
      <div className="flex relative max-w-frame mx-auto items-center justify-between py-3.5 px-4 xl:px-0">
        <div className="flex items-center">
          <div className="block lg:hidden mr-3">
            <ResTopNavbar data={data} />
          </div>
          <Link
            href="/"
            className="flex flex-col mr-4 lg:mr-8 group"
          >
            <span
              className={cn([
                integralCF.className,
                "text-xl lg:text-[24px] tracking-tight leading-none text-black group-hover:text-black/70 transition-colors",
              ])}
            >
              DUA GIFTS
            </span>
            <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-black/40 mt-0.5">
              INDIA
            </span>
          </Link>
        </div>

        <NavigationMenu className="hidden lg:flex mr-4">
          <NavigationMenuList className="gap-1.5">
            {data.map((item) => (
              <React.Fragment key={item.id}>
                {item.type === "MenuItem" && (
                  <MenuItem label={item.label} url={item.url} />
                )}
                {item.type === "MenuList" && (
                  <MenuList data={item.children} label={item.label} />
                )}
              </React.Fragment>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/919528247811"
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-all border border-emerald-200"
            title="Chat on WhatsApp"
          >
            <span>💬</span>
            <span>+91 95282 47811</span>
          </a>
          <Link
            href="/shop-anywhere"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/[0.04] text-black hover:bg-black hover:text-white transition-all border border-black/[0.06]"
          >
            <span>🌐</span>
            <span>Flipkart / Meesho Browser</span>
          </Link>
          <CartBtn />
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
