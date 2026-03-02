import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit3, X, Check, Search, MessageSquare, LayoutDashboard, PieChart, Settings, ChevronDown, Lock, LogOut, ImagePlus, Send, RefreshCw, Download, AlertTriangle, TrendingUp, TrendingDown, PiggyBank, CreditCard, Building2, Wallet, Lightbulb, Coins, Sun, Moon } from "lucide-react";
import { PieChart as RPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend } from "recharts";

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

const cco = { Food: "#F5B526", Transport: "#60A5FA", Bills: "#EF6B6B", Shopping: "#C084FC", Health: "#34D399", Entertainment: "#FB923C", Subscriptions: "#F472B6", Other: "#94A3B8" };
const CATS = ["Food","Transport","Bills","Shopping","Health","Entertainment","Subscriptions","Other"];
const PERIODS = ["Daily","Weekly","Monthly","Quarterly","Yearly","All"];
const USERS = ["Joseph","Rowena"];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const fmt = (n) => "\u20B1" + new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const fmtS = (n) => n >= 1000 ? "\u20B1" + (n / 1000).toFixed(1) + "k" : "\u20B1" + n.toFixed(0);
const td = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const pld = (s) => { const [y, m, d] = (s || "").split("-").map(Number); return new Date(y, m - 1, d); };
const aIcons = { savings: PiggyBank, checking: CreditCard, investment: Building2, other: Wallet };

// Storage adapter — works in both Claude artifacts (window.storage) and local dev (localStorage)
const store = {
  get: async (key) => {
    if (window.storage?.get) {
      return window.storage.get(key);
    }
    const v = localStorage.getItem(key);
    return v !== null ? { value: v } : null;
  },
  set: async (key, value) => {
    if (window.storage?.set) {
      return window.storage.set(key, value);
    }
    localStorage.setItem(key, value);
    return { key, value };
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
const DEFAULT_BUDGETS = { Food: 8000, Transport: 3000, Bills: 10000, Shopping: 5000, Health: 3000, Entertainment: 3000, Subscriptions: 2000, Other: 2000 };
const DEFAULT_PINS = { Joseph: "1234", Rowena: "5678" };

// ─── LOGIN ───
function LoginScreen({ onLogin, theme, toggleTheme }) {
  const T = themes[theme];
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [user, setUser] = useState(null);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [pins, setPins] = useState(DEFAULT_PINS);
  useEffect(() => { (async () => { try { const r = await store.get("pins"); if (r?.value) setPins(JSON.parse(r.value)); } catch {} })(); }, []);
  const doLogin = () => { if (pins[user] === pin) onLogin(user); else { setErr("Wrong PIN. Try again."); setPin(""); } };

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
          <p style={{ color: T.text3, fontSize: 15, margin: "10px 0 0", letterSpacing: 2, textTransform: "uppercase" }}>Joseph & Rowena</p>
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
            <p style={{ color: T.text3, fontSize: 13, margin: "6px 0 0", letterSpacing: 2, textTransform: "uppercase" }}>Joseph & Rowena</p>
          </div>
        )}
        {isDesktop && (
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: T.text1 }}>Welcome back</h2>
            <p style={{ color: T.text3, fontSize: 13, margin: "6px 0 0" }}>Select your profile and enter your PIN</p>
          </div>
        )}
        {!user ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ color: T.text2, fontSize: 13, textAlign: isDesktop ? "left" : "center", marginBottom: 4 }}>Who's logging in?</p>
            {USERS.map(u => (
              <button key={u} onClick={() => setUser(u)} style={{
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
              <div style={{ width: 72, height: 72, borderRadius: 22, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: theme === "dark" ? "#0C0C12" : "#FFF", margin: isDesktop ? "0 0 14px" : "0 auto 14px", boxShadow: "0 8px 32px rgba(245,181,38,0.25)" }}>{user[0]}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.text1 }}>Welcome, {user}</div>
              <button onClick={() => { setUser(null); setPin(""); setErr(""); }} style={{ background: "none", border: "none", color: T.gold, fontSize: 12, cursor: "pointer", marginTop: 4 }}>Not you?</button>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, color: T.text3, fontWeight: 600, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Enter PIN</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.text3 }} />
                <input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, "")); setErr(""); }}
                  onKeyDown={e => { if (e.key === "Enter") doLogin(); }} placeholder="----" autoFocus
                  style={{ width: "100%", padding: "14px 14px 14px 42px", borderRadius: 12, border: `1px solid ${T.inputBorder}`, background: T.inputBg, color: T.text1, fontSize: 22, letterSpacing: 12, textAlign: "center", outline: "none", boxSizing: "border-box" }} />
              </div>
              {err && <div style={{ color: T.err, fontSize: 12, marginTop: 8, textAlign: isDesktop ? "left" : "center" }}>{err}</div>}
            </div>
            <button onClick={doLogin} disabled={pin.length < 4} style={{
              width: "100%", padding: 16, borderRadius: 14, border: "none", cursor: pin.length >= 4 ? "pointer" : "default",
              background: T.grad, color: theme === "dark" ? "#0C0C12" : "#FFF", fontSize: 14, fontWeight: 700,
              opacity: pin.length >= 4 ? 1 : 0.3, boxShadow: "0 4px 16px rgba(245,181,38,0.2)"
            }}>Log In</button>
            <p style={{ color: T.text3, fontSize: 10, textAlign: isDesktop ? "left" : "center", marginTop: 14 }}>Default: Joseph=1234, Rowena=5678</p>
          </>
        )}
      </div>
      <style>{`input::placeholder{color:${T.text3}} input:focus{border-color:${T.gold}!important;box-shadow:0 0 0 3px rgba(245,181,38,0.12)!important} button:active{transform:scale(0.97)}`}</style>
    </div>
  );
}

// ─── MAIN APP ───
function MainApp({ user, onLogout, theme, toggleTheme }) {
  const T = themes[theme];
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [tab, setTab] = useState("dashboard");
  const [sub, setSub] = useState("accounts");
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
  const [form, setForm] = useState({ amount: "", category: "Food", description: "", date: td(), addedBy: user });
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
  const tst = (m) => { setToast(m); setTimeout(() => setToast(null), 2500); };

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
  const mwIns = isDesktop ? 800 : 600;
  const mwMore = isDesktop ? 1100 : 600;

  useEffect(() => {
    (async () => {
      try {
        const r = await store.get("expenses");
        if (r?.value) { const p = JSON.parse(r.value); if (p.length > 0) { setExp(p);
          try { const a = await store.get("accounts"); if (a?.value) setAccts(JSON.parse(a.value)); } catch {}
          try { const b = await store.get("budgets"); if (b?.value) setBudgets(JSON.parse(b.value)); } catch {}
          setLd(false); return; } }
      } catch (e) { console.error(e); }
      setExp(SEED_EXP); setAccts(SEED_ACCT);
      try { await store.set("expenses", JSON.stringify(SEED_EXP)); await store.set("accounts", JSON.stringify(SEED_ACCT)); } catch {}
      setLd(false);
    })();
  }, []);
  useEffect(() => { cr.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, pe]);

  const svE = async (d) => { setExp(d); try { await store.set("expenses", JSON.stringify(d)); } catch {} };
  const svA = async (d) => { setAccts(d); try { await store.set("accounts", JSON.stringify(d)); } catch {} };
  const svB = async (d) => { setBudgets(d); try { await store.set("budgets", JSON.stringify(d)); } catch {} };
  const doSubmit = () => {
    if (!form.amount || isNaN(parseFloat(form.amount))) return;
    const en = { id: eId || uid(), amount: parseFloat(parseFloat(form.amount).toFixed(2)), category: form.category, description: form.description.trim(), date: form.date || td(), addedBy: form.addedBy || user, createdAt: Date.now() };
    if (eId) { svE(exp.map(e => e.id === eId ? en : e)); tst("Updated"); } else { svE([en, ...exp]); tst("Added"); }
    rstF();
  };
  const rstF = () => { setForm({ amount: "", category: "Food", description: "", date: td(), addedBy: user }); setEId(null); setSf(false); };
  const edF = (e) => { setForm({ amount: String(e.amount), category: e.category, description: e.description, date: e.date, addedBy: e.addedBy }); setEId(e.id); setSf(true); };
  const delE = (id) => { svE(exp.filter(e => e.id !== id)); setDc(null); tst("Deleted"); };
  const doAcct = () => {
    if (!af.name.trim() || !af.balance || isNaN(parseFloat(af.balance))) return;
    const en = { id: eaId || uid(), name: af.name.trim(), balance: parseFloat(parseFloat(af.balance).toFixed(2)), type: af.type, updatedAt: Date.now() };
    if (eaId) { svA(accts.map(a => a.id === eaId ? en : a)); tst("Account updated"); } else { svA([...accts, en]); tst("Account added"); }
    rstAf();
  };
  const rstAf = () => { setAf({ name: "", balance: "", type: "savings" }); setEaId(null); setSaf(false); };
  const edA = (a) => { setAf({ name: a.name, balance: String(a.balance), type: a.type }); setEaId(a.id); setSaf(true); };
  const delA = (id) => { svA(accts.filter(a => a.id !== id)); setDac(null); tst("Account removed"); };
  const saveBudgets = () => { svB(bf); setSbf(false); tst("Budgets saved"); };
  const exportCSV = () => {
    const h = "Date,Description,Category,Amount,Added By\n";
    const r = [...exp].sort((a, b) => a.date.localeCompare(b.date)).map(e => `${e.date},"${(e.description || "").replace(/"/g, '""')}",${e.category},${e.amount},${e.addedBy}`).join("\n");
    const b = new Blob([h + r], { type: "text/csv" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "expenses.csv"; a.click(); URL.revokeObjectURL(u);
  };
  const clearAll = async () => { setExp([]); setAccts([]); try { await store.set("expenses", JSON.stringify([])); await store.set("accounts", JSON.stringify([])); } catch {} setClr(false); tst("All data cleared"); };

  const SYS = `You are an expense tracker assistant for a couple (Joseph and Rowena). Currency: PHP (Philippine Peso).
RESPOND ONLY WITH VALID JSON. No markdown, no backticks. Today: ${td()}. Current user: ${user}.
Format: {"expenses":[{"amount":number,"category":"Food|Transport|Bills|Shopping|Health|Entertainment|Subscriptions|Other","description":"text","date":"YYYY-MM-DD"}],"message":"confirmation text, NO emojis"}
Not expenses: {"expenses":[],"message":"response, NO emojis"}
Rules: No emojis. If no date mentioned use today. Parse commas/newlines as multiple. gas/grab/angkas=Transport. food/jollibee/grocery/coffee=Food. netflix/spotify=Subscriptions. meralco/pldt/water=Bills.`;
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
    try { let c = t.replace(/```json|```/g, "").trim(); const m = c.match(/\{[\s\S]*\}/); if (m) { const p = JSON.parse(m[0]); return { expenses: (p.expenses || []).map(e => ({ ...e, category: CATS.includes(e.category) ? e.category : "Other", date: e.date || td() })), message: p.message || "" }; } return { expenses: [], message: t.slice(0, 300) }; }
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
  const confirmP = () => { if (!pe) return; svE([...pe, ...exp]); tst(`${pe.length} added`); setPe(null); };
  const rejectP = () => { setPe(null); setMsgs(v => [...v, { role: "assistant", content: "Discarded." }]); };
  const genIns = async () => {
    const ps = startOf(ip); const rel = exp.filter(e => pld(e.date) >= ps);
    if (!rel.length) { setIt("No expenses for this period."); return; }
    setIl(true); setIt(null);
    const tot = rel.reduce((s, e) => s + e.amount, 0);
    const bc = rel.reduce((a, e) => { a[e.category] = (a[e.category] || 0) + e.amount; return a; }, {});
    const bp = rel.reduce((a, e) => { a[e.addedBy] = (a[e.addedBy] || 0) + e.amount; return a; }, {});
    const [pS, pE] = prevRange(ip); const pT = exp.filter(e => { const d = pld(e.date); return d >= pS && d < pE; }).reduce((s, e) => s + e.amount, 0);
    const t5x = [...rel].sort((a, b) => b.amount - a.amount).slice(0, 5);
    const bStr = Object.entries(budgets).map(([c, v]) => `- ${c}: Budget PHP ${v}, Spent PHP ${(bc[c] || 0).toFixed(0)}`).join("\n");
    const sum = `${ip.toUpperCase()} REVIEW:\nTotal: PHP ${tot.toFixed(2)}\nPrev: PHP ${pT.toFixed(2)}\nBy category:\n${Object.entries(bc).map(([c, v]) => `- ${c}: PHP ${v.toFixed(0)}`).join("\n")}\nBy person:\n${Object.entries(bp).map(([p, v]) => `- ${p}: PHP ${v.toFixed(0)}`).join("\n")}\nTop 5:\n${t5x.map(e => `- ${e.description}: PHP ${e.amount}`).join("\n")}\nBudgets:\n${bStr}`;
    const IS = "You are Joseph and Rowena's personal finance advisor. Filipino couple. No emojis. No markdown. Plain conversational text. Give overview, category breakdown, patterns, 3-5 actionable tips with numbers.";
    try { const raw = await callAI([{ role: "user", content: sum }], IS); setIt(stripE(raw || "No insights.")); } catch { setIt("Failed to generate."); }
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
  const budgetChart = CATS.map(c => ({ name: c.slice(0, 5), full: c, budget: budgets[c] || 0, actual: mByCat[c] || 0 })).filter(d => d.budget > 0 || d.actual > 0);

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
    { id: "insights", label: "Insights", icon: Lightbulb },
    { id: "more", label: "More", icon: Settings }
  ];

  const Modal = ({ children }) => (
    <div style={{ position: "fixed", inset: 0, background: T.modalBg, zIndex: 999, display: "flex", justifyContent: "center", alignItems: "center", padding: isDesktop ? 40 : 20, backdropFilter: "blur(4px)" }}>
      <div style={{ background: T.modalSurface, border: `1px solid ${T.borderStrong}`, borderRadius: 24, padding: isDesktop ? 36 : 28, width: "100%", maxWidth: isDesktop ? 480 : 400, boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>{children}</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.gradBg, color: T.text1, display: "flex", flexDirection: isDesktop ? "row" : "column", fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      {toast && <div style={{ position: "fixed", top: 20, left: isDesktop ? "calc(50% + 120px)" : "50%", transform: "translateX(-50%)", background: T.toastBg, border: `1px solid ${T.toastBorder}`, color: T.gold, padding: "12px 24px", borderRadius: 14, fontSize: 13, fontWeight: 600, zIndex: 9999, boxShadow: "0 8px 32px rgba(245,181,38,0.15)", display: "flex", alignItems: "center", gap: 8 }}><Check size={16} />{toast}</div>}

      {/* Desktop Sidebar */}
      {isDesktop && (
        <div style={{ width: 250, minHeight: "100vh", background: T.surface, borderRight: `1px solid ${T.border}`, padding: "28px 0", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, alignSelf: "flex-start" }}>
          <div style={{ padding: "0 24px", marginBottom: 36 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: T.text1, letterSpacing: -0.5 }}>Expense<span style={{ color: T.gold }}>Tracker</span></h1>
            <p style={{ color: T.text3, fontSize: 11, margin: "4px 0 0" }}>Logged in as <span style={{ color: T.gold }}>{user}</span></p>
          </div>
          {tabs.map(t => {
            const I = t.icon;
            const a = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
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
                return <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px 4px", borderRadius: 12, border: "none", background: a ? T.goldMuted : "transparent", color: a ? T.gold : T.text3, fontSize: 10, fontWeight: 700, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, position: "relative" }}><I size={16} />{t.label}{a && <div style={{ position: "absolute", bottom: 2, width: 16, height: 2, borderRadius: 1, background: T.gold }} />}</button>;
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              {Object.entries(byP).map(([n, a]) => (<div key={n} style={cardS}><div style={{ fontSize: 11, color: T.text2, fontWeight: 600 }}>{n}</div><div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{fmt(a)}</div><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>{totF > 0 ? (a / totF * 100).toFixed(0) : 0}% of total</div></div>))}
            </div>

            {/* Charts grid — 2 cols on desktop, stacked on mobile */}
            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 18 }}>
              {pieD.length > 0 && (<div style={{ ...cardS }}><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>By Category</div>
                <ResponsiveContainer width="100%" height={isDesktop ? 260 : 200}><RPie><Pie data={pieD} cx="50%" cy="50%" innerRadius={isDesktop ? 65 : 55} outerRadius={isDesktop ? 100 : 85} dataKey="value" stroke="none">{pieD.map((_, i) => <Cell key={i} fill={cco[pieD[i].name] || T.text3} />)}</Pie><Tooltip content={<CTipLocal />} /></RPie></ResponsiveContainer>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: 10 }}>{pieD.map((d, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}><div style={{ width: 8, height: 8, borderRadius: 3, background: cco[d.name] || T.text3 }} /><span style={{ color: T.text2 }}>{d.name}: {fmt(d.value)}</span></div>)}</div>
              </div>)}

              {cBar.length > 0 && (<div style={{ ...cardS }}><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Category Breakdown</div>
                <ResponsiveContainer width="100%" height={isDesktop ? 260 : 180}><BarChart data={cBar}><XAxis dataKey="name" tick={{ fill: T.text3, fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: T.text3, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtS} /><Tooltip content={<CTipLocal />} /><Bar dataKey="value" radius={[8, 8, 0, 0]}>{cBar.map((d, i) => <Cell key={i} fill={cco[d.full] || T.gold} />)}</Bar></BarChart></ResponsiveContainer>
              </div>)}

              {dT.length > 1 && (<div style={{ ...cardS }}><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Spending Trend</div>
                <ResponsiveContainer width="100%" height={isDesktop ? 260 : 160}><LineChart data={dT}><CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"} /><XAxis dataKey="date" tick={{ fill: T.text3, fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: T.text3, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtS} /><Tooltip content={<CTipLocal />} /><Line type="monotone" dataKey="amount" stroke={T.gold} strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer>
              </div>)}

              {budgetChart.length > 0 && (<div style={{ ...cardS }}><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Budget vs Actual</div>
                <ResponsiveContainer width="100%" height={isDesktop ? 260 : 200}><BarChart data={budgetChart}><XAxis dataKey="name" tick={{ fill: T.text3, fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: T.text3, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtS} /><Tooltip content={<CTipLocal />} /><Legend wrapperStyle={{ fontSize: 10, color: T.text2 }} /><Bar dataKey="budget" fill={theme === "dark" ? "rgba(245,181,38,0.2)" : "rgba(212,155,31,0.15)"} radius={[6, 6, 0, 0]} name="Budget" /><Bar dataKey="actual" radius={[6, 6, 0, 0]} name="Actual">{budgetChart.map((d, i) => <Cell key={i} fill={d.actual > d.budget ? T.err : d.actual > d.budget * 0.8 ? T.goldLight : T.ok} />)}</Bar></BarChart></ResponsiveContainer>
              </div>)}
            </div>

            {t5.length > 0 && (<div style={{ ...cardS, marginTop: 18 }}><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Top 5 Expenses</div>
              {t5.map((e, i) => (<div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < t5.length - 1 ? `1px solid ${T.border}` : "none" }}><div><div style={{ fontSize: 13, fontWeight: 600 }}>{e.description || e.category}</div><div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>{e.date} -- {e.addedBy}</div></div><div style={{ fontSize: 15, fontWeight: 800, color: cco[e.category] || T.gold }}>{fmt(e.amount)}</div></div>))}
            </div>)}
          </div>
        )}

        {/* EXPENSES */}
        {tab === "expenses" && (
          <div style={{ flex: 1, maxWidth: mwExp, margin: "0 auto", padding: isDesktop ? "28px 36px 40px" : "18px 20px 80px", width: "100%", boxSizing: "border-box", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Expenses</div>
              <button onClick={() => { rstF(); setSf(true); }} style={{ ...btnP, padding: "10px 16px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><Plus size={14} />Add</button>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>{PERIODS.map(p => <button key={p} onClick={() => setPer(p)} style={pillS(per === p)}>{p}</button>)}</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              <div style={{ flex: 1, position: "relative" }}><Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.text3 }} /><input placeholder="Search..." value={sq} onChange={e => setSq(e.target.value)} style={{ ...inpS, paddingLeft: 32, fontSize: 12 }} /></div>
              <select value={cf} onChange={e => setCf(e.target.value)} style={{ ...inpS, width: "auto", fontSize: 12, minWidth: 80 }}><option value="All">All</option>{CATS.map(c => <option key={c} value={c}>{c}</option>)}</select>
            </div>
            <div style={{ fontSize: 11, color: T.text3, marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
              <span>{filt.length} expenses -- {fmt(totF)}</span>
              <button onClick={() => setSd(v => v === "desc" ? "asc" : "desc")} style={{ background: "none", border: "none", color: T.gold, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontWeight: 600 }}><ChevronDown size={12} />{sd === "desc" ? "Newest" : "Oldest"}</button>
            </div>
            {sorted.map(e => (
              <div key={e.id} style={{ ...cardS, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
                <div style={{ flex: 1 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: 3, background: cco[e.category] || T.text3 }} /><div style={{ fontSize: 13, fontWeight: 600 }}>{e.description || e.category}</div></div><div style={{ fontSize: 10, color: T.text3, marginTop: 4, marginLeft: 16 }}>{e.date} -- {e.addedBy} -- {e.category}</div></div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ fontSize: 15, fontWeight: 800 }}>{fmt(e.amount)}</div><button onClick={() => edF(e)} style={{ background: "none", border: "none", color: T.gold, cursor: "pointer", padding: 4 }}><Edit3 size={14} /></button><button onClick={() => setDc(e.id)} style={{ background: "none", border: "none", color: T.err, cursor: "pointer", padding: 4 }}><Trash2 size={14} /></button></div>
              </div>
            ))}
            {filt.length === 0 && <div style={{ textAlign: "center", color: T.text3, padding: 40, fontSize: 13 }}>No expenses found</div>}
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
              {pe && (
                <div style={{ ...cardS, marginBottom: 10, borderColor: T.borderStrong }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: T.gold }}>Confirm {pe.length} expense{pe.length > 1 ? "s" : ""}:</div>
                  {pe.map(e => <div key={e.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 12 }}><span style={{ color: T.text2 }}>{e.description || e.category} ({e.category})</span><span style={{ fontWeight: 700 }}>{fmt(e.amount)}</span></div>)}
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button onClick={confirmP} style={{ ...btnP, flex: 1, padding: 11, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><Check size={14} />Save</button>
                    <button onClick={rejectP} style={{ ...btnG, flex: 1, padding: 11, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><X size={14} />Discard</button>
                  </div>
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

        {/* INSIGHTS */}
        {tab === "insights" && (
          <div style={{ flex: 1, maxWidth: mwIns, margin: "0 auto", padding: isDesktop ? "28px 36px 40px" : "18px 20px 80px", width: "100%", boxSizing: "border-box", overflowY: "auto" }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>AI Insights</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>{["Weekly", "Monthly", "Quarterly", "Yearly"].map(p => <button key={p} onClick={() => setIp(p)} style={pillS(ip === p)}>{p}</button>)}</div>
            <button onClick={genIns} disabled={il} style={{ ...btnP, width: isDesktop ? "auto" : "100%", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: il ? 0.6 : 1, padding: isDesktop ? "15px 36px" : undefined }}>
              {il ? <><RefreshCw size={16} className="spin" />Generating...</> : <><Lightbulb size={16} />Generate {ip} Review</>}
            </button>
            {it && <div style={{ ...cardS, whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.8, color: T.text2 }}>{it}</div>}
          </div>
        )}

        {/* MORE */}
        {tab === "more" && (
          <div style={{ flex: 1, maxWidth: mwMore, margin: "0 auto", padding: isDesktop ? "28px 36px 40px" : "18px 20px 80px", width: "100%", boxSizing: "border-box", overflowY: "auto" }}>
            <div style={{ display: "flex", flexDirection: isDesktop ? "column" : "row", gap: 6, marginBottom: 18, ...(isDesktop ? { position: "absolute", width: 160 } : {}) }}>
              {["accounts", "budgets", "settings"].map(s => <button key={s} onClick={() => setSub(s)} style={pillS(sub === s)}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>)}
            </div>

            <div style={{ ...(isDesktop ? { marginLeft: 184 } : {}) }}>
              {sub === "accounts" && (<>
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

              {sub === "budgets" && (<>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Monthly Budgets</div>
                {!sbf ? (<>
                  <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 8 }}>
                    {CATS.map(c => (<div key={c} style={{ ...cardS, padding: "14px 16px" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: 3, background: cco[c] }} /><span style={{ fontSize: 13, fontWeight: 600 }}>{c}</span></div><span style={{ fontSize: 14, fontWeight: 800 }}>{fmt(budgets[c] || 0)}</span></div>
                      <div style={{ marginTop: 8, height: 5, borderRadius: 3, background: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 3, width: `${Math.min(100, ((mByCat[c] || 0) / (budgets[c] || 1)) * 100)}%`, background: (mByCat[c] || 0) > (budgets[c] || 0) ? T.err : (mByCat[c] || 0) > (budgets[c] || 0) * 0.8 ? T.goldLight : T.ok, transition: "width 0.3s" }} /></div>
                      <div style={{ fontSize: 10, color: T.text3, marginTop: 5 }}>Spent: {fmt(mByCat[c] || 0)} / {fmt(budgets[c] || 0)}</div></div>))}
                  </div>
                  <button onClick={() => { setBf({ ...budgets }); setSbf(true); }} style={{ ...btnG, width: "100%", marginTop: 8, borderColor: T.borderStrong, color: T.gold }}>Edit Budgets</button>
                </>) : (<>
                  <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 10 }}>
                    {CATS.map(c => (<div key={c} style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 8, height: 8, borderRadius: 3, background: cco[c], flexShrink: 0 }} /><span style={{ fontSize: 13, fontWeight: 600, width: 100, flexShrink: 0 }}>{c}</span><input type="number" inputMode="numeric" value={bf[c] || ""} onChange={e => setBf(v => ({ ...v, [c]: parseFloat(e.target.value) || 0 }))} style={{ ...inpS, flex: 1 }} /></div>))}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}><button onClick={saveBudgets} style={{ ...btnP, flex: 1 }}>Save</button><button onClick={() => setSbf(false)} style={{ ...btnG, flex: 1 }}>Cancel</button></div>
                </>)}
              </>)}

              {sub === "settings" && (<>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Settings</div>
                <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 8 }}>
                  <button onClick={exportCSV} style={{ ...cardS, width: "100%", padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}><Download size={18} style={{ color: T.gold }} /><div><div style={{ fontSize: 13, fontWeight: 600 }}>Export CSV</div><div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>Download all expenses</div></div></button>
                  <button onClick={() => setClr(true)} style={{ ...cardS, width: "100%", padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left", borderColor: `${T.err}30` }}><AlertTriangle size={18} style={{ color: T.err }} /><div><div style={{ fontSize: 13, fontWeight: 600, color: T.err }}>Clear All Data</div><div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>Remove everything permanently</div></div></button>
                </div>
              </>)}
            </div>
          </div>
        )}

        {/* MODALS */}
        {sf && <Modal><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>{eId ? "Edit" : "Add"} Expense</div><button onClick={rstF} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer" }}><X size={22} /></button></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input placeholder="Amount" type="number" inputMode="decimal" value={form.amount} onChange={e => setForm(v => ({ ...v, amount: e.target.value }))} style={inpS} />
            <select value={form.category} onChange={e => setForm(v => ({ ...v, category: e.target.value }))} style={inpS}>{CATS.map(c => <option key={c} value={c}>{c}</option>)}</select>
            <input placeholder="Description" value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} style={inpS} />
            <input type="date" value={form.date} onChange={e => setForm(v => ({ ...v, date: e.target.value }))} style={inpS} />
            <select value={form.addedBy} onChange={e => setForm(v => ({ ...v, addedBy: e.target.value }))} style={inpS}>{USERS.map(u => <option key={u} value={u}>{u}</option>)}</select>
            <button onClick={doSubmit} style={{ ...btnP, width: "100%" }}>{eId ? "Update" : "Add Expense"}</button>
          </div>
        </Modal>}

        {saf && <Modal><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>{eaId ? "Edit" : "Add"} Account</div><button onClick={rstAf} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer" }}><X size={22} /></button></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input placeholder="Account name" value={af.name} onChange={e => setAf(v => ({ ...v, name: e.target.value }))} style={inpS} />
            <input placeholder="Balance" type="number" inputMode="decimal" value={af.balance} onChange={e => setAf(v => ({ ...v, balance: e.target.value }))} style={inpS} />
            <select value={af.type} onChange={e => setAf(v => ({ ...v, type: e.target.value }))} style={inpS}><option value="savings">Savings</option><option value="checking">Checking</option><option value="investment">Investment</option><option value="other">Other</option></select>
            <button onClick={doAcct} style={{ ...btnP, width: "100%" }}>{eaId ? "Update" : "Add Account"}</button>
          </div>
        </Modal>}

        {dc && <Modal><div style={{ textAlign: "center" }}><AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} /><div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Delete expense?</div><div style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>This cannot be undone.</div><div style={{ display: "flex", gap: 8 }}><button onClick={() => delE(dc)} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Delete</button><button onClick={() => setDc(null)} style={{ ...btnG, flex: 1 }}>Cancel</button></div></div></Modal>}
        {dac && <Modal><div style={{ textAlign: "center" }}><AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} /><div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Delete account?</div><div style={{ display: "flex", gap: 8, marginTop: 20 }}><button onClick={() => delA(dac)} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Delete</button><button onClick={() => setDac(null)} style={{ ...btnG, flex: 1 }}>Cancel</button></div></div></Modal>}
        {clr && <Modal><div style={{ textAlign: "center" }}><AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} /><div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Clear ALL data?</div><div style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>This removes everything permanently.</div><div style={{ display: "flex", gap: 8 }}><button onClick={clearAll} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Clear All</button><button onClick={() => setClr(false)} style={{ ...btnG, flex: 1 }}>Cancel</button></div></div></Modal>}
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
      `}</style>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const toggle = () => setTheme(v => v === "dark" ? "light" : "dark");
  return user ? <MainApp user={user} onLogout={() => setUser(null)} theme={theme} toggleTheme={toggle} /> : <LoginScreen onLogin={setUser} theme={theme} toggleTheme={toggle} />;
}
