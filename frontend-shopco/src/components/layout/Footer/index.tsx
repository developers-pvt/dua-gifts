import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import React from "react";
import { PaymentBadge, SocialNetworks } from "./footer.types";
import { FaFacebookF, FaInstagram, FaTwitter, FaWhatsapp } from "react-icons/fa";
import Link from "next/link";
import LinksSection from "./LinksSection";
import Image from "next/image";
import NewsLetterSection from "./NewsLetterSection";
import LayoutSpacing from "./LayoutSpacing";

const socialsData: SocialNetworks[] = [
  {
    id: 1,
    icon: <FaTwitter />,
    url: "https://twitter.com",
  },
  {
    id: 2,
    icon: <FaFacebookF />,
    url: "https://facebook.com",
  },
  {
    id: 3,
    icon: <FaInstagram />,
    url: "https://instagram.com",
  },
  {
    id: 4,
    icon: <FaWhatsapp />,
    url: "https://wa.me/919528247811",
  },
];

const paymentBadgesData: PaymentBadge[] = [
  {
    id: 1,
    srcUrl: "/icons/Visa.svg",
  },
  {
    id: 2,
    srcUrl: "/icons/mastercard.svg",
  },
  {
    id: 3,
    srcUrl: "/icons/googlePay.svg",
  },
  {
    id: 4,
    srcUrl: "/icons/applePay.svg",
  },
];

const Footer = () => {
  return (
    <footer className="mt-14 border-t border-black/[0.06]">
      <div className="relative">
        <div className="absolute bottom-0 w-full h-1/2 bg-[#f5f5f7]"></div>
        <div className="px-4">
          <NewsLetterSection />
        </div>
      </div>
      <div className="pt-8 md:pt-[50px] bg-[#f5f5f7] px-4 pb-6">
        <div className="max-w-frame mx-auto">
          <nav className="lg:grid lg:grid-cols-12 mb-8">
            <div className="flex flex-col lg:col-span-4 lg:max-w-[320px]">
              <div className="flex flex-col mb-4">
                <span
                  className={cn([
                    integralCF.className,
                    "text-[24px] lg:text-[28px] tracking-tight leading-none text-black",
                  ])}
                >
                  DUA GIFTS
                </span>
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-black/40 mt-1">
                  INDIA
                </span>
              </div>
              <p className="text-black/60 text-sm mb-4 leading-relaxed">
                India&apos;s premier consolidated gift commerce platform. Combine curated in-store gifts with products from Flipkart, Shopsy, Meesho & Amazon India into one bespoke luxury hamper.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-black/80 mb-5">
                <span>📞 Helpline / WhatsApp:</span>
                <a href="https://wa.me/919528247811" target="_blank" rel="noreferrer" className="hover:underline font-bold text-black">
                  +91 95282 47811
                </a>
              </div>
              <div className="flex items-center gap-2">
                {socialsData.map((social) => (
                  <Link
                    href={social.url}
                    key={social.id}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white hover:bg-black hover:text-white transition-all w-8 h-8 rounded-full border border-black/10 flex items-center justify-center p-2 text-black/70 text-sm"
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden lg:grid col-span-8 lg:grid-cols-4 lg:pl-10">
              <LinksSection />
            </div>
            <div className="grid lg:hidden grid-cols-2 sm:grid-cols-4 mt-8">
              <LinksSection />
            </div>
          </nav>

          <hr className="h-[1px] border-t-black/[0.08] mb-6" />
          <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4">
            <p className="text-xs text-center sm:text-left text-black/50">
              Dua Gifts India © 2026. All rights reserved. Pan-India Consolidated Gifting & Express Delivery.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-black/40 font-medium mr-1">Accepted in India:</span>
              <span className="px-2 py-1 bg-white border border-black/10 rounded text-[11px] font-bold text-emerald-700">UPI / QR</span>
              <span className="px-2 py-1 bg-white border border-black/10 rounded text-[11px] font-bold text-blue-700">RuPay</span>
              {paymentBadgesData.map((badge) => (
                <span
                  key={badge.id}
                  className="w-[42px] h-[26px] rounded border border-black/10 bg-white flex items-center justify-center p-1"
                >
                  <Image
                    src={badge.srcUrl}
                    width={32}
                    height={20}
                    alt="payment method"
                    className="max-h-[14px] w-auto object-contain"
                  />
                </span>
              ))}
              <span className="px-2 py-1 bg-white border border-black/10 rounded text-[11px] font-bold text-black/70">COD</span>
            </div>
          </div>
        </div>
        <LayoutSpacing />
      </div>
    </footer>
  );
};

export default Footer;
