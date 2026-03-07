import { useState } from "react";
import { Plus, Trash2, Edit3, X, Check, Search, ChevronDown, AlertTriangle, Repeat, Bell } from "lucide-react";
import { useApp } from "../AppContext";
import { PERIODS, fmt, pld, startOf, td, uid } from "../constants";

export default function ExpensesTab() {
  const { exp, accts, cats, rec, catColors, svE, svA, svR, svAH, tst, user, users, theme, isDesktop, T, cardS, pillS, inpS, btnP, btnG, mOvS, mInS } = useApp();

  // ─── Expense list state ───
  const [expSub, setExpSub] = useState("list");
  const [sf, setSf] = useState(false);
  const [eId, setEId] = useState(null);
  const [form, setForm] = useState({ amount: "", category: "Food", description: "", date: td(), addedBy: user, accountId: "" });
  const [per, setPer] = useState("Monthly");
  const [cf, setCf] = useState("All");
  const [pf, setPf] = useState("All");
  const [sq, setSq] = useState("");
  const [sd, setSd] = useState("desc");
  const [dc, setDc] = useState(null);
  // ─── Recurring state ───
  const [srf, setSrf] = useState(false);
  const [erId, setErId] = useState(null);
  const [rf, setRf] = useState({ amount: "", category: "Food", description: "", frequency: "monthly", nextDate: td() });
  const [drc, setDrc] = useState(null);

  // ─── Filtering ───
  const ps = startOf(per);
  const filt = exp.filter(e => per === "All" || pld(e.date) >= ps)
    .filter(e => cf === "All" || e.category === cf)
    .filter(e => pf === "All" || e.addedBy === pf)
    .filter(e => !sq || (e.description || "").toLowerCase().includes(sq.toLowerCase()));
  const sorted = [...filt].sort((a, b) => sd === "desc" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
  const totF = filt.reduce((s, e) => s + e.amount, 0);

  // ─── Expense CRUD ───
  const doSubmit = () => {
    if (!form.amount || isNaN(parseFloat(form.amount))) return;
    const en = { id: eId || uid(), amount: parseFloat(parseFloat(form.amount).toFixed(2)), category: form.category, description: form.description.trim(), date: form.date || td(), addedBy: form.addedBy || user, accountId: form.accountId || null, createdAt: Date.now() };
    let updAccts = [...accts];
    if (eId) {
      const old = exp.find(e => e.id === eId);
      if (old?.accountId) { const i = updAccts.findIndex(a => a.id === old.accountId); if (i >= 0) { const prev = updAccts[i]; updAccts[i] = { ...prev, balance: prev.balance + old.amount, updatedAt: Date.now() }; svAH({ id: uid(), accountId: prev.id, oldBalance: prev.balance, newBalance: prev.balance + old.amount, change: old.amount, reason: "expense_edit", description: `Reversed: ${old.description || old.category}`, createdAt: Date.now() }); } }
    }
    if (en.accountId) { const i = updAccts.findIndex(a => a.id === en.accountId); if (i >= 0) { const prev = updAccts[i]; updAccts[i] = { ...prev, balance: prev.balance - en.amount, updatedAt: Date.now() }; svAH({ id: uid(), accountId: prev.id, oldBalance: prev.balance, newBalance: prev.balance - en.amount, change: -en.amount, reason: "expense", description: en.description || en.category, createdAt: Date.now() }); } }
    if (JSON.stringify(updAccts) !== JSON.stringify(accts)) { const changed = updAccts.filter((a, i) => a !== accts[i]); changed.forEach(a => svA(updAccts, { upsert: a })); }
    if (eId) { svE(exp.map(e => e.id === eId ? en : e), { upsert: en }); tst("Updated"); } else { svE([en, ...exp], { upsert: en }); tst("Added"); }
    rstF();
  };
  const rstF = () => { setForm({ amount: "", category: "Food", description: "", date: td(), addedBy: user, accountId: "" }); setEId(null); setSf(false); };
  const edF = (e) => { setForm({ amount: String(e.amount), category: e.category, description: e.description, date: e.date, addedBy: e.addedBy, accountId: e.accountId || "" }); setEId(e.id); setSf(true); };
  const delE = (id) => {
    const del = exp.find(e => e.id === id);
    if (del?.accountId) { const acc = accts.find(a => a.id === del.accountId); if (acc) { const restored = { ...acc, balance: acc.balance + del.amount, updatedAt: Date.now() }; svA(accts.map(a => a.id === acc.id ? restored : a), { upsert: restored }); svAH({ id: uid(), accountId: acc.id, oldBalance: acc.balance, newBalance: acc.balance + del.amount, change: del.amount, reason: "expense_delete", description: `Deleted: ${del.description || del.category}`, createdAt: Date.now() }); } }
    svE(exp.filter(e => e.id !== id), { deleteId: id }); setDc(null); tst("Deleted");
  };

  // ─── Recurring CRUD ───
  const doRec = () => {
    if (!rf.description.trim() || !rf.amount || isNaN(parseFloat(rf.amount))) return;
    const en = { id: erId || uid(), amount: parseFloat(parseFloat(rf.amount).toFixed(2)), category: rf.category, description: rf.description.trim(), frequency: rf.frequency, nextDate: rf.nextDate || td(), addedBy: user, createdAt: Date.now() };
    if (erId) { svR(rec.map(r => r.id === erId ? en : r), { upsert: en }); tst("Recurring updated"); } else { svR([...rec, en], { upsert: en }); tst("Recurring added"); }
    rstRf();
  };
  const rstRf = () => { setRf({ amount: "", category: "Food", description: "", frequency: "monthly", nextDate: td() }); setErId(null); setSrf(false); };
  const edRec = (r) => { setRf({ amount: String(r.amount), category: r.category, description: r.description, frequency: r.frequency, nextDate: r.nextDate }); setErId(r.id); setSrf(true); };
  const delRec = (id) => { svR(rec.filter(r => r.id !== id), { deleteId: id }); setDrc(null); tst("Recurring removed"); };
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

  return (
    <div style={{ flex: 1, maxWidth: isDesktop ? 800 : 600, margin: "0 auto", padding: isDesktop ? "28px 36px 40px" : "18px 20px 80px", width: "100%", boxSizing: "border-box", overflowY: "auto" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {["list", "recurring"].map(s => { const dueRec = s === "recurring" ? rec.filter(r => r.nextDate <= td()).length : 0; return (
          <button key={s} onClick={() => setExpSub(s)} style={{ ...pillS(expSub === s), display: "flex", alignItems: "center", gap: 5 }}>{s === "list" ? "List" : "Recurring"}{dueRec > 0 && <span style={{ background: T.err, color: "#FFF", fontSize: 9, fontWeight: 700, borderRadius: 8, padding: "1px 5px", minWidth: 14, textAlign: "center" }}>{dueRec}</span>}</button>
        ); })}
      </div>

      {expSub === "list" && (<>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Expenses</div>
          <button onClick={() => { rstF(); setSf(true); }} style={{ ...btnP, padding: "10px 16px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><Plus size={14} />Add</button>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>{PERIODS.map(p => <button key={p} onClick={() => setPer(p)} style={pillS(per === p)}>{p}</button>)}</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ flex: 1, position: "relative", minWidth: 120 }}><Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.text3 }} /><input placeholder="Search..." value={sq} onChange={e => setSq(e.target.value)} style={{ ...inpS, paddingLeft: 32, fontSize: 12 }} /></div>
          <select value={cf} onChange={e => setCf(e.target.value)} style={{ ...inpS, width: "auto", fontSize: 12, minWidth: 80 }}><option value="All">All</option>{cats.map(c => <option key={c} value={c}>{c}</option>)}</select>
          {users.length > 1 && <select value={pf} onChange={e => setPf(e.target.value)} style={{ ...inpS, width: "auto", fontSize: 12, minWidth: 80 }}><option value="All">All</option>{users.map(u => <option key={u} value={u}>{u}</option>)}</select>}
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
        {/* Recurring due alerts */}
        {(() => { const today = td(); const dueRecs = rec.filter(r => r.nextDate <= today).sort((a, b) => a.nextDate.localeCompare(b.nextDate)); if (!dueRecs.length) return null; const todayDate = new Date(today + "T00:00:00"); return (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            {dueRecs.map(r => { const rDate = new Date(r.nextDate + "T00:00:00"); const diff = Math.floor((todayDate - rDate) / (1000 * 60 * 60 * 24)); const isOverdue = diff > 0; return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: isOverdue ? (theme === "dark" ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.06)") : (theme === "dark" ? "rgba(245,181,38,0.1)" : "rgba(245,181,38,0.06)"), border: `1px solid ${isOverdue ? "rgba(239,68,68,0.25)" : "rgba(245,181,38,0.25)"}` }}>
                <Bell size={14} style={{ color: isOverdue ? T.err : T.gold, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: isOverdue ? T.err : T.gold }}>{isOverdue ? `Overdue by ${diff} day${diff > 1 ? "s" : ""}` : "Due today"}</div>
                  <div style={{ fontSize: 11, color: T.text2 }}>{r.description} -- {fmt(r.amount)} ({r.frequency})</div>
                </div>
              </div>); })}
          </div>); })()}
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
            );
          })}
        </div>
      </>)}

      {/* MODALS */}
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

      {dc && <div style={mOvS}><div style={mInS}><div style={{ textAlign: "center" }}><AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} /><div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Delete expense?</div><div style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>This cannot be undone.</div><div style={{ display: "flex", gap: 8 }}><button onClick={() => delE(dc)} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Delete</button><button onClick={() => setDc(null)} style={{ ...btnG, flex: 1 }}>Cancel</button></div></div></div></div>}

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

      {drc && <div style={mOvS}><div style={mInS}><div style={{ textAlign: "center" }}><AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} /><div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Delete recurring expense?</div><div style={{ display: "flex", gap: 8, marginTop: 20 }}><button onClick={() => delRec(drc)} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Delete</button><button onClick={() => setDrc(null)} style={{ ...btnG, flex: 1 }}>Cancel</button></div></div></div></div>}
    </div>
  );
}
