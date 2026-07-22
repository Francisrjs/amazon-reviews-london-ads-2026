"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Coins, FlaskConical, Sparkles } from "lucide-react";
import { analysisRequestSchema } from "@/lib/api/schema";
import type { AnalysisRequest } from "@/lib/api/types";
import { categories } from "@/lib/data/catalog";
import { Button } from "@/components/shared/Button";

const sample: AnalysisRequest = {
  subcategory: "Skin Care",
  title: "Hydrating Vitamin C Serum",
  description: "Vegan, lightweight and fast absorbing serum for a brighter daily glow",
  price: 30,
  market: "US",
  currency: "USD",
  unit_cost: 8,
  fulfilment_cost: 4,
  marketplace_fee_pct: 15,
  advertising_cost_per_unit: 3,
  return_allowance: 1,
  expected_units_monthly: 100,
  risk_preference: "balanced",
};

export function AnalysisForm({ onSubmit, busy }: { onSubmit: (value: AnalysisRequest) => void; busy: boolean }) {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<AnalysisRequest>({ resolver: zodResolver(analysisRequestSchema), defaultValues: sample });
  const description = useWatch({ control, name: "description" }) ?? "";
  const optionalNumber = { setValueAs: (value: string) => value === "" ? undefined : Number(value) };
  return <form className="analysis-form" onSubmit={handleSubmit(onSubmit)}>
    <div className="panel-heading"><span className="heading-icon violet"><FlaskConical /></span><div><h2>Your product</h2><p>Product evidence and transparent unit economics.</p></div></div>
    <label className="field"><span>Product name</span><input {...register("title")} placeholder="Hydrating Vitamin C Serum" />{errors.title ? <small className="field-error">{errors.title.message}</small> : null}</label>
    <label className="field"><span>Beauty subcategory</span><select {...register("subcategory")}>{categories.map((category) => <option key={category.value}>{category.value}</option>)}</select></label>
    <label className="field"><span>Price you would charge</span><span className="money-input"><Coins /><input type="number" step="0.01" {...register("price", { valueAsNumber: true })} /></span>{errors.price ? <small className="field-error">{errors.price.message}</small> : null}</label>
    <label className="field"><span>Market</span><select {...register("market")}><option value="US">United States</option><option value="GB">United Kingdom</option></select></label>
    <label className="field"><span>Currency</span><select {...register("currency")}><option value="USD">USD</option><option value="GBP">GBP</option></select></label>
    <label className="field"><span>Unit cost</span><span className="money-input"><Coins/><input type="number" step="0.01" {...register("unit_cost", optionalNumber)}/></span></label>
    <label className="field"><span>Fulfilment and shipping</span><span className="money-input"><Coins/><input type="number" step="0.01" {...register("fulfilment_cost", optionalNumber)}/></span></label>
    <label className="field"><span>Marketplace fee (%)</span><input type="number" step="0.1" {...register("marketplace_fee_pct", optionalNumber)}/></label>
    <label className="field"><span>Advertising per unit</span><span className="money-input"><Coins/><input type="number" step="0.01" {...register("advertising_cost_per_unit", optionalNumber)}/></span></label>
    <label className="field"><span>Return allowance</span><span className="money-input"><Coins/><input type="number" step="0.01" {...register("return_allowance", optionalNumber)}/></span></label>
    <label className="field"><span>Expected units / month</span><input type="number" step="1" {...register("expected_units_monthly", optionalNumber)}/></label>
    <label className="field"><span>Describe the product</span><textarea maxLength={500} {...register("description")} /><small className="char-count">{description.length}/500</small>{errors.description ? <small className="field-error">{errors.description.message}</small> : null}</label>
    <fieldset className="risk-field"><legend>How bold do you feel?</legend><div className="risk-options">
      {[{ value: "cautious", label: "Cautious" }, { value: "balanced", label: "Balanced" }, { value: "bold", label: "Bold" }].map((option) => <label key={option.value}><input type="radio" value={option.value} {...register("risk_preference")} /><span>{option.label}</span></label>)}
    </div></fieldset>
    <Button disabled={busy} className="analyze-submit"><Sparkles />{busy ? "Reading the market…" : "Show me the money"}</Button>
    <button className="sample-button" type="button" onClick={() => reset(sample)}>No idea yet? Load the vitamin C example.</button>
  </form>;
}
