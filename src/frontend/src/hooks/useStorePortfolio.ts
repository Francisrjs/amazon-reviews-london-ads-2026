"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { demoStoreSchema, storeProductSchema, storeStateSchema } from "@/lib/api/schema";
import type { DemoStore, StoreProduct, StoreState } from "@/lib/api/types";

const cartPrefix = "launchly-cart-v1";
const storePrefix = "launchly-store-v1";

function readLocal(identity: string): StoreState {
  try {
    const shortlistRaw = JSON.parse(localStorage.getItem(`${cartPrefix}:${identity}`) ?? "[]");
    const storeRaw = JSON.parse(localStorage.getItem(`${storePrefix}:${identity}`) ?? "null");
    const shortlist = Array.isArray(shortlistRaw)
      ? shortlistRaw.map((item) => storeProductSchema.safeParse(item)).filter((item) => item.success).map((item) => item.data)
      : [];
    const parsedStore = demoStoreSchema.safeParse(storeRaw);
    return { store: parsedStore.success ? parsedStore.data : null, shortlist };
  } catch {
    return { store: null, shortlist: [] };
  }
}

function clearLocal(identity: string) {
  localStorage.removeItem(`${cartPrefix}:${identity}`);
  localStorage.removeItem(`${storePrefix}:${identity}`);
}

async function persistState(store: DemoStore | null, shortlist: StoreProduct[]) {
  const response = await fetch("/api/store/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ request_id: crypto.randomUUID(), store, shortlist }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error ?? "The store could not be saved.");
  const parsed = storeStateSchema.safeParse(body);
  if (!parsed.success) throw new Error("The store service returned unexpected data.");
  return parsed.data;
}

export function useStorePortfolio() {
  const [identity, setIdentity] = useState("session");
  const [cart, setCart] = useState<StoreProduct[]>([]);
  const [store, setStore] = useState<DemoStore | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      let resolvedIdentity = "session";
      try {
        const { data } = await createClient().auth.getClaims();
        resolvedIdentity = String(data?.claims?.sub ?? "session");
        if (!active) return;
        setIdentity(resolvedIdentity);
        const local = readLocal(resolvedIdentity);
        const response = await fetch("/api/store", { cache: "no-store" });
        const remoteBody = await response.json().catch(() => null);
        const remote = storeStateSchema.safeParse(remoteBody);
        if (!response.ok || !remote.success) throw new Error(remoteBody?.error ?? "The saved store is unavailable.");
        let next = remote.data;
        if (!next.store && !next.shortlist.length && (local.store || local.shortlist.length)) {
          next = await persistState(local.store, local.shortlist);
        }
        if (!active) return;
        setStore(next.store);
        setCart(next.shortlist);
        clearLocal(resolvedIdentity);
      } catch (reason) {
        if (!active) return;
        const local = readLocal(resolvedIdentity);
        setStore(local.store);
        setCart(local.shortlist);
        setError(reason instanceof Error ? reason.message : "The saved store is unavailable.");
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => { active = false; };
  }, []);

  const sync = useCallback(async (nextStore: DemoStore | null, nextCart: StoreProduct[]) => {
    const previousStore = store;
    const previousCart = cart;
    setStore(nextStore);
    setCart(nextCart);
    setError(null);
    try {
      const saved = await persistState(nextStore, nextCart);
      setStore(saved.store);
      setCart(saved.shortlist);
      clearLocal(identity);
      return saved;
    } catch (reason) {
      setStore(previousStore);
      setCart(previousCart);
      setError(reason instanceof Error ? reason.message : "The store could not be saved.");
      throw reason;
    }
  }, [cart, identity, store]);

  const toggleProduct = useCallback(async (product: StoreProduct) => {
    const next = cart.some((item) => String(item.id) === String(product.id))
      ? cart.filter((item) => String(item.id) !== String(product.id))
      : [...cart, { ...product, sourceType: product.sourceType ?? "simulation" }];
    await sync(store, next);
  }, [cart, store, sync]);

  const createStore = useCallback(async (products = cart) => {
    if (!products.length) return null;
    const categories = [...new Set(products.map((product) => product.key))];
    const names = ["Glow Rituals", "Velvet & Bloom", "Aura Beauty Co.", "Dewy Collective"];
    const seed = products.reduce((sum, item) => sum + [...String(item.id)].reduce((value, char) => value + char.charCodeAt(0), 0), 0);
    const next: DemoStore = {
      brand: names[seed % names.length],
      description: `A focused, data-picked beauty collection spanning ${categories.join(", ")}. Built to test demand before committing serious capital.`,
      currency: "USD",
      products,
    };
    await sync(next, products);
    return next;
  }, [cart, sync]);

  const removeProduct = useCallback(async (id: number | string) => {
    if (!store) return;
    const products = store.products.filter((product) => String(product.id) !== String(id));
    const nextCart = cart.filter((product) => String(product.id) !== String(id));
    await sync(products.length ? { ...store, products } : null, nextCart);
  }, [cart, store, sync]);

  const clearStore = useCallback(async () => {
    const response = await fetch("/api/store", { method: "DELETE" });
    if (!response.ok) {
      setError("The store could not be cleared.");
      return;
    }
    setStore(null);
    setCart([]);
    clearLocal(identity);
  }, [identity]);

  return { cart, store, ready, error, toggleProduct, createStore, removeProduct, clearStore };
}
