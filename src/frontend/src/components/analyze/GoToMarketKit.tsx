"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Check, Copy, Megaphone, Palette, ShoppingBag, Sparkles, Tag, Target } from "lucide-react";
import type { AnalysisRequest, AnalysisResponse } from "@/lib/api/types";
import { buildGoToMarketKit, goToMarketKitSchema, type GoToMarketKit as GoToMarketKitType } from "@/lib/marketing/goToMarket";
import { Badge } from "@/components/shared/Badge";

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };
  return <button type="button" className={`gtm-copy ${copied ? "copied" : ""}`} onClick={copy} aria-label={`Copy ${label}`}>
    {copied ? <Check /> : <Copy />}{copied ? "Copied" : "Copy"}
  </button>;
}

export function GoToMarketKit({ analysis, input }: { analysis: AnalysisResponse; input: AnalysisRequest }) {
  const [kit, setKit] = useState<GoToMarketKitType | null>(null);
  const [source, setSource] = useState<"model" | "offline">("model");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const fallback = () => {
      if (!active) return;
      setKit(buildGoToMarketKit(input, analysis));
      setSource("offline");
      setLoading(false);
    };
    (async () => {
      try {
        const response = await fetch("/api/go-to-market", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product: input,
            evidence: {
              score: analysis.success.score,
              confidence: analysis.success.confidence,
              recommendedPrice: analysis.recommended_price,
              saturation: analysis.saturation.value,
              comparables: analysis.comparables.slice(0, 5).map((c) => c.title),
            },
          }),
        });
        if (!response.ok) return fallback();
        const parsed = goToMarketKitSchema.safeParse((await response.json())?.kit);
        if (!active) return;
        if (!parsed.success) return fallback();
        setKit(parsed.data);
        setSource("model");
        setLoading(false);
      } catch {
        fallback();
      }
    })();
    return () => { active = false; };
  }, [analysis, input]);

  if (loading || !kit) {
    return <section className="gtm">
      <div className="section-title"><ShoppingBag /> Your kit to sell this on Amazon <Badge tone="violet">Writing your launch kit…</Badge></div>
      <p className="gtm-intro">Turning your brief and the model&apos;s forecast into Amazon-ready copy, brand identity and a promotion plan…</p>
    </section>;
  }

  const { listing, brand, selling, promotion } = kit;

  return <section className="gtm">
    <div className="section-title"><ShoppingBag /> Your kit to sell this on Amazon <Badge tone={source === "model" ? "violet" : "sun"}>{source === "model" ? "AI-generated" : "Offline draft"}</Badge></div>
    <p className="gtm-intro">{source === "model" ? "Written for this product by AI from your brief and the model's forecast" : "Generated offline from category heuristics (add a free GEMINI_API_KEY for bespoke AI copy)"} — copy any field straight into Seller Central, then adapt the voice to your own.</p>

    {/* --- Brand identity --- */}
    <div className="gtm-block">
      <div className="gtm-block-head"><Sparkles /><h3>Brand identity</h3></div>
      <div className="gtm-brand">
        <div className="gtm-brand-name"><span>Suggested brand name</span><strong>{brand.name}</strong><em>{brand.tagline}</em></div>
        <p className="gtm-positioning"><b>Positioning:</b> {brand.positioning}</p>
        <div className="gtm-brand-meta">
          <div><span><Target /> Audience</span><p>{brand.audience}</p></div>
          <div><span><Palette /> Palette</span><div className="gtm-palette">{brand.palette.map((color) => <span key={color.hex} title={`${color.name} ${color.hex}`}><i style={{ background: color.hex }} />{color.name}</span>)}</div></div>
          <div><span>Tone</span><div className="gtm-tone">{brand.toneWords.map((word) => <Badge key={word} tone="mint">{word}</Badge>)}</div></div>
        </div>
      </div>
    </div>

    {/* --- Amazon listing --- */}
    <div className="gtm-block">
      <div className="gtm-block-head"><Tag /><h3>Amazon listing copy</h3></div>

      <div className="gtm-field">
        <div className="gtm-field-head"><span>Product title</span><CopyButton text={listing.title} label="title" /></div>
        <p className="gtm-mono">{listing.title}</p>
        <small>{listing.title.length}/200 characters</small>
      </div>

      <div className="gtm-field">
        <div className="gtm-field-head"><span>Key feature bullets</span><CopyButton text={listing.bullets.map((b) => `• ${b}`).join("\n")} label="bullets" /></div>
        <ul className="gtm-bullets">{listing.bullets.map((bullet) => <li key={bullet}><BadgeCheck />{bullet}</li>)}</ul>
      </div>

      <div className="gtm-field">
        <div className="gtm-field-head"><span>Product description</span><CopyButton text={listing.description} label="description" /></div>
        <p>{listing.description}</p>
      </div>

      <div className="gtm-field-row">
        <div className="gtm-price-callout">
          <span>Recommended price</span>
          <strong>{money(listing.recommendedPrice)}</strong>
          <small>{listing.priceRationale}</small>
        </div>
        <div className="gtm-field gtm-terms">
          <div className="gtm-field-head"><span>Backend search terms</span><CopyButton text={listing.searchTerms.join(", ")} label="search terms" /></div>
          <div className="gtm-chips">{listing.searchTerms.map((term) => <span key={term}>{term}</span>)}</div>
        </div>
      </div>
    </div>

    {/* --- Selling point --- */}
    <div className="gtm-block">
      <div className="gtm-block-head"><Target /><h3>Your selling point</h3></div>
      <div className="gtm-usp"><span>Hero USP</span><strong>{selling.primary}</strong></div>
      <ul className="gtm-support">{selling.supporting.map((point) => <li key={point}>{point}</li>)}</ul>
    </div>

    {/* --- Promotion plan --- */}
    <div className="gtm-block">
      <div className="gtm-block-head"><Megaphone /><h3>How to promote it</h3></div>
      <p className="gtm-angle">{promotion.launchAngle}</p>
      <div className="gtm-channels">{promotion.channels.map((channel, index) => <article key={channel.network} className={index === 0 ? "primary" : ""}>
        <header><b>{channel.emoji} {channel.network}</b>{index === 0 ? <Badge tone="coral">Start here</Badge> : null}</header>
        <p className="gtm-cadence">{channel.cadence}</p>
        <p className="gtm-format">{channel.format}</p>
        <small>{channel.why}</small>
      </article>)}</div>
      <div className="gtm-week"><span>First-week plan</span><ol>{promotion.firstWeek.map((step) => <li key={step}>{step}</li>)}</ol></div>
    </div>
  </section>;
}
