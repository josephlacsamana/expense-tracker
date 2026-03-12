# rxpenses — Smart Money Tracker

A sleek, modern shared expense tracker for **2 users** (Joseph + Rowena).
AI-powered receipt scanning, chat-based expense logging, dashboards, analytics, and AI insights.

---

## Project Structure

| Item | Details |
|---|---|
| **App code** | `expense-tracker/src/App.js` (~300 lines — auth, nav shell only), `src/LandingPage.js` (marketing homepage + login) |
| **Tab files** | `src/tabs/DashboardTab.js`, `src/tabs/ExpensesTab.js`, `src/tabs/ChatTab.js`, `src/tabs/AccountsTab.js`, `src/tabs/MoreTab.js` |
| **Components** | `src/components/ChartTooltip.js` (shared recharts tooltip) |
| **Shared modules** | `src/constants.js` (themes, consts, utils), `src/hooks.js` (useMediaQuery), `src/db.js` (Supabase helpers), `src/AppContext.js` (global state + style helpers + provider) |
| **API proxies** | `expense-tracker/api/chat.js` (Anthropic API proxy), `expense-tracker/api/crypto.js` (CoinGecko price proxy), `expense-tracker/api/og.js` (OG image) |
| **Hosting** | Vercel (free tier), Root Directory = `expense-tracker`, Custom domain: `rxpenses.com` |
| **Stack** | React 19, recharts, lucide-react, inline styles (no CSS framework) |
| **Responsive** | `useMediaQuery` hook — `isDesktop` (>=1024px), sidebar on desktop, bottom nav on mobile |
| **Supabase client** | `expense-tracker/src/supabase.js` (client init, exports `supabase` + `sbReady`) |
| **Auth** | Google OAuth via Supabase Auth (PIN fallback for localStorage mode) |
| **Storage** | Supabase (production), localStorage fallback (when env vars missing) |
| **Currency** | PHP (Philippine Peso, ₱) |

---

## Data Model (Supabase Tables)

| Table | Columns | Notes |
|---|---|---|
| `expenses` | id (TEXT PK), amount, category, description, date, added_by, account_id, household_id (FK), created_at | Main data, scoped to household |
| `accounts` | id (TEXT PK), name, balance, type, household_id (FK), updated_at | Manual bank balances, scoped to household |
| `recurring` | id (TEXT PK), amount, category, description, frequency, next_date, added_by, household_id (FK), created_at | Templates, scoped to household |
| `categories` | name + household_id (composite PK), sort_order (INT) | Dynamic, no limit, scoped to household |
| `settings` | key + household_id (composite PK), value (JSONB) | Stores: `budgets`, `genBudget`, `pins`, scoped to household |
| `profiles` | id (UUID PK), email, display_name, avatar_url, created_at | Google Auth profiles |
| `households` | id (UUID PK), name, created_at | Household groups |
| `household_members` | id (UUID PK), household_id, user_id, role, joined_at | Membership + roles |
| `invites` | id (UUID PK), household_id, created_by, token, used, used_by, created_at, expires_at, invited_email | Email-based invite — matches on sign-in |
| `debts` | id (TEXT PK), name, type, total_amount, current_balance, due_date, interest_rate, min_payment, start_date, added_by, household_id (FK), created_at, updated_at | Debt tracking, scoped to household |
| `debt_payments` | id (TEXT PK), debt_id (FK), amount, date, new_balance, late_fee, household_id (FK), created_at | Payment history, scoped to household |
| `account_history` | id (TEXT PK), account_id, old_balance, new_balance, change_amount, reason, description, household_id (FK), created_at | Balance change log per account |
| `insights` | id (TEXT PK), period, data (JSONB), ai_response (JSONB), household_id (FK), created_at | Saved AI spending reviews (Phase 14) |
| `savings_goals` | id (TEXT PK), name, target_amount, current_amount, target_date, currency (TEXT default 'PHP'), added_by, household_id (FK), created_at, updated_at | Savings goals with progress tracking + crypto currency support (Phase 20/23) |
| `income` | id (TEXT PK), amount, source, description, date, added_by, account_id, household_id (FK), created_at | Income entries, scoped to household (Phase 26) |
| `recurring_income` | id (TEXT PK), amount, source, description, frequency, next_date, added_by, household_id (FK), created_at | Recurring income templates (Phase 26) |

Default categories: `["Food", "Transport", "Bills", "Shopping", "Health", "Entertainment", "Subscriptions", "Other"]`

**Storage flow:** `sbReady` (env vars exist) → Supabase; otherwise → localStorage fallback.
On first Supabase load with empty tables, existing localStorage data is auto-migrated up.

**Environment variables (Vercel + .env.local):**
- `REACT_APP_SUPABASE_URL` — Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` — Supabase anon/public key

---

## Screens

1. **Landing Page** — Marketing homepage with hero, features, how it works, CTA + Google OAuth (PIN fallback for local dev)
2. **Dashboard** — Summary cards, income/expense/net flow cards, charts, period selector
3. **Expenses** — sub-tabs: List (full list with search/filters) | Recurring (templates)
4. **AI Chat** — Chat interface for adding expenses and asking questions
5. **Money Hub** — Hub cards: Bank Accounts | Budgets | Debts | Savings | Income (drill-in with back button)
6. **More** — Settings (categories, invite, export)

---

## Global Rules

1. **NO EMOJIS** — nowhere in the UI, buttons, labels, AI output, nothing. Use Lucide icons or plain text only.
2. **Currency is PHP (₱)** — all amounts in Philippine Peso
3. **Mobile-first** responsive design — all changes use `isDesktop ? desktop : mobile`
4. **Strip emojis** from all AI-generated text before rendering
5. **Confirmation before destructive actions** (delete, clear data)
6. **Product-first** — working features before auth/polish

---

## Design System (Gold Edition)

| Token | Value |
|---|---|
| **Primary** | #F5B526 (Gold/Amber) |
| **Background (dark)** | #0E0E14 → #13131D |
| **Background (light)** | #FAFAF7 (warm cream) |
| **Text Primary** | #E0D5C0 (dark) / #1A1A2E (light) |
| **Text Secondary** | #8A8078 |
| **Error** | #EF4444 |
| **Success** | #10B981 |

- **Typography:** System sans-serif — Headline 28px/700, Section 16-18px/700, Body 13-14px
- **Radius:** Cards 16-20px, Buttons 12-14px, Inputs 11-12px, Pills 9px
- **Theme toggle:** Sun/Moon button, full dual-theme system (dark + light), default Light

---

## Phases

### Phase 1 — Core Foundation ✅ DONE
- [x] Expense data model + localStorage
- [x] Manual expense entry form (amount, category, description, date)
- [x] Expense list with filters (daily/weekly/monthly/quarterly/yearly)
- [x] Delete/edit expenses (full CRUD)
- [x] Basic responsive layout with dark UI

### Phase 2 — AI-Powered Input ✅ DONE
- [x] Chat-based entry ("Spent 45 on groceries at SM" → AI parses & records)
- [x] Receipt image upload (photo → AI extracts items, total, date, store)
- [x] Batch entry ("Add lunch 120, coffee 85, gas 400")
- [x] AI confirmation step before saving
- [x] Textarea with Shift+Enter for new lines, Enter to send
- [x] Robust error handling, JSON extraction fallback, retry logic (2 retries)
- [x] Category validation + date fallback to today
- [x] Emoji stripping on all AI output

### Phase 3 — Dashboard & Analytics ✅ DONE
- [x] Summary cards with % change vs previous period
- [x] By-person breakdown (Joseph vs Rowena)
- [x] Category pie chart, bar chart, spending trend line
- [x] Top 5 expenses list
- [x] Period selector (Daily/Weekly/Monthly/Quarterly/Yearly)
- [x] Custom tooltips (dark themed, PHP formatted)
- [x] Timezone fix (local time instead of UTC)

### Phase 4 — AI Reviews & Insights ✅ DONE
- [x] Insights tab with period selector (Weekly/Monthly/Quarterly/Yearly)
- [x] Generate Review button → sends expense data to Claude for analysis
- [x] AI returns: overview, category breakdown, spending patterns, 3-5 tips
- [x] Refresh button, loading spinner, emoji stripping

### Phase 5 — Account Balances, Settings & Polish ✅ DONE
- [x] Manual bank balance entry + net worth view
- [x] Settings page (names, categories, currency)
- [x] Export expenses as CSV
- [x] 5-tab navigation: Dashboard / Expenses / AI Chat / Insights / More

### Phase 6 — Login, Names, Budgets & Recurring ✅ DONE

**6a — Login & Custom Names ✅ DONE**
- [x] PIN-based login screen (Joseph / Rowena)
- [x] Names used everywhere (expenses, chat, dashboard, person cards)
- [x] Auto-set "addedBy" based on logged-in user
- [x] Logout option in Settings (in sidebar on desktop)

**6b — Budget Limits ✅ DONE**
- [x] Set a general monthly budget (e.g. P30,000/month total spending limit)
- [x] Budget vs actual on dashboard with progress bar (green/yellow/red)
- [x] Warning when approaching or exceeding the monthly budget
- [x] Per-category budget limits (optional, already existed)
- [x] Budget settings page in More > Budgets tab (general + per-category)

**6b-patch — Budget UX Enhancements ✅ DONE**
- [x] General budget: "Set" saves, separate "Clear" button with confirmation modal to remove budget
- [x] Per-category budgets default to 0 (not pre-filled amounts)
- [x] Per-category budget UI: range slider (step 500) + direct input editing, gold-themed thumb
- [x] General budget input shows peso sign + comma-formatted number (no dots)
- [x] Allocated vs remaining tracker: shows category total vs general budget with warning if over-allocated
- [x] View mode shows "No limit set" for 0-budget categories, hides progress bar

**6c — Recurring Expenses ✅ DONE**
- [x] Add recurring templates (Netflix, PLDT, Meralco, etc.)
- [x] Frequency: monthly, weekly, yearly
- [x] Manual "Apply Due" button to create expenses from templates
- [x] Edit/delete recurring templates in More > Recurring tab
- [x] Auto-advance next date after applying

**6d — Budget vs Actual Chart ✅ DONE**
- [x] Bar chart comparing budget vs actual per category
- [x] Color-coded: under (green), near limit (yellow), over (red)

### Phase 7 — UI/UX Overhaul (Gold Edition) ✅ DONE
- [x] Gold/amber design system (#F5B526 primary)
- [x] All components upgraded: login, nav, cards, buttons, charts, modals, inputs, pills, toasts, chat bubbles
- [x] Light/dark theme toggle with full dual-theme token system
- [x] Category colors remapped to gold-complementary palette
- [x] Responsive desktop layout: sidebar nav, wider content areas, multi-column charts

### Phase 8 — AI Chat & Insights Improvements ✅ DONE

**8a — Image Upload Should Not Auto-Send ✅ DONE**
- [x] Uploading an image in AI Chat should NOT send immediately
- [x] User can type additional info/context after attaching
- [x] Send only when user clicks Send or presses Enter
- [x] Show attached file as preview/thumbnail in the input area

**8b — AI Insights Better Styling & Charts ✅ DONE**
- [x] Improve spacing and typography for easier reading
- [x] Add visual charts (recharts) where relevant in insights (category pie, person bar)
- [x] Better formatting: clear section headers, bullet points, spacing
- [x] Polished and well-structured layout: summary stats, overview, charts, category analysis, patterns, top expenses, numbered tips
- [x] AI returns structured JSON (overview, categoryAnalysis, patterns, tips)

**8c — AI Chat Multi-Entry Save UX ✅ DONE**
- [x] When AI suggests multiple entries in one response:
  - [x] "Save All" and "Discard All" buttons
  - [x] Individual "Save" button per entry
  - [x] Individual "Edit" button per entry (inline editing)
  - [x] User can selectively save, edit, or discard each entry
  - [x] Clear visual separation between entries
  - [x] Edit form: Description (full row), Amount + Category (side by side), Date (full row)
  - [x] AI gives detailed summary per each save/discard action (item name, category, amount, date)
  - [x] Save All shows full list with total; Discard All confirms count discarded

**8d — Edit Mode: Done & Save + Duplicate Detection ✅ DONE**
- [x] Edit mode shows "Done & Save" button (applies edit AND saves to expenses in one click) in addition to "Done" (apply edit only)
- [x] Duplicate detection: when a pending expense matches an existing expense (similar amount + similar description), show a red warning underneath: "Seems like there's a similar entry on MM/DD/YYYY"
- [x] Match logic: same category, amount within ±10%, and description fuzzy match against existing expenses
- [x] Duplicate card gets red border highlight + AlertTriangle icon

**8e — Dynamic Categories (Add/Remove) ✅ DONE**
- [x] Categories are dynamic (stored in localStorage, loaded on init)
- [x] Settings tab: category management UI (list with color dots, add input, remove button)
- [x] "Other" cannot be removed (AI parsing fallback)
- [x] Max 15 categories
- [x] Remove category: confirmation modal, reassigns expenses/recurring to "Other", removes budget entry
- [x] New categories auto-assigned colors from EXTRA_COLORS palette
- [x] AI system prompt uses dynamic categories list
- [x] All forms, charts, filters, budgets use dynamic `cats` state

### Phase 9 — Google Auth & Multi-Household System ✅ DONE

**9a — Google Authentication ✅ DONE**
- [x] Replace PIN-based login with "Sign in with Google" button
- [x] Store user profile (name, email, avatar) in a `profiles` table
- [x] Session management via Supabase Auth (auto-refresh, persist across tabs)
- [x] Show user name in sidebar from Google profile (dynamic, not hardcoded)
- [x] Logout button uses Supabase signOut (local scope, with error handling)
- [x] Dynamic user names in AI prompts and expense form dropdown
- [x] PIN login preserved as localStorage fallback (local dev)

**9b — Households & Invite System ✅ DONE (Email-based)**
- [x] Create `households` table, `household_members` table, `invites` table
- [x] Auto-create household on first Google sign-in
- [x] "Invite Partner" button (owner only) — enter partner's Gmail
- [x] On sign-in, check for pending invite → show "Accept & Join" screen
- [x] Data isolation: `household_id` on all tables, RLS policies
- [x] All Supabase queries filter by household_id

**9c — Role-Based Permissions ✅ DONE**
- [x] Owner: full access. Member: full access except Clear All Data and Invite
- [x] Role badge in Settings (Owner / Member)
- [x] Household member list with avatar, name, role

**9d — Profile & Household UI ✅ DONE**
- [x] Profile card in Settings: avatar, display name, email
- [x] Household name display (editable by owner)
- [x] Person filter on Dashboard uses real household member names

### Phase 10 — Navigation & Tab Restructure ✅ DONE

**10a — Household Auto-Create + Theme Persistence ✅ DONE**
- [x] Auto-create household on first sign-in (no manual "Create" step)
- [x] Persist theme (dark/light) to localStorage

**10b — Tab Restructure ✅ DONE**
- [x] 5-tab layout: Dashboard | Expenses | AI Chat | Money Hub | More
- [x] Expenses sub-tabs: List | Recurring
- [x] Money Hub: hub cards with drill-in sections
- [x] More tab: Settings only

**10c — Account-Linked Expenses ✅ DONE**
- [x] Account picker dropdown in expense form (optional)
- [x] Auto-deduct expense amount from selected account on save
- [x] Reverse on delete, re-apply on edit

**10d — Category Management in Budgets ✅ DONE**
- [x] Category add/remove moved from Settings into Budgets section

### Phase 11 — Debt & Credit Tracking ✅ DONE

**11a — Debt Data Model & UI ✅ DONE**
- [x] `debts` + `debt_payments` tables
- [x] Debts management screen with CRUD, payment recording, progress bars
- [x] Total debt summary card

**11b — AI Debt Insights ✅ DONE**
- [x] AI Chat includes debt context, calculates repayment timelines
- [x] "What if" scenarios and interest savings calculations

**11c — Payment Alerts & Notifications ✅ DONE**
- [x] PWA push notifications for due dates
- [x] In-app badges on Money Hub tab
- [x] Due-soon/overdue alert banners with quick Pay button

**11d — Payment History & Monthly Tracking ✅ DONE**
- [x] Interactive monthly payment grid (clickable cells)
- [x] "Mark all paid" bulk fill, late fee tracking
- [x] Payment stats: months paid, missed, streak, total paid

**11e — Payment Grid & History UX ✅ DONE**
- [x] Collapsible year rows, payment history show last 5 with "Show all"

### Phase 12 — Code Refactoring ✅ DONE

**Why:** `App.js` was ~1600+ lines. Splitting into feature files makes future work touch only the relevant file.

- [x] `src/constants.js` — themes, DEF_CATS, PERIODS, uid, fmt, helpers, all constants
- [x] `src/hooks.js` — `useMediaQuery`
- [x] `src/db.js` — full `sb` Supabase CRUD helpers
- [x] `src/AppContext.js` — global state, save functions, callAI, style helpers
- [x] `src/components/ChartTooltip.js` — shared recharts tooltip
- [x] `src/tabs/DashboardTab.js` — own `per` state (independent period selector)
- [x] `src/tabs/ExpensesTab.js` — includes Expense + Recurring modals, person filter
- [x] `src/tabs/ChatTab.js` — all chat/AI logic + duplicate detection + edit mode
- [x] `src/tabs/AccountsTab.js` — Money Hub + accounts + budgets + debts + savings + income
- [x] `src/tabs/MoreTab.js` — Settings + Invite modal
- [x] `App.js` — ~300 lines, auth + nav shell only

### Phase 13 — AI Chat Hub (Unified) ✅ DONE

**13a — Quick Action Chips ✅ DONE**
- [x] Pre-chat suggestion chips (spending review, budget check, top expenses, debt payoff, etc.)
- [x] "Spending review" shows period picker before generating

**13b — Move Insights into AI Chat ✅ DONE**
- [x] AI returns structured JSON, rendered as rich insight cards + charts inline in chat

**13c — Chat History Persistence ✅ DONE**
- [x] Persist messages to localStorage, clear chat button

### Phase 14 — Saved Insights + PDF Export ✅ DONE

**14a — Insights Persistence ✅ DONE**
- [x] `insights` Supabase table, auto-save reviews, "Past Reviews" list, delete

**14b — PDF Export ✅ DONE**
- [x] "Download PDF" button using window.print() API

### Phase 15 — Stripe Subscription (Premium Tier)

**15a — Stripe Setup & Backend**
- [ ] Create Stripe account, API keys, products (P149 PH / $4.99 International)
- [ ] `api/stripe-checkout.js` + `api/stripe-webhook.js` serverless functions
- [ ] `subscriptions` table in Supabase
- [ ] Regional pricing via Vercel `x-vercel-ip-country` header

**15b — Free vs Premium Feature Gating**
- [ ] `isPremium` flag in AppContext
- [ ] Free tier: all manual features. Premium: AI Chat, receipt scanning, AI reviews, PDF export
- [ ] Upgrade prompt for free users in AI Chat tab

**15c — Subscription UI**
- [ ] "Upgrade to Premium" card in Settings → Stripe Checkout
- [ ] "Manage Subscription" → Stripe Customer Portal
- [ ] Premium badge, subscription status card

**15d — Trial Period (optional)**
- [ ] 7-day free trial, countdown in AI Chat and Settings

### Phase 16 — Branding & PWA ✅ DONE

**16a — Logo & Favicon ✅ DONE**
- [x] RX monogram logo (gold gradient), SVG favicon
- [x] Logo in landing page, sidebar, mobile header

**16b — PWA Manifest & Homescreen Icons ✅ DONE**
- [x] manifest.json with app name, theme color, display: standalone
- [x] SVG icons, apple-touch-icon, PWA meta tags

**16c — App Name Update ✅ DONE**
- [x] Rebrand from "RXpenses" to "rxpenses" (lowercase) across all files
- [x] Browser tab: "rxpenses — Smart Money Tracker"

### Phase 17 — Landing Page ✅ DONE
- [x] Full marketing homepage: hero, features (6 cards), how it works (3 steps), FAQ, footer
- [x] Fully responsive, gold theme, Google OAuth, dark/light toggle

### Phase 18 — Enhancements ✅ DONE

**18a — Editable Category Names ✅ DONE**
- [x] Inline rename, updates all expenses/recurring/budgets

**18b — Collapsible Quick Action Chips ✅ DONE**
- [x] Always available, collapsible with toggle button

**18c — Recurring Expense Notifications ✅ DONE**
- [x] Due alert banners, badge count on Expenses tab + Recurring pill

**18d — Daily PWA Push Notifications ✅ DONE**
- [x] Service Worker for local push notifications, daily debt/recurring check

**18e — Dark Mode White Border Fix ✅ DONE**
- [x] CSS reset on html/body, dark background to prevent white flash

### Phase 19 — SEO & Discoverability

**19a — Technical SEO ✅ DONE**
- [x] Meta tags, OG tags, Twitter cards, JSON-LD structured data, canonical URL
- [x] OG image via Vercel Edge function (`api/og.js`)

**19b — Crawlability & Indexing ✅ DONE**
- [x] robots.txt, sitemap.xml, Google Search Console verified + indexed

**19c — Landing Page SEO Content ✅ DONE**
- [x] FAQ section, semantic HTML, aria-labels, geo-targeting copy

**19d — Performance ✅ DONE**
- [x] Preconnect to Supabase, minimal bundle

**19e — Off-Page & Social**
- [ ] Product Hunt, web directories, Reddit (r/budgetph, r/phinvest)
- [ ] Google Analytics or Vercel Analytics

**19f — Blog / Content Marketing**
- [ ] Blog section with SEO-targeted articles
- [ ] Internal links + CTA to sign up

### Phase 20 — Savings Goals ✅ DONE
- [x] `savings_goals` Supabase table with CRUD + RLS
- [x] Goal cards: progress bar, current vs target, percentage, days remaining
- [x] "Add Funds" button, summary card, celebration state at 100%
- [x] Lives in Money Hub as "Savings" section

### Phase 21 — Multi-Currency Support
- [ ] Currency field on expenses (PHP default, optional override)
- [ ] Exchange rate API, auto-convert to PHP on save
- [ ] Show original + PHP equivalent in expense list

### Phase 22 — UI/UX Polish ✅ DONE

**22a — Budget Cards Grouping ✅ DONE**
- [x] Categories with budget (top) vs no limit (collapsed section)

**22b — Mobile Navigation Redesign ✅ DONE**
- [x] Icons-only mobile nav, gold dot indicator, larger tap targets

**22c — Loading Animation ✅ DONE**
- [x] Animated RX logo coin (CSS coinFlip animation)

**22d — Pull-to-Refresh ✅ DONE**
- [x] Pull-down gesture on mobile, re-fetch all data, toast confirmation
- [x] Receipt image compression (1200px max, JPEG 70%)

### Phase 23 — Crypto Portfolio & Savings

**23a — Crypto as Savings Goal Currency ✅ DONE**
- [x] Currency type on savings goals: BTC, ETH, SOL, XRP, USDT, BNB, ADA, DOGE, DOT, AVAX, LINK, MATIC
- [x] Crypto goals show both crypto amount and PHP equivalent
- [x] Currency selector with live price, Add Funds adapted for crypto

**23b — Live Crypto Price Feed ✅ DONE**
- [x] CoinGecko API via Vercel proxy (`api/crypto.js`), auto-fetch every 5 min
- [x] Cache in localStorage, 24h change indicator, manual Refresh button

**23c — Bybit Portfolio Integration**
- [ ] Bybit API read-only integration for spot balances
- [ ] Portfolio summary card in Money Hub

**23d — Crypto Dashboard & Insights**
- [ ] Portfolio value chart, profit/loss, AI Chat crypto questions
- [ ] Include crypto in net worth calculation

### Phase 24 — Money Hub UX Redesign ✅ DONE

**24a — Money Hub Landing ✅ DONE**
- [x] Replace sub-tab pills with large summary cards (2x2 desktop, stacked mobile)
- [x] Tap card → drill into section with back button
- [x] Badge indicators on cards

**24b — Budget Chart Label Fix ✅ DONE**
- [x] Angled labels on mobile, 8-char abbreviation, tooltip shows full name

### Phase 25 — Projects (Planned Purchases & Home Improvements)

**25a — Project Data Model & UI**
- [ ] `projects` + `project_tasks` tables
- [ ] Project list with status badges, budget progress, deadline countdown
- [ ] Lives in Money Hub

**25b — Task Checklist**
- [ ] Checklist per project, progress bar

**25c — Cost Tracking**
- [ ] Link expenses to projects, budget vs actual comparison

**25d — Savings Goal Link**
- [ ] Link savings goal to project, show progress on project card

**25e — Notes & Research**
- [ ] Free-text notes per project, AI Chat context

### Phase 26 — Income Tracking ✅ DONE

**26a — Income Data Model & CRUD ✅ DONE**
- [x] `income` Supabase table, CRUD with form
- [x] Sources: Salary, Freelance, Business, Side Hustle, Gift, Refund, Crypto Gains, Other
- [x] Account-linked income (auto-add to balance)

**26b — Recurring Income ✅ DONE**
- [x] `recurring_income` table, templates with apply/auto-advance
- [x] Due/overdue alert banners, badge count

**26c — Income UI ✅ DONE**
- [x] Income card in Money Hub, list + recurring sub-tabs
- [x] Summary card with net cash flow, by-source breakdown

**26d — Income vs Expenses (Cash Flow) ✅ DONE**
- [x] Dashboard 3-column: Income (green) | Expenses (red) | Net Flow
- [x] Respects period selector and person filter

### Phase 27 — AI Income Recognition (Payslip Scanning)

**Why:** AI Chat currently only parses expenses. Users should be able to upload a payslip or income receipt and have the AI log it as income automatically.

**27a — AI Parses Income from Images & Text**
- [ ] Update AI system prompt to recognize income scenarios (payslips, salary receipts, freelance payments, GCash/bank transfer screenshots)
- [ ] AI returns `{"income":[...],"message":"..."}` when it detects income
- [ ] AI uses net pay (take-home), not gross pay
- [ ] Fallback: "received 50k salary" or "got paid" → income, not expense

**27b — Save as Income UX in Chat**
- [ ] ChatTab detects `income` array in AI response
- [ ] "Save as Income" button (green themed) with individual save/edit/discard
- [ ] Edit form: Amount, Source, Description, Date, Account link

**27c — Mixed Responses**
- [ ] AI returns both expenses AND income in one response
- [ ] Expense cards (red/gold) and income cards (green) rendered separately

### Phase 28 — Life Goals

**Why:** Users want to plan and track big life projects — buying a car, installing solar panels, home renovations — not just save money. Life Goals combines budgeting, milestones, and expense tracking into one motivational feature.

**28a — Life Goal Data Model & CRUD**
- [ ] Create `life_goals` Supabase table: id (TEXT PK), title, description, icon, cover_color, target_budget (NUMERIC), deadline (DATE), status (TEXT: active/completed/paused), household_id (FK), created_by, created_at, updated_at
- [ ] Create `life_goal_milestones` Supabase table: id (TEXT PK), goal_id (FK), title, is_completed (BOOL), sort_order (INT), completed_at, created_at
- [ ] Supabase CRUD helpers for life goals + milestones (+ localStorage fallback)
- [ ] RLS policies: household members can read/write their household's goals
- [ ] Clear All Data includes life goals + milestones

**28b — Life Goals UI & Navigation**
- [ ] New card in Money Hub: "Life Goals" with active goal count, overall progress
- [ ] Life Goals list view: card per goal showing title, icon, progress ring, budget spent vs target, milestone progress (e.g. "3/7 steps"), deadline countdown
- [ ] Add/Edit Life Goal modal: title, description, icon picker, target budget (optional), deadline (optional), cover color
- [ ] Goal detail view (expand or slide-in): full description, milestone checklist, linked expenses list, budget summary
- [ ] Empty state: motivational message + "Create your first Life Goal" CTA

**28c — Milestones & Progress Tracking**
- [ ] Add/edit/delete/reorder milestones within a goal (drag or up/down buttons)
- [ ] Check off milestones — show completion date
- [ ] Progress bar: milestones completed / total milestones
- [ ] Overall goal progress: combine milestone % and budget % into a single ring/bar
- [ ] Mark goal as "Completed" — celebration state (confetti or green highlight, similar to Savings Goals)
- [ ] Mark goal as "Paused" — dimmed card styling

**28d — Link Expenses to Life Goals**
- [ ] Add optional `life_goal_id` field to expenses (nullable FK)
- [ ] When adding/editing an expense, optional "Link to Life Goal" dropdown
- [ ] Goal detail view shows linked expenses (list + total spent)
- [ ] Budget tracker on goal card: total linked expenses vs target budget
- [ ] Over-budget warning (red highlight when linked expenses > target budget)

**28e — Link Savings Goals to Life Goals (Optional)**
- [ ] Optional `linked_savings_goal_id` on life_goals table
- [ ] If linked, show savings progress alongside budget spent on the goal card
- [ ] Combined view: "Saved P50,000 / Spent P30,000 / Budget P150,000"

**28f — AI Integration**
- [ ] AI chat understands life goals context ("How am I doing on my solar panel project?")
- [ ] AI can suggest tips for achieving goals faster based on spending patterns
- [ ] Include life goals summary in AI context when relevant

---

## Cost

| Tier | Details | Price |
|---|---|---|
| **Infrastructure** | Vercel free tier + Supabase free tier + Claude API | ~$3-10/month (API usage only) |
| **Domain** | rxpenses.com (Namecheap, 1-year) | ~$10/year |
| **Revenue (planned)** | Stripe subscriptions: P149/mo (PH) / $4.99/mo (International) | Stripe fee: 3.5% + P15 per txn |

---

## Active Bugs / To Do

- [ ] **RLS policies for income/recurring_income** — run INSERT/UPDATE/DELETE policies in Supabase Dashboard
- [ ] Phase 15 — Stripe subscription (monetization)
- [ ] Phase 25 — Projects (planned purchases, home improvements)
- [ ] Phase 27 — AI income recognition (payslip scanning)
- [ ] Phase 28 — Life Goals (milestones, budgets, linked expenses)
- [ ] Phase 19e/19f — Off-page SEO + blog content marketing

---

## Limitations

- No real bank integration — balances are manual entry only
- Image processing — receipt images sent to Claude API as base64
- Local push notifications via SW — server-side push + email not yet implemented
- Supabase free tier: 500MB database, 1GB file storage, 50K monthly active users
