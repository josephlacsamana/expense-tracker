import { useState } from "react";
import { Plus, Trash2, Edit3, X, AlertTriangle, Bell, Repeat } from "lucide-react";
import { useApp } from "../AppContext";
import { INCOME_SOURCES, fmt, td, uid, pld } from "../constants";

export default function IncomeSection() {
  const { exp, accts, income, recIncome, svA, svAH, svI, svRI, tst, user, users, theme, isDesktop, T, cardS, pillS, inpS, btnP, btnG, mOvS, mInS } = useApp();

  const [incForm, setIncForm] = useState(false);
  const [incEdit, setIncEdit] = useState(null);
  const [incF, setIncF] = useState({ amount: "", source: "Salary", description: "", date: td(), accountId: "" });
  const [incDel, setIncDel] = useState(null);
  const [incSub, setIncSub] = useState("list");
  const [riForm, setRiForm] = useState(false);
  const [riEdit, setRiEdit] = useState(null);
  const [riF, setRiF] = useState({ amount: "", source: "Salary", description: "", frequency: "monthly", nextDate: td() });
  const [riDel, setRiDel] = useState(null);

  const mStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const mExp = exp.filter(e => pld(e.date) >= mStart);
  const mTot = mExp.reduce((s, e) => s + e.amount, 0);

  return (<>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <div style={{ fontSize: 18, fontWeight: 800 }}>Income</div>
      <button onClick={() => { setIncF({ amount: "", source: "Salary", description: "", date: td(), accountId: "" }); setIncEdit(null); setIncForm(true); }} style={{ ...btnP, padding: "10px 16px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><Plus size={14} />Add</button>
    </div>

    <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
      <button onClick={() => setIncSub("list")} style={{ ...pillS(incSub === "list"), display: "flex", alignItems: "center", gap: 5 }}>List</button>
      <button onClick={() => setIncSub("recurring")} style={{ ...pillS(incSub === "recurring"), display: "flex", alignItems: "center", gap: 5 }}>Recurring{(() => { const now = new Date(); const ct = recIncome.filter(r => new Date(r.nextDate + "T00:00:00") <= now).length; return ct > 0 ? <span style={{ background: T.err, color: "#FFF", fontSize: 9, fontWeight: 700, borderRadius: 8, padding: "1px 5px", minWidth: 14, textAlign: "center" }}>{ct}</span> : null; })()}</button>
    </div>

    {incSub === "list" && (<>
      {(() => { const mI = income.filter(i => pld(i.date) >= mStart); const mITot = mI.reduce((s, i) => s + i.amount, 0); const bySrc = mI.reduce((a, i) => { a[i.source] = (a[i.source] || 0) + i.amount; return a; }, {}); return mI.length > 0 && (
        <div style={{ background: `linear-gradient(135deg,${theme === "dark" ? "rgba(52,211,153,0.08)" : "rgba(5,150,105,0.06)"},transparent)`, border: `1px solid ${theme === "dark" ? "rgba(52,211,153,0.15)" : "rgba(5,150,105,0.15)"}`, borderRadius: 18, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>This Month</div><div style={{ fontSize: 28, fontWeight: 800, color: T.ok, marginTop: 2 }}>{fmt(mITot)}</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Net Cash Flow</div><div style={{ fontSize: 20, fontWeight: 700, color: mITot - mTot >= 0 ? T.ok : T.err, marginTop: 2 }}>{mITot - mTot >= 0 ? "+" : ""}{fmt(mITot - mTot)}</div></div>
          </div>
          {Object.keys(bySrc).length > 1 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {Object.entries(bySrc).sort((a, b) => b[1] - a[1]).map(([src, amt]) => (
              <span key={src} style={{ fontSize: 10, color: T.text2, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "4px 8px" }}>{src}: {fmt(amt)}</span>
            ))}
          </div>}
        </div>
      ); })()}

      {income.length === 0 && <div style={{ ...cardS, textAlign: "center", padding: 28, color: T.text3, fontSize: 13 }}>No income logged yet. Tap "Add" to record your first income.</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {income.map(i => { const acct = accts.find(a => a.id === i.accountId); return (
          <div key={i.id} style={{ ...cardS, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: T.ok }}>+{fmt(i.amount)}</span>
                  <span style={{ fontSize: 10, color: T.gold, fontWeight: 600, padding: "2px 6px", borderRadius: 6, background: T.goldMuted }}>{i.source}</span>
                </div>
                {i.description && <div style={{ fontSize: 12, color: T.text2, marginTop: 3 }}>{i.description}</div>}
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3 }}>{i.date}{i.addedBy ? ` -- ${i.addedBy}` : ""}{acct ? ` -- ${acct.name}` : ""}</div>
              </div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button onClick={() => { setIncEdit(i.id); setIncF({ amount: String(i.amount), source: i.source, description: i.description, date: i.date, accountId: i.accountId || "" }); setIncForm(true); }} style={{ background: "none", border: "none", color: T.gold, cursor: "pointer", padding: 4 }}><Edit3 size={14} /></button>
                <button onClick={() => setIncDel(i.id)} style={{ background: "none", border: "none", color: T.err, cursor: "pointer", padding: 4 }}><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ); })}
      </div>
    </>)}

    {incSub === "recurring" && (<>
      {(() => { const now = new Date(); const due = recIncome.filter(r => new Date(r.nextDate + "T00:00:00") <= now); if (!due.length) return null; return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
          {due.map(r => { const nd = new Date(r.nextDate + "T00:00:00"); const diff = Math.floor((now - nd) / 86400000); return (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: diff > 0 ? (theme === "dark" ? "rgba(52,211,153,0.1)" : "rgba(5,150,105,0.06)") : (theme === "dark" ? "rgba(245,181,38,0.1)" : "rgba(245,181,38,0.06)"), border: `1px solid ${diff > 0 ? "rgba(52,211,153,0.25)" : "rgba(245,181,38,0.25)"}` }}>
              <Bell size={14} style={{ color: diff > 0 ? T.ok : T.gold, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: diff > 0 ? T.ok : T.gold }}>{diff > 0 ? `Due ${diff} day${diff > 1 ? "s" : ""} ago` : "Due today"}</div>
                <div style={{ fontSize: 11, color: T.text2 }}>{r.description || r.source} -- {fmt(r.amount)}</div>
              </div>
              <button onClick={() => {
                const entry = { id: uid(), amount: r.amount, source: r.source, description: r.description, date: td(), addedBy: user, accountId: null, createdAt: new Date().toISOString() };
                svI([entry, ...income], { upsert: entry });
                const nd2 = new Date(r.nextDate + "T00:00:00");
                if (r.frequency === "weekly") nd2.setDate(nd2.getDate() + 7);
                else if (r.frequency === "biweekly") nd2.setDate(nd2.getDate() + 14);
                else if (r.frequency === "monthly") nd2.setMonth(nd2.getMonth() + 1);
                else if (r.frequency === "yearly") nd2.setFullYear(nd2.getFullYear() + 1);
                const upd = { ...r, nextDate: `${nd2.getFullYear()}-${String(nd2.getMonth() + 1).padStart(2, "0")}-${String(nd2.getDate()).padStart(2, "0")}` };
                svRI(recIncome.map(x => x.id === r.id ? upd : x), { upsert: upd });
                tst(`${fmt(r.amount)} income recorded`);
              }} style={{ ...btnP, padding: "6px 12px", fontSize: 10 }}>Apply</button>
            </div>
          ); })}
        </div>
      ); })()}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button onClick={() => { setRiF({ amount: "", source: "Salary", description: "", frequency: "monthly", nextDate: td() }); setRiEdit(null); setRiForm(true); }} style={{ ...btnP, padding: "10px 16px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><Plus size={14} />Add Recurring</button>
      </div>

      {recIncome.length === 0 && <div style={{ ...cardS, textAlign: "center", padding: 28, color: T.text3, fontSize: 13 }}>No recurring income set up. Add your salary, freelance, or other regular income.</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {recIncome.map(r => (
          <div key={r.id} style={{ ...cardS, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: theme === "dark" ? "rgba(52,211,153,0.1)" : "rgba(5,150,105,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}><Repeat size={16} style={{ color: T.ok }} /></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{r.source}</div>
                  <div style={{ fontSize: 10, color: T.text3 }}>{r.description ? `${r.description} -- ` : ""}{r.frequency} -- Next: {r.nextDate}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: T.ok }}>{fmt(r.amount)}</span>
                <button onClick={() => { setRiEdit(r.id); setRiF({ amount: String(r.amount), source: r.source, description: r.description, frequency: r.frequency, nextDate: r.nextDate }); setRiForm(true); }} style={{ background: "none", border: "none", color: T.gold, cursor: "pointer", padding: 4 }}><Edit3 size={14} /></button>
                <button onClick={() => setRiDel(r.id)} style={{ background: "none", border: "none", color: T.err, cursor: "pointer", padding: 4 }}><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>)}

    {/* Income form modal */}
    {incForm && <div style={mOvS}><div style={mInS}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>{incEdit ? "Edit" : "Add"} Income</div>
        <button onClick={() => setIncForm(false)} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer" }}><X size={22} /></button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div><input placeholder="Amount" type="number" inputMode="decimal" value={incF.amount} onChange={e => setIncF(v => ({ ...v, amount: e.target.value }))} style={inpS} autoFocus /><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>How much did you receive?</div></div>
        <div><select value={incF.source} onChange={e => setIncF(v => ({ ...v, source: e.target.value }))} style={inpS}>
          {INCOME_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
        </select><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>Source of income</div></div>
        <input placeholder="Description (optional)" value={incF.description} onChange={e => setIncF(v => ({ ...v, description: e.target.value }))} style={inpS} />
        <div><input type="date" value={incF.date} onChange={e => setIncF(v => ({ ...v, date: e.target.value }))} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>When did you receive this?</div></div>
        <div><select value={incF.accountId} onChange={e => setIncF(v => ({ ...v, accountId: e.target.value }))} style={inpS}>
          <option value="">No account linked</option>
          {accts.map(a => <option key={a.id} value={a.id}>{a.name} ({fmt(a.balance)})</option>)}
        </select><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>Which account did this go into? (optional)</div></div>
        {users.length > 1 && <select value={incF.addedBy || user} onChange={e => setIncF(v => ({ ...v, addedBy: e.target.value }))} style={inpS}>
          {users.map(u => <option key={u} value={u}>{u}</option>)}
        </select>}
        <button onClick={() => {
          const amt = parseFloat(incF.amount);
          if (!amt || amt <= 0) return;
          const entry = { id: incEdit || uid(), amount: parseFloat(amt.toFixed(2)), source: incF.source, description: incF.description?.trim() || "", date: incF.date || td(), addedBy: incF.addedBy || user, accountId: incF.accountId || null, createdAt: incEdit ? (income.find(i => i.id === incEdit)?.createdAt || new Date().toISOString()) : new Date().toISOString() };
          if (incEdit) {
            const old = income.find(i => i.id === incEdit);
            if (old?.accountId) {
              const oa = accts.find(a => a.id === old.accountId);
              if (oa) { const upA = { ...oa, balance: parseFloat((oa.balance - old.amount).toFixed(2)), updatedAt: Date.now() }; svA(accts.map(a => a.id === oa.id ? upA : a), { upsert: upA }); }
            }
            svI(income.map(i => i.id === incEdit ? entry : i), { upsert: entry });
          } else {
            svI([entry, ...income], { upsert: entry });
          }
          if (entry.accountId) {
            const ac = accts.find(a => a.id === entry.accountId);
            if (ac) {
              const upA = { ...ac, balance: parseFloat((ac.balance + amt).toFixed(2)), updatedAt: Date.now() };
              svA(accts.map(a => a.id === ac.id ? upA : a), { upsert: upA });
              svAH({ id: uid(), accountId: ac.id, oldBalance: ac.balance, newBalance: upA.balance, change: amt, reason: "income", description: entry.description || entry.source, createdAt: Date.now() });
            }
          }
          setIncForm(false);
          tst(incEdit ? "Income updated" : "Income added");
        }} style={{ ...btnP, width: "100%" }}>{incEdit ? "Update" : "Add Income"}</button>
      </div>
    </div></div>}

    {/* Delete income modal */}
    {incDel && <div style={mOvS}><div style={mInS}><div style={{ textAlign: "center" }}>
      <AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} />
      <div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Delete this income entry?</div>
      <div style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>{(() => { const i = income.find(x => x.id === incDel); return i ? `${fmt(i.amount)} from ${i.source} on ${i.date}` : ""; })()}</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => {
          const old = income.find(i => i.id === incDel);
          if (old?.accountId) {
            const oa = accts.find(a => a.id === old.accountId);
            if (oa) { const upA = { ...oa, balance: parseFloat((oa.balance - old.amount).toFixed(2)), updatedAt: Date.now() }; svA(accts.map(a => a.id === oa.id ? upA : a), { upsert: upA }); svAH({ id: uid(), accountId: oa.id, oldBalance: oa.balance, newBalance: upA.balance, change: -old.amount, reason: "income_deleted", description: `Deleted: ${old.description || old.source}`, createdAt: Date.now() }); }
          }
          svI(income.filter(i => i.id !== incDel), { deleteId: incDel }); setIncDel(null); tst("Income deleted");
        }} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Delete</button>
        <button onClick={() => setIncDel(null)} style={{ ...btnG, flex: 1 }}>Cancel</button>
      </div>
    </div></div></div>}

    {/* Recurring income form modal */}
    {riForm && <div style={mOvS}><div style={mInS}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>{riEdit ? "Edit" : "Add"} Recurring Income</div>
        <button onClick={() => setRiForm(false)} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer" }}><X size={22} /></button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div><input placeholder="Amount" type="number" inputMode="decimal" value={riF.amount} onChange={e => setRiF(v => ({ ...v, amount: e.target.value }))} style={inpS} autoFocus /><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>How much do you receive each time?</div></div>
        <div><select value={riF.source} onChange={e => setRiF(v => ({ ...v, source: e.target.value }))} style={inpS}>
          {INCOME_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
        </select><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>Source of this recurring income</div></div>
        <input placeholder="Description (e.g. Monthly salary from Acme Corp)" value={riF.description} onChange={e => setRiF(v => ({ ...v, description: e.target.value }))} style={inpS} />
        <div><select value={riF.frequency} onChange={e => setRiF(v => ({ ...v, frequency: e.target.value }))} style={inpS}>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Bi-weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>How often do you receive this?</div></div>
        <div><input type="date" value={riF.nextDate} onChange={e => setRiF(v => ({ ...v, nextDate: e.target.value }))} style={inpS} /><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>Next expected date for this income</div></div>
        <button onClick={() => {
          const amt = parseFloat(riF.amount);
          if (!amt || amt <= 0) return;
          const entry = { id: riEdit || uid(), amount: parseFloat(amt.toFixed(2)), source: riF.source, description: riF.description?.trim() || "", frequency: riF.frequency, nextDate: riF.nextDate || td(), addedBy: user, createdAt: riEdit ? (recIncome.find(r => r.id === riEdit)?.createdAt || new Date().toISOString()) : new Date().toISOString() };
          if (riEdit) { svRI(recIncome.map(r => r.id === riEdit ? entry : r), { upsert: entry }); } else { svRI([entry, ...recIncome], { upsert: entry }); }
          setRiForm(false);
          tst(riEdit ? "Recurring income updated" : "Recurring income added");
        }} style={{ ...btnP, width: "100%" }}>{riEdit ? "Update" : "Add Recurring Income"}</button>
      </div>
    </div></div>}

    {/* Delete recurring income modal */}
    {riDel && <div style={mOvS}><div style={mInS}><div style={{ textAlign: "center" }}>
      <AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} />
      <div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Delete this recurring income?</div>
      <div style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>{(() => { const r = recIncome.find(x => x.id === riDel); return r ? `${r.description || r.source} -- ${fmt(r.amount)} / ${r.frequency}` : ""; })()}</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => { svRI(recIncome.filter(r => r.id !== riDel), { deleteId: riDel }); setRiDel(null); tst("Recurring income deleted"); }} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Delete</button>
        <button onClick={() => setRiDel(null)} style={{ ...btnG, flex: 1 }}>Cancel</button>
      </div>
    </div></div></div>}
  </>);
}
