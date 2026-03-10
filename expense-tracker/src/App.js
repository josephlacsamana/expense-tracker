import { useState, useEffect, useRef, useCallback } from "react";
import { Check, LogOut, Sun, Moon, PieChart, LayoutDashboard, MessageSquare, Wallet, Settings, Home, RefreshCw } from "lucide-react";
import { supabase, sbReady } from "./supabase";
import { themes } from "./constants";
import { AppProvider, useApp } from "./AppContext";
import LandingPage from "./LandingPage";
import DashboardTab from "./tabs/DashboardTab";
import ExpensesTab from "./tabs/ExpensesTab";
import ChatTab from "./tabs/ChatTab";
import AccountsTab from "./tabs/AccountsTab";
import MoreTab from "./tabs/MoreTab";

// ─── MAIN APP (nav shell + tab router) ───
function MainApp({ onLogout, toggleTheme }) {
  const { user, profile, debts, rec, theme, isDesktop, T, ld, toast, refreshData } = useApp();
  const [tab, setTab] = useState("dashboard");

  // ─── PULL-TO-REFRESH (mobile only) ───
  const [ptrPull, setPtrPull] = useState(0);
  const [ptrRefreshing, setPtrRefreshing] = useState(false);
  const ptrStart = useRef(null);
  const ptrThreshold = 80;

  const onTouchStart = useCallback((e) => {
    if (isDesktop || ptrRefreshing) return;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop <= 0) ptrStart.current = e.touches[0].clientY;
    else ptrStart.current = null;
  }, [isDesktop, ptrRefreshing]);

  const onTouchMove = useCallback((e) => {
    if (ptrStart.current === null || isDesktop || ptrRefreshing) return;
    const diff = e.touches[0].clientY - ptrStart.current;
    if (diff > 0) setPtrPull(Math.min(diff * 0.5, 120));
    else setPtrPull(0);
  }, [isDesktop, ptrRefreshing]);

  const onTouchEnd = useCallback(async () => {
    if (ptrStart.current === null || isDesktop) return;
    if (ptrPull >= ptrThreshold && !ptrRefreshing) {
      setPtrRefreshing(true);
      setPtrPull(ptrThreshold);
      await refreshData();
      setPtrRefreshing(false);
    }
    setPtrPull(0);
    ptrStart.current = null;
  }, [isDesktop, ptrPull, ptrRefreshing, refreshData, ptrThreshold]);

  // Due-soon debts: due within 3 days or overdue this month
  const dueCount = (() => {
    const today = new Date().getDate();
    return debts.filter(d => d.currentBalance > 0 && d.dueDate).filter(d => {
      const diff = d.dueDate - today;
      return (diff >= 0 && diff <= 3) || (diff < 0 && diff >= -3);
    }).length;
  })();

  // Recurring expenses that are due (nextDate <= today)
  const recDueCount = (() => {
    const today = new Date().toISOString().slice(0, 10);
    return rec.filter(r => r.nextDate <= today).length;
  })();

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: PieChart },
    { id: "expenses", label: "Expenses", icon: LayoutDashboard, badge: recDueCount },
    { id: "chat", label: "AI Chat", icon: MessageSquare },
    { id: "accounts", label: "Money Hub", icon: Wallet, badge: dueCount },
    { id: "more", label: "More", icon: Settings }
  ];

  if (ld) return (
    <div style={{ minHeight: "100vh", background: T.gradBg, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, color: theme === "dark" ? "#0C0C12" : "#FFF", letterSpacing: -1, fontFamily: "system-ui,-apple-system,sans-serif", animation: "coinFlip 1.2s ease-in-out infinite" }}>rx</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: T.text3 }}>Loading your data...</div>
      <style>{`@keyframes coinFlip{0%,100%{transform:rotateY(0deg)}50%{transform:rotateY(180deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.gradBg, color: T.text1, display: "flex", flexDirection: isDesktop ? "row" : "column", fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {/* Pull-to-refresh indicator (mobile only) */}
      {!isDesktop && (ptrPull > 0 || ptrRefreshing) && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 9998, paddingTop: Math.min(ptrPull, ptrThreshold) - 40, transition: ptrRefreshing ? "none" : "padding-top 0.1s", pointerEvents: "none" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.surface, border: `2px solid ${T.gold}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.2)", opacity: Math.min(ptrPull / ptrThreshold, 1), transform: `rotate(${ptrRefreshing ? 0 : ptrPull * 3}deg)` }}>
            <RefreshCw size={18} style={{ color: T.gold }} className={ptrRefreshing ? "spin" : ""} />
          </div>
        </div>
      )}
      {toast && <div style={{ position: "fixed", top: 20, left: isDesktop ? "calc(50% + 120px)" : "50%", transform: "translateX(-50%)", background: T.toastBg, border: `1px solid ${T.toastBorder}`, color: T.gold, padding: "12px 24px", borderRadius: 14, fontSize: 13, fontWeight: 600, zIndex: 9999, boxShadow: "0 8px 32px rgba(245,181,38,0.15)", display: "flex", alignItems: "center", gap: 8 }}><Check size={16} />{toast}</div>}

      {/* Desktop Sidebar */}
      {isDesktop && (
        <div style={{ width: 250, height: "100vh", background: T.surface, borderRight: `1px solid ${T.border}`, padding: "28px 0", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, alignSelf: "flex-start", boxSizing: "border-box" }}>
          <div style={{ padding: "0 24px", marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: theme === "dark" ? "#0C0C12" : "#FFF", letterSpacing: -1, fontFamily: "system-ui,-apple-system,sans-serif", flexShrink: 0 }}>rx</div>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: T.text1, letterSpacing: -0.5 }}>r<span style={{ color: T.gold }}>x</span>penses</h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: `2px solid ${T.gold}`, flexShrink: 0 }} /> : <div style={{ width: 34, height: 34, borderRadius: "50%", background: T.goldMuted, border: `2px solid ${T.gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: T.gold, flexShrink: 0 }}>{(user || "?")[0].toUpperCase()}</div>}
              <div><div style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>{user}</div><div style={{ fontSize: 10, color: T.text3, marginTop: 1 }}>{profile?.email || ""}</div></div>
            </div>
          </div>
          {tabs.map(t => {
            const I = t.icon; const a = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 24px", margin: "2px 10px", borderRadius: 12, border: "none", cursor: "pointer", background: a ? T.goldMuted : "transparent", color: a ? T.gold : T.text2, fontSize: 13, fontWeight: a ? 700 : 500, textAlign: "left", width: "calc(100% - 20px)", transition: "all 0.2s", position: "relative" }}>
                {a && <div style={{ position: "absolute", left: 0, width: 3, height: 24, borderRadius: "0 2px 2px 0", background: T.gold }} />}
                <I size={18} />{t.label}
                {t.badge > 0 && <span style={{ marginLeft: "auto", background: T.err, color: "#FFF", fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "2px 7px", minWidth: 18, textAlign: "center" }}>{t.badge}</span>}
              </button>
            );
          })}
          <div style={{ marginTop: "auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={toggleTheme} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, border: `1px solid ${T.border}`, background: "transparent", color: T.text2, cursor: "pointer", fontSize: 12, fontWeight: 600, width: "100%" }}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, border: `1px solid ${T.border}`, background: "transparent", color: T.text2, cursor: "pointer", fontSize: 12, fontWeight: 600, width: "100%" }}>
              <LogOut size={16} />Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", ...(isDesktop ? { overflowY: "auto", maxHeight: "100vh" } : {}) }}>

        {/* Mobile Header */}
        {!isDesktop && (
          <div style={{ padding: "18px 20px 0", maxWidth: 600, margin: "0 auto", width: "100%", boxSizing: "border-box", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: theme === "dark" ? "#0C0C12" : "#FFF", letterSpacing: -1, fontFamily: "system-ui,-apple-system,sans-serif", flexShrink: 0 }}>rx</div>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: T.text1, letterSpacing: -0.5 }}>r<span style={{ color: T.gold }}>x</span>penses</h1>
                <p style={{ color: T.text3, fontSize: 11, margin: "2px 0 0" }}>Logged in as <span style={{ color: T.gold }}>{user}</span></p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={toggleTheme} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 8, color: T.text2, cursor: "pointer", display: "flex", alignItems: "center" }}>
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button onClick={onLogout} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 12px", color: T.text2, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontWeight: 600 }}><LogOut size={13} />Logout</button>
            </div>
          </div>
        )}

        {/* Mobile Tabs — icons only, gold dot indicator */}
        {!isDesktop && (
          <div style={{ maxWidth: 600, margin: "14px auto 0", padding: "0 20px", width: "100%", boxSizing: "border-box" }}>
            <div style={{ display: "flex", gap: 2, background: T.surface, borderRadius: 16, padding: "6px 4px", border: `1px solid ${T.border}` }}>
              {tabs.map(t => { const I = t.icon; const a = tab === t.id;
                return <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "12px 4px 14px", borderRadius: 12, border: "none", background: "transparent", color: a ? T.gold : T.text3, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, position: "relative" }}><span style={{ position: "relative" }}><I size={22} />{t.badge > 0 && <span style={{ position: "absolute", top: -4, right: -10, background: T.err, color: "#FFF", fontSize: 8, fontWeight: 700, borderRadius: 8, padding: "1px 4px", minWidth: 12, textAlign: "center" }}>{t.badge}</span>}</span>{a && <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.gold }} />}</button>;
              })}
            </div>
          </div>
        )}

        {/* Tab content */}
        {tab === "dashboard" && <DashboardTab />}
        {tab === "expenses" && <ExpensesTab />}
        {tab === "chat" && <ChatTab />}
        {tab === "accounts" && <AccountsTab />}
        {tab === "more" && <MoreTab />}
      </div>

      <style>{`
        input::placeholder,textarea::placeholder{color:${T.text3}}
        input:focus,textarea:focus,select:focus{border-color:${T.gold}!important;box-shadow:0 0 0 3px rgba(245,181,38,0.1)!important;outline:none}
        select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(T.text3)}' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px}
        button:active{transform:scale(0.97)}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:4px}
        .spin{animation:spin 1s linear infinite}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        option{background:${T.selectBg};color:${T.text1}}
        input[type=range]{-webkit-appearance:none;appearance:none;background:${theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"};border-radius:4px;outline:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:${T.gold};cursor:pointer;box-shadow:0 2px 6px rgba(245,181,38,0.3)}
        input[type=range]::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:${T.gold};cursor:pointer;border:none;box-shadow:0 2px 6px rgba(245,181,38,0.3)}
      `}</style>
    </div>
  );
}

// ─── ROOT APP (auth) ───
export default function App() {
  const [, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [household, setHousehold] = useState(null);
  const [householdRole, setHouseholdRole] = useState(null);
  const [localUser, setLocalUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError] = useState(null);
  const [pendingInviteData, setPendingInviteData] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const toggle = () => setTheme(v => { const next = v === "dark" ? "light" : "dark"; localStorage.setItem("theme", next); return next; });

  useEffect(() => {
    if (!sbReady) { setAuthLoading(false); return; }
    const timeout = setTimeout(() => { setAuthLoading(false); }, 5000);
    let handling = false;
    const handleSession = async (s) => {
      console.log("[auth] handleSession called, user:", s?.user?.email, "handling:", handling);
      if (handling) return;
      handling = true;
      try {
        if (!s) { console.log("[auth] no session"); setSession(null); setProfile(null); setHousehold(null); setHouseholdRole(null); setPendingInviteData(null); clearTimeout(timeout); setAuthLoading(false); handling = false; return; }

        setSession(s);

        // 1. Fetch or create profile
        let prof;
        const { data: existing, error: profileErr } = await supabase.from("profiles").select("*").eq("id", s.user.id).maybeSingle();
        if (existing && !profileErr) { prof = existing; }
        else {
          const fullName = s.user.user_metadata?.full_name || s.user.user_metadata?.name || "";
          const displayName = fullName.split(" ")[0] || s.user.email.split("@")[0];
          prof = { id: s.user.id, email: s.user.email, display_name: displayName, avatar_url: s.user.user_metadata?.avatar_url || "" };
          const { error: insertErr } = await supabase.from("profiles").insert(prof);
          if (insertErr) prof = { id: s.user.id, display_name: displayName };
        }
        setProfile(prof);

        // 2. Find existing household membership
        let joined = false;
        const { data: memberships } = await supabase.from("household_members").select("household_id, role, households(id, name)").eq("user_id", s.user.id).limit(1);
        const membership = memberships?.[0] || null;
        if (membership?.households) {
          setHousehold(membership.households);
          setHouseholdRole(membership.role);
          joined = true;
        }

        // 3. Auto-create household if not in one
        let currentHhId = membership?.households?.id || null;
        if (!joined) {
          const { data: h, error: hErr } = await supabase.from("households").insert({ name: "My Household" }).select().single();
          console.log("[auth] household create:", h, "err:", hErr);
          if (h) {
            const { error: hmErr } = await supabase.from("household_members").insert({ household_id: h.id, user_id: s.user.id, role: "owner" });
            console.log("[auth] household_members insert err:", hmErr);
            setHousehold(h);
            setHouseholdRole("owner");
            currentHhId = h.id;
          }
        }

        // 4. Check for email-based pending invite
        const userEmail = prof.email || s.user.email;
        if (userEmail) {
          const { data: inv } = await supabase.from("invites").select("*").eq("invited_email", userEmail).eq("used", false).gt("expires_at", new Date().toISOString()).maybeSingle();
          if (inv && inv.household_id !== currentHhId) {
            const { data: invitedH } = await supabase.from("households").select("*").eq("id", inv.household_id).single();
            if (invitedH) setPendingInviteData({ inv, invitedHousehold: invitedH, userId: prof.id });
          }
        }
      } catch (e) { console.error("[auth] error:", e); }
      clearTimeout(timeout);
      setAuthLoading(false);
      handling = false;
    };
    supabase.auth.getSession().then(({ data: { session: s } }) => handleSession(s)).catch(() => { clearTimeout(timeout); setAuthLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((ev, s) => {
      if (ev === "INITIAL_SESSION") return;
      handleSession(s);
    });
    return () => { subscription.unsubscribe(); clearTimeout(timeout); };
  }, []);

  const handleLogout = async () => {
    if (sbReady) {
      try { await supabase.auth.signOut(); } catch (e) { console.error("[logout] error:", e); }
      window.location.href = "/";
    } else {
      setSession(null); setProfile(null); setHousehold(null); setHouseholdRole(null); setAuthLoading(false);
    }
  };

  const acceptInvite = async () => {
    if (!pendingInviteData) return;
    const { inv, invitedHousehold, userId } = pendingInviteData;
    try {
      const { data: currentMs } = await supabase.from("household_members").select("household_id").eq("user_id", userId).limit(1);
      const currentHid = currentMs?.[0]?.household_id || null;
      await supabase.from("household_members").delete().eq("user_id", userId);
      if (currentHid) {
        const { data: remaining } = await supabase.from("household_members").select("id").eq("household_id", currentHid).limit(1);
        if (!remaining?.length) { await supabase.from("households").delete().eq("id", currentHid); }
      }
      const { error: insertErr } = await supabase.from("household_members").insert({ household_id: inv.household_id, user_id: userId, role: "member" });
      if (insertErr) { console.error("[invite accept] insert error:", insertErr); return; }
      await supabase.from("invites").update({ used: true, used_by: userId }).eq("id", inv.id);
      setHousehold(invitedHousehold);
      setHouseholdRole("member");
      setPendingInviteData(null);
    } catch (e) { console.error("[invite accept] error:", e); }
  };

  const declineInvite = () => { setPendingInviteData(null); };

  if (authLoading) {
    const T = themes[theme];
    return (<div style={{ minHeight: "100vh", background: T.gradBg, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, color: theme === "dark" ? "#0C0C12" : "#FFF", letterSpacing: -1, fontFamily: "system-ui,-apple-system,sans-serif", animation: "coinFlip 1.2s ease-in-out infinite" }}>rx</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: T.text3 }}>Loading...</div>
      <style>{`@keyframes coinFlip{0%,100%{transform:rotateY(0deg)}50%{transform:rotateY(180deg)}}`}</style>
    </div>);
  }

  if (sbReady) {
    const user = profile?.display_name || null;

    if (pendingInviteData) {
      const T = themes[theme];
      return (
        <div style={{ minHeight: "100vh", background: T.gradBg, display: "flex", justifyContent: "center", alignItems: "center", padding: 24 }}>
          <div style={{ background: T.modalSurface, border: `1px solid ${T.borderStrong}`, borderRadius: 24, padding: 36, width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(0,0,0,0.3)", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: T.goldMuted, border: `1px solid ${T.borderStrong}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Home size={26} style={{ color: T.gold }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text1, margin: "0 0 10px" }}>Household Invite</h2>
            <p style={{ color: T.text2, fontSize: 14, margin: "0 0 16px" }}>
              You have been invited to join <strong style={{ color: T.gold }}>{pendingInviteData.invitedHousehold.name}</strong>.
            </p>
            <p style={{ color: T.err, fontSize: 13, margin: "0 0 28px", background: theme === "dark" ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", lineHeight: 1.5 }}>
              Your current household will be removed from your account. You will only have access to the new household's data.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={declineInvite} style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: `1px solid ${T.inputBorder}`, background: "transparent", color: T.text2, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Decline</button>
              <button onClick={acceptInvite} style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: "none", background: T.grad, color: theme === "dark" ? "#0C0C12" : "#FFF", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(245,181,38,0.2)" }}>Accept & Join</button>
            </div>
          </div>
        </div>
      );
    }

    if (user && household) {
      return (
        <AppProvider user={user} householdId={household.id} householdRole={householdRole} profile={profile} household={household} theme={theme}>
          <MainApp onLogout={handleLogout} toggleTheme={toggle} />
        </AppProvider>
      );
    }
    return <LandingPage theme={theme} toggleTheme={toggle} authError={authError} />;
  }

  return localUser
    ? (
      <AppProvider user={localUser} householdId={null} householdRole="owner" profile={null} household={null} theme={theme}>
        <MainApp onLogout={() => setLocalUser(null)} toggleTheme={toggle} />
      </AppProvider>
    )
    : <LandingPage onLogin={setLocalUser} theme={theme} toggleTheme={toggle} localMode={true} />;
}
