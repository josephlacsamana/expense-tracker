import { createContext, useContext, useState, useEffect } from "react";
import { supabase, sbReady } from "./supabase";
import { themes, DEF_CATS, DEF_CCO, EXTRA_COLORS, DEFAULT_BUDGETS, CRYPTO_COINS, localStore } from "./constants";
import { useMediaQuery } from "./hooks";
import { sb } from "./db";

const AppContext = createContext(null);

export function AppProvider({ children, user, householdId, householdRole, profile, household, theme }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const T = themes[theme];

  // ─── STYLE HELPERS (available to all tabs via context) ───
  const pillS = (a) => ({
    padding: isDesktop ? "8px 18px" : "7px 14px", borderRadius: 20, fontSize: isDesktop ? 12 : 11, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
    border: a ? `1px solid ${T.gold}` : `1px solid ${T.pillInactiveBorder}`,
    background: a ? T.goldMuted : T.pillInactiveBg, color: a ? T.gold : T.text3,
  });
  const cardS = { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 18, boxShadow: T.cardShadow };
  const inpS = { width: "100%", padding: isDesktop ? "14px 16px" : "12px 14px", borderRadius: 12, fontSize: isDesktop ? 15 : 14, outline: "none", boxSizing: "border-box", border: `1px solid ${T.inputBorder}`, background: T.inputBg, color: T.text1 };
  const btnP = { padding: isDesktop ? "15px 24px" : "14px 20px", borderRadius: 14, border: "none", cursor: "pointer", background: T.grad, color: theme === "dark" ? "#0C0C12" : "#FFF", fontSize: isDesktop ? 15 : 14, fontWeight: 700, boxShadow: "0 4px 16px rgba(245,181,38,0.2)" };
  const btnG = { padding: isDesktop ? "15px 24px" : "14px 20px", borderRadius: 14, cursor: "pointer", fontSize: isDesktop ? 15 : 14, fontWeight: 600, border: `1px solid ${T.inputBorder}`, background: "transparent", color: T.text2 };
  const mOvS = { position: "fixed", inset: 0, background: T.modalBg, zIndex: 999, display: "flex", justifyContent: "center", alignItems: "center", padding: isDesktop ? 40 : 20, backdropFilter: "blur(4px)" };
  const mInS = { background: T.modalSurface, border: `1px solid ${T.borderStrong}`, borderRadius: 24, padding: isDesktop ? 36 : 28, width: "100%", maxWidth: isDesktop ? 480 : 400, boxShadow: "0 24px 64px rgba(0,0,0,0.3)" };

  // ─── GLOBAL DATA STATE ───
  const [exp, setExp] = useState([]);
  const [accts, setAccts] = useState([]);
  const [budgets, setBudgets] = useState(DEFAULT_BUDGETS);
  const [genBudget, setGenBudget] = useState(0);
  const [cats, setCats] = useState(DEF_CATS);
  const [rec, setRec] = useState([]);
  const [debts, setDebts] = useState([]);
  const [dPays, setDPays] = useState([]);
  const [acctHist, setAcctHist] = useState([]);
  const [insights, setInsights] = useState([]);
  const [savGoals, setSavGoals] = useState([]);
  const [income, setIncome] = useState([]);
  const [recIncome, setRecIncome] = useState([]);
  const [users, setUsers] = useState([user]);
  const [ld, setLd] = useState(true);
  const [toast, setToast] = useState(null);
  const [notifEnabled, setNotifEnabled] = useState(() => { try { return localStorage.getItem("notifEnabled") === "true"; } catch { return false; } });
  const [cryptoPrices, setCryptoPrices] = useState(() => { try { const c = localStorage.getItem("cryptoPrices"); return c ? JSON.parse(c) : {}; } catch { return {}; } });
  const [cryptoLastUpdated, setCryptoLastUpdated] = useState(() => { try { return localStorage.getItem("cryptoPricesTime") || null; } catch { return null; } });

  const tst = (m) => { setToast(m); setTimeout(() => setToast(null), 2500); };

  const catColors = (() => {
    let ei = 0;
    return cats.reduce((o, c) => {
      if (DEF_CCO[c]) { o[c] = DEF_CCO[c]; } else { o[c] = EXTRA_COLORS[ei % EXTRA_COLORS.length]; ei++; }
      return o;
    }, {});
  })();

  // ─── LOAD DATA ───
  useEffect(() => {
    (async () => {
      try {
        if (sbReady) {
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
            try { const ah = await sb.loadAccountHistory(householdId); if (ah.length) setAcctHist(ah); } catch {}
            try { const ins = await sb.loadInsights(householdId); if (ins.length) setInsights(ins); } catch {}
            try { const sg = await sb.loadSavingsGoals(householdId); if (sg.length) setSavGoals(sg); } catch {}
            try { const inc = await sb.loadIncome(householdId); if (inc.length) setIncome(inc); } catch {}
            try { const ri = await sb.loadRecurringIncome(householdId); if (ri.length) setRecIncome(ri); } catch {}
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
          setLd(false); return;
        }
        // ─── FALLBACK: LOAD FROM LOCALSTORAGE ───
        const r = await localStore.get("expenses");
        if (r?.value) {
          const p = JSON.parse(r.value);
          if (p.length > 0) {
            setExp(p);
            try { const a = await localStore.get("accounts"); if (a?.value) setAccts(JSON.parse(a.value)); } catch {}
            try { const b = await localStore.get("budgets"); if (b?.value) setBudgets(JSON.parse(b.value)); } catch {}
            try { const g = await localStore.get("genBudget"); if (g?.value) setGenBudget(JSON.parse(g.value)); } catch {}
            try { const rc = await localStore.get("recurring"); if (rc?.value) setRec(JSON.parse(rc.value)); } catch {}
            try { const ct = await localStore.get("categories"); if (ct?.value) { const pc = JSON.parse(ct.value); if (Array.isArray(pc) && pc.length > 0) setCats(pc); } } catch {}
            try { const dt = await localStore.get("debts"); if (dt?.value) setDebts(JSON.parse(dt.value)); } catch {}
            try { const dtp = await localStore.get("debtPayments"); if (dtp?.value) setDPays(JSON.parse(dtp.value)); } catch {}
            try { const ah = await localStore.get("acctHist"); if (ah?.value) setAcctHist(JSON.parse(ah.value)); } catch {}
            try { const ins = await localStore.get("insights"); if (ins?.value) setInsights(JSON.parse(ins.value)); } catch {}
            try { const sg = await localStore.get("savGoals"); if (sg?.value) setSavGoals(JSON.parse(sg.value)); } catch {}
            try { const inc = await localStore.get("income"); if (inc?.value) setIncome(JSON.parse(inc.value)); } catch {}
            try { const ri = await localStore.get("recIncome"); if (ri?.value) setRecIncome(JSON.parse(ri.value)); } catch {}
            setLd(false); return;
          }
        }
      } catch (e) { console.error(e); }
      setLd(false);
    })();
  }, [householdId]); // eslint-disable-line react-hooks/exhaustive-deps

  const [memberProfiles, setMemberProfiles] = useState([]);

  // ─── LOAD HOUSEHOLD MEMBERS ───
  useEffect(() => {
    if (sbReady && householdId) {
      supabase.from("household_members").select("user_id, role").eq("household_id", householdId)
        .then(async ({ data: members }) => {
          if (!members?.length) return;
          const ids = members.map(m => m.user_id);
          const { data: profiles } = await supabase.from("profiles").select("id, display_name, email, avatar_url").in("id", ids);
          if (profiles?.length) {
            const merged = profiles.map(p => ({ ...p, role: members.find(m => m.user_id === p.id)?.role || "member" }));
            setMemberProfiles(merged);
            setUsers(profiles.map(p => p.display_name).filter(Boolean));
          }
        });
    }
  }, [householdId]);

  // ─── SAVE FUNCTIONS ───
  const svE = async (d, opts) => { setExp(d); try { if (sbReady) { if (opts?.deleteId) await sb.deleteExpense(opts.deleteId, householdId); else if (opts?.upsert) await sb.upsertExpense(opts.upsert, householdId); else if (opts?.upsertMany) await sb.upsertExpenses(opts.upsertMany, householdId); else await sb.upsertExpenses(d, householdId); } else await localStore.set("expenses", JSON.stringify(d)); } catch {} };
  const svA = async (d, opts) => { setAccts(d); try { if (sbReady) { if (opts?.deleteId) await sb.deleteAccount(opts.deleteId, householdId); else if (opts?.upsert) await sb.upsertAccount(opts.upsert, householdId); else await supabase.from("accounts").upsert(d.map(a => ({ id: a.id, name: a.name, balance: a.balance, type: a.type, household_id: householdId, updated_at: a.updatedAt }))); } else await localStore.set("accounts", JSON.stringify(d)); } catch {} };
  const svB = async (d) => { setBudgets(d); try { if (sbReady) await sb.saveSetting("budgets", d, householdId); else await localStore.set("budgets", JSON.stringify(d)); } catch {} };
  const svCats = async (d) => { setCats(d); try { if (sbReady) await sb.saveCategories(d, householdId); else await localStore.set("categories", JSON.stringify(d)); } catch {} };
  const svGB = async (v) => { setGenBudget(v); try { if (sbReady) await sb.saveSetting("genBudget", v, householdId); else await localStore.set("genBudget", JSON.stringify(v)); } catch {} };
  const svR = async (d, opts) => { setRec(d); try { if (sbReady) { if (opts?.deleteId) await sb.deleteRecurring(opts.deleteId, householdId); else if (opts?.upsert) await sb.upsertRecurring(opts.upsert, householdId); else if (opts?.upsertMany) await sb.upsertRecurringBulk(opts.upsertMany, householdId); else await sb.upsertRecurringBulk(d, householdId); } else await localStore.set("recurring", JSON.stringify(d)); } catch {} };
  const svD = async (d, opts) => { setDebts(d); try { if (sbReady) { if (opts?.deleteId) await sb.deleteDebt(opts.deleteId, householdId); else if (opts?.upsert) await sb.upsertDebt(opts.upsert, householdId); } else await localStore.set("debts", JSON.stringify(d)); } catch {} };
  const svDP = async (d, opts) => { setDPays(d); try { if (sbReady) { if (opts?.deleteId) await sb.deleteDebtPayment(opts.deleteId, householdId); else if (opts?.upsert) await sb.upsertDebtPayment(opts.upsert, householdId); else if (opts?.upsertMany) await sb.upsertDebtPayments(opts.upsertMany, householdId); } else await localStore.set("debtPayments", JSON.stringify(d)); } catch {} };
  const svAH = async (entry) => { setAcctHist(prev => [entry, ...prev]); try { if (sbReady) await sb.upsertAccountHistory(entry, householdId); else await localStore.set("acctHist", JSON.stringify([entry, ...acctHist])); } catch {} };
  const svIns = async (entry) => { setInsights(prev => [entry, ...prev].slice(0, 20)); try { if (sbReady) await sb.upsertInsight(entry, householdId); else await localStore.set("insights", JSON.stringify([entry, ...insights].slice(0, 20))); } catch {} };
  const delIns = async (id) => { setInsights(prev => prev.filter(i => i.id !== id)); try { if (sbReady) await sb.deleteInsight(id, householdId); else await localStore.set("insights", JSON.stringify(insights.filter(i => i.id !== id))); } catch {} };
  const svSG = async (d, opts) => { setSavGoals(d); try { if (sbReady) { if (opts?.deleteId) await sb.deleteSavingsGoal(opts.deleteId, householdId); else if (opts?.upsert) await sb.upsertSavingsGoal(opts.upsert, householdId); } else await localStore.set("savGoals", JSON.stringify(d)); } catch {} };
  const svI = async (d, opts) => { setIncome(d); try { if (sbReady) { if (opts?.deleteId) await sb.deleteIncome(opts.deleteId, householdId); else if (opts?.upsert) await sb.upsertIncome(opts.upsert, householdId); } else await localStore.set("income", JSON.stringify(d)); } catch (e) { console.error("svI error:", e); } };
  const svRI = async (d, opts) => { setRecIncome(d); try { if (sbReady) { if (opts?.deleteId) await sb.deleteRecurringIncome(opts.deleteId, householdId); else if (opts?.upsert) await sb.upsertRecurringIncome(opts.upsert, householdId); } else await localStore.set("recIncome", JSON.stringify(d)); } catch (e) { console.error("svRI error:", e); } };

  // ─── AI ───
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

  // ─── PUSH NOTIFICATIONS (SW + daily check) ───
  const toggleNotif = async () => {
    if (!notifEnabled) {
      if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
        const isInApp = /GSA\/|FBAN|FBAV|Instagram|Twitter|Line\//i.test(navigator.userAgent);
        if (isInApp) { tst("Open rxpenses.com in Safari or Chrome, not in-app browser"); }
        else if (isIOS && !isStandalone) { tst("Open in Safari > Add to Home Screen > then enable notifications"); }
        else { tst("Notifications not supported in this browser"); }
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { tst("Notification permission denied"); return; }
      try {
        await navigator.serviceWorker.register("/sw.js");
        const reg = await navigator.serviceWorker.ready;
        // Clear daily gate so notifications trigger immediately
        localStorage.removeItem("lastNotifCheck");
        // Send immediate check with current data
        reg.active?.postMessage({ type: "CHECK_NOTIFICATIONS", debts, recurring: rec, today: new Date().toISOString().slice(0, 10) });
      } catch {}
      localStorage.setItem("notifEnabled", "true");
      setNotifEnabled(true);
      tst("Notifications enabled");
    } else {
      localStorage.setItem("notifEnabled", "false");
      setNotifEnabled(false);
      tst("Notifications disabled");
    }
  };

  // Daily check: send data to SW for local notifications
  useEffect(() => {
    if (!notifEnabled || !("serviceWorker" in navigator)) return;
    // Wait until we have actual data loaded before checking
    if (!debts.length && !rec.length) return;
    const sendToSW = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
        const reg = await navigator.serviceWorker.ready;
        // Wait for SW to be active (handles first install)
        const sw = reg.active || reg.installing || reg.waiting;
        if (!sw) return;
        if (sw.state !== "activated") {
          await new Promise(resolve => {
            sw.addEventListener("statechange", () => { if (sw.state === "activated") resolve(); });
            setTimeout(resolve, 3000); // timeout fallback
          });
        }
        const today = new Date().toISOString().slice(0, 10);
        const lastCheck = localStorage.getItem("lastNotifCheck");
        if (lastCheck === today) return;
        localStorage.setItem("lastNotifCheck", today);
        reg.active?.postMessage({ type: "CHECK_NOTIFICATIONS", debts, recurring: rec, today });
      } catch {}
    };
    sendToSW();
    const interval = setInterval(() => {
      // Reset the daily gate each interval check (allows re-check if day changed)
      const today = new Date().toISOString().slice(0, 10);
      const lastCheck = localStorage.getItem("lastNotifCheck");
      if (lastCheck !== today) sendToSW();
    }, 1000 * 60 * 60); // hourly re-check
    return () => clearInterval(interval);
  }, [notifEnabled, debts, rec]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── CRYPTO PRICES (CoinGecko free API) ───
  const fetchCryptoPrices = async () => {
    try {
      const ids = CRYPTO_COINS.map(c => c.id).join(",");
      const r = await fetch(`/api/crypto?ids=${ids}`);
      if (!r.ok) return;
      const d = await r.json();
      // Transform: { bitcoin: { php: 5000000, usd: 95000, php_24h_change: 1.5 }, ... }
      const prices = {};
      CRYPTO_COINS.forEach(c => {
        if (d[c.id]) prices[c.symbol] = { php: d[c.id].php || 0, usd: d[c.id].usd || 0, change24h: d[c.id].php_24h_change || 0 };
      });
      // Derive USD→PHP rate from BTC prices (php/usd)
      if (d.bitcoin?.php && d.bitcoin?.usd) prices["USD"] = { php: d.bitcoin.php / d.bitcoin.usd, usd: 1, change24h: 0 };
      setCryptoPrices(prices);
      const now = new Date().toISOString();
      setCryptoLastUpdated(now);
      localStorage.setItem("cryptoPrices", JSON.stringify(prices));
      localStorage.setItem("cryptoPricesTime", now);
    } catch (e) { console.error("[crypto]", e); }
  };

  // Fetch on load + every 5 min
  useEffect(() => {
    // Check if any savings goals use crypto, or just always fetch for quick display
    const hasCrypto = savGoals.some(g => g.currency && g.currency !== "PHP");
    const cacheAge = cryptoLastUpdated ? (Date.now() - new Date(cryptoLastUpdated).getTime()) : Infinity;
    if (hasCrypto || cacheAge > 300000) fetchCryptoPrices();
    const iv = setInterval(fetchCryptoPrices, 300000); // 5 min
    return () => clearInterval(iv);
  }, [savGoals.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── REFRESH ALL DATA (pull-to-refresh) ───
  const refreshData = async () => {
    try {
      // Check for new service worker (new code deploy) and force reload if found
      if ("serviceWorker" in navigator) {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg) {
            await reg.update();
            if (reg.waiting || reg.installing) {
              // New SW found — clear caches and hard reload to get new JS
              reg.waiting?.postMessage({ type: "FORCE_UPDATE" });
              reg.installing?.postMessage({ type: "FORCE_UPDATE" });
              tst("Updating app...");
              setTimeout(() => window.location.reload(), 500);
              return;
            }
          }
        } catch {}
      }
      if (sbReady) {
        const d = await sb.loadAll(householdId);
        setExp(d.expenses);
        setAccts(d.accounts);
        if (d.budgets) setBudgets(d.budgets);
        if (d.genBudget !== null) setGenBudget(d.genBudget);
        setRec(d.recurring);
        setDebts(d.debts);
        setDPays(d.debtPayments);
        if (d.categories) setCats(d.categories);
        try { const ah = await sb.loadAccountHistory(householdId); setAcctHist(ah); } catch {}
        try { const ins = await sb.loadInsights(householdId); setInsights(ins); } catch {}
        try { const sg = await sb.loadSavingsGoals(householdId); setSavGoals(sg); } catch {}
        try { const inc = await sb.loadIncome(householdId); setIncome(inc); } catch {}
        try { const ri = await sb.loadRecurringIncome(householdId); setRecIncome(ri); } catch {}
      }
      tst("Data refreshed");
    } catch (e) { console.error("[refresh]", e); tst("Refresh failed"); }
  };

  const value = {
    // Auth & identity
    user, householdId, householdRole, profile, household, theme, isDesktop, T,
    // Styles
    pillS, cardS, inpS, btnP, btnG, mOvS, mInS,
    // Data
    exp, accts, budgets, genBudget, cats, rec, debts, dPays, acctHist, insights, savGoals, income, recIncome, users, memberProfiles, ld, toast,
    // Setters (for local use by tabs)
    setExp, setAccts, setBudgets, setGenBudget, setCats, setRec, setDebts, setDPays, setAcctHist, setSavGoals, setIncome, setRecIncome,
    // Actions
    tst, catColors,
    // Save functions
    svE, svA, svB, svCats, svGB, svR, svD, svDP, svAH, svIns, delIns, svSG, svI, svRI,
    // AI
    callAI,
    // Notifications
    notifEnabled, toggleNotif,
    // Refresh
    refreshData,
    // Crypto
    cryptoPrices, cryptoLastUpdated, fetchCryptoPrices,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
