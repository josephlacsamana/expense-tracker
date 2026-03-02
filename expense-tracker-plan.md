# Shared Expense Tracker — Project Plan

## Overview
A sleek, modern shared expense tracker for **2 users** (Admin + Wife).
AI-powered receipt scanning & chat-based expense logging, with dashboards, analytics, and AI insights.

---

## Project Structure
- React app lives in `expense-tracker/` subfolder
- Single-file architecture: all components and styles in `expense-tracker/src/App.js`
- Vercel serverless proxy at `expense-tracker/api/chat.js` (solves CORS for Anthropic API)
- Deployed on Vercel with Root Directory set to `expense-tracker`
- Uses React 19, recharts, lucide-react, inline styles (no CSS framework)
- Responsive: `useMediaQuery` hook provides `isDesktop` (>=1024px) boolean

---

## Architecture Decision

**Stack:** Single-page React app (artifact) with Claude API for AI features + Persistent Storage
**Auth:** Simple PIN/password gate (Admin vs Wife role)
**AI:** Claude Sonnet via in-artifact API calls (receipt parsing, chat logging, weekly review)
**Storage:** `window.storage` (private, shared=false) for dev. Supabase/DB for Vercel deploy.
**Deployment target:** Vercel (free tier) — no domain purchase needed
**Currency:** PHP (Philippine Peso, ₱)

> **Bank Account Balances:** Cannot auto-pull from banks (requires Plaid/banking APIs not available).
> **Workaround:** Manual entry of savings/account balances that display on the dashboard.

---

## Data Model

```
storage keys:
  "expenses"   → [{id, amount, category, description, date, addedBy, createdAt}]
  "categories" → ["Food", "Transport", "Bills", "Shopping", "Health", "Entertainment", "Subscriptions", "Other"]
  "accounts"   → [{name, balance, type, updatedAt}]
  "settings"   → {josephPin, rowenaPin}
  "budgets"    → {Food: 5000, Transport: 3000, ...} (monthly limits per category)
  "recurring"  → [{id, amount, category, description, frequency, nextDate, addedBy}]
```

---

## Phases

### Phase 1 — Core Foundation (PRODUCT FIRST, auth later) ✅ DONE
- [x] Project plan (this file)
- [x] Expense data model + storage layer
- [x] Manual expense entry form (amount, category, description, date)
- [x] Expense list view with filters (daily/weekly/monthly/quarterly/yearly)
- [x] Basic responsive layout with modern dark UI
- [x] Delete/edit expenses
- [ ] Auth gate (PIN-based login, Admin vs Wife roles) — **LOW PRIORITY, add last**

### Phase 2 — AI-Powered Input ✅ DONE
- [x] **Chat-based entry:** Type "Spent 45 on groceries at SM" → AI parses & records
- [x] **Receipt image upload:** Upload receipt photo → AI extracts items, total, date, store
- [x] **Batch entry:** "Add lunch 120, coffee 85, gas 400"
- [x] AI confirmation step before saving (user approves parsed data)
- [x] Textarea with Shift+Enter for new lines, Enter to send
- [x] Robust error handling + JSON extraction fallback
- [x] Category validation + date fallback to today
- [x] Emoji stripping on all AI output
- [x] Currency set to PHP (Philippine Peso, ₱)
- [x] Retry logic on API calls (2 retries with backoff)
- [x] Private storage (no shared data popup)

### Phase 3 — Dashboard & Analytics ✅ DONE
- [x] **Summary cards:** Total spent for selected period with % change vs previous period
- [x] **By person breakdown:** Admin vs Wife spending with % of total
- [x] **Category pie chart:** Donut chart with legend showing spend per category
- [x] **Category bar chart:** Side-by-side bar comparison of categories
- [x] **Spending trend line:** Daily spend over time for current period
- [x] **Top 5 expenses:** Ranked list of biggest transactions
- [x] **Period selector:** Daily/Weekly/Monthly/Quarterly/Yearly on dashboard
- [x] **3-tab navigation:** Dashboard / Expenses / AI Chat
- [x] **Custom tooltips** on all charts (dark themed, PHP formatted)
- [x] **Timezone fix:** today() now uses local time instead of UTC (critical for PH timezone)

### Phase 4 — AI Reviews & Insights ✅ DONE
- [x] **Insights tab** added as 4th tab in navigation
- [x] **Period selector:** Weekly / Monthly / Quarterly / Yearly for review scope
- [x] **Generate Review button:** Sends full expense breakdown to Claude for analysis
- [x] **AI analysis includes:** Overview, category breakdown, spending patterns, 3-5 actionable tips
- [x] **Data sent to AI:** Total, prev period comparison, by category, by person, daily breakdown
- [x] **Refresh button** to regenerate insights
- [x] **Emoji stripping** on all AI insight output
- [x] **Loading state** with spinner during generation
- [x] **No markdown** in AI output (plain text, conversational tone)

### Phase 5 — Account Balances, Settings & Polish ✅ DONE
- [x] **Manual bank balance entry:** Add/edit savings & checking account balances
- [x] **Net worth view:** Total across all accounts displayed on Accounts tab
- [x] **Settings page:** Change names, manage categories, currency display
- [x] **Export data:** Download expenses as CSV
- [x] **Delete/edit expenses:** Full CRUD (already done in Phase 1)
- [x] **5-tab navigation:** Dashboard / Expenses / AI Chat / Insights / More (Accounts + Settings)

---

## UI/UX Design Direction

- **Theme:** Dark mode, glassmorphism, gradients (purple/blue/teal accent palette)
- **Layout:** Bottom nav (mobile-first) → sidebar (desktop)
- **Typography:** Clean sans-serif, bold numbers, subtle hierarchy
- **Cards:** Frosted glass with subtle borders and shadows
- **Animations:** Smooth page transitions, number count-ups, chart animations
- **AI Chat:** Floating chat bubble / dedicated chat tab with message-style UI

### GLOBAL DESIGN RULE — NO EMOJIS
- **NO emojis anywhere in the UI** — not on buttons, labels, tabs, headers, cards, tooltips, nothing
- Use **Lucide icons** or plain text only
- This applies to ALL phases, ALL screens, ALL AI-generated text
- If AI generates a summary/review, strip emojis from output before rendering

---

## Screens

1. **Login** — PIN entry with role selection
2. **Dashboard** — Summary cards + charts + quick-add button
3. **Expenses** — Full list with search, filter by date range & category & person
4. **AI Chat** — Chat interface for adding expenses & asking questions
5. **Accounts** — Bank balance overview (manual entry)
6. **AI Insights** — Weekly/monthly AI-generated reports
7. **Settings** — User management, categories, export

---

## User Profiles

- **User 1 (Admin):** Joseph
- **User 2:** Rowena
- **Auth (artifact):** Name selection + PIN (4 digits)
- **Auth (Vercel):** Supabase username + password (swap later)

---

## Phase 6 — Login, Names, Budgets & Recurring

### Phase 6a — Login & Custom Names
- [x] PIN-based login screen (Joseph / Rowena)
- [x] Names used everywhere: expense labels, chat, dashboard, person cards
- [x] PIN stored in persistent storage (swap to Supabase later)
- [x] Auto-set "addedBy" based on logged-in user
- [ ] Logout option in Settings

### Phase 6b — Budget Limits per Category
- [ ] Set monthly budget per category (e.g. Food: P5,000)
- [ ] Budget vs actual display on dashboard
- [ ] Visual progress bars (green/yellow/red based on % used)
- [ ] Warning when approaching or exceeding budget
- [ ] Budget settings page in More tab

### Phase 6c — Recurring Expenses
- [ ] Add recurring expense templates (Netflix, PLDT, Meralco, etc.)
- [ ] Frequency: monthly, weekly, yearly
- [ ] Auto-reminder or manual "apply recurring" button
- [ ] Edit/delete recurring templates
- [ ] Recurring section in More tab

### Phase 6d — Monthly Budget vs Actual Chart
- [ ] Bar chart comparing budget vs actual per category
- [ ] Dashboard integration
- [ ] Color-coded: under budget (green), near limit (yellow), over (red)

---

## Phase 7 — UI/UX Overhaul (Gold Edition)

### Design System
- **Primary:** #F5B526 (Gold/Amber) — buttons, accents, active states, gradients
- **Surface:** #FFFFFF / rgba(255,255,255,0.03) — cards, modals
- **Background:** #0E0E14 → #13131D — deep dark gradient
- **Text Primary:** #E0D5C0 (warm cream)
- **Text Secondary:** #8A8078 (muted brown)
- **Border:** #S91906-style subtle warm borders
- **Focus ring:** Gold glow rgba(245,181,38,0.3)
- **Error:** #EF4444 (red)
- **Success:** #10B981 (green, kept for positive signals)

### Typography
- Clean sans-serif system font stack
- Headline: 28px/700, gradient gold text
- Section title: 16-18px/700
- Body: 13-14px/400-500
- Caption: 10-11px/500 uppercase for labels

### Component Upgrades
- [x] **Login screen:** Gold gradient branding, warm tones, refined avatar circles
- [x] **Navigation tabs:** Gold underline active indicator, warm hover states
- [x] **Cards:** Subtle warm glass effect with gold-tinted borders
- [x] **Buttons:** Primary = gold gradient, Secondary = warm outline
- [x] **Charts:** Gold/amber color scheme, warm tooltip styling
- [x] **Category colors:** Remapped to gold-complementary palette (amber, copper, bronze, teal, sage)
- [x] **Modals:** Dark warm background, gold accent buttons
- [x] **Inputs:** Warm border focus states with gold glow
- [x] **Period pills:** Gold active state, warm inactive
- [x] **Toast notifications:** Gold accent bar
- [x] **Spending cards:** Gold gradient hero card
- [x] **Budget progress bars:** Gold/amber fill
- [x] **AI Chat bubbles:** Gold for user, warm glass for assistant
- [x] **Confirmation dialogs:** Gold action buttons

### Theme Toggle (Light/Dark Mode)
- [x] Sun/Moon toggle button in header and login screen
- [x] Full dual-theme token system (dark + light)
- [x] Light mode: warm cream background (#FAFAF7), white cards, subtle shadows
- [x] Dark mode: deep dark (#0C0C12), glass cards, gold glow effects
- [x] Theme-aware: charts, tooltips, modals, inputs, pills, chat bubbles, scrollbars
- [x] Default: Light mode (user preference)
- [x] Smooth transition across all components

### Elevation System
- Level 0: Flat cards with warm border
- Level 1: 0 2px 8px rgba(245,181,38,0.05)
- Level 2: 0 4px 16px rgba(245,181,38,0.08)
- Level 3: 0 8px 32px rgba(245,181,38,0.12)

### Spacing & Radius
- Card radius: 16-20px
- Button radius: 12-14px
- Input radius: 11-12px
- Pill radius: 9px
- Consistent 8px grid spacing

---

## Cost

### Free Tier — $0/month
- **Hosting:** Runs inside Claude.ai artifact (free with your Claude subscription)
- **Storage:** window.storage API (included, no extra cost)
- **AI features:** Uses Claude API calls from within the artifact (included)
- **Total: $0 beyond your existing Claude subscription**

### If you want to self-host later (optional)
| Item | Cost |
|---|---|
| Vercel/Netlify (static hosting) | Free tier |
| Claude API (Sonnet for AI features) | ~$3-10/month depending on usage |
| Supabase (database, auth) | Free tier covers this easily |
| **Total** | **~$3-10/month** |

---

## Global Rules (Apply to ALL Phases)

1. **NO EMOJIS** — nowhere in the UI, buttons, labels, AI output, headers, nothing
2. **Lucide icons or plain text only** for all iconography
3. **Product-first** — working features before auth/polish
4. **Mobile-first** responsive design
5. **All AI-generated text** must be stripped of emojis before rendering
6. **Currency is PHP (₱)** — all amounts displayed in Philippine Peso
7. **Shared storage** — on Vercel deploy, use Supabase so both users see everything
8. **Confirmation before destructive actions** (delete expense, clear data)

---

## Phase 8 — AI Chat & Insights Improvements

### Phase 8a — Image Upload Should Not Auto-Send
- [ ] When uploading an image/file in AI Chat, it should NOT send immediately
- [ ] User must be able to type additional info or context after attaching
- [ ] Sending happens only when the user clicks Send or presses Enter
- [ ] The attached file should show as a preview/thumbnail in the input area

### Phase 8b — AI Insights Better Styling & Charts
- [ ] Improve spacing and typography in the AI Insights section for easier reading
- [ ] Add visual charts (using recharts) where relevant in the insights response
- [ ] Better formatting: clear section headers, bullet points, spacing between sections
- [ ] Make the insights feel polished and well-structured, not a wall of text

### Phase 8c — AI Chat Multi-Entry Save UX
- [ ] When the AI suggests multiple expense entries in a single chat response:
  - [ ] Show "Save All" and "Discard All" buttons at the top/bottom
  - [ ] Each individual entry must have its own "Save" button
  - [ ] Each individual entry must have its own "Edit" button (inline editing)
  - [ ] User can selectively save, edit, or discard individual entries
  - [ ] Clear visual separation between each suggested entry

---

## Limitations

- **No real bank integration** — balances are manual entry only
- **Storage is per-artifact** — if artifact is recreated, data persists via `window.storage`
- **Shared storage** — both users see the same data (shared: true)
- **Image processing** — receipt images sent to Claude API as base64
- **Session-based auth** — PIN checked on load, stored in React state (not persistent login)
- **No notifications** — no push/email alerts (browser-only app)
