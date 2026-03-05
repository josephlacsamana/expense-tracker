import { useState } from "react";
import { RefreshCw, Download, AlertTriangle, TrendingUp, Lightbulb, Coins, UserPlus, Home, X, Check, PieChart } from "lucide-react";
import { PieChart as RPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { supabase, sbReady } from "../supabase";
import { sb } from "../db";
import { useApp } from "../AppContext";
import { DEF_CATS, DEFAULT_BUDGETS, fmt, fmtS, uid, pld, stripE, startOf, prevRange } from "../constants";
import ChartTooltip from "../components/ChartTooltip";

export default function MoreTab() {
  const { exp, budgets, debts, catColors, setExp, setAccts, setBudgets, setGenBudget, setCats, setRec, setDebts, setDPays, tst, user, users, householdId, householdRole, profile, household, isDesktop, T, theme, cardS, pillS, inpS, btnP, btnG, mOvS, mInS, callAI } = useApp();

  const [sub, setSub] = useState("insights");
  const [ip, setIp] = useState("Weekly");
  const [it, setIt] = useState(null);
  const [il, setIl] = useState(false);
  const [clr, setClr] = useState(false);
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteEmailSent, setInviteEmailSent] = useState(false);
  const [editHhName, setEditHhName] = useState(false);
  const [hhName, setHhName] = useState(household?.name || "My Household");
  const [invLinkCopied, setInvLinkCopied] = useState(false);

  const genIns = async () => {
    const ps = startOf(ip); const rel = exp.filter(e => pld(e.date) >= ps);
    if (!rel.length) { setIt({ error: "No expenses for this period." }); return; }
    setIl(true); setIt(null);
    const tot = rel.reduce((s, e) => s + e.amount, 0);
    const bc = rel.reduce((a, e) => { a[e.category] = (a[e.category] || 0) + e.amount; return a; }, {});
    const bp = rel.reduce((a, e) => { a[e.addedBy] = (a[e.addedBy] || 0) + e.amount; return a; }, {});
    const [pS, pE] = prevRange(ip); const pT = exp.filter(e => { const d = pld(e.date); return d >= pS && d < pE; }).reduce((s, e) => s + e.amount, 0);
    const t5x = [...rel].sort((a, b) => b.amount - a.amount).slice(0, 5);
    const bStr = Object.entries(budgets).map(([c, v]) => `- ${c}: Budget PHP ${v}, Spent PHP ${(bc[c] || 0).toFixed(0)}`).join("\n");
    const debtStr = debts.length ? `\nDebts:\n${debts.map(d => `- ${d.name} (${d.type}): PHP ${d.currentBalance.toFixed(0)} remaining of PHP ${d.totalAmount.toFixed(0)}, ${d.interestRate || 0}% APR, Min PHP ${d.minPayment || 0}/mo`).join("\n")}\nTotal debt: PHP ${debts.reduce((s, d) => s + d.currentBalance, 0).toFixed(0)}\nTotal min payments: PHP ${debts.reduce((s, d) => s + (d.minPayment || 0), 0).toFixed(0)}/mo` : "";
    const sum = `${ip.toUpperCase()} REVIEW:\nTotal: PHP ${tot.toFixed(2)}\nPrev: PHP ${pT.toFixed(2)}\nBy category:\n${Object.entries(bc).map(([c, v]) => `- ${c}: PHP ${v.toFixed(0)}`).join("\n")}\nBy person:\n${Object.entries(bp).map(([p, v]) => `- ${p}: PHP ${v.toFixed(0)}`).join("\n")}\nTop 5:\n${t5x.map(e => `- ${e.description}: PHP ${e.amount}`).join("\n")}\nBudgets:\n${bStr}${debtStr}`;
    const IS = `You are ${users.join(" and ")}'s personal finance advisor. Filipino couple. No emojis. Respond ONLY with valid JSON (no markdown, no code fences). Format: {"overview":"1-2 sentence summary","categoryAnalysis":"2-3 sentences about category spending","patterns":"2-3 sentences about spending patterns or habits","debtAnalysis":"if debts exist: 2-3 sentences covering total debt load, highest priority debt, and one specific repayment tip with numbers. If no debts, return empty string.","tips":["tip 1","tip 2","tip 3"]}. Each tip should be specific and actionable with numbers. Keep it concise.`;
    try {
      const raw = await callAI([{ role: "user", content: sum }], IS);
      const clean = stripE(raw || "");
      let parsed;
      try { parsed = JSON.parse(clean); } catch { const m = clean.match(/\{[\s\S]*\}/); parsed = m ? JSON.parse(m[0]) : null; }
      const data = { bc, bp, tot, pT, t5x, period: ip, count: rel.length, debts };
      if (parsed && parsed.overview) { setIt({ ...parsed, data }); } else { setIt({ overview: clean, categoryAnalysis: "", patterns: "", debtAnalysis: "", tips: [], data }); }
    } catch { setIt({ error: "Failed to generate insights." }); }
    setIl(false);
  };

  const exportCSV = () => {
    const h = "Date,Description,Category,Amount,Added By\n";
    const r = [...exp].sort((a, b) => a.date.localeCompare(b.date)).map(e => `${e.date},"${(e.description || "").replace(/"/g, '""')}",${e.category},${e.amount},${e.addedBy}`).join("\n");
    const b = new Blob([h + r], { type: "text/csv" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "expenses.csv"; a.click(); URL.revokeObjectURL(u);
  };

  const clearAll = async () => {
    setExp([]); setAccts([]); setRec([]); setDebts([]); setDPays([]); setGenBudget(0); setCats(DEF_CATS); setBudgets(DEFAULT_BUDGETS);
    try {
      if (sbReady) {
        await Promise.all([sb.deleteAllExpenses(householdId), sb.deleteAllAccounts(householdId), sb.deleteAllRecurring(householdId), sb.deleteAllDebts(householdId), sb.saveCategories(DEF_CATS, householdId), sb.saveSetting("budgets", DEFAULT_BUDGETS, householdId), sb.saveSetting("genBudget", 0, householdId)]);
      } else {
        const ls = window.localStorage;
        ls.setItem("expenses", JSON.stringify([])); ls.setItem("accounts", JSON.stringify([])); ls.setItem("recurring", JSON.stringify([])); ls.setItem("debts", JSON.stringify([])); ls.setItem("debtPayments", JSON.stringify([])); ls.setItem("genBudget", JSON.stringify(0)); ls.setItem("categories", JSON.stringify(DEF_CATS)); ls.setItem("budgets", JSON.stringify(DEFAULT_BUDGETS));
      }
    } catch {}
    setClr(false); tst("All data cleared");
  };

  const saveHhName = async () => {
    if (!hhName.trim() || !householdId) return;
    await supabase.from("households").update({ name: hhName.trim() }).eq("id", householdId);
    setEditHhName(false);
    tst("Household name updated");
  };

  const sendEmailInvite = async () => {
    if (!sbReady || !householdId || !inviteEmail.trim()) return;
    const email = inviteEmail.trim().toLowerCase();
    const { data: existing } = await supabase.from("invites").select("*").eq("household_id", householdId).eq("invited_email", email).eq("used", false).gt("expires_at", new Date().toISOString()).limit(1);
    if (existing?.length) { setInviteEmailSent(true); return; }
    const { data: { user: cu } } = await supabase.auth.getUser();
    const { error } = await supabase.from("invites").insert({ household_id: householdId, created_by: cu?.id || null, invited_email: email, token: uid() });
    if (!error) setInviteEmailSent(true);
  };

  return (
    <div style={{ flex: 1, maxWidth: isDesktop ? 1100 : 600, margin: "0 auto", padding: isDesktop ? "28px 36px 40px" : "18px 20px 80px", width: "100%", boxSizing: "border-box", overflowY: "auto" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {["insights", "settings"].map(s => <button key={s} onClick={() => setSub(s)} style={pillS(sub === s)}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>)}
      </div>

      <div>
        {sub === "insights" && (<>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>AI Insights</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>{["Weekly", "Monthly", "Quarterly", "Yearly"].map(p => <button key={p} onClick={() => setIp(p)} style={pillS(ip === p)}>{p}</button>)}</div>
          <button onClick={genIns} disabled={il} style={{ ...btnP, width: isDesktop ? "auto" : "100%", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: il ? 0.6 : 1, padding: isDesktop ? "15px 36px" : "14px 20px" }}>
            {il ? <><RefreshCw size={16} className="spin" />Generating...</> : <><Lightbulb size={16} />Generate {ip} Review</>}
          </button>
          {it && it.error && <div style={{ ...cardS, fontSize: 13, color: T.text3, textAlign: "center", padding: 28 }}>{it.error}</div>}
          {it && it.data && <>
            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={{ ...cardS, padding: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: T.text3, marginBottom: 6 }}>Total Spent</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: T.gold }}>{fmt(it.data.tot)}</div>
                <div style={{ fontSize: 11, color: it.data.pT > 0 ? (it.data.tot > it.data.pT ? T.err : T.ok) : T.text3, marginTop: 4 }}>
                  {it.data.pT > 0 ? `${it.data.tot > it.data.pT ? "+" : ""}${(((it.data.tot - it.data.pT) / it.data.pT) * 100).toFixed(1)}% vs prev` : "No prev data"}
                </div>
              </div>
              <div style={{ ...cardS, padding: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: T.text3, marginBottom: 6 }}>Transactions</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: T.text1 }}>{it.data.count}</div>
                <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>this {it.data.period.toLowerCase()}</div>
              </div>
              <div style={{ ...cardS, padding: 16, ...(isDesktop ? {} : { gridColumn: "1 / -1" }) }}>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: T.text3, marginBottom: 6 }}>Previous {it.data.period}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: T.text2 }}>{it.data.pT > 0 ? fmt(it.data.pT) : "--"}</div>
                <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>{it.data.pT > 0 ? "comparison baseline" : "no data"}</div>
              </div>
            </div>
            {it.overview && <div style={{ ...cardS, padding: isDesktop ? 22 : 18, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.gold, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}><TrendingUp size={16} />Overview</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: T.text2 }}>{it.overview}</div>
            </div>}
            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 12, marginBottom: 16 }}>
              <div style={{ ...cardS, padding: isDesktop ? 22 : 18 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text1, marginBottom: 14 }}>By Category</div>
                <ResponsiveContainer width="100%" height={180}>
                  <RPie><Pie data={Object.entries(it.data.bc).map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" stroke="none">
                    {Object.keys(it.data.bc).map((c, i) => <Cell key={i} fill={catColors[c] || T.text3} />)}
                  </Pie><Tooltip content={<ChartTooltip />} /></RPie>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                  {Object.entries(it.data.bc).sort((a, b) => b[1] - a[1]).map(([c, v]) => (
                    <div key={c} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: T.text3 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: catColors[c] || T.text3 }} />{c}: {fmt(v)}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...cardS, padding: isDesktop ? 22 : 18 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text1, marginBottom: 14 }}>By Person</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={Object.entries(it.data.bp).map(([name, value]) => ({ name, value }))} barSize={isDesktop ? 48 : 36}>
                    <XAxis dataKey="name" tick={{ fill: T.text3, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: T.text3, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtS} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} fill={T.gold} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ fontSize: 11, color: T.text3, marginTop: 8, textAlign: "center" }}>
                  {Object.entries(it.data.bp).map(([p, v]) => `${p}: ${((v / it.data.tot) * 100).toFixed(0)}%`).join("  /  ")}
                </div>
              </div>
            </div>
            {it.categoryAnalysis && <div style={{ ...cardS, padding: isDesktop ? 22 : 18, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.gold, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}><PieChart size={16} />Category Analysis</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: T.text2 }}>{it.categoryAnalysis}</div>
            </div>}
            {it.patterns && <div style={{ ...cardS, padding: isDesktop ? 22 : 18, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.gold, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}><Coins size={16} />Spending Patterns</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: T.text2 }}>{it.patterns}</div>
            </div>}
            {it.data.t5x.length > 0 && <div style={{ ...cardS, padding: isDesktop ? 22 : 18, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text1, marginBottom: 14 }}>Top Expenses</div>
              {it.data.t5x.map((e, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < it.data.t5x.length - 1 ? `1px solid ${T.border}` : "none" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>{e.description || e.category}</div>
                    <div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>{e.category} / {e.date} / {e.addedBy}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.gold }}>{fmt(e.amount)}</div>
                </div>
              ))}
            </div>}
            {it.tips && it.tips.length > 0 && <div style={{ ...cardS, padding: isDesktop ? 22 : 18, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.gold, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><Lightbulb size={16} />Tips & Recommendations</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {it.tips.map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ minWidth: 24, height: 24, borderRadius: 12, background: T.goldMuted, color: T.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{i + 1}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.6, color: T.text2, paddingTop: 2 }}>{tip}</div>
                  </div>
                ))}
              </div>
            </div>}
            {it.debtAnalysis && it.data?.debts?.length > 0 && <div style={{ ...cardS, padding: isDesktop ? 22 : 18, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text1, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><Coins size={16} style={{ color: T.gold }} />Debt Summary</div>
              <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(3,1fr)" : "1fr 1fr", gap: 10, marginBottom: 14 }}>
                <div style={{ background: theme === "dark" ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.06)", borderRadius: 12, padding: 12 }}><div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Total Owed</div><div style={{ fontSize: 18, fontWeight: 800, color: T.err, marginTop: 4 }}>{fmt(it.data.debts.reduce((s, d) => s + d.currentBalance, 0))}</div></div>
                <div style={{ background: T.inputBg, borderRadius: 12, padding: 12 }}><div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Min/Month</div><div style={{ fontSize: 18, fontWeight: 800, color: T.text1, marginTop: 4 }}>{fmt(it.data.debts.reduce((s, d) => s + (d.minPayment || 0), 0))}</div></div>
                <div style={{ background: T.inputBg, borderRadius: 12, padding: 12, ...(isDesktop ? {} : { gridColumn: "1 / -1" }) }}><div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Active Debts</div><div style={{ fontSize: 18, fontWeight: 800, color: T.gold, marginTop: 4 }}>{it.data.debts.filter(d => d.currentBalance > 0).length}</div></div>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: T.text2, margin: 0 }}>{it.debtAnalysis}</p>
            </div>}
          </>}
        </>)}

        {sub === "settings" && (<>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Settings</div>

          {/* Profile card */}
          <div style={{ ...cardS, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: `2px solid ${T.gold}`, flexShrink: 0 }} /> : <div style={{ width: 48, height: 48, borderRadius: "50%", background: T.goldMuted, border: `2px solid ${T.gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: T.gold, flexShrink: 0 }}>{(user || "?")[0].toUpperCase()}</div>}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text1 }}>{profile?.display_name || user}</div>
              <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{profile?.email || ""}</div>
            </div>
          </div>

          {sbReady && householdId && (
            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 8, marginBottom: 16 }}>
              {householdRole === "owner" && <button onClick={() => { setInviteEmail(""); setInviteEmailSent(false); setInviteModal(true); }} style={{ ...cardS, width: "100%", padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                <UserPlus size={18} style={{ color: T.gold }} />
                <div><div style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>Invite Partner</div><div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>Invite by Gmail address</div></div>
              </button>}
              <div style={{ ...cardS, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                <Home size={18} style={{ color: T.gold, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    {editHhName ? (
                      <input value={hhName} onChange={e => setHhName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") saveHhName(); if (e.key === "Escape") setEditHhName(false); }} style={{ ...inpS, padding: "4px 8px", fontSize: 12, flex: 1 }} autoFocus />
                    ) : (
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text1, flex: 1 }}>{hhName}</div>
                    )}
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: householdRole === "owner" ? "rgba(245,181,38,0.15)" : "rgba(138,128,120,0.15)", color: householdRole === "owner" ? T.gold : T.text3, textTransform: "capitalize", flexShrink: 0 }}>{householdRole}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontSize: 10, color: T.text3, flex: 1 }}>{users.length} member{users.length !== 1 ? "s" : ""}</div>
                    {householdRole === "owner" && (editHhName ? (
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={saveHhName} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, border: "none", background: T.gold, color: "#0C0C12", fontWeight: 700, cursor: "pointer" }}>Save</button>
                        <button onClick={() => { setEditHhName(false); setHhName(household?.name || "My Household"); }} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, border: `1px solid ${T.border}`, background: "transparent", color: T.text3, cursor: "pointer" }}>Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setEditHhName(true)} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, border: `1px solid ${T.border}`, background: "transparent", color: T.text3, cursor: "pointer" }}>Rename</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 8 }}>
            <button onClick={exportCSV} style={{ ...cardS, width: "100%", padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}><Download size={18} style={{ color: T.gold }} /><div><div style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>Export CSV</div><div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>Download all expenses</div></div></button>
            {householdRole === "owner" && <button onClick={() => setClr(true)} style={{ ...cardS, width: "100%", padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left", borderColor: `${T.err}30` }}><AlertTriangle size={18} style={{ color: T.err }} /><div><div style={{ fontSize: 13, fontWeight: 600, color: T.err }}>Clear All Data</div><div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>Remove everything permanently</div></div></button>}
          </div>
        </>)}
      </div>

      {/* Invite modal */}
      {inviteModal && <div style={mOvS}><div style={{ ...mInS, maxWidth: 420 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>Invite Partner</div>
          <button onClick={() => setInviteModal(false)} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer" }}><X size={22} /></button>
        </div>
        {inviteEmailSent ? (
          <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <Check size={32} style={{ color: T.ok, marginBottom: 12 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: T.text1, marginBottom: 8 }}>Invite sent!</div>
            <p style={{ fontSize: 13, color: T.text2, marginBottom: 16 }}>When <strong>{inviteEmail}</strong> signs in with Google, they'll be prompted to join your household.</p>
            <div style={{ background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: 12, padding: "12px 14px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <span style={{ fontSize: 12, color: T.text3, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{window.location.origin}</span>
              <button onClick={() => { navigator.clipboard.writeText(window.location.origin).then(() => { setInvLinkCopied(true); setTimeout(() => setInvLinkCopied(false), 2500); }); }} style={{ ...btnP, padding: "7px 14px", fontSize: 12, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
                <Check size={12} style={{ display: invLinkCopied ? "block" : "none" }} />{invLinkCopied ? "Copied!" : "Copy Link"}
              </button>
            </div>
            <p style={{ fontSize: 11, color: T.text3, margin: 0 }}>Send them this link -- when they open it and sign in, the join prompt will appear automatically.</p>
          </div>
        ) : (<>
          <p style={{ fontSize: 13, color: T.text2, marginBottom: 16, lineHeight: 1.5 }}>Enter your partner's Gmail address. They'll see a join prompt the next time they sign in with Google.</p>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
            <input type="email" placeholder="partner@gmail.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} onKeyDown={e => { if (e.key === "Enter") sendEmailInvite(); }} style={{ ...inpS, flex: 1 }} />
            <button onClick={sendEmailInvite} style={{ ...btnP, padding: "12px 16px", whiteSpace: "nowrap" }}>Send</button>
          </div>
          <p style={{ fontSize: 11, color: T.text3, margin: 0 }}>Invite expires in 7 days.</p>
        </>)}
      </div></div>}

      {/* Clear all data modal */}
      {clr && <div style={mOvS}><div style={mInS}><div style={{ textAlign: "center" }}><AlertTriangle size={36} style={{ color: T.err, marginBottom: 14 }} /><div style={{ fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Clear ALL data?</div><div style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>This removes everything permanently.</div><div style={{ display: "flex", gap: 8 }}><button onClick={clearAll} style={{ ...btnP, flex: 1, background: T.err, boxShadow: "none" }}>Clear All</button><button onClick={() => setClr(false)} style={{ ...btnG, flex: 1 }}>Cancel</button></div></div></div></div>}
    </div>
  );
}
