import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    settings: {
      brandName: "Dua Gifts",
      tagline: "India's Premier Luxury Gift Studio & Consolidated Gifting Platform",
      supportPhone: "+91 95282 47811",
      supportWhatsApp: "919528247811",
      supportEmail: "support@duagifts.com",
      address: "Dua Gifts Studio, Indiranagar, Bengaluru / Mumbai Logistics Hub",
      currency: "₹",
      currencyCode: "INR",
      freeDeliveryThreshold: 999,
      deliveryRates: {
        standard: 99,
        express: 149,
        sameDay: 299,
      },
      paymentGateways: [
        {
          id: "cashfree",
          name: "Cashfree Secure Payment Gateway",
          isExclusive: true,
          supportedMethods: ["UPI", "Google Pay", "PhonePe", "Paytm", "RuPay", "Cards", "NetBanking", "Wallets"],
          sandbox: false,
        },
      ],
      packagingOptions: [
        { id: "kraft", type: "MINIMAL_ECO_KRAFT", name: "Minimal Eco Kraft", price: 0, desc: "Recycled kraft wrap with wax seal" },
        { id: "velvet", type: "LUXURY_VELVET_BOX", name: "Luxury Velvet Box", price: 499, desc: "Royal velvet box with satin ribbon & custom stamp" },
        { id: "wooden", type: "WOODEN_KEEPSAKE_CRATE", name: "Wooden Keepsake Crate", price: 799, desc: "Handcrafted pine wood crate with vintage brass clasp" },
      ],
      states: [
        "Delhi NCR", "Maharashtra", "Karnataka", "Tamil Nadu", "Uttar Pradesh",
        "Gujarat", "West Bengal", "Telangana", "Rajasthan", "Kerala", "Punjab",
        "Haryana", "Madhya Pradesh", "Bihar", "Andhra Pradesh", "Odisha",
        "Assam", "Goa", "Uttarakhand", "Himachal Pradesh", "Jharkhand",
        "Chhattisgarh", "Chandigarh", "Jammu & Kashmir",
      ],
    },
  });
}
