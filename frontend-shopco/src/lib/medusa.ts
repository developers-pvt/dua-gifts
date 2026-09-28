// Medusa JS Client & Gift Business API integration for Shopco

export const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || 'http://localhost:9000';
export const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'pk_giftstudio_web_99182';

export interface ExternalProductItem {
  id: string;
  sourceUrl: string;
  marketplace: string;
  productName: string;
  price: number;
  currency: string;
  imageUrl?: string;
  selectedVariant?: string;
  procurementStatus: 'PENDING' | 'ORDERED' | 'RECEIVED' | 'QC_PASSED' | 'EXCEPTION';
  procurementNotes?: string;
  trackingNumber?: string;
}

export interface InternalProductItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface GiftPackagingOption {
  type: 'LUXURY_VELVET_BOX' | 'WOODEN_KEEPSAKE_CRATE' | 'MINIMAL_ECO_KRAFT' | 'FESTIVE_GOLD_HAMPER';
  name: string;
  price: number;
  ribbonColor: string;
  waxSeal: boolean;
}

export interface RecipientInfo {
  name: string;
  phone: string;
  email?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  deliveryDate?: string;
  giftOccasion?: string;
}

export type OrderStage = 
  | 'ORDER_PLACED'
  | 'PROCUREMENT_INVENTORY'
  | 'QUALITY_CHECK'
  | 'GIFT_ASSEMBLY'
  | 'PACKING'
  | 'SHIPPED'
  | 'DELIVERED';

export interface GiftOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  currentStage: OrderStage;
  stageProgress: number;
  internalItems: InternalProductItem[];
  externalItems: ExternalProductItem[];
  packaging: GiftPackagingOption;
  giftMessage: string;
  recipient: RecipientInfo;
  subtotal: number;
  packagingFee: number;
  shippingFee: number;
  totalAmount: number;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
  paymentGateway?: 'CASHFREE' | 'COD' | 'MANUAL_UPI' | 'CARD';
  cashfreeOrderId?: string;
  cashfreePaymentId?: string;
  cashfreeStatus?: string;
  bankReference?: string;
  paymentMethodUsed?: string;
  paymentTime?: string;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  slaStatus: 'ON_TRACK' | 'WARNING' | 'ESCALATED' | 'BREACHED';
  timeline: Array<{
    stage: OrderStage;
    title: string;
    completedAt?: string;
    notes?: string;
    actor?: string;
  }>;
}

export interface EmployeeTask {
  id: string;
  orderId: string;
  orderNumber: string;
  type: 'PROCURE_EXTERNAL' | 'QUALITY_CHECK' | 'ASSEMBLE_GIFT' | 'PACK_GIFT' | 'DISPATCH_SHIPMENT';
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  assignedTo?: string;
  createdAt: string;
  dueAt: string;
  metadata?: any;
}

const defaultHeaders = {
  'Content-Type': 'application/json',
  'x-publishable-api-key': PUBLISHABLE_KEY,
};

export const MedusaApi = {
  // Fetch live products from backend API
  async getProducts(params?: {
    category?: string;
    query?: string;
    sort?: string;
    page?: number;
    limit?: number;
    featured?: boolean;
    bestsellers?: boolean;
  }): Promise<{ products: any[]; total: number; categories?: string[] }> {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.query) query.set("query", params.query);
    if (params?.sort) query.set("sort", params.sort);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.featured) query.set("featured", "true");
    if (params?.bestsellers) query.set("bestsellers", "true");

    const res = await fetch(`/api/products?${query.toString()}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load products");
    return res.json();
  },

  // Fetch single product by id or handle
  async getProduct(id: string): Promise<{ product: any; relatedProducts: any[] }> {
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Product not found");
    return res.json();
  },

  // Fetch dynamic categories
  async getCategories(): Promise<{ categories: any[] }> {
    const res = await fetch(`/api/categories`, { cache: "no-store" });
    if (!res.ok) return { categories: [] };
    return res.json();
  },

  // Fetch store configuration
  async getStoreSettings(): Promise<any> {
    const res = await fetch(`/api/store/settings`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  },

  // Fetch customer reviews
  async getReviews(): Promise<{ reviews: any[] }> {
    const res = await fetch(`/api/reviews`, { cache: "no-store" });
    if (!res.ok) return { reviews: [] };
    return res.json();
  },

  // Fetch orders or search by query
  async getGiftOrders(query?: string): Promise<{ orders: GiftOrder[] }> {
    const url = query 
      ? `${MEDUSA_BACKEND_URL}/store/gift-orders?query=${encodeURIComponent(query)}`
      : `${MEDUSA_BACKEND_URL}/store/gift-orders`;
    const res = await fetch(url, { headers: defaultHeaders, cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch gift orders');
    const data = await res.json();
    return { orders: data.orders || (data.order ? [data.order] : []) };
  },

  // Fetch single order for tracking
  async getGiftOrder(idOrNumber: string): Promise<GiftOrder> {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/gift-orders/${encodeURIComponent(idOrNumber)}`, {
      headers: defaultHeaders,
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Order not found');
    const data = await res.json();
    return data.order;
  },

  // Single Checkout: Create Gift Order
  async createGiftOrder(orderData: Partial<GiftOrder>): Promise<GiftOrder> {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/gift-orders`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to create gift order');
    const data = await res.json();
    return data.order;
  },

  // Update Order Payment Details (e.g. Cashfree verification)
  async updateGiftOrderPayment(orderNumber: string, paymentData: Partial<GiftOrder>): Promise<any> {
    try {
      const res = await fetch(`${MEDUSA_BACKEND_URL}/store/gift-orders/${encodeURIComponent(orderNumber)}/payment`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(paymentData),
      });
      return await res.json();
    } catch (e) {
      console.warn("Could not sync payment with Medusa backend directly:", e);
      return null;
    }
  },

  // Shop Anywhere: Parse external product URL
  async parseShopAnywhereUrl(url: string) {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/shop-anywhere`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error('Failed to parse product URL');
    return res.json();
  },

  // AI Gift Generator
  async generateAIGiftMessage(params: {
    recipientName: string;
    occasion: string;
    relationship: string;
    tone: string;
  }): Promise<string> {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/ai-gift`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('AI generation failed');
    const data = await res.json();
    return data.message;
  },

  // AI Gift Recommendations
  async getAIGiftRecommendations(params: {
    occasion: string;
    budget: number;
    recipientType: string;
  }) {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/ai-gift`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ action: 'recommendations', ...params }),
    });
    if (!res.ok) throw new Error('AI recommendations failed');
    return res.json();
  },

  // Manager: Fetch all orders and metrics
  async getOperationsOrders() {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/gift-operations/orders`, {
      headers: defaultHeaders,
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch operations data');
    return res.json();
  },

  // Employee: Fetch tasks
  async getEmployeeTasks(): Promise<{ tasks: EmployeeTask[] }> {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/gift-operations/tasks`, {
      headers: defaultHeaders,
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch employee tasks');
    return res.json();
  },

  // Employee: Complete task
  async completeEmployeeTask(taskId: string, notes?: string) {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/gift-operations/tasks`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ taskId, notes }),
    });
    if (!res.ok) throw new Error('Failed to complete task');
    return res.json();
  },

  // AI: Photo to product
  async aiCreateProductFromPhoto(imageName: string) {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/gift-operations/ai-tools`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ tool: 'create-from-photo', image: imageName }),
    });
    if (!res.ok) throw new Error('AI photo analysis failed');
    return res.json();
  },

  // AI: Operations delay assistance
  async aiOperationsAssistant() {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/gift-operations/ai-tools`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ tool: 'operations-assistant' }),
    });
    if (!res.ok) throw new Error('AI operations assistant failed');
    return res.json();
  }
};
