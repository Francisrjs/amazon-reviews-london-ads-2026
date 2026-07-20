import type { Metadata } from "next";
import { TrendsWorkspace } from "@/components/trends/TrendsWorkspace";
export const metadata: Metadata = { title: "Trend radar" };
export default function TrendsPage() { return <TrendsWorkspace/>; }
