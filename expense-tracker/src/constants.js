import { PiggyBank, CreditCard, Building2, Wallet, Coins } from "lucide-react";

// ─── THEME TOKENS ───
export const themes = {
  dark: {
    gold: "#F5B526", goldDark: "#D49B1F", goldLight: "#FCCF5A", goldMuted: "rgba(245,181,38,0.15)",
    bg1: "#0C0C12", bg2: "#111118", surface: "rgba(255,255,255,0.04)", surfaceHover: "rgba(255,255,255,0.06)",
    border: "rgba(245,181,38,0.1)", borderStrong: "rgba(245,181,38,0.22)",
    text1: "#F5F0E8", text2: "#C8C0B4", text3: "#8E8880",
    err: "#F87171", ok: "#4ADE80",
    glow: "0 0 20px rgba(245,181,38,0.12)",
    grad: "linear-gradient(135deg,#F5B526,#D49B1F)",
    gradBg: "linear-gradient(160deg,#0C0C12 0%,#111118 40%,#0E0D0A 100%)",
    modalBg: "rgba(0,0,0,0.75)", modalSurface: "#151520",
    cardShadow: "none", inputBg: "rgba(255,255,255,0.05)", inputBorder: "rgba(255,255,255,0.12)",
    scrollThumb: "rgba(245,181,38,0.2)", selectBg: "#151520",
    chatUser: "linear-gradient(135deg,#F5B526,#D49B1F)", chatUserText: "#0C0C12",
    chatBot: "rgba(255,255,255,0.04)", chatBotBorder: "rgba(255,255,255,0.1)",
    pillInactiveBg: "transparent", pillInactiveBorder: "rgba(255,255,255,0.1)",
    toastBg: "#151520", toastBorder: "#F5B526",
  },
  light: {
    gold: "#D49B1F", goldDark: "#B8860B", goldLight: "#F5B526", goldMuted: "rgba(212,155,31,0.1)",
    bg1: "#FAFAF7", bg2: "#FFFFFF", surface: "rgba(0,0,0,0.02)", surfaceHover: "rgba(0,0,0,0.04)",
    border: "rgba(212,155,31,0.12)", borderStrong: "rgba(212,155,31,0.25)",
    text1: "#1A1A1A", text2: "#6B6560", text3: "#A09890",
    err: "#DC2626", ok: "#059669",
    glow: "0 0 20px rgba(212,155,31,0.08)",
    grad: "linear-gradient(135deg,#F5B526,#D49B1F)",
    gradBg: "linear-gradient(160deg,#FAFAF7 0%,#F5F3EE 40%,#FAFAF7 100%)",
    modalBg: "rgba(0,0,0,0.4)", modalSurface: "#FFFFFF",
    cardShadow: "0 1px 3px rgba(0,0,0,0.04)", inputBg: "#FFFFFF", inputBorder: "rgba(0,0,0,0.1)",
    scrollThumb: "rgba(212,155,31,0.25)", selectBg: "#FFFFFF",
    chatUser: "linear-gradient(135deg,#F5B526,#D49B1F)", chatUserText: "#FFFFFF",
    chatBot: "rgba(0,0,0,0.02)", chatBotBorder: "rgba(0,0,0,0.06)",
    pillInactiveBg: "rgba(0,0,0,0.02)", pillInactiveBorder: "rgba(0,0,0,0.06)",
    toastBg: "#FFFFFF", toastBorder: "#D49B1F",
  }
};

export const DEF_CCO = { Food: "#F5B526", Transport: "#60A5FA", Bills: "#EF6B6B", Shopping: "#C084FC", Health: "#34D399", Entertainment: "#FB923C", Subscriptions: "#F472B6", Other: "#94A3B8" };
export const DEF_CATS = ["Food","Transport","Bills","Shopping","Health","Entertainment","Subscriptions","Other"];
export const EXTRA_COLORS = ["#A78BFA","#F97316","#06B6D4","#84CC16","#E879F9","#14B8A6","#F43F5E","#8B5CF6","#FBBF24","#22D3EE","#A3E635","#FB7185"];
export const PERIODS = ["Daily","Weekly","Monthly","Quarterly","Yearly","All"];
export const LOCAL_USERS = ["Joseph","Rowena"];
export const DEBT_TYPES = ["Credit Card", "Mortgage", "Personal Loan", "Car Loan", "Other"];
export const INCOME_SOURCES = ["Salary", "Freelance", "Business", "Side Hustle", "Gift", "Refund", "Other"];
export const CRYPTO_COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "tether", symbol: "USDT", name: "Tether" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink" },
  { id: "matic-network", symbol: "MATIC", name: "Polygon" },
];
export const DEFAULT_BUDGETS = { Food: 0, Transport: 0, Bills: 0, Shopping: 0, Health: 0, Entertainment: 0, Subscriptions: 0, Other: 0 };
export const DEFAULT_PINS = { Joseph: "1234", Rowena: "5678" };
export const CURRENCIES = [
  { code: "PHP", symbol: "\u20B1", name: "Philippine Peso" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "\u20AC", name: "Euro" },
  { code: "JPY", symbol: "\u00A5", name: "Japanese Yen" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "AED", symbol: "AED", name: "UAE Dirham" },
  { code: "KRW", symbol: "\u20A9", name: "Korean Won" },
  { code: "THB", symbol: "\u0E3F", name: "Thai Baht" },
  { code: "GBP", symbol: "\u00A3", name: "British Pound" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
];

export const aIcons = { savings: PiggyBank, checking: CreditCard, investment: Building2, other: Wallet };
export const dIcons = { "Credit Card": CreditCard, "Mortgage": Building2, "Personal Loan": Wallet, "Car Loan": Coins, "Other": PiggyBank };

// ─── UTILITY FUNCTIONS ───
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const fmt = (n) => "\u20B1" + new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
export const fmtS = (n) => n >= 1000 ? "\u20B1" + (n / 1000).toFixed(1) + "k" : "\u20B1" + n.toFixed(0);
export const td = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
export const pld = (s) => { const [y, m, d] = (s || "").split("-").map(Number); return new Date(y, m - 1, d); };
export const stripE = (t) => t.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, "").replace(/\s{2,}/g, " ").trim();

export function startOf(p) {
  const d = new Date();
  if (p === "Daily") return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (p === "Weekly") return new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());
  if (p === "Monthly") return new Date(d.getFullYear(), d.getMonth(), 1);
  if (p === "Quarterly") return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1);
  if (p === "Yearly") return new Date(d.getFullYear(), 0, 1);
  return new Date(0);
}

export function prevRange(p) {
  const d = new Date();
  if (p === "Daily") return [new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1), new Date(d.getFullYear(), d.getMonth(), d.getDate())];
  if (p === "Weekly") return [new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay() - 7), new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay())];
  if (p === "Monthly") return [new Date(d.getFullYear(), d.getMonth() - 1, 1), new Date(d.getFullYear(), d.getMonth(), 1)];
  if (p === "Quarterly") { const q = Math.floor(d.getMonth() / 3) * 3; return [new Date(d.getFullYear(), q - 3, 1), new Date(d.getFullYear(), q, 1)]; }
  if (p === "Yearly") return [new Date(d.getFullYear() - 1, 0, 1), new Date(d.getFullYear(), 0, 1)];
  return [new Date(0), new Date(0)];
}

// ─── LOCALSTORAGE FALLBACK ───
export const localStore = {
  get: async (key) => {
    if (window.storage?.get) return window.storage.get(key);
    const v = localStorage.getItem(key);
    return v !== null ? { value: v } : null;
  },
  set: async (key, value) => {
    if (window.storage?.set) return window.storage.set(key, value);
    localStorage.setItem(key, value);
    return { key, value };
  },
};
