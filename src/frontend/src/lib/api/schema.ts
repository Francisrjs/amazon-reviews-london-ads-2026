import { z } from "zod";

export const analysisRequestSchema = z.object({
  request_id: z.string().uuid().optional(),
  subcategory: z.string().min(1).max(80),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(500),
  price: z.number().positive().max(10_000),
  market: z.string().regex(/^[A-Z]{2}$/).default("US"),
  currency: z.string().regex(/^[A-Z]{3}$/).default("USD"),
  unit_cost: z.number().nonnegative().max(10_000_000).optional(),
  fulfilment_cost: z.number().nonnegative().max(10_000_000).optional(),
  marketplace_fee_pct: z.number().min(0).max(100).optional(),
  advertising_cost_per_unit: z.number().nonnegative().max(10_000_000).optional(),
  return_allowance: z.number().nonnegative().max(10_000_000).optional(),
  expected_units_monthly: z.number().int().nonnegative().max(100_000_000).optional(),
  risk_preference: z.enum(["cautious", "balanced", "bold"]),
});

const sourceSchema = z.enum(["model", "formula", "external_data", "simulation"]).optional();

export const fastApiAnalysisSchema = z.object({
  analysis_id: z.number().int().positive(),
  request_id: z.string().uuid(),
  status: z.literal("completed"),
  success: z.object({
    score: z.number().min(0).max(100),
    probability: z.number().optional(),
    uncertainty: z.number().nonnegative(),
    confidence: z.string(),
    source_type: sourceSchema,
  }),
  risk: z.object({
    index: z.number().min(0).max(100),
    components: z.object({ downside: z.number(), saturation: z.number(), uncertainty: z.number() }),
    source_type: sourceSchema,
  }),
  saturation: z.object({ value: z.number(), source_type: sourceSchema }),
  recommended_price: z.number(),
  price_range: z.tuple([z.number().nullable(), z.number().nullable()]),
  price_curve: z.array(z.object({ price: z.number(), score: z.number(), profit_per_sale: z.number().optional() })),
  comparables: z.array(z.object({
    parent_asin: z.string().optional(),
    title: z.string(),
    subcategory: z.string().optional(),
    price: z.number().nullable(),
    rating: z.number().nullable(),
    reviews: z.number(),
    success: z.number().optional(),
    similarity: z.number().optional(),
  })),
  model_version: z.string(),
  dataset_version: z.string(),
  limitations: z.array(z.string()),
  profit: z.object({
    marketplace_fee: z.number(),
    per_sale: z.number(),
    expected_monthly: z.number().nullable(),
    is_complete: z.boolean(),
    missing_costs: z.array(z.string()),
    source_type: z.literal("formula"),
  }),
  source: z.literal("model"),
});

export const storeProductSchema = z.object({
  id: z.union([z.number(), z.string()]),
  persistedId: z.number().int().positive().optional(),
  key: z.string().min(1).max(80),
  category: z.string().max(120).optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000),
  price: z.number().nonnegative(),
  successScore: z.number().min(0).max(100),
  monthlyProfit: z.number(),
  startupCost: z.number().nonnegative(),
  image: z.string(),
  trend: z.number(),
  currency: z.string().regex(/^[A-Z]{3}$/).optional(),
  sourceType: z.enum(["model", "formula", "external_data", "simulation"]).optional(),
});

export const demoStoreSchema = z.object({
  brand: z.string().min(1).max(120),
  description: z.string().max(1000),
  currency: z.string().regex(/^[A-Z]{3}$/).optional(),
  products: z.array(storeProductSchema).max(100),
});

export const storeStateSchema = z.object({
  store: demoStoreSchema.nullable(),
  shortlist: z.array(storeProductSchema).max(100),
});
