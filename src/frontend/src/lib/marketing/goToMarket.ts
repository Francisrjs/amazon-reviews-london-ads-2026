import { z } from "zod";
import type { AnalysisRequest, AnalysisResponse, StoreProduct } from "@/lib/api/types";

// -----------------------------------------------------------------------------
// Go-to-market kit generator.
//
// Turns a product brief (+ optional model output) into the copy a seller needs
// to actually list and promote on Amazon: an optimized listing, a brand
// identity, the hero selling point, and a channel-by-channel promotion plan.
//
// Deterministic and offline by design — same pattern as lib/api/demo.ts, so it
// works with or without the FastAPI backend. It reacts to the subcategory, the
// keywords in the brief, the price tier and (when present) the model score.
// -----------------------------------------------------------------------------

export interface AmazonListing {
  title: string;
  bullets: string[];
  description: string;
  searchTerms: string[];
  recommendedPrice: number;
  priceRationale: string;
}

export interface PaletteColor {
  name: string;
  hex: string;
}

export interface BrandIdentity {
  name: string;
  tagline: string;
  positioning: string;
  toneWords: string[];
  palette: PaletteColor[];
  audience: string;
}

export interface SellingPoints {
  primary: string;
  supporting: string[];
}

export interface SocialChannel {
  network: string;
  emoji: string;
  cadence: string;
  format: string;
  why: string;
}

export interface PromotionPlan {
  launchAngle: string;
  channels: SocialChannel[];
  firstWeek: string[];
}

export interface GoToMarketKit {
  listing: AmazonListing;
  brand: BrandIdentity;
  selling: SellingPoints;
  promotion: PromotionPlan;
}

// --- deterministic helpers ---------------------------------------------------

function hash(value: string): number {
  let result = 2166136261;
  for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
  return Math.abs(result >>> 0);
}

const pick = <T,>(items: readonly T[], seed: number): T => items[seed % items.length];

const titleCase = (value: string) =>
  value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

// --- reusable channel catalog ------------------------------------------------

const CHANNELS: Record<string, SocialChannel> = {
  instagram: {
    network: "Instagram",
    emoji: "📸",
    cadence: "4–5 feed posts / week + daily Stories",
    format: "Before/after Reels, UGC repost, carousel education",
    why: "Highest-intent beauty discovery surface; Stories drive repeat touchpoints.",
  },
  tiktok: {
    network: "TikTok",
    emoji: "🎵",
    cadence: "5–7 short videos / week",
    format: "15–30s demos, trend hooks, founder POV, results in real time",
    why: "Fastest organic reach for a new brand; one video can seed the whole launch.",
  },
  pinterest: {
    network: "Pinterest",
    emoji: "📌",
    cadence: "3–5 pins / week",
    format: "Routine guides, aesthetic flat-lays, keyword-rich pin titles",
    why: "Evergreen search traffic — pins keep sending buyers months after posting.",
  },
  youtube: {
    network: "YouTube",
    emoji: "▶️",
    cadence: "1 long video / week + 2–3 Shorts",
    format: "Full tutorials, honest reviews, ‘how it’s made’ transparency",
    why: "Builds trust and ranks in search; ideal for higher-consideration purchases.",
  },
  facebook: {
    network: "Facebook",
    emoji: "👍",
    cadence: "3 posts / week + retargeting ads",
    format: "Community posts, reviews, retargeting the shoppers who bounced",
    why: "Best paid-retargeting economics and reaches an older, higher-AOV buyer.",
  },
};

// --- category copy profiles --------------------------------------------------

interface CategoryProfile {
  productType: string;
  benefits: string[];
  audience: string;
  ritual: string;
  brandRoots: string[];
  toneWords: string[];
  palette: PaletteColor[];
  channels: string[]; // ordered by priority
  hashtags: string[];
}

const PROFILES: Record<string, CategoryProfile> = {
  "Hair Care": {
    productType: "Hair Treatment",
    benefits: ["visibly stronger, fuller-looking hair", "deep nourishment without buildup", "a lightweight, non-greasy finish", "scalp comfort from the first use"],
    audience: "women 25–44 fighting thinning, dryness or slow growth",
    ritual: "your wash-day and daily scalp ritual",
    brandRoots: ["Rooted", "Mane & Bloom", "Silke", "Verda Hair", "Ové"],
    toneWords: ["nurturing", "botanical", "confident"],
    palette: [{ name: "Rosemary", hex: "#2f6b4f" }, { name: "Warm Amber", hex: "#c88a3e" }, { name: "Cream", hex: "#f4ede1" }],
    channels: ["tiktok", "instagram", "youtube", "pinterest"],
    hashtags: ["#hairtok", "#hairgrowth", "#healthyhair", "#scalpcare"],
  },
  "Skin Care": {
    productType: "Serum",
    benefits: ["brighter, more even-looking skin", "all-day hydration that never feels heavy", "a smoother, plumper texture in weeks", "a clean formula your skin barrier loves"],
    audience: "skincare-savvy shoppers 22–40 chasing a healthy, glassy glow",
    ritual: "your morning and evening skincare routine",
    brandRoots: ["Lumé", "Dewpoint", "Glasswing", "Aera Skin", "Húmé"],
    toneWords: ["clean", "expert", "glowy"],
    palette: [{ name: "Dewy Aqua", hex: "#4bb8b0" }, { name: "Soft Blush", hex: "#f2c9c0" }, { name: "Porcelain", hex: "#f8f4ef" }],
    channels: ["instagram", "tiktok", "youtube", "pinterest"],
    hashtags: ["#skincaretok", "#glassskin", "#skinbarrier", "#skincareroutine"],
  },
  "Foot, Hand & Nail Care": {
    productType: "Nail & Cuticle Oil",
    benefits: ["stronger nails that stop peeling", "fast-absorbing, non-oily feel", "softer cuticles and smoother hands", "salon results at home"],
    audience: "self-care shoppers 25–45 who do their own nails",
    ritual: "your nightly hand-and-nail ritual",
    brandRoots: ["Nàil", "Cuticle Co.", "Handsome", "Petal & Press", "Fingertip"],
    toneWords: ["practical", "caring", "polished"],
    palette: [{ name: "Petal Pink", hex: "#e39aa6" }, { name: "Nude", hex: "#e6cdb6" }, { name: "Ivory", hex: "#f7f2ea" }],
    channels: ["tiktok", "instagram", "pinterest", "youtube"],
    hashtags: ["#nailcare", "#nailtok", "#cuticleoil", "#healthynails"],
  },
  Makeup: {
    productType: "Makeup",
    benefits: ["high-impact, buildable colour", "wear that lasts all day without transfer", "a comfortable, weightless feel", "a clean, skin-loving formula"],
    audience: "trend-aware makeup lovers 18–34",
    ritual: "your everyday and going-out looks",
    brandRoots: ["Velvet & Bloom", "Studio Muse", "Pouty", "Kohl & Co.", "Matte Muse"],
    toneWords: ["bold", "playful", "pigment-rich"],
    palette: [{ name: "Terracotta", hex: "#c05a4a" }, { name: "Mauve", hex: "#a06478" }, { name: "Champagne", hex: "#efdcc4" }],
    channels: ["tiktok", "instagram", "youtube", "pinterest"],
    hashtags: ["#makeuptok", "#swatches", "#grwm", "#makeuptutorial"],
  },
  "Tools & Accessories": {
    productType: "Beauty Tool",
    benefits: ["visible results in a 5-minute ritual", "durable, salon-grade build", "easy to use and even easier to clean", "a spa-at-home experience"],
    audience: "ritual-driven shoppers 25–45 who love a gadget",
    ritual: "your at-home spa moment",
    brandRoots: ["Ritual Co.", "Glowstone", "Aura Tools", "Cryo", "Facet"],
    toneWords: ["sleek", "effective", "modern"],
    palette: [{ name: "Slate", hex: "#4a5568" }, { name: "Rose Gold", hex: "#d6a48c" }, { name: "Mist", hex: "#eef1f4" }],
    channels: ["tiktok", "youtube", "instagram", "pinterest"],
    hashtags: ["#beautytools", "#facialtools", "#selfcareritual", "#tiktokmademebuyit"],
  },
  Fragrance: {
    productType: "Perfume Oil",
    benefits: ["a long-lasting, skin-warm scent", "a clean, alcohol-free formula", "a signature that layers beautifully", "travel-ready, spill-proof format"],
    audience: "scent lovers 22–40 building a fragrance wardrobe",
    ritual: "your signature-scent moment",
    brandRoots: ["Aura", "Sillage", "Ember & Oud", "Nocte", "Trace"],
    toneWords: ["sensorial", "elevated", "intimate"],
    palette: [{ name: "Oud", hex: "#5a3a2e" }, { name: "Gilded", hex: "#c9a24a" }, { name: "Bone", hex: "#efe7d8" }],
    channels: ["instagram", "tiktok", "pinterest", "youtube"],
    hashtags: ["#perfumetok", "#fragrance", "#signaturescent", "#perfumeoil"],
  },
  "Shave & Hair Removal": {
    productType: "Shave Essential",
    benefits: ["a close, irritation-free shave", "smoother skin with no bumps", "long-lasting, gentle results", "a clean formula for sensitive skin"],
    audience: "grooming-conscious shoppers 20–40",
    ritual: "your shave-day routine",
    brandRoots: ["Smooth Co.", "Bare", "Silk Route", "Glide", "Clean Cut"],
    toneWords: ["gentle", "dependable", "fresh"],
    palette: [{ name: "Sea Glass", hex: "#7fb0a3" }, { name: "Charcoal", hex: "#3d4149" }, { name: "Linen", hex: "#f2efe8" }],
    channels: ["tiktok", "instagram", "youtube", "facebook"],
    hashtags: ["#shavingtips", "#smoothskin", "#bodycare", "#grooming"],
  },
  "Personal Care": {
    productType: "Body & Personal Care",
    benefits: ["effective results you can feel", "a fresh, clean everyday formula", "gentle enough for daily use", "low-waste, feel-good format"],
    audience: "value-and-clean shoppers 22–45",
    ritual: "your daily self-care routine",
    brandRoots: ["Everyday", "Clean Ritual", "Bar & Bloom", "Plume", "Daily Dose"],
    toneWords: ["clean", "warm", "trustworthy"],
    palette: [{ name: "Sage", hex: "#8aa07f" }, { name: "Clay", hex: "#c98f6f" }, { name: "Oat", hex: "#f0e9dc" }],
    channels: ["tiktok", "instagram", "pinterest", "facebook"],
    hashtags: ["#cleanbeauty", "#selfcare", "#bodycare", "#sustainableswaps"],
  },
};

const DEFAULT_PROFILE = PROFILES["Personal Care"];

// keyword → claim, so bullets & search terms reflect what the seller actually wrote
const KEYWORD_CLAIMS: { pattern: RegExp; claim: string; term: string }[] = [
  { pattern: /\bvegan\b/i, claim: "100% vegan and cruelty-free", term: "vegan" },
  { pattern: /\bhydrat/i, claim: "deeply hydrating", term: "hydrating" },
  { pattern: /\bgentle|sensitive\b/i, claim: "gentle on sensitive skin", term: "gentle" },
  { pattern: /\bclean\b/i, claim: "clean, non-toxic formula", term: "clean beauty" },
  { pattern: /\bnatural|botanical\b/i, claim: "natural, botanical ingredients", term: "natural" },
  { pattern: /\bsulfate|sulphate/i, claim: "sulfate-free", term: "sulfate free" },
  { pattern: /\bfragrance-?free|unscented\b/i, claim: "fragrance-free", term: "fragrance free" },
  { pattern: /\brepair|strengthen/i, claim: "repairing and strengthening", term: "repair" },
  { pattern: /\bglow|bright/i, claim: "for a visible, healthy glow", term: "brightening" },
  { pattern: /\blightweight|fast.?absorb/i, claim: "lightweight and fast-absorbing", term: "lightweight" },
  { pattern: /\borganic\b/i, claim: "certified organic", term: "organic" },
];

function priceTier(price: number): "accessible" | "mid" | "premium" {
  if (price < 15) return "accessible";
  if (price < 40) return "mid";
  return "premium";
}

// -----------------------------------------------------------------------------

export function buildGoToMarketKit(input: AnalysisRequest, analysis?: AnalysisResponse | null): GoToMarketKit {
  const profile = PROFILES[input.subcategory] ?? DEFAULT_PROFILE;
  const seed = hash(`${input.subcategory}|${input.title}|${input.description}|${input.price}`);
  const brief = `${input.title} ${input.description}`;
  const claims = KEYWORD_CLAIMS.filter((entry) => entry.pattern.test(brief));
  const tier = priceTier(input.price);
  const score = analysis?.success.score ?? 0;

  // --- brand identity ---
  const name = pick(profile.brandRoots, seed);
  const tagline = tier === "premium"
    ? `${titleCase(profile.toneWords[0])} ${profile.productType.toLowerCase()}, elevated.`
    : `${profile.benefits[0].replace(/^a |^an /, "").replace(/-looking/g, "")}, made simple.`;
  const positioning = `For ${profile.audience}, ${name} is the ${input.subcategory.toLowerCase()} brand that delivers ${profile.benefits[0]} — ${claims[0]?.claim ?? profile.toneWords.join(", ")} — at a ${tier} price.`;
  const brand: BrandIdentity = {
    name,
    tagline: titleCase(tagline).replace(/\.$/, "."),
    positioning,
    toneWords: profile.toneWords,
    palette: profile.palette,
    audience: profile.audience,
  };

  // --- amazon listing ---
  const recommendedPrice = analysis?.recommended_price ?? input.price;
  // Only prepend adjectives the title doesn't already carry, so we never repeat a word.
  const keywordAdjectives = claims
    .filter((c) => !new RegExp(`\\b${c.term.split(" ")[0]}`, "i").test(input.title))
    .slice(0, 2)
    .map((c) => titleCase(c.term))
    .join(" ");
  const baseTitle = `${name} ${keywordAdjectives ? keywordAdjectives + " " : ""}${input.title} — ${profile.benefits[0]}, ${profile.benefits[2]}`.replace(/\s+/g, " ").trim();
  const title = baseTitle.length > 190 ? baseTitle.slice(0, 187).trimEnd() + "…" : baseTitle;

  const claimBullets = claims.slice(0, 2).map((c) => `${titleCase(c.claim)} — ${c.claim.includes("free") ? "no compromises, no nasties." : "exactly what your routine has been missing."}`);
  const bullets = [
    `${profile.benefits[0].replace(/^./, (m) => m.toUpperCase())} — the reason customers come back.`,
    `Fits ${profile.ritual}: ${profile.benefits[1]}.`,
    ...claimBullets,
    `${brand.name} promise: ${profile.benefits[3]}, or your money back.`,
  ].slice(0, 5);
  while (bullets.length < 5) bullets.push(`${profile.benefits[bullets.length % profile.benefits.length].replace(/^./, (m) => m.toUpperCase())}.`);

  const description = [
    `Meet ${input.title} by ${brand.name}.`,
    `Made for ${profile.audience}, it's built to deliver ${profile.benefits[0]} without the trade-offs.`,
    claims.length ? `It's ${claims.map((c) => c.claim).join(", ")} — because what you put on matters.` : `A ${profile.toneWords.join(", ")} formula you can trust every day.`,
    `Works into ${profile.ritual} in seconds and ${profile.benefits[1]}.`,
    `Try it risk-free — ${profile.benefits[3]}. Add to cart and make it part of your routine today.`,
  ].join(" ");

  const searchTerms = [
    ...claims.map((c) => c.term),
    input.subcategory.toLowerCase(),
    profile.productType.toLowerCase(),
    ...profile.hashtags.map((h) => h.replace("#", "")),
  ].filter((term, index, all) => all.indexOf(term) === index).slice(0, 10);

  const priceRationale = analysis
    ? `The model's success curve peaks near ${money(recommendedPrice)}${score ? ` (score ${score}%)` : ""}. ${input.price > recommendedPrice ? "Your current price is above the sweet spot — test lower to widen reach." : input.price < recommendedPrice ? "You have room to raise price without hurting the forecast." : "Your price already matches the recommendation."}`
    : `Priced for the ${tier} tier of ${input.subcategory}. Start here and A/B test ±15% once reviews build.`;

  const listing: AmazonListing = { title, bullets, description, searchTerms, recommendedPrice, priceRationale };

  // --- selling points ---
  const primary = claims[0]
    ? `${titleCase(claims[0].claim)} ${profile.productType.toLowerCase()} that delivers ${profile.benefits[0]}.`
    : `The ${input.subcategory.toLowerCase()} that delivers ${profile.benefits[0]} — ${profile.toneWords[0]}, ${profile.toneWords[1]}, and made for ${profile.audience}.`;
  const selling: SellingPoints = {
    primary,
    supporting: [
      `Lead with the transformation: ${profile.benefits[0]}, shown not told (before/after).`,
      `Own the objection: ${claims[1]?.claim ?? profile.benefits[2]} answers the ‘will it work for me?’ doubt.`,
      score >= 70 ? `Social proof is your unlock — the model rates this a strong candidate, so seed reviews aggressively early.` : `Differentiate on ${profile.toneWords[0]} positioning where the category is crowded.`,
    ],
  };

  // --- promotion plan ---
  const channels = profile.channels.map((key) => CHANNELS[key]);
  const promotion: PromotionPlan = {
    launchAngle: `Launch ${brand.name} around one hero claim — “${primary.replace(/\.$/, "")}” — and let ${channels[0].network} carry the first spike before layering the rest.`,
    channels,
    firstWeek: [
      `Post 3 seed videos on ${channels[0].network} before launch day using ${profile.hashtags.slice(0, 2).join(" ")}.`,
      `Send 8–12 units to micro-creators (5k–50k) in the ${input.subcategory.toLowerCase()} niche for honest UGC.`,
      `Turn on ${CHANNELS.facebook.network} + Amazon-Sponsored retargeting once you have 15+ reviews.`,
      `Pin 5 keyword-rich ${CHANNELS.pinterest.network} pins pointing at the listing for evergreen traffic.`,
    ],
  };

  return { listing, brand, selling, promotion };
}

// Store-level brand identity: name + description for a multi-product portfolio.
export function buildStoreBrand(products: Pick<StoreProduct, "id" | "name" | "category" | "key">[]): { name: string; tagline: string; description: string } {
  const cats = [...new Set(products.map((p) => p.category || p.key).filter(Boolean))];
  const seed = products.reduce((sum, p) => sum + hash(String(p.id) + p.name), 0);
  const primaryProfile = PROFILES[cats[0] as string] ?? DEFAULT_PROFILE;
  const name = pick(["Glow Rituals", "Velvet & Bloom", "Aura Beauty Co.", "Dewy Collective", "Bloom & Bare", "The Ritual Edit"], seed);
  const tagline = titleCase(`${primaryProfile.toneWords[0]} beauty, ${primaryProfile.toneWords[1]} results`);
  const description = `A focused, data-picked beauty collection spanning ${cats.join(", ")}. ${name} leads with ${primaryProfile.benefits[0]} and a ${primaryProfile.toneWords.join(", ")} voice — built to test demand before committing serious capital.`;
  return { name, tagline, description };
}

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

// --- validation for LLM-generated kits ------------------------------------
// Shape returned by /api/go-to-market. The API route validates the model's
// JSON against this before it reaches the UI, and the client falls back to
// buildGoToMarketKit() if generation is unavailable or the payload is invalid.

const paletteColorSchema = z.object({ name: z.string(), hex: z.string() });
const socialChannelSchema = z.object({
  network: z.string(),
  emoji: z.string(),
  cadence: z.string(),
  format: z.string(),
  why: z.string(),
});

export const goToMarketKitSchema = z.object({
  listing: z.object({
    title: z.string(),
    bullets: z.array(z.string()),
    description: z.string(),
    searchTerms: z.array(z.string()),
    recommendedPrice: z.number(),
    priceRationale: z.string(),
  }),
  brand: z.object({
    name: z.string(),
    tagline: z.string(),
    positioning: z.string(),
    toneWords: z.array(z.string()),
    palette: z.array(paletteColorSchema),
    audience: z.string(),
  }),
  selling: z.object({ primary: z.string(), supporting: z.array(z.string()) }),
  promotion: z.object({
    launchAngle: z.string(),
    channels: z.array(socialChannelSchema),
    firstWeek: z.array(z.string()),
  }),
}) satisfies z.ZodType<GoToMarketKit>;

// JSON Schema for the Claude structured-output request (output_config.format).
// Kept in sync with GoToMarketKit / goToMarketKitSchema by hand — structured
// outputs require additionalProperties:false and explicit `required` on objects.
const strObj = (props: string[]) => ({
  type: "object",
  additionalProperties: false,
  required: props,
  properties: Object.fromEntries(props.map((p) => [p, { type: "string" }])),
});

export const goToMarketJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["listing", "brand", "selling", "promotion"],
  properties: {
    listing: {
      type: "object",
      additionalProperties: false,
      required: ["title", "bullets", "description", "searchTerms", "recommendedPrice", "priceRationale"],
      properties: {
        title: { type: "string" },
        bullets: { type: "array", items: { type: "string" } },
        description: { type: "string" },
        searchTerms: { type: "array", items: { type: "string" } },
        recommendedPrice: { type: "number" },
        priceRationale: { type: "string" },
      },
    },
    brand: {
      type: "object",
      additionalProperties: false,
      required: ["name", "tagline", "positioning", "toneWords", "palette", "audience"],
      properties: {
        name: { type: "string" },
        tagline: { type: "string" },
        positioning: { type: "string" },
        toneWords: { type: "array", items: { type: "string" } },
        palette: { type: "array", items: strObj(["name", "hex"]) },
        audience: { type: "string" },
      },
    },
    selling: {
      type: "object",
      additionalProperties: false,
      required: ["primary", "supporting"],
      properties: {
        primary: { type: "string" },
        supporting: { type: "array", items: { type: "string" } },
      },
    },
    promotion: {
      type: "object",
      additionalProperties: false,
      required: ["launchAngle", "channels", "firstWeek"],
      properties: {
        launchAngle: { type: "string" },
        channels: { type: "array", items: strObj(["network", "emoji", "cadence", "format", "why"]) },
        firstWeek: { type: "array", items: { type: "string" } },
      },
    },
  },
} as const;
