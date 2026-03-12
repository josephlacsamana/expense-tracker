import { useState } from "react";
import { Plus, Trash2, Edit3, X, Clock, AlertTriangle, Wallet } from "lucide-react";
import { useApp } from "../AppContext";
import { aIcons, fmt, td, uid, pld } from "../constants";

export default function BankAccountsSection() {
  const { exp, accts, acctHist, svA, svAH, tst, theme, isDesktop, T, cardS, inpS, btnP, btnG, mOvS, mInS } = useApp();

  const [saf, setSaf] = useState(false);
  const [eaId, setEaId] = useState(null);
  const [af, setAf] = useState({ name: "", balance: "", type: "savings" });
  const [dac, setDac] = useState(null);
  const [viewAH, setViewAH] = useState(null);
  const [adjAcct, setAdjAcct] = useState(null);
  const [adjAmt, setAdjAmt] = useState("");
  const [adjNote, setAdjNote] = useState("");
  const [adjMode, setAdjMode] = useState("add");

  const totA = accts.reduce((s, a) => s + a.balance, 0);

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

  return (<>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 8 }}><div style={{ fontSize: 18, fontWeight: 800 }}>Accounts</div>
      <div style={{ display: "flex", gap: 6 }}>
        {accts.length > 0 && exp.some(e => e.accountId) && acctHist.filter(h => h.reason === "expense" || h.reason === "expense_backfill").length < exp.filter(e => e.accountId).length && (
          <button onClick={() => {
            const linked = exp.filter(e => e.accountId && !acctHist.some(h => h.description === (e.description || e.category) && h.accountId === e.accountId && Math.abs(h.change) === e.amount));
            if (!linked.length) { tst("No missing history to rebuild"); return; }
            const entries = linked.map(e => ({ id: uid(), accountId: e.accountId, oldBalance: 0, newBalance: 0, change: -e.amount, reason: "expense_backfill", description: `${e.description || e.category} (${e.date})`, createdAt: new Date(e.date).toISOString() }));
            entries.forEach(e => svAH(e));
            tst(`Rebuilt ${entries.length} history entries`);
          }} style={{ ...btnG, padding: "10px 12px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} />Rebuild History</button>
        )}
        <button onClick={() => { rstAf(); setSaf(true); }} style={{ ...btnP, padding: "10px 16px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><Plus size={14} />Add</button>
      </div>
    </div>
    {accts.length > 0 && (<div style={{ background: `linear-gradient(135deg,${theme === "dark" ? "rgba(52,211,153,0.08)" : "rgba(5,150,105,0.06)"},transparent)`, border: `1px solid ${theme === "dark" ? "rgba(52,211,153,0.15)" : "rgba(5,150,105,0.15)"}`, borderRadius: 18, padding: "16px 18px", marginBottom: 18 }}><div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Net Worth</div><div style={{ fontSize: 30, fontWeight: 800, color: T.ok, marginTop: 2 }}>{fmt(totA)}</div></div>)}
    <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 8 }}>
      {accts.map(a => { const I = aIcons[a.type] || Wallet; const hist = acctHist.filter(h => h.accountId === a.id).sort((x, y) => y.createdAt - x.createdAt); const isEx = viewAH === a.id; return (
        <div key={a.id} style={{ ...cardS, padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 42, height: 42, borderRadius: 13, background: T.goldMuted, display: "flex", alignItems: "center", justifyContent: "center" }}><I size={18} style={{ color: T.gold }} /></div><div><div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div><div style={{ fontSize: 10, color: T.text3, textTransform: "capitalize" }}>{a.type}</div></div></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ fontSize: 16, fontWeight: 800, color: T.ok }}>{fmt(a.balance)}</div>
              <button onClick={() => { setAdjAcct(a.id); setAdjAmt(""); setAdjNote(""); setAdjMode("add"); }} style={{ background: "none", border: "none", color: T.ok, cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }} title="Adjust balance"><Plus size={14} /></button>
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

    {/* Adjust balance modal */}
    {adjAcct && (() => { const a = accts.find(x => x.id === adjAcct); if (!a) return null; return (
      <div style={mOvS}><div style={mInS}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>Adjust Balance</div>
          <button onClick={() => { setAdjAcct(null); setAdjAmt(""); setAdjNote(""); setAdjMode("add"); }} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer" }}><X size={22} /></button>
        </div>
        <div style={{ fontSize: 13, color: T.text2, marginBottom: 12 }}>{a.name} -- Current: <span style={{ fontWeight: 700, color: T.ok }}>{fmt(a.balance)}</span></div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button onClick={() => setAdjMode("add")} style={{ flex: 1, background: adjMode === "add" ? T.ok : "transparent", color: adjMode === "add" ? "#fff" : T.text2, border: `1px solid ${adjMode === "add" ? T.ok : T.border}`, fontWeight: 700, padding: "10px 0", borderRadius: 12, cursor: "pointer" }}>+ Add</button>
          <button onClick={() => setAdjMode("deduct")} style={{ flex: 1, background: adjMode === "deduct" ? T.err : "transparent", color: adjMode === "deduct" ? "#fff" : T.text2, border: `1px solid ${adjMode === "deduct" ? T.err : T.border}`, fontWeight: 700, padding: "10px 0", borderRadius: 12, cursor: "pointer" }}>- Deduct</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input placeholder="Amount" type="number" inputMode="decimal" value={adjAmt} onChange={e => setAdjAmt(e.target.value)} style={inpS} autoFocus />
          <input placeholder="Reason (optional)" value={adjNote} onChange={e => setAdjNote(e.target.value)} style={inpS} />
          {adjAmt && parseFloat(adjAmt) > 0 && <div style={{ fontSize: 12, color: T.text3 }}>New balance: <span style={{ fontWeight: 700, color: adjMode === "add" ? T.ok : T.err }}>{fmt(adjMode === "add" ? a.balance + parseFloat(adjAmt) : a.balance - parseFloat(adjAmt))}</span></div>}
          <button onClick={() => {
            const v = parseFloat(adjAmt);
            if (!v || v <= 0) return;
            const change = adjMode === "add" ? v : -v;
            const newBal = parseFloat((a.balance + change).toFixed(2));
            const upA = { ...a, balance: newBal, updatedAt: Date.now() };
            svA(accts.map(x => x.id === a.id ? upA : x), { upsert: upA });
            svAH({ id: uid(), accountId: a.id, oldBalance: a.balance, newBalance: newBal, change: parseFloat(change.toFixed(2)), reason: adjMode === "add" ? "adjustment_add" : "adjustment_deduct", description: adjNote.trim() || (adjMode === "add" ? "Balance added" : "Balance deducted"), createdAt: Date.now() });
            tst(`${adjMode === "add" ? "Added" : "Deducted"} ${fmt(v)} ${adjMode === "add" ? "to" : "from"} ${a.name}`);
            setAdjAcct(null); setAdjAmt(""); setAdjNote(""); setAdjMode("add");
          }} style={{ ...btnP, width: "100%", background: adjMode === "add" ? T.ok : T.err, boxShadow: "none" }}>{adjMode === "add" ? "Add to Balance" : "Deduct from Balance"}</button>
        </div>
      </div></div>
    ); })()}
  </>);
}
