"use client";

import { useState } from "react";
import { AnalysisForm } from "./AnalysisForm";
import { AnalysisResults } from "./AnalysisResults";
import { Card } from "@/components/shared/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/States";
import { createDemoAnalysis } from "@/lib/api/demo";
import type { AnalysisRequest, AnalysisResponse } from "@/lib/api/types";

export function AnalyzeWorkspace() {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [input, setInput] = useState<AnalysisRequest | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (value: AnalysisRequest) => {
    setBusy(true); setError(null); setInput(value);
    try {
      const response = await fetch("/api/analyses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.error ?? "The analysis service is unavailable.");
      setAnalysis(await response.json());
    } catch (requestError) {
      if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true") setAnalysis(createDemoAnalysis(value));
      else setError(requestError instanceof Error ? requestError.message : "The analysis service is unavailable.");
    } finally { setBusy(false); }
  };

  return <>
    <div className="page-intro"><span className="eyebrow">Product decision console</span><h1>Got a beauty product idea? See <em>how strong the evidence is.</em></h1><p>Compare the idea with historical product patterns, inspect the risk, and find a price worth testing.</p></div>
    <div className="analysis-grid"><Card accent="violet"><AnalysisForm onSubmit={run} busy={busy}/></Card><Card accent="mint" className="results-card">{busy ? <LoadingState/> : error ? <ErrorState message={error} onRetry={() => input && run(input)}/> : analysis && input ? <AnalysisResults analysis={analysis} input={input}/> : <EmptyState title="Your launch forecast goes here" message="Fill in the product brief and run the analysis to see model-backed evidence and clearly labeled scenarios."/>}</Card></div>
  </>;
}
