import { useState, useEffect } from "react";
import { Sun, Moon, Lock, MessageSquare, CreditCard, BarChart3, Camera, ArrowRight, ChevronDown, ChevronUp, Users, Shield, Zap, LogIn } from "lucide-react";
import { supabase } from "./supabase";
import { themes, LOCAL_USERS, DEFAULT_PINS, localStore } from "./constants";
import { useMediaQuery } from "./hooks";

export default function LandingPage({ onLogin, theme, toggleTheme, authError, localMode }) {
  const T = themes[theme];
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [selectedUser, setSelectedUser] = useState(null);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [pins, setPins] = useState(DEFAULT_PINS);
  const [signingIn, setSigningIn] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

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

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    { icon: MessageSquare, title: "AI-Powered Chat", desc: "Just type what you spent. Our AI parses amounts, categories, and dates automatically." },
    { icon: Camera, title: "Receipt Scanning", desc: "Snap a photo of any receipt. AI extracts items, totals, and stores instantly." },
    { icon: Users, title: "Shared Tracking", desc: "Track expenses together with your partner. Invite via email, share one household." },
    { icon: CreditCard, title: "Debt Management", desc: "Track mortgages, loans, and credit cards. Interactive payment grid with history." },
    { icon: BarChart3, title: "Smart Analytics", desc: "Dashboards, charts, and AI spending reviews. Know exactly where your money goes." },
    { icon: Shield, title: "Budget Controls", desc: "Set general and per-category budgets. Get alerts when approaching limits." },
  ];

  const steps = [
    { num: "1", title: "Sign Up Free", desc: "One-click Google sign-in. No forms, no passwords to remember." },
    { num: "2", title: "Track Everything", desc: "Add expenses via AI chat, receipt photos, or manual entry. Invite your partner." },
    { num: "3", title: "Get Insights", desc: "AI reviews your spending, finds patterns, and gives actionable tips to save more." },
  ];

  const faqs = [
    { q: "How do I track shared expenses with my partner?", a: "Sign in with Google, then invite your partner via their Gmail address in Settings. You both share one household -- every expense, budget, and debt is visible to both of you in real time." },
    { q: "Is rxpenses really free?", a: "Yes. All core features are free: expense tracking, AI chat, receipt scanning, budgets, debt management, dashboards, and CSV export. No credit card required." },
    { q: "Can I scan receipts with AI?", a: "Absolutely. Open the AI Chat tab, attach a photo of your receipt, and the AI will extract items, amounts, dates, and categories automatically. You can review and edit before saving." },
    { q: "How does debt tracking work?", a: "Add your debts (credit cards, loans, mortgages) in the Accounts tab. Set due dates, interest rates, and minimum payments. The interactive payment grid tracks your history month by month, and AI can calculate payoff timelines." },
    { q: "What is the best free expense tracker app for couples in the Philippines?", a: "rxpenses is built specifically for Filipino couples. All amounts are in PHP, and features like shared households, AI chat in plain language, and debt tracking are designed for real-world use." },
    { q: "Does it work on my phone?", a: "Yes. rxpenses is a Progressive Web App (PWA). Open rxpenses.com in your browser, add it to your home screen, and it works like a native app -- with push notifications for due bills and debts." },
  ];

  // Shared styles
  const sectionPad = { padding: isDesktop ? "80px 60px" : "56px 24px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box" };
  const goldBtn = { padding: isDesktop ? "16px 36px" : "14px 28px", borderRadius: 14, border: "none", background: T.grad, color: theme === "dark" ? "#0C0C12" : "#FFF", fontSize: isDesktop ? 16 : 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(245,181,38,0.25)", display: "inline-flex", alignItems: "center", gap: 10, transition: "all 0.2s" };
  const ghostBtn = { padding: isDesktop ? "16px 36px" : "14px 28px", borderRadius: 14, border: `1px solid ${T.border}`, background: "transparent", color: T.text1, fontSize: isDesktop ? 16 : 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, transition: "all 0.2s" };

  return (
    <div style={{ minHeight: "100vh", background: T.gradBg, color: T.text1, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", overflowX: "hidden" }}>

      {/* ─── NAV BAR ─── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: theme === "dark" ? "rgba(14,14,20,0.85)" : "rgba(250,250,247,0.85)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: isDesktop ? "0 60px" : "0 20px", height: isDesktop ? 72 : 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="rxpenses home">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: theme === "dark" ? "#0C0C12" : "#FFF", letterSpacing: -1, fontFamily: "system-ui,-apple-system,sans-serif" }} role="img" aria-label="rxpenses logo">
              rx
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: T.text1, letterSpacing: -0.5 }}>r<span style={{ color: T.gold }}>x</span>penses</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: isDesktop ? 16 : 8 }}>
            {isDesktop && <>
              <button onClick={() => scrollTo("features")} style={{ background: "none", border: "none", color: T.text2, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "8px 12px" }}>Features</button>
              <button onClick={() => scrollTo("how-it-works")} style={{ background: "none", border: "none", color: T.text2, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "8px 12px" }}>How It Works</button>
              <button onClick={() => scrollTo("faq")} style={{ background: "none", border: "none", color: T.text2, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "8px 12px" }}>FAQ</button>
            </>}
            <button onClick={toggleTheme} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 8, cursor: "pointer", color: T.text2, display: "flex", alignItems: "center" }}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {!localMode && (
              <button onClick={doGoogleLogin} disabled={signingIn || isInAppBrowser} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: T.grad, color: theme === "dark" ? "#0C0C12" : "#FFF", fontSize: 12, fontWeight: 700, cursor: (signingIn || isInAppBrowser) ? "default" : "pointer", display: "flex", alignItems: "center", gap: 6, opacity: (signingIn || isInAppBrowser) ? 0.4 : 1 }}>
                <LogIn size={14} />
                {signingIn ? "Launching..." : "Launch App"}
              </button>
            )}
          </div>
        </div>
      </nav>

      <main>
      {/* ─── HERO ─── */}
      <section style={{ ...sectionPad, paddingTop: isDesktop ? 100 : 60, paddingBottom: isDesktop ? 100 : 60, textAlign: "center", position: "relative" }}>
        {/* Subtle gold glow */}
        <div style={{ position: "absolute", top: isDesktop ? -80 : -40, left: "50%", transform: "translateX(-50%)", width: isDesktop ? 600 : 300, height: isDesktop ? 600 : 300, background: "radial-gradient(circle, rgba(245,181,38,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.goldMuted, border: `1px solid rgba(245,181,38,0.2)`, borderRadius: 20, padding: "6px 16px", marginBottom: 24 }}>
            <Zap size={12} style={{ color: T.gold }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: T.gold }}>AI-Powered Finance Tracking</span>
          </div>

          <h1 style={{ fontSize: isDesktop ? 56 : 36, fontWeight: 800, margin: "0 0 20px", color: T.text1, letterSpacing: -1.5, lineHeight: 1.1, maxWidth: 700, marginLeft: "auto", marginRight: "auto" }}>
            Your money,{" "}
            <span style={{ background: "linear-gradient(135deg, #F5B526, #E09800)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>simplified</span>
          </h1>

          <p style={{ fontSize: isDesktop ? 18 : 15, color: T.text2, maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.7 }}>
            Track shared expenses with AI. Snap receipts, chat to log spending, manage debts, and get smart insights. Built for couples in the Philippines.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            {localMode ? (
              <button onClick={() => scrollTo("login-section")} style={goldBtn}>
                Get Started <ArrowRight size={18} />
              </button>
            ) : (
              <>
                <button onClick={doGoogleLogin} disabled={signingIn || isInAppBrowser} style={{ ...goldBtn, opacity: (signingIn || isInAppBrowser) ? 0.4 : 1 }}>
                  {signingIn ? "Launching..." : "Launch App Free"} <ArrowRight size={18} />
                </button>
                <button onClick={() => scrollTo("features")} style={ghostBtn}>
                  Learn More <ChevronDown size={16} />
                </button>
              </>
            )}
          </div>

          {isInAppBrowser && (
            <div style={{ marginTop: 24, background: theme === "dark" ? "rgba(245,181,38,0.08)" : "rgba(245,181,38,0.12)", border: "1px solid rgba(245,181,38,0.35)", borderRadius: 14, padding: "16px 18px", maxWidth: 400, margin: "24px auto 0", textAlign: "left" }}>
              <p style={{ color: T.text1, fontSize: 13, fontWeight: 700, margin: "0 0 6px" }}>Cannot sign in here</p>
              <p style={{ color: T.text2, fontSize: 12, margin: "0 0 14px", lineHeight: 1.6 }}>Google sign-in does not work inside this browser. Copy the link and open it in Chrome or Safari.</p>
              <button onClick={() => { try { navigator.clipboard.writeText(window.location.href).then(() => { setLinkCopied(true); setTimeout(() => setLinkCopied(false), 3000); }); } catch { setLinkCopied(true); setTimeout(() => setLinkCopied(false), 3000); } }} style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "none", background: T.grad, color: theme === "dark" ? "#0C0C12" : "#FFF", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                {linkCopied ? "Link Copied!" : "Copy Link"}
              </button>
            </div>
          )}

          {(err || authError) && (<div style={{ color: T.err, fontSize: 12, textAlign: "center", marginTop: 16 }}>{authError || err}</div>)}

          <p style={{ color: T.text3, fontSize: 11, marginTop: 20 }}>Free to use. No credit card required.</p>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" style={{ background: theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)" }}>
        <div style={sectionPad}>
          <div style={{ textAlign: "center", marginBottom: isDesktop ? 56 : 40 }}>
            <h2 style={{ fontSize: isDesktop ? 36 : 26, fontWeight: 800, margin: "0 0 12px", color: T.text1, letterSpacing: -0.5 }}>Everything you need</h2>
            <p style={{ fontSize: isDesktop ? 16 : 14, color: T.text2, maxWidth: 480, margin: "0 auto" }}>From daily coffee to monthly mortgages. Track it all with ease.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr 1fr" : "1fr", gap: isDesktop ? 20 : 14 }}>
            {features.map((f, i) => {
              const I = f.icon;
              return (
                <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: isDesktop ? "32px 28px" : "24px 20px", transition: "all 0.2s" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: T.goldMuted, border: `1px solid rgba(245,181,38,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                    <I size={22} style={{ color: T.gold }} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text1, margin: "0 0 8px" }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: T.text2, margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works">
        <div style={sectionPad}>
          <div style={{ textAlign: "center", marginBottom: isDesktop ? 56 : 40 }}>
            <h2 style={{ fontSize: isDesktop ? 36 : 26, fontWeight: 800, margin: "0 0 12px", color: T.text1, letterSpacing: -0.5 }}>How it works</h2>
            <p style={{ fontSize: isDesktop ? 16 : 14, color: T.text2, maxWidth: 480, margin: "0 auto" }}>Get started in under a minute. No setup required.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr 1fr" : "1fr", gap: isDesktop ? 32 : 20 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ textAlign: "center", position: "relative" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 22, fontWeight: 800, color: theme === "dark" ? "#0C0C12" : "#FFF", boxShadow: "0 8px 24px rgba(245,181,38,0.2)" }}>
                  {s.num}
                </div>
                {isDesktop && i < steps.length - 1 && (
                  <div style={{ position: "absolute", top: 28, left: "calc(50% + 36px)", width: "calc(100% - 72px)", height: 2, background: T.border }} />
                )}
                <h3 style={{ fontSize: 17, fontWeight: 700, color: T.text1, margin: "0 0 8px" }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: T.text2, margin: 0, lineHeight: 1.6, maxWidth: 280, marginLeft: "auto", marginRight: "auto" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ background: theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)" }}>
        <div style={{ ...sectionPad, textAlign: "center" }}>
          <h2 style={{ fontSize: isDesktop ? 32 : 24, fontWeight: 800, margin: "0 0 12px", color: T.text1 }}>Ready to take control?</h2>
          <p style={{ fontSize: isDesktop ? 16 : 14, color: T.text2, maxWidth: 420, margin: "0 auto 28px" }}>Join and start tracking your finances the smart way.</p>
          {localMode ? (
            <button onClick={() => scrollTo("login-section")} style={goldBtn}>
              Get Started <ArrowRight size={18} />
            </button>
          ) : (
            <button onClick={doGoogleLogin} disabled={signingIn || isInAppBrowser} style={{ ...goldBtn, opacity: (signingIn || isInAppBrowser) ? 0.4 : 1 }}>
              {signingIn ? "Launching..." : "Launch App Free"} <ArrowRight size={18} />
            </button>
          )}
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq">
        <div style={sectionPad}>
          <div style={{ textAlign: "center", marginBottom: isDesktop ? 56 : 40 }}>
            <h2 style={{ fontSize: isDesktop ? 36 : 26, fontWeight: 800, margin: "0 0 12px", color: T.text1, letterSpacing: -0.5 }}>Frequently Asked Questions</h2>
            <p style={{ fontSize: isDesktop ? 16 : 14, color: T.text2, maxWidth: 480, margin: "0 auto" }}>Everything you need to know about rxpenses.</p>
          </div>
          <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {faqs.map((f, i) => (
              <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", transition: "all 0.2s" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", padding: "18px 20px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, textAlign: "left" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.text1, flex: 1 }}>{f.q}</span>
                  {openFaq === i ? <ChevronUp size={18} style={{ color: T.gold, flexShrink: 0 }} /> : <ChevronDown size={18} style={{ color: T.text3, flexShrink: 0 }} />}
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 20px 18px", fontSize: 13, color: T.text2, lineHeight: 1.7 }}>{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LOCAL LOGIN (PIN fallback) ─── */}
      {localMode && (
        <section id="login-section" style={{ background: theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)" }}>
          <div style={{ ...sectionPad, maxWidth: 420 }}>
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: isDesktop ? "36px 32px" : "28px 24px" }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: T.text1, margin: "0 0 6px", textAlign: "center" }}>Sign In</h3>
              <p style={{ color: T.text3, fontSize: 13, margin: "0 0 24px", textAlign: "center" }}>Select your profile and enter your PIN</p>
              {!selectedUser ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {LOCAL_USERS.map(u => (
                    <button key={u} onClick={() => setSelectedUser(u)} style={{ padding: "16px 18px", borderRadius: 16, border: `1px solid ${T.border}`, background: T.surface, color: T.text1, fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s", boxShadow: T.cardShadow }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: theme === "dark" ? "#0C0C12" : "#FFF" }}>{u[0]}</div>
                      {u}
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: theme === "dark" ? "#0C0C12" : "#FFF", margin: "0 auto 12px" }}>{selectedUser[0]}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.text1 }}>Welcome, {selectedUser}</div>
                    <button onClick={() => { setSelectedUser(null); setPin(""); setErr(""); }} style={{ background: "none", border: "none", color: T.gold, fontSize: 12, cursor: "pointer", marginTop: 4 }}>Not you?</button>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 11, color: T.text3, fontWeight: 600, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Enter PIN</label>
                    <div style={{ position: "relative" }}>
                      <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.text3 }} />
                      <input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, "")); setErr(""); }} onKeyDown={e => { if (e.key === "Enter") doLocalLogin(); }} placeholder="----" autoFocus style={{ width: "100%", padding: "14px 14px 14px 42px", borderRadius: 12, border: `1px solid ${T.inputBorder}`, background: T.inputBg, color: T.text1, fontSize: 22, letterSpacing: 12, textAlign: "center", outline: "none", boxSizing: "border-box" }} />
                    </div>
                    {err && <div style={{ color: T.err, fontSize: 12, marginTop: 8, textAlign: "center" }}>{err}</div>}
                  </div>
                  <button onClick={doLocalLogin} disabled={pin.length < 4} style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", cursor: pin.length >= 4 ? "pointer" : "default", background: T.grad, color: theme === "dark" ? "#0C0C12" : "#FFF", fontSize: 14, fontWeight: 700, opacity: pin.length >= 4 ? 1 : 0.3 }}>Log In</button>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      </main>

      {/* ─── FOOTER ─── */}
      <footer style={{ borderTop: `1px solid ${T.border}`, padding: isDesktop ? "36px 60px" : "28px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: isDesktop ? "row" : "column", justifyContent: "space-between", alignItems: isDesktop ? "center" : "flex-start", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: theme === "dark" ? "#0C0C12" : "#FFF", letterSpacing: -1, fontFamily: "system-ui,-apple-system,sans-serif" }}>
              rx
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text2 }}>r<span style={{ color: T.gold }}>x</span>penses</span>
          </div>
          <p style={{ fontSize: 11, color: T.text3, margin: 0 }}>Personal finance, simplified. Built with AI.</p>
        </div>
      </footer>

      <style>{`
        html{scroll-behavior:smooth}
        input::placeholder{color:${T.text3}}
        input:focus{border-color:${T.gold}!important;box-shadow:0 0 0 3px rgba(245,181,38,0.12)!important}
        button:active{transform:scale(0.97)}
      `}</style>
    </div>
  );
}
