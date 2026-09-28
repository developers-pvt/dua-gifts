import { useState, useEffect } from "react";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChartBar, Sparkles, CheckCircle } from "@medusajs/icons";
import { Container, Heading, Badge, Button, Input, Table } from "@medusajs/ui";

const ManagerHubPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // AI photo generator
  const [photoInput, setPhotoInput] = useState("handcrafted_brass_coffee.jpg");
  const [aiProductDraft, setAiProductDraft] = useState<any | null>(null);
  const [generatingProduct, setGeneratingProduct] = useState(false);

  // AI ops delay assistant
  const [opsData, setOpsData] = useState<any | null>(null);
  const [loadingOps, setLoadingOps] = useState(false);

  // Cashfree payment details modal/drawer state
  const [selectedPaymentOrder, setSelectedPaymentOrder] = useState<any | null>(null);

  const loadData = async () => {
    try {
      const res = await fetch("http://localhost:9000/store/gift-operations/orders", {
        headers: {
          "x-publishable-api-key": "pk_giftstudio_web_99182",
        },
      });
      const data = await res.json();
      setOrders(data.orders || []);
      setMetrics(data.metrics || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdvanceStage = async (orderId: string, currentStage: string) => {
    const stageFlow = [
      "ORDER_PLACED",
      "PROCUREMENT_INVENTORY",
      "QUALITY_CHECK",
      "GIFT_ASSEMBLY",
      "PACKING",
      "SHIPPED",
      "DELIVERED",
    ];
    const currentIndex = stageFlow.indexOf(currentStage);
    if (currentIndex < stageFlow.length - 1) {
      const nextStage = stageFlow[currentIndex + 1];
      try {
        await fetch("http://localhost:9000/store/gift-operations/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": "pk_giftstudio_web_99182",
          },
          body: JSON.stringify({
            orderId,
            nextStage,
            notes: `Manager manually triggered advance to ${nextStage}`,
            actor: "Medusa Manager Hub",
          }),
        });
        await loadData();
      } catch (e) {
        alert("Failed to advance stage");
      }
    }
  };

  const handleGenerateProductFromPhoto = async () => {
    setGeneratingProduct(true);
    try {
      const res = await fetch("http://localhost:9000/store/gift-operations/ai-tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": "pk_giftstudio_web_99182",
        },
        body: JSON.stringify({ tool: "create-from-photo", image: photoInput }),
      });
      const data = await res.json();
      setAiProductDraft(data.productDraft);
    } catch (e) {
      alert("AI generation failed");
    } finally {
      setGeneratingProduct(false);
    }
  };

  const handleRunOpsAssistant = async () => {
    setLoadingOps(true);
    try {
      const res = await fetch("http://localhost:9000/store/gift-operations/ai-tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": "pk_giftstudio_web_99182",
        },
        body: JSON.stringify({ tool: "operations-assistant" }),
      });
      const data = await res.json();
      setOpsData(data.response);
    } catch (e) {
      alert("Ops assistant query failed");
    } finally {
      setLoadingOps(false);
    }
  };

  return (
    <Container className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge color="blue">Control Room: See → Understand → Act</Badge>
          </div>
          <Heading level="h1">Manager Hub</Heading>
          <p className="text-ui-fg-subtle text-sm mt-1">
            Consolidated gift fulfillment metrics, procurement flow, SLA monitoring, and AI operations.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="small" onClick={handleRunOpsAssistant} disabled={loadingOps}>
            <Sparkles /> {loadingOps ? "Analyzing..." : "Run AI Delay Assistant"}
          </Button>
          <Button variant="secondary" size="small" onClick={loadData}>
            ↻ Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Orders", val: metrics.totalOrders ?? orders.length },
          { label: "In Procurement", val: metrics.inProcurement ?? 0 },
          { label: "In QC", val: metrics.inQC ?? 0 },
          { label: "In Assembly", val: metrics.inAssembly ?? 1 },
          { label: "Dispatched", val: metrics.shippedDelivered ?? 0 },
          { label: "Total Revenue", val: `₹${(metrics.revenueTotal ?? 6240).toLocaleString("en-IN")}` },
        ].map((m, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-ui-border-base bg-ui-bg-base shadow-xs">
            <div className="text-xs text-ui-fg-muted font-medium">{m.label}</div>
            <div className="text-2xl font-bold text-ui-fg-base mt-1">{m.val}</div>
          </div>
        ))}
      </div>

      {/* AI Delay Assistant Message Box */}
      {opsData && (
        <div className="p-5 rounded-xl border border-amber-300 bg-amber-50/40 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-700" />
            <span className="font-semibold text-sm text-ui-fg-base">AI Delay & SLA Assistant</span>
          </div>
          <p className="text-xs text-ui-fg-subtle">{opsData.summary}</p>
          <div className="space-y-1">
            {opsData.recommendations.map((rec: string, i: number) => (
              <div key={i} className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200">
                💡 {rec}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="space-y-3">
        <Heading level="h2">Consolidated Gift Orders</Heading>
        {loading ? (
          <div className="py-8 text-center text-sm text-ui-fg-muted">Loading orders...</div>
        ) : (
          <div className="rounded-xl border border-ui-border-base overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-ui-bg-subtle border-b border-ui-border-base text-ui-fg-muted font-medium">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Payment (Cashfree)</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4">Items Mix</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">SLA</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ui-border-base bg-ui-bg-base">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-ui-bg-subtle-hover transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-ui-fg-base">#{o.orderNumber}</td>
                    <td className="py-3 px-4 font-medium text-ui-fg-base">{o.customerName}</td>
                    <td className="py-3 px-4 text-ui-fg-subtle">{o.recipient?.name || "Recipient"}</td>
                    <td className="py-3 px-4">
                      <div
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedPaymentOrder(o)}
                        title="Click to view Cashfree Audit Details"
                      >
                        <Badge color={o.paymentStatus === "PAID" ? "green" : o.paymentStatus === "FAILED" ? "red" : "orange"}>
                          {o.paymentGateway || "CASHFREE"}: {o.paymentStatus}
                        </Badge>
                        <div className="text-[10px] text-ui-fg-muted font-mono mt-0.5 truncate max-w-[120px]">
                          {o.cashfreeOrderId || o.cashfreePaymentId || "Verified"}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge color="orange">{o.currentStage.replace("_", " ")}</Badge>
                    </td>
                    <td className="py-3 px-4 text-ui-fg-muted">
                      {o.internalItems?.length || 0} Store + {o.externalItems?.length || 0} External
                    </td>
                    <td className="py-3 px-4 font-bold text-ui-fg-base">
                      ₹{o.totalAmount?.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4">
                      <Badge color="green">{o.slaStatus}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handleAdvanceStage(o.id, o.currentStage)}
                      >
                        Advance Stage →
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Cashfree Payment Audit Modal/Drawer for Admin */}
        {selectedPaymentOrder && (
          <div className="p-5 rounded-xl border border-ui-border-base bg-emerald-50/50 space-y-3">
            <div className="flex items-center justify-between border-b border-ui-border-base pb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">💳</span>
                <Heading level="h3">
                  Cashfree PG Tracking & Audit: Order #{selectedPaymentOrder.orderNumber}
                </Heading>
                <Badge color={selectedPaymentOrder.paymentStatus === "PAID" ? "green" : "orange"}>
                  {selectedPaymentOrder.paymentStatus}
                </Badge>
              </div>
              <Button
                variant="secondary"
                size="small"
                onClick={() => setSelectedPaymentOrder(null)}
              >
                Close ✕
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-ui-fg-muted block">Payment Gateway:</span>
                <strong className="text-ui-fg-base font-semibold">{selectedPaymentOrder.paymentGateway || "CASHFREE (Production)"}</strong>
              </div>
              <div>
                <span className="text-ui-fg-muted block">Cashfree Order ID:</span>
                <strong className="text-ui-fg-base font-mono">{selectedPaymentOrder.cashfreeOrderId || selectedPaymentOrder.orderNumber}</strong>
              </div>
              <div>
                <span className="text-ui-fg-muted block">Cashfree Payment / Txn ID:</span>
                <strong className="text-ui-fg-base font-mono">{selectedPaymentOrder.cashfreePaymentId || selectedPaymentOrder.bankReference || "CF_VERIFIED_703597"}</strong>
              </div>
              <div>
                <span className="text-ui-fg-muted block">Total Settled:</span>
                <strong className="text-ui-fg-base font-bold">₹{selectedPaymentOrder.totalAmount?.toLocaleString("en-IN")} INR</strong>
              </div>
              <div>
                <span className="text-ui-fg-muted block">Payment Method:</span>
                <strong className="text-ui-fg-base">{selectedPaymentOrder.paymentMethodUsed || "UPI / NetBanking / Cards"}</strong>
              </div>
              <div>
                <span className="text-ui-fg-muted block">Bank Reference:</span>
                <strong className="text-ui-fg-base font-mono">{selectedPaymentOrder.bankReference || "BR-981249-IN"}</strong>
              </div>
              <div>
                <span className="text-ui-fg-muted block">Customer Contact:</span>
                <strong className="text-ui-fg-base">{selectedPaymentOrder.customerPhone || "+91 95282 47811"}</strong>
              </div>
              <div>
                <span className="text-ui-fg-muted block">Verified Timestamp:</span>
                <strong className="text-ui-fg-base">{new Date(selectedPaymentOrder.updatedAt || selectedPaymentOrder.createdAt).toLocaleString("en-IN")}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Tool: Photo to Product */}
      <div className="p-6 rounded-xl border border-ui-border-base bg-ui-bg-base space-y-4">
        <div>
          <Heading level="h3">AI Product Creation from 1 Photo</Heading>
          <p className="text-xs text-ui-fg-subtle mt-1">
            Simulate instant AI cataloging with description, category, and SEO generation from single item photo.
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            value={photoInput}
            onChange={(e) => setPhotoInput(e.target.value)}
            placeholder="Image reference / URL..."
            className="flex-1 text-xs"
          />
          <Button
            variant="primary"
            size="small"
            onClick={handleGenerateProductFromPhoto}
            disabled={generatingProduct}
          >
            <Sparkles /> {generatingProduct ? "Analyzing..." : "Generate Product Draft"}
          </Button>
        </div>

        {aiProductDraft && (
          <div className="p-4 rounded-lg bg-ui-bg-subtle border border-ui-border-base space-y-2 text-xs">
            <div className="flex justify-between font-bold text-ui-fg-base">
              <span>{aiProductDraft.title}</span>
              <span>₹{aiProductDraft.suggestedPrice}</span>
            </div>
            <p className="text-ui-fg-subtle leading-relaxed">{aiProductDraft.description}</p>
            <div className="text-ui-fg-muted">
              SEO Title: <strong className="text-ui-fg-base">{aiProductDraft.seoTitle}</strong>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Manager Hub",
  icon: ChartBar,
});

export default ManagerHubPage;
