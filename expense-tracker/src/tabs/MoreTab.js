import { useState } from "react";
import { Download, AlertTriangle, UserPlus, Home, X, Check, Bell } from "lucide-react";
import { supabase, sbReady } from "../supabase";
import { sb } from "../db";
import { useApp } from "../AppContext";
import { DEF_CATS, DEFAULT_BUDGETS, uid } from "../constants";

export default function MoreTab() {
  const { exp, setExp, setAccts, setBudgets, setGenBudget, setCats, setRec, setDebts, setDPays, setSavGoals, setIncome, setRecIncome, tst, user, memberProfiles, householdId, householdRole, profile, household, isDesktop, T, cardS, inpS, btnP, btnG, mOvS, mInS, notifEnabled, toggleNotif } = useApp();

  const [clr, setClr] = useState(false);
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteEmailSent, setInviteEmailSent] = useState(false);
  const [editHhName, setEditHhName] = useState(false);
  const [hhName, setHhName] = useState(household?.name || "My Household");
  const [invLinkCopied, setInvLinkCopied] = useState(false);

  const exportCSV = () => {
    const h = "Date,Description,Category,Amount,Added By\n";
    const r = [...exp].sort((a, b) => a.date.localeCompare(b.date)).map(e => `${e.date},"${(e.description || "").replace(/"/g, '""')}",${e.category},${e.amount},${e.addedBy}`).join("\n");
    const b = new Blob([h + r], { type: "text/csv" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "expenses.csv"; a.click(); URL.revokeObjectURL(u);
  };

  const clearAll = async () => {
    setExp([]); setAccts([]); setRec([]); setDebts([]); setDPays([]); setSavGoals([]); setIncome([]); setRecIncome([]); setGenBudget(0); setCats(DEF_CATS); setBudgets(DEFAULT_BUDGETS);
    try {
      if (sbReady) {
        await Promise.all([sb.deleteAllExpenses(householdId), sb.deleteAllAccounts(householdId), sb.deleteAllRecurring(householdId), sb.deleteAllDebts(householdId), sb.deleteAllSavingsGoals(householdId), sb.deleteAllIncome(householdId), sb.deleteAllRecurringIncome(householdId), sb.saveCategories(DEF_CATS, householdId), sb.saveSetting("budgets", DEFAULT_BUDGETS, householdId), sb.saveSetting("genBudget", 0, householdId)]);
      } else {
        const ls = window.localStorage;
        ls.setItem("expenses", JSON.stringify([])); ls.setItem("accounts", JSON.stringify([])); ls.setItem("recurring", JSON.stringify([])); ls.setItem("debts", JSON.stringify([])); ls.setItem("debtPayments", JSON.stringify([])); ls.setItem("savGoals", JSON.stringify([])); ls.setItem("income", JSON.stringify([])); ls.setItem("recIncome", JSON.stringify([])); ls.setItem("genBudget", JSON.stringify(0)); ls.setItem("categories", JSON.stringify(DEF_CATS)); ls.setItem("budgets", JSON.stringify(DEFAULT_BUDGETS));
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
        <div style={{ ...cardS, padding: "16px 18px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: memberProfiles.length > 0 ? 12 : 0 }}>
            <Home size={18} style={{ color: T.gold, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              {editHhName ? (
                <input value={hhName} onChange={e => setHhName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") saveHhName(); if (e.key === "Escape") setEditHhName(false); }} style={{ ...inpS, padding: "4px 8px", fontSize: 12 }} autoFocus />
              ) : (
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>{hhName}</div>
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: householdRole === "owner" ? "rgba(245,181,38,0.15)" : "rgba(138,128,120,0.15)", color: householdRole === "owner" ? T.gold : T.text3, textTransform: "capitalize", flexShrink: 0 }}>{householdRole}</span>
            {householdRole === "owner" && !editHhName && <button onClick={() => setEditHhName(true)} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, border: `1px solid ${T.border}`, background: "transparent", color: T.text3, cursor: "pointer", flexShrink: 0 }}>Rename</button>}
            {householdRole === "owner" && editHhName && <>
              <button onClick={saveHhName} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, border: "none", background: T.gold, color: "#0C0C12", fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Save</button>
              <button onClick={() => { setEditHhName(false); setHhName(household?.name || "My Household"); }} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, border: `1px solid ${T.border}`, background: "transparent", color: T.text3, cursor: "pointer", flexShrink: 0 }}>Cancel</button>
            </>}
          </div>
          {memberProfiles.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: isDesktop ? 16 : 10 }}>
              {memberProfiles.map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {m.avatar_url ? <img src={m.avatar_url} alt="" style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} /> : <div style={{ width: 22, height: 22, borderRadius: "50%", background: T.goldMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: T.gold, flexShrink: 0 }}>{(m.display_name || "?")[0].toUpperCase()}</div>}
                  <span style={{ fontSize: 11, color: T.text2 }}>{m.display_name}</span>
                  <span style={{ fontSize: 9, fontWeight: 600, color: m.role === "owner" ? T.gold : T.text3 }}>{m.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 8, marginBottom: 12 }}>
        {sbReady && householdId && householdRole === "owner" && <button onClick={() => { setInviteEmail(""); setInviteEmailSent(false); setInviteModal(true); }} style={{ ...cardS, width: "100%", padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
          <UserPlus size={18} style={{ color: T.gold }} />
          <div><div style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>Invite Partner</div><div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>Invite by Gmail address</div></div>
        </button>}
        <div style={{ ...cardS, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <Bell size={18} style={{ color: T.gold, flexShrink: 0 }} />
          <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>Notifications</div><div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>{notifEnabled ? "Push notifications are on" : "Get reminders for due bills"}</div></div>
          <div onClick={toggleNotif} style={{ width: 44, height: 24, borderRadius: 12, background: notifEnabled ? T.gold : (T.border || "#3a3a4a"), cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
            <div style={{ width: 20, height: 20, borderRadius: 10, background: "#FFF", position: "absolute", top: 2, left: notifEnabled ? 22 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </div>
        </div>
        <button onClick={exportCSV} style={{ ...cardS, width: "100%", padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}><Download size={18} style={{ color: T.gold }} /><div><div style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>Export CSV</div><div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>Download all expenses</div></div></button>
        {householdRole === "owner" && <button onClick={() => setClr(true)} style={{ ...cardS, width: "100%", padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left", borderColor: `${T.err}30` }}><AlertTriangle size={18} style={{ color: T.err }} /><div><div style={{ fontSize: 13, fontWeight: 600, color: T.err }}>Clear All Data</div><div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>Remove everything permanently</div></div></button>}
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
