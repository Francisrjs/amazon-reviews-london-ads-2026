import { describe, expect, it } from "vitest";
import { analysisRequestSchema } from "./schema";

describe("analysisRequestSchema", () => {
  it("accepts the documented example", () => {
    expect(analysisRequestSchema.safeParse({ subcategory: "Skin Care", title: "Hydrating Vitamin C Serum", description: "Vegan, lightweight and fast absorbing", price: 30, risk_preference: "balanced" }).success).toBe(true);
  });
  it("rejects non-positive prices and short descriptions", () => {
    expect(analysisRequestSchema.safeParse({ subcategory: "Skin Care", title: "Serum", description: "short", price: 0, risk_preference: "balanced" }).success).toBe(false);
  });
});
