import type { RemoteQueryFunction, SearchTypes } from "@medusajs/framework/types";
import {
  defineSearchIndex,
  graphConsume,
  graphSeed,
  QueryContext,
  search,
} from "@medusajs/framework/utils";

// --- Option Values Helpers ---
export type ProductOptionRow = {
  title?: string | null;
  values?: ({ value?: string | null } | null)[] | null;
} | null;

export function toOptionValues(
  options: ProductOptionRow[] | null | undefined,
): string[] {
  const flattened = (options ?? []).flatMap((option) => {
    const title = option?.title?.trim();
    if (!title) return [];
    return (option?.values ?? [])
      .map((optionValue) => optionValue?.value?.trim())
      .filter((value): value is string => Boolean(value))
      .map((value) => `${title}:${value}`);
  });
  return Array.from(new Set(flattened));
}

// --- Pricing Helpers ---
export const PRICE_CURRENCIES = ["eur", "usd", "inr"] as const;
export type PriceCurrency = (typeof PRICE_CURRENCIES)[number];

const PRICE_GRAPH_FIELDS = [
  "id",
  "variants.calculated_price.calculated_amount",
  "variants.calculated_price.original_amount",
];

const pricingContext = (currency: PriceCurrency) => ({
  variants: {
    calculated_price: QueryContext({ currency_code: currency }),
  },
});

type PricedVariant = {
  calculated_price?: {
    calculated_amount?: number | null;
    original_amount?: number | null;
  } | null;
  [key: string]: unknown;
} | null;

export type ProductPricingRows = Partial<Record<PriceCurrency, PricedVariant[] | null>>;

type PriceFieldName = `${"min_price" | "max_price" | "original_price"}_${PriceCurrency}`;
type OnSaleFieldName = `on_sale_${PriceCurrency}`;

export type ProductPricing = { [K in PriceFieldName]?: number | null } & {
  [K in OnSaleFieldName]?: boolean | null;
};

type PriceFields = {
  [K in PriceFieldName]: ReturnType<typeof search.float>;
} & { [K in OnSaleFieldName]: ReturnType<typeof search.boolean> };

export const priceFields = Object.fromEntries(
  PRICE_CURRENCIES.flatMap((currency) => [
    [
      `min_price_${currency}`,
      search.float().filterable().sortable().facetable({ types: ["stats"] }).retrievable(),
    ],
    [
      `max_price_${currency}`,
      search.float().filterable().sortable().facetable({ types: ["stats"] }).retrievable(),
    ],
    [`original_price_${currency}`, search.float().retrievable()],
    [`on_sale_${currency}`, search.boolean().filterable().facetable().retrievable()],
  ]),
) as PriceFields;

function toPricing(
  currency: PriceCurrency,
  variants: PricedVariant[] | null | undefined,
): ProductPricing {
  let cheapest: { calculated: number; original: number } | undefined;
  let maxPrice: number | undefined;

  for (const variant of variants ?? []) {
    const price = variant?.calculated_price;
    const calculated = price?.calculated_amount;
    if (typeof calculated !== "number") continue;

    const original = typeof price?.original_amount === "number" ? price.original_amount : calculated;
    if (maxPrice === undefined || calculated > maxPrice) maxPrice = calculated;
    if (!cheapest || calculated < cheapest.calculated) cheapest = { calculated, original };
  }

  if (!cheapest) return {};

  return {
    [`min_price_${currency}`]: cheapest.calculated,
    [`max_price_${currency}`]: maxPrice ?? cheapest.calculated,
    [`original_price_${currency}`]: cheapest.original,
    [`on_sale_${currency}`]: cheapest.original > cheapest.calculated,
  } as ProductPricing;
}

export function toProductPricing(pricingRows: ProductPricingRows | undefined): ProductPricing {
  return Object.assign(
    {},
    ...PRICE_CURRENCIES.map((currency) => toPricing(currency, pricingRows?.[currency])),
  );
}

export async function loadPricing(
  ids: string[],
  { container }: SearchTypes.SearchIngestionContext,
): Promise<Map<string, ProductPricingRows>> {
  const pricing = new Map<string, ProductPricingRows>();
  if (!ids.length) return pricing;

  await Promise.all(
    PRICE_CURRENCIES.map(async (currency) => {
      const { data } = await container.query.graph({
        entity: "product",
        fields: PRICE_GRAPH_FIELDS,
        filters: { id: ids },
        context: pricingContext(currency),
      });

      for (const product of data) {
        const rows = pricing.get(product.id) ?? {};
        rows[currency] = product.variants as PricedVariant[] | null;
        pricing.set(product.id, rows);
      }
    }),
  );

  return pricing;
}

// --- Resolve Product IDs Helpers ---
const RESOLVE_BATCH_SIZE = 200;

function payloadIds(data: unknown): string[] {
  return (Array.isArray(data) ? data : [data])
    .map((entry) => (entry as { id?: string } | undefined)?.id)
    .filter((id): id is string => Boolean(id));
}

async function relatedProductIds(
  query: RemoteQueryFunction,
  entity: string,
  fields: string[],
  ids: string[],
  pick: (row: Record<string, any>) => (string | null | undefined)[],
  withDeleted: boolean,
): Promise<string[]> {
  const { data } = await query.graph({
    entity,
    fields,
    filters: { id: ids },
    withDeleted,
  });

  return (data as Record<string, any>[]).flatMap(pick).filter((id): id is string => Boolean(id));
}

async function productIdsInSalesChannels(
  query: RemoteQueryFunction,
  salesChannelIds: string[],
): Promise<string[]> {
  const ids: string[] = [];
  let skip = 0;

  while (true) {
    const { search_result: result } = await query.search({
      entity: "product",
      fields: ["id"],
      filters: { sales_channel_ids: salesChannelIds },
      pagination: { skip, take: RESOLVE_BATCH_SIZE },
    });

    ids.push(...result.hits.map((hit) => hit.id));
    if (result.hits.length < RESOLVE_BATCH_SIZE) return ids;
    skip += RESOLVE_BATCH_SIZE;
  }
}

export async function resolveProductIds(
  event: { name: string; data: unknown },
  { container: { query } }: SearchTypes.SearchIngestionContext,
): Promise<string[]> {
  const ids = payloadIds(event.data);
  if (!ids.length) return [];

  const [entity] = event.name.split(".");
  const deleted = event.name.endsWith(".deleted");

  switch (entity) {
    case "product":
      return ids;
    case "product-variant":
      return relatedProductIds(query, "product_variant", ["product_id"], ids, (row) => [row.product_id], deleted);
    case "product-option":
      return relatedProductIds(query, "product_option", ["product_id"], ids, (row) => [row.product_id], deleted);
    case "product-option-value":
      return relatedProductIds(query, "product_option_value", ["option.product_id"], ids, (row) => [row.option?.product_id], deleted);
    case "product-tag":
      return relatedProductIds(query, "product_tag", ["products.id"], ids, (row) => (row.products ?? []).map((product: any) => product?.id), deleted);
    case "product-category":
      return relatedProductIds(query, "product_category", ["products.id"], ids, (row) => (row.products ?? []).map((product: any) => product?.id), deleted);
    case "sales-channel":
      return productIdsInSalesChannels(query, ids);
    default:
      return [];
  }
}

// --- Main Search Index Definition ---
const PRODUCT_GRAPH_FIELDS = [
  "id",
  "title",
  "description",
  "handle",
  "thumbnail",
  "status",
  "created_at",
  "sales_channels.id",
  "categories.name",
  "tags.value",
  "options.title",
  "options.values.value",
];

type ProductRow = {
  id: string;
  title?: string | null;
  description?: string | null;
  handle?: string | null;
  thumbnail?: string | null;
  status?: string | null;
  created_at?: string | Date | null;
  deleted_at?: string | Date | null;
  sales_channels?: ({ id?: string | null } | null)[] | null;
  categories?: ({ name?: string | null } | null)[] | null;
  tags?: ({ value?: string | null } | null)[] | null;
  options?: ProductOptionRow[] | null;
};

const productFields = search.define({
  id: search.keyword().filterable().retrievable(),
  status: search.keyword().filterable().retrievable(false),
  sales_channel_ids: search.keyword().array().filterable().retrievable(false),
  title: search.text().searchable({ weight: 3 }).sortable().retrievable(),
  description: search.text().searchable({ weight: 1 }),
  handle: search.keyword().retrievable(),
  thumbnail: search.keyword().retrievable(),
  created_at: search.date().sortable().retrievable(),
  category: search.keyword().array().filterable().facetable().retrievable(),
  labels: search.keyword().array().filterable().facetable().retrievable(),
  option_values: search.keyword().array().searchable({ weight: 2 }).filterable().facetable().retrievable(),
  ...priceFields,
});

type ProductDocument = SearchTypes.InferSearchDocumentType<typeof productFields>;

function toDocument(
  product: ProductRow,
  pricing: Parameters<typeof toProductPricing>[0],
): ProductDocument {
  const category = (product.categories ?? [])
    .map((productCategory) => productCategory?.name?.trim())
    .filter((name): name is string => Boolean(name));
  const labels = (product.tags ?? [])
    .map((tag) => tag?.value?.trim())
    .filter((value): value is string => Boolean(value));
  const salesChannelIds = (product.sales_channels ?? [])
    .map((salesChannel) => salesChannel?.id?.trim())
    .filter((id): id is string => Boolean(id));

  return {
    id: product.id,
    status: product.status ?? null,
    sales_channel_ids: salesChannelIds,
    title: product.title ?? null,
    description: product.description ?? null,
    handle: product.handle ?? null,
    thumbnail: product.thumbnail ?? null,
    created_at: product.created_at ?? null,
    category,
    labels,
    option_values: toOptionValues(product.options),
    ...toProductPricing(pricing),
  };
}

const source = {
  fields: PRODUCT_GRAPH_FIELDS,
  transform: async (
    rows: ProductRow[],
    context: SearchTypes.SearchIngestionContext,
  ) => {
    const pricing = await loadPricing(
      rows.map((row) => row.id),
      context,
    );
    return rows.map((row) => toDocument(row, pricing.get(row.id)));
  },
};

const PRODUCT_EVENTS = [
  "product.created",
  "product.updated",
  "product.deleted",
  "product-variant.created",
  "product-variant.updated",
  "product-variant.deleted",
  "product-option.created",
  "product-option.updated",
  "product-option.deleted",
  "product-option-value.updated",
  "product-option-value.deleted",
  "product-tag.updated",
  "product-tag.deleted",
  "product-category.updated",
  "product-category.deleted",
  "sales-channel.deleted",
];

export default defineSearchIndex({
  name: "product",
  entity: "product",
  primary_key: "id",
  fields: productFields,
  settings: {
    typo_tolerance: { enabled: true },
  },
  events: PRODUCT_EVENTS,
  consume: graphConsume<typeof productFields, ProductRow>({
    ...source,
    resolve_ids: resolveProductIds,
    is_delete: (event) => event.name === "product.deleted",
  }),
  seed: graphSeed<typeof productFields, ProductRow>(source),
});
