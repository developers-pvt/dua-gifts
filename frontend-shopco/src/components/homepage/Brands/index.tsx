import React from "react";

const platformHighlights = [
  { label: "DUA GIFTS EXCLUSIVES", icon: "🎁" },
  { label: "FLIPKART & SHOPSY INTEGRATION", icon: "🛍️" },
  { label: "MEESHO & MYNTRA SOURCING", icon: "🌸" },
  { label: "AMAZON INDIA PARTNER", icon: "📦" },
  { label: "PAN-INDIA EXPRESS DELIVERY", icon: "🚚" },
  { label: "100% QUALITY CHECKED", icon: "✨" },
];

const Brands = () => {
  return (
    <div className="bg-[#111113] py-4 border-y border-white/[0.08]">
      <div className="max-w-frame mx-auto flex flex-wrap items-center justify-around gap-6 px-4 text-center">
        {platformHighlights.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
            <span className="text-lg">{item.icon}</span>
            <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Brands;
