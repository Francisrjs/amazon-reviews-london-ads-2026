"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Check, Heart, Search, ShoppingBag, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { trendingProducts } from "@/lib/data/catalog";
import type { StoreProduct } from "@/lib/api/types";
import { useStorePortfolio } from "@/hooks/useStorePortfolio";
import { TrendSparkline } from "./TrendSparkline";

const money = (value: number) => `$${Math.round(value).toLocaleString("en-US")}`;
const normalized: StoreProduct[] = trendingProducts.map((product) => ({
  id: product.id, key: product.key, name: product.name, description: product.description,
  price: product.price, successScore: product.successScore, monthlyProfit: product.monthlyProfit,
  startupCost: product.startupCost, image: product.image, trend: product.trend,
}));

export function DiscoverGrid() {
  const [filter, setFilter] = useState("All");
  const { cart, toggleProduct, createStore } = useStorePortfolio();
  const router = useRouter();
  const filters = ["All", ...new Set(trendingProducts.map((product) => product.category))];
  const products = useMemo(() => trendingProducts.filter((product) => filter === "All" || product.category === filter), [filter]);
  const total = cart.reduce((sum, product) => sum + product.monthlyProfit, 0);
  return <>
    <div className="page-intro"><span className="eyebrow">Opportunity shelf · simulated discovery data</span><h1>Beauty products <em>building momentum</em> right now.</h1><p>Shortlist ideas, compare scenario economics, and turn the strongest mix into a focused test store.</p></div>
    <div className="filter-row">{filters.map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item === "All" ? <Sparkles/> : null}{item}</button>)}</div>
    <div className="discover-grid">{products.map((product) => {
      const selected = cart.some((item) => item.id === product.id);
      const item = normalized.find((candidate) => candidate.id === product.id)!;
      return <article className={`product-card ${selected ? "selected" : ""}`} key={product.id}>
        <div className="product-photo"><Image src={product.image} alt={`${product.name} concept`} fill sizes="(max-width: 700px) 100vw, 320px"/><Badge tone="mint">↑ {product.trend}% forecast</Badge></div>
        <span className="product-category">{product.category}</span><h2>{product.name}</h2><p>{product.description}</p><TrendSparkline seed={product.id} trend={product.trend}/>
        <div className="product-money"><small>Could make about</small><strong>{money(product.monthlyProfit)} <span>/mo</span></strong><b>Simulated scenario</b></div>
        <div className="product-stats"><span>Success <b>{product.successScore}%</b></span><span>Sell at <b>{money(product.price)}</b></span></div>
        <div className="product-actions"><Button variant={selected ? "secondary" : "primary"} onClick={() => toggleProduct(item)}>{selected ? <Check/> : <Heart/>}{selected ? "In shortlist" : "Shortlist"}</Button><button aria-label={`Analyze ${product.name}`} title="Analyze product"><Search/></button></div>
      </article>;
    })}</div>
    {cart.length ? <div className="cart-dock"><div><ShoppingBag/><span><b>{cart.length} product{cart.length === 1 ? "" : "s"}</b><small>{money(total)} / month scenario</small></span></div><Button variant="coral" onClick={async () => { await createStore(); router.push("/store"); }}>Create my store</Button></div> : null}
  </>;
}
