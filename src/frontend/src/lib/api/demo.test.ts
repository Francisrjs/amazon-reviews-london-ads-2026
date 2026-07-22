import { describe, expect, it } from "vitest";
import { createDemoAnalysis } from "./demo";

const input = { subcategory: "Skin Care", title: "Vitamin C Serum", description: "Vegan, hydrating, gentle and fast absorbing serum", price: 30, risk_preference: "balanced" as const };

describe("createDemoAnalysis", () => {
  it("is deterministic and bounded", () => {
    const first = createDemoAnalysis(input);
    const second = createDemoAnalysis(input);
    expect(first).toEqual(second);
    expect(first.success.score).toBeGreaterThanOrEqual(0);
    expect(first.success.score).toBeLessThanOrEqual(100);
    expect(first.risk.index).toBeGreaterThanOrEqual(0);
    expect(first.risk.index).toBeLessThanOrEqual(100);
    expect(first.price_curve).toHaveLength(21);
    expect(first.source).toBe("demo");
  });
});
