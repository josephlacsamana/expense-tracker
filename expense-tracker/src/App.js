import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit3, X, Check, Search, MessageSquare, LayoutDashboard, PieChart, Settings, ChevronDown, Lock, LogOut, ImagePlus, Send, RefreshCw, Download, AlertTriangle, TrendingUp, TrendingDown, PiggyBank, CreditCard, Building2, Wallet, Lightbulb, Coins, Sun, Moon, Repeat, Copy, UserPlus, Home } from "lucide-react";
import { PieChart as RPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { supabase, sbReady } from "./supabase";

// ─── THEME TOKENS ───
const themes = {
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

const DEF_CCO = { Food: "#F5B526", Transport: "#60A5FA", Bills: "#EF6B6B", Shopping: "#C084FC", Health: "#34D399", Entertainment: "#FB923C", Subscriptions: "#F472B6", Other: "#94A3B8" };
const DEF_CATS = ["Food","Transport","Bills","Shopping","Health","Entertainment","Subscriptions","Other"];
const EXTRA_COLORS = ["#A78BFA","#F97316","#06B6D4","#84CC16","#E879F9","#14B8A6","#F43F5E","#8B5CF6","#FBBF24","#22D3EE","#A3E635","#FB7185"];
const PERIODS = ["Daily","Weekly","Monthly","Quarterly","Yearly","All"];
const LOCAL_USERS = ["Joseph","Rowena"];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const fmt = (n) => "\u20B1" + new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const fmtS = (n) => n >= 1000 ? "\u20B1" + (n / 1000).toFixed(1) + "k" : "\u20B1" + n.toFixed(0);
const td = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const pld = (s) => { const [y, m, d] = (s || "").split("-").map(Number); return new Date(y, m - 1, d); };
const aIcons = { savings: PiggyBank, checking: CreditCard, investment: Building2, other: Wallet };
const dIcons = { "Credit Card": CreditCard, "Mortgage": Building2, "Personal Loan": Wallet, "Car Loan": Coins, "Other": PiggyBank };
const DEBT_TYPES = ["Credit Card", "Mortgage", "Personal Loan", "Car Loan", "Other"];

// localStorage fallback (used when Supabase env vars not set)
const localStore = {
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

// ─── SUPABASE HELPERS ───
const sb = {
  // Load all data from Supabase
  loadAll: async (hid) => {
    const [eR, aR, rR, cR, bR, gR, pR, dR, dpR] = await Promise.all([
      supabase.from("expenses").select("*").eq("household_id", hid).order("created_at", { ascending: false }),
      supabase.from("accounts").select("*").eq("household_id", hid),
      supabase.from("recurring").select("*").eq("household_id", hid),
      supabase.from("categories").select("*").eq("household_id", hid).order("sort_order"),
      supabase.from("settings").select("*").eq("key", "budgets").eq("household_id", hid).maybeSingle(),
      supabase.from("settings").select("*").eq("key", "genBudget").eq("household_id", hid).maybeSingle(),
      supabase.from("settings").select("*").eq("key", "pins").eq("household_id", hid).maybeSingle(),
      supabase.from("debts").select("*").eq("household_id", hid).order("created_at", { ascending: false }),
      supabase.from("debt_payments").select("*").eq("household_id", hid).order("created_at", { ascending: false }),
    ]);
    return {
      expenses: eR.data?.map(r => ({ id: r.id, amount: Number(r.amount), category: r.category, description: r.description || "", date: r.date, addedBy: r.added_by, accountId: r.account_id || null, createdAt: r.created_at })) || [],
      accounts: aR.data?.map(r => ({ id: r.id, name: r.name, balance: Number(r.balance), type: r.type, updatedAt: r.updated_at })) || [],
      recurring: rR.data?.map(r => ({ id: r.id, amount: Number(r.amount), category: r.category, description: r.description || "", frequency: r.frequency, nextDate: r.next_date, addedBy: r.added_by, createdAt: r.created_at })) || [],
      categories: cR.data?.length > 0 ? cR.data.map(r => r.name) : null,
      budgets: bR.data?.value || null,
      genBudget: gR.data?.value ?? null,
      pins: pR.data?.value || null,
      debts: dR.data?.map(r => ({ id: r.id, name: r.name, type: r.type, totalAmount: Number(r.total_amount), currentBalance: Number(r.current_balance), dueDate: r.due_date ? Number(r.due_date) : null, interestRate: Number(r.interest_rate || 0), minPayment: Number(r.min_payment || 0), addedBy: r.added_by, createdAt: r.created_at, updatedAt: r.updated_at })) || [],
      debtPayments: dpR.data?.map(r => ({ id: r.id, debtId: r.debt_id, amount: Number(r.amount), date: r.date, newBalance: Number(r.new_balance), createdAt: r.created_at })) || [],
    };
  },
  // Expenses
  upsertExpense: async (e, hid) => {
    await supabase.from("expenses").upsert({ id: e.id, amount: e.amount, category: e.category, description: e.description || "", date: e.date, added_by: e.addedBy, account_id: e.accountId || null, household_id: hid, created_at: e.createdAt });
  },
  upsertExpenses: async (arr, hid) => {
    if (!arr.length) return;
    await supabase.from("expenses").upsert(arr.map(e => ({ id: e.id, amount: e.amount, category: e.category, description: e.description || "", date: e.date, added_by: e.addedBy, account_id: e.accountId || null, household_id: hid, created_at: e.createdAt })));
  },
  deleteExpense: async (id, hid) => { await supabase.from("expenses").delete().eq("id", id).eq("household_id", hid); },
  deleteAllExpenses: async (hid) => { await supabase.from("expenses").delete().eq("household_id", hid); },
  // Accounts
  upsertAccount: async (a, hid) => {
    await supabase.from("accounts").upsert({ id: a.id, name: a.name, balance: a.balance, type: a.type, household_id: hid, updated_at: a.updatedAt });
  },
  deleteAccount: async (id, hid) => { await supabase.from("accounts").delete().eq("id", id).eq("household_id", hid); },
  deleteAllAccounts: async (hid) => { await supabase.from("accounts").delete().eq("household_id", hid); },
  // Recurring
  upsertRecurring: async (r, hid) => {
    await supabase.from("recurring").upsert({ id: r.id, amount: r.amount, category: r.category, description: r.description || "", frequency: r.frequency, next_date: r.nextDate, added_by: r.addedBy, household_id: hid, created_at: r.createdAt });
  },
  upsertRecurringBulk: async (arr, hid) => {
    if (!arr.length) return;
    await supabase.from("recurring").upsert(arr.map(r => ({ id: r.id, amount: r.amount, category: r.category, description: r.description || "", frequency: r.frequency, next_date: r.nextDate, added_by: r.addedBy, household_id: hid, created_at: r.createdAt })));
  },
  deleteRecurring: async (id, hid) => { await supabase.from("recurring").delete().eq("id", id).eq("household_id", hid); },
  deleteAllRecurring: async (hid) => { await supabase.from("recurring").delete().eq("household_id", hid); },
  // Debts
  upsertDebt: async (d, hid) => {
    await supabase.from("debts").upsert({ id: d.id, name: d.name, type: d.type, total_amount: d.totalAmount, current_balance: d.currentBalance, due_date: d.dueDate, interest_rate: d.interestRate, min_payment: d.minPayment, added_by: d.addedBy, household_id: hid, created_at: d.createdAt, updated_at: d.updatedAt });
  },
  deleteDebt: async (id, hid) => { await supabase.from("debt_payments").delete().eq("debt_id", id).eq("household_id", hid); await supabase.from("debts").delete().eq("id", id).eq("household_id", hid); },
  deleteAllDebts: async (hid) => { await supabase.from("debt_payments").delete().eq("household_id", hid); await supabase.from("debts").delete().eq("household_id", hid); },
  upsertDebtPayment: async (p, hid) => {
    await supabase.from("debt_payments").upsert({ id: p.id, debt_id: p.debtId, amount: p.amount, date: p.date, new_balance: p.newBalance, household_id: hid, created_at: p.createdAt });
  },
  // Categories
  saveCategories: async (cats, hid) => {
    await supabase.from("categories").delete().eq("household_id", hid);
    if (cats.length > 0) await supabase.from("categories").insert(cats.map((c, i) => ({ name: c, sort_order: i, household_id: hid })));
  },
  // Settings (key-value)
  saveSetting: async (key, value, hid) => {
    await supabase.from("settings").upsert({ key, value, household_id: hid });
  },
  clearAllSettings: async (hid) => { await supabase.from("settings").delete().eq("household_id", hid); },
  // Migrate localStorage → Supabase (one-time)
  migrate: async (expenses, accounts, recurring, categories, budgets, genBudget, pins, hid) => {
    const ops = [];
    if (expenses.length) ops.push(sb.upsertExpenses(expenses, hid));
    if (accounts.length) ops.push(supabase.from("accounts").upsert(accounts.map(a => ({ id: a.id, name: a.name, balance: a.balance, type: a.type, household_id: hid, updated_at: a.updatedAt }))));
    if (recurring.length) ops.push(sb.upsertRecurringBulk(recurring, hid));
    if (categories.length) ops.push(sb.saveCategories(categories, hid));
    if (budgets) ops.push(sb.saveSetting("budgets", budgets, hid));
    if (genBudget) ops.push(sb.saveSetting("genBudget", genBudget, hid));
    if (pins) ops.push(sb.saveSetting("pins", pins, hid));
    await Promise.all(ops);
  },
};

const stripE = (t) => t.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, "").replace(/\s{2,}/g, " ").trim();

function startOf(p) {
  const d = new Date();
  if (p === "Daily") return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (p === "Weekly") return new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());
  if (p === "Monthly") return new Date(d.getFullYear(), d.getMonth(), 1);
  if (p === "Quarterly") return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1);
  if (p === "Yearly") return new Date(d.getFullYear(), 0, 1);
  return new Date(0);
}
function prevRange(p) {
  const d = new Date();
  if (p === "Daily") return [new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1), new Date(d.getFullYear(), d.getMonth(), d.getDate())];
  if (p === "Weekly") return [new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay() - 7), new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay())];
  if (p === "Monthly") return [new Date(d.getFullYear(), d.getMonth() - 1, 1), new Date(d.getFullYear(), d.getMonth(), 1)];
  if (p === "Quarterly") { const q = Math.floor(d.getMonth() / 3) * 3; return [new Date(d.getFullYear(), q - 3, 1), new Date(d.getFullYear(), q, 1)]; }
  if (p === "Yearly") return [new Date(d.getFullYear() - 1, 0, 1), new Date(d.getFullYear(), 0, 1)];
  return [new Date(0), new Date(0)];
}

// ─── RESPONSIVE HOOK ───
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

const SEED_EXP = [
  // March 2026
  { amount: 628, category: "Food", description: "Grab Food delivery", date: "2026-03-02", addedBy: "Joseph" },
  { amount: 194, category: "Food", description: "Merienda at Jollibee", date: "2026-03-02", addedBy: "Rowena" },
  { amount: 85, category: "Food", description: "Kape at Tim Hortons", date: "2026-03-01", addedBy: "Rowena" },
  { amount: 1500, category: "Transport", description: "Gas full tank Shell SLEX", date: "2026-03-01", addedBy: "Joseph" },
  { amount: 245, category: "Food", description: "Lunch at Chowking", date: "2026-03-01", addedBy: "Joseph" },
  // Feb 28
  { amount: 89, category: "Food", description: "Coffee at Starbucks BGC", date: "2026-02-28", addedBy: "Rowena" },
  { amount: 1850, category: "Shopping", description: "Lazada home decor", date: "2026-02-28", addedBy: "Rowena" },
  { amount: 320, category: "Food", description: "Samgyupsal dinner", date: "2026-02-28", addedBy: "Joseph" },
  // Feb 27
  { amount: 2500, category: "Bills", description: "Meralco electricity", date: "2026-02-27", addedBy: "Joseph" },
  { amount: 1299, category: "Bills", description: "PLDT Fibr internet", date: "2026-02-27", addedBy: "Joseph" },
  { amount: 150, category: "Transport", description: "Angkas to office", date: "2026-02-27", addedBy: "Rowena" },
  // Feb 26
  { amount: 549, category: "Subscriptions", description: "Netflix Premium", date: "2026-02-26", addedBy: "Joseph" },
  { amount: 159, category: "Subscriptions", description: "Spotify Premium", date: "2026-02-26", addedBy: "Rowena" },
  { amount: 399, category: "Food", description: "Puregold grocery run", date: "2026-02-26", addedBy: "Rowena" },
  // Feb 25
  { amount: 3200, category: "Shopping", description: "Shopee haul - kitchen stuff", date: "2026-02-25", addedBy: "Rowena" },
  { amount: 450, category: "Food", description: "Grocery at SM Hypermarket", date: "2026-02-25", addedBy: "Joseph" },
  { amount: 200, category: "Entertainment", description: "Mobile Legends diamonds", date: "2026-02-25", addedBy: "Joseph" },
  // Feb 24
  { amount: 180, category: "Transport", description: "Grab ride to BGC", date: "2026-02-24", addedBy: "Rowena" },
  { amount: 350, category: "Food", description: "Dinner at Mang Inasal", date: "2026-02-24", addedBy: "Joseph" },
  { amount: 120, category: "Food", description: "Potato Corner + milk tea", date: "2026-02-24", addedBy: "Rowena" },
  // Feb 23
  { amount: 1200, category: "Health", description: "Dental cleaning Molar City", date: "2026-02-23", addedBy: "Rowena" },
  { amount: 750, category: "Entertainment", description: "Movie at SM Cinema", date: "2026-02-23", addedBy: "Joseph" },
  { amount: 275, category: "Food", description: "Pancit Canton + ulam sa palengke", date: "2026-02-23", addedBy: "Rowena" },
  // Feb 22
  { amount: 2800, category: "Shopping", description: "Nike running shoes Trinoma", date: "2026-02-22", addedBy: "Joseph" },
  { amount: 520, category: "Food", description: "Yellow Cab pizza lunch", date: "2026-02-22", addedBy: "Rowena" },
  { amount: 99, category: "Subscriptions", description: "iCloud storage", date: "2026-02-22", addedBy: "Rowena" },
  // Feb 21
  { amount: 65, category: "Transport", description: "Angkas ride Ortigas", date: "2026-02-21", addedBy: "Rowena" },
  { amount: 4500, category: "Bills", description: "Water bill + condo dues", date: "2026-02-21", addedBy: "Joseph" },
  { amount: 389, category: "Food", description: "Foodpanda - Max's Chicken", date: "2026-02-21", addedBy: "Joseph" },
  // Feb 20
  { amount: 890, category: "Food", description: "Weekend groceries Robinsons", date: "2026-02-20", addedBy: "Rowena" },
  { amount: 1350, category: "Entertainment", description: "KTV with barkada", date: "2026-02-20", addedBy: "Joseph" },
  { amount: 250, category: "Transport", description: "Grab to Alabang", date: "2026-02-20", addedBy: "Joseph" },
  // Feb 19
  { amount: 299, category: "Health", description: "Mercury Drug vitamins", date: "2026-02-19", addedBy: "Rowena" },
  { amount: 175, category: "Transport", description: "Grab to Makati CBD", date: "2026-02-19", addedBy: "Joseph" },
  { amount: 185, category: "Food", description: "Ministop chicken + rice", date: "2026-02-19", addedBy: "Rowena" },
  // Feb 18
  { amount: 1800, category: "Bills", description: "Globe postpaid plan", date: "2026-02-18", addedBy: "Joseph" },
  { amount: 650, category: "Health", description: "Watsons skincare haul", date: "2026-02-18", addedBy: "Rowena" },
  { amount: 430, category: "Food", description: "Date night at Bonchon", date: "2026-02-18", addedBy: "Joseph" },
  // Feb 17
  { amount: 2100, category: "Shopping", description: "Uniqlo clothes Ayala", date: "2026-02-17", addedBy: "Joseph" },
  { amount: 380, category: "Food", description: "Turks shawarma + drinks", date: "2026-02-17", addedBy: "Rowena" },
  { amount: 100, category: "Transport", description: "Jeepney + MRT fare", date: "2026-02-17", addedBy: "Rowena" },
  // Feb 16
  { amount: 1500, category: "Entertainment", description: "Concert tickets MOA Arena", date: "2026-02-16", addedBy: "Joseph" },
  { amount: 750, category: "Food", description: "Sinigang + pulutan sa dampa", date: "2026-02-16", addedBy: "Joseph" },
  { amount: 280, category: "Transport", description: "Grab to MOA", date: "2026-02-16", addedBy: "Rowena" },
  // Feb 15
  { amount: 3500, category: "Bills", description: "Condo association dues", date: "2026-02-15", addedBy: "Joseph" },
  { amount: 199, category: "Subscriptions", description: "YouTube Premium", date: "2026-02-15", addedBy: "Joseph" },
  { amount: 1200, category: "Food", description: "Valentine's dinner at Ramen Nagi", date: "2026-02-15", addedBy: "Joseph" },
  // Feb 14
  { amount: 2500, category: "Shopping", description: "Valentine's gift - perfume", date: "2026-02-14", addedBy: "Joseph" },
  { amount: 450, category: "Shopping", description: "Valentine's gift - wallet", date: "2026-02-14", addedBy: "Rowena" },
  { amount: 350, category: "Food", description: "Krispy Kreme donuts", date: "2026-02-14", addedBy: "Rowena" },
  // Feb 13
  { amount: 500, category: "Health", description: "Gym membership Anytime Fitness", date: "2026-02-13", addedBy: "Joseph" },
  { amount: 220, category: "Food", description: "Jolly Spaghetti meal", date: "2026-02-13", addedBy: "Rowena" },
  { amount: 95, category: "Transport", description: "Beep card load LRT", date: "2026-02-13", addedBy: "Rowena" },
].map(e => ({ ...e, id: uid(), createdAt: Date.now() }));
const SEED_ACCT = [
  { id: uid(), name: "BDO Savings", balance: 45000, type: "savings", updatedAt: Date.now() },
  { id: uid(), name: "BPI Checking", balance: 12500, type: "checking", updatedAt: Date.now() },
  { id: uid(), name: "GCash", balance: 3200, type: "other", updatedAt: Date.now() },
];
const DEFAULT_BUDGETS = { Food: 0, Transport: 0, Bills: 0, Shopping: 0, Health: 0, Entertainment: 0, Subscriptions: 0, Other: 0 };
const DEFAULT_PINS = { Joseph: "1234", Rowena: "5678" };

// ─── LOGIN ───
const GoogleIcon = () => (<svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>);

function LoginScreen({ onLogin, theme, toggleTheme, authError, localMode }) {
  const T = themes[theme];
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  // PIN state (only used in localMode)
  const [selectedUser, setSelectedUser] = useState(null);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [pins, setPins] = useState(DEFAULT_PINS);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (localMode) { (async () => { try { const r = await localStore.get("pins"); if (r?.value) setPins(JSON.parse(r.value)); } catch {} })(); }
  }, [localMode]);

  const doLocalLogin = () => { if (pins[selectedUser] === pin) onLogin(selectedUser); else { setErr("Wrong PIN. Try again."); setPin(""); } };

  const doGoogleLogin = async () => {
    setSigningIn(true); setErr("");
    try {
      const pendingToken = localStorage.getItem("pendingInvite");
      const redirectTo = window.location.origin + (pendingToken ? `/invite/${pendingToken}` : "");
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
      if (error) { setErr(error.message); setSigningIn(false); }
    } catch { setErr("Failed to start sign in."); setSigningIn(false); }
  };

  const ua = navigator.userAgent || "";
  const isInAppBrowser = /FBAN|FBAV|FB_IAB|Instagram|Messenger/i.test(ua);

  const openInChrome = () => {
    const url = window.location.href;
    window.location.href = `intent://${window.location.hostname}${window.location.pathname}${window.location.search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
  };

  const brandText = "Shared Finance";

  return (
    <div style={{ minHeight: "100vh", background: T.gradBg, display: "flex", flexDirection: isDesktop ? "row" : "column", justifyContent: "center", alignItems: isDesktop ? "stretch" : "center", padding: isDesktop ? 0 : 24, position: "relative" }}>
      {!isDesktop && (
        <button onClick={toggleTheme} style={{ position: "absolute", top: 20, right: 20, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 10, cursor: "pointer", color: T.text2, display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600 }}>
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      )}
      {isDesktop && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 60 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 40px rgba(245,181,38,0.25)", marginBottom: 24 }}>
            <Coins size={36} style={{ color: theme === "dark" ? "#0C0C12" : "#FFF" }} />
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 800, margin: 0, color: T.text1, letterSpacing: -1 }}>Expense<span style={{ color: T.gold }}>Tracker</span></h1>
          <p style={{ color: T.text3, fontSize: 15, margin: "10px 0 0", letterSpacing: 2, textTransform: "uppercase" }}>{brandText}</p>
          <p style={{ color: T.text3, fontSize: 13, marginTop: 8 }}>Personal finance, simplified.</p>
          <button onClick={toggleTheme} style={{ marginTop: 32, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 18px", cursor: "pointer", color: T.text2, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      )}
      <div style={{ width: isDesktop ? 480 : "100%", maxWidth: isDesktop ? 480 : 380, ...(isDesktop ? { background: T.surface, borderLeft: `1px solid ${T.border}`, display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 56px", flexShrink: 0 } : {}) }}>
        {!isDesktop && (
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: T.grad, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(245,181,38,0.25)" }}>
              <Coins size={28} style={{ color: theme === "dark" ? "#0C0C12" : "#FFF" }} />
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, margin: 0, color: T.text1, letterSpacing: -0.5 }}>Expense Tracker</h1>
            <p style={{ color: T.text3, fontSize: 13, margin: "6px 0 0", letterSpacing: 2, textTransform: "uppercase" }}>{brandText}</p>
          </div>
        )}
        {isDesktop && (
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: T.text1 }}>Welcome back</h2>
            <p style={{ color: T.text3, fontSize: 13, margin: "6px 0 0" }}>{localMode ? "Select your profile and enter your PIN" : "Sign in to continue"}</p>
          </div>
        )}
        {localMode ? (
          /* ─── PIN LOGIN (localStorage fallback) ─── */
          !selectedUser ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ color: T.text2, fontSize: 13, textAlign: isDesktop ? "left" : "center", marginBottom: 4 }}>Who's logging in?</p>
              {LOCAL_USERS.map(u => (
                <button key={u} onClick={() => setSelectedUser(u)} style={{
                  padding: "18px 20px", borderRadius: 18, border: `1px solid ${T.border}`, background: T.surface,
                  color: T.text1, fontSize: 16, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "all 0.2s", boxShadow: T.cardShadow
                }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: theme === "dark" ? "#0C0C12" : "#FFF", boxShadow: "0 4px 12px rgba(245,181,38,0.2)" }}>{u[0]}</div>
                  {u}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div style={{ textAlign: isDesktop ? "left" : "center", marginBottom: 28 }}>
                <div style={{ width: 72, height: 72, borderRadius: 22, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: theme === "dark" ? "#0C0C12" : "#FFF", margin: isDesktop ? "0 0 14px" : "0 auto 14px", boxShadow: "0 8px 32px rgba(245,181,38,0.25)" }}>{selectedUser[0]}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: T.text1 }}>Welcome, {selectedUser}</div>
                <button onClick={() => { setSelectedUser(null); setPin(""); setErr(""); }} style={{ background: "none", border: "none", color: T.gold, fontSize: 12, cursor: "pointer", marginTop: 4 }}>Not you?</button>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 11, color: T.text3, fontWeight: 600, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Enter PIN</label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.text3 }} />
                  <input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, "")); setErr(""); }}
                    onKeyDown={e => { if (e.key === "Enter") doLocalLogin(); }} placeholder="----" autoFocus
                    style={{ width: "100%", padding: "14px 14px 14px 42px", borderRadius: 12, border: `1px solid ${T.inputBorder}`, background: T.inputBg, color: T.text1, fontSize: 22, letterSpacing: 12, textAlign: "center", outline: "none", boxSizing: "border-box" }} />
                </div>
                {err && <div style={{ color: T.err, fontSize: 12, marginTop: 8, textAlign: isDesktop ? "left" : "center" }}>{err}</div>}
              </div>
              <button onClick={doLocalLogin} disabled={pin.length < 4} style={{
                width: "100%", padding: 16, borderRadius: 14, border: "none", cursor: pin.length >= 4 ? "pointer" : "default",
                background: T.grad, color: theme === "dark" ? "#0C0C12" : "#FFF", fontSize: 14, fontWeight: 700,
                opacity: pin.length >= 4 ? 1 : 0.3, boxShadow: "0 4px 16px rgba(245,181,38,0.2)"
              }}>Log In</button>
              <p style={{ color: T.text3, fontSize: 10, textAlign: isDesktop ? "left" : "center", marginTop: 14 }}>Default: Joseph=1234, Rowena=5678</p>
            </>
          )
        ) : (
          /* ─── GOOGLE LOGIN (Supabase mode) ─── */
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {!isDesktop && (
              <div style={{ marginBottom: 8 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: T.text1, textAlign: "center" }}>Welcome back</h2>
                <p style={{ color: T.text3, fontSize: 13, margin: "6px 0 0", textAlign: "center" }}>Sign in to continue</p>
              </div>
            )}
            {isInAppBrowser && (
              <div style={{ background: theme === "dark" ? "rgba(245,181,38,0.08)" : "rgba(245,181,38,0.12)", border: "1px solid rgba(245,181,38,0.35)", borderRadius: 14, padding: "16px 18px" }}>
                <p style={{ color: T.text1, fontSize: 13, fontWeight: 700, margin: "0 0 6px" }}>Open in Chrome to sign in</p>
                <p style={{ color: T.text2, fontSize: 12, margin: "0 0 14px", lineHeight: 1.6 }}>Google sign-in does not work inside Messenger. Tap the button below to open this page in Chrome.</p>
                <button onClick={openInChrome} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "none", background: "#4285F4", color: "#FFF", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>
                  Open in Chrome
                </button>
                <p style={{ color: T.text3, fontSize: 10, margin: 0, textAlign: "center", lineHeight: 1.5 }}>Or copy and paste this URL into Chrome:</p>
                <p style={{ color: T.gold, fontSize: 10, margin: "4px 0 0", textAlign: "center", wordBreak: "break-all", fontWeight: 600 }}>{window.location.href}</p>
              </div>
            )}
            <button onClick={doGoogleLogin} disabled={signingIn || isInAppBrowser} style={{
              width: "100%", padding: "16px 20px", borderRadius: 14, border: `1px solid ${T.border}`, background: T.surface,
              color: T.text1, fontSize: 15, fontWeight: 600, cursor: (signingIn || isInAppBrowser) ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12, opacity: (signingIn || isInAppBrowser) ? 0.3 : 1,
              transition: "all 0.2s", boxShadow: T.cardShadow
            }}>
              <GoogleIcon />
              {signingIn ? "Signing in..." : "Sign in with Google"}
            </button>
            {(err || authError) && (<div style={{ color: T.err, fontSize: 12, textAlign: "center" }}>{authError || err}</div>)}
            <p style={{ color: T.text3, fontSize: 11, textAlign: "center", margin: 0 }}>Your Google account is used for login only.</p>
          </div>
        )}
      </div>
      <style>{`input::placeholder{color:${T.text3}} input:focus{border-color:${T.gold}!important;box-shadow:0 0 0 3px rgba(245,181,38,0.12)!important} button:active{transform:scale(0.97)}`}</style>
    </div>
  );
}

// ─── NO HOUSEHOLD SCREEN ───
// ─── MAIN APP ───
function MainApp({ user, householdId, householdRole, onLogout, theme, toggleTheme }) {
  const T = themes[theme];
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [tab, setTab] = useState("dashboard");
  const [expSub, setExpSub] = useState("list");
  const [accSub, setAccSub] = useState("accounts");
  const [sub, setSub] = useState("insights");
  const [exp, setExp] = useState([]);
  const [accts, setAccts] = useState([]);
  const [budgets, setBudgets] = useState(DEFAULT_BUDGETS);
  const [ld, setLd] = useState(true);
  const [sf, setSf] = useState(false);
  const [saf, setSaf] = useState(false);
  const [eId, setEId] = useState(null);
  const [eaId, setEaId] = useState(null);
  const [per, setPer] = useState("Monthly");
  const [cf, setCf] = useState("All");
  const [sq, setSq] = useState("");
  const [sd, setSd] = useState("desc");
  const [dc, setDc] = useState(null);
  const [dac, setDac] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ amount: "", category: "Food", description: "", date: td(), addedBy: user, accountId: "" });
  const [af, setAf] = useState({ name: "", balance: "", type: "savings" });
  const [msgs, setMsgs] = useState([{ role: "assistant", content: `Hey ${user}! Tell me what you spent and I'll log it. Upload a receipt or just type it out.` }]);
  const [ci, setCi] = useState("");
  const [cl, setCl] = useState(false);
  const [pe, setPe] = useState(null);
  const [att, setAtt] = useState(null); // attached image: {b64, name, type, preview}
  const cr = useRef(null);
  const fr = useRef(null);
  const [ip, setIp] = useState("Weekly");
  const [it, setIt] = useState(null);
  const [il, setIl] = useState(false);
  const [clr, setClr] = useState(false);
  const [sbf, setSbf] = useState(false);
  const [bf, setBf] = useState({});
  const [genBudget, setGenBudget] = useState(0);
  const [gbEdit, setGbEdit] = useState("");
  const [cgb, setCgb] = useState(false);
  const [cats, setCats] = useState(DEF_CATS);
  const [newCat, setNewCat] = useState("");
  const [delCat, setDelCat] = useState(null);
  const [rec, setRec] = useState([]);
  const [srf, setSrf] = useState(false);
  const [erId, setErId] = useState(null);
  const [rf, setRf] = useState({ amount: "", category: "Food", description: "", frequency: "monthly", nextDate: td() });
  const [drc, setDrc] = useState(null);
  const [debts, setDebts] = useState([]);
  const [dPays, setDPays] = useState([]);
  const [sdf, setSdf] = useState(false);
  const [edtId, setEdtId] = useState(null);
  const [ddf, setDdf] = useState({ name: "", type: "Credit Card", totalAmount: "", currentBalance: "", dueDate: "", interestRate: "", minPayment: "" });
  const [ddDc, setDdDc] = useState(null);
  const [spay, setSpay] = useState(null);
  const [payAmt, setPayAmt] = useState("");
  const [payDate, setPayDate] = useState(td());
  const [viewDt, setViewDt] = useState(null);
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);
  const [users, setUsers] = useState([user]);
  const tst = (m) => { setToast(m); setTimeout(() => setToast(null), 2500); };
  const catColors = (() => { let ei = 0; return cats.reduce((o, c) => { if (DEF_CCO[c]) { o[c] = DEF_CCO[c]; } else { o[c] = EXTRA_COLORS[ei % EXTRA_COLORS.length]; ei++; } return o; }, {}); })();

  const pillS = (a) => ({
    padding: isDesktop ? "8px 18px" : "7px 14px", borderRadius: 20, fontSize: isDesktop ? 12 : 11, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
    border: a ? `1px solid ${T.gold}` : `1px solid ${T.pillInactiveBorder}`,
    background: a ? T.goldMuted : T.pillInactiveBg, color: a ? T.gold : T.text3,
  });
  const cardS = { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 18, boxShadow: T.cardShadow };
  const inpS = { width: "100%", padding: isDesktop ? "14px 16px" : "12px 14px", borderRadius: 12, fontSize: isDesktop ? 15 : 14, outline: "none", boxSizing: "border-box", border: `1px solid ${T.inputBorder}`, background: T.inputBg, color: T.text1 };
  const btnP = { padding: isDesktop ? "15px 24px" : "14px 20px", borderRadius: 14, border: "none", cursor: "pointer", background: T.grad, color: theme === "dark" ? "#0C0C12" : "#FFF", fontSize: isDesktop ? 15 : 14, fontWeight: 700, boxShadow: "0 4px 16px rgba(245,181,38,0.2)" };
  const btnG = { padding: isDesktop ? "15px 24px" : "14px 20px", borderRadius: 14, cursor: "pointer", fontSize: isDesktop ? 15 : 14, fontWeight: 600, border: `1px solid ${T.inputBorder}`, background: "transparent", color: T.text2 };

  // Responsive content widths
  const mwDash = isDesktop ? 1100 : 600;
  const mwExp = isDesktop ? 800 : 600;
  const mwChat = isDesktop ? 720 : 600;
  const mwAcc = isDesktop ? 1100 : 600;
  const mwMore = isDesktop ? 1100 : 600;
  const switchTab = (id) => { setTab(id); if (id === "expenses") setExpSub("list"); if (id === "accounts") setAccSub("accounts"); if (id === "more") setSub("insights"); };

  useEffect(() => {
    (async () => {
      try {
        if (sbReady) {
          // ─── LOAD FROM SUPABASE ───
          const d = await sb.loadAll(householdId);
          if (d.expenses.length > 0) {
            setExp(d.expenses);
            if (d.accounts.length) setAccts(d.accounts);
            if (d.budgets) setBudgets(d.budgets);
            if (d.genBudget !== null) setGenBudget(d.genBudget);
            if (d.recurring.length) setRec(d.recurring);
            if (d.debts.length) setDebts(d.debts);
            if (d.debtPayments.length) setDPays(d.debtPayments);
            if (d.categories) setCats(d.categories);
            setLd(false); return;
          }
          // Supabase empty — try migrating localStorage data up
          try {
            const lsE = localStorage.getItem("expenses");
            if (lsE) {
              const lExp = JSON.parse(lsE);
              if (lExp.length > 0) {
                const lAccts = JSON.parse(localStorage.getItem("accounts") || "[]");
                const lRec = JSON.parse(localStorage.getItem("recurring") || "[]");
                const lCats = JSON.parse(localStorage.getItem("categories") || "null");
                const lBudgets = JSON.parse(localStorage.getItem("budgets") || "null");
                const lGenB = JSON.parse(localStorage.getItem("genBudget") || "null");
                const lPins = JSON.parse(localStorage.getItem("pins") || "null");
                await sb.migrate(lExp, lAccts, lRec, lCats || [], lBudgets, lGenB, lPins, householdId);
                setExp(lExp);
                if (lAccts.length) setAccts(lAccts);
                if (lBudgets) setBudgets(lBudgets);
                if (lGenB !== null) setGenBudget(lGenB);
                if (lRec.length) setRec(lRec);
                try { const lD = JSON.parse(localStorage.getItem("debts") || "[]"); if (lD.length) setDebts(lD); } catch {}
                try { const lDP = JSON.parse(localStorage.getItem("debtPayments") || "[]"); if (lDP.length) setDPays(lDP); } catch {}
                if (lCats && lCats.length) setCats(lCats);
                setLd(false); return;
              }
            }
          } catch {}
          // Nothing in localStorage either — seed
          setExp(SEED_EXP); setAccts(SEED_ACCT);
          await sb.upsertExpenses(SEED_EXP, householdId);
          await supabase.from("accounts").upsert(SEED_ACCT.map(a => ({ id: a.id, name: a.name, balance: a.balance, type: a.type, household_id: householdId, updated_at: a.updatedAt })));
          setLd(false); return;
        }
        // ─── FALLBACK: LOAD FROM LOCALSTORAGE ───
        const r = await localStore.get("expenses");
        if (r?.value) { const p = JSON.parse(r.value); if (p.length > 0) { setExp(p);
          try { const a = await localStore.get("accounts"); if (a?.value) setAccts(JSON.parse(a.value)); } catch {}
          try { const b = await localStore.get("budgets"); if (b?.value) setBudgets(JSON.parse(b.value)); } catch {}
          try { const g = await localStore.get("genBudget"); if (g?.value) setGenBudget(JSON.parse(g.value)); } catch {}
          try { const rc = await localStore.get("recurring"); if (rc?.value) setRec(JSON.parse(rc.value)); } catch {}
          try { const ct = await localStore.get("categories"); if (ct?.value) { const pc = JSON.parse(ct.value); if (Array.isArray(pc) && pc.length > 0) setCats(pc); } } catch {}
          try { const dt = await localStore.get("debts"); if (dt?.value) setDebts(JSON.parse(dt.value)); } catch {}
          try { const dtp = await localStore.get("debtPayments"); if (dtp?.value) setDPays(JSON.parse(dtp.value)); } catch {}
          setLd(false); return; } }
      } catch (e) { console.error(e); }
      setExp(SEED_EXP); setAccts(SEED_ACCT);
      try { await localStore.set("expenses", JSON.stringify(SEED_EXP)); await localStore.set("accounts", JSON.stringify(SEED_ACCT)); } catch {}
      setLd(false);
    })();
  }, [householdId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { cr.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, pe]);
  useEffect(() => {
    if (sbReady && householdId) {
      supabase.from("household_members").select("user_id").eq("household_id", householdId)
        .then(async ({ data: members }) => {
          if (!members?.length) return;
          const ids = members.map(m => m.user_id);
          const { data: profiles } = await supabase.from("profiles").select("display_name").in("id", ids);
          if (profiles?.length) setUsers(profiles.map(p => p.display_name).filter(Boolean));
        });
    }
  }, [householdId]);

  const svE = async (d, opts) => { setExp(d); try { if (sbReady) { if (opts?.deleteId) await sb.deleteExpense(opts.deleteId, householdId); else if (opts?.upsert) await sb.upsertExpense(opts.upsert, householdId); else if (opts?.upsertMany) await sb.upsertExpenses(opts.upsertMany, householdId); else await sb.upsertExpenses(d, householdId); } else await localStore.set("expenses", JSON.stringify(d)); } catch {} };
  const svA = async (d, opts) => { setAccts(d); try { if (sbReady) { if (opts?.deleteId) await sb.deleteAccount(opts.deleteId, householdId); else if (opts?.upsert) await sb.upsertAccount(opts.upsert, householdId); else await supabase.from("accounts").upsert(d.map(a => ({ id: a.id, name: a.name, balance: a.balance, type: a.type, household_id: householdId, updated_at: a.updatedAt }))); } else await localStore.set("accounts", JSON.stringify(d)); } catch {} };
  const svB = async (d) => { setBudgets(d); try { if (sbReady) await sb.saveSetting("budgets", d, householdId); else await localStore.set("budgets", JSON.stringify(d)); } catch {} };
  const svCats = async (d) => { setCats(d); try { if (sbReady) await sb.saveCategories(d, householdId); else await localStore.set("categories", JSON.stringify(d)); } catch {} };
  const doSubmit = () => {
    if (!form.amount || isNaN(parseFloat(form.amount))) return;
    const en = { id: eId || uid(), amount: parseFloat(parseFloat(form.amount).toFixed(2)), category: form.category, description: form.description.trim(), date: form.date || td(), addedBy: form.addedBy || user, accountId: form.accountId || null, createdAt: Date.now() };
    // Account balance adjustments
    let updAccts = [...accts];
    if (eId) {
      const old = exp.find(e => e.id === eId);
      if (old?.accountId) { const i = updAccts.findIndex(a => a.id === old.accountId); if (i >= 0) updAccts[i] = { ...updAccts[i], balance: updAccts[i].balance + old.amount, updatedAt: Date.now() }; }
    }
    if (en.accountId) { const i = updAccts.findIndex(a => a.id === en.accountId); if (i >= 0) updAccts[i] = { ...updAccts[i], balance: updAccts[i].balance - en.amount, updatedAt: Date.now() }; }
    if (JSON.stringify(updAccts) !== JSON.stringify(accts)) { const changed = updAccts.filter((a, i) => a !== accts[i]); changed.forEach(a => svA(updAccts, { upsert: a })); }
    if (eId) { svE(exp.map(e => e.id === eId ? en : e), { upsert: en }); tst("Updated"); } else { svE([en, ...exp], { upsert: en }); tst("Added"); }
    rstF();
  };
  const rstF = () => { setForm({ amount: "", category: "Food", description: "", date: td(), addedBy: user, accountId: "" }); setEId(null); setSf(false); };
  const edF = (e) => { setForm({ amount: String(e.amount), category: e.category, description: e.description, date: e.date, addedBy: e.addedBy, accountId: e.accountId || "" }); setEId(e.id); setSf(true); };
  const delE = (id) => {
    const del = exp.find(e => e.id === id);
    if (del?.accountId) { const acc = accts.find(a => a.id === del.accountId); if (acc) { const restored = { ...acc, balance: acc.balance + del.amount, updatedAt: Date.now() }; svA(accts.map(a => a.id === acc.id ? restored : a), { upsert: restored }); } }
    svE(exp.filter(e => e.id !== id), { deleteId: id }); setDc(null); tst("Deleted");
  };
  const doAcct = () => {
    if (!af.name.trim() || !af.balance || isNaN(parseFloat(af.balance))) return;
    const en = { id: eaId || uid(), name: af.name.trim(), balance: parseFloat(parseFloat(af.balance).toFixed(2)), type: af.type, updatedAt: Date.now() };
    if (eaId) { svA(accts.map(a => a.id === eaId ? en : a), { upsert: en }); tst("Account updated"); } else { svA([...accts, en], { upsert: en }); tst("Account added"); }
    rstAf();
  };
  const rstAf = () => { setAf({ name: "", balance: "", type: "savings" }); setEaId(null); setSaf(false); };
  const edA = (a) => { setAf({ name: a.name, balance: String(a.balance), type: a.type }); setEaId(a.id); setSaf(true); };
  const delA = (id) => { svA(accts.filter(a => a.id !== id), { deleteId: id }); setDac(null); tst("Account removed"); };
  const saveBudgets = () => { svB(bf); setSbf(false); tst("Budgets saved"); };
  const svGB = async (v) => { setGenBudget(v); try { if (sbReady) await sb.saveSetting("genBudget", v, householdId); else await localStore.set("genBudget", JSON.stringify(v)); } catch {} };
  const svR = async (d, opts) => { setRec(d); try { if (sbReady) { if (opts?.deleteId) await sb.deleteRecurring(opts.deleteId, householdId); else if (opts?.upsert) await sb.upsertRecurring(opts.upsert, householdId); else if (opts?.upsertMany) await sb.upsertRecurringBulk(opts.upsertMany, householdId); else await sb.upsertRecurringBulk(d, householdId); } else await localStore.set("recurring", JSON.stringify(d)); } catch {} };
  const svD = async (d, opts) => { setDebts(d); try { if (sbReady) { if (opts?.deleteId) await sb.deleteDebt(opts.deleteId, householdId); else if (opts?.upsert) await sb.upsertDebt(opts.upsert, householdId); } else await localStore.set("debts", JSON.stringify(d)); } catch {} };
  const svDP = async (d, opts) => { setDPays(d); try { if (sbReady) { if (opts?.upsert) await sb.upsertDebtPayment(opts.upsert, householdId); } else await localStore.set("debtPayments", JSON.stringify(d)); } catch {} };
  const doRec = () => {
    if (!rf.description.trim() || !rf.amount || isNaN(parseFloat(rf.amount))) return;
    const en = { id: erId || uid(), amount: parseFloat(parseFloat(rf.amount).toFixed(2)), category: rf.category, description: rf.description.trim(), frequency: rf.frequency, nextDate: rf.nextDate || td(), addedBy: user, createdAt: Date.now() };
    if (erId) { svR(rec.map(r => r.id === erId ? en : r), { upsert: en }); tst("Recurring updated"); } else { svR([...rec, en], { upsert: en }); tst("Recurring added"); }
    rstRf();
  };
  const rstRf = () => { setRf({ amount: "", category: "Food", description: "", frequency: "monthly", nextDate: td() }); setErId(null); setSrf(false); };
  const edRec = (r) => { setRf({ amount: String(r.amount), category: r.category, description: r.description, frequency: r.frequency, nextDate: r.nextDate }); setErId(r.id); setSrf(true); };
  const delRec = (id) => { svR(rec.filter(r => r.id !== id), { deleteId: id }); setDrc(null); tst("Recurring removed"); };
  const doDebt = () => {
    if (!ddf.name.trim() || !ddf.totalAmount || isNaN(parseFloat(ddf.totalAmount))) return;
    const en = { id: edtId || uid(), name: ddf.name.trim(), type: ddf.type, totalAmount: parseFloat(parseFloat(ddf.totalAmount).toFixed(2)), currentBalance: parseFloat(parseFloat(ddf.currentBalance || ddf.totalAmount).toFixed(2)), dueDate: parseInt(ddf.dueDate) || null, interestRate: parseFloat(ddf.interestRate) || 0, minPayment: parseFloat(ddf.minPayment) || 0, addedBy: user, createdAt: edtId ? (debts.find(d => d.id === edtId)?.createdAt || Date.now()) : Date.now(), updatedAt: Date.now() };
    if (edtId) { svD(debts.map(d => d.id === edtId ? en : d), { upsert: en }); tst("Debt updated"); } else { svD([...debts, en], { upsert: en }); tst("Debt added"); }
    rstDf();
  };
  const rstDf = () => { setDdf({ name: "", type: "Credit Card", totalAmount: "", currentBalance: "", dueDate: "", interestRate: "", minPayment: "" }); setEdtId(null); setSdf(false); };
  const edDebt = (d) => { setDdf({ name: d.name, type: d.type, totalAmount: String(d.totalAmount), currentBalance: String(d.currentBalance), dueDate: d.dueDate ? String(d.dueDate) : "", interestRate: String(d.interestRate || ""), minPayment: String(d.minPayment || "") }); setEdtId(d.id); setSdf(true); };
  const delDebt = (id) => {
    svD(debts.filter(d => d.id !== id), { deleteId: id });
    const newPays = dPays.filter(p => p.debtId !== id);
    svDP(newPays);
    setDdDc(null); if (viewDt === id) setViewDt(null); tst("Debt removed");
  };
  const doPayment = () => {
    if (!spay || !payAmt || isNaN(parseFloat(payAmt))) return;
    const amt = parseFloat(parseFloat(payAmt).toFixed(2));
    const debt = debts.find(d => d.id === spay);
    if (!debt) return;
    const newBal = Math.max(0, debt.currentBalance - amt);
    const payment = { id: uid(), debtId: spay, amount: amt, date: payDate || td(), newBalance: newBal, createdAt: Date.now() };
    const updDebt = { ...debt, currentBalance: newBal, updatedAt: Date.now() };
    svD(debts.map(d => d.id === spay ? updDebt : d), { upsert: updDebt });
    svDP([payment, ...dPays], { upsert: payment });
    setSpay(null); setPayAmt(""); setPayDate(td());
    tst(`Payment of ${fmt(amt)} recorded`);
  };
  const applyRec = () => {
    const today = td();
    const due = rec.filter(r => r.nextDate <= today);
    if (!due.length) { tst("No recurring expenses due"); return; }
    const newExp = due.map(r => ({ id: uid(), amount: r.amount, category: r.category, description: r.description, date: today, addedBy: r.addedBy || user, createdAt: Date.now() }));
    svE([...newExp, ...exp], { upsertMany: newExp });
    const updated = rec.map(r => {
      if (r.nextDate > today) return r;
      const d = new Date(r.nextDate + "T00:00:00");
      if (r.frequency === "weekly") d.setDate(d.getDate() + 7);
      else if (r.frequency === "yearly") d.setFullYear(d.getFullYear() + 1);
      else d.setMonth(d.getMonth() + 1);
      const nd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return { ...r, nextDate: nd };
    });
    const changedRec = updated.filter((r, i) => r.nextDate !== rec[i]?.nextDate);
    svR(updated, { upsertMany: changedRec });
    tst(`Applied ${due.length} recurring expense${due.length > 1 ? "s" : ""}`);
  };
  const exportCSV = () => {
    const h = "Date,Description,Category,Amount,Added By\n";
    const r = [...exp].sort((a, b) => a.date.localeCompare(b.date)).map(e => `${e.date},"${(e.description || "").replace(/"/g, '""')}",${e.category},${e.amount},${e.addedBy}`).join("\n");
    const b = new Blob([h + r], { type: "text/csv" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "expenses.csv"; a.click(); URL.revokeObjectURL(u);
  };
  const clearAll = async () => { setExp([]); setAccts([]); setRec([]); setDebts([]); setDPays([]); setGenBudget(0); setCats(DEF_CATS); setBudgets(DEFAULT_BUDGETS); try { if (sbReady) { await Promise.all([sb.deleteAllExpenses(householdId), sb.deleteAllAccounts(householdId), sb.deleteAllRecurring(householdId), sb.deleteAllDebts(householdId), sb.saveCategories(DEF_CATS, householdId), sb.saveSetting("budgets", DEFAULT_BUDGETS, householdId), sb.saveSetting("genBudget", 0, householdId)]); } else { await localStore.set("expenses", JSON.stringify([])); await localStore.set("accounts", JSON.stringify([])); await localStore.set("recurring", JSON.stringify([])); await localStore.set("debts", JSON.stringify([])); await localStore.set("debtPayments", JSON.stringify([])); await localStore.set("genBudget", JSON.stringify(0)); await localStore.set("categories", JSON.stringify(DEF_CATS)); await localStore.set("budgets", JSON.stringify(DEFAULT_BUDGETS)); } } catch {} setClr(false); tst("All data cleared"); };

  const generateInvite = async () => {
    if (!sbReady || !householdId) return;
    // Check for existing unused invite
    const { data: existing } = await supabase.from("invites").select("*").eq("household_id", householdId).eq("used", false).gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false }).limit(1);
    if (existing?.length) {
      setInviteLink(`${window.location.origin}/invite/${existing[0].token}`);
    } else {
      const { data: inv } = await supabase.from("invites").insert({ household_id: householdId, created_by: supabase.auth.getUser ? (await supabase.auth.getUser()).data.user?.id : null }).select().single();
      if (inv) setInviteLink(`${window.location.origin}/invite/${inv.token}`);
    }
    setInviteCopied(false);
    setInviteModal(true);
  };

  const copyInvite = () => { navigator.clipboard.writeText(inviteLink).then(() => { setInviteCopied(true); setTimeout(() => setInviteCopied(false), 2000); }); };

  const SYS = `You are an expense tracker assistant for a couple (${users.join(" and ")}). Currency: PHP (Philippine Peso).
RESPOND ONLY WITH VALID JSON. No markdown, no backticks. Today: ${td()}. Current user: ${user}.
Format: {"expenses":[{"amount":number,"category":"${cats.join("|")}","description":"text","date":"YYYY-MM-DD"}],"message":"confirmation text, NO emojis"}
Not expenses: {"expenses":[],"message":"response, NO emojis"}
Rules: No emojis. If no date mentioned use today. Parse commas/newlines as multiple. Categories: ${cats.join(", ")}. If unsure pick "Other". gas/grab/angkas=Transport. food/jollibee/grocery/coffee=Food. netflix/spotify=Subscriptions. meralco/pldt/water=Bills.`;
  const callAI = async (m, s, ret = 2) => {
    for (let i = 0; i <= ret; i++) {
      try {
        const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: s, messages: m }) });
        if (r.status === 429 || r.status >= 500) { if (i < ret) { await new Promise(rs => setTimeout(rs, 1500 * (i + 1))); continue; } }
        if (!r.ok) return `{"expenses":[],"message":"API error ${r.status}."}`;
        const d = await r.json(); return d.content?.map(b => b.text || "").filter(Boolean).join("") || '{"expenses":[],"message":"No response."}';
      } catch { if (i < ret) { await new Promise(rs => setTimeout(rs, 1500 * (i + 1))); continue; } return '{"expenses":[],"message":"Connection error."}'; }
    }
  };
  const parseR = (t) => {
    try { let c = t.replace(/```json|```/g, "").trim(); const m = c.match(/\{[\s\S]*\}/); if (m) { const p = JSON.parse(m[0]); return { expenses: (p.expenses || []).map(e => ({ ...e, category: cats.includes(e.category) ? e.category : "Other", date: e.date || td() })), message: p.message || "" }; } return { expenses: [], message: t.slice(0, 300) }; }
    catch { if (t && !t.startsWith("{")) return { expenses: [], message: t.slice(0, 300) }; return { expenses: [], message: "Could not parse." }; }
  };
  const doChat = async () => {
    const hasText = ci.trim(); const hasImg = !!att;
    if ((!hasText && !hasImg) || cl) return;
    const m = ci.trim(); setCi(""); const img = att; setAtt(null); setCl(true);
    if (img) { if (img.preview) URL.revokeObjectURL(img.preview); }
    const label = img ? (m ? `[Receipt: ${img.name}] ${m}` : `[Receipt: ${img.name}]`) : m;
    setMsgs(v => [...v, { role: "user", content: label }]);
    try {
      let content;
      if (img) {
        const parts = [{ type: "image", source: { type: "base64", media_type: img.type, data: img.b64 } }, { type: "text", text: m || "Extract all items and totals from this receipt. Return as expenses JSON." }];
        content = [{ role: "user", content: parts }];
      } else { content = [{ role: "user", content: m }]; }
      const raw = await callAI(content, SYS); const p = parseR(raw); const t = stripE(p.message || "Done.");
      if (p.expenses?.length > 0) setPe(p.expenses.map(e => ({ ...e, id: uid(), addedBy: user, createdAt: Date.now() })));
      setMsgs(v => [...v, { role: "assistant", content: t }]);
    } catch { setMsgs(v => [...v, { role: "assistant", content: "Something went wrong." }]); }
    setCl(false);
  };
  const doImg = async (ev) => {
    const file = ev.target.files?.[0]; if (!file) return;
    try {
      const b64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = () => rej("fail"); r.readAsDataURL(file); });
      setAtt({ b64, name: file.name, type: file.type || "image/jpeg", preview: URL.createObjectURL(file) });
    } catch { tst("Failed to read image."); }
    if (fr.current) fr.current.value = "";
  };
  const [editIdx, setEditIdx] = useState(null); // index of entry being edited
  const [editForm, setEditForm] = useState(null); // temp edit values
  const confirmAll = () => { if (!pe || !pe.length) return; svE([...pe, ...exp], { upsertMany: pe }); const sum = pe.map(e => `  ${e.description || e.category} (${e.category}) - ${fmt(e.amount)}`).join("\n"); setMsgs(v => [...v, { role: "assistant", content: `Saved ${pe.length} expenses:\n${sum}\nTotal: ${fmt(pe.reduce((s, e) => s + e.amount, 0))}` }]); tst(`${pe.length} added`); setPe(null); setEditIdx(null); };
  const rejectAll = () => { const n = pe?.length || 0; setPe(null); setEditIdx(null); setMsgs(v => [...v, { role: "assistant", content: `Discarded all ${n} expenses. No changes were saved.` }]); };
  const saveSingle = (i) => { if (!pe) return; const e = pe[i]; svE([e, ...exp], { upsert: e }); setMsgs(v => [...v, { role: "assistant", content: `Saved: ${e.description || e.category} (${e.category}) - ${fmt(e.amount)} on ${e.date}` }]); tst(`Saved: ${e.description || e.category}`); const rest = pe.filter((_, j) => j !== i); setPe(rest.length ? rest : null); if (editIdx === i) { setEditIdx(null); setEditForm(null); } };
  const discardSingle = (i) => { if (!pe) return; const e = pe[i]; setMsgs(v => [...v, { role: "assistant", content: `Discarded: ${e.description || e.category} (${e.category}) - ${fmt(e.amount)}` }]); const rest = pe.filter((_, j) => j !== i); setPe(rest.length ? rest : null); if (editIdx === i) { setEditIdx(null); setEditForm(null); } };
  const startEdit = (i) => { setEditIdx(i); setEditForm({ ...pe[i] }); };
  const cancelEdit = () => { setEditIdx(null); setEditForm(null); };
  const applyEdit = (i) => { if (!editForm) return; const u = [...pe]; u[i] = { ...editForm, amount: parseFloat(editForm.amount) || 0 }; setPe(u); setEditIdx(null); setEditForm(null); };
  const applyAndSave = (i) => { if (!editForm) return; const e = { ...editForm, amount: parseFloat(editForm.amount) || 0 }; svE([e, ...exp], { upsert: e }); setMsgs(v => [...v, { role: "assistant", content: `Saved: ${e.description || e.category} (${e.category}) - ${fmt(e.amount)} on ${e.date}` }]); tst(`Saved: ${e.description || e.category}`); const rest = (pe || []).filter((_, j) => j !== i); setPe(rest.length ? rest : null); setEditIdx(null); setEditForm(null); };
  const findDup = (e) => { const desc = (e.description || "").toLowerCase(); const amt = e.amount; return exp.find(x => x.category === e.category && Math.abs(x.amount - amt) / (amt || 1) <= 0.1 && desc && (x.description || "").toLowerCase().includes(desc.toLowerCase().split(" ")[0])); };
  const genIns = async () => {
    const ps = startOf(ip); const rel = exp.filter(e => pld(e.date) >= ps);
    if (!rel.length) { setIt({ error: "No expenses for this period." }); return; }
    setIl(true); setIt(null);
    const tot = rel.reduce((s, e) => s + e.amount, 0);
    const bc = rel.reduce((a, e) => { a[e.category] = (a[e.category] || 0) + e.amount; return a; }, {});
    const bp = rel.reduce((a, e) => { a[e.addedBy] = (a[e.addedBy] || 0) + e.amount; return a; }, {});
    const [pS, pE] = prevRange(ip); const pT = exp.filter(e => { const d = pld(e.date); return d >= pS && d < pE; }).reduce((s, e) => s + e.amount, 0);
    const t5x = [...rel].sort((a, b) => b.amount - a.amount).slice(0, 5);
    const bStr = Object.entries(budgets).map(([c, v]) => `- ${c}: Budget PHP ${v}, Spent PHP ${(bc[c] || 0).toFixed(0)}`).join("\n");
    const sum = `${ip.toUpperCase()} REVIEW:\nTotal: PHP ${tot.toFixed(2)}\nPrev: PHP ${pT.toFixed(2)}\nBy category:\n${Object.entries(bc).map(([c, v]) => `- ${c}: PHP ${v.toFixed(0)}`).join("\n")}\nBy person:\n${Object.entries(bp).map(([p, v]) => `- ${p}: PHP ${v.toFixed(0)}`).join("\n")}\nTop 5:\n${t5x.map(e => `- ${e.description}: PHP ${e.amount}`).join("\n")}\nBudgets:\n${bStr}`;
    const IS = `You are ${users.join(" and ")}'s personal finance advisor. Filipino couple. No emojis. Respond ONLY with valid JSON (no markdown, no code fences). Format: {"overview":"1-2 sentence summary","categoryAnalysis":"2-3 sentences about category spending","patterns":"2-3 sentences about spending patterns or habits","tips":["tip 1","tip 2","tip 3"]}. Each tip should be specific and actionable with numbers. Keep it concise.`;
    try {
      const raw = await callAI([{ role: "user", content: sum }], IS);
      const clean = stripE(raw || "");
      let parsed;
      try { parsed = JSON.parse(clean); } catch { const m = clean.match(/\{[\s\S]*\}/); parsed = m ? JSON.parse(m[0]) : null; }
      const data = { bc, bp, tot, pT, t5x, period: ip, count: rel.length };
      if (parsed && parsed.overview) { setIt({ ...parsed, data }); } else { setIt({ overview: clean, categoryAnalysis: "", patterns: "", tips: [], data }); }
    } catch { setIt({ error: "Failed to generate insights." }); }
    setIl(false);
  };

  // Filtering
  const ps = startOf(per);
  const filt = exp.filter(e => per === "All" || pld(e.date) >= ps).filter(e => cf === "All" || e.category === cf).filter(e => !sq || (e.description || "").toLowerCase().includes(sq.toLowerCase()));
  const sorted = [...filt].sort((a, b) => sd === "desc" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
  const totF = filt.reduce((s, e) => s + e.amount, 0);
  const byCat = filt.reduce((a, e) => { a[e.category] = (a[e.category] || 0) + e.amount; return a; }, {});
  const [prS, prE] = prevRange(per);
  const prTot = exp.filter(e => { const d = pld(e.date); return d >= prS && d < prE; }).reduce((s, e) => s + e.amount, 0);
  const pct = prTot > 0 ? ((totF - prTot) / prTot * 100) : 0;
  const byP = filt.reduce((a, e) => { a[e.addedBy] = (a[e.addedBy] || 0) + e.amount; return a; }, {});
  const dm = {}; filt.forEach(e => { dm[e.date] = (dm[e.date] || 0) + e.amount; });
  const dT = Object.entries(dm).sort((a, b) => a[0].localeCompare(b[0])).map(([d, v]) => ({ date: d.slice(5), amount: v }));
  const pieD = Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([n, v]) => ({ name: n, value: v }));
  const t5 = [...filt].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const cBar = Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([n, v]) => ({ name: n.slice(0, 5), full: n, value: v }));
  const totA = accts.reduce((s, a) => s + a.balance, 0);
  const mStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const mExp = exp.filter(e => pld(e.date) >= mStart);
  const mByCat = mExp.reduce((a, e) => { a[e.category] = (a[e.category] || 0) + e.amount; return a; }, {});
  const mTot = mExp.reduce((s, e) => s + e.amount, 0);
  const gbPct = genBudget > 0 ? (mTot / genBudget) * 100 : 0;
  const budgetChart = cats.map(c => ({ name: c.slice(0, 5), full: c, budget: budgets[c] || 0, actual: mByCat[c] || 0 })).filter(d => d.budget > 0 || d.actual > 0);

  const CTipLocal = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (<div style={{ background: T.modalSurface, border: `1px solid ${T.borderStrong}`, borderRadius: 12, padding: "10px 14px", fontSize: 12, boxShadow: T.glow }}>
      <div style={{ color: T.text3, marginBottom: 4, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color || T.text1, fontWeight: 600 }}>{p.name}: {fmt(p.value)}</div>)}
    </div>);
  };

  if (ld) return <div style={{ minHeight: "100vh", background: T.gradBg, display: "flex", justifyContent: "center", alignItems: "center", color: T.gold }}>Loading...</div>;

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: PieChart },
    { id: "expenses", label: "Expenses", icon: LayoutDashboard },
    { id: "chat", label: "AI Chat", icon: MessageSquare },
    { id: "accounts", label: "Accounts", icon: Wallet },
    { id: "more", label: "More", icon: Settings }
  ];

  const mOvS = { position: "fixed", inset: 0, background: T.modalBg, zIndex: 999, display: "flex", justifyContent: "center", alignItems: "center", padding: isDesktop ? 40 : 20, backdropFilter: "blur(4px)" };
  const mInS = { background: T.modalSurface, border: `1px solid ${T.borderStrong}`, borderRadius: 24, padding: isDesktop ? 36 : 28, width: "100%", maxWidth: isDesktop ? 480 : 400, boxShadow: "0 24px 64px rgba(0,0,0,0.3)" };

  return (
    <div style={{ minHeight: "100vh", background: T.gradBg, color: T.text1, display: "flex", flexDirection: isDesktop ? "row" : "column", fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      {toast && <div style={{ position: "fixed", top: 20, left: isDesktop ? "calc(50% + 120px)" : "50%", transform: "translateX(-50%)", background: T.toastBg, border: `1px solid ${T.toastBorder}`, color: T.gold, padding: "12px 24px", borderRadius: 14, fontSize: 13, fontWeight: 600, zIndex: 9999, boxShadow: "0 8px 32px rgba(245,181,38,0.15)", display: "flex", alignItems: "center", gap: 8 }}><Check size={16} />{toast}</div>}

      {/* Desktop Sidebar */}
      {isDesktop && (
        <div style={{ width: 250, height: "100vh", background: T.surface, borderRight: `1px solid ${T.border}`, padding: "28px 0", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, alignSelf: "flex-start", boxSizing: "border-box" }}>
          <div style={{ padding: "0 24px", marginBottom: 36 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: T.text1, letterSpacing: -0.5 }}>Expense<span style={{ color: T.gold }}>Tracker</span></h1>
            <p style={{ color: T.text3, fontSize: 11, margin: "4px 0 0" }}>Logged in as <span style={{ color: T.gold }}>{user}</span></p>
          </div>
          {tabs.map(t => {
            const I = t.icon;
            const a = tab === t.id;
            return (
              <button key={t.id} onClick={() => switchTab(t.id)} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 24px", margin: "2px 10px",
                borderRadius: 12, border: "none", cursor: "pointer",
                background: a ? T.goldMuted : "transparent",
                color: a ? T.gold : T.text2,
                fontSize: 13, fontWeight: a ? 700 : 500,
                textAlign: "left", width: "calc(100% - 20px)",
                transition: "all 0.2s", position: "relative",
              }}>
                {a && <div style={{ position: "absolute", left: 0, width: 3, height: 24, borderRadius: "0 2px 2px 0", background: T.gold }} />}
                <I size={18} />{t.label}
              </button>
            );
          })}
          <div style={{ marginTop: "auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={toggleTheme} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, border: `1px solid ${T.border}`, background: "transparent", color: T.text2, cursor: "pointer", fontSize: 12, fontWeight: 600, width: "100%" }}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, border: `1px solid ${T.border}`, background: "transparent", color: T.text2, cursor: "pointer", fontSize: 12, fontWeight: 600, width: "100%" }}>
              <LogOut size={16} />Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", ...(isDesktop ? { overflowY: "auto", maxHeight: "100vh" } : {}) }}>

        {/* Mobile Header */}
        {!isDesktop && (
          <div style={{ padding: "18px 20px 0", maxWidth: 600, margin: "0 auto", width: "100%", boxSizing: "border-box", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: T.text1, letterSpacing: -0.5 }}>Expense<span style={{ color: T.gold }}>Tracker</span></h1>
              <p style={{ color: T.text3, fontSize: 11, margin: "2px 0 0" }}>Logged in as <span style={{ color: T.gold }}>{user}</span></p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={toggleTheme} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 8, color: T.text2, cursor: "pointer", display: "flex", alignItems: "center" }}>
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button onClick={onLogout} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 12px", color: T.text2, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontWeight: 600 }}><LogOut size={13} />Logout</button>
            </div>
          </div>
        )}

        {/* Mobile Tabs */}
        {!isDesktop && (
          <div style={{ maxWidth: 600, margin: "14px auto 0", padding: "0 20px", width: "100%", boxSizing: "border-box" }}>
            <div style={{ display: "flex", gap: 2, background: T.surface, borderRadius: 16, padding: 4, border: `1px solid ${T.border}` }}>
              {tabs.map(t => { const I = t.icon; const a = tab === t.id;
                return <button key={t.id} onClick={() => switchTab(t.id)} style={{ flex: 1, padding: "10px 4px", borderRadius: 12, border: "none", background: a ? T.goldMuted : "transparent", color: a ? T.gold : T.text3, fontSize: 10, fontWeight: 700, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, position: "relative" }}><I size={16} />{t.label}{a && <div style={{ position: "absolute", bottom: 2, width: 16, height: 2, borderRadius: 1, background: T.gold }} />}</button>;
              })}
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div style={{ flex: 1, maxWidth: mwDash, margin: "0 auto", padding: isDesktop ? "28px 36px 40px" : "18px 20px 80px", width: "100%", boxSizing: "border-box", overflowY: "auto" }}>
            {accts.length > 0 && (
              <div style={{ background: `linear-gradient(135deg,${theme === "dark" ? "rgba(52,211,153,0.08)" : "rgba(5,150,105,0.06)"},transparent)`, border: `1px solid ${theme === "dark" ? "rgba(52,211,153,0.15)" : "rgba(5,150,105,0.15)"}`, borderRadius: 18, padding: "16px 18px", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Total Balance</div><div style={{ fontSize: 26, fontWeight: 800, color: T.ok, marginTop: 2 }}>{fmt(totA)}</div></div>
                <Wallet size={26} style={{ color: "rgba(245,181,38,0.25)" }} />
              </div>
            )}
            <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>{PERIODS.filter(p => p !== "All").map(p => <button key={p} onClick={() => setPer(p)} style={pillS(per === p)}>{p}</button>)}</div>

            <div style={{ background: `linear-gradient(135deg,${T.goldMuted},transparent)`, border: `1px solid ${T.borderStrong}`, borderRadius: 22, padding: 24, marginBottom: 18, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(245,181,38,0.06)" }} />
              <div style={{ fontSize: 11, color: T.text2, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{per} Spending</div>
              <div style={{ fontSize: isDesktop ? 48 : 42, fontWeight: 800, marginTop: 6, letterSpacing: -2, color: T.text1 }}>{fmt(totF)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: pct > 0 ? T.err : T.ok, fontSize: 13, fontWeight: 700, background: pct > 0 ? "rgba(239,68,68,0.1)" : "rgba(52,211,153,0.1)", padding: "4px 10px", borderRadius: 8 }}>
                  {pct > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{Math.abs(pct).toFixed(1)}%
                </div>
                <span style={{ color: T.text3, fontSize: 11 }}>vs prev {per.toLowerCase()}</span>
              </div>
            </div>

            {genBudget > 0 && (
              <div style={{ ...cardS, padding: "18px 20px", marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Monthly Budget</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: gbPct > 100 ? T.err : gbPct > 80 ? T.goldLight : T.ok }}>{gbPct.toFixed(0)}%</div>
                </div>
                <div style={{ height: 10, borderRadius: 5, background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 5, width: `${Math.min(100, gbPct)}%`, background: gbPct > 100 ? T.err : gbPct > 80 ? T.goldLight : T.ok, transition: "width 0.3s" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: T.text3 }}>{fmt(mTot)} spent</span>
                  <span style={{ fontSize: 11, color: T.text3 }}>{fmt(genBudget)} limit</span>
                </div>
                {gbPct > 80 && gbPct <= 100 && <div style={{ fontSize: 11, color: T.goldLight, fontWeight: 600, marginTop: 6 }}>Approaching budget limit</div>}
                {gbPct > 100 && <div style={{ fontSize: 11, color: T.err, fontWeight: 600, marginTop: 6 }}>Over budget by {fmt(mTot - genBudget)}</div>}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              {Object.entries(byP).map(([n, a]) => (<div key={n} style={cardS}><div style={{ fontSize: 11, color: T.text2, fontWeight: 600 }}>{n}</div><div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{fmt(a)}</div><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>{totF > 0 ? (a / totF * 100).toFixed(0) : 0}% of total</div></div>))}
            </div>

            {/* Charts grid — 2 cols on desktop, stacked on mobile */}
            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 18 }}>
              {pieD.length > 0 && (<div style={{ ...cardS }}><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>By Category</div>
                <ResponsiveContainer width="100%" height={isDesktop ? 260 : 200}><RPie><Pie data={pieD} cx="50%" cy="50%" innerRadius={isDesktop ? 65 : 55} outerRadius={isDesktop ? 100 : 85} dataKey="value" stroke="none">{pieD.map((_, i) => <Cell key={i} fill={catColors[pieD[i].name] || T.text3} />)}</Pie><Tooltip content={<CTipLocal />} /></RPie></ResponsiveContainer>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: 10 }}>{pieD.map((d, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}><div style={{ width: 8, height: 8, borderRadius: 3, background: catColors[d.name] || T.text3 }} /><span style={{ color: T.text2 }}>{d.name}: {fmt(d.value)}</span></div>)}</div>
              </div>)}

              {cBar.length > 0 && (<div style={{ ...cardS }}><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Category Breakdown</div>
                <ResponsiveContainer width="100%" height={isDesktop ? 260 : 180}><BarChart data={cBar}><XAxis dataKey="name" tick={{ fill: T.text3, fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: T.text3, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtS} /><Tooltip content={<CTipLocal />} /><Bar dataKey="value" radius={[8, 8, 0, 0]}>{cBar.map((d, i) => <Cell key={i} fill={catColors[d.full] || T.gold} />)}</Bar></BarChart></ResponsiveContainer>
              </div>)}

              {dT.length > 1 && (<div style={{ ...cardS }}><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Spending Trend</div>
                <ResponsiveContainer width="100%" height={isDesktop ? 260 : 160}><LineChart data={dT}><CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"} /><XAxis dataKey="date" tick={{ fill: T.text3, fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: T.text3, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtS} /><Tooltip content={<CTipLocal />} /><Line type="monotone" dataKey="amount" stroke={T.gold} strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer>
              </div>)}

              {budgetChart.length > 0 && (<div style={{ ...cardS }}><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Budget vs Actual</div>
                <ResponsiveContainer width="100%" height={isDesktop ? 260 : 200}><BarChart data={budgetChart}><XAxis dataKey="name" tick={{ fill: T.text3, fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: T.text3, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtS} /><Tooltip content={<CTipLocal />} /><Legend wrapperStyle={{ fontSize: 10, color: T.text2 }} /><Bar dataKey="budget" fill={theme === "dark" ? "rgba(245,181,38,0.2)" : "rgba(212,155,31,0.15)"} radius={[6, 6, 0, 0]} name="Budget" /><Bar dataKey="actual" radius={[6, 6, 0, 0]} name="Actual">{budgetChart.map((d, i) => <Cell key={i} fill={d.actual > d.budget ? T.err : d.actual > d.budget * 0.8 ? T.goldLight : T.ok} />)}</Bar></BarChart></ResponsiveContainer>
              </div>)}
            </div>

            {t5.length > 0 && (<div style={{ ...cardS, marginTop: 18 }}><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Top 5 Expenses</div>
              {t5.map((e, i) => (<div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < t5.length - 1 ? `1px solid ${T.border}` : "none" }}><div><div style={{ fontSize: 13, fontWeight: 600 }}>{e.description || e.category}</div><div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>{e.date} -- {e.addedBy}{e.accountId ? ` -- ${accts.find(a => a.id === e.accountId)?.name || ""}` : ""}</div></div><div style={{ fontSize: 15, fontWeight: 800, color: catColors[e.category] || T.gold }}>{fmt(e.amount)}</div></div>))}
            </div>)}
          </div>
        )}

        {/* EXPENSES */}
        {tab === "expenses" && (
          <div style={{ flex: 1, maxWidth: mwExp, margin: "0 auto", padding: isDesktop ? "28px 36px 40px" : "18px 20px 80px", width: "100%", boxSizing: "border-box", overflowY: "auto" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
              {["list", "recurring"].map(s => <button key={s} onClick={() => setExpSub(s)} style={pillS(expSub === s)}>{s === "list" ? "List" : "Recurring"}</button>)}
            </div>
            {expSub === "list" && (<>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>Expenses</div>
                <button onClick={() => { rstF(); setSf(true); }} style={{ ...btnP, padding: "10px 16px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><Plus size={14} />Add</button>
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>{PERIODS.map(p => <button key={p} onClick={() => setPer(p)} style={pillS(per === p)}>{p}</button>)}</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                <div style={{ flex: 1, position: "relative" }}><Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.text3 }} /><input placeholder="Search..." value={sq} onChange={e => setSq(e.target.value)} style={{ ...inpS, paddingLeft: 32, fontSize: 12 }} /></div>
                <select value={cf} onChange={e => setCf(e.target.value)} style={{ ...inpS, width: "auto", fontSize: 12, minWidth: 80 }}><option value="All">All</option>{cats.map(c => <option key={c} value={c}>{c}</option>)}</select>
              </div>
              <div style={{ fontSize: 11, color: T.text3, marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
                <span>{filt.length} expenses -- {fmt(totF)}</span>
                <button onClick={() => setSd(v => v === "desc" ? "asc" : "desc")} style={{ background: "none", border: "none", color: T.gold, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontWeight: 600 }}><ChevronDown size={12} />{sd === "desc" ? "Newest" : "Oldest"}</button>
              </div>
              {sorted.map(e => (
                <div key={e.id} style={{ ...cardS, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
                  <div style={{ flex: 1 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: 3, background: catColors[e.category] || T.text3 }} /><div style={{ fontSize: 13, fontWeight: 600 }}>{e.description || e.category}</div></div><div style={{ fontSize: 10, color: T.text3, marginTop: 4, marginLeft: 16 }}>{e.date} -- {e.addedBy} -- {e.category}{e.accountId ? ` -- ${accts.find(a => a.id === e.accountId)?.name || ""}` : ""}</div></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ fontSize: 15, fontWeight: 800 }}>{fmt(e.amount)}</div><button onClick={() => edF(e)} style={{ background: "none", border: "none", color: T.gold, cursor: "pointer", padding: 4 }}><Edit3 size={14} /></button><button onClick={() => setDc(e.id)} style={{ background: "none", border: "none", color: T.err, cursor: "pointer", padding: 4 }}><Trash2 size={14} /></button></div>
                </div>
              ))}
              {filt.length === 0 && <div style={{ textAlign: "center", color: T.text3, padding: 40, fontSize: 13 }}>No expenses found</div>}
            </>)}
            {expSub === "recurring" && (<>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><Repeat size={18} />Recurring Expenses</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={applyRec} style={{ ...btnG, padding: "10px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 5, borderColor: T.ok, color: T.ok }}><Check size={14} />Apply Due</button>
                  <button onClick={() => { rstRf(); setSrf(true); }} style={{ ...btnP, padding: "10px 16px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><Plus size={14} />Add</button>
                </div>
              </div>
              {rec.length === 0 && <div style={{ ...cardS, textAlign: "center", padding: 28, color: T.text3, fontSize: 13 }}>No recurring expenses yet. Add templates for bills you pay regularly.</div>}
              <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 8 }}>
                {rec.map(r => {
                  const isDue = r.nextDate <= td();
                  return (
                  <div key={r.id} style={{ ...cardS, padding: "14px 16px", borderColor: isDue ? T.ok : T.border }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{r.description}</div>
                        <div style={{ fontSize: 10, color: T.text3, marginTop: 3 }}>
                          <span style={{ background: catColors[r.category] || T.text3, color: "#fff", padding: "1px 6px", borderRadius: 4, fontSize: 9, fontWeight: 600 }}>{r.category}</span>
                          {" "}{r.frequency} / Next: {r.nextDate}
                        </div>
                        {isDue && <div style={{ fontSize: 10, color: T.ok, fontWeight: 600, marginTop: 4 }}>Due now</div>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: T.gold }}>{fmt(r.amount)}</div>
                        <button onClick={() => edRec(r)} style={{ background: "none", border: "none", color: T.gold, cursor: "pointer", padding: 4 }}><Edit3 size={14} /></button>
                        <button onClick={() => setDrc(r.id)} style={{ background: "none", border: "none", color: T.err, cursor: "pointer", padding: 4 }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                ); })}
              </div>
            </>)}
          </div>
        )}

        {/* AI CHAT */}
        {tab === "chat" && (
          <div style={{ flex: 1, maxWidth: mwChat, margin: "0 auto", padding: isDesktop ? "28px 36px 20px" : "18px 20px", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto", marginBottom: 14 }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                  <div style={{ maxWidth: isDesktop ? "65%" : "82%", padding: "12px 16px", borderRadius: 16, background: m.role === "user" ? T.chatUser : T.chatBot, border: m.role === "user" ? "none" : `1px solid ${T.chatBotBorder}`, color: m.role === "user" ? T.chatUserText : T.text1, fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", fontWeight: m.role === "user" ? 600 : 400 }}>{m.content}</div>
                </div>
              ))}
              {cl && <div style={{ display: "flex", marginBottom: 10 }}><div style={{ padding: "12px 16px", borderRadius: 16, background: T.chatBot, border: `1px solid ${T.chatBotBorder}`, color: T.gold, fontSize: 13 }}>Thinking...</div></div>}
              {pe && pe.length > 0 && (
                <div style={{ ...cardS, marginBottom: 10, borderColor: T.borderStrong }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.gold }}>{pe.length} expense{pe.length > 1 ? "s" : ""} found</div>
                    {pe.length > 1 && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={confirmAll} style={{ ...btnP, padding: "7px 14px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><Check size={12} />Save All</button>
                        <button onClick={rejectAll} style={{ ...btnG, padding: "7px 14px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><X size={12} />Discard All</button>
                      </div>
                    )}
                  </div>
                  {pe.map((e, i) => { const dup = findDup(e); return (
                    <div key={e.id} style={{ padding: 12, marginBottom: i < pe.length - 1 ? 8 : 0, background: theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderRadius: 12, border: `1px solid ${dup ? T.err : T.border}` }}>
                      {editIdx === i && editForm ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <input value={editForm.description} onChange={ev => setEditForm({ ...editForm, description: ev.target.value })} placeholder="Description" style={{ ...inpS, padding: "8px 10px", fontSize: 12 }} />
                          <div style={{ display: "flex", gap: 8 }}>
                            <input type="number" value={editForm.amount} onChange={ev => setEditForm({ ...editForm, amount: ev.target.value })} placeholder="Amount" style={{ ...inpS, flex: 1, padding: "8px 10px", fontSize: 12 }} />
                            <select value={editForm.category} onChange={ev => setEditForm({ ...editForm, category: ev.target.value })} style={{ ...inpS, flex: 1, padding: "8px 10px", fontSize: 12 }}>{cats.map(c => <option key={c} value={c}>{c}</option>)}</select>
                          </div>
                          <input type="date" value={editForm.date} onChange={ev => setEditForm({ ...editForm, date: ev.target.value })} style={{ ...inpS, padding: "8px 10px", fontSize: 12 }} />
                          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                            <button onClick={() => applyAndSave(i)} style={{ ...btnP, padding: "7px 14px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><Check size={12} />Done & Save</button>
                            <button onClick={() => applyEdit(i)} style={{ ...btnG, padding: "7px 14px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><Check size={12} />Done</button>
                            <button onClick={cancelEdit} style={{ ...btnG, padding: "7px 14px", fontSize: 11 }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>{e.description || e.category}</span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: T.gold }}>{fmt(e.amount)}</span>
                          </div>
                          <div style={{ fontSize: 11, color: T.text3, marginBottom: 8 }}>{e.category} &middot; {e.date}</div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => saveSingle(i)} style={{ ...btnP, padding: "6px 12px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><Check size={12} />Save</button>
                            <button onClick={() => startEdit(i)} style={{ ...btnG, padding: "6px 12px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><Edit3 size={12} />Edit</button>
                            <button onClick={() => discardSingle(i)} style={{ ...btnG, padding: "6px 12px", fontSize: 11, display: "flex", alignItems: "center", gap: 4, color: T.err }}><X size={12} />Discard</button>
                          </div>
                        </div>
                      )}
                      {dup && <div style={{ marginTop: 8, fontSize: 11, color: T.err, display: "flex", alignItems: "center", gap: 4 }}><AlertTriangle size={12} />Seems like there's a similar entry on {new Date(dup.date + "T00:00:00").toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })} ({dup.description || dup.category} - {fmt(dup.amount)})</div>}
                    </div>
                  ); })}
                </div>
              )}
              <div ref={cr} />
            </div>
            {att && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", marginBottom: 6, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12 }}>
                <img src={att.preview} alt="attached" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, border: `1px solid ${T.border}` }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</div>
                  <div style={{ fontSize: 11, color: T.text3 }}>Ready to send — type a note or hit Send</div>
                </div>
                <button onClick={() => { if (att.preview) URL.revokeObjectURL(att.preview); setAtt(null); }} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer", padding: 4 }}><X size={16} /></button>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <input type="file" ref={fr} accept="image/*" onChange={doImg} style={{ display: "none" }} />
              <button onClick={() => fr.current?.click()} disabled={cl} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 11, color: T.text2, cursor: "pointer", flexShrink: 0 }}><ImagePlus size={18} /></button>
              <textarea value={ci} onChange={e => setCi(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doChat(); } }} disabled={cl} placeholder={att ? "Add a note about this receipt..." : "Type expense or ask..."} rows={1} style={{ ...inpS, flex: 1, resize: "none", minHeight: 42 }} />
              <button onClick={doChat} disabled={cl || (!ci.trim() && !att)} style={{ background: (ci.trim() || att) ? T.grad : T.surface, border: "none", borderRadius: 12, padding: 11, color: (ci.trim() || att) ? (theme === "dark" ? "#0C0C12" : "#FFF") : T.text3, cursor: "pointer", flexShrink: 0, boxShadow: (ci.trim() || att) ? "0 4px 12px rgba(245,181,38,0.2)" : "none" }}><Send size={18} /></button>
            </div>
          </div>
        )}

        {/* ACCOUNTS */}
        {tab === "accounts" && (
          <div style={{ flex: 1, maxWidth: mwAcc, margin: "0 auto", padding: isDesktop ? "28px 36px 40px" : "18px 20px 80px", width: "100%", boxSizing: "border-box", overflowY: "auto" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
              {["accounts", "budgets", "debts"].map(s => <button key={s} onClick={() => setAccSub(s)} style={pillS(accSub === s)}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>)}
            </div>
            <div>
              {accSub === "accounts" && (<>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><div style={{ fontSize: 18, fontWeight: 800 }}>Accounts</div><button onClick={() => { rstAf(); setSaf(true); }} style={{ ...btnP, padding: "10px 16px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><Plus size={14} />Add</button></div>
                {accts.length > 0 && (<div style={{ background: `linear-gradient(135deg,${theme === "dark" ? "rgba(52,211,153,0.08)" : "rgba(5,150,105,0.06)"},transparent)`, border: `1px solid ${theme === "dark" ? "rgba(52,211,153,0.15)" : "rgba(5,150,105,0.15)"}`, borderRadius: 18, padding: "16px 18px", marginBottom: 18 }}><div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Net Worth</div><div style={{ fontSize: 30, fontWeight: 800, color: T.ok, marginTop: 2 }}>{fmt(totA)}</div></div>)}
                <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 8 }}>
                  {accts.map(a => { const I = aIcons[a.type] || Wallet; return (
                    <div key={a.id} style={{ ...cardS, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 42, height: 42, borderRadius: 13, background: T.goldMuted, display: "flex", alignItems: "center", justifyContent: "center" }}><I size={18} style={{ color: T.gold }} /></div><div><div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div><div style={{ fontSize: 10, color: T.text3, textTransform: "capitalize" }}>{a.type}</div></div></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ fontSize: 16, fontWeight: 800, color: T.ok }}>{fmt(a.balance)}</div><button onClick={() => edA(a)} style={{ background: "none", border: "none", color: T.gold, cursor: "pointer", padding: 4 }}><Edit3 size={14} /></button><button onClick={() => setDac(a.id)} style={{ background: "none", border: "none", color: T.err, cursor: "pointer", padding: 4 }}><Trash2 size={14} /></button></div>
                    </div>); })}
                </div>
              </>)}
              {accSub === "budgets" && (<>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Monthly Budgets</div>
                <div style={{ ...cardS, padding: "16px 18px", marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>General Monthly Budget</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ flex: 1, position: "relative" }}>
                      <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, fontWeight: 700, color: T.text3, pointerEvents: "none" }}>{"\u20B1"}</span>
                      <input type="text" inputMode="numeric" placeholder="e.g. 30,000" value={gbEdit || (genBudget > 0 ? new Intl.NumberFormat("en-PH").format(genBudget) : "")} onChange={e => { const raw = e.target.value.replace(/[^0-9]/g, ""); setGbEdit(raw ? new Intl.NumberFormat("en-PH").format(parseInt(raw)) : ""); }} style={{ ...inpS, flex: 1, paddingLeft: 30 }} />
                    </div>
                    <button onClick={() => { const v = parseFloat(String(gbEdit).replace(/[^0-9]/g, "")); if (!v || v <= 0) return; svGB(v); setGbEdit(""); tst(`Budget set to ${fmt(v)}`); }} style={{ ...btnP, padding: "12px 20px", whiteSpace: "nowrap" }}>Set</button>
                    {genBudget > 0 && <button onClick={() => setCgb(true)} style={{ ...btnG, padding: "12px 16px", whiteSpace: "nowrap", borderColor: T.err, color: T.err }}>Clear</button>}
                  </div>
                  {genBudget > 0 && <div style={{ fontSize: 11, color: T.text3, marginTop: 8 }}>Current: {fmt(genBudget)} / Spent this month: {fmt(mTot)} ({gbPct.toFixed(0)}%)</div>}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: T.text2 }}>Per-Category Limits (optional)</div>
                <div style={{ ...cardS, padding: "14px 16px", marginBottom: 12 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                    {cats.map(c => (
                      <div key={c} style={{ display: "flex", alignItems: "center", gap: 6, background: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", borderRadius: 10, padding: "6px 10px" }}>
                        <div style={{ width: 8, height: 8, borderRadius: 3, background: catColors[c], flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{c}</span>
                        {c !== "Other" && <button onClick={() => setDelCat(c)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: T.text3 }}><X size={14} /></button>}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="text" placeholder="New category name" value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { const n = newCat.trim(); if (!n || cats.includes(n) || cats.length >= 15) return; svCats([...cats.slice(0, -1), n, "Other"]); setBudgets(v => ({ ...v, [n]: 0 })); svB({ ...budgets, [n]: 0 }); setNewCat(""); tst(`Category "${n}" added`); } }} style={{ ...inpS, flex: 1 }} />
                    <button onClick={() => { const n = newCat.trim(); if (!n || cats.includes(n) || cats.length >= 15) return; svCats([...cats.slice(0, -1), n, "Other"]); setBudgets(v => ({ ...v, [n]: 0 })); svB({ ...budgets, [n]: 0 }); setNewCat(""); tst(`Category "${n}" added`); }} style={{ ...btnP, padding: "12px 20px", whiteSpace: "nowrap" }}>Add</button>
                  </div>
                  {cats.length >= 15 && <div style={{ fontSize: 10, color: T.text3, marginTop: 6 }}>Maximum 15 categories reached</div>}
                </div>
                {!sbf ? (<>
                  <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 8 }}>
                    {cats.map(c => (<div key={c} style={{ ...cardS, padding: "14px 16px" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: 3, background: catColors[c] }} /><span style={{ fontSize: 13, fontWeight: 600 }}>{c}</span></div><span style={{ fontSize: 14, fontWeight: 800 }}>{fmt(budgets[c] || 0)}</span></div>
                      {budgets[c] > 0 && <><div style={{ marginTop: 8, height: 5, borderRadius: 3, background: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 3, width: `${Math.min(100, ((mByCat[c] || 0) / (budgets[c] || 1)) * 100)}%`, background: (mByCat[c] || 0) > (budgets[c] || 0) ? T.err : (mByCat[c] || 0) > (budgets[c] || 0) * 0.8 ? T.goldLight : T.ok, transition: "width 0.3s" }} /></div>
                      <div style={{ fontSize: 10, color: T.text3, marginTop: 5 }}>Spent: {fmt(mByCat[c] || 0)} / {fmt(budgets[c] || 0)}</div></>}
                      {budgets[c] === 0 && <div style={{ fontSize: 10, color: T.text3, marginTop: 5 }}>No limit set</div>}</div>))}
                  </div>
                  <button onClick={() => { setBf({ ...budgets }); setSbf(true); }} style={{ ...btnG, width: "100%", marginTop: 8, borderColor: T.borderStrong, color: T.gold }}>Edit Budgets</button>
                </>) : (() => { const catTotal = cats.reduce((s, c) => s + (bf[c] || 0), 0); const remaining = genBudget > 0 ? genBudget - catTotal : null; const overAllocated = remaining !== null && remaining < 0; return (<>
                  {genBudget > 0 && <div style={{ ...cardS, padding: "12px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.text2 }}>Allocated: {fmt(catTotal)} of {fmt(genBudget)}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: overAllocated ? T.err : T.ok }}>{overAllocated ? `Over by ${fmt(Math.abs(remaining))}` : `${fmt(remaining)} remaining`}</span>
                  </div>}
                  {overAllocated && <div style={{ fontSize: 11, color: T.err, fontWeight: 600, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><AlertTriangle size={14} />Category totals exceed your general monthly budget. You can still save, but consider adjusting.</div>}
                  <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 10 }}>
                    {cats.map(c => { const maxVal = genBudget > 0 ? Math.max(genBudget, bf[c] || 0) : 50000; const sliderMax = Math.ceil(maxVal / 500) * 500; return (<div key={c} style={{ ...cardS, padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 3, background: catColors[c], flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{c}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 800, color: T.gold }}>{fmt(bf[c] || 0)}</span>
                      </div>
                      <input type="range" min={0} max={sliderMax} step={500} value={bf[c] || 0} onChange={e => setBf(v => ({ ...v, [c]: parseInt(e.target.value) }))} style={{ width: "100%", accentColor: T.gold, cursor: "pointer", height: 6 }} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                        <span style={{ fontSize: 10, color: T.text3 }}>{fmt(0)}</span>
                        <input type="text" inputMode="numeric" value={bf[c] || ""} placeholder="0" onChange={e => { const raw = e.target.value.replace(/[^0-9]/g, ""); setBf(v => ({ ...v, [c]: Math.max(0, parseInt(raw) || 0) })); }} style={{ ...inpS, width: 90, textAlign: "center", padding: "4px 8px", fontSize: 12, fontWeight: 700 }} />
                        <span style={{ fontSize: 10, color: T.text3 }}>{fmtS(sliderMax)}</span>
                      </div>
                    </div>); })}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}><button onClick={saveBudgets} style={{ ...btnP, flex: 1 }}>Save</button><button onClick={() => setSbf(false)} style={{ ...btnG, flex: 1 }}>Cancel</button></div>
                </>); })()}
              </>)}
              {accSub === "debts" && (<>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><div style={{ fontSize: 18, fontWeight: 800 }}>Debts</div><button onClick={() => { rstDf(); setSdf(true); }} style={{ ...btnP, padding: "10px 16px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><Plus size={14} />Add</button></div>
                {debts.length > 0 && (() => { const tOw = debts.reduce((s, d) => s + d.currentBalance, 0); const tMin = debts.reduce((s, d) => s + (d.minPayment || 0), 0); const nD = debts.filter(d => d.dueDate).sort((a, b) => { const t = new Date().getDate(); const da = a.dueDate >= t ? a.dueDate - t : a.dueDate + 30 - t; const db = b.dueDate >= t ? b.dueDate - t : b.dueDate + 30 - t; return da - db; })[0]; return (
                  <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr 1fr" : "1fr 1fr", gap: 10, marginBottom: 16 }}>
                    <div style={{ ...cardS, padding: 16 }}><div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Total Owed</div><div style={{ fontSize: 22, fontWeight: 800, color: T.err, marginTop: 4 }}>{fmt(tOw)}</div></div>
                    <div style={{ ...cardS, padding: 16 }}><div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Min. Payments</div><div style={{ fontSize: 22, fontWeight: 800, color: T.text1, marginTop: 4 }}>{fmt(tMin)}</div><div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>per month</div></div>
                    {nD && <div style={{ ...cardS, padding: 16, ...(isDesktop ? {} : { gridColumn: "1 / -1" }) }}><div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Next Due</div><div style={{ fontSize: 16, fontWeight: 800, color: T.gold, marginTop: 4 }}>{nD.name}</div><div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>Day {nD.dueDate} of every month</div></div>}
                  </div>); })()}
                {debts.length === 0 && <div style={{ ...cardS, textAlign: "center", padding: 28, color: T.text3, fontSize: 13 }}>No debts tracked yet. Add your credit cards, loans, or mortgages.</div>}
                <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 8 }}>
                  {debts.map(d => { const DI = dIcons[d.type] || Coins; const pd = d.totalAmount - d.currentBalance; const pdP = d.totalAmount > 0 ? (pd / d.totalAmount) * 100 : 0; const pays = dPays.filter(p => p.debtId === d.id).sort((a, b) => b.createdAt - a.createdAt); const isEx = viewDt === d.id; return (
                    <div key={d.id} style={{ ...cardS, padding: 0, overflow: "hidden" }}>
                      <div style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 38, height: 38, borderRadius: 11, background: T.goldMuted, display: "flex", alignItems: "center", justifyContent: "center" }}><DI size={16} style={{ color: T.gold }} /></div><div><div style={{ fontSize: 13, fontWeight: 700 }}>{d.name}</div><div style={{ fontSize: 10, color: T.text3 }}>{d.type}{d.dueDate ? ` -- Due day ${d.dueDate}` : ""}</div></div></div>
                          <div style={{ textAlign: "right" }}><div style={{ fontSize: 16, fontWeight: 800, color: d.currentBalance > 0 ? T.err : T.ok }}>{fmt(d.currentBalance)}</div><div style={{ fontSize: 10, color: T.text3 }}>of {fmt(d.totalAmount)}</div></div>
                        </div>
                        <div style={{ marginTop: 10, height: 6, borderRadius: 3, background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 3, width: `${Math.min(100, pdP)}%`, background: pdP >= 100 ? T.ok : T.gold, transition: "width 0.3s" }} /></div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}><span style={{ fontSize: 10, color: T.text3 }}>{pdP.toFixed(0)}% paid ({fmt(pd)})</span>{d.interestRate > 0 && <span style={{ fontSize: 10, color: T.text3 }}>{d.interestRate}% APR</span>}</div>
                        {d.minPayment > 0 && <div style={{ fontSize: 10, color: T.text3, marginTop: 3 }}>Min payment: {fmt(d.minPayment)}/mo</div>}
                        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                          {d.currentBalance > 0 && <button onClick={() => { setSpay(d.id); setPayAmt(d.minPayment > 0 ? String(d.minPayment) : ""); }} style={{ ...btnP, padding: "7px 14px", fontSize: 11, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><Coins size={12} />Pay</button>}
                          <button onClick={() => setViewDt(isEx ? null : d.id)} style={{ ...btnG, padding: "7px 14px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><ChevronDown size={12} style={{ transform: isEx ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />{pays.length}</button>
                          <button onClick={() => edDebt(d)} style={{ background: "none", border: "none", color: T.gold, cursor: "pointer", padding: 4 }}><Edit3 size={14} /></button>
                          <button onClick={() => setDdDc(d.id)} style={{ background: "none", border: "none", color: T.err, cursor: "pointer", padding: 4 }}><Trash2 size={14} /></button>
                        </div>
                      </div>
                      {isEx && <div style={{ borderTop: `1px solid ${T.border}`, padding: "10px 16px", background: theme === "dark" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.text2, marginBottom: 8 }}>Payment History</div>
                        {pays.length === 0 && <div style={{ fontSize: 11, color: T.text3, padding: "8px 0" }}>No payments recorded yet.</div>}
                        {pays.slice(0, 10).map(p => (<div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${T.border}` }}><div><div style={{ fontSize: 12, fontWeight: 600, color: T.ok }}>{fmt(p.amount)}</div><div style={{ fontSize: 10, color: T.text3 }}>{p.date}</div></div><div style={{ fontSize: 11, color: T.text3 }}>Bal: {fmt(p.newBalance)}</div></div>))}
                        {pays.length > 10 && <div style={{ fontSize: 10, color: T.text3, marginTop: 6, textAlign: "center" }}>...and {pays.length - 10} more</div>}
                      </div>}
                    </div>); })}
                </div>
              </>)}
            </div>
          </div>
        )}

        {/* MORE */}
        {tab === "more" && (
          <div style={{ flex: 1, maxWidth: mwMore, margin: "0 auto", padding: isDesktop ? "28px 36px 40px" : "18px 20px 80px", width: "100%", boxSizing: "border-box", overflowY: "auto" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
              {["insights", "settings"].map(s => <button key={s} onClick={() => setSub(s)} style={pillS(sub === s)}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>)}
            </div>

            <div>
              {sub === "insights" && (<>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>AI Insights</div>
                <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>{["Weekly", "Monthly", "Quarterly", "Yearly"].map(p => <button key={p} onClick={() => setIp(p)} style={pillS(ip === p)}>{p}</button>)}</div>
                <button onClick={genIns} disabled={il} style={{ ...btnP, width: isDesktop ? "auto" : "100%", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: il ? 0.6 : 1, padding: isDesktop ? "15px 36px" : undefined }}>
                  {il ? <><RefreshCw size={16} className="spin" />Generating...</> : <><Lightbulb size={16} />Generate {ip} Review</>}
                </button>
                {it && it.error && <div style={{ ...cardS, fontSize: 13, color: T.text3, textAlign: "center", padding: 28 }}>{it.error}</div>}
                {it && it.data && <>
                  <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div style={{ ...cardS, padding: 16 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: T.text3, marginBottom: 6 }}>Total Spent</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: T.gold }}>{fmt(it.data.tot)}</div>
                      <div style={{ fontSize: 11, color: it.data.pT > 0 ? (it.data.tot > it.data.pT ? T.err : T.ok) : T.text3, marginTop: 4 }}>
                        {it.data.pT > 0 ? `${it.data.tot > it.data.pT ? "+" : ""}${(((it.data.tot - it.data.pT) / it.data.pT) * 100).toFixed(1)}% vs prev` : "No prev data"}
                      </div>
                    </div>
                    <div style={{ ...cardS, padding: 16 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: T.text3, marginBottom: 6 }}>Transactions</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: T.text1 }}>{it.data.count}</div>
                      <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>this {it.data.period.toLowerCase()}</div>
                    </div>
                    <div style={{ ...cardS, padding: 16, ...(isDesktop ? {} : { gridColumn: "1 / -1" }) }}>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: T.text3, marginBottom: 6 }}>Previous {it.data.period}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: T.text2 }}>{it.data.pT > 0 ? fmt(it.data.pT) : "--"}</div>
                      <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>{it.data.pT > 0 ? "comparison baseline" : "no data"}</div>
                    </div>
                  </div>
                  {it.overview && <div style={{ ...cardS, padding: isDesktop ? 22 : 18, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.gold, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}><TrendingUp size={16} />Overview</div>
                    <div style={{ fontSize: 13, lineHeight: 1.7, color: T.text2 }}>{it.overview}</div>
                  </div>}
                  <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 12, marginBottom: 16 }}>
                    <div style={{ ...cardS, padding: isDesktop ? 22 : 18 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.text1, marginBottom: 14 }}>By Category</div>
                      <ResponsiveContainer width="100%" height={180}>
                        <RPie><Pie data={Object.entries(it.data.bc).map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" stroke="none">
                          {Object.keys(it.data.bc).map((c, i) => <Cell key={i} fill={catColors[c] || T.text3} />)}
                        </Pie><Tooltip content={<CTipLocal />} /></RPie>
                      </ResponsiveContainer>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                        {Object.entries(it.data.bc).sort((a, b) => b[1] - a[1]).map(([c, v]) => (
                          <div key={c} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: T.text3 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 4, background: catColors[c] || T.text3 }} />{c}: {fmt(v)}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ ...cardS, padding: isDesktop ? 22 : 18 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.text1, marginBottom: 14 }}>By Person</div>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={Object.entries(it.data.bp).map(([name, value]) => ({ name, value }))} barSize={isDesktop ? 48 : 36}>
                          <XAxis dataKey="name" tick={{ fill: T.text3, fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: T.text3, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtS} />
                          <Tooltip content={<CTipLocal />} />
                          <Bar dataKey="value" radius={[8, 8, 0, 0]} fill={T.gold} />
                        </BarChart>
                      </ResponsiveContainer>
                      <div style={{ fontSize: 11, color: T.text3, marginTop: 8, textAlign: "center" }}>
                        {Object.entries(it.data.bp).map(([p, v]) => `${p}: ${((v / it.data.tot) * 100).toFixed(0)}%`).join("  /  ")}
                      </div>
                    </div>
                  </div>
                  {it.categoryAnalysis && <div style={{ ...cardS, padding: isDesktop ? 22 : 18, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.gold, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}><PieChart size={16} />Category Analysis</div>
                    <div style={{ fontSize: 13, lineHeight: 1.7, color: T.text2 }}>{it.categoryAnalysis}</div>
                  </div>}
                  {it.patterns && <div style={{ ...cardS, padding: isDesktop ? 22 : 18, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.gold, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}><Coins size={16} />Spending Patterns</div>
                    <div style={{ fontSize: 13, lineHeight: 1.7, color: T.text2 }}>{it.patterns}</div>
                  </div>}
                  {it.data.t5x.length > 0 && <div style={{ ...cardS, padding: isDesktop ? 22 : 18, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text1, marginBottom: 14 }}>Top Expenses</div>
                    {it.data.t5x.map((e, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < it.data.t5x.length - 1 ? `1px solid ${T.border}` : "none" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>{e.description || e.category}</div>
                          <div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>{e.category} / {e.date} / {e.addedBy}</div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.gold }}>{fmt(e.amount)}</div>
                      </div>
                    ))}
                  </div>}
                  {it.tips && it.tips.length > 0 && <div style={{ ...cardS, padding: isDesktop ? 22 : 18, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.gold, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><Lightbulb size={16} />Tips & Recommendations</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {it.tips.map((tip, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <div style={{ minWidth: 24, height: 24, borderRadius: 12, background: T.goldMuted, color: T.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{i + 1}</div>
                          <div style={{ fontSize: 13, lineHeight: 1.6, color: T.text2, paddingTop: 2 }}>{tip}</div>
                        </div>
                      ))}
                    </div>
                  </div>}
                </>}
              </>)}

              {sub === "settings" && (<>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Settings</div>
                {sbReady && householdId && (
                  <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 8, marginBottom: 16 }}>
                    <button onClick={generateInvite} style={{ ...cardS, width: "100%", padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                      <UserPlus size={18} style={{ color: T.gold }} />
                      <div><div style={{ fontSize: 13, fontWeight: 600 }}>Invite Partner</div><div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>Send a link to join your household</div></div>
                    </button>
                    <div style={{ ...cardS, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                      <Home size={18} style={{ color: T.gold }} />
                      <div><div style={{ fontSize: 13, fontWeight: 600 }}>Household</div><div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>{users.length} member{users.length !== 1 ? "s" : ""} -- {householdRole}</div></div>
                    </div>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 8 }}>
                  <button onClick={exportCSV} style={{ ...cardS, width: "100%", padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}><Download size={18} style={{ color: T.gold }} /><div><div style={{ fontSize: 13, fontWeight: 600 }}>Export CSV</div><div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>Download all expenses</div></div></button>
                  <button onClick={() => setClr(true)} style={{ ...cardS, width: "100%", padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left", borderColor: `${T.err}30` }}><AlertTriangle size={18} style={{ color: T.err }} /><div><div style={{ fontSize: 13, fontWeight: 600, color: T.err }}>Clear All Data</div><div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>Remove everything permanently</div></div></button>
                </div>
              </>)}
            </div>
          </div>
        )}

        {/* MODALS */}
        {inviteModal && <div style={mOvS}><div style={{ ...mInS, maxWidth: 420 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>Invite Partner</div>
            <button onClick={() => setInviteModal(false)} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer" }}><X size={22} /></button>
          </div>
          <p style={{ fontSize: 13, color: T.text2, marginBottom: 16, lineHeight: 1.5 }}>Share this link with your partner. They'll sign in with Google and automatically join your household.</p>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
            <input readOnly value={inviteLink} style={{ ...inpS, flex: 1, fontSize: 11, fontFamily: "monospace" }} />
            <button onClick={copyInvite} style={{ ...btnP, padding: "12px 16px", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
              {inviteCopied ? <><Check size={14} />Copied</> : <><Copy size={14} />Copy</>}
            </button>
          </div>
          <p style={{ fontSize: 11, color: T.text3, margin: 0 }}>Link expires in 7 days. Only one use per link.</p>
        </div></div>}

        {sf && <div style={mOvS}><div style={mInS}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>{eId ? "Edit" : "Add"} Expense</div><button onClick={rstF} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer" }}><X size={22} /></button></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input placeholder="Amount" type="number" inputMode="decimal" value={form.amount} onChange={e => setForm(v => ({ ...v, amount: e.target.value }))} style={inpS} />
            <select value={form.category} onChange={e => setForm(v => ({ ...v, category: e.target.value }))} style={inpS}>{cats.map(c => <option key={c} value={c}>{c}</option>)}</select>
            <input placeholder="Description" value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} style={inpS} />
            <input type="date" value={form.date} onChange={e => setForm(v => ({ ...v, date: e.target.value }))} style={inpS} />
            <select value={form.addedBy} onChange={e => setForm(v => ({ ...v, addedBy: e.target.value }))} style={inpS}>{users.map(u => <option key={u} value={u}>{u}</option>)}</select>
            {accts.length > 0 && <select value={form.accountId} onChange={e => setForm(v => ({ ...v, accountId: e.target.value }))} style={inpS}><option value="">No account linked</option>{accts.map(a => <option key={a.id} value={a.id}>{a.name} ({fmt(a.balance)})</option>)}</select>}
            <button onClick={doSubmit} style={{ ...btnP, width: "100%" }}>{eId ? "Update" : "Add Expense"}</button>
          </div>
        </div></div>}

        {saf && <div style={mOvS}><div style={mInS}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>{eaId ? "Edit" : "Add"} Account</div><button onClick={rstAf} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer" }}><X size={22} /></button></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input placeholder="Account name" value={af.name} onChange={e => setAf(v => ({ ...v, name: e.target.value }))} style={inpS} />
            <input placeholder="Balance" type="number" inputMode="decimal" value={af.balance} onChange={e => setAf(v => ({ ...v, balance: e.target.value }))} style={inpS} />
            <select value={af.type} onChange={e => setAf(v => ({ ...v, type: e.target.value }))} style={inpS}><option value="savings">Savings</option><option value="checking">Checking</option><option value="investment">Investment</option><option value="other">Other</option></select>
            <button onClick={doAcct} style={{ ...btnP, width: "100%" }}>{eaId ? "Update" : "Add Account"}</button>
          </div>
        </div></div>}

        {dc && <div style={mOvS}><div style={mInS}><div style={{ textAlign: "center" }}><AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} /><div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Delete expense?</div><div style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>This cannot be undone.</div><div style={{ display: "flex", gap: 8 }}><button onClick={() => delE(dc)} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Delete</button><button onClick={() => setDc(null)} style={{ ...btnG, flex: 1 }}>Cancel</button></div></div></div></div>}
        {dac && <div style={mOvS}><div style={mInS}><div style={{ textAlign: "center" }}><AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} /><div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Delete account?</div><div style={{ display: "flex", gap: 8, marginTop: 20 }}><button onClick={() => delA(dac)} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Delete</button><button onClick={() => setDac(null)} style={{ ...btnG, flex: 1 }}>Cancel</button></div></div></div></div>}
        {clr && <div style={mOvS}><div style={mInS}><div style={{ textAlign: "center" }}><AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} /><div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Clear ALL data?</div><div style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>This removes everything permanently.</div><div style={{ display: "flex", gap: 8 }}><button onClick={clearAll} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Clear All</button><button onClick={() => setClr(false)} style={{ ...btnG, flex: 1 }}>Cancel</button></div></div></div></div>}
        {delCat && <div style={mOvS}><div style={mInS}><div style={{ textAlign: "center" }}><AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} /><div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Remove "{delCat}" category?</div><div style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>{exp.filter(e => e.category === delCat).length > 0 ? `${exp.filter(e => e.category === delCat).length} expense(s) will be reassigned to "Other".` : "No expenses in this category."} {rec.filter(r => r.category === delCat).length > 0 ? ` ${rec.filter(r => r.category === delCat).length} recurring template(s) will also be reassigned.` : ""}</div><div style={{ display: "flex", gap: 8 }}><button onClick={() => { const c = delCat; const newCats = cats.filter(x => x !== c); svCats(newCats); const ue = exp.map(e => e.category === c ? { ...e, category: "Other" } : e); svE(ue); const ur = rec.map(r => r.category === c ? { ...r, category: "Other" } : r); svR(ur); const nb = { ...budgets }; delete nb[c]; svB(nb); setDelCat(null); tst(`Category "${c}" removed`); }} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Remove</button><button onClick={() => setDelCat(null)} style={{ ...btnG, flex: 1 }}>Cancel</button></div></div></div></div>}

        {srf && <div style={mOvS}><div style={mInS}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>{erId ? "Edit" : "Add"} Recurring</div><button onClick={rstRf} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer" }}><X size={22} /></button></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input placeholder="Description (e.g. Netflix)" value={rf.description} onChange={e => setRf(v => ({ ...v, description: e.target.value }))} style={inpS} />
            <input placeholder="Amount" type="number" inputMode="decimal" value={rf.amount} onChange={e => setRf(v => ({ ...v, amount: e.target.value }))} style={inpS} />
            <select value={rf.category} onChange={e => setRf(v => ({ ...v, category: e.target.value }))} style={inpS}>{cats.map(c => <option key={c} value={c}>{c}</option>)}</select>
            <select value={rf.frequency} onChange={e => setRf(v => ({ ...v, frequency: e.target.value }))} style={inpS}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select>
            <input type="date" value={rf.nextDate} onChange={e => setRf(v => ({ ...v, nextDate: e.target.value }))} style={inpS} />
            <button onClick={doRec} style={{ ...btnP, width: "100%" }}>{erId ? "Update" : "Add Recurring"}</button>
          </div>
        </div></div>}

        {cgb && <div style={mOvS}><div style={mInS}><div style={{ textAlign: "center" }}><AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} /><div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Clear monthly budget?</div><div style={{ fontSize: 13, color: T.text3, marginBottom: 20 }}>This will remove your general monthly budget limit of {fmt(genBudget)}. The budget progress bar will no longer show on the dashboard.</div><div style={{ display: "flex", gap: 8 }}><button onClick={() => { svGB(0); setGbEdit(""); setCgb(false); tst("Budget cleared"); }} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Clear Budget</button><button onClick={() => setCgb(false)} style={{ ...btnG, flex: 1 }}>Cancel</button></div></div></div></div>}
        {drc && <div style={mOvS}><div style={mInS}><div style={{ textAlign: "center" }}><AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} /><div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Delete recurring expense?</div><div style={{ display: "flex", gap: 8, marginTop: 20 }}><button onClick={() => delRec(drc)} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Delete</button><button onClick={() => setDrc(null)} style={{ ...btnG, flex: 1 }}>Cancel</button></div></div></div></div>}

        {sdf && <div style={mOvS}><div style={mInS}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>{edtId ? "Edit" : "Add"} Debt</div><button onClick={rstDf} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer" }}><X size={22} /></button></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div><input placeholder="Name (e.g. BDO Credit Card)" value={ddf.name} onChange={e => setDdf(v => ({ ...v, name: e.target.value }))} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4, paddingLeft: 2 }}>What you call this debt</div></div>
            <div><select value={ddf.type} onChange={e => setDdf(v => ({ ...v, type: e.target.value }))} style={inpS}>{DEBT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select><div style={{ fontSize: 10, color: T.text3, marginTop: 4, paddingLeft: 2 }}>Type of debt or loan</div></div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}><input placeholder="Total Amount" type="number" inputMode="decimal" value={ddf.totalAmount} onChange={e => setDdf(v => ({ ...v, totalAmount: e.target.value }))} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4, paddingLeft: 2 }}>Original loan or credit limit</div></div>
              <div style={{ flex: 1 }}><input placeholder="Current Balance" type="number" inputMode="decimal" value={ddf.currentBalance} onChange={e => setDdf(v => ({ ...v, currentBalance: e.target.value }))} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4, paddingLeft: 2 }}>How much you still owe</div></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}><input placeholder="Due day (1-31)" type="number" inputMode="numeric" min="1" max="31" value={ddf.dueDate} onChange={e => setDdf(v => ({ ...v, dueDate: e.target.value }))} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4, paddingLeft: 2 }}>Day of month payment is due</div></div>
              <div style={{ flex: 1 }}><input placeholder="Interest % (APR)" type="number" inputMode="decimal" value={ddf.interestRate} onChange={e => setDdf(v => ({ ...v, interestRate: e.target.value }))} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4, paddingLeft: 2 }}>Annual interest rate</div></div>
            </div>
            <div><input placeholder="Min. Monthly Payment" type="number" inputMode="decimal" value={ddf.minPayment} onChange={e => setDdf(v => ({ ...v, minPayment: e.target.value }))} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4, paddingLeft: 2 }}>Minimum amount due each month</div></div>
            <button onClick={doDebt} style={{ ...btnP, width: "100%" }}>{edtId ? "Update" : "Add Debt"}</button>
          </div>
        </div></div>}

        {spay && <div style={mOvS}><div style={{ ...mInS, maxWidth: 380 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>Record Payment</div><button onClick={() => { setSpay(null); setPayAmt(""); setPayDate(td()); }} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer" }}><X size={22} /></button></div>
          <div style={{ fontSize: 13, color: T.text2, marginBottom: 14 }}>{debts.find(d => d.id === spay)?.name} -- Balance: {fmt(debts.find(d => d.id === spay)?.currentBalance || 0)}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input placeholder="Payment Amount" type="number" inputMode="decimal" value={payAmt} onChange={e => setPayAmt(e.target.value)} style={inpS} autoFocus />
            <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} style={inpS} />
            <button onClick={doPayment} style={{ ...btnP, width: "100%" }}>Record Payment</button>
          </div>
        </div></div>}

        {ddDc && <div style={mOvS}><div style={mInS}><div style={{ textAlign: "center" }}><AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} /><div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Delete debt?</div><div style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>This will also remove all payment history for this debt.</div><div style={{ display: "flex", gap: 8 }}><button onClick={() => delDebt(ddDc)} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Delete</button><button onClick={() => setDdDc(null)} style={{ ...btnG, flex: 1 }}>Cancel</button></div></div></div></div>}
      </div>

      <style>{`
        input::placeholder,textarea::placeholder{color:${T.text3}}
        input:focus,textarea:focus,select:focus{border-color:${T.gold}!important;box-shadow:0 0 0 3px rgba(245,181,38,0.1)!important;outline:none}
        select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(T.text3)}' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px}
        button:active{transform:scale(0.97)}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:4px}
        .spin{animation:spin 1s linear infinite}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        option{background:${T.selectBg};color:${T.text1}}
        input[type=range]{-webkit-appearance:none;appearance:none;background:${theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"};border-radius:4px;outline:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:${T.gold};cursor:pointer;box-shadow:0 2px 6px rgba(245,181,38,0.3)}
        input[type=range]::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:${T.gold};cursor:pointer;border:none;box-shadow:0 2px 6px rgba(245,181,38,0.3)}
      `}</style>
    </div>
  );
}

export default function App() {
  const [, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [household, setHousehold] = useState(null);
  const [householdRole, setHouseholdRole] = useState(null);
  const [localUser, setLocalUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null); // eslint-disable-line no-unused-vars
  const [pendingInviteData, setPendingInviteData] = useState(null);
  const [inviteError, setInviteError] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const toggle = () => setTheme(v => { const next = v === "dark" ? "light" : "dark"; localStorage.setItem("theme", next); return next; });

  // Capture invite token from URL path (/invite/TOKEN) or query (?invite=TOKEN) on mount
  useEffect(() => {
    const pathMatch = window.location.pathname.match(/^\/invite\/([a-zA-Z0-9]+)$/);
    const invite = pathMatch ? pathMatch[1] : new URLSearchParams(window.location.search).get("invite");
    if (invite) {
      localStorage.setItem("pendingInvite", invite);
      window.history.replaceState({}, "", "/");
    }
  }, []);

  useEffect(() => {
    if (!sbReady) { setAuthLoading(false); return; }
    const timeout = setTimeout(() => { setAuthLoading(false); }, 5000);
    let handling = false;
    const handleSession = async (s) => {
      if (handling) return;
      handling = true;
      try {
        if (!s) { setSession(null); setProfile(null); setHousehold(null); setHouseholdRole(null); setPendingInviteData(null); clearTimeout(timeout); setAuthLoading(false); handling = false; return; }
        setSession(s);

        // 1. Fetch or create profile
        let prof;
        const { data: existing, error: profileErr } = await supabase.from("profiles").select("*").eq("id", s.user.id).maybeSingle();
        if (existing && !profileErr) { prof = existing; }
        else {
          const fullName = s.user.user_metadata?.full_name || s.user.user_metadata?.name || "";
          const displayName = fullName.split(" ")[0] || s.user.email.split("@")[0];
          prof = { id: s.user.id, email: s.user.email, display_name: displayName, avatar_url: s.user.user_metadata?.avatar_url || "" };
          const { error: insertErr } = await supabase.from("profiles").insert(prof);
          if (insertErr) prof = { id: s.user.id, display_name: displayName };
        }
        setProfile(prof);

        // 2. Find existing household membership
        let joined = false;
        const { data: memberships } = await supabase.from("household_members").select("household_id, role, households(id, name)").eq("user_id", s.user.id).limit(1);
        const membership = memberships?.[0] || null;
        if (membership?.households) {
          setHousehold(membership.households);
          setHouseholdRole(membership.role);
          joined = true;
        }

        // 3. Auto-create household if not in one (always safe — invite handled separately after auth)
        if (!joined) {
          const { data: h } = await supabase.from("households").insert({ name: "My Household" }).select().single();
          if (h) {
            await supabase.from("household_members").insert({ household_id: h.id, user_id: s.user.id, role: "owner" });
            setHousehold(h);
            setHouseholdRole("owner");
          }
        }
      } catch (e) { console.error("[auth] error:", e); }
      clearTimeout(timeout);
      setAuthLoading(false);
      handling = false;
    };
    supabase.auth.getSession().then(({ data: { session: s } }) => handleSession(s)).catch(() => { clearTimeout(timeout); setAuthLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((ev, s) => {
      if (ev === "INITIAL_SESSION") return;
      handleSession(s);
    });
    return () => { subscription.unsubscribe(); clearTimeout(timeout); };
  }, []);

  // Separate effect: check pendingInvite AFTER auth is fully loaded
  useEffect(() => {
    if (!sbReady || authLoading || !session) return;
    const token = localStorage.getItem("pendingInvite");
    if (!token) return;
    localStorage.removeItem("pendingInvite");
    (async () => {
      try {
        const { data: inv } = await supabase.from("invites").select("*").eq("token", token).eq("used", false).maybeSingle();
        if (!inv || new Date(inv.expires_at) <= new Date()) { setInviteError(true); return; }
        const { data: invitedH } = await supabase.from("households").select("*").eq("id", inv.household_id).single();
        if (!invitedH) { setInviteError(true); return; }
        // Show confirmation screen — works for ALL users (new or existing)
        setPendingInviteData({ inv, invitedHousehold: invitedH, userId: session.user.id });
      } catch (e) { console.error("[invite] error:", e); setInviteError(true); }
    })();
  }, [authLoading, session]);

  const handleLogout = async () => {
    setInviteError(false);
    if (sbReady) {
      try { await supabase.auth.signOut(); } catch (e) { console.error("[logout] error:", e); }
      window.location.href = "/";
    } else {
      setSession(null); setProfile(null); setHousehold(null); setHouseholdRole(null); setAuthLoading(false);
    }
  };

  const acceptInvite = async () => {
    if (!pendingInviteData) return;
    const { inv, invitedHousehold, userId } = pendingInviteData;
    try {
      // Get current household before leaving it
      const { data: currentMs } = await supabase.from("household_members").select("household_id").eq("user_id", userId).limit(1);
      const currentHid = currentMs?.[0]?.household_id || null;

      // Remove from current household
      await supabase.from("household_members").delete().eq("user_id", userId);

      // If the old household is now empty and was auto-created (name = "My Household"), clean it up
      if (currentHid) {
        const { data: remaining } = await supabase.from("household_members").select("id").eq("household_id", currentHid).limit(1);
        if (!remaining?.length) {
          await supabase.from("households").delete().eq("id", currentHid);
        }
      }

      // Join the invited household
      const { error: insertErr } = await supabase.from("household_members").insert({ household_id: inv.household_id, user_id: userId, role: "member" });
      if (insertErr) { console.error("[invite accept] insert error:", insertErr); return; }

      // Mark invite as used
      await supabase.from("invites").update({ used: true, used_by: userId }).eq("id", inv.id);

      setHousehold(invitedHousehold);
      setHouseholdRole("member");
      setPendingInviteData(null);
    } catch (e) { console.error("[invite accept] error:", e); }
  };

  const declineInvite = () => {
    setPendingInviteData(null);
    // User stays in their auto-created household
  };

  if (authLoading) {
    const T = themes[theme];
    return (<div style={{ minHeight: "100vh", background: T.gradBg, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ color: T.gold, fontSize: 16, fontWeight: 600 }}>Loading...</div>
    </div>);
  }

  if (sbReady) {
    const user = profile?.display_name || null;

    if (inviteError) {
      const T = themes[theme];
      return (
        <div style={{ minHeight: "100vh", background: T.gradBg, display: "flex", justifyContent: "center", alignItems: "center", padding: 24 }}>
          <div style={{ background: T.modalSurface, border: `1px solid ${T.borderStrong}`, borderRadius: 24, padding: 36, width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(0,0,0,0.3)", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <AlertTriangle size={26} style={{ color: T.err }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text1, margin: "0 0 10px" }}>Invite Failed</h2>
            <p style={{ color: T.text2, fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 }}>The invite link could not be processed. It may have expired or already been used. Ask your partner to generate a new invite link from Settings.</p>
            <button onClick={handleLogout} style={{ padding: "13px 32px", borderRadius: 12, border: "none", background: T.grad, color: theme === "dark" ? "#0C0C12" : "#FFF", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Sign Out and Try Again</button>
          </div>
        </div>
      );
    }

    if (pendingInviteData) {
      const T = themes[theme];
      return (
        <div style={{ minHeight: "100vh", background: T.gradBg, display: "flex", justifyContent: "center", alignItems: "center", padding: 24 }}>
          <div style={{ background: T.modalSurface, border: `1px solid ${T.borderStrong}`, borderRadius: 24, padding: 36, width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(0,0,0,0.3)", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: T.goldMuted, border: `1px solid ${T.borderStrong}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Home size={26} style={{ color: T.gold }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text1, margin: "0 0 10px" }}>Household Invite</h2>
            <p style={{ color: T.text2, fontSize: 14, margin: "0 0 16px" }}>
              You have been invited to join <strong style={{ color: T.gold }}>{pendingInviteData.invitedHousehold.name}</strong>.
            </p>
            <p style={{ color: T.err, fontSize: 13, margin: "0 0 28px", background: theme === "dark" ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.06)", border: `1px solid rgba(239,68,68,0.2)`, borderRadius: 10, padding: "10px 14px", lineHeight: 1.5 }}>
              Your current household will be removed from your account. You will only have access to the new household's data.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={declineInvite} style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: `1px solid ${T.inputBorder}`, background: "transparent", color: T.text2, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Decline</button>
              <button onClick={acceptInvite} style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: "none", background: T.grad, color: theme === "dark" ? "#0C0C12" : "#FFF", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(245,181,38,0.2)" }}>Accept & Join</button>
            </div>
          </div>
        </div>
      );
    }

    if (user && household) {
      return <MainApp user={user} householdId={household.id} householdRole={householdRole} onLogout={handleLogout} theme={theme} toggleTheme={toggle} />;
    }
    return <LoginScreen theme={theme} toggleTheme={toggle} authError={authError} />;
  }

  return localUser
    ? <MainApp user={localUser} onLogout={() => setLocalUser(null)} theme={theme} toggleTheme={toggle} />
    : <LoginScreen onLogin={setLocalUser} theme={theme} toggleTheme={toggle} localMode={true} />;
}
