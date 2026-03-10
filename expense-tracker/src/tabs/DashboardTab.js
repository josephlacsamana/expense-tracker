import { useState } from "react";
import { TrendingUp, TrendingDown, Wallet, DollarSign } from "lucide-react";
import { PieChart as RPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { useApp } from "../AppContext";
import { PERIODS, fmt, fmtS, pld, startOf, prevRange } from "../constants";
import ChartTooltip from "../components/ChartTooltip";

export default function DashboardTab() {
  const { exp, accts, budgets, genBudget, cats, catColors, income, users, theme, isDesktop, T, cardS, pillS, inpS } = useApp();
  const [per, setPer] = useState("Monthly");
  const [pf, setPf] = useState("All");

  const ps = startOf(per);
  const filt = exp.filter(e => per === "All" || pld(e.date) >= ps).filter(e => pf === "All" || e.addedBy === pf);
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
  const cBar = Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([n, v]) => ({ name: n.length > 8 ? n.slice(0, 7) + ".." : n, full: n, value: v }));
  const totA = accts.reduce((s, a) => s + a.balance, 0);
  const mStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const mExp = exp.filter(e => pld(e.date) >= mStart);
  const mByCat = mExp.reduce((a, e) => { a[e.category] = (a[e.category] || 0) + e.amount; return a; }, {});
  const mTot = mExp.reduce((s, e) => s + e.amount, 0);
  const gbPct = genBudget > 0 ? (mTot / genBudget) * 100 : 0;
  const budgetChart = cats.map(c => ({ name: c.length > 8 ? c.slice(0, 7) + ".." : c, full: c, budget: budgets[c] || 0, actual: mByCat[c] || 0 })).filter(d => d.budget > 0 || d.actual > 0);
  const filtInc = income.filter(i => per === "All" || pld(i.date) >= ps).filter(i => pf === "All" || i.addedBy === pf);
  const totInc = filtInc.reduce((s, i) => s + i.amount, 0);
  const cashFlow = totInc - totF;

  return (
    <div style={{ flex: 1, maxWidth: isDesktop ? 1100 : 600, margin: "0 auto", padding: isDesktop ? "28px 36px 40px" : "18px 20px 80px", width: "100%", boxSizing: "border-box", overflowY: "auto" }}>
      {accts.length > 0 && (
        <div style={{ background: `linear-gradient(135deg,${theme === "dark" ? "rgba(52,211,153,0.08)" : "rgba(5,150,105,0.06)"},transparent)`, border: `1px solid ${theme === "dark" ? "rgba(52,211,153,0.15)" : "rgba(5,150,105,0.15)"}`, borderRadius: 18, padding: "16px 18px", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Total Balance</div><div style={{ fontSize: 26, fontWeight: 800, color: T.ok, marginTop: 2 }}>{fmt(totA)}</div></div>
          <Wallet size={26} style={{ color: "rgba(245,181,38,0.25)" }} />
        </div>
      )}
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        {PERIODS.filter(p => p !== "All").map(p => <button key={p} onClick={() => setPer(p)} style={pillS(per === p)}>{p}</button>)}
        {users.length > 1 && <select value={pf} onChange={e => setPf(e.target.value)} style={{ ...inpS, width: "auto", fontSize: 11, minWidth: 80, padding: "7px 32px 7px 10px", marginLeft: "auto" }}><option value="All">All</option>{users.map(u => <option key={u} value={u}>{u}</option>)}</select>}
      </div>

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

      {(totInc > 0 || totF > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr 1fr" : "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
          <div style={{ ...cardS, padding: isDesktop ? "14px 16px" : "12px 10px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}><DollarSign size={11} style={{ color: T.ok, flexShrink: 0 }} /><span style={{ fontSize: 9, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>Income</span></div>
            <div style={{ fontSize: isDesktop ? 20 : 14, fontWeight: 800, color: T.ok, whiteSpace: "nowrap" }}>{fmt(totInc)}</div>
          </div>
          <div style={{ ...cardS, padding: isDesktop ? "14px 16px" : "12px 10px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}><TrendingDown size={11} style={{ color: T.err, flexShrink: 0 }} /><span style={{ fontSize: 9, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>Expenses</span></div>
            <div style={{ fontSize: isDesktop ? 20 : 14, fontWeight: 800, color: T.err, whiteSpace: "nowrap" }}>{fmt(totF)}</div>
          </div>
          <div style={{ ...cardS, padding: isDesktop ? "14px 16px" : "12px 10px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}><Wallet size={11} style={{ color: cashFlow >= 0 ? T.ok : T.err, flexShrink: 0 }} /><span style={{ fontSize: 9, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>Net Flow</span></div>
            <div style={{ fontSize: isDesktop ? 20 : 14, fontWeight: 800, color: cashFlow >= 0 ? T.ok : T.err, whiteSpace: "nowrap" }}>{cashFlow >= 0 ? "+" : ""}{fmt(cashFlow)}</div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
        {Object.entries(byP).map(([n, a]) => (<div key={n} style={cardS}><div style={{ fontSize: 11, color: T.text2, fontWeight: 600 }}>{n}</div><div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{fmt(a)}</div><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>{totF > 0 ? (a / totF * 100).toFixed(0) : 0}% of total</div></div>))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 18 }}>
        {pieD.length > 0 && (<div style={{ ...cardS }}><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>By Category</div>
          <ResponsiveContainer width="100%" height={isDesktop ? 260 : 200}><RPie><Pie data={pieD} cx="50%" cy="50%" innerRadius={isDesktop ? 65 : 55} outerRadius={isDesktop ? 100 : 85} dataKey="value" stroke="none">{pieD.map((_, i) => <Cell key={i} fill={catColors[pieD[i].name] || T.text3} />)}</Pie><Tooltip content={<ChartTooltip />} /></RPie></ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: 10 }}>{pieD.map((d, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}><div style={{ width: 8, height: 8, borderRadius: 3, background: catColors[d.name] || T.text3 }} /><span style={{ color: T.text2 }}>{d.name}: {fmt(d.value)}</span></div>)}</div>
        </div>)}

        {cBar.length > 0 && (<div style={{ ...cardS }}><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Category Breakdown</div>
          <ResponsiveContainer width="100%" height={isDesktop ? 280 : 200}><BarChart data={cBar} margin={{ bottom: isDesktop ? 20 : 30 }}><XAxis dataKey="name" tick={{ fill: T.text3, fontSize: isDesktop ? 10 : 9 }} axisLine={false} tickLine={false} angle={isDesktop ? 0 : -35} textAnchor={isDesktop ? "middle" : "end"} interval={0} height={isDesktop ? 30 : 50} /><YAxis tick={{ fill: T.text3, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtS} /><Tooltip content={<ChartTooltip nameKey="full" />} /><Bar dataKey="value" radius={[8, 8, 0, 0]}>{cBar.map((d, i) => <Cell key={i} fill={catColors[d.full] || T.gold} />)}</Bar></BarChart></ResponsiveContainer>
        </div>)}

        {dT.length > 1 && (<div style={{ ...cardS }}><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Spending Trend</div>
          <ResponsiveContainer width="100%" height={isDesktop ? 260 : 160}><LineChart data={dT}><CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"} /><XAxis dataKey="date" tick={{ fill: T.text3, fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: T.text3, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtS} /><Tooltip content={<ChartTooltip />} /><Line type="monotone" dataKey="amount" stroke={T.gold} strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer>
        </div>)}

        {budgetChart.length > 0 && (<div style={{ ...cardS }}><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Budget vs Actual</div>
          <ResponsiveContainer width="100%" height={isDesktop ? 280 : 220}><BarChart data={budgetChart} margin={{ bottom: isDesktop ? 20 : 30 }}><XAxis dataKey="name" tick={{ fill: T.text3, fontSize: isDesktop ? 10 : 9 }} axisLine={false} tickLine={false} angle={isDesktop ? 0 : -35} textAnchor={isDesktop ? "middle" : "end"} interval={0} height={isDesktop ? 30 : 50} /><YAxis tick={{ fill: T.text3, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtS} /><Tooltip content={<ChartTooltip nameKey="full" />} /><Legend wrapperStyle={{ fontSize: 10 }} formatter={(v) => <span style={{ color: T.text2 }}>{v}</span>} /><Bar dataKey="budget" fill={theme === "dark" ? "rgba(245,181,38,0.35)" : "rgba(212,155,31,0.3)"} radius={[6, 6, 0, 0]} name="Budget" /><Bar dataKey="actual" radius={[6, 6, 0, 0]} name="Actual">{budgetChart.map((d, i) => <Cell key={i} fill={d.actual > d.budget ? T.err : d.actual > d.budget * 0.8 ? T.goldLight : T.ok} />)}</Bar></BarChart></ResponsiveContainer>
        </div>)}
      </div>

      {t5.length > 0 && (<div style={{ ...cardS, marginTop: 18 }}><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Top 5 Expenses</div>
        {t5.map((e, i) => (<div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < t5.length - 1 ? `1px solid ${T.border}` : "none" }}><div><div style={{ fontSize: 13, fontWeight: 600 }}>{e.description || e.category}</div><div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>{e.date} -- {e.addedBy}{e.accountId ? ` -- ${accts.find(a => a.id === e.accountId)?.name || ""}` : ""}</div></div><div style={{ fontSize: 15, fontWeight: 800, color: catColors[e.category] || T.gold }}>{fmt(e.amount)}</div></div>))}
      </div>)}
    </div>
  );
}
