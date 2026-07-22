import type { Metadata } from "next";
import { DiscoverGrid } from "@/components/discover/DiscoverGrid";
export const metadata: Metadata = { title: "Discover trending" };
export default function DiscoverPage() { return <DiscoverGrid/>; }
