import type { AnalysisRequest, AnalysisResponse } from "./types";
import { categories } from "@/lib/data/catalog";

function hash(value: string) {
  let result = 2166136261;
  for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
  return Math.abs(result >>> 0);
}

export function createDemoAnalysis(input: AnalysisRequest): AnalysisResponse {
  const category = categories.find((item) => item.value === input.subcategory) ?? categories[1];
  const seed = hash(`${input.subcategory}|${input.title}|${input.description}|${input.price}`);
  const middle = (category.range[0] + category.range[1]) / 2;
  const distance = Math.abs(input.price - middle) / Math.max(1, category.range[1] - category.range[0]);
  const keywordBonus = /vegan|hydrating|gentle|clean|natural|repair|glow/i.test(input.description) ? 9 : 2;
  const score = Math.max(28, Math.min(91, Math.round(78 - distance * 42 - category.competition * 0.11 + keywordBonus + (seed % 9))));
  const uncertainty = Number((0.14 + (seed % 12) / 100).toFixed(2));
  const saturation = Math.max(20, Math.min(94, category.competition + (seed % 11) - 5));
  const risk = Math.round(0.55 * (100 - score) + 0.3 * saturation + 0.15 * uncertainty * 100);
  const min = Math.round(category.range[0] * 0.75);
  const max = Math.round(category.range[1] * 1.25);
  const priceCurve = Array.from({ length: 21 }, (_, index) => {
    const price = min + ((max - min) * index) / 20;
    const fit = Math.abs(price - middle) / Math.max(1, category.range[1] - category.range[0]);
    return { price: Number(price.toFixed(2)), score: Math.max(18, Math.min(94, Math.round(score + distance * 40 - fit * 45))) };
  });
  const recommended = priceCurve.reduce((best, point) => point.score > best.score ? point : best, priceCurve[0]);
  const marketplaceFee = input.price * (input.marketplace_fee_pct ?? 0) / 100;
  const profitPerSale = input.price - marketplaceFee - (input.unit_cost ?? 0) - (input.fulfilment_cost ?? 0) - (input.advertising_cost_per_unit ?? 0) - (input.return_allowance ?? 0);
  const missingCosts = ["unit_cost", "fulfilment_cost", "marketplace_fee_pct", "advertising_cost_per_unit", "return_allowance"].filter((field) => input[field as keyof AnalysisRequest] === undefined);

  return {
    success: { score, probability: score / 100, uncertainty, confidence: uncertainty < 0.2 ? "high" : "medium", source_type: "simulation" },
    risk: { index: risk, components: { downside: 100 - score, saturation, uncertainty: Math.round(uncertainty * 100) }, source_type: "simulation" },
    saturation: { value: saturation, source_type: "simulation" },
    recommended_price: recommended.price,
    price_range: [category.range[0], category.range[1]],
    price_curve: priceCurve,
    comparables: [
      { title: `Clean ${input.subcategory} Bestseller`, price: input.price * 0.9, rating: 4.5, reviews: 1240, similarity: 0.86 },
      { title: `Premium ${input.title}`, price: input.price * 1.18, rating: 4.3, reviews: 760, similarity: 0.81 },
      { title: `${input.subcategory} Daily Essential`, price: input.price * 0.78, rating: 4.4, reviews: 2150, similarity: 0.77 },
    ],
    model_version: "demo-deterministic-1.0",
    dataset_version: "demo-catalog-2026-07",
    limitations: [
      "Demo mode uses deterministic product heuristics, not the trained model.",
      "Profit, demand, reviews and audience panels remain scenario estimates.",
    ],
    source: "demo",
    profit: {
      marketplace_fee: Number(marketplaceFee.toFixed(2)),
      per_sale: Number(profitPerSale.toFixed(2)),
      expected_monthly: input.expected_units_monthly === undefined ? null : Number((profitPerSale * input.expected_units_monthly).toFixed(2)),
      is_complete: missingCosts.length === 0,
      missing_costs: missingCosts,
      source_type: "formula",
    },
  };
}
