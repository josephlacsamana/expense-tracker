import { useState } from "react";
import { Plus, Trash2, Edit3, X, ChevronDown, ChevronRight, AlertTriangle, Coins, Bell } from "lucide-react";
import { useApp } from "../AppContext";
import { dIcons, DEBT_TYPES, fmt, td, uid } from "../constants";

export default function DebtsSection() {
  const { debts, dPays, svD, svDP, tst, user, theme, isDesktop, T, cardS, inpS, btnP, btnG, mOvS, mInS } = useApp();

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
  const [editPayForm, setEditPayForm] = useState({ amount: "", date: "", lateFee: "" });
  const [delPayId, setDelPayId] = useState(null);
  const [viewDt, setViewDt] = useState(null);
  const [expYears, setExpYears] = useState({});
  const [showAllPays, setShowAllPays] = useState({});

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
  const doEditPay = () => {
    if (!editPay) return;
    const amt = parseFloat(editPayForm.amount);
    if (!amt || isNaN(amt)) return;
    const updated = { ...editPay, amount: amt, date: editPayForm.date || editPay.date, lateFee: parseFloat(editPayForm.lateFee) || 0 };
    svDP(dPays.map(p => p.id === editPay.id ? updated : p), { upsert: updated });
    setEditPay(null); tst("Payment updated");
  };
  const doDelPay = (id) => {
    svDP(dPays.filter(p => p.id !== id), { deleteId: id });
    setDelPayId(null); tst("Payment deleted");
  };

  return (<>
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
            <button onClick={() => { setSpay(a.id); setPayAmt(a.minPayment > 0 ? String(a.minPayment) : ""); }} style={{ ...btnP, padding: "6px 12px", fontSize: 10 }}>Pay</button>
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

            const toggleMonth = (g) => {
              if (g.isCur) return;
              const defAmt = d.minPayment || 0;
              if (g.paid && g.pay) {
                svDP(dPays.filter(p => p.id !== g.pay.id), { deleteId: g.pay.id });
              } else {
                const dateStr = `${g.ym}-${String(g.day).padStart(2, "0")}`;
                const np = { id: uid(), debtId: d.id, amount: defAmt, date: dateStr, newBalance: 0, lateFee: 0, createdAt: Date.now() };
                svDP([np, ...dPays], { upsert: np });
              }
            };

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
            {grid.length > 0 && <>
              <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <div style={{ background: theme === "dark" ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "8px 12px", flex: 1, minWidth: 70 }}><div style={{ fontSize: 9, color: T.text3, fontWeight: 600, textTransform: "uppercase" }}>Paid</div><div style={{ fontSize: 16, fontWeight: 800, color: T.ok }}>{mPaid}</div></div>
                <div style={{ background: mMissed > 0 ? (theme === "dark" ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.06)") : (theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"), border: `1px solid ${mMissed > 0 ? "rgba(239,68,68,0.2)" : T.border}`, borderRadius: 10, padding: "8px 12px", flex: 1, minWidth: 70 }}><div style={{ fontSize: 9, color: T.text3, fontWeight: 600, textTransform: "uppercase" }}>Missed</div><div style={{ fontSize: 16, fontWeight: 800, color: mMissed > 0 ? T.err : T.text2 }}>{mMissed}</div></div>
                <div style={{ background: theme === "dark" ? "rgba(245,181,38,0.1)" : "rgba(245,181,38,0.06)", border: "1px solid rgba(245,181,38,0.2)", borderRadius: 10, padding: "8px 12px", flex: 1, minWidth: 70 }}><div style={{ fontSize: 9, color: T.text3, fontWeight: 600, textTransform: "uppercase" }}>Streak</div><div style={{ fontSize: 16, fontWeight: 800, color: T.gold }}>{streak}</div></div>
                <div style={{ background: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 12px", flex: 1, minWidth: 70 }}><div style={{ fontSize: 9, color: T.text3, fontWeight: 600, textTransform: "uppercase" }}>Total Paid</div><div style={{ fontSize: 14, fontWeight: 800, color: T.text1 }}>{fmt(totalPaid)}</div></div>
              </div>
              {totalFees > 0 && <div style={{ fontSize: 10, color: T.err, marginBottom: 8 }}>Total late fees: {fmt(totalFees)}</div>}

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
                  <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center" }}>
                    <input type="number" inputMode="decimal" placeholder={`Amount per month (default ${fmt(d.minPayment || 0)})`} value={bulkAmt} onChange={e => setBulkAmt(e.target.value)} style={{ ...inpS, flex: 1, padding: "8px 12px", fontSize: 11 }} />
                    <button onClick={markAllPaid} style={{ ...btnP, padding: "8px 14px", fontSize: 10, whiteSpace: "nowrap" }}>Mark all paid</button>
                  </div>
                </>;
              })()}
            </>}
            {!d.startDate && grid.length === 0 && <div style={{ fontSize: 11, color: T.text3, marginBottom: 8, padding: "6px 0", fontStyle: "italic" }}>Set a start date to see the monthly payment grid. Edit this debt to add one.</div>}

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

    {/* Debt form modal */}
    {sdf && <div style={mOvS}><div style={mInS}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>{edtId ? "Edit" : "Add"} Debt</div><button onClick={rstDf} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer" }}><X size={22} /></button></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div><input placeholder="Name (e.g. BPI Credit Card)" value={ddf.name} onChange={e => setDdf(v => ({ ...v, name: e.target.value }))} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>What is this debt for?</div></div>
        <div><select value={ddf.type} onChange={e => setDdf(v => ({ ...v, type: e.target.value }))} style={inpS}>{DEBT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>Type of debt</div></div>
        <div><input placeholder="Total amount owed" type="number" inputMode="decimal" value={ddf.totalAmount} onChange={e => setDdf(v => ({ ...v, totalAmount: e.target.value }))} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>Original loan/credit amount</div></div>
        <div><input placeholder="Current balance (leave blank if same)" type="number" inputMode="decimal" value={ddf.currentBalance} onChange={e => setDdf(v => ({ ...v, currentBalance: e.target.value }))} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>How much you still owe right now</div></div>
        <div><input placeholder="Due date (day of month, e.g. 15)" type="number" inputMode="numeric" value={ddf.dueDate} onChange={e => setDdf(v => ({ ...v, dueDate: e.target.value }))} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>Which day of the month is your payment due?</div></div>
        <div><input placeholder="Interest rate (APR %)" type="number" inputMode="decimal" value={ddf.interestRate} onChange={e => setDdf(v => ({ ...v, interestRate: e.target.value }))} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>Annual interest rate (e.g. 24 for 24%)</div></div>
        <div><input placeholder="Minimum monthly payment" type="number" inputMode="decimal" value={ddf.minPayment} onChange={e => setDdf(v => ({ ...v, minPayment: e.target.value }))} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>Required minimum payment each month</div></div>
        <div><input type="date" value={ddf.startDate} onChange={e => setDdf(v => ({ ...v, startDate: e.target.value }))} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>When did you start paying this debt? (for payment grid)</div></div>
        <button onClick={doDebt} style={{ ...btnP, width: "100%" }}>{edtId ? "Update" : "Add Debt"}</button>
      </div>
    </div></div>}

    {/* Payment modal */}
    {spay && <div style={mOvS}><div style={mInS}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>Record Payment</div><button onClick={() => { setSpay(null); setPayAmt(""); setPayDate(td()); setPayFee(""); }} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer" }}><X size={22} /></button></div>
      <div style={{ fontSize: 13, color: T.text2, marginBottom: 12 }}>{debts.find(d => d.id === spay)?.name}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div><input placeholder="Payment amount" type="number" inputMode="decimal" value={payAmt} onChange={e => setPayAmt(e.target.value)} style={inpS} autoFocus /><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>How much are you paying?</div></div>
        <div><input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>Payment date</div></div>
        <div><input placeholder="Late fee (optional)" type="number" inputMode="decimal" value={payFee} onChange={e => setPayFee(e.target.value)} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>Any late fee charged?</div></div>
        <button onClick={doPayment} style={{ ...btnP, width: "100%" }}>Record Payment</button>
      </div>
    </div></div>}

    {/* Delete debt modal */}
    {ddDc && <div style={mOvS}><div style={mInS}><div style={{ textAlign: "center" }}><AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} /><div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Delete this debt?</div><div style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>"{debts.find(d => d.id === ddDc)?.name}" and all its payment history will be removed.</div><div style={{ display: "flex", gap: 8 }}><button onClick={() => delDebt(ddDc)} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Delete</button><button onClick={() => setDdDc(null)} style={{ ...btnG, flex: 1 }}>Cancel</button></div></div></div></div>}

    {/* Delete payment modal */}
    {delPayId && <div style={mOvS}><div style={mInS}><div style={{ textAlign: "center" }}><AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} /><div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Delete this payment?</div><div style={{ display: "flex", gap: 8, marginTop: 16 }}><button onClick={() => doDelPay(delPayId)} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Delete</button><button onClick={() => setDelPayId(null)} style={{ ...btnG, flex: 1 }}>Cancel</button></div></div></div></div>}
  </>);
}
