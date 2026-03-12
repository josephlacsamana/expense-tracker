import { useState } from "react";
import { ChevronRight, ArrowLeft, Wallet, PiggyBank, Target, TrendingDown, DollarSign } from "lucide-react";
import { useApp } from "../AppContext";
import { fmt, pld } from "../constants";
import BankAccountsSection from "../components/BankAccountsSection";
import BudgetsSection from "../components/BudgetsSection";
import DebtsSection from "../components/DebtsSection";
import SavingsSection from "../components/SavingsSection";
import IncomeSection from "../components/IncomeSection";

export default function AccountsTab() {
  const { exp, accts, genBudget, debts, savGoals, income, recIncome, isDesktop, T, cardS, cryptoPrices } = useApp();
  const [accSub, setAccSub] = useState("hub");

  const mStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const mExp = exp.filter(e => pld(e.date) >= mStart);
  const mTot = mExp.reduce((s, e) => s + e.amount, 0);
  const totA = accts.reduce((s, a) => s + a.balance, 0);
  const gbPct = genBudget > 0 ? (mTot / genBudget) * 100 : 0;

  const toPhpSG = (g) => { const c = g.currency || "PHP"; if (c === "PHP") return g.currentAmount; const p = cryptoPrices[c]; return p ? g.currentAmount * p.php : 0; };
  const toPhpTarget = (g) => { const c = g.currency || "PHP"; if (c === "PHP") return g.targetAmount; const p = cryptoPrices[c]; return p ? g.targetAmount * p.php : 0; };
  const totalSaved = savGoals.reduce((s, g) => s + toPhpSG(g), 0);
  const totalTarget = savGoals.reduce((s, g) => s + toPhpTarget(g), 0);

  const today = new Date().getDate();
  const debtDueCt = debts.filter(d => d.currentBalance > 0 && d.dueDate).filter(d => { const diff = d.dueDate - today; return (diff >= 0 && diff <= 3) || (diff < 0 && diff >= -3); }).length;
  const tOw = debts.reduce((s, d) => s + d.currentBalance, 0);
  const mInc = income.filter(i => pld(i.date) >= mStart).reduce((s, i) => s + i.amount, 0);
  const riDueCt = (() => { const now = new Date(); return recIncome.filter(r => { const nd = new Date(r.nextDate + "T00:00:00"); return nd <= now; }).length; })();

  const hubCards = [
    { key: "income", icon: DollarSign, label: "Income", value: income.length > 0 ? fmt(mInc) : "No income logged", sub: income.length > 0 ? `${income.filter(i => pld(i.date) >= mStart).length} entries this month` : "Tap to add", color: T.ok, badge: riDueCt },
    { key: "accounts", icon: Wallet, label: "Bank Accounts", value: fmt(totA), sub: `${accts.length} account${accts.length !== 1 ? "s" : ""}`, color: T.ok, badge: 0 },
    { key: "budgets", icon: Target, label: "Budgets", value: genBudget > 0 ? `${gbPct.toFixed(0)}% spent` : "No budget set", sub: genBudget > 0 ? `${fmt(mTot)} of ${fmt(genBudget)}` : "Tap to set up", color: genBudget > 0 ? (gbPct > 100 ? T.err : gbPct > 80 ? T.goldLight : T.ok) : T.text3, badge: 0 },
    { key: "debts", icon: TrendingDown, label: "Debts", value: debts.length > 0 ? fmt(tOw) : "No debts", sub: debts.length > 0 ? `${debts.length} debt${debts.length !== 1 ? "s" : ""} tracked` : "Tap to add", color: tOw > 0 ? T.err : T.ok, badge: debtDueCt },
    { key: "savings", icon: PiggyBank, label: "Savings Goals", value: savGoals.length > 0 ? <><span style={{ color: T.ok }}>{fmt(totalSaved)}</span><span style={{ color: T.text3, fontSize: isDesktop ? 16 : 14, fontWeight: 600 }}> / {fmt(totalTarget)}</span></> : "No goals yet", sub: savGoals.length > 0 ? `${savGoals.length} goal${savGoals.length !== 1 ? "s" : ""} -- ${totalTarget > 0 ? (totalSaved / totalTarget * 100).toFixed(0) : 0}% reached` : "Tap to start saving", color: T.gold, badge: 0 },
  ];

  return (
    <div style={{ flex: 1, maxWidth: isDesktop ? 1100 : 600, margin: "0 auto", padding: isDesktop ? "28px 36px 40px" : "18px 20px 80px", width: "100%", boxSizing: "border-box", overflowY: "auto" }}>
      {accSub === "hub" ? (<>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Money Hub</div>
        <div style={{ fontSize: 12, color: T.text3, marginBottom: 18 }}>Your finances at a glance</div>
        <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: isDesktop ? 14 : 10 }}>
          {hubCards.map(c => { const Icon = c.icon; return (
            <button key={c.key} onClick={() => setAccSub(c.key)} style={{ ...cardS, padding: isDesktop ? "22px 24px" : "18px 20px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 16, transition: "all 0.15s", border: cardS.border }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: T.goldMuted, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={22} style={{ color: T.gold }} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: 0.5 }}>{c.label}</span>
                  {c.badge > 0 && <span style={{ background: T.err, color: "#FFF", fontSize: 9, fontWeight: 700, borderRadius: 8, padding: "1px 6px", minWidth: 14, textAlign: "center" }}>{c.badge}</span>}
                </div>
                <div style={{ fontSize: isDesktop ? 22 : 20, fontWeight: 800, color: c.color, lineHeight: 1.2 }}>{c.value}</div>
                <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{c.sub}</div>
              </div>
              <ChevronRight size={18} style={{ color: T.text3, flexShrink: 0 }} />
            </button>
          ); })}
        </div>
      </>) : <div>
        <button onClick={() => setAccSub("hub")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: "0 0 14px", color: T.gold, fontSize: 13, fontWeight: 600 }}><ArrowLeft size={16} />Money Hub</button>
        <div>
          {accSub === "accounts" && <BankAccountsSection />}
          {accSub === "budgets" && <BudgetsSection />}
          {accSub === "debts" && <DebtsSection />}
          {accSub === "savings" && <SavingsSection />}
          {accSub === "income" && <IncomeSection />}
        </div>
      </div>}
    </div>
  );
}
