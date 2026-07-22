import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { analysisRequestSchema } from "@/lib/api/schema";
import { goToMarketJsonSchema, goToMarketKitSchema } from "@/lib/marketing/goToMarket";
import { z } from "zod";

// Optional slice of the analysis the client already has, so the model can
// ground its price and positioning in the real forecast.
const evidenceSchema = z
  .object({
    score: z.number().optional(),
    confidence: z.string().optional(),
    recommendedPrice: z.number().optional(),
    saturation: z.number().optional(),
    comparables: z.array(z.string()).max(10).optional(),
  })
  .optional();

const bodySchema = z.object({
  product: analysisRequestSchema,
  evidence: evidenceSchema,
});

const SYSTEM = `You are a senior Amazon go-to-market strategist for beauty and personal-care brands.
Given a product brief and (when available) a data model's success forecast, you produce a complete,
ready-to-use launch kit. Write copy a real seller can paste into Amazon Seller Central and adapt.

Rules:
- The Amazon TITLE must be <= 200 characters, lead with the brand and the core keywords a shopper searches, and read naturally (not keyword soup).
- Provide exactly 5 feature BULLETS, each a benefit the shopper cares about, grounded in the actual product description — never invent certifications or claims the brief does not support.
- The DESCRIPTION is one flowing A+-style paragraph (roughly 60-110 words).
- searchTerms: 8-10 lowercase backend keywords, no duplicates, no brand name.
- recommendedPrice: if a model recommended price is given, use it and explain the rationale referencing the score/curve; otherwise pick a sensible price for the category and say how to A/B test it.
- brand: invent a distinctive, memorable brand name (do NOT reuse the product's own title as the brand), a short tagline, a one-sentence positioning statement, 3 tone words, a 3-colour palette (name + hex), and the target audience.
- selling: one hero USP sentence plus 2-3 supporting angles a marketer can lead with.
- promotion: a one-sentence launch angle, then 3-5 social channels (choose the ones that actually fit this product — Instagram, TikTok, Pinterest, YouTube, Facebook), each with a realistic posting cadence/frequency, the content format to post there, and why that channel matters for this product; plus a 4-step first-week launch checklist.
Return only the structured object.`;

function buildBrief(product: z.infer<typeof analysisRequestSchema>, evidence: z.infer<typeof evidenceSchema>): string {
  return [
    `Subcategory: ${product.subcategory}`,
    `Working product name: ${product.title}`,
    `Description: ${product.description}`,
    `Seller's intended price: ${product.currency} ${product.price}`,
    `Market: ${product.market}`,
    `Risk appetite: ${product.risk_preference}`,
    evidence?.score !== undefined ? `Model success score: ${evidence.score}/100 (${evidence.confidence ?? "n/a"} confidence)` : null,
    evidence?.recommendedPrice !== undefined ? `Model-recommended price: ${product.currency} ${evidence.recommendedPrice}` : null,
    evidence?.saturation !== undefined ? `Market saturation: ${evidence.saturation}/100` : null,
    evidence?.comparables?.length ? `Comparable products: ${evidence.comparables.join("; ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

// --- Google Gemini (free tier) --------------------------------------------
async function generateWithGemini(apiKey: string, brief: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Produce the go-to-market kit for this product:\n\n${brief}`,
    config: {
      systemInstruction: SYSTEM,
      responseMimeType: "application/json",
      responseJsonSchema: goToMarketJsonSchema,
      temperature: 0.7,
    },
  });
  return response.text ?? "";
}

// --- Anthropic Claude ------------------------------------------------------
async function generateWithClaude(apiKey: string, brief: string): Promise<string> {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create(
    {
      model: "claude-opus-4-8",
      max_tokens: 4000,
      output_config: { effort: "low", format: { type: "json_schema", schema: goToMarketJsonSchema } },
      system: SYSTEM,
      messages: [{ role: "user", content: `Produce the go-to-market kit for this product:\n\n${brief}` }],
    },
    { timeout: 60_000 },
  );
  if (response.stop_reason === "refusal") throw new Error("refusal");
  const text = response.content.find((block) => block.type === "text");
  return text && text.type === "text" ? text.text : "";
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product brief." }, { status: 422 });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  // No provider configured → tell the client to use its offline generator.
  if (!geminiKey && !anthropicKey) {
    return NextResponse.json({ error: "generation_unavailable" }, { status: 501 });
  }

  const brief = buildBrief(parsed.data.product, parsed.data.evidence);

  try {
    // Prefer the free provider (Gemini) when its key is present.
    const raw = geminiKey ? await generateWithGemini(geminiKey, brief) : await generateWithClaude(anthropicKey!, brief);
    if (!raw.trim()) {
      return NextResponse.json({ error: "The model returned no content." }, { status: 502 });
    }

    const kit = goToMarketKitSchema.safeParse(JSON.parse(raw));
    if (!kit.success) {
      return NextResponse.json({ error: "The model returned an unexpected shape." }, { status: 502 });
    }
    return NextResponse.json({ kit: kit.data, source: "model" });
  } catch (error) {
    if (error instanceof Error && error.message === "refusal") {
      return NextResponse.json({ error: "The model declined this brief." }, { status: 422 });
    }
    const status = error instanceof Anthropic.APIError ? error.status ?? 502 : 502;
    return NextResponse.json({ error: "The go-to-market service is unavailable." }, { status });
  }
}
