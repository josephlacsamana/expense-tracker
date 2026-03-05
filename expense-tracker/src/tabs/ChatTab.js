import { useState, useRef } from "react";
import { X, Check, Send, ImagePlus, AlertTriangle } from "lucide-react";
import { useApp } from "../AppContext";
import { fmt, td, uid, stripE } from "../constants";

export default function ChatTab() {
  const { exp, cats, debts, users, svE, tst, callAI, user, isDesktop, T, cardS, inpS, btnP, btnG } = useApp();

  const [msgs, setMsgs] = useState([{ role: "assistant", content: `Hey ${user}! Tell me what you spent and I'll log it. Upload a receipt or just type it out.` }]);
  const [ci, setCi] = useState("");
  const [cl, setCl] = useState(false);
  const [pe, setPe] = useState(null);
  const [att, setAtt] = useState(null);
  const [editIdx, setEditIdx] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const cr = useRef(null);
  const fr = useRef(null);

  const debtCtx = debts.length ? `\nDebts:\n${debts.map(d => `- ${d.name} (${d.type}): Balance PHP ${d.currentBalance.toFixed(0)} of PHP ${d.totalAmount.toFixed(0)}, Min PHP ${d.minPayment || 0}/mo${d.interestRate ? `, ${d.interestRate}% APR` : ""}${d.dueDate ? `, due day ${d.dueDate}` : ""}`).join("\n")}\nTotal debt: PHP ${debts.reduce((s, d) => s + d.currentBalance, 0).toFixed(0)}` : "";
  const SYS = `You are an expense tracker assistant for a couple (${users.join(" and ")}). Currency: PHP (Philippine Peso).
RESPOND ONLY WITH VALID JSON. No markdown, no backticks. Today: ${td()}. Current user: ${user}.
Format: {"expenses":[{"amount":number,"category":"${cats.join("|")}","description":"text","date":"YYYY-MM-DD"}],"message":"confirmation text, NO emojis"}
Not expenses: {"expenses":[],"message":"response, NO emojis"}
Rules: No emojis. If no date mentioned use today. Parse commas/newlines as multiple. Categories: ${cats.join(", ")}. If unsure pick "Other". gas/grab/angkas=Transport. food/jollibee/grocery/coffee=Food. netflix/spotify=Subscriptions. meralco/pldt/water=Bills.
For debt questions (repayment timeline, interest savings, what-if scenarios): use expenses:[] and answer in message. Use amortization math for timelines. Be specific with numbers and months.${debtCtx}`;

  const parseR = (t) => {
    try { let c = t.replace(/```json|```/g, "").trim(); const m = c.match(/\{[\s\S]*\}/); if (m) { const p = JSON.parse(m[0]); return { expenses: (p.expenses || []).map(e => ({ ...e, category: cats.includes(e.category) ? e.category : "Other", date: e.date || td() })), message: p.message || "" }; } return { expenses: [], message: t.slice(0, 300) }; }
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
      const b64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = () => rej("fail"); r.readAsDataURL(file); });
      setAtt({ b64, name: file.name, type: file.type || "image/jpeg", preview: URL.createObjectURL(file) });
    } catch { tst("Failed to read image."); }
    if (fr.current) fr.current.value = "";
  };

  const findDup = (e) => { const desc = (e.description || "").toLowerCase(); const amt = e.amount; return exp.find(x => x.category === e.category && Math.abs(x.amount - amt) / (amt || 1) <= 0.1 && desc && (x.description || "").toLowerCase().includes(desc.toLowerCase().split(" ")[0])); };
  const confirmAll = () => { if (!pe || !pe.length) return; svE([...pe, ...exp], { upsertMany: pe }); const sum = pe.map(e => `  ${e.description || e.category} (${e.category}) - ${fmt(e.amount)}`).join("\n"); setMsgs(v => [...v, { role: "assistant", content: `Saved ${pe.length} expenses:\n${sum}\nTotal: ${fmt(pe.reduce((s, e) => s + e.amount, 0))}` }]); tst(`${pe.length} added`); setPe(null); setEditIdx(null); };
  const rejectAll = () => { const n = pe?.length || 0; setPe(null); setEditIdx(null); setMsgs(v => [...v, { role: "assistant", content: `Discarded all ${n} expenses. No changes were saved.` }]); };
  const saveSingle = (i) => { if (!pe) return; const e = pe[i]; svE([e, ...exp], { upsert: e }); setMsgs(v => [...v, { role: "assistant", content: `Saved: ${e.description || e.category} (${e.category}) - ${fmt(e.amount)} on ${e.date}` }]); tst(`Saved: ${e.description || e.category}`); const rest = pe.filter((_, j) => j !== i); setPe(rest.length ? rest : null); if (editIdx === i) { setEditIdx(null); setEditForm(null); } };
  const discardSingle = (i) => { if (!pe) return; const e = pe[i]; setMsgs(v => [...v, { role: "assistant", content: `Discarded: ${e.description || e.category} (${e.category}) - ${fmt(e.amount)}` }]); const rest = pe.filter((_, j) => j !== i); setPe(rest.length ? rest : null); if (editIdx === i) { setEditIdx(null); setEditForm(null); } };
  const startEdit = (i) => { setEditIdx(i); setEditForm({ ...pe[i] }); };
  const cancelEdit = () => { setEditIdx(null); setEditForm(null); };
  const applyEdit = (i) => { if (!editForm) return; const u = [...pe]; u[i] = { ...editForm, amount: parseFloat(editForm.amount) || 0 }; setPe(u); setEditIdx(null); setEditForm(null); };
  const applyAndSave = (i) => { if (!editForm) return; const e = { ...editForm, amount: parseFloat(editForm.amount) || 0 }; svE([e, ...exp], { upsert: e }); setMsgs(v => [...v, { role: "assistant", content: `Saved: ${e.description || e.category} (${e.category}) - ${fmt(e.amount)} on ${e.date}` }]); tst(`Saved: ${e.description || e.category}`); const rest = (pe || []).filter((_, j) => j !== i); setPe(rest.length ? rest : null); setEditIdx(null); setEditForm(null); };

  // scroll on message change
  const prevMsgsLen = useRef(msgs.length);
  if (msgs.length !== prevMsgsLen.current) { prevMsgsLen.current = msgs.length; setTimeout(() => cr.current?.scrollIntoView({ behavior: "smooth" }), 50); }

  return (
    <div style={{ flex: 1, maxWidth: isDesktop ? 720 : 600, margin: "0 auto", padding: isDesktop ? "28px 36px 20px" : "18px 20px", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", marginBottom: 14 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
            <div style={{ maxWidth: isDesktop ? "65%" : "82%", padding: "12px 16px", borderRadius: 16, background: m.role === "user" ? T.chatUser : T.chatBot, border: m.role === "user" ? "none" : `1px solid ${T.chatBotBorder}`, color: m.role === "user" ? T.chatUserText : T.text1, fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", fontWeight: m.role === "user" ? 600 : 400 }}>{m.content}</div>
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
                      <div><div style={{ fontSize: 13, fontWeight: 600 }}>{e.description || e.category}</div><div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>{e.category} -- {e.date}</div></div>
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
    </div>
  );
}
