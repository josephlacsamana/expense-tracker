import { useState } from "react";
import { Plus, Trash2, Edit3, X, ChevronDown, ChevronRight, AlertTriangle, Wallet, Coins, Clock, Bell, RefreshCw } from "lucide-react";
import { useApp } from "../AppContext";
import { aIcons, dIcons, DEBT_TYPES, CRYPTO_COINS, fmt, fmtS, td, uid, pld } from "../constants";

export default function AccountsTab() {
  const { exp, accts, budgets, genBudget, cats, rec, debts, dPays, acctHist, savGoals, catColors, svE, svA, svB, svCats, svGB, svR, svD, svDP, svAH, svSG, tst, user, theme, isDesktop, T, cardS, pillS, inpS, btnP, btnG, mOvS, mInS, cryptoPrices, cryptoLastUpdated, fetchCryptoPrices } = useApp();

  const [accSub, setAccSub] = useState("accounts");
  const [saf, setSaf] = useState(false);
  const [eaId, setEaId] = useState(null);
  const [af, setAf] = useState({ name: "", balance: "", type: "savings" });
  const [dac, setDac] = useState(null);
  const [sbf, setSbf] = useState(false);
  const [bf, setBf] = useState({});
  const [gbEdit, setGbEdit] = useState("");
  const [cgb, setCgb] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [delCat, setDelCat] = useState(null);
  const [renCat, setRenCat] = useState(null);
  const [renVal, setRenVal] = useState("");
  const [sdf, setSdf] = useState(false);
  const [edtId, setEdtId] = useState(null);
  const [ddf, setDdf] = useState({ name: "", type: "Credit Card", totalAmount: "", currentBalance: "", dueDate: "", interestRate: "", minPayment: "", startDate: "" });
  const [ddDc, setDdDc] = useState(null);
  const [spay, setSpay] = useState(null);
  const [payAmt, setPayAmt] = useState("");
  const [payDate, setPayDate] = useState(td());
  const [payFee, setPayFee] = useState("");
  const [bulkAmt, setBulkAmt] = useState("");
  const [editPay, setEditPay] = useState(null);
  const [showNoLimit, setShowNoLimit] = useState(false);
  // Savings goal states
  const [sgForm, setSgForm] = useState(false);
  const [sgEdit, setSgEdit] = useState(null);
  const [sgf, setSgf] = useState({ name: "", targetAmount: "", targetDate: "", currentAmount: "", currency: "PHP" });
  const [sgDel, setSgDel] = useState(null);
  const [sgAdd, setSgAdd] = useState(null);
  const [sgAddAmt, setSgAddAmt] = useState("");
  const [editPayForm, setEditPayForm] = useState({ amount: "", date: "", lateFee: "" });
  const [delPayId, setDelPayId] = useState(null);
  const [viewDt, setViewDt] = useState(null);
  const [expYears, setExpYears] = useState({});
  const [showAllPays, setShowAllPays] = useState({});

  // Computed
  const totA = accts.reduce((s, a) => s + a.balance, 0);
  const mStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const mExp = exp.filter(e => pld(e.date) >= mStart);
  const mByCat = mExp.reduce((a, e) => { a[e.category] = (a[e.category] || 0) + e.amount; return a; }, {});
  const mTot = mExp.reduce((s, e) => s + e.amount, 0);
  const gbPct = genBudget > 0 ? (mTot / genBudget) * 100 : 0;

  // Account CRUD
  const doAcct = () => {
    if (!af.name.trim() || !af.balance || isNaN(parseFloat(af.balance))) return;
    const en = { id: eaId || uid(), name: af.name.trim(), balance: parseFloat(parseFloat(af.balance).toFixed(2)), type: af.type, updatedAt: Date.now() };
    if (eaId) {
      const old = accts.find(a => a.id === eaId);
      svA(accts.map(a => a.id === eaId ? en : a), { upsert: en });
      if (old && old.balance !== en.balance) {
        svAH({ id: uid(), accountId: eaId, oldBalance: old.balance, newBalance: en.balance, change: parseFloat((en.balance - old.balance).toFixed(2)), reason: "manual", description: "Manual balance update", createdAt: Date.now() });
      }
      tst("Account updated");
    } else {
      svA([...accts, en], { upsert: en });
      svAH({ id: uid(), accountId: en.id, oldBalance: 0, newBalance: en.balance, change: en.balance, reason: "manual", description: "Account created", createdAt: Date.now() });
      tst("Account added");
    }
    rstAf();
  };
  const rstAf = () => { setAf({ name: "", balance: "", type: "savings" }); setEaId(null); setSaf(false); };
  const edA = (a) => { setAf({ name: a.name, balance: String(a.balance), type: a.type }); setEaId(a.id); setSaf(true); };
  const delA = (id) => { svA(accts.filter(a => a.id !== id), { deleteId: id }); setDac(null); tst("Account removed"); };
  const [viewAH, setViewAH] = useState(null);

  const saveBudgets = () => { svB(bf); setSbf(false); tst("Budgets saved"); };

  // Rename category
  const doRenCat = () => {
    const oldName = renCat;
    const newName = renVal.trim();
    if (!newName || newName === oldName || cats.includes(newName)) { setRenCat(null); setRenVal(""); return; }
    const newCats = cats.map(c => c === oldName ? newName : c);
    svCats(newCats);
    const ue = exp.map(e => e.category === oldName ? { ...e, category: newName } : e);
    svE(ue);
    const ur = rec.map(r => r.category === oldName ? { ...r, category: newName } : r);
    svR(ur);
    const nb = { ...budgets }; if (nb[oldName] !== undefined) { nb[newName] = nb[oldName]; delete nb[oldName]; } svB(nb);
    if (bf[oldName] !== undefined) { setBf(v => { const n = { ...v }; n[newName] = n[oldName]; delete n[oldName]; return n; }); }
    setRenCat(null); setRenVal("");
    tst(`Category renamed to "${newName}"`);
  };

  // Debt CRUD
  const doDebt = () => {
    if (!ddf.name.trim() || !ddf.totalAmount || isNaN(parseFloat(ddf.totalAmount))) return;
    const en = { id: edtId || uid(), name: ddf.name.trim(), type: ddf.type, totalAmount: parseFloat(parseFloat(ddf.totalAmount).toFixed(2)), currentBalance: parseFloat(parseFloat(ddf.currentBalance || ddf.totalAmount).toFixed(2)), dueDate: parseInt(ddf.dueDate) || null, interestRate: parseFloat(ddf.interestRate) || 0, minPayment: parseFloat(ddf.minPayment) || 0, startDate: ddf.startDate || null, addedBy: user, createdAt: edtId ? (debts.find(d => d.id === edtId)?.createdAt || Date.now()) : Date.now(), updatedAt: Date.now() };
    if (edtId) { svD(debts.map(d => d.id === edtId ? en : d), { upsert: en }); tst("Debt updated"); } else { svD([...debts, en], { upsert: en }); tst("Debt added"); }
    rstDf();
  };
  const rstDf = () => { setDdf({ name: "", type: "Credit Card", totalAmount: "", currentBalance: "", dueDate: "", interestRate: "", minPayment: "", startDate: "" }); setEdtId(null); setSdf(false); };
  const edDebt = (d) => { setDdf({ name: d.name, type: d.type, totalAmount: String(d.totalAmount), currentBalance: String(d.currentBalance), dueDate: d.dueDate ? String(d.dueDate) : "", interestRate: String(d.interestRate || ""), minPayment: String(d.minPayment || ""), startDate: d.startDate || "" }); setEdtId(d.id); setSdf(true); };
  const delDebt = (id) => {
    svD(debts.filter(d => d.id !== id), { deleteId: id });
    svDP(dPays.filter(p => p.debtId !== id));
    setDdDc(null); if (viewDt === id) setViewDt(null); tst("Debt removed");
  };
  const doPayment = () => {
    if (!spay || !payAmt || isNaN(parseFloat(payAmt))) return;
    const amt = parseFloat(parseFloat(payAmt).toFixed(2));
    const fee = parseFloat(payFee) || 0;
    const debt = debts.find(d => d.id === spay);
    if (!debt) return;
    const newBal = Math.max(0, debt.currentBalance - amt);
    const payment = { id: uid(), debtId: spay, amount: amt, date: payDate || td(), newBalance: newBal, lateFee: fee, createdAt: Date.now() };
    const updDebt = { ...debt, currentBalance: newBal, updatedAt: Date.now() };
    svD(debts.map(d => d.id === spay ? updDebt : d), { upsert: updDebt });
    svDP([payment, ...dPays], { upsert: payment });
    setSpay(null); setPayAmt(""); setPayDate(td()); setPayFee("");
    tst(`Payment of ${fmt(amt)} recorded`);
  };

  // Edit payment
  const doEditPay = () => {
    if (!editPay) return;
    const amt = parseFloat(editPayForm.amount);
    if (!amt || isNaN(amt)) return;
    const updated = { ...editPay, amount: amt, date: editPayForm.date || editPay.date, lateFee: parseFloat(editPayForm.lateFee) || 0 };
    svDP(dPays.map(p => p.id === editPay.id ? updated : p), { upsert: updated });
    setEditPay(null); tst("Payment updated");
  };

  // Delete payment
  const doDelPay = (id) => {
    svDP(dPays.filter(p => p.id !== id), { deleteId: id });
    setDelPayId(null); tst("Payment deleted");
  };

  return (
    <div style={{ flex: 1, maxWidth: isDesktop ? 1100 : 600, margin: "0 auto", padding: isDesktop ? "28px 36px 40px" : "18px 20px 80px", width: "100%", boxSizing: "border-box", overflowY: "auto" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {["accounts", "budgets", "debts", "savings"].map(s => { const dueCt = s === "debts" ? (() => { const today = new Date().getDate(); return debts.filter(d => d.currentBalance > 0 && d.dueDate).filter(d => { const diff = d.dueDate - today; return (diff >= 0 && diff <= 3) || (diff < 0 && diff >= -3); }).length; })() : 0; return (
          <button key={s} onClick={() => setAccSub(s)} style={{ ...pillS(accSub === s), display: "flex", alignItems: "center", gap: 5 }}>{s.charAt(0).toUpperCase() + s.slice(1)}{dueCt > 0 && <span style={{ background: T.err, color: "#FFF", fontSize: 9, fontWeight: 700, borderRadius: 8, padding: "1px 5px", minWidth: 14, textAlign: "center" }}>{dueCt}</span>}</button>
        ); })}
      </div>
      <div>
        {accSub === "accounts" && (<>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><div style={{ fontSize: 18, fontWeight: 800 }}>Accounts</div><button onClick={() => { rstAf(); setSaf(true); }} style={{ ...btnP, padding: "10px 16px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><Plus size={14} />Add</button></div>
          {accts.length > 0 && (<div style={{ background: `linear-gradient(135deg,${theme === "dark" ? "rgba(52,211,153,0.08)" : "rgba(5,150,105,0.06)"},transparent)`, border: `1px solid ${theme === "dark" ? "rgba(52,211,153,0.15)" : "rgba(5,150,105,0.15)"}`, borderRadius: 18, padding: "16px 18px", marginBottom: 18 }}><div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Net Worth</div><div style={{ fontSize: 30, fontWeight: 800, color: T.ok, marginTop: 2 }}>{fmt(totA)}</div></div>)}
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 8 }}>
            {accts.map(a => { const I = aIcons[a.type] || Wallet; const hist = acctHist.filter(h => h.accountId === a.id).sort((x, y) => y.createdAt - x.createdAt); const isEx = viewAH === a.id; return (
              <div key={a.id} style={{ ...cardS, padding: 0, overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 42, height: 42, borderRadius: 13, background: T.goldMuted, display: "flex", alignItems: "center", justifyContent: "center" }}><I size={18} style={{ color: T.gold }} /></div><div><div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div><div style={{ fontSize: 10, color: T.text3, textTransform: "capitalize" }}>{a.type}</div></div></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ fontSize: 16, fontWeight: 800, color: T.ok }}>{fmt(a.balance)}</div>
                    <button onClick={() => setViewAH(isEx ? null : a.id)} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer", padding: 4, display: "flex", alignItems: "center", gap: 2 }}><Clock size={13} /><span style={{ fontSize: 10 }}>{hist.length}</span></button>
                    <button onClick={() => edA(a)} style={{ background: "none", border: "none", color: T.gold, cursor: "pointer", padding: 4 }}><Edit3 size={14} /></button><button onClick={() => setDac(a.id)} style={{ background: "none", border: "none", color: T.err, cursor: "pointer", padding: 4 }}><Trash2 size={14} /></button></div>
                </div>
                {isEx && <div style={{ borderTop: `1px solid ${T.border}`, padding: "10px 16px", background: theme === "dark" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.text2, marginBottom: 8 }}>Balance History</div>
                  {hist.length === 0 && <div style={{ fontSize: 11, color: T.text3, padding: "8px 0" }}>No history recorded yet.</div>}
                  {hist.slice(0, 15).map(h => (<div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${T.border}` }}>
                    <div><div style={{ fontSize: 12, fontWeight: 600, color: h.change >= 0 ? T.ok : T.err }}>{h.change >= 0 ? "+" : ""}{fmt(h.change)}</div><div style={{ fontSize: 10, color: T.text3 }}>{h.description || h.reason}</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: T.text2 }}>{fmt(h.newBalance)}</div><div style={{ fontSize: 9, color: T.text3 }}>{new Date(h.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div></div>
                  </div>))}
                  {hist.length > 15 && <div style={{ fontSize: 10, color: T.text3, marginTop: 6, textAlign: "center" }}>...and {hist.length - 15} more</div>}
                </div>}
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
                  {renCat === c ? (
                    <input autoFocus value={renVal} onChange={e => setRenVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter") doRenCat(); if (e.key === "Escape") { setRenCat(null); setRenVal(""); } }} onBlur={doRenCat} style={{ fontSize: 12, fontWeight: 600, background: "transparent", border: `1px solid ${T.gold}`, borderRadius: 6, padding: "2px 6px", outline: "none", color: T.text1, width: 120 }} />
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 600, cursor: c !== "Other" ? "pointer" : "default" }} onClick={() => { if (c !== "Other") { setRenCat(c); setRenVal(c); } }}>{c}</span>
                  )}
                  {c !== "Other" && renCat !== c && <>
                    <button onClick={() => { setRenCat(c); setRenVal(c); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: T.gold }}><Edit3 size={12} /></button>
                    <button onClick={() => setDelCat(c)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: T.text3 }}><X size={14} /></button>
                  </>}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="text" placeholder="New category name" value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { const n = newCat.trim(); if (!n || cats.includes(n)) return; svCats([...cats.slice(0, -1), n, "Other"]); svB({ ...budgets, [n]: 0 }); setNewCat(""); tst(`Category "${n}" added`); } }} style={{ ...inpS, flex: 1 }} />
              <button onClick={() => { const n = newCat.trim(); if (!n || cats.includes(n)) return; svCats([...cats.slice(0, -1), n, "Other"]); svB({ ...budgets, [n]: 0 }); setNewCat(""); tst(`Category "${n}" added`); }} style={{ ...btnP, padding: "12px 20px", whiteSpace: "nowrap" }}>Add</button>
            </div>
          </div>
          {!sbf ? (() => { const catTotalView = cats.reduce((s, c) => s + (budgets[c] || 0), 0); const remainingView = genBudget > 0 ? genBudget - catTotalView : null; const overView = remainingView !== null && remainingView < 0; return (<>
            {genBudget > 0 && <div style={{ ...cardS, padding: "12px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text2 }}>Allocated: {fmt(catTotalView)} of {fmt(genBudget)}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: overView ? T.err : T.ok }}>{overView ? `Over by ${fmt(Math.abs(remainingView))}` : `${fmt(remainingView)} remaining`}</span>
            </div>}
            {overView && <div style={{ fontSize: 11, color: T.err, fontWeight: 600, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><AlertTriangle size={14} />Category totals exceed your general monthly budget. You can still save, but consider adjusting.</div>}
            {genBudget > 0 && <div style={{ fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 10 }}>Total spent this month: <span style={{ color: mTot > genBudget ? T.err : T.gold, fontWeight: 800 }}>{fmt(mTot)}</span> of {fmt(genBudget)} ({gbPct.toFixed(0)}%)</div>}
            {(() => { const withB = cats.filter(c => (budgets[c] || 0) > 0); const noB = cats.filter(c => !(budgets[c] > 0)); return (<>
              {withB.length > 0 && <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 8 }}>
                {withB.map(c => (<div key={c} style={{ ...cardS, padding: "14px 16px" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: 3, background: catColors[c] }} /><span style={{ fontSize: 13, fontWeight: 600 }}>{c}</span></div><span style={{ fontSize: 14, fontWeight: 800 }}>{fmt(budgets[c] || 0)}</span></div>
                  <div style={{ marginTop: 8, height: 5, borderRadius: 3, background: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 3, width: `${Math.min(100, ((mByCat[c] || 0) / (budgets[c] || 1)) * 100)}%`, background: (mByCat[c] || 0) > (budgets[c] || 0) ? T.err : (mByCat[c] || 0) > (budgets[c] || 0) * 0.8 ? T.goldLight : T.ok, transition: "width 0.3s" }} /></div>
                  <div style={{ fontSize: 10, color: T.text3, marginTop: 5 }}>Spent: {fmt(mByCat[c] || 0)} / {fmt(budgets[c] || 0)}</div></div>))}
              </div>}
              {noB.length > 0 && <div style={{ marginTop: withB.length > 0 ? 12 : 0 }}>
                <button onClick={() => setShowNoLimit(p => !p)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: "6px 0", color: T.text3, fontSize: 12, fontWeight: 600 }}>
                  {showNoLimit ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  {noB.length} {noB.length === 1 ? "category" : "categories"} with no budget limit
                </button>
                {showNoLimit && <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 8, marginTop: 6 }}>
                  {noB.map(c => (<div key={c} style={{ ...cardS, padding: "14px 16px" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: 3, background: catColors[c] }} /><span style={{ fontSize: 13, fontWeight: 600 }}>{c}</span></div><span style={{ fontSize: 14, fontWeight: 800, color: T.text3 }}>{fmt(0)}</span></div>
                    <div style={{ fontSize: 10, color: T.text3, marginTop: 5 }}>No limit set{(mByCat[c] || 0) > 0 ? ` — Spent: ${fmt(mByCat[c])}` : ""}</div></div>))}
                </div>}
              </div>}
            </>); })()}
            <button onClick={() => { setBf({ ...budgets }); setSbf(true); }} style={{ ...btnG, width: "100%", marginTop: 8, borderColor: T.borderStrong, color: T.gold }}>Edit Budgets</button>
          </>); })() : (() => { const catTotal = cats.reduce((s, c) => s + (bf[c] || 0), 0); const remaining = genBudget > 0 ? genBudget - catTotal : null; const overAllocated = remaining !== null && remaining < 0; return (<>
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
          {/* Payment alerts */}
          {(() => { const now = new Date(); const today = now.getDate(); const alerts = debts.filter(d => d.currentBalance > 0 && d.dueDate).map(d => { const diff = d.dueDate - today; const overdue = diff < 0 && diff >= -7; const dueToday = diff === 0; const dueSoon = diff > 0 && diff <= 3; if (!overdue && !dueToday && !dueSoon) return null; const overMonths = []; if (overdue && d.startDate) { const pays = dPays.filter(p => p.debtId === d.id); const paidYMs = new Set(pays.map(p => p.date.slice(0, 7))); const curYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`; if (!paidYMs.has(curYM)) overMonths.push(now.toLocaleDateString("en-PH", { month: "long", year: "numeric" })); const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1); const prevYM = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`; if (!paidYMs.has(prevYM)) overMonths.push(prev.toLocaleDateString("en-PH", { month: "long", year: "numeric" })); } return { ...d, overdue, dueToday, dueSoon, diff, overMonths }; }).filter(Boolean); if (!alerts.length) return null; return (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              {alerts.map(a => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: a.overdue ? (theme === "dark" ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.06)") : (theme === "dark" ? "rgba(245,181,38,0.1)" : "rgba(245,181,38,0.06)"), border: `1px solid ${a.overdue ? "rgba(239,68,68,0.25)" : "rgba(245,181,38,0.25)"}` }}>
                  <Bell size={14} style={{ color: a.overdue ? T.err : T.gold, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: a.overdue ? T.err : T.gold }}>{a.overdue ? `Overdue${a.overMonths.length ? ": " + a.overMonths.join(", ") : ""}` : a.dueToday ? "Due today" : `Due in ${a.diff} day${a.diff > 1 ? "s" : ""}`}</div>
                    <div style={{ fontSize: 11, color: T.text2 }}>{a.name} -- {fmt(a.minPayment > 0 ? a.minPayment : a.currentBalance)} {a.minPayment > 0 ? "min payment" : "balance"}</div>
                  </div>
                  <button onClick={() => { setSpay(a.id); setPayAmt(a.minPayment > 0 ? String(a.minPayment) : ""); setAccSub("debts"); }} style={{ ...btnP, padding: "6px 12px", fontSize: 10 }}>Pay</button>
                </div>
              ))}
            </div>); })()}
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
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 38, height: 38, borderRadius: 11, background: T.goldMuted, display: "flex", alignItems: "center", justifyContent: "center" }}><DI size={16} style={{ color: T.gold }} /></div><div><div style={{ fontSize: 13, fontWeight: 700 }}>{d.name}</div><div style={{ fontSize: 10, color: T.text3 }}>{d.type}{d.dueDate ? ` -- Due day ${d.dueDate}` : ""}{d.startDate ? ` -- Since ${new Date(d.startDate + "T00:00:00").toLocaleDateString("en-PH", { month: "short", year: "numeric" })}` : ""}</div></div></div>
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
                {isEx && (() => {
                  // Build monthly grid
                  const grid = [];
                  if (d.startDate) {
                    const s = new Date(d.startDate + "T00:00:00");
                    const now = new Date();
                    const cur = new Date(s.getFullYear(), s.getMonth(), 1);
                    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                    while (cur < end) {
                      const ym = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`;
                      const pay = pays.find(p => p.date.slice(0, 7) === ym);
                      const isThisMonth = cur.getFullYear() === now.getFullYear() && cur.getMonth() === now.getMonth();
                      const dueDay = d.dueDate || 15;
                      const isCur = isThisMonth && now.getDate() <= dueDay;
                      grid.push({ ym, label: cur.toLocaleDateString("en-PH", { month: "short", year: "2-digit" }), paid: !!pay, pay, isCur, day: Math.min(dueDay, 28) });
                      cur.setMonth(cur.getMonth() + 1);
                    }
                  }
                  const mPaid = grid.filter(g => g.paid).length;
                  const mMissed = grid.filter(g => !g.paid && !g.isCur).length;
                  const totalPaid = pays.reduce((s, p) => s + p.amount, 0);
                  const totalFees = pays.reduce((s, p) => s + (p.lateFee || 0), 0);
                  let streak = 0;
                  for (let i = grid.length - 1; i >= 0; i--) { if (grid[i].paid) streak++; else if (!grid[i].isCur) break; }

                  // Toggle month: click paid → remove, click unpaid → add with default amount
                  const toggleMonth = (g) => {
                    if (g.isCur) return;
                    const defAmt = d.minPayment || 0;
                    if (g.paid && g.pay) {
                      // Remove payment
                      svDP(dPays.filter(p => p.id !== g.pay.id), { deleteId: g.pay.id });
                    } else {
                      // Add payment
                      const dateStr = `${g.ym}-${String(g.day).padStart(2, "0")}`;
                      const np = { id: uid(), debtId: d.id, amount: defAmt, date: dateStr, newBalance: 0, lateFee: 0, createdAt: Date.now() };
                      svDP([np, ...dPays], { upsert: np });
                    }
                  };

                  // Mark all unpaid months as paid
                  const markAllPaid = () => {
                    const amt = parseFloat(bulkAmt) || d.minPayment || 0;
                    const unpaid = grid.filter(g => !g.paid && !g.isCur);
                    if (!unpaid.length) { tst("All months already paid"); return; }
                    const newPays = unpaid.map(g => ({ id: uid(), debtId: d.id, amount: amt, date: `${g.ym}-${String(g.day).padStart(2, "0")}`, newBalance: 0, lateFee: 0, createdAt: Date.now() }));
                    svDP([...newPays, ...dPays], { upsertMany: newPays });
                    setBulkAmt("");
                    tst(`${newPays.length} months marked as paid at ${fmt(amt)}`);
                  };

                  return <div style={{ borderTop: `1px solid ${T.border}`, padding: "10px 16px", background: theme === "dark" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)" }}>
                  {/* Payment stats */}
                  {grid.length > 0 && <>
                    <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                      <div style={{ background: theme === "dark" ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "8px 12px", flex: 1, minWidth: 70 }}><div style={{ fontSize: 9, color: T.text3, fontWeight: 600, textTransform: "uppercase" }}>Paid</div><div style={{ fontSize: 16, fontWeight: 800, color: T.ok }}>{mPaid}</div></div>
                      <div style={{ background: mMissed > 0 ? (theme === "dark" ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.06)") : (theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"), border: `1px solid ${mMissed > 0 ? "rgba(239,68,68,0.2)" : T.border}`, borderRadius: 10, padding: "8px 12px", flex: 1, minWidth: 70 }}><div style={{ fontSize: 9, color: T.text3, fontWeight: 600, textTransform: "uppercase" }}>Missed</div><div style={{ fontSize: 16, fontWeight: 800, color: mMissed > 0 ? T.err : T.text2 }}>{mMissed}</div></div>
                      <div style={{ background: theme === "dark" ? "rgba(245,181,38,0.1)" : "rgba(245,181,38,0.06)", border: "1px solid rgba(245,181,38,0.2)", borderRadius: 10, padding: "8px 12px", flex: 1, minWidth: 70 }}><div style={{ fontSize: 9, color: T.text3, fontWeight: 600, textTransform: "uppercase" }}>Streak</div><div style={{ fontSize: 16, fontWeight: 800, color: T.gold }}>{streak}</div></div>
                      <div style={{ background: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 12px", flex: 1, minWidth: 70 }}><div style={{ fontSize: 9, color: T.text3, fontWeight: 600, textTransform: "uppercase" }}>Total Paid</div><div style={{ fontSize: 14, fontWeight: 800, color: T.text1 }}>{fmt(totalPaid)}</div></div>
                    </div>
                    {totalFees > 0 && <div style={{ fontSize: 10, color: T.err, marginBottom: 8 }}>Total late fees: {fmt(totalFees)}</div>}

                    {/* Interactive monthly grid — grouped by year */}
                    {(() => {
                      const years = {};
                      grid.forEach(g => { const y = g.ym.slice(0, 4); if (!years[y]) years[y] = []; years[y].push(g); });
                      const yearKeys = Object.keys(years).sort();
                      const curYear = String(new Date().getFullYear());
                      return <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: T.text2 }}>Monthly Payments <span style={{ fontWeight: 400, color: T.text3 }}>(tap to toggle)</span></div>
                        </div>
                        {yearKeys.map(y => {
                          const yg = years[y];
                          const yPaid = yg.filter(g => g.paid).length;
                          const yMissed = yg.filter(g => !g.paid && !g.isCur).length;
                          const isOpen = expYears[`${d.id}-${y}`] !== undefined ? expYears[`${d.id}-${y}`] : (y === curYear || (yearKeys.length <= 2));
                          const toggleYear = () => setExpYears(v => ({ ...v, [`${d.id}-${y}`]: !isOpen }));
                          return <div key={y} style={{ marginBottom: 4 }}>
                            <div onClick={toggleYear} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0", cursor: "pointer", userSelect: "none" }}>
                              {isOpen ? <ChevronDown size={12} style={{ color: T.text3 }} /> : <ChevronRight size={12} style={{ color: T.text3 }} />}
                              <span style={{ fontSize: 11, fontWeight: 700, color: T.text2 }}>{y}</span>
                              {!isOpen && <span style={{ fontSize: 10, color: yMissed > 0 ? T.err : T.ok, fontWeight: 600 }}>
                                {yPaid}/{yg.length} paid{yMissed > 0 ? ` (${yMissed} missed)` : ""}
                              </span>}
                            </div>
                            {isOpen && <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 4, paddingLeft: 18 }}>
                              {yg.map(g => (
                                <div key={g.ym} onClick={() => toggleMonth(g)} title={`${g.label}: ${g.paid ? `Paid ${fmt(g.pay?.amount || 0)}` : g.isCur ? "Current month" : "Missed — tap to mark paid"}`} style={{ width: 32, height: 32, borderRadius: 6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 700, cursor: g.isCur ? "default" : "pointer", userSelect: "none", background: g.paid ? (theme === "dark" ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.15)") : g.isCur ? (theme === "dark" ? "rgba(245,181,38,0.2)" : "rgba(245,181,38,0.15)") : (theme === "dark" ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.1)"), color: g.paid ? T.ok : g.isCur ? T.gold : T.err, border: `1px solid ${g.paid ? "rgba(16,185,129,0.3)" : g.isCur ? "rgba(245,181,38,0.3)" : "rgba(239,68,68,0.2)"}`, transition: "all 0.15s" }}>
                                  <span>{g.label.split(" ")[0]}</span>
                                  <span style={{ fontSize: 6, opacity: 0.7 }}>{g.label.split(" ")[1]}</span>
                                </div>
                              ))}
                            </div>}
                          </div>;
                        })}
                        <div style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 9, color: T.text3 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: T.ok, display: "inline-block" }} />Paid</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: T.err, display: "inline-block" }} />Missed</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: T.gold, display: "inline-block" }} />Current</span>
                        </div>

                        {/* Mark all paid */}
                        <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center" }}>
                          <input type="number" inputMode="decimal" placeholder={`Amount per month (default ${fmt(d.minPayment || 0)})`} value={bulkAmt} onChange={e => setBulkAmt(e.target.value)} style={{ ...inpS, flex: 1, padding: "8px 12px", fontSize: 11 }} />
                          <button onClick={markAllPaid} style={{ ...btnP, padding: "8px 14px", fontSize: 10, whiteSpace: "nowrap" }}>Mark all paid</button>
                        </div>
                      </>;
                    })()}
                  </>}
                  {!d.startDate && grid.length === 0 && <div style={{ fontSize: 11, color: T.text3, marginBottom: 8, padding: "6px 0", fontStyle: "italic" }}>Set a start date to see the monthly payment grid. Edit this debt to add one.</div>}

                  {/* Payment history list */}
                  {(() => {
                    const showAll = showAllPays[d.id];
                    const limit = showAll ? pays.length : 5;
                    const visible = pays.slice(0, limit);
                    return <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, marginTop: grid.length > 0 ? 4 : 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.text2 }}>Payment History {pays.length > 0 && <span style={{ fontWeight: 400, color: T.text3 }}>({pays.length})</span>}</div>
                        <button onClick={() => { setSpay(d.id); setPayAmt(""); setPayDate(td()); setPayFee(""); }} style={{ ...btnG, padding: "4px 10px", fontSize: 10, display: "flex", alignItems: "center", gap: 3 }}><Plus size={10} />Add</button>
                      </div>
                      {pays.length === 0 && <div style={{ fontSize: 11, color: T.text3, padding: "8px 0" }}>No payments recorded yet.</div>}
                      {visible.map(p => editPay?.id === p.id ? (
                        <div key={p.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                            <input type="number" inputMode="decimal" placeholder="Amount" value={editPayForm.amount} onChange={e => setEditPayForm(v => ({ ...v, amount: e.target.value }))} style={{ ...inpS, flex: 1, padding: "7px 10px", fontSize: 12 }} />
                            <input type="date" value={editPayForm.date} onChange={e => setEditPayForm(v => ({ ...v, date: e.target.value }))} style={{ ...inpS, flex: 1, padding: "7px 10px", fontSize: 12 }} />
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <input type="number" inputMode="decimal" placeholder="Late fee (optional)" value={editPayForm.lateFee} onChange={e => setEditPayForm(v => ({ ...v, lateFee: e.target.value }))} style={{ ...inpS, flex: 1, padding: "7px 10px", fontSize: 12 }} />
                            <button onClick={doEditPay} style={{ ...btnP, padding: "7px 12px", fontSize: 10 }}>Save</button>
                            <button onClick={() => setEditPay(null)} style={{ ...btnG, padding: "7px 10px", fontSize: 10 }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${T.border}` }}>
                          <div><div style={{ fontSize: 12, fontWeight: 600, color: T.ok }}>{fmt(p.amount)}{p.lateFee > 0 && <span style={{ color: T.err, fontSize: 10, marginLeft: 6 }}>+{fmt(p.lateFee)} fee</span>}</div><div style={{ fontSize: 10, color: T.text3 }}>{p.date}</div></div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            {p.newBalance > 0 && <span style={{ fontSize: 11, color: T.text3, marginRight: 4 }}>Bal: {fmt(p.newBalance)}</span>}
                            <button onClick={() => { setEditPay(p); setEditPayForm({ amount: String(p.amount), date: p.date, lateFee: String(p.lateFee || "") }); }} style={{ background: "none", border: "none", color: T.gold, cursor: "pointer", padding: 2 }}><Edit3 size={11} /></button>
                            <button onClick={() => setDelPayId(p.id)} style={{ background: "none", border: "none", color: T.err, cursor: "pointer", padding: 2 }}><Trash2 size={11} /></button>
                          </div>
                        </div>
                      ))}
                      {pays.length > 5 && !showAll && <button onClick={() => setShowAllPays(v => ({ ...v, [d.id]: true }))} style={{ background: "none", border: "none", color: T.gold, cursor: "pointer", fontSize: 11, fontWeight: 600, padding: "8px 0", width: "100%", textAlign: "center" }}>Show all {pays.length} payments</button>}
                      {showAll && pays.length > 5 && <button onClick={() => setShowAllPays(v => ({ ...v, [d.id]: false }))} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer", fontSize: 11, fontWeight: 600, padding: "8px 0", width: "100%", textAlign: "center" }}>Show less</button>}
                    </>;
                  })()}
                </div>; })()}
              </div>); })}
          </div>
        </>)}

        {accSub === "savings" && (<>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Savings Goals</div>
            <button onClick={() => { setSgf({ name: "", targetAmount: "", targetDate: "", currentAmount: "", currency: "PHP" }); setSgEdit(null); setSgForm(true); }} style={{ ...btnP, padding: "10px 16px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><Plus size={14} />Add Goal</button>
          </div>

          {/* Summary card */}
          {/* Crypto prices last updated */}
          {savGoals.some(g => g.currency && g.currency !== "PHP") && cryptoLastUpdated && cryptoLastUpdated !== "null" && (
            <div style={{ fontSize: 10, color: T.text3, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Prices updated: {new Date(cryptoLastUpdated).toLocaleTimeString()}</span>
              <button onClick={fetchCryptoPrices} style={{ background: "none", border: "none", color: T.gold, cursor: "pointer", fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}><RefreshCw size={10} />Refresh</button>
            </div>
          )}

          {savGoals.length > 0 && (() => { const toPhp = (g) => { const c = g.currency || "PHP"; if (c === "PHP") return g.currentAmount; const p = cryptoPrices[c]; return p ? g.currentAmount * p.php : 0; }; const toPhpTarget = (g) => { const c = g.currency || "PHP"; if (c === "PHP") return g.targetAmount; const p = cryptoPrices[c]; return p ? g.targetAmount * p.php : 0; }; const totalTarget = savGoals.reduce((s, g) => s + toPhpTarget(g), 0); const totalSaved = savGoals.reduce((s, g) => s + toPhp(g), 0); const pctAll = totalTarget > 0 ? (totalSaved / totalTarget * 100) : 0; return (
            <div style={{ background: `linear-gradient(135deg,${theme === "dark" ? "rgba(245,181,38,0.08)" : "rgba(212,155,31,0.06)"},transparent)`, border: `1px solid ${theme === "dark" ? "rgba(245,181,38,0.15)" : "rgba(212,155,31,0.15)"}`, borderRadius: 18, padding: "16px 18px", marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Total Saved</div><div style={{ fontSize: 28, fontWeight: 800, color: T.gold, marginTop: 2 }}>{fmt(totalSaved)}</div></div>
                <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Target</div><div style={{ fontSize: 20, fontWeight: 700, color: T.text2, marginTop: 2 }}>{fmt(totalTarget)}</div></div>
              </div>
              <div style={{ marginTop: 10, height: 8, borderRadius: 4, background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 4, width: `${Math.min(100, pctAll)}%`, background: pctAll >= 100 ? T.ok : T.gold, transition: "width 0.3s" }} />
              </div>
              <div style={{ fontSize: 11, color: T.text3, marginTop: 6 }}>{savGoals.length} {savGoals.length === 1 ? "goal" : "goals"} -- {pctAll.toFixed(0)}% overall</div>
            </div>
          ); })()}

          {savGoals.length === 0 && <div style={{ ...cardS, padding: "32px 18px", textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.text2, marginBottom: 6 }}>No savings goals yet</div>
            <div style={{ fontSize: 12, color: T.text3 }}>Tap "Add Goal" to start saving for something.</div>
          </div>}

          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 10 }}>
            {savGoals.map(g => { const cur = g.currency || "PHP"; const isPhp = cur === "PHP"; const isUsd = cur === "USD"; const isCrypto = !isPhp && !isUsd; const cp = !isPhp ? cryptoPrices[cur] : null; const phpCur = !isPhp && cp ? g.currentAmount * cp.php : g.currentAmount; const phpTgt = !isPhp && cp ? g.targetAmount * cp.php : g.targetAmount; const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount * 100) : 0; const done = pct >= 100; const daysLeft = g.targetDate ? Math.max(0, Math.ceil((new Date(g.targetDate) - new Date()) / 86400000)) : null; const fmtForeign = (v, sym) => sym === "USD" ? `$${v < 1 ? v.toFixed(2) : new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)}` : `${v < 1 ? v.toFixed(6) : v < 100 ? v.toFixed(4) : v.toFixed(2)} ${sym}`; return (
              <div key={g.id} style={{ ...cardS, padding: "16px 18px", border: done ? `1px solid ${T.ok}` : cardS.border }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: done ? T.ok : T.text1 }}>{g.name}{!isPhp && <span style={{ fontSize: 10, fontWeight: 600, color: T.gold, marginLeft: 6, padding: "2px 6px", borderRadius: 6, background: T.goldMuted }}>{cur}</span>}</div>
                    {g.targetDate && <div style={{ fontSize: 10, color: daysLeft === 0 ? T.goldLight : T.text3, marginTop: 2 }}>{done ? "Goal reached!" : daysLeft === 0 ? "Due today" : `${daysLeft} days left`}</div>}
                    {done && !g.targetDate && <div style={{ fontSize: 10, color: T.ok, marginTop: 2, fontWeight: 600 }}>Goal reached!</div>}
                    {isCrypto && cp && cp.change24h !== 0 && <div style={{ fontSize: 10, color: cp.change24h >= 0 ? T.ok : T.err, marginTop: 2 }}>{cp.change24h >= 0 ? "+" : ""}{cp.change24h.toFixed(2)}% (24h)</div>}
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => { setSgEdit(g.id); setSgf({ name: g.name, targetAmount: String(g.targetAmount), targetDate: g.targetDate || "", currentAmount: String(g.currentAmount), currency: cur }); setSgForm(true); }} style={{ background: "none", border: "none", color: T.gold, cursor: "pointer", padding: 4 }}><Edit3 size={14} /></button>
                    <button onClick={() => setSgDel(g.id)} style={{ background: "none", border: "none", color: T.err, cursor: "pointer", padding: 4 }}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: !isPhp ? 2 : 6 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: done ? T.ok : T.gold }}>{isPhp ? fmt(g.currentAmount) : fmtForeign(g.currentAmount, cur)}</span>
                  <span style={{ fontSize: 12, color: T.text3 }}>of {isPhp ? fmt(g.targetAmount) : fmtForeign(g.targetAmount, cur)}</span>
                </div>
                {!isPhp && cp && <div style={{ fontSize: 11, color: T.text3, marginBottom: 6 }}>~{fmt(phpCur)} / {fmt(phpTgt)}</div>}
                <div style={{ height: 8, borderRadius: 4, background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 4, width: `${Math.min(100, pct)}%`, background: done ? T.ok : pct > 75 ? T.goldLight : T.gold, transition: "width 0.3s" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: T.text3 }}>{pct.toFixed(0)}%{g.targetAmount > g.currentAmount && ` -- ${isPhp ? fmt(g.targetAmount - g.currentAmount) : fmtForeign(g.targetAmount - g.currentAmount, cur)} to go`}</span>
                  {!done && <button onClick={() => { setSgAdd(g.id); setSgAddAmt(""); }} style={{ ...btnP, padding: "6px 14px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><Plus size={12} />Add Funds</button>}
                </div>
              </div>
            ); })}
          </div>
        </>)}
      </div>

      {/* Savings goal form modal */}
      {sgForm && <div style={mOvS}><div style={mInS}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>{sgEdit ? "Edit" : "Add"} Savings Goal</div>
          <button onClick={() => setSgForm(false)} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer" }}><X size={22} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div><input placeholder="Goal name (e.g. Vacation Fund, Bitcoin Stack)" value={sgf.name} onChange={e => setSgf(v => ({ ...v, name: e.target.value }))} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>What are you saving for?</div></div>
          <div>
            <select value={sgf.currency} onChange={e => setSgf(v => ({ ...v, currency: e.target.value }))} style={inpS}>
              <option value="PHP">PHP -- Philippine Peso</option>
              <option value="USD">USD -- US Dollar</option>
              <optgroup label="Crypto">
                {CRYPTO_COINS.map(c => <option key={c.symbol} value={c.symbol}>{c.symbol} -- {c.name}{cryptoPrices[c.symbol] ? ` (${fmt(cryptoPrices[c.symbol].php)})` : ""}</option>)}
              </optgroup>
            </select>
            <div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>Currency or crypto coin for this goal.</div>
          </div>
          <div><input placeholder={sgf.currency === "PHP" ? "Target amount" : sgf.currency === "USD" ? "Target in USD (e.g. 1000)" : `Target in ${sgf.currency} (e.g. 0.5)`} type="number" inputMode="decimal" step="any" value={sgf.targetAmount} onChange={e => setSgf(v => ({ ...v, targetAmount: e.target.value }))} style={inpS} />
            <div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>
              {sgf.currency !== "PHP" && sgf.targetAmount && cryptoPrices[sgf.currency] ? `~${fmt(parseFloat(sgf.targetAmount) * cryptoPrices[sgf.currency].php)} PHP` : "How much do you want to save?"}
            </div>
          </div>
          <div><input placeholder={sgf.currency === "PHP" ? "Already saved (optional)" : sgf.currency === "USD" ? "Already saved in USD (optional)" : `Already saved in ${sgf.currency} (optional)`} type="number" inputMode="decimal" step="any" value={sgf.currentAmount} onChange={e => setSgf(v => ({ ...v, currentAmount: e.target.value }))} style={inpS} />
            <div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>
              {sgf.currency !== "PHP" && sgf.currentAmount && cryptoPrices[sgf.currency] ? `~${fmt(parseFloat(sgf.currentAmount) * cryptoPrices[sgf.currency].php)} PHP` : "How much have you already saved toward this goal?"}
            </div>
          </div>
          <div><input type="date" value={sgf.targetDate} onChange={e => setSgf(v => ({ ...v, targetDate: e.target.value }))} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>Target date (optional). When do you want to reach this goal?</div></div>
          <button onClick={() => {
            if (!sgf.name.trim() || !sgf.targetAmount || parseFloat(sgf.targetAmount) <= 0) return;
            const notPhp = sgf.currency !== "PHP";
            const tgt = parseFloat(sgf.targetAmount);
            const cur = parseFloat(sgf.currentAmount || 0);
            const entry = { id: sgEdit || uid(), name: sgf.name.trim(), targetAmount: notPhp ? tgt : parseFloat(tgt.toFixed(2)), currentAmount: notPhp ? cur : parseFloat(cur.toFixed(2)), targetDate: sgf.targetDate || null, currency: sgf.currency, addedBy: user, createdAt: sgEdit ? (savGoals.find(g => g.id === sgEdit)?.createdAt || new Date().toISOString()) : new Date().toISOString(), updatedAt: new Date().toISOString() };
            const updated = sgEdit ? savGoals.map(g => g.id === sgEdit ? entry : g) : [...savGoals, entry];
            svSG(updated, { upsert: entry });
            setSgForm(false);
            tst(sgEdit ? "Goal updated" : "Goal added");
          }} style={{ ...btnP, width: "100%" }}>{sgEdit ? "Update Goal" : "Add Goal"}</button>
        </div>
      </div></div>}

      {/* Add funds modal */}
      {sgAdd && (() => { const addGoal = savGoals.find(g => g.id === sgAdd); const addCur = addGoal?.currency || "PHP"; const addIsForeign = addCur !== "PHP"; const addIsCrypto = addIsForeign && addCur !== "USD"; return <div style={mOvS}><div style={mInS}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>Add {addIsForeign ? addCur : "Funds"}</div>
          <button onClick={() => setSgAdd(null)} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer" }}><X size={22} /></button>
        </div>
        <div style={{ fontSize: 13, color: T.text2, marginBottom: 14 }}>Adding to: <strong>{addGoal?.name}</strong>{addIsForeign && <span style={{ color: T.gold, marginLeft: 4 }}>({addCur})</span>}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="number" inputMode="decimal" step="any" placeholder={addIsForeign ? `Amount in ${addCur}` : "Amount"} value={sgAddAmt} onChange={e => setSgAddAmt(e.target.value)} onKeyDown={e => { if (e.key === "Enter") document.getElementById("sgAddBtn")?.click(); }} style={{ ...inpS, flex: 1 }} autoFocus />
          <button id="sgAddBtn" onClick={() => {
            const amt = parseFloat(sgAddAmt);
            if (!amt || amt <= 0) return;
            const g = savGoals.find(g => g.id === sgAdd);
            if (!g) return;
            const isFgn = g.currency && g.currency !== "PHP";
            const updated = savGoals.map(x => x.id === sgAdd ? { ...x, currentAmount: isFgn ? x.currentAmount + amt : parseFloat((x.currentAmount + amt).toFixed(2)), updatedAt: new Date().toISOString() } : x);
            const upsertEntry = updated.find(x => x.id === sgAdd);
            svSG(updated, { upsert: upsertEntry });
            setSgAdd(null);
            tst(`Added ${isFgn ? (g.currency === "USD" ? "$" + amt : amt + " " + g.currency) : fmt(amt)} to ${g.name}`);
          }} style={{ ...btnP, padding: "12px 20px", whiteSpace: "nowrap" }}>Add</button>
        </div>
        {addIsForeign && sgAddAmt && cryptoPrices[addCur] && <div style={{ fontSize: 11, color: T.text3, marginTop: 8 }}>~{fmt(parseFloat(sgAddAmt) * cryptoPrices[addCur].php)} PHP</div>}
      </div></div>; })()}

      {/* Delete savings goal modal */}
      {sgDel && <div style={mOvS}><div style={mInS}><div style={{ textAlign: "center" }}>
        <AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} />
        <div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Delete this goal?</div>
        <div style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>"{savGoals.find(g => g.id === sgDel)?.name}" will be permanently removed.</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { svSG(savGoals.filter(g => g.id !== sgDel), { deleteId: sgDel }); setSgDel(null); tst("Goal deleted"); }} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Delete</button>
          <button onClick={() => setSgDel(null)} style={{ ...btnG, flex: 1 }}>Cancel</button>
        </div>
      </div></div></div>}

      {/* Account modal */}
      {saf && <div style={mOvS}><div style={mInS}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>{eaId ? "Edit" : "Add"} Account</div><button onClick={rstAf} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer" }}><X size={22} /></button></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input placeholder="Account name" value={af.name} onChange={e => setAf(v => ({ ...v, name: e.target.value }))} style={inpS} />
          <input placeholder="Balance" type="number" inputMode="decimal" value={af.balance} onChange={e => setAf(v => ({ ...v, balance: e.target.value }))} style={inpS} />
          <select value={af.type} onChange={e => setAf(v => ({ ...v, type: e.target.value }))} style={inpS}><option value="savings">Savings</option><option value="checking">Checking</option><option value="investment">Investment</option><option value="other">Other</option></select>
          <button onClick={doAcct} style={{ ...btnP, width: "100%" }}>{eaId ? "Update" : "Add Account"}</button>
        </div>
      </div></div>}

      {/* Delete account modal */}
      {dac && <div style={mOvS}><div style={mInS}><div style={{ textAlign: "center" }}><AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} /><div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Delete account?</div><div style={{ display: "flex", gap: 8, marginTop: 20 }}><button onClick={() => delA(dac)} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Delete</button><button onClick={() => setDac(null)} style={{ ...btnG, flex: 1 }}>Cancel</button></div></div></div></div>}

      {/* Clear budget modal */}
      {cgb && <div style={mOvS}><div style={mInS}><div style={{ textAlign: "center" }}><AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} /><div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Clear monthly budget?</div><div style={{ fontSize: 13, color: T.text3, marginBottom: 20 }}>This will remove your general monthly budget limit of {fmt(genBudget)}. The budget progress bar will no longer show on the dashboard.</div><div style={{ display: "flex", gap: 8 }}><button onClick={() => { svGB(0); setGbEdit(""); setCgb(false); tst("Budget cleared"); }} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Clear Budget</button><button onClick={() => setCgb(false)} style={{ ...btnG, flex: 1 }}>Cancel</button></div></div></div></div>}

      {/* Delete category modal */}
      {delCat && <div style={mOvS}><div style={mInS}><div style={{ textAlign: "center" }}><AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} /><div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Remove "{delCat}" category?</div><div style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>{exp.filter(e => e.category === delCat).length > 0 ? `${exp.filter(e => e.category === delCat).length} expense(s) will be reassigned to "Other".` : "No expenses in this category."} {rec.filter(r => r.category === delCat).length > 0 ? ` ${rec.filter(r => r.category === delCat).length} recurring template(s) will also be reassigned.` : ""}</div><div style={{ display: "flex", gap: 8 }}><button onClick={() => { const c = delCat; const newCats = cats.filter(x => x !== c); svCats(newCats); const ue = exp.map(e => e.category === c ? { ...e, category: "Other" } : e); svE(ue); const ur = rec.map(r => r.category === c ? { ...r, category: "Other" } : r); svR(ur); const nb = { ...budgets }; delete nb[c]; svB(nb); setDelCat(null); tst(`Category "${c}" removed`); }} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Remove</button><button onClick={() => setDelCat(null)} style={{ ...btnG, flex: 1 }}>Cancel</button></div></div></div></div>}

      {/* Debt modal */}
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
          <div><input type="date" value={ddf.startDate} onChange={e => setDdf(v => ({ ...v, startDate: e.target.value }))} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4, paddingLeft: 2 }}>When did you start paying this debt? (for payment tracking)</div></div>
          <button onClick={doDebt} style={{ ...btnP, width: "100%" }}>{edtId ? "Update" : "Add Debt"}</button>
        </div>
      </div></div>}

      {/* Payment modal */}
      {spay && <div style={mOvS}><div style={{ ...mInS, maxWidth: 380 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>Record Payment</div><button onClick={() => { setSpay(null); setPayAmt(""); setPayDate(td()); setPayFee(""); }} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer" }}><X size={22} /></button></div>
        <div style={{ fontSize: 13, color: T.text2, marginBottom: 14 }}>{debts.find(d => d.id === spay)?.name} -- Balance: {fmt(debts.find(d => d.id === spay)?.currentBalance || 0)}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input placeholder="Payment Amount" type="number" inputMode="decimal" value={payAmt} onChange={e => setPayAmt(e.target.value)} style={inpS} autoFocus />
          <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} style={inpS} />
          <div><input placeholder="Late fee / penalty (optional)" type="number" inputMode="decimal" value={payFee} onChange={e => setPayFee(e.target.value)} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4, paddingLeft: 2 }}>Any extra charges or penalties for this payment</div></div>
          <button onClick={doPayment} style={{ ...btnP, width: "100%" }}>Record Payment</button>
        </div>
      </div></div>}

      {/* Delete debt modal */}
      {ddDc && <div style={mOvS}><div style={mInS}><div style={{ textAlign: "center" }}><AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} /><div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Delete debt?</div><div style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>This will also remove all payment history for this debt.</div><div style={{ display: "flex", gap: 8 }}><button onClick={() => delDebt(ddDc)} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Delete</button><button onClick={() => setDdDc(null)} style={{ ...btnG, flex: 1 }}>Cancel</button></div></div></div></div>}

      {/* Delete payment modal */}
      {delPayId && <div style={mOvS}><div style={mInS}><div style={{ textAlign: "center" }}><AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} /><div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Delete this payment?</div><div style={{ display: "flex", gap: 8, marginTop: 20 }}><button onClick={() => doDelPay(delPayId)} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Delete</button><button onClick={() => setDelPayId(null)} style={{ ...btnG, flex: 1 }}>Cancel</button></div></div></div></div>}
    </div>
  );
}
