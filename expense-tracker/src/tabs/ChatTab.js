import { useState, useRef, useEffect } from "react";
import { X, Check, Send, ImagePlus, AlertTriangle, TrendingUp, Lightbulb, Coins, PieChart, History, Trash2, Download, ChevronUp, Zap } from "lucide-react";
import { PieChart as RPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import ChartTooltip from "../components/ChartTooltip";
import { useApp } from "../AppContext";
import { fmt, td, uid, stripE, pld, startOf, prevRange, fmtS } from "../constants";

export default function ChatTab() {
  const { exp, accts, budgets, cats, debts, catColors, users, svE, svA, svAH, svIns, delIns, insights, tst, callAI, user, household, theme, isDesktop, T, cardS, pillS, inpS, btnP, btnG, mOvS, mInS } = useApp();

  const welcome = { role: "assistant", content: `Hey ${user}! Tell me what you spent and I'll log it. Upload a receipt or just type it out.` };
  const [msgs, setMsgs] = useState(() => { try { const s = localStorage.getItem("chatMsgs"); if (s) { const p = JSON.parse(s); if (Array.isArray(p) && p.length > 0) return p; } } catch {} return [welcome]; });
  useEffect(() => { try { localStorage.setItem("chatMsgs", JSON.stringify(msgs)); } catch {} }, [msgs]);
  const [ci, setCi] = useState("");
  const [cl, setCl] = useState(false);
  const [pe, setPe] = useState(null);
  const [att, setAtt] = useState(null);
  const [editIdx, setEditIdx] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [showRevPer, setShowRevPer] = useState(false);
  const [showPastRev, setShowPastRev] = useState(false);

  const cr = useRef(null);
  const fr = useRef(null);

  const debtCtx = debts.length ? `\nDebts:\n${debts.map(d => `- ${d.name} (${d.type}): Balance PHP ${d.currentBalance.toFixed(0)} of PHP ${d.totalAmount.toFixed(0)}, Min PHP ${d.minPayment || 0}/mo${d.interestRate ? `, ${d.interestRate}% APR` : ""}${d.dueDate ? `, due day ${d.dueDate}` : ""}`).join("\n")}\nTotal debt: PHP ${debts.reduce((s, d) => s + d.currentBalance, 0).toFixed(0)}` : "";
  const acctCtx = accts.length ? `\nAccounts:\n${accts.map(a => `- "${a.name}" (${a.type}): PHP ${a.balance.toFixed(2)}`).join("\n")}\nIf user mentions paying from a specific account/bank/card, set "account" to the matching account name. If not mentioned, omit "account".` : "";
  const SYS = `You are an expense tracker assistant for a couple (${users.join(" and ")}). Currency: PHP (Philippine Peso).
RESPOND ONLY WITH VALID JSON. No markdown, no backticks. Today: ${td()}. Current user: ${user}.
Format: {"expenses":[{"amount":number,"category":"${cats.join("|")}","description":"text","date":"YYYY-MM-DD"${accts.length ? ',"account":"account name or omit"' : ""}}],"message":"confirmation text, NO emojis"}
Not expenses: {"expenses":[],"message":"response, NO emojis"}
Rules: No emojis. If no date mentioned use today. Parse commas/newlines as multiple. Categories: ${cats.join(", ")}. If unsure pick "Other". gas/grab/angkas=Transport. food/jollibee/grocery/coffee=Food. netflix/spotify=Subscriptions. meralco/pldt/water=Bills.
For debt questions (repayment timeline, interest savings, what-if scenarios): use expenses:[] and answer in message. Use amortization math for timelines. Be specific with numbers and months.${debtCtx}${acctCtx}`;

  const resolveAcct = (name) => { if (!name) return null; const n = name.toLowerCase(); return accts.find(a => a.name.toLowerCase() === n || a.name.toLowerCase().includes(n) || n.includes(a.name.toLowerCase())) || null; };
  const parseR = (t) => {
    try { let c = t.replace(/```json|```/g, "").trim(); const m = c.match(/\{[\s\S]*\}/); if (m) { const p = JSON.parse(m[0]); return { expenses: (p.expenses || []).map(e => { const matched = resolveAcct(e.account); return { ...e, category: cats.includes(e.category) ? e.category : "Other", date: e.date || td(), accountId: matched?.id || null, accountName: matched?.name || null }; }), message: p.message || "" }; } return { expenses: [], message: t.slice(0, 300) }; }
    catch { if (t && !t.startsWith("{")) return { expenses: [], message: t.slice(0, 300) }; return { expenses: [], message: "Could not parse." }; }
  };

  const doChat = async () => {
    const hasText = ci.trim(); const hasImg = !!att;
    if ((!hasText && !hasImg) || cl) return;
    const m = ci.trim(); setCi(""); const img = att; setAtt(null); setCl(true);
    if (img) { if (img.preview) URL.revokeObjectURL(img.preview); }
    const label = img ? (m ? `[Receipt: ${img.name}] ${m}` : `[Receipt: ${img.name}]`) : m;
    setMsgs(v => [...v, { role: "user", content: label }]);
    try {
      let content;
      if (img) {
        const parts = [{ type: "image", source: { type: "base64", media_type: img.type, data: img.b64 } }, { type: "text", text: m || "Extract all items and totals from this receipt. Return as expenses JSON." }];
        content = [{ role: "user", content: parts }];
      } else { content = [{ role: "user", content: m }]; }
      const raw = await callAI(content, SYS); const p = parseR(raw); const t = stripE(p.message || "Done.");
      if (p.expenses?.length > 0) setPe(p.expenses.map(e => ({ ...e, id: uid(), addedBy: user, createdAt: Date.now() })));
      setMsgs(v => [...v, { role: "assistant", content: t }]);
    } catch { setMsgs(v => [...v, { role: "assistant", content: "Something went wrong." }]); }
    setCl(false);
  };

  const doImg = async (ev) => {
    const file = ev.target.files?.[0]; if (!file) return;
    try {
      const b64 = await new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => {
          const MAX = 1200;
          let w = img.width, h = img.height;
          if (w > MAX || h > MAX) { const s = MAX / Math.max(w, h); w = Math.round(w * s); h = Math.round(h * s); }
          const c = document.createElement("canvas"); c.width = w; c.height = h;
          const ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = c.toDataURL("image/jpeg", 0.7);
          res(dataUrl.split(",")[1]);
        };
        img.onerror = () => rej("fail");
        img.src = URL.createObjectURL(file);
      });
      setAtt({ b64, name: file.name, type: "image/jpeg", preview: URL.createObjectURL(file) });
    } catch { tst("Failed to read image."); }
    if (fr.current) fr.current.value = "";
  };

  const findDup = (e) => { const desc = (e.description || "").toLowerCase(); const amt = e.amount; return exp.find(x => x.category === e.category && Math.abs(x.amount - amt) / (amt || 1) <= 0.1 && desc && (x.description || "").toLowerCase().includes(desc.toLowerCase().split(" ")[0])); };
  const deductAccts = (items) => {
    const byAcct = {};
    items.forEach(e => { if (e.accountId) { byAcct[e.accountId] = (byAcct[e.accountId] || 0) + e.amount; } });
    if (Object.keys(byAcct).length === 0) return;
    let updated = [...accts];
    const histEntries = [];
    Object.entries(byAcct).forEach(([aid, total]) => {
      updated = updated.map(a => {
        if (a.id !== aid) return a;
        const oldBal = a.balance;
        const newBal = parseFloat((a.balance - total).toFixed(2));
        histEntries.push({ id: uid(), accountId: aid, oldBalance: oldBal, newBalance: newBal, change: -total, reason: "expense", description: items.filter(e => e.accountId === aid).map(e => e.description || e.category).join(", "), createdAt: Date.now() });
        return { ...a, balance: newBal, updatedAt: Date.now() };
      });
    });
    svA(updated);
    histEntries.forEach(h => svAH && svAH(h));
  };
  const confirmAll = () => { if (!pe || !pe.length) return; svE([...pe, ...exp], { upsertMany: pe }); deductAccts(pe); const sum = pe.map(e => `  ${e.description || e.category} (${e.category}) - ${fmt(e.amount)}${e.accountName ? ` [${e.accountName}]` : ""}`).join("\n"); setMsgs(v => [...v, { role: "assistant", content: `Saved ${pe.length} expenses:\n${sum}\nTotal: ${fmt(pe.reduce((s, e) => s + e.amount, 0))}` }]); tst(`${pe.length} added`); setPe(null); setEditIdx(null); };
  const rejectAll = () => { const n = pe?.length || 0; setPe(null); setEditIdx(null); setMsgs(v => [...v, { role: "assistant", content: `Discarded all ${n} expenses. No changes were saved.` }]); };
  const saveSingle = (i) => { if (!pe) return; const e = pe[i]; svE([e, ...exp], { upsert: e }); deductAccts([e]); setMsgs(v => [...v, { role: "assistant", content: `Saved: ${e.description || e.category} (${e.category}) - ${fmt(e.amount)} on ${e.date}${e.accountName ? ` [${e.accountName}]` : ""}` }]); tst(`Saved: ${e.description || e.category}`); const rest = pe.filter((_, j) => j !== i); setPe(rest.length ? rest : null); if (editIdx === i) { setEditIdx(null); setEditForm(null); } };
  const discardSingle = (i) => { if (!pe) return; const e = pe[i]; setMsgs(v => [...v, { role: "assistant", content: `Discarded: ${e.description || e.category} (${e.category}) - ${fmt(e.amount)}` }]); const rest = pe.filter((_, j) => j !== i); setPe(rest.length ? rest : null); if (editIdx === i) { setEditIdx(null); setEditForm(null); } };
  const startEdit = (i) => { setEditIdx(i); setEditForm({ ...pe[i] }); };
  const cancelEdit = () => { setEditIdx(null); setEditForm(null); };
  const applyEdit = (i) => { if (!editForm) return; const u = [...pe]; u[i] = { ...editForm, amount: parseFloat(editForm.amount) || 0 }; setPe(u); setEditIdx(null); setEditForm(null); };
  const applyAndSave = (i) => { if (!editForm) return; const e = { ...editForm, amount: parseFloat(editForm.amount) || 0 }; svE([e, ...exp], { upsert: e }); deductAccts([e]); setMsgs(v => [...v, { role: "assistant", content: `Saved: ${e.description || e.category} (${e.category}) - ${fmt(e.amount)} on ${e.date}${e.accountName ? ` [${e.accountName}]` : ""}` }]); tst(`Saved: ${e.description || e.category}`); const rest = (pe || []).filter((_, j) => j !== i); setPe(rest.length ? rest : null); setEditIdx(null); setEditForm(null); };

  // Quick action chips
  const CHIPS = [
    { label: "What did I spend this month?", msg: "What did I spend this month? Give me a summary." },
    { label: "Budget check", msg: "How am I doing against my budget this month? Am I over or under?" },
    { label: "Top expenses", msg: "What are my biggest expenses this month?" },
    { label: "Compare with last month", msg: "Compare my spending this month vs last month." },
    ...(debts.length ? [{ label: "Debt payoff plan", msg: "Give me a debt payoff plan. Which debt should I prioritize and why?" }] : []),
  ];
  const [chipsOpen, setChipsOpen] = useState(true);
  const showChipsAlways = !cl && !pe;
  const chipsExpanded = msgs.length === 1 ? true : chipsOpen;

  const loadPastReview = (ins) => {
    setShowPastRev(false);
    setMsgs(v => [...v, { role: "user", content: `View saved ${ins.period} review from ${new Date(ins.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}` }, { role: "assistant", content: "__INSIGHT__", insight: ins.data }]);
  };

  const genReview = async (period) => {
    setShowRevPer(false);
    if (cl) return;
    const ps = startOf(period); const rel = exp.filter(e => pld(e.date) >= ps);
    if (!rel.length) { setMsgs(v => [...v, { role: "user", content: `Generate ${period} spending review` }, { role: "assistant", content: `No expenses found for this ${period.toLowerCase()} period.` }]); return; }
    setCl(true);
    setMsgs(v => [...v, { role: "user", content: `Generate ${period} spending review` }]);
    const tot = rel.reduce((s, e) => s + e.amount, 0);
    const bc = rel.reduce((a, e) => { a[e.category] = (a[e.category] || 0) + e.amount; return a; }, {});
    const bp = rel.reduce((a, e) => { a[e.addedBy] = (a[e.addedBy] || 0) + e.amount; return a; }, {});
    const [pS, pE] = prevRange(period); const pT = exp.filter(e => { const d = pld(e.date); return d >= pS && d < pE; }).reduce((s, e) => s + e.amount, 0);
    const t5x = [...rel].sort((a, b) => b.amount - a.amount).slice(0, 5);
    const bStr = Object.entries(budgets).map(([c, v]) => `- ${c}: Budget PHP ${v}, Spent PHP ${(bc[c] || 0).toFixed(0)}`).join("\n");
    const debtStr = debts.length ? `\nDebts:\n${debts.map(d => `- ${d.name} (${d.type}): PHP ${d.currentBalance.toFixed(0)} remaining of PHP ${d.totalAmount.toFixed(0)}, ${d.interestRate || 0}% APR, Min PHP ${d.minPayment || 0}/mo`).join("\n")}\nTotal debt: PHP ${debts.reduce((s, d) => s + d.currentBalance, 0).toFixed(0)}` : "";
    const sum = `${period.toUpperCase()} REVIEW:\nTotal: PHP ${tot.toFixed(2)}\nPrev: PHP ${pT.toFixed(2)}\nBy category:\n${Object.entries(bc).map(([c, v]) => `- ${c}: PHP ${v.toFixed(0)}`).join("\n")}\nBy person:\n${Object.entries(bp).map(([p, v]) => `- ${p}: PHP ${v.toFixed(0)}`).join("\n")}\nTop 5:\n${t5x.map(e => `- ${e.description}: PHP ${e.amount}`).join("\n")}\nBudgets:\n${bStr}${debtStr}`;
    const IS = `You are ${users.join(" and ")}'s personal finance advisor. Filipino couple. No emojis. Respond ONLY with valid JSON (no markdown, no code fences). Format: {"overview":"1-2 sentence summary","categoryAnalysis":"2-3 sentences about category spending","patterns":"2-3 sentences about spending patterns or habits","debtAnalysis":"if debts exist: 2-3 sentences covering total debt load, highest priority debt, and one specific repayment tip with numbers. If no debts, return empty string.","tips":["tip 1","tip 2","tip 3"]}. Each tip should be specific and actionable with numbers. Keep it concise.`;
    try {
      const raw = await callAI([{ role: "user", content: sum }], IS);
      const clean = stripE(raw || "");
      let parsed;
      try { parsed = JSON.parse(clean); } catch { const m = clean.match(/\{[\s\S]*\}/); parsed = m ? JSON.parse(m[0]) : null; }
      const data = { bc, bp, tot, pT, t5x, period, count: rel.length, debts };
      if (parsed && parsed.overview) {
        const insightObj = { ...parsed, data };
        const saved = { id: uid(), period, data: insightObj, createdAt: new Date().toISOString() };
        svIns(saved);
        setMsgs(v => [...v, { role: "assistant", content: "__INSIGHT__", insight: insightObj }]);
      } else {
        setMsgs(v => [...v, { role: "assistant", content: clean || "Could not generate review." }]);
      }
    } catch { setMsgs(v => [...v, { role: "assistant", content: "Failed to generate review." }]); }
    setCl(false);
  };

  const buildDataCtx = () => {
    const now = new Date(); const mS = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const thisM = exp.filter(e => e.date >= mS);
    const tot = thisM.reduce((s, e) => s + e.amount, 0);
    const bc = thisM.reduce((a, e) => { a[e.category] = (a[e.category] || 0) + e.amount; return a; }, {});
    const bp = thisM.reduce((a, e) => { a[e.addedBy] = (a[e.addedBy] || 0) + e.amount; return a; }, {});
    const prevMS = new Date(now.getFullYear(), now.getMonth() - 1, 1); const prevME = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMStr = `${prevMS.getFullYear()}-${String(prevMS.getMonth() + 1).padStart(2, "0")}`;
    const prevExp = exp.filter(e => e.date >= `${prevMStr}-01` && e.date < `${prevME.getFullYear()}-${String(prevME.getMonth() + 1).padStart(2, "0")}-01`);
    const prevTot = prevExp.reduce((s, e) => s + e.amount, 0);
    const top5 = [...thisM].sort((a, b) => b.amount - a.amount).slice(0, 5);
    const budgetStr = Object.keys(budgets).length ? `\nBudgets:\n${Object.entries(budgets).map(([c, v]) => `- ${c}: Budget PHP ${v}, Spent PHP ${(bc[c] || 0).toFixed(0)}`).join("\n")}` : "";
    return `\nThis month's data (${now.toLocaleString("en", { month: "long", year: "numeric" })}):\nTotal spent: PHP ${tot.toFixed(2)} across ${thisM.length} transactions\nBy category:\n${Object.entries(bc).sort((a, b) => b[1] - a[1]).map(([c, v]) => `- ${c}: PHP ${v.toFixed(0)}`).join("\n")}\nBy person:\n${Object.entries(bp).map(([p, v]) => `- ${p}: PHP ${v.toFixed(0)}`).join("\n")}\nTop 5 this month:\n${top5.map(e => `- ${e.description || e.category}: PHP ${e.amount} (${e.category}, ${e.date})`).join("\n")}\nLast month total: PHP ${prevTot.toFixed(2)} across ${prevExp.length} transactions${budgetStr}`;
  };

  const QUERY_SYS = `You are a helpful financial assistant for a couple (${users.join(" and ")}). Currency: PHP (Philippine Peso). No emojis ever. Answer questions about their spending using the data provided. Be specific with numbers. Keep answers concise (2-4 sentences max). Today: ${td()}.${debtCtx}${acctCtx}`;

  const sendChip = async (text) => {
    if (cl) return;
    setCi(""); setCl(true);
    setMsgs(v => [...v, { role: "user", content: text }]);
    try {
      const dataCtx = buildDataCtx();
      const raw = await callAI([{ role: "user", content: dataCtx + "\n\nQuestion: " + text }], QUERY_SYS);
      const t = stripE(raw || "No response.");
      setMsgs(v => [...v, { role: "assistant", content: t }]);
    } catch { setMsgs(v => [...v, { role: "assistant", content: "Something went wrong." }]); }
    setCl(false);
  };

  const printInsight = (ins) => {
    const d = ins.data || {};
    const hhName = household?.name || "Shared Finance";
    const catRows = Object.entries(d.bc || {}).sort((a, b) => b[1] - a[1]).map(([c, v]) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${c}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">PHP ${v.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td></tr>`).join("");
    const personRows = Object.entries(d.bp || {}).map(([p, v]) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${p}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">PHP ${v.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td></tr>`).join("");
    const topRows = (d.t5x || []).map((e, i) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${i + 1}. ${e.description || e.category}</td><td style="padding:6px 12px;border-bottom:1px solid #eee">${e.category}</td><td style="padding:6px 12px;border-bottom:1px solid #eee">${e.date}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">PHP ${e.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td></tr>`).join("");
    const debtRows = (d.debts || []).map(db => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${db.name} (${db.type})</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">PHP ${db.currentBalance.toLocaleString("en-PH", { minimumFractionDigits: 0 })}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">PHP ${db.totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 0 })}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">${db.interestRate || 0}%</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>${d.period || ""} Spending Review - ${hhName}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#1a1a2e;margin:0;padding:32px 40px}h1{font-size:22px;margin:0 0 4px}h2{font-size:15px;color:#F5B526;margin:24px 0 10px;border-bottom:2px solid #F5B526;padding-bottom:4px}table{width:100%;border-collapse:collapse;font-size:13px}th{text-align:left;padding:8px 12px;background:#f8f6f0;font-weight:700;font-size:12px;border-bottom:2px solid #ddd}.stats{display:flex;gap:20px;margin:16px 0}.stat{flex:1;background:#f8f6f0;border-radius:10px;padding:14px}.stat-label{font-size:10px;text-transform:uppercase;color:#8a8078;font-weight:600}.stat-val{font-size:20px;font-weight:800;margin-top:4px}.gold{color:#F5B526}.section{margin-bottom:6px;font-size:13px;line-height:1.7;color:#333}.tip{display:flex;gap:8px;margin-bottom:6px;font-size:13px;line-height:1.6}.tip-num{min-width:22px;height:22px;border-radius:50%;background:#fef3cd;color:#F5B526;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0}.sub{font-size:11px;color:#8a8078;margin-top:2px}@media print{body{padding:20px 24px}}</style></head><body>
<h1>${hhName} - ${d.period || ""} Spending Review</h1>
<div class="sub">Generated ${new Date().toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
<div class="stats"><div class="stat"><div class="stat-label">Total Spent</div><div class="stat-val gold">PHP ${(d.tot || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</div></div><div class="stat"><div class="stat-label">Transactions</div><div class="stat-val">${d.count || 0}</div></div><div class="stat"><div class="stat-label">Previous ${d.period || ""}</div><div class="stat-val">${d.pT > 0 ? "PHP " + d.pT.toLocaleString("en-PH", { minimumFractionDigits: 2 }) : "--"}</div></div></div>
${ins.overview ? `<h2>Overview</h2><div class="section">${ins.overview}</div>` : ""}
${catRows ? `<h2>By Category</h2><table><tr><th>Category</th><th style="text-align:right">Amount</th></tr>${catRows}</table>` : ""}
${personRows ? `<h2>By Person</h2><table><tr><th>Person</th><th style="text-align:right">Amount</th></tr>${personRows}</table>` : ""}
${ins.categoryAnalysis ? `<h2>Category Analysis</h2><div class="section">${ins.categoryAnalysis}</div>` : ""}
${ins.patterns ? `<h2>Spending Patterns</h2><div class="section">${ins.patterns}</div>` : ""}
${topRows ? `<h2>Top Expenses</h2><table><tr><th>Description</th><th>Category</th><th>Date</th><th style="text-align:right">Amount</th></tr>${topRows}</table>` : ""}
${ins.tips?.length ? `<h2>Tips</h2>${ins.tips.map((t, j) => `<div class="tip"><div class="tip-num">${j + 1}</div><div>${t}</div></div>`).join("")}` : ""}
${ins.debtAnalysis && debtRows ? `<h2>Debt Summary</h2><table><tr><th>Debt</th><th style="text-align:right">Balance</th><th style="text-align:right">Total</th><th style="text-align:right">APR</th></tr>${debtRows}</table><div class="section" style="margin-top:10px">${ins.debtAnalysis}</div>` : ""}
</body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.onafterprint = () => w.close(); setTimeout(() => w.print(), 300); }
  };

  // scroll on message change
  const prevMsgsLen = useRef(msgs.length);
  if (msgs.length !== prevMsgsLen.current) { prevMsgsLen.current = msgs.length; setTimeout(() => cr.current?.scrollIntoView({ behavior: "smooth" }), 50); }

  return (
    <div style={{ flex: 1, maxWidth: isDesktop ? 720 : 600, margin: "0 auto", padding: isDesktop ? "28px 36px 20px" : "18px 20px", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {msgs.length > 1 && <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
        <button onClick={() => { setMsgs([welcome]); setPe(null); setEditIdx(null); setEditForm(null); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1px solid ${T.border}`, background: "transparent", color: T.text3 }}><Trash2 size={11} />Clear chat</button>
      </div>}
      <div style={{ flex: 1, overflowY: "auto", marginBottom: 14 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
            {m.insight ? (
              <div style={{ maxWidth: isDesktop ? "90%" : "95%", width: "100%" }}>
                {/* Download PDF */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
                  <button onClick={() => printInsight(m.insight)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1px solid ${T.border}`, background: T.surface, color: T.text3, transition: "all 0.2s" }}><Download size={12} />Download PDF</button>
                </div>
                {/* Summary stats */}
                <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "1fr 1fr", gap: 8, marginBottom: 10 }}>
                  <div style={{ ...cardS, padding: 14 }}><div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: T.text3, marginBottom: 4 }}>Total Spent</div><div style={{ fontSize: 18, fontWeight: 800, color: T.gold }}>{fmt(m.insight.data.tot)}</div><div style={{ fontSize: 10, color: m.insight.data.pT > 0 ? (m.insight.data.tot > m.insight.data.pT ? T.err : T.ok) : T.text3, marginTop: 2 }}>{m.insight.data.pT > 0 ? `${m.insight.data.tot > m.insight.data.pT ? "+" : ""}${(((m.insight.data.tot - m.insight.data.pT) / m.insight.data.pT) * 100).toFixed(1)}% vs prev` : "No prev data"}</div></div>
                  <div style={{ ...cardS, padding: 14 }}><div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: T.text3, marginBottom: 4 }}>Transactions</div><div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>{m.insight.data.count}</div><div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>this {m.insight.data.period.toLowerCase()}</div></div>
                  <div style={{ ...cardS, padding: 14, ...(isDesktop ? {} : { gridColumn: "1 / -1" }) }}><div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: T.text3, marginBottom: 4 }}>Previous {m.insight.data.period}</div><div style={{ fontSize: 18, fontWeight: 800, color: T.text2 }}>{m.insight.data.pT > 0 ? fmt(m.insight.data.pT) : "--"}</div></div>
                </div>
                {/* Overview */}
                {m.insight.overview && <div style={{ ...cardS, padding: 16, marginBottom: 10 }}><div style={{ fontSize: 13, fontWeight: 700, color: T.gold, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><TrendingUp size={14} />Overview</div><div style={{ fontSize: 12, lineHeight: 1.7, color: T.text2 }}>{m.insight.overview}</div></div>}
                {/* Charts */}
                <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 8, marginBottom: 10 }}>
                  <div style={{ ...cardS, padding: 16 }}><div style={{ fontSize: 13, fontWeight: 700, color: T.text1, marginBottom: 10 }}>By Category</div>
                    <ResponsiveContainer width="100%" height={160}><RPie><Pie data={Object.entries(m.insight.data.bc).map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">{Object.keys(m.insight.data.bc).map((c, j) => <Cell key={j} fill={catColors[c] || T.text3} />)}</Pie><Tooltip content={<ChartTooltip />} /></RPie></ResponsiveContainer>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>{Object.entries(m.insight.data.bc).sort((a, b) => b[1] - a[1]).map(([c, v]) => <div key={c} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, color: T.text3 }}><div style={{ width: 6, height: 6, borderRadius: 3, background: catColors[c] || T.text3 }} />{c}: {fmt(v)}</div>)}</div>
                  </div>
                  <div style={{ ...cardS, padding: 16 }}><div style={{ fontSize: 13, fontWeight: 700, color: T.text1, marginBottom: 10 }}>By Person</div>
                    <ResponsiveContainer width="100%" height={160}><BarChart data={Object.entries(m.insight.data.bp).map(([name, value]) => ({ name, value }))} barSize={isDesktop ? 40 : 32}><XAxis dataKey="name" tick={{ fill: T.text3, fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: T.text3, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={fmtS} /><Tooltip content={<ChartTooltip />} /><Bar dataKey="value" radius={[6, 6, 0, 0]} fill={T.gold} /></BarChart></ResponsiveContainer>
                  </div>
                </div>
                {/* Category analysis */}
                {m.insight.categoryAnalysis && <div style={{ ...cardS, padding: 16, marginBottom: 10 }}><div style={{ fontSize: 13, fontWeight: 700, color: T.gold, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><PieChart size={14} />Category Analysis</div><div style={{ fontSize: 12, lineHeight: 1.7, color: T.text2 }}>{m.insight.categoryAnalysis}</div></div>}
                {/* Patterns */}
                {m.insight.patterns && <div style={{ ...cardS, padding: 16, marginBottom: 10 }}><div style={{ fontSize: 13, fontWeight: 700, color: T.gold, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Coins size={14} />Spending Patterns</div><div style={{ fontSize: 12, lineHeight: 1.7, color: T.text2 }}>{m.insight.patterns}</div></div>}
                {/* Top expenses */}
                {m.insight.data.t5x.length > 0 && <div style={{ ...cardS, padding: 16, marginBottom: 10 }}><div style={{ fontSize: 13, fontWeight: 700, color: T.text1, marginBottom: 10 }}>Top Expenses</div>{m.insight.data.t5x.map((e, j) => <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: j < m.insight.data.t5x.length - 1 ? `1px solid ${T.border}` : "none" }}><div><div style={{ fontSize: 12, fontWeight: 600, color: T.text1 }}>{e.description || e.category}</div><div style={{ fontSize: 9, color: T.text3, marginTop: 1 }}>{e.category} / {e.date}</div></div><div style={{ fontSize: 13, fontWeight: 700, color: T.gold }}>{fmt(e.amount)}</div></div>)}</div>}
                {/* Tips */}
                {m.insight.tips?.length > 0 && <div style={{ ...cardS, padding: 16, marginBottom: 10 }}><div style={{ fontSize: 13, fontWeight: 700, color: T.gold, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Lightbulb size={14} />Tips</div>{m.insight.tips.map((tip, j) => <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: j < m.insight.tips.length - 1 ? 8 : 0 }}><div style={{ minWidth: 20, height: 20, borderRadius: 10, background: T.goldMuted, color: T.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{j + 1}</div><div style={{ fontSize: 12, lineHeight: 1.6, color: T.text2, paddingTop: 1 }}>{tip}</div></div>)}</div>}
                {/* Debt analysis */}
                {m.insight.debtAnalysis && m.insight.data?.debts?.length > 0 && <div style={{ ...cardS, padding: 16, marginBottom: 10 }}><div style={{ fontSize: 13, fontWeight: 700, color: T.text1, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Coins size={14} style={{ color: T.gold }} />Debt Summary</div><div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(3,1fr)" : "1fr 1fr", gap: 8, marginBottom: 10 }}><div style={{ background: theme === "dark" ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.06)", borderRadius: 10, padding: 10 }}><div style={{ fontSize: 9, color: T.text3, fontWeight: 600, textTransform: "uppercase" }}>Total Owed</div><div style={{ fontSize: 16, fontWeight: 800, color: T.err, marginTop: 3 }}>{fmt(m.insight.data.debts.reduce((s, d) => s + d.currentBalance, 0))}</div></div><div style={{ background: T.inputBg, borderRadius: 10, padding: 10 }}><div style={{ fontSize: 9, color: T.text3, fontWeight: 600, textTransform: "uppercase" }}>Min/Month</div><div style={{ fontSize: 16, fontWeight: 800, color: T.text1, marginTop: 3 }}>{fmt(m.insight.data.debts.reduce((s, d) => s + (d.minPayment || 0), 0))}</div></div></div><p style={{ fontSize: 12, lineHeight: 1.7, color: T.text2, margin: 0 }}>{m.insight.debtAnalysis}</p></div>}
              </div>
            ) : (
              <div style={{ maxWidth: isDesktop ? "65%" : "82%", padding: "12px 16px", borderRadius: 16, background: m.role === "user" ? T.chatUser : T.chatBot, border: m.role === "user" ? "none" : `1px solid ${T.chatBotBorder}`, color: m.role === "user" ? T.chatUserText : T.text1, fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", fontWeight: m.role === "user" ? 600 : 400 }}>{m.content}</div>
            )}
          </div>
        ))}
        {cl && <div style={{ display: "flex", marginBottom: 10 }}><div style={{ padding: "12px 16px", borderRadius: 16, background: T.chatBot, border: `1px solid ${T.chatBotBorder}`, color: T.gold, fontSize: 13 }}>Thinking...</div></div>}
        {pe && pe.length > 0 && (
          <div style={{ ...cardS, marginBottom: 10, borderColor: T.borderStrong }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.gold }}>{pe.length} expense{pe.length > 1 ? "s" : ""} found</div>
              {pe.length > 1 && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={confirmAll} style={{ ...btnP, padding: "7px 14px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><Check size={12} />Save All</button>
                  <button onClick={rejectAll} style={{ ...btnG, padding: "7px 14px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><X size={12} />Discard All</button>
                </div>
              )}
            </div>
            {pe.map((e, i) => { const dup = findDup(e); return (
              <div key={e.id} style={{ padding: 12, marginBottom: i < pe.length - 1 ? 8 : 0, background: "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${dup ? T.err : T.border}` }}>
                {editIdx === i && editForm ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input value={editForm.description} onChange={ev => setEditForm({ ...editForm, description: ev.target.value })} placeholder="Description" style={{ ...inpS, padding: "8px 10px", fontSize: 12 }} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="number" value={editForm.amount} onChange={ev => setEditForm({ ...editForm, amount: ev.target.value })} placeholder="Amount" style={{ ...inpS, flex: 1, padding: "8px 10px", fontSize: 12 }} />
                      <select value={editForm.category} onChange={ev => setEditForm({ ...editForm, category: ev.target.value })} style={{ ...inpS, flex: 1, padding: "8px 10px", fontSize: 12 }}>{cats.map(c => <option key={c} value={c}>{c}</option>)}</select>
                    </div>
                    <input type="date" value={editForm.date} onChange={ev => setEditForm({ ...editForm, date: ev.target.value })} style={{ ...inpS, padding: "8px 10px", fontSize: 12 }} />
                    {accts.length > 0 && <select value={editForm.accountId || ""} onChange={ev => { const a = accts.find(x => x.id === ev.target.value); setEditForm({ ...editForm, accountId: a?.id || null, accountName: a?.name || null }); }} style={{ ...inpS, padding: "8px 10px", fontSize: 12 }}><option value="">No account linked</option>{accts.map(a => <option key={a.id} value={a.id}>{a.name} ({fmt(a.balance)})</option>)}</select>}
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button onClick={() => applyAndSave(i)} style={{ ...btnP, padding: "7px 14px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><Check size={12} />Done & Save</button>
                      <button onClick={() => applyEdit(i)} style={{ ...btnG, padding: "7px 14px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><Check size={12} />Done</button>
                      <button onClick={cancelEdit} style={{ ...btnG, padding: "7px 14px", fontSize: 11 }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {dup && <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.err, marginBottom: 6 }}><AlertTriangle size={12} />Similar entry found on {dup.date}</div>}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div><div style={{ fontSize: 13, fontWeight: 600 }}>{e.description || e.category}</div><div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>{e.category} -- {e.date}{e.accountName ? ` -- ${e.accountName}` : ""}</div></div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: T.gold }}>{fmt(e.amount)}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8, justifyContent: "flex-end" }}>
                      <button onClick={() => saveSingle(i)} style={{ ...btnP, padding: "6px 12px", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}><Check size={11} />Save</button>
                      <button onClick={() => startEdit(i)} style={{ ...btnG, padding: "6px 12px", fontSize: 11 }}>Edit</button>
                      <button onClick={() => discardSingle(i)} style={{ ...btnG, padding: "6px 12px", fontSize: 11, borderColor: T.err, color: T.err }}>Discard</button>
                    </div>
                  </>
                )}
              </div>
            ); })}
          </div>
        )}
        <div ref={cr} />
      </div>

      {showChipsAlways && (
        <>
          {msgs.length > 1 && (
            <button onClick={() => setChipsOpen(v => !v)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1px solid ${T.border}`, background: "transparent", color: T.text3, marginBottom: chipsExpanded ? 6 : 8, alignSelf: "flex-start" }}>
              <Zap size={11} />Shortcuts
              <ChevronUp size={12} style={{ transform: chipsExpanded ? "none" : "rotate(180deg)", transition: "transform 0.2s" }} />
            </button>
          )}
          {chipsExpanded && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {CHIPS.map((c, i) => (
                <button key={i} onClick={() => sendChip(c.msg)} style={{ padding: "7px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1px solid ${T.borderStrong}`, background: T.surface, color: T.gold, transition: "all 0.2s" }}>{c.label}</button>
              ))}
              <button onClick={() => setShowRevPer(v => !v)} style={{ padding: "7px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1px solid ${T.gold}`, background: T.goldMuted, color: T.gold, transition: "all 0.2s" }}>Spending review</button>
              {insights.length > 0 && <button onClick={() => setShowPastRev(true)} style={{ padding: "7px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1px solid ${T.borderStrong}`, background: T.surface, color: T.text3, transition: "all 0.2s", display: "flex", alignItems: "center", gap: 4 }}><History size={12} />Past reviews ({insights.length})</button>}
            </div>
          )}
          {showRevPer && chipsExpanded && (
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {["Weekly", "Monthly", "Quarterly", "Yearly"].map(p => (
                <button key={p} onClick={() => genReview(p)} style={pillS(false)}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
      {att && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", marginBottom: 6, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12 }}>
          <img src={att.preview} alt="attached" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, border: `1px solid ${T.border}` }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</div>
            <div style={{ fontSize: 11, color: T.text3 }}>Ready to send — type a note or hit Send</div>
          </div>
          <button onClick={() => { if (att.preview) URL.revokeObjectURL(att.preview); setAtt(null); }} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer", padding: 4 }}><X size={16} /></button>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <input type="file" ref={fr} accept="image/*" onChange={doImg} style={{ display: "none" }} />
        <button onClick={() => fr.current?.click()} disabled={cl} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 11, color: T.text2, cursor: "pointer", flexShrink: 0 }}><ImagePlus size={18} /></button>
        <textarea value={ci} onChange={e => setCi(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && isDesktop) { e.preventDefault(); doChat(); } }} disabled={cl} placeholder={att ? "Add a note about this receipt..." : "Type expense or ask..."} rows={1} style={{ ...inpS, flex: 1, resize: "none", minHeight: 42 }} />
        <button onClick={doChat} disabled={cl || (!ci.trim() && !att)} style={{ background: (ci.trim() || att) ? T.grad : T.surface, border: "none", borderRadius: 12, padding: 11, color: (ci.trim() || att) ? (T.chatUserText) : T.text3, cursor: "pointer", flexShrink: 0, boxShadow: (ci.trim() || att) ? "0 4px 12px rgba(245,181,38,0.2)" : "none" }}><Send size={18} /></button>
      </div>

      {showPastRev && <div style={mOvS}><div style={{ ...mInS, maxWidth: 500, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>Past Reviews</div>
          <button onClick={() => setShowPastRev(false)} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer" }}><X size={22} /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {insights.length === 0 ? <div style={{ fontSize: 13, color: T.text3, textAlign: "center", padding: 20 }}>No saved reviews yet.</div> : insights.map(ins => (
            <div key={ins.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", marginBottom: 6, background: T.inputBg, borderRadius: 12, border: `1px solid ${T.border}`, cursor: "pointer" }} onClick={() => loadPastReview(ins)}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>{ins.period} Review</div>
                <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{new Date(ins.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                <div style={{ fontSize: 11, color: T.gold, marginTop: 2 }}>{fmt(ins.data?.data?.tot || 0)} total -- {ins.data?.data?.count || 0} transactions</div>
              </div>
              <button onClick={(ev) => { ev.stopPropagation(); delIns(ins.id); tst("Review deleted"); }} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer", padding: 6, flexShrink: 0 }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div></div>}
    </div>
  );
}
