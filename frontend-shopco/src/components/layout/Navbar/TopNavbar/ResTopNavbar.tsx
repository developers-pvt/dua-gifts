import React from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import { NavMenu } from "../navbar.types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ResTopNavbar = ({ data }: { data: NavMenu }) => {
  return (
    <Sheet>
      <SheetTrigger asChild className="cursor-pointer">
        <Image
          src="/icons/menu.svg"
          height={24}
          width={24}
          alt="menu"
          className="w-5 h-5"
        />
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto bg-white/95 backdrop-blur-xl">
        <SheetHeader className="mb-8">
          <SheetTitle asChild>
            <SheetClose asChild>
              <Link href="/" className="flex flex-col text-left">
                <span className={cn([integralCF.className, "text-2xl text-black"])}>
                  DUA GIFTS
                </span>
                <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-black/40">
                  INDIA
                </span>
              </Link>
            </SheetClose>
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-start w-full">
          {data.map((item) => (
            <React.Fragment key={item.id}>
              {item.type === "MenuItem" && (
                <SheetClose asChild>
                  <Link
                    href={item.url ?? "/"}
                    className="py-3 text-sm font-semibold text-black hover:text-black/70 border-b border-black/[0.04] w-full"
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              )}
              {item.type === "MenuList" && (
                <div className="w-full">
                  <Accordion type="single" collapsible>
                    <AccordionItem value={item.label} className="border-none">
                      <AccordionTrigger className="text-left p-0 py-3 font-semibold text-sm">
                        {item.label}
                      </AccordionTrigger>
                      <AccordionContent className="p-3 pb-0 border-l flex flex-col space-y-2">
                        {item.children.map((itemChild) => (
                          <SheetClose
                            key={itemChild.id}
                            asChild
                            className="w-fit py-1.5 text-xs text-black/70"
                          >
                            <Link href={itemChild.url ?? "/"}>
                              {itemChild.label}
                            </Link>
                          </SheetClose>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
            </React.Fragment>
          ))}

          <div className="mt-6 pt-4 border-t border-black/[0.08] w-full space-y-2.5">
            <a
              href="https://wa.me/919528247811"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800"
            >
              <span>💬</span>
              <span>WhatsApp / Call: +91 95282 47811</span>
            </a>
            <SheetClose asChild>
              <Link
                href="/shop-anywhere"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-black/[0.04] border border-black/[0.08] rounded-xl text-xs font-bold text-black"
              >
                <span>🌐</span>
                <span>Inbuilt Indian Browser</span>
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link
                href="/checkout"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-black text-white rounded-xl text-xs font-bold"
              >
                <span>💳</span>
                <span>Unified Checkout</span>
              </Link>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ResTopNavbar;
