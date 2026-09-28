import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AIService } from "../../../../services/providers";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { tool, image, context } = req.body as { tool: string; image?: string; context?: any };

  if (tool === "create-from-photo") {
    const productDraft = await AIService.analyzeProductImage(image || "sample_product.jpg");
    return res.json({ success: true, productDraft });
  }

  if (tool === "operations-assistant") {
    const response = {
      summary: "All 3 active procurement channels (Amazon, Zara, Sephora) are operating within target SLAs.",
      recommendations: [
        "Order #GFT-84920 is currently ready for packaging sealing. Artisan Priya is on track.",
        "Consider ordering 20 units of 'Royal Midnight Velvet Box' as inventory is nearing threshold.",
      ],
      escalations: [],
    };
    return res.json({ success: true, response });
  }

  return res.status(400).json({ error: "Unknown AI tool requested" });
}
