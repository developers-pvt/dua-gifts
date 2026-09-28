import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MarketplaceService } from "../../../services/providers";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { url } = req.body as { url?: string };

  if (!url) {
    return res.status(400).json({ error: "Product URL is required" });
  }

  const product = MarketplaceService.parseProductUrl(url);

  return res.json({
    success: true,
    product,
    message: "External product parsed and verified for consolidated gifting",
  });
}
