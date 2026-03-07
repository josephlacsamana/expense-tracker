# Shared Expense Tracker

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
| **API proxy** | `expense-tracker/api/chat.js` (Vercel serverless, solves CORS for Anthropic API) |
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
| `categories` | name + household_id (composite PK), sort_order (INT) | Dynamic, max 15, scoped to household |
| `settings` | key + household_id (composite PK), value (JSONB) | Stores: `budgets`, `genBudget`, `pins`, scoped to household |
| `profiles` | id (UUID PK), email, display_name, avatar_url, created_at | Google Auth profiles |
| `households` | id (UUID PK), name, created_at | Household groups |
| `household_members` | id (UUID PK), household_id, user_id, role, joined_at | Membership + roles |
| `invites` | id (UUID PK), household_id, created_by, token, used, used_by, created_at, expires_at, invited_email | Email-based invite — matches on sign-in |
| `debts` | id (TEXT PK), name, type, total_amount, current_balance, due_date, interest_rate, min_payment, start_date, added_by, household_id (FK), created_at, updated_at | Debt tracking, scoped to household |
| `debt_payments` | id (TEXT PK), debt_id (FK), amount, date, new_balance, late_fee, household_id (FK), created_at | Payment history, scoped to household |
| `account_history` | id (TEXT PK), account_id, old_balance, new_balance, change_amount, reason, description, household_id (FK), created_at | Balance change log per account |
| `insights` | id (TEXT PK), period, data (JSONB), ai_response (JSONB), household_id (FK), created_at | Saved AI spending reviews (Phase 14) |

Default categories: `["Food", "Transport", "Bills", "Shopping", "Health", "Entertainment", "Subscriptions", "Other"]`

Joseph & Rowena's actual categories: `["Bills", "Health", "Entertainment", "Subscriptions", "Mortgage", "Utilities (Electric/Water/Wifi)", "Date Expense", "Grocery", "Eat Outside", "Support to parents", "Support to Mikaela", "Support to Ate Dette", "Transportation (Gas/Toll/Grab)", "Shopping or Parcels", "Other"]`

**Storage flow:** `sbReady` (env vars exist) → Supabase; otherwise → localStorage fallback.
On first Supabase load with empty tables, existing localStorage data is auto-migrated up.

**Environment variables (Vercel + .env.local):**
- `REACT_APP_SUPABASE_URL` — Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` — Supabase anon/public key

---

## Screens

1. **Landing Page** — Marketing homepage with hero, features, how it works, CTA + Google OAuth (PIN fallback for local dev)
2. **Dashboard** — Summary cards, charts, period selector
3. **Expenses** — sub-tabs: List (full list with search/filters) | Recurring (templates)
4. **AI Chat** — Chat interface for adding expenses and asking questions
5. **Accounts** — sub-tabs: Accounts (manual bank balances) | Budgets (general + per-category) | Debts (debt tracking + payment grid)
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

### Phase 6 — Login, Names, Budgets & Recurring (PARTIAL)

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

### Phase 8 — AI Chat & Insights Improvements

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

### Phase 9 — Google Auth & Multi-Household System

**9a — Google Authentication** ✅ DONE
- [x] Replace PIN-based login with "Sign in with Google" button
- [x] Store user profile (name, email, avatar) in a `profiles` table
- [x] Session management via Supabase Auth (auto-refresh, persist across tabs)
- [x] Show user name in sidebar from Google profile (dynamic, not hardcoded)
- [x] Logout button uses Supabase signOut (local scope, with error handling)
- [x] Dynamic user names in AI prompts and expense form dropdown
- [x] PIN login preserved as localStorage fallback (local dev)
- [x] Enable Google Auth provider in Supabase dashboard
- [x] Create `profiles` table in Supabase SQL Editor
- [x] Configure Google OAuth in Google Cloud Console
- [x] Custom favicon (gold peso coin SVG) and browser tab title ("Shared Finance")

**9b-lite + 9c — Households & Invite System** ✅ DONE (Email-based)
- [x] Create `households` table (id UUID, name, created_at)
- [x] Create `household_members` table (household_id, user_id, role: "owner"/"member", joined_at)
- [x] Create `invites` table (with `invited_email` column — email-based, not link/token)
- [x] Auto-create household on first Google sign-in (always, no gate)
- [x] "Invite Partner" button (owner only) — enter partner's Gmail, no link needed
- [x] Invite stored in DB with `invited_email` field
- [x] On sign-in, `handleSession` checks for pending email invite matching user's email
- [x] If valid invite found → show "Accept & Join" confirmation screen (inside auth flow, no race condition)
- [x] User clicks Accept → leave current household → join invited household → invite marked used
- [x] User clicks Decline → stays in their auto-created household
- [x] Invite reuse: if unexpired invite already exists for that email, don't create a duplicate
- [x] "Invite sent!" confirmation shows copyable app URL (for easy sharing)
- [x] Users list fetched from household_members (not all profiles)
- [x] Household info card in Settings (member count + role badge)
- [x] Supabase RLS: invites SELECT by email, households SELECT for invited users, household_members INSERT

**9b-full — Data Isolation** ✅ DONE
- [x] Add `household_id` column to all data tables (expenses, accounts, recurring, categories, settings, debts, debt_payments)
- [x] Migrate existing data: assign to default household
- [x] Enable Row Level Security (RLS) on all tables — users can only see data for their household
- [x] Update all Supabase queries to filter by household_id
- [x] Categories and settings use composite PK (name/key + household_id)
- [x] All sb helper functions accept and include household_id
- [x] Seeding, migration, and clearAll pass household_id

**9d — Role-Based Permissions** ✅ DONE
- [x] Owner role: full access to everything (the person who created the household)
- [x] Member role: full access to all features EXCEPT Settings > Clear All Data
- [x] Hide "Clear All Data" button for members
- [x] Hide "Invite Partner" button for members
- [x] Show role badge in Settings (Owner / Member) — gold pill for owner, grey for member
- [ ] Owner can see list of household members by name in Settings (currently shows count only)

**9e — Profile & Household UI** 🔄 PARTIAL
- [x] Profile card in Settings: avatar, display name, email (from Google)
- [x] Avatar + name + email shown in desktop sidebar
- [x] Household name display (editable by owner via inline Rename)
- [x] Google OAuth forces account picker (`prompt: "select_account"`) — no more auto-login
- [ ] "addedBy" field uses actual user names from profiles (not hardcoded)
- [ ] Person filter on Dashboard/Expenses uses real household member names
- [ ] Summary cards show per-person breakdown using real names

### Phase 10 — Navigation & Tab Restructure

**10a — Household Auto-Create + Theme Persistence** ✅ DONE
- [x] Remove `NoHouseholdScreen` gate — don't block users on login
- [x] Auto-create household on first Google sign-in (no manual "Create" step)
- [x] Keep "Invite Partner" and household info in Settings (optional, not required)
- [x] Persist theme (dark/light) to localStorage — retain choice across login, logout, and page refreshes

**10b — Tab Restructure** ✅ DONE

New 5-tab layout (mobile bottom nav / desktop sidebar):
```
Dashboard | Expenses | AI Chat | Accounts | More
```

- **Expenses tab** — sub-tabs: `List` | `Recurring`
  - [x] Move Recurring from More into Expenses as a sub-tab
  - [x] Expense list stays as-is (first sub-tab, default)
  - [x] Recurring templates as second sub-tab

- **Accounts tab** (new main tab, merged) — sub-tabs: `Accounts` | `Budgets`
  - [x] Move Accounts out of More into its own main tab
  - [x] Move Budgets out of More into Accounts as second sub-tab
  - [x] Bank balances + net worth in first sub-tab
  - [x] General budget + per-category budgets in second sub-tab

- **More tab** — Settings only (Insights moved to AI Chat in Phase 13)
  - [x] Move Insights from main nav into More (then later into AI Chat)
  - [x] Settings stays in More
  - [x] Cleaner More tab with just Settings

**10d — Category Management in Budgets** ✅ DONE
- [x] Move full category management (add/remove) from Settings into Budgets per-category section
- [x] Add category: input + "Add" button above the per-category budget cards
- [x] Remove category: X button on each category (except "Other") with confirmation modal
- [x] Remove the old category management section from Settings tab entirely
- [x] Max 15 categories, "Other" cannot be removed (same rules as before)

**10c — Account-Linked Expenses** ✅ DONE
- [x] When adding an expense (manual form), user can optionally pick which account the money came from
- [x] Account picker dropdown in the expense form (optional field, default "No account linked")
- [x] On save, auto-deduct the expense amount from the selected account's balance
- [x] On delete, reverse the account balance (restore deducted amount)
- [x] On edit, reverse old account deduction and apply new one
- [x] Add `account_id` to Supabase expense upsert/load mappings
- [x] Show linked account name on expense list items + dashboard top 5
- [ ] (Future) AI Chat: AI can ask or infer which account to use
- [ ] (Future) Account balance history — track balance changes over time

### Phase 11 — Debt & Credit Tracking

**11a — Debt Data Model & UI** ✅ DONE
- [x] Create `debts` table: id (TEXT PK), name, type (Credit Card / Mortgage / Personal Loan / Car Loan / Other), total_amount, current_balance, due_date (day of month), interest_rate, min_payment, added_by, created_at, updated_at
- [x] Create `debt_payments` table: id (TEXT PK), debt_id (FK), amount, date, new_balance, created_at
- [x] Debts management screen: list all debts with name, type icon, balance, due date, progress bar (paid vs total)
- [x] Add/edit/delete debt entries with form (name, type dropdown, total amount, current balance, due date, interest rate, min payment)
- [x] Record payment: deduct from current balance, log payment with date and new balance
- [x] Payment history log per debt (expandable, date, amount paid, new balance)
- [x] Total debt summary card (total owed, total minimum payments, next due date)
- [x] Where it lives: under Accounts tab as a third sub-tab (`Accounts | Budgets | Debts`)
- [x] Supabase CRUD helpers + localStorage fallback
- [x] Clear All Data includes debts
- [x] Payment modal pre-fills min monthly payment amount (editable)
- [x] Debt form has helper text under each field explaining what it means

**11b — AI Debt Insights** ✅ DONE
- [x] AI Chat SYS prompt includes full debt context (name, type, balance, APR, min payment, due date)
- [x] AI calculates repayment timelines using amortization math
- [x] "What if" scenarios: "If I pay P5,000/month on my credit card, when will it be paid off?"
- [x] Interest savings calculator: "How much do I save by paying P2,000 extra per month?"
- [x] AI can answer debt questions in AI Chat (total owed, next due date, payoff timeline, etc.)
- [x] Debt summary included in AI Insights reviews (debtAnalysis field in JSON + debt summary card in UI)

**11c — Payment Alerts & Notifications** ✅ DONE (except email)
- [x] PWA push notifications for approaching due dates (3 days before, 1 day before, day of) — via Phase 18d SW
- [x] Service Worker registration for push notifications — via Phase 18d
- [x] Notification permission request flow (Settings toggle) — via Phase 18d
- [x] Missed payment detection: overdue alert when due date passes (red banner with month names)
- [x] In-app notification badge on Accounts tab (desktop sidebar + mobile nav) with due count
- [x] Due-soon alert banners in Debts sub-tab: overdue (red), due today (gold), due within 3 days (gold) with quick Pay button
- [x] Badge count on Debts sub-tab pill
- [x] Overdue detection accounts for due day (e.g. due day 5, today is 7th → March is overdue, not "current")
- [x] Daily debt/recurring check via SW — sends notifications once per day for due items
- [ ] Email notifications (future/lower priority): Supabase Edge Function to send reminder emails

**11d — Payment History & Monthly Tracking** ✅ DONE
- [x] Add `start_date` (DATE) column to `debts` table — when payments began
- [x] Add `start_date` field to debt form with helper text ("When did you start paying this debt?")
- [x] Interactive monthly payment grid per debt: clickable cells from start date to now
  - Green = paid (payment recorded that month), tap to remove
  - Red = missed (no payment recorded), tap to mark paid
  - Gold = current month (only if due date hasn't passed yet)
- [x] Payment summary stats per debt: months paid, months missed, total paid, payment streak
- [x] "Mark all paid" button — fills all unpaid months at specified amount (for bulk historical entry)
- [x] Late fee tracking: `late_fee` (NUMERIC, default 0) column on `debt_payments`
- [x] Record Payment modal: amount, date, late fee (optional)
- [x] Payment history list with inline edit (amount, date, late fee) and delete per entry
- [x] Delete payment confirmation modal
- [x] Manual "+ Add" button in payment history for adding past payments
- [x] Grid correctly marks current month as missed if today > due day

**11e — Payment Grid & History UX Improvements** ✅ DONE
- [x] Collapsible year rows in monthly grid: current year expanded, past years collapsed
- [x] Collapsed year shows summary: "2024 — 10/12 paid (2 missed)"
- [x] Tap year header to expand/collapse its month cells (ChevronDown/ChevronRight)
- [x] Auto-expand current year + when only 1-2 years exist
- [x] Payment history: show last 5 by default with "Show all (N)" button to expand
- [x] "Show less" button to re-collapse after expanding

### Phase 13 — AI Chat Hub (Unified) ✅ DONE

**13a — Quick Action Chips** ✅ DONE
- [x] Pre-chat suggestion chips shown when chat has only the welcome message
- [x] Chips: "What did I spend this month?", "Budget check", "Top expenses", "Spending review", "Debt payoff plan", "Compare with last month"
- [x] Tapping a chip auto-sends the question to AI immediately
- [x] "Spending review" chip shows a period picker (Weekly/Monthly/Quarterly/Yearly) before generating
- [x] Chips disappear once user sends first message or AI responds

**13b — Move Insights into AI Chat** ✅ DONE
- [x] Remove Insights sub-tab from More (More becomes just Settings)
- [x] "Spending review" chip triggers the existing AI insights prompt with expense data context
- [x] AI returns structured JSON (overview, categoryAnalysis, patterns, tips, debtAnalysis)
- [x] Render rich insight cards + charts inline in the chat feed (same UI as current Insights, but inside chat)
- [x] Period selector appears when "Spending review" chip is tapped

**13c — Chat History Persistence** ✅ DONE
- [x] Persist chat messages to localStorage so conversation survives tab navigation and page refreshes
- [x] Clear chat button (visible when msgs > 1) to reset conversation back to welcome message
- [x] Zero-cost implementation — localStorage only, no Supabase needed

### Phase 14 — Saved Insights + PDF Export ✅ DONE

**14a — Insights Persistence** ✅ DONE
- [x] New `insights` Supabase table: id (TEXT PK), period, data (JSONB), ai_response (JSONB), household_id (FK), created_at
- [x] Auto-save every generated insight to the table
- [x] "Past Reviews" accessible from chat (chip or button)
- [x] List view: date, period label, total spent preview
- [x] Tap to view full past insight (rendered inline or modal)
- [x] Delete old insights

**14b — PDF Export** ✅ DONE
- [x] "Download PDF" button on each insight (current + past)
- [x] Uses browser window.open() + window.print() API targeting the insight content
- [x] Clean print stylesheet: white background, no nav, proper margins
- [x] Include header with household name, period, date generated

### Phase 15 — Stripe Subscription (Premium Tier)

**15a — Stripe Setup & Backend**
- [ ] Create Stripe account (stripe.com) and get API keys
- [ ] Create products in Stripe Dashboard: Premium Monthly (P149 PH / $4.99 International)
- [ ] Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to Vercel env vars
- [ ] Add `REACT_APP_STRIPE_PUBLISHABLE_KEY` to Vercel env vars
- [ ] Create `api/stripe-checkout.js` — Vercel serverless function to create Stripe Checkout session
- [ ] Create `api/stripe-webhook.js` — Vercel serverless function to handle Stripe webhook events (subscription created, cancelled, payment failed)
- [ ] Add `subscriptions` table in Supabase: id, user_id, household_id, stripe_customer_id, stripe_subscription_id, plan, status (active/cancelled/past_due), current_period_end, created_at, updated_at
- [ ] Add `stripe_customer_id` column to `profiles` table
- [ ] Regional pricing: detect country via Vercel `x-vercel-ip-country` header → show PH or international price

**15b — Free vs Premium Feature Gating**
- [ ] Add `isPremium` flag to AppContext (derived from subscription status)
- [ ] **Free tier** (all users): manual expense CRUD, dashboard, charts, budgets, accounts, debts, recurring, household sharing, CSV export
- [ ] **Premium tier** (P149/mo PH, $4.99/mo international): AI Chat, receipt scanning, AI spending reviews, PDF export, debt payoff AI analysis
- [ ] AI Chat tab shows upgrade prompt for free users (preview of what AI can do + Subscribe button)
- [ ] "Spending review" chip disabled for free users with lock icon
- [ ] PDF export button hidden for free users
- [ ] Gate `callAI` function — return upgrade message if not premium

**15c — Subscription UI**
- [ ] "Upgrade to Premium" card in Settings (for free users) — shows features + price + Subscribe button
- [ ] Subscribe button → Stripe Checkout (hosted payment page, handles cards + GCash)
- [ ] "Manage Subscription" link in Settings (for premium users) → Stripe Customer Portal (cancel, update payment method)
- [ ] Premium badge/pill next to user name in sidebar + Settings
- [ ] Subscription status card in Settings: plan name, renewal date, status
- [ ] Toast notification on successful subscription
- [ ] Grace period handling: if payment fails, show warning but keep access for a few days

**15d — Trial Period (optional)**
- [ ] 7-day free trial for new users (no credit card required)
- [ ] Trial countdown shown in AI Chat and Settings
- [ ] After trial expires, AI features locked with "Subscribe to continue" prompt
- [ ] Stripe trial period configuration (if using card-required trial)

### Phase 16 — Branding & PWA (Logo, Favicon, Homescreen)

**16a — Logo & Favicon**
- [ ] Design new app logo (gold/amber themed, clean, modern — no emojis)
- [ ] Create SVG logo for use in login screen, sidebar header, and about section
- [ ] Generate favicon set: favicon.ico (16x16, 32x32), favicon-16x16.png, favicon-32x32.png
- [ ] Replace current gold peso coin SVG favicon with new logo
- [ ] Update `public/index.html` with new favicon links
- [ ] Logo used in login screen hero section (replace Coins icon)
- [ ] Logo used in desktop sidebar header (replace "ExpenseTracker" text or complement it)

**16b — PWA Manifest & Homescreen Icons**
- [ ] Create `public/manifest.json` with app name ("RXpenses"), theme color (#F5B526), background color, display: standalone
- [ ] Generate homescreen icon set from logo: 192x192, 384x384, 512x512 (PNG)
- [ ] Apple touch icon: 180x180 PNG in `public/`
- [ ] Add `<link rel="apple-touch-icon">` and `<link rel="manifest">` to `public/index.html`
- [ ] Add `<meta name="apple-mobile-web-app-capable" content="yes">`
- [ ] Add `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
- [ ] Add `<meta name="theme-color" content="#F5B526">`
- [ ] Test "Add to Home Screen" on iOS Safari and Android Chrome — logo appears correctly
- [ ] Splash screen config for iOS (optional): apple-touch-startup-image

**16c — App Name Update** ✅ DONE
- [x] Update browser tab title from "Shared Finance" to "RXpenses"
- [x] Update login screen brand text (LandingPage shows "RXpenses")
- [x] Update sidebar header text (shows "RXpenses" in sidebar + mobile header)
- [x] Update manifest.json short_name and name

### Phase 17 — Landing Page (Public Homepage)

**17a — Landing Page Build** ✅ DONE
- [x] Replace bare LoginScreen with full marketing landing page
- [x] Hero section: brand name, tagline, description, "Get Started" CTA
- [x] Features section: 6 feature cards with Lucide icons (AI chat, shared tracking, debt management, budgets, analytics, receipt scanning)
- [x] How It Works section: 3-step flow (Sign up, Track, Get insights)
- [x] Footer with app name + credits
- [x] Fully responsive (desktop: multi-column, mobile: stacked)
- [x] Gold theme consistent with app design system
- [x] Sign in with Google button in hero + header nav
- [x] Dark/light theme toggle on landing page
- [x] Smooth scroll to sections
- [x] No external dependencies (pure inline styles)

### Phase 18 — Enhancements ✅ DONE

**18a — Editable Category Names** ✅ DONE
- [x] Category name is editable inline (click to rename instead of delete + re-add)
- [x] Renaming updates all expenses, recurring templates, and budgets that used the old name
- [x] "Other" category cannot be renamed

**18b — Collapsible Quick Action Chips** ✅ DONE
- [x] Quick action chips are always available (not hidden when convo exists)
- [x] Chips section is collapsible: collapsed by default when msgs > 1, expanded when msgs === 1
- [x] Toggle button to show/hide chips ("Shortcuts" pill with chevron)
- [x] "Spending review" period picker and "Past reviews" button included in collapsible area

**18c — Recurring Expense Notifications** ✅ DONE
- [x] Due recurring expenses get alert banners in the Recurring sub-tab (like debt alerts)
- [x] Badge count on Expenses tab in nav (desktop sidebar + mobile bottom nav) for due recurring count
- [x] Badge count on Recurring sub-tab pill
- [x] Alert banner shows: description, amount, "Due today" or "Overdue by N days"

**18d — Daily PWA Push Notifications** ✅ DONE
- [x] Service Worker (`public/sw.js`) for local push notifications
- [x] Notification permission request flow (toggle in Settings > Enable/Disable Notifications)
- [x] Daily check: sends debt + recurring data to SW, SW shows notifications for due/overdue items
- [x] PWA manifest (`public/manifest.json`) for installable app
- [x] Browser tab title updated to "RXpenses"
- [x] Apple mobile web app meta tags added

**18e — Dark Mode White Border Fix** ✅ DONE
- [x] Added CSS reset (margin:0, padding:0) on html/body in index.html
- [x] Set body background to #0E0E14 (dark theme base) to eliminate white border/flash in PWA and browser

### Phase 19 — SEO & Discoverability (Lower Priority)

**Why:** rxpenses.com is not indexed by Google yet. Searching "rxpenses.com" shows unrelated results. Need proper SEO so it ranks for "expense tracker", "shared expense tracker", "AI expense tracker Philippines", etc.

**19a — Technical SEO (On-Page Basics)** 🔄 PARTIAL
- [x] Add `<meta name="description">` with keyword-rich copy
- [x] Add `<meta name="keywords">` with target terms: expense tracker, shared expenses, AI receipt scanner, budget tracker, debt tracker, Philippines, PHP
- [x] Add Open Graph meta tags (`og:title`, `og:description`, `og:site_name`, `og:url`, `og:type`) for social sharing previews
- [x] Add Twitter Card meta tags (`twitter:card`, `twitter:title`, `twitter:description`)
- [ ] Create a social share preview image (1200x630 OG image) — gold-themed with app name + tagline (needed for `og:image` and `twitter:image`)
- [x] Add `<link rel="canonical" href="https://rxpenses.com/">` to prevent duplicate content
- [x] Add structured data (JSON-LD) — `SoftwareApplication` schema with name, description, price, features
- [x] Improve `<title>` tag: "RXpenses — Free AI Expense Tracker for Couples | Track, Budget, Save"

**19b — Crawlability & Indexing** 🔄 PARTIAL
- [x] Create `public/robots.txt` — allow all crawlers, point to sitemap
- [x] Create `public/sitemap.xml` — list the main URL (https://rxpenses.com/)
- [x] Verify site ownership in Google Search Console (URL prefix method, auto-verified)
- [x] Submit sitemap to Google Search Console
- [x] Submit URL for indexing in Google Search Console ("Request Indexing") — queued for crawl
- [ ] Submit to Bing Webmaster Tools (optional, covers Bing + Yahoo)

**19c — Landing Page SEO Content** 🔄 PARTIAL
- [x] Add more text content to landing page (FAQ section adds crawlable keyword-rich text)
- [x] Add an FAQ section at the bottom (6 questions answering common search queries)
- [ ] Use semantic HTML: `<h1>`, `<h2>`, `<h3>`, `<p>`, `<article>`, `<section>` with proper hierarchy (currently using styled divs)
- [ ] Add alt text to any images (logo, screenshots)
- [x] Internal anchor links (Features, How It Works, FAQ) for better crawling
- [ ] Add a "Built for couples in the Philippines" or localized copy for geo-targeting

**19d — Performance & Core Web Vitals**
- [ ] Ensure Lighthouse Performance score is 90+ (fast load = better ranking)
- [ ] Lazy-load below-the-fold content if needed
- [ ] Preconnect to Supabase domain (`<link rel="preconnect">`)
- [ ] Minimize JS bundle size (already using React, check for unused imports)

**19e — Off-Page & Social**
- [ ] Create a simple landing on Product Hunt or similar (free exposure)
- [ ] Add the site to free web directories (startuplist, saashub, etc.)
- [ ] Share on Reddit (r/budgetph, r/phinvest, r/webdev) for backlinks
- [ ] Set up Google Analytics or Vercel Analytics (track visitors)

**19f — Blog / Content Marketing**
- [ ] Create a simple blog section on the landing page or separate `/blog` route
- [ ] Write 3-5 SEO-targeted articles:
  - "How to Track Shared Expenses as a Couple in 2026"
  - "Best Free AI Expense Tracker Apps for Filipinos"
  - "How to Manage Debt Payments and Stay on Track"
  - "5 Budgeting Tips for Couples Living Together"
  - "How AI Receipt Scanning Saves You Time on Expense Tracking"
- [ ] Each post targets long-tail keywords for organic search traffic
- [ ] Blog posts include internal links back to app features + CTA to sign up
- [ ] Add blog index to sitemap.xml for crawling
- [ ] Consider using markdown files or Supabase table for blog content storage

### Phase 12 — Code Refactoring ✅ DONE

**Why:** `App.js` was ~1600+ lines. Splitting into feature files makes future work touch only the relevant file.

- [x] `src/constants.js` — themes, DEF_CATS, PERIODS, uid, fmt, helpers, all constants
- [x] `src/hooks.js` — `useMediaQuery`
- [x] `src/db.js` — full `sb` Supabase CRUD helpers
- [x] `src/AppContext.js` — global state, save functions, callAI, style helpers (pillS, cardS, etc.), householdRole/profile/household
- [x] `src/components/ChartTooltip.js` — shared recharts tooltip
- [x] `src/tabs/DashboardTab.js` — own `per` state (independent period selector)
- [x] `src/tabs/ExpensesTab.js` — includes Expense + Recurring modals, person filter
- [x] `src/tabs/ChatTab.js` — all chat/AI logic + duplicate detection + edit mode
- [x] `src/tabs/AccountsTab.js` — includes Account + Budget + Debt modals
- [x] `src/tabs/MoreTab.js` — Settings + Invite modal (Insights moved to ChatTab)
- [x] `App.js` — 416 lines, auth + LoginScreen + nav shell only

---

## Cost

| Tier | Details | Price |
|---|---|---|
| **Infrastructure** | Vercel free tier + Supabase free tier + Claude API | ~$3-10/month (API usage only) |
| **Domain** | rxpenses.com (Namecheap, 1-year) | ~$10/year |
| **Revenue (planned)** | Stripe subscriptions: P149/mo (PH) / $4.99/mo (International) | Stripe fee: 3.5% + P15 per txn |

---

## Session Notes (2026-03-07)

### What was done this session:
1. **Phase 14b — PDF Export** — `printInsight()` in ChatTab.js opens print dialog for saving insights as PDF.
2. **Custom domain setup** — `rxpenses.com` via Namecheap, DNS → Vercel, SSL provisioned. Google Cloud Console + Supabase redirect URLs updated.
3. **Phase 13c — Chat History Persistence** — Messages saved to localStorage, survive tab navigation + refreshes. Clear chat button added.
4. **Phase 11c — Payment Alerts** — Due-soon badge on Accounts nav tab (desktop + mobile). Alert banners in Debts sub-tab (overdue red, due today/soon gold) with quick Pay button. Overdue detection uses due day (day 5 passed on 7th → overdue).
5. **Phase 11d — Payment History & Monthly Tracking** — Interactive clickable payment grid (toggle paid/unpaid), "Mark all paid" bulk fill, start_date on debts, late_fee on payments, inline edit/delete per payment, payment stats (paid/missed/streak/total).
6. **Overdue grid fix** — Current month turns red (missed) if today > due date, not gold.
7. **Phase 11e — Payment Grid UX** — Collapsible year rows (current year expanded, past collapsed with summary). Payment history shows last 5 with "Show all" button.
8. **Phase 17 — Landing Page** — Full marketing homepage replacing bare LoginScreen. Hero, features (6 cards), how it works (3 steps), CTA, footer. Brand renamed to "RXpenses" in nav + sidebar. `LandingPage.js` extracted as separate file.

### Current DB state:
- Joseph's household ID: `6ee010f1-7050-4096-b198-d3bc4fae250c`
- Members: Joseph (owner) + Rowena (member)

### Domain & Hosting:
- **Domain:** rxpenses.com (registered via Namecheap, 1-year)
- **DNS:** Namecheap → A record (@ → 76.76.21.21), CNAME (www → cname.vercel-dns.com)
- **Vercel:** Custom domain added, SSL auto-provisioned
- **Old URL:** expense-tracker-sage-mu.vercel.app (still works)

### Invite system — how it works:
- Owner goes to Settings → Invite Partner → enters partner's Gmail → clicks Send
- Invite record created in `invites` table with `invited_email` set
- Partner signs in with Google → `handleSession` queries invites table for their email → shows "Accept & Join" screen

### Seph & Tres alt accounts:
- `trespares2020@gmail.com` (Tres) and `jlacsamana122@gmail.com` (Seph) are Joseph's test accounts
- Cleanup SQL in previous session notes if needed

---

## Active Bugs / To Do Next Session

- [ ] Phase 9e remaining — addedBy uses real profile names, person filter uses real names on Dashboard
- [ ] Phase 9d remaining — list household members by name in Settings (currently shows count only)
- [ ] Phase 15 — Stripe subscription (next major feature)
- [ ] Phase 16 — Branding & PWA (logo, favicon, homescreen icons — manifest.json + sw.js already created in Phase 18d, needs icon files)
- [ ] Phase 19 — SEO (lower priority, outlined below)

---

## Limitations

- No real bank integration — balances are manual entry only
- Image processing — receipt images sent to Claude API as base64
- Session-based auth — PIN checked on load, stored in React state
- Local push notifications via SW (Phase 18d) — server-side push + email not yet implemented
- Supabase free tier: 500MB database, 1GB file storage, 50K monthly active users
