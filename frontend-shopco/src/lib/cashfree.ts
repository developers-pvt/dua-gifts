/**
 * Cashfree Payment Gateway Integration Helper
 * Supports Production and Sandbox modes with 2023-08-01 API
 */

export const CASHFREE_CONFIG = {
  appId: process.env.CASHFREE_APP_ID || process.env.AppID || '1404644f11e5afaf3816547d8ff4464041',
  secretKey: process.env.CASHFREE_SECRET_KEY || process.env['Secret Key'] || 'cfsk_ma_prod_2f649ff24b99ff0fbe998a24c9e80b21_d24098e5',
  env: (process.env.CASHFREE_ENV || 'PRODUCTION').toUpperCase(),
  apiVersion: process.env.CASHFREE_API_VERSION || '2023-08-01',
};

export function getCashfreeBaseUrl(): string {
  return CASHFREE_CONFIG.env === 'TEST' || CASHFREE_CONFIG.env === 'SANDBOX'
    ? 'https://sandbox.cashfree.com/pg'
    : 'https://api.cashfree.com/pg';
}

export interface CashfreeCustomerDetails {
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

export interface CreateOrderParams {
  orderId: string;
  orderAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl?: string;
  orderNote?: string;
}

export interface CashfreeOrderResponse {
  cf_order_id: string;
  order_id: string;
  entity: string;
  order_currency: string;
  order_amount: number;
  order_status: 'ACTIVE' | 'PAID' | 'EXPIRED' | 'TERMINATED';
  payment_session_id: string;
  order_expiry_time: string;
  customer_details: CashfreeCustomerDetails;
}

export interface CashfreePaymentItem {
  cf_payment_id: string;
  order_id: string;
  entity: string;
  payment_currency: string;
  payment_amount: number;
  payment_time: string;
  payment_status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'USER_DROPPED';
  payment_message?: string;
  bank_reference?: string;
  payment_group?: string;
  payment_method?: Record<string, any>;
}

export async function createCashfreeOrder(params: CreateOrderParams): Promise<CashfreeOrderResponse> {
  const baseUrl = getCashfreeBaseUrl();
  const cleanPhone = (params.customerPhone || '9528247811').replace(/[^0-9]/g, '').slice(-10) || '9528247811';
  
  // Cashfree production requires https for return_url
  let returnUrl = params.returnUrl;
  if (!returnUrl || !returnUrl.startsWith('https://')) {
    returnUrl = `https://duagifts.in/payment/verify?order_id={order_id}`;
  }

  const payload = {
    order_id: params.orderId,
    order_amount: Math.max(1, Number(params.orderAmount.toFixed(2))),
    order_currency: 'INR',
    customer_details: {
      customer_id: `cust_${params.orderId.replace(/[^a-zA-Z0-9_-]/g, '')}`,
      customer_name: params.customerName || 'Dua Gifts Customer',
      customer_email: params.customerEmail || 'customer@duagifts.com',
      customer_phone: cleanPhone,
    },
    order_meta: {
      return_url: returnUrl,
      payment_methods: null,
    },
    order_note: params.orderNote || `Dua Gifts Order ${params.orderId}`,
  };

  const response = await fetch(`${baseUrl}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': CASHFREE_CONFIG.appId,
      'x-client-secret': CASHFREE_CONFIG.secretKey,
      'x-api-version': CASHFREE_CONFIG.apiVersion,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Cashfree Error (${response.status}): ${JSON.stringify(data)}`);
  }

  return data as CashfreeOrderResponse;
}

export async function fetchCashfreeOrder(orderId: string): Promise<CashfreeOrderResponse> {
  const baseUrl = getCashfreeBaseUrl();
  const response = await fetch(`${baseUrl}/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    headers: {
      'x-client-id': CASHFREE_CONFIG.appId,
      'x-client-secret': CASHFREE_CONFIG.secretKey,
      'x-api-version': CASHFREE_CONFIG.apiVersion,
    },
    cache: 'no-store',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Failed to fetch Cashfree order (${response.status})`);
  }
  return data as CashfreeOrderResponse;
}

export async function fetchCashfreeOrderPayments(orderId: string): Promise<CashfreePaymentItem[]> {
  const baseUrl = getCashfreeBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/orders/${encodeURIComponent(orderId)}/payments`, {
      method: 'GET',
      headers: {
        'x-client-id': CASHFREE_CONFIG.appId,
        'x-client-secret': CASHFREE_CONFIG.secretKey,
        'x-api-version': CASHFREE_CONFIG.apiVersion,
      },
      cache: 'no-store',
    });

    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}
