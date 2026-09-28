// Domain interfaces and Providers for Gift Business Workflow
import { Pool } from 'pg';

const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5433/medusa_db';
const pgPool = new Pool({ connectionString: dbUrl });

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
  variantId?: string;
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
  stageProgress: number; // 0 - 100%
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

// In-memory / PostgreSQL-backed storage for gift business orders & tasks
export class GiftBusinessStore {
  private static instance: GiftBusinessStore;
  private orders: Map<string, GiftOrder> = new Map();
  private tasks: Map<string, EmployeeTask> = new Map();

  private constructor() {
    this.initDb();
  }

  private async initDb() {
    try {
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS gift_orders (
          id VARCHAR(255) PRIMARY KEY,
          order_number VARCHAR(100) UNIQUE,
          data JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS gift_employee_tasks (
          id VARCHAR(255) PRIMARY KEY,
          order_id VARCHAR(255),
          data JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      const res = await pgPool.query('SELECT data FROM gift_orders');
      if (res.rows.length > 0) {
        for (const row of res.rows) {
          const ord = row.data as GiftOrder;
          this.orders.set(ord.id, ord);
        }
      } else {
        this.seedInitialOrders();
      }

      const taskRes = await pgPool.query('SELECT data FROM gift_employee_tasks');
      for (const row of taskRes.rows) {
        const t = row.data as EmployeeTask;
        this.tasks.set(t.id, t);
      }
    } catch (e: any) {
      console.warn('Postgres initialization warning, using initial memory seed:', e.message);
      this.seedInitialOrders();
    }
  }

  public static getInstance(): GiftBusinessStore {
    if (!GiftBusinessStore.instance) {
      GiftBusinessStore.instance = new GiftBusinessStore();
    }
    return GiftBusinessStore.instance;
  }

  private seedInitialOrders() {
    const order1: GiftOrder = {
      id: 'gift_ord_101',
      orderNumber: 'GFT-84920',
      customerName: 'Aarav Sharma',
      customerEmail: 'aarav.sharma@example.com',
      customerPhone: '+91 95282 47811',
      currentStage: 'GIFT_ASSEMBLY',
      stageProgress: 65,
      internalItems: [
        {
          id: 'item_1',
          productId: 'prod_art_candle',
          title: 'Artisanal Soy & Oud Scented Candle',
          price: 1450,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600',
        },
        {
          id: 'item_2',
          productId: 'prod_tea_tin',
          title: 'Single-Estate Darjeeling First Flush Tea Tin',
          price: 950,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600',
        }
      ],
      externalItems: [
        {
          id: 'ext_1',
          sourceUrl: 'https://www.zara.com/in/en/silk-scarf-p0201.html',
          marketplace: 'Zara',
          productName: '100% Mulberry Silk Printed Scarf',
          price: 2990,
          currency: 'INR',
          imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600',
          procurementStatus: 'QC_PASSED',
          procurementNotes: 'Received from Zara flagship warehouse. Quality inspection verified authentic 100% silk.',
          trackingNumber: 'ZR-DEL-9841'
        }
      ],
      packaging: {
        type: 'LUXURY_VELVET_BOX',
        name: 'Royal Midnight Velvet Hamper Box',
        price: 650,
        ribbonColor: 'Champagne Gold',
        waxSeal: true
      },
      giftMessage: 'Dearest Priya, Wishing you the most magical Birthday! Curated with love, from your favorite scent to this Zara silk piece. With lots of love, Aarav.',
      recipient: {
        name: 'Priya Verma',
        phone: '+91 95282 47811',
        street: 'Penthouse 4B, Silver Oak Heights, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
        deliveryDate: '2026-09-25',
        giftOccasion: 'Birthday'
      },
      subtotal: 5390,
      packagingFee: 650,
      shippingFee: 200,
      totalAmount: 6240,
      paymentStatus: 'PAID',
      createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
      slaStatus: 'ON_TRACK',
      timeline: [
        { stage: 'ORDER_PLACED', title: 'Payment verified & Order generated', completedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), actor: 'System' },
        { stage: 'PROCUREMENT_INVENTORY', title: 'Zara silk scarf procured & in-store items reserved', completedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(), actor: 'Procurement Bot' },
        { stage: 'QUALITY_CHECK', title: 'All items arrived & QC approved (100% check passed)', completedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), actor: 'Inspector Rajesh' },
        { stage: 'GIFT_ASSEMBLY', title: 'Gift Hamper being assembled by artisan team', completedAt: undefined, notes: 'Currently arranging into Midnight Velvet box with custom wax seal & champagne ribbon.' },
      ]
    };

    this.orders.set(order1.id, order1);

    // Initial tasks
    const task1: EmployeeTask = {
      id: 'task_001',
      orderId: order1.id,
      orderNumber: order1.orderNumber,
      type: 'ASSEMBLE_GIFT',
      title: 'Assemble Birthday Box #GFT-84920',
      description: 'Arrange 1x Scented Candle, 1x Darjeeling Tea, and 1x Zara Silk Scarf into Royal Midnight Velvet Box. Apply champagne ribbon and custom wax-sealed note card.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedTo: 'Artisan Priya',
      createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      dueAt: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    };
    this.tasks.set(task1.id, task1);
  }

  public getAllOrders(): GiftOrder[] {
    return Array.from(this.orders.values());
  }

  public getOrder(idOrNumber: string): GiftOrder | undefined {
    return (
      this.orders.get(idOrNumber) ||
      Array.from(this.orders.values()).find(
        (o) => o.orderNumber.toLowerCase() === idOrNumber.toLowerCase() || o.id === idOrNumber
      )
    );
  }

  public createOrder(data: Partial<GiftOrder>): GiftOrder {
    const id = `gift_ord_${Date.now()}`;
    const orderNumber = `GFT-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();
    const slaDeadline = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

    const order: GiftOrder = {
      id,
      orderNumber,
      customerName: data.customerName || 'Valued Customer',
      customerEmail: data.customerEmail || 'customer@example.com',
      customerPhone: data.customerPhone || '',
      currentStage: 'ORDER_PLACED',
      stageProgress: 15,
      internalItems: data.internalItems || [],
      externalItems: data.externalItems || [],
      packaging: data.packaging || {
        type: 'LUXURY_VELVET_BOX',
        name: 'Luxe Magnetic Gift Box',
        price: 500,
        ribbonColor: 'Burgundy',
        waxSeal: true,
      },
      giftMessage: data.giftMessage || 'A special gift just for you!',
      recipient: data.recipient || {
        name: 'Beloved Recipient',
        phone: '+91 95282 47811',
        street: '123 Gift Way',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
      },
      subtotal: data.subtotal || 0,
      packagingFee: data.packagingFee || 500,
      shippingFee: data.shippingFee || 150,
      totalAmount: data.totalAmount || (data.subtotal || 0) + 650,
      paymentStatus: data.paymentStatus || 'PAID',
      paymentGateway: data.paymentGateway || 'CASHFREE',
      cashfreeOrderId: data.cashfreeOrderId,
      cashfreePaymentId: data.cashfreePaymentId,
      cashfreeStatus: data.cashfreeStatus,
      bankReference: data.bankReference,
      paymentMethodUsed: data.paymentMethodUsed,
      paymentTime: data.paymentTime || now,
      createdAt: now,
      updatedAt: now,
      slaDeadline,
      slaStatus: 'ON_TRACK',
      timeline: data.timeline || [
        {
          stage: 'ORDER_PLACED',
          title: 'Single Payment Completed & Order Created',
          completedAt: now,
          actor: 'Customer Checkout',
        },
      ],
    };

    this.orders.set(order.id, order);

    // Persist to PostgreSQL
    pgPool.query(
      'INSERT INTO gift_orders (id, order_number, data, updated_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (id) DO UPDATE SET data = $3, updated_at = NOW()',
      [order.id, order.orderNumber, JSON.stringify(order)]
    ).catch((err) => console.warn('Postgres persist order error:', err.message));

    // Automation: Automatically trigger initial tasks based on items
    if (order.externalItems.length > 0) {
      order.externalItems.forEach((ext, idx) => {
        const procTask: EmployeeTask = {
          id: `task_proc_${Date.now()}_${idx}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          type: 'PROCURE_EXTERNAL',
          title: `Procure ${ext.productName} from ${ext.marketplace}`,
          description: `Place order on ${ext.marketplace} via URL: ${ext.sourceUrl}. Price cap: ₹${ext.price}. Expedited delivery to consolidation hub.`,
          priority: 'HIGH',
          status: 'PENDING',
          createdAt: now,
          dueAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
          metadata: { externalItemId: ext.id, sourceUrl: ext.sourceUrl },
        };
        this.tasks.set(procTask.id, procTask);
        pgPool.query(
          'INSERT INTO gift_employee_tasks (id, order_id, data, updated_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (id) DO UPDATE SET data = $3, updated_at = NOW()',
          [procTask.id, procTask.orderId, JSON.stringify(procTask)]
        ).catch(() => {});
      });
    }

    return order;
  }

  public updateOrderStage(orderId: string, nextStage: OrderStage, notes?: string, actor?: string): GiftOrder | null {
    const order = this.getOrder(orderId);
    if (!order) return null;

    order.currentStage = nextStage;
    order.updatedAt = new Date().toISOString();

    const stageProgressMap: Record<OrderStage, number> = {
      ORDER_PLACED: 15,
      PROCUREMENT_INVENTORY: 35,
      QUALITY_CHECK: 55,
      GIFT_ASSEMBLY: 75,
      PACKING: 90,
      SHIPPED: 95,
      DELIVERED: 100,
    };
    order.stageProgress = stageProgressMap[nextStage] || 50;

    order.timeline.push({
      stage: nextStage,
      title: `Advanced to ${nextStage.replace('_', ' ')}`,
      completedAt: new Date().toISOString(),
      notes,
      actor: actor || 'Operations',
    });

    pgPool.query(
      'UPDATE gift_orders SET data = $1, updated_at = NOW() WHERE id = $2 OR order_number = $2',
      [JSON.stringify(order), order.id]
    ).catch(() => {});

    return order;
  }

  public updatePayment(orderNumberOrId: string, paymentData: Partial<GiftOrder>): GiftOrder | null {
    const order = this.getOrder(orderNumberOrId);
    if (!order) return null;

    if (paymentData.paymentStatus) order.paymentStatus = paymentData.paymentStatus;
    if (paymentData.paymentGateway) order.paymentGateway = paymentData.paymentGateway;
    if (paymentData.cashfreeOrderId) order.cashfreeOrderId = paymentData.cashfreeOrderId;
    if (paymentData.cashfreePaymentId) order.cashfreePaymentId = paymentData.cashfreePaymentId;
    if (paymentData.cashfreeStatus) order.cashfreeStatus = paymentData.cashfreeStatus;
    if (paymentData.bankReference) order.bankReference = paymentData.bankReference;
    if (paymentData.paymentMethodUsed) order.paymentMethodUsed = paymentData.paymentMethodUsed;
    if (paymentData.paymentTime) order.paymentTime = paymentData.paymentTime;

    order.updatedAt = new Date().toISOString();
    order.timeline.push({
      stage: order.currentStage,
      title: `Payment Verified via ${order.paymentGateway || 'CASHFREE'}`,
      completedAt: new Date().toISOString(),
      notes: `Txn Ref: ${paymentData.cashfreePaymentId || paymentData.bankReference || 'Confirmed'} (Status: ${paymentData.paymentStatus || 'PAID'})`,
      actor: 'Cashfree Gateway',
    });

    pgPool.query(
      'UPDATE gift_orders SET data = $1, updated_at = NOW() WHERE id = $2 OR order_number = $2',
      [JSON.stringify(order), order.id]
    ).catch(() => {});

    return order;
  }

  public getAllTasks(): EmployeeTask[] {
    return Array.from(this.tasks.values());
  }

  public completeTask(taskId: string, notes?: string): EmployeeTask | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.status = 'COMPLETED';

    // Automation: If task completed, trigger next stage/task
    const order = this.getOrder(task.orderId);
    if (order) {
      if (task.type === 'PROCURE_EXTERNAL') {
        const extItem = order.externalItems.find((e) => e.id === task.metadata?.externalItemId);
        if (extItem) extItem.procurementStatus = 'RECEIVED';

        const allExtReceived = order.externalItems.every((e) => e.procurementStatus === 'RECEIVED' || e.procurementStatus === 'QC_PASSED');
        if (allExtReceived) {
          this.updateOrderStage(order.id, 'QUALITY_CHECK', 'All external items received at hub. Ready for QC.', 'Automated Pipeline');
          // Create QC Task
          const qcTask: EmployeeTask = {
            id: `task_qc_${Date.now()}`,
            orderId: order.id,
            orderNumber: order.orderNumber,
            type: 'QUALITY_CHECK',
            title: `Quality Check for Order #${order.orderNumber}`,
            description: `Inspect received items and in-store gifts for authenticity, packaging condition, and specifications.`,
            priority: 'HIGH',
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            dueAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
          };
          this.tasks.set(qcTask.id, qcTask);
        }
      } else if (task.type === 'QUALITY_CHECK') {
        this.updateOrderStage(order.id, 'GIFT_ASSEMBLY', 'QC verification passed. Proceeding to gift hamper assembly.', 'QC Team');
        const asmTask: EmployeeTask = {
          id: `task_asm_${Date.now()}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          type: 'ASSEMBLE_GIFT',
          title: `Assemble Gift Box #${order.orderNumber}`,
          description: `Package into ${order.packaging.name} with ${order.packaging.ribbonColor} ribbon and handwritten card: "${order.giftMessage}"`,
          priority: 'MEDIUM',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          dueAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
        };
        this.tasks.set(asmTask.id, asmTask);
      } else if (task.type === 'ASSEMBLE_GIFT') {
        this.updateOrderStage(order.id, 'PACKING', 'Assembly completed. Proceed to secure outer packaging.', 'Artisan Team');
        const packTask: EmployeeTask = {
          id: `task_pack_${Date.now()}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          type: 'PACK_GIFT',
          title: `Final Packing for #${order.orderNumber}`,
          description: `Add protective bubble wrap, tamper-proof security tape, and address label for ${order.recipient.name}.`,
          priority: 'MEDIUM',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          dueAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
        };
        this.tasks.set(packTask.id, packTask);
      } else if (task.type === 'PACK_GIFT') {
        this.updateOrderStage(order.id, 'SHIPPED', 'Package dispatched with premium express courier.', 'Fulfillment Dispatch');
        const shipTask: EmployeeTask = {
          id: `task_disp_${Date.now()}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          type: 'DISPATCH_SHIPMENT',
          title: `Handover to Express Carrier #${order.orderNumber}`,
          description: `Carrier Bluedart Express / FedEx tracking assigned.`,
          priority: 'HIGH',
          status: 'COMPLETED',
          createdAt: new Date().toISOString(),
          dueAt: new Date().toISOString(),
        };
        this.tasks.set(shipTask.id, shipTask);
      }
    }

    return task;
  }
}
