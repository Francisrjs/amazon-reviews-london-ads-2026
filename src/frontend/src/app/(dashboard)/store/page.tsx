import type { Metadata } from "next";
import { StoreWorkspace } from "@/components/store/StoreWorkspace";
export const metadata: Metadata = { title: "My store" };
export default function StorePage() { return <StoreWorkspace/>; }
