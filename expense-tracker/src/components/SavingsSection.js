import { useState } from "react";
import { Plus, Trash2, Edit3, X, AlertTriangle, PiggyBank, RefreshCw } from "lucide-react";
import { useApp } from "../AppContext";
import { CRYPTO_COINS, fmt, uid } from "../constants";

export default function SavingsSection() {
  const { savGoals, svSG, tst, user, theme, isDesktop, T, cardS, pillS, inpS, btnP, btnG, mOvS, mInS, cryptoPrices, cryptoLastUpdated, fetchCryptoPrices } = useApp();

  const [sgForm, setSgForm] = useState(false);
  const [sgEdit, setSgEdit] = useState(null);
  const [sgf, setSgf] = useState({ name: "", targetAmount: "", targetDate: "", currentAmount: "", currency: "PHP" });
  const [sgDel, setSgDel] = useState(null);
  const [sgAdd, setSgAdd] = useState(null);
  const [sgAddAmt, setSgAddAmt] = useState("");
  const [sgSavedIn, setSgSavedIn] = useState("native");

  return (<>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <div style={{ fontSize: 18, fontWeight: 800 }}>Savings Goals</div>
      <button onClick={() => { setSgf({ name: "", targetAmount: "", targetDate: "", currentAmount: "", currency: "PHP" }); setSgEdit(null); setSgSavedIn("native"); setSgForm(true); }} style={{ ...btnP, padding: "10px 16px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><Plus size={14} />Add Goal</button>
    </div>

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
              <button onClick={() => { setSgEdit(g.id); setSgf({ name: g.name, targetAmount: String(g.targetAmount), targetDate: g.targetDate || "", currentAmount: String(g.currentAmount), currency: cur }); setSgSavedIn("native"); setSgForm(true); }} style={{ background: "none", border: "none", color: T.gold, cursor: "pointer", padding: 4 }}><Edit3 size={14} /></button>
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

    {/* Savings goal form modal */}
    {sgForm && <div style={mOvS}><div style={mInS}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>{sgEdit ? "Edit" : "Add"} Savings Goal</div>
        <button onClick={() => setSgForm(false)} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer" }}><X size={22} /></button>
      </div>
      {(() => { const fc = sgf.currency; const isPhp = fc === "PHP"; const isUsd = fc === "USD"; const isCr = !isPhp && !isUsd; const cp = cryptoPrices[fc]; const usdRate = cryptoPrices["USD"]?.php || 56; return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div><input placeholder="Goal name (e.g. Vacation Fund, Bitcoin Stack)" value={sgf.name} onChange={e => setSgf(v => ({ ...v, name: e.target.value }))} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>What are you saving for?</div></div>
        <div>
          <select value={fc} onChange={e => { setSgf(v => ({ ...v, currency: e.target.value })); setSgSavedIn("native"); }} style={inpS}>
            <option value="PHP">PHP -- Philippine Peso</option>
            <option value="USD">USD -- US Dollar</option>
            <optgroup label="Crypto">
              {CRYPTO_COINS.map(c => <option key={c.symbol} value={c.symbol}>{c.symbol} -- {c.name}{cryptoPrices[c.symbol] ? ` (${fmt(cryptoPrices[c.symbol].php)})` : ""}</option>)}
            </optgroup>
          </select>
          <div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>{isCr && cp ? `1 ${fc} = ${fmt(cp.php)} / $${cp.usd.toLocaleString()}` : "Currency or crypto coin for this goal."}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.text2, marginBottom: 4 }}>Target amount{!isPhp ? ` (in ${fc})` : ""}</div>
          <input placeholder={isPhp ? "e.g. 50000" : isUsd ? "e.g. 1000" : `e.g. ${fc === "BTC" ? "0.5" : fc === "ETH" ? "5" : "100"}`} type="number" inputMode="decimal" step="any" value={sgf.targetAmount} onChange={e => setSgf(v => ({ ...v, targetAmount: e.target.value }))} style={inpS} />
          {!isPhp && sgf.targetAmount && cp && <div style={{ fontSize: 10, color: T.gold, marginTop: 4 }}>Worth ~{fmt(parseFloat(sgf.targetAmount) * cp.php)} in PHP</div>}
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.text2 }}>Already saved (optional)</div>
            {isCr && cp && <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setSgSavedIn("native")} style={{ ...pillS(sgSavedIn === "native"), padding: "3px 8px", fontSize: 9 }}>{fc}</button>
              <button onClick={() => setSgSavedIn("usd")} style={{ ...pillS(sgSavedIn === "usd"), padding: "3px 8px", fontSize: 9 }}>USD</button>
            </div>}
          </div>
          <input placeholder={isCr ? (sgSavedIn === "usd" ? "Enter amount in USD" : `Enter amount in ${fc}`) : isUsd ? "Enter amount in USD" : "Enter amount in PHP"} type="number" inputMode="decimal" step="any" value={sgf.currentAmount} onChange={e => setSgf(v => ({ ...v, currentAmount: e.target.value }))} style={inpS} />
          {isCr && sgf.currentAmount && cp && (() => {
            const val = parseFloat(sgf.currentAmount);
            if (sgSavedIn === "usd") {
              const inCrypto = val / cp.usd;
              return <div style={{ fontSize: 10, color: T.gold, marginTop: 4 }}>${val.toLocaleString()} = {inCrypto < 1 ? inCrypto.toFixed(6) : inCrypto.toFixed(4)} {fc} (worth ~{fmt(inCrypto * cp.php)} PHP)</div>;
            }
            return <div style={{ fontSize: 10, color: T.gold, marginTop: 4 }}>{val} {fc} = worth ~{fmt(val * cp.php)} PHP / ~${(val * cp.usd).toLocaleString()}</div>;
          })()}
          {isUsd && sgf.currentAmount && <div style={{ fontSize: 10, color: T.gold, marginTop: 4 }}>${parseFloat(sgf.currentAmount).toLocaleString()} = ~{fmt(parseFloat(sgf.currentAmount) * usdRate)} PHP</div>}
        </div>
        <div><input type="date" value={sgf.targetDate} onChange={e => setSgf(v => ({ ...v, targetDate: e.target.value }))} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>Target date (optional). When do you want to reach this goal?</div></div>
        <button onClick={() => {
          if (!sgf.name.trim() || !sgf.targetAmount || parseFloat(sgf.targetAmount) <= 0) return;
          const tgt = parseFloat(sgf.targetAmount);
          let cur = parseFloat(sgf.currentAmount || 0);
          if (isCr && sgSavedIn === "usd" && cp && cur > 0) cur = cur / cp.usd;
          const entry = { id: sgEdit || uid(), name: sgf.name.trim(), targetAmount: isPhp ? parseFloat(tgt.toFixed(2)) : tgt, currentAmount: isPhp ? parseFloat(cur.toFixed(2)) : cur, targetDate: sgf.targetDate || null, currency: fc, addedBy: user, createdAt: sgEdit ? (savGoals.find(g => g.id === sgEdit)?.createdAt || new Date().toISOString()) : new Date().toISOString(), updatedAt: new Date().toISOString() };
          const updated = sgEdit ? savGoals.map(g => g.id === sgEdit ? entry : g) : [...savGoals, entry];
          svSG(updated, { upsert: entry });
          setSgForm(false);
          tst(sgEdit ? "Goal updated" : "Goal added");
        }} style={{ ...btnP, width: "100%" }}>{sgEdit ? "Update Goal" : "Add Goal"}</button>
      </div>
      ); })()}
    </div></div>}

    {/* Add funds modal */}
    {sgAdd && (() => { const addGoal = savGoals.find(g => g.id === sgAdd); const addCur = addGoal?.currency || "PHP"; const addIsPhp = addCur === "PHP"; const addIsUsd = addCur === "USD"; const addIsCr = !addIsPhp && !addIsUsd; const addCp = cryptoPrices[addCur]; return <div style={mOvS}><div style={mInS}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>Add Funds</div>
        <button onClick={() => setSgAdd(null)} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer" }}><X size={22} /></button>
      </div>
      <div style={{ fontSize: 13, color: T.text2, marginBottom: 10 }}>Adding to: <strong>{addGoal?.name}</strong>{!addIsPhp && <span style={{ color: T.gold, marginLeft: 4 }}>({addCur})</span>}</div>
      {addIsCr && addCp && <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <button onClick={() => setSgSavedIn("native")} style={{ ...pillS(sgSavedIn === "native"), padding: "5px 12px", fontSize: 11 }}>Enter in {addCur}</button>
        <button onClick={() => setSgSavedIn("usd")} style={{ ...pillS(sgSavedIn === "usd"), padding: "5px 12px", fontSize: 11 }}>Enter in USD</button>
      </div>}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input type="number" inputMode="decimal" step="any" placeholder={addIsCr ? (sgSavedIn === "usd" ? "Amount in USD" : `Amount in ${addCur}`) : addIsUsd ? "Amount in USD" : "Amount in PHP"} value={sgAddAmt} onChange={e => setSgAddAmt(e.target.value)} onKeyDown={e => { if (e.key === "Enter") document.getElementById("sgAddBtn")?.click(); }} style={{ ...inpS, flex: 1 }} autoFocus />
        <button id="sgAddBtn" onClick={() => {
          let amt = parseFloat(sgAddAmt);
          if (!amt || amt <= 0) return;
          const g = savGoals.find(g => g.id === sgAdd);
          if (!g) return;
          if (addIsCr && sgSavedIn === "usd" && addCp) amt = amt / addCp.usd;
          const isFgn = g.currency && g.currency !== "PHP";
          const updated = savGoals.map(x => x.id === sgAdd ? { ...x, currentAmount: isFgn ? x.currentAmount + amt : parseFloat((x.currentAmount + amt).toFixed(2)), updatedAt: new Date().toISOString() } : x);
          const upsertEntry = updated.find(x => x.id === sgAdd);
          svSG(updated, { upsert: upsertEntry });
          setSgAdd(null); setSgSavedIn("native");
          tst(`Added ${isFgn ? (g.currency === "USD" ? "$" + parseFloat(sgAddAmt) : (sgSavedIn === "usd" ? "$" + parseFloat(sgAddAmt) + " (" + amt.toFixed(6) + " " + g.currency + ")" : amt + " " + g.currency)) : fmt(amt)} to ${g.name}`);
        }} style={{ ...btnP, padding: "12px 20px", whiteSpace: "nowrap" }}>Add</button>
      </div>
      {sgAddAmt && (() => {
        const val = parseFloat(sgAddAmt);
        if (addIsCr && addCp) {
          if (sgSavedIn === "usd") { const inCr = val / addCp.usd; return <div style={{ fontSize: 10, color: T.gold, marginTop: 8 }}>${val.toLocaleString()} = {inCr < 1 ? inCr.toFixed(6) : inCr.toFixed(4)} {addCur} (worth ~{fmt(inCr * addCp.php)} PHP)</div>; }
          return <div style={{ fontSize: 10, color: T.gold, marginTop: 8 }}>{val} {addCur} = ~{fmt(val * addCp.php)} PHP / ~${(val * addCp.usd).toLocaleString()}</div>;
        }
        if (addIsUsd && cryptoPrices["USD"]) return <div style={{ fontSize: 10, color: T.gold, marginTop: 8 }}>${val.toLocaleString()} = ~{fmt(val * cryptoPrices["USD"].php)} PHP</div>;
        return null;
      })()}
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
  </>);
}
