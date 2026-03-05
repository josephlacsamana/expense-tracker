import { useState, useEffect } from "react";
import { Check, LogOut, Sun, Moon, PieChart, LayoutDashboard, MessageSquare, Wallet, Settings, Home, Coins, Lock } from "lucide-react";
import { supabase, sbReady } from "./supabase";
import { themes, LOCAL_USERS, DEFAULT_PINS, localStore } from "./constants";
import { useMediaQuery } from "./hooks";
import { AppProvider, useApp } from "./AppContext";
import DashboardTab from "./tabs/DashboardTab";
import ExpensesTab from "./tabs/ExpensesTab";
import ChatTab from "./tabs/ChatTab";
import AccountsTab from "./tabs/AccountsTab";
import MoreTab from "./tabs/MoreTab";

// ─── LOGIN ───
const GoogleIcon = () => (<svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>);

function LoginScreen({ onLogin, theme, toggleTheme, authError, localMode }) {
  const T = themes[theme];
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [selectedUser, setSelectedUser] = useState(null);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [pins, setPins] = useState(DEFAULT_PINS);
  const [signingIn, setSigningIn] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (localMode) { (async () => { try { const r = await localStore.get("pins"); if (r?.value) setPins(JSON.parse(r.value)); } catch {} })(); }
  }, [localMode]);

  const doLocalLogin = () => { if (pins[selectedUser] === pin) onLogin(selectedUser); else { setErr("Wrong PIN. Try again."); setPin(""); } };

  const doGoogleLogin = async () => {
    setSigningIn(true); setErr("");
    try {
      const redirectTo = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo, queryParams: { prompt: "select_account" } } });
      if (error) { setErr(error.message); setSigningIn(false); }
    } catch { setErr("Failed to start sign in."); setSigningIn(false); }
  };

  const ua = navigator.userAgent || "";
  const isInAppBrowser = /FBAN|FBAV|FB_IAB|Instagram|Messenger/i.test(ua);
  const brandText = "Shared Finance";

  return (
    <div style={{ minHeight: "100vh", background: T.gradBg, display: "flex", flexDirection: isDesktop ? "row" : "column", justifyContent: "center", alignItems: isDesktop ? "stretch" : "center", padding: isDesktop ? 0 : 24, position: "relative" }}>
      {!isDesktop && (
        <button onClick={toggleTheme} style={{ position: "absolute", top: 20, right: 20, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 10, cursor: "pointer", color: T.text2, display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600 }}>
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      )}
      {isDesktop && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 60 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 40px rgba(245,181,38,0.25)", marginBottom: 24 }}>
            <Coins size={36} style={{ color: theme === "dark" ? "#0C0C12" : "#FFF" }} />
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 800, margin: 0, color: T.text1, letterSpacing: -1 }}>Expense<span style={{ color: T.gold }}>Tracker</span></h1>
          <p style={{ color: T.text3, fontSize: 15, margin: "10px 0 0", letterSpacing: 2, textTransform: "uppercase" }}>{brandText}</p>
          <p style={{ color: T.text3, fontSize: 13, marginTop: 8 }}>Personal finance, simplified.</p>
          <button onClick={toggleTheme} style={{ marginTop: 32, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 18px", cursor: "pointer", color: T.text2, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      )}
      <div style={{ width: isDesktop ? 480 : "100%", maxWidth: isDesktop ? 480 : 380, ...(isDesktop ? { background: T.surface, borderLeft: `1px solid ${T.border}`, display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 56px", flexShrink: 0 } : {}) }}>
        {!isDesktop && (
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: T.grad, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(245,181,38,0.25)" }}>
              <Coins size={28} style={{ color: theme === "dark" ? "#0C0C12" : "#FFF" }} />
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, margin: 0, color: T.text1, letterSpacing: -0.5 }}>Expense Tracker</h1>
            <p style={{ color: T.text3, fontSize: 13, margin: "6px 0 0", letterSpacing: 2, textTransform: "uppercase" }}>{brandText}</p>
          </div>
        )}
        {isDesktop && (
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: T.text1 }}>Welcome back</h2>
            <p style={{ color: T.text3, fontSize: 13, margin: "6px 0 0" }}>{localMode ? "Select your profile and enter your PIN" : "Sign in to continue"}</p>
          </div>
        )}
        {localMode ? (
          !selectedUser ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ color: T.text2, fontSize: 13, textAlign: isDesktop ? "left" : "center", marginBottom: 4 }}>Who's logging in?</p>
              {LOCAL_USERS.map(u => (
                <button key={u} onClick={() => setSelectedUser(u)} style={{ padding: "18px 20px", borderRadius: 18, border: `1px solid ${T.border}`, background: T.surface, color: T.text1, fontSize: 16, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "all 0.2s", boxShadow: T.cardShadow }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: theme === "dark" ? "#0C0C12" : "#FFF", boxShadow: "0 4px 12px rgba(245,181,38,0.2)" }}>{u[0]}</div>
                  {u}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div style={{ textAlign: isDesktop ? "left" : "center", marginBottom: 28 }}>
                <div style={{ width: 72, height: 72, borderRadius: 22, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: theme === "dark" ? "#0C0C12" : "#FFF", margin: isDesktop ? "0 0 14px" : "0 auto 14px", boxShadow: "0 8px 32px rgba(245,181,38,0.25)" }}>{selectedUser[0]}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: T.text1 }}>Welcome, {selectedUser}</div>
                <button onClick={() => { setSelectedUser(null); setPin(""); setErr(""); }} style={{ background: "none", border: "none", color: T.gold, fontSize: 12, cursor: "pointer", marginTop: 4 }}>Not you?</button>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 11, color: T.text3, fontWeight: 600, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Enter PIN</label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.text3 }} />
                  <input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, "")); setErr(""); }} onKeyDown={e => { if (e.key === "Enter") doLocalLogin(); }} placeholder="----" autoFocus style={{ width: "100%", padding: "14px 14px 14px 42px", borderRadius: 12, border: `1px solid ${T.inputBorder}`, background: T.inputBg, color: T.text1, fontSize: 22, letterSpacing: 12, textAlign: "center", outline: "none", boxSizing: "border-box" }} />
                </div>
                {err && <div style={{ color: T.err, fontSize: 12, marginTop: 8, textAlign: isDesktop ? "left" : "center" }}>{err}</div>}
              </div>
              <button onClick={doLocalLogin} disabled={pin.length < 4} style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", cursor: pin.length >= 4 ? "pointer" : "default", background: T.grad, color: theme === "dark" ? "#0C0C12" : "#FFF", fontSize: 14, fontWeight: 700, opacity: pin.length >= 4 ? 1 : 0.3, boxShadow: "0 4px 16px rgba(245,181,38,0.2)" }}>Log In</button>
              <p style={{ color: T.text3, fontSize: 10, textAlign: isDesktop ? "left" : "center", marginTop: 14 }}>Default: Joseph=1234, Rowena=5678</p>
            </>
          )
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {!isDesktop && (
              <div style={{ marginBottom: 8 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: T.text1, textAlign: "center" }}>Welcome back</h2>
                <p style={{ color: T.text3, fontSize: 13, margin: "6px 0 0", textAlign: "center" }}>Sign in to continue</p>
              </div>
            )}
            {isInAppBrowser && (
              <div style={{ background: theme === "dark" ? "rgba(245,181,38,0.08)" : "rgba(245,181,38,0.12)", border: "1px solid rgba(245,181,38,0.35)", borderRadius: 14, padding: "16px 18px" }}>
                <p style={{ color: T.text1, fontSize: 13, fontWeight: 700, margin: "0 0 6px" }}>Cannot sign in here</p>
                <p style={{ color: T.text2, fontSize: 12, margin: "0 0 14px", lineHeight: 1.6 }}>Google sign-in does not work inside Messenger. Copy the link below and open it in Chrome or Safari.</p>
                <button onClick={() => { try { navigator.clipboard.writeText(window.location.href).then(() => { setLinkCopied(true); setTimeout(() => setLinkCopied(false), 3000); }); } catch { setLinkCopied(true); setTimeout(() => setLinkCopied(false), 3000); } }} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "none", background: T.grad, color: theme === "dark" ? "#0C0C12" : "#FFF", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 12 }}>
                  {linkCopied ? "Link Copied!" : "Copy Link"}
                </button>
                <p style={{ color: T.text3, fontSize: 11, margin: 0, textAlign: "center", lineHeight: 1.6 }}>Then open Chrome or Safari, paste the link, and sign in from there.</p>
              </div>
            )}
            <button onClick={doGoogleLogin} disabled={signingIn || isInAppBrowser} style={{ width: "100%", padding: "16px 20px", borderRadius: 14, border: `1px solid ${T.border}`, background: T.surface, color: T.text1, fontSize: 15, fontWeight: 600, cursor: (signingIn || isInAppBrowser) ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, opacity: (signingIn || isInAppBrowser) ? 0.3 : 1, transition: "all 0.2s", boxShadow: T.cardShadow }}>
              <GoogleIcon />
              {signingIn ? "Signing in..." : "Sign in with Google"}
            </button>
            {(err || authError) && (<div style={{ color: T.err, fontSize: 12, textAlign: "center" }}>{authError || err}</div>)}
            <p style={{ color: T.text3, fontSize: 11, textAlign: "center", margin: 0 }}>Your Google account is used for login only.</p>
          </div>
        )}
      </div>
      <style>{`input::placeholder{color:${T.text3}} input:focus{border-color:${T.gold}!important;box-shadow:0 0 0 3px rgba(245,181,38,0.12)!important} button:active{transform:scale(0.97)}`}</style>
    </div>
  );
}

// ─── MAIN APP (nav shell + tab router) ───
function MainApp({ onLogout, toggleTheme }) {
  const { user, profile, theme, isDesktop, T, ld, toast } = useApp();
  const [tab, setTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: PieChart },
    { id: "expenses", label: "Expenses", icon: LayoutDashboard },
    { id: "chat", label: "AI Chat", icon: MessageSquare },
    { id: "accounts", label: "Accounts", icon: Wallet },
    { id: "more", label: "More", icon: Settings }
  ];

  if (ld) return <div style={{ minHeight: "100vh", background: T.gradBg, display: "flex", justifyContent: "center", alignItems: "center", color: T.gold }}>Loading...</div>;

  return (
    <div style={{ minHeight: "100vh", background: T.gradBg, color: T.text1, display: "flex", flexDirection: isDesktop ? "row" : "column", fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      {toast && <div style={{ position: "fixed", top: 20, left: isDesktop ? "calc(50% + 120px)" : "50%", transform: "translateX(-50%)", background: T.toastBg, border: `1px solid ${T.toastBorder}`, color: T.gold, padding: "12px 24px", borderRadius: 14, fontSize: 13, fontWeight: 600, zIndex: 9999, boxShadow: "0 8px 32px rgba(245,181,38,0.15)", display: "flex", alignItems: "center", gap: 8 }}><Check size={16} />{toast}</div>}

      {/* Desktop Sidebar */}
      {isDesktop && (
        <div style={{ width: 250, height: "100vh", background: T.surface, borderRight: `1px solid ${T.border}`, padding: "28px 0", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, alignSelf: "flex-start", boxSizing: "border-box" }}>
          <div style={{ padding: "0 24px", marginBottom: 36 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 14px", color: T.text1, letterSpacing: -0.5 }}>Expense<span style={{ color: T.gold }}>Tracker</span></h1>
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
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: T.text1, letterSpacing: -0.5 }}>Expense<span style={{ color: T.gold }}>Tracker</span></h1>
              <p style={{ color: T.text3, fontSize: 11, margin: "2px 0 0" }}>Logged in as <span style={{ color: T.gold }}>{user}</span></p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={toggleTheme} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 8, color: T.text2, cursor: "pointer", display: "flex", alignItems: "center" }}>
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button onClick={onLogout} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 12px", color: T.text2, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontWeight: 600 }}><LogOut size={13} />Logout</button>
            </div>
          </div>
        )}

        {/* Mobile Tabs */}
        {!isDesktop && (
          <div style={{ maxWidth: 600, margin: "14px auto 0", padding: "0 20px", width: "100%", boxSizing: "border-box" }}>
            <div style={{ display: "flex", gap: 2, background: T.surface, borderRadius: 16, padding: 4, border: `1px solid ${T.border}` }}>
              {tabs.map(t => { const I = t.icon; const a = tab === t.id;
                return <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px 4px", borderRadius: 12, border: "none", background: a ? T.goldMuted : "transparent", color: a ? T.gold : T.text3, fontSize: 10, fontWeight: 700, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, position: "relative" }}><I size={16} />{t.label}{a && <div style={{ position: "absolute", bottom: 2, width: 16, height: 2, borderRadius: 1, background: T.gold }} />}</button>;
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
    return (<div style={{ minHeight: "100vh", background: T.gradBg, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ color: T.gold, fontSize: 16, fontWeight: 600 }}>Loading...</div>
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
    return <LoginScreen theme={theme} toggleTheme={toggle} authError={authError} />;
  }

  return localUser
    ? (
      <AppProvider user={localUser} householdId={null} householdRole="owner" profile={null} household={null} theme={theme}>
        <MainApp onLogout={() => setLocalUser(null)} toggleTheme={toggle} />
      </AppProvider>
    )
    : <LoginScreen onLogin={setLocalUser} theme={theme} toggleTheme={toggle} localMode={true} />;
}
