export const categories = [
  { value: "Hair Care", emoji: "💇", range: [12, 45], competition: 72 },
  { value: "Skin Care", emoji: "💧", range: [15, 55], competition: 70 },
  { value: "Foot, Hand & Nail Care", emoji: "💅", range: [9, 35], competition: 55 },
  { value: "Makeup", emoji: "💄", range: [12, 42], competition: 75 },
  { value: "Tools & Accessories", emoji: "🪮", range: [14, 60], competition: 66 },
  { value: "Fragrance", emoji: "🌸", range: [22, 95], competition: 60 },
  { value: "Shave & Hair Removal", emoji: "🪒", range: [12, 40], competition: 50 },
  { value: "Personal Care", emoji: "🧼", range: [10, 38], competition: 48 },
] as const;

const image = (id: string) => `https://images.unsplash.com/${id}?w=640&h=480&fit=crop&auto=format&q=75`;

export const trendingProducts = [
  { id: 0, key: "hair", category: "Hair Care", name: "Rosemary Hair Growth Oil", description: "Natural rosemary hair growth oil, hydrating and sulfate free", price: 28, successScore: 79, monthlyProfit: 1740, startupCost: 302, trend: 24, image: image("photo-1699373381541-8508168f82ca") },
  { id: 1, key: "skin", category: "Skin Care", name: "Vitamin C Brightening Serum", description: "Hydrating vitamin C brightening serum, vegan and fast absorbing", price: 32, successScore: 82, monthlyProfit: 2180, startupCost: 326, trend: 31, image: image("photo-1710410815589-dd83514104d0") },
  { id: 2, key: "skin", category: "Skin Care", name: "Hyaluronic Acid Moisturizer", description: "Gentle hydration and clean beauty for a daily glow ritual", price: 26, successScore: 76, monthlyProfit: 1610, startupCost: 265, trend: 18, image: image("photo-1763503836825-97f5450d155a") },
  { id: 3, key: "nail", category: "Foot, Hand & Nail Care", name: "Cuticle & Nail Growth Oil", description: "Nourishing, fast-absorbing vegan oil for stronger nails", price: 14, successScore: 73, monthlyProfit: 980, startupCost: 160, trend: 15, image: image("photo-1779988243167-5598fc33045f") },
  { id: 4, key: "makeup", category: "Makeup", name: "Matte Liquid Lipstick Set", description: "Long-lasting buildable colour with a clean beauty finish", price: 22, successScore: 68, monthlyProfit: 1260, startupCost: 264, trend: 12, image: image("photo-1625093742435-6fa192b6fb10") },
  { id: 5, key: "tools", category: "Tools & Accessories", name: "Ice Roller for Face", description: "A gentle depuffing tool for a spa-at-home ritual", price: 24, successScore: 75, monthlyProfit: 1370, startupCost: 324, trend: 20, image: image("photo-1578747763484-51b21a33e4fa") },
  { id: 7, key: "fragrance", category: "Fragrance", name: "Roll-on Perfume Oil", description: "Long-lasting clean scent in a travel-ready format", price: 30, successScore: 71, monthlyProfit: 1120, startupCost: 378, trend: 17, image: image("photo-1523293182086-7651a899d37f") },
  { id: 8, key: "personal", category: "Personal Care", name: "Sulfate-free Shampoo Bar", description: "Hydrating clean formula with a low-waste format", price: 16, successScore: 77, monthlyProfit: 1090, startupCost: 178, trend: 28, image: image("photo-1546552768-9e3a94b38a59") },
] as const;

export const demoTrend = [
  { month: "Aug", history: 42, forecast: null },
  { month: "Sep", history: 48, forecast: null },
  { month: "Oct", history: 45, forecast: null },
  { month: "Nov", history: 55, forecast: null },
  { month: "Dec", history: 58, forecast: null },
  { month: "Jan", history: 63, forecast: 63 },
  { month: "Feb", history: null, forecast: 69 },
  { month: "Mar", history: null, forecast: 74 },
  { month: "Apr", history: null, forecast: 80 },
];
