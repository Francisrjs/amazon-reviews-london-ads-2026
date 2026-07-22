import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useStorePortfolio } from "./useStorePortfolio";


vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { getClaims: async () => ({ data: { claims: { sub: "user-1" } } }) },
  }),
}));

const product = {
  id: 1,
  key: "skin",
  category: "Skin Care",
  name: "Vitamin C Serum",
  description: "Brightening serum",
  price: 32,
  successScore: 82,
  monthlyProfit: 2180,
  startupCost: 326,
  image: "https://example.com/product.jpg",
  trend: 31,
};

describe("useStorePortfolio local migration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("imports local objects once and clears them only after success", async () => {
    const store = { brand: "Glow Rituals", description: "A focused portfolio", products: [product] };
    localStorage.setItem("launchly-cart-v1:user-1", JSON.stringify([product]));
    localStorage.setItem("launchly-store-v1:user-1", JSON.stringify(store));
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ store: null, shortlist: [] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ store, shortlist: [product] }), { status: 200 }));

    const { result } = renderHook(() => useStorePortfolio());

    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.store?.brand).toBe("Glow Rituals");
    expect(result.current.cart).toHaveLength(1);
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/store", { cache: "no-store" });
    expect(fetchMock.mock.calls[1][0]).toBe("/api/store/import");
    expect(localStorage.getItem("launchly-cart-v1:user-1")).toBeNull();
    expect(localStorage.getItem("launchly-store-v1:user-1")).toBeNull();
  });
});
