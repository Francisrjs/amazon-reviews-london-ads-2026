import type { Metadata } from "next";
import { AnalyzeWorkspace } from "@/components/analyze/AnalyzeWorkspace";
export const metadata: Metadata = { title: "Analyze a product" };
export default function AnalyzePage() { return <AnalyzeWorkspace/>; }
