"use client";

import Image from "next/image";
import { useState } from "react";
import { ExternalLink, LineChart as LineIcon, Radar, Sparkles } from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";
import { categories, trendingProducts } from "@/lib/data/catalog";
import { ForecastChart } from "@/components/analyze/AnalysisCharts";
import { TrendSparkline } from "@/components/discover/TrendSparkline";

export function TrendsWorkspace() {
  const [open, setOpen] = useState(false);
  const ranked = categories.map((category, index) => ({ ...category, growth: 28 - index * 4 + (index % 2 ? 3 : 0), confidence: 82 - index * 5 }));
  return <>
    <div className="page-intro trends-intro"><div><span className="eyebrow">Simulated momentum radar</span><h1>Where beauty demand is <em>moving next.</em></h1><p>Explore the interface now; connect a governed temporal source before using these signals for a real decision.</p></div><Button variant="secondary" onClick={() => setOpen(true)}><ExternalLink/>Google Trends setup</Button></div>
    <section className="trend-leader"><div><Badge tone="mint">Strongest simulated momentum</Badge><span className="trend-icon"><Sparkles/></span><h2>Skin Care</h2><strong>+31%</strong><p>Vitamin C and hydration concepts lead the current demo set.</p></div><ForecastChart/></section>
    <div className="section-heading"><span><Radar/>Subcategories ranked by momentum</span><Badge tone="sun">Simulation</Badge></div>
    <div className="trend-category-grid">{ranked.map((category, index) => <article key={category.value}><div><span>{category.emoji}</span><Badge tone={category.growth > 10 ? "mint" : "neutral"}>+{category.growth}%</Badge></div><h2>{category.value}</h2><TrendSparkline seed={index} trend={category.growth}/><small>{category.confidence}% regression-fit confidence</small></article>)}</div>
    <div className="section-heading"><span><LineIcon/>Products with strongest momentum</span><Badge tone="sun">Simulation</Badge></div>
    <div className="trend-product-grid">{trendingProducts.slice().sort((a, b) => b.trend - a.trend).slice(0, 4).map((product) => <article key={product.id}><div><Image src={product.image} alt={`${product.name} concept`} fill sizes="300px"/><Badge tone="mint">+{product.trend}%</Badge></div><h2>{product.name}</h2><TrendSparkline seed={product.id} trend={product.trend}/></article>)}</div>
    <Modal open={open} onClose={() => setOpen(false)} title="Connect a governed trend source"><div className="modal-icon trends"><LineIcon/></div><p>Launchly currently uses deterministic demonstration series. Google Trends does not expose a supported browser API for this workflow, so a real integration needs a server-side provider and a documented data contract.</p><Button variant="secondary" onClick={() => setOpen(false)}>Keep demo mode</Button></Modal>
  </>;
}
