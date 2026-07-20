"use client";

import Image from "next/image";
import { useState } from "react";
import { Bot, Boxes, CircleDollarSign, PackagePlus, RotateCcw, ShieldCheck, Store, Trash2, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { Modal } from "@/components/shared/Modal";
import { useStorePortfolio } from "@/hooks/useStorePortfolio";
import { trendingProducts } from "@/lib/data/catalog";

const money = (value: number) => `$${Math.round(value).toLocaleString("en-US")}`;

export function StoreWorkspace() {
  const { store, ready, createStore, removeProduct, clearStore } = useStorePortfolio();
  const [amazonOpen, setAmazonOpen] = useState(false);
  const router = useRouter();
  if (!ready) return <div className="store-empty"><span className="state-icon scan"><Store/></span><h1>Opening your local store…</h1></div>;
  if (!store) return <div className="store-empty"><span className="state-icon"><Store/></span><h1>You have not built a store yet</h1><p>Shortlist products in Discover or let Launchly assemble a balanced demo portfolio.</p><div><Button variant="coral" onClick={() => router.push("/discover")}><PackagePlus/>Browse trending</Button><Button onClick={() => createStore(trendingProducts.slice(0, 4).map((item) => ({ id: item.id, key: item.key, name: item.name, description: item.description, price: item.price, successScore: item.successScore, monthlyProfit: item.monthlyProfit, startupCost: item.startupCost, image: item.image, trend: item.trend })))}><Bot/>Build one for me</Button></div><Badge tone="sun">Local demo storage · no Supabase table yet</Badge></div>;
  const monthly = store.products.reduce((sum, product) => sum + product.monthlyProfit, 0);
  const investment = store.products.reduce((sum, product) => sum + product.startupCost, 0);
  const payback = Math.max(1, Math.round(investment / (monthly / 4.33)));
  return <>
    <div className="store-hero"><Badge tone="neutral">Local portfolio demo</Badge><h1>{store.brand}</h1><p>{store.description}</p><small>Combined scenario profit</small><strong>{money(monthly)} <span>/month</span></strong></div>
    <div className="store-toolbar"><Button variant="coral" onClick={() => router.push("/discover")}><PackagePlus/>Add products</Button><Button variant="secondary" onClick={clearStore}><RotateCcw/>Start again</Button></div>
    <div className="store-kpis"><article><Boxes/><strong>{store.products.length}</strong><span>Products</span></article><article><CircleDollarSign/><strong>{money(investment)}</strong><span>Startup stock</span></article><article><TrendingUp/><strong>{payback} wks</strong><span>Scenario payback</span></article><article><ShieldCheck/><strong>{money(monthly * 12 - investment)}</strong><span>Year one scenario</span></article></div>
    <div className="section-heading"><span><Store/>Your catalog</span><Badge tone="sun">Simulated financials</Badge></div>
    <div className="store-products">{store.products.map((product) => <article key={product.id}><button className="remove-product" onClick={() => removeProduct(product.id)} aria-label={`Remove ${product.name}`}><Trash2/></button><div className="store-product-photo"><Image src={product.image} alt={`${product.name} concept`} fill sizes="280px"/></div><h2>{product.name}</h2><p>{product.description}</p><dl><div><dt>Sell at</dt><dd>{money(product.price)}</dd></div><div><dt>Success</dt><dd>{product.successScore}%</dd></div><div><dt>Startup stock</dt><dd>{money(product.startupCost)}</dd></div><div><dt>Profit scenario</dt><dd>{money(product.monthlyProfit)}/mo</dd></div></dl></article>)}</div>
    <section className="automation-panel"><div className="automation-head"><span><Bot/></span><div><h2>Amazon automation</h2><p>Preview the future workflow without pretending an integration exists.</p></div></div><div className="automation-list">{["Auto-publish listings", "Smart pricing", "Inventory sync", "Pause low performers"].map((item) => <div key={item}><span>{item}<small>Requires Amazon SP-API and backend authorization.</small></span><button role="switch" aria-checked="false" disabled /></div>)}</div><Button variant="coral" onClick={() => setAmazonOpen(true)}>Connect my Amazon store</Button></section>
    <Modal open={amazonOpen} onClose={() => setAmazonOpen(false)} title="Amazon connection is not active"><div className="modal-icon amazon"><Store/></div><p>This Next.js milestone does not implement Amazon OAuth or publishing. A production connection must use SP-API through a secure backend with explicit confirmation and audit logs.</p><Button variant="secondary" onClick={() => setAmazonOpen(false)}>Got it</Button></Modal>
  </>;
}
