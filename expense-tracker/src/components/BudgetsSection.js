import { useState } from "react";
import { Edit3, X, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import { useApp } from "../AppContext";
import { fmt, fmtS, pld } from "../constants";

export default function BudgetsSection() {
  const { exp, budgets, genBudget, cats, rec, catColors, svE, svB, svCats, svGB, svR, tst, theme, isDesktop, T, cardS, inpS, btnP, btnG, mOvS, mInS } = useApp();

  const [sbf, setSbf] = useState(false);
  const [bf, setBf] = useState({});
  const [gbEdit, setGbEdit] = useState("");
  const [cgb, setCgb] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [delCat, setDelCat] = useState(null);
  const [renCat, setRenCat] = useState(null);
  const [renVal, setRenVal] = useState("");
  const [showNoLimit, setShowNoLimit] = useState(false);

  const mStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const mExp = exp.filter(e => pld(e.date) >= mStart);
  const mByCat = mExp.reduce((a, e) => { a[e.category] = (a[e.category] || 0) + e.amount; return a; }, {});
  const mTot = mExp.reduce((s, e) => s + e.amount, 0);
  const gbPct = genBudget > 0 ? (mTot / genBudget) * 100 : 0;

  const saveBudgets = () => { svB(bf); setSbf(false); tst("Budgets saved"); };

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

  return (<>
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

    {/* Clear general budget modal */}
    {cgb && <div style={mOvS}><div style={mInS}><div style={{ textAlign: "center" }}>
      <AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} />
      <div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Clear monthly budget?</div>
      <div style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>This will remove the general monthly budget limit.</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => { svGB(0); setCgb(false); tst("Budget cleared"); }} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Clear</button>
        <button onClick={() => setCgb(false)} style={{ ...btnG, flex: 1 }}>Cancel</button>
      </div>
    </div></div></div>}

    {/* Delete category modal */}
    {delCat && <div style={mOvS}><div style={mInS}><div style={{ textAlign: "center" }}>
      <AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} />
      <div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Remove "{delCat}"?</div>
      <div style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>Expenses and recurring items in this category will be moved to "Other".</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => {
          svCats(cats.filter(c => c !== delCat));
          svE(exp.map(e => e.category === delCat ? { ...e, category: "Other" } : e));
          svR(rec.map(r => r.category === delCat ? { ...r, category: "Other" } : r));
          const nb = { ...budgets }; delete nb[delCat]; svB(nb);
          tst(`Category "${delCat}" removed`); setDelCat(null);
        }} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Remove</button>
        <button onClick={() => setDelCat(null)} style={{ ...btnG, flex: 1 }}>Cancel</button>
      </div>
    </div></div></div>}
  </>);
}
