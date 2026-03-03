# Shared Expense Tracker

A sleek, modern shared expense tracker for **2 users** (Joseph + Rowena).
AI-powered receipt scanning, chat-based expense logging, dashboards, analytics, and AI insights.

---

## Project Structure

| Item | Details |
|---|---|
| **App code** | `expense-tracker/src/App.js` (single-file, all components + inline styles) |
| **API proxy** | `expense-tracker/api/chat.js` (Vercel serverless, solves CORS for Anthropic API) |
| **Hosting** | Vercel (free tier), Root Directory = `expense-tracker` |
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
| `expenses` | id (TEXT PK), amount, category, description, date, added_by, created_at | Main data |
| `accounts` | id (TEXT PK), name, balance, type, updated_at | Manual bank balances |
| `recurring` | id (TEXT PK), amount, category, description, frequency, next_date, added_by, created_at | Templates |
| `categories` | name (TEXT PK), sort_order (INT) | Dynamic, max 15 |
| `settings` | key (TEXT PK), value (JSONB) | Stores: `budgets`, `genBudget`, `pins` |
| `profiles` | id (UUID PK), email, display_name, avatar_url, created_at | Google Auth profiles |
| `households` | id (UUID PK), name, created_at | Household groups |
| `household_members` | id (UUID PK), household_id, user_id, role, joined_at | Membership + roles |
| `invites` | id (UUID PK), household_id, created_by, token, used, used_by, created_at, expires_at | Single-use invite links |
| `debts` | id (TEXT PK), name, type, total_amount, current_balance, due_date, interest_rate, min_payment, added_by, created_at, updated_at | *Planned — Phase 11* |
| `debt_payments` | id (TEXT PK), debt_id (FK), amount, date, new_balance, created_at | *Planned — Phase 11* |

Default categories: `["Food", "Transport", "Bills", "Shopping", "Health", "Entertainment", "Subscriptions", "Other"]`

Joseph & Rowena's actual categories: `["Bills", "Health", "Entertainment", "Subscriptions", "Mortgage", "Utilities (Electric/Water/Wifi)", "Date Expense", "Grocery", "Eat Outside", "Support to parents", "Support to Mikaela", "Support to Ate Dette", "Transportation (Gas/Toll/Grab)", "Shopping or Parcels", "Other"]`

**Storage flow:** `sbReady` (env vars exist) → Supabase; otherwise → localStorage fallback.
On first Supabase load with empty tables, existing localStorage data is auto-migrated up.

**Environment variables (Vercel + .env.local):**
- `REACT_APP_SUPABASE_URL` — Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` — Supabase anon/public key

---

## Screens

1. **Login** — PIN entry with role selection
2. **Dashboard** — Summary cards, charts, period selector
3. **Expenses** — Full list with search, filters (date/category/person)
4. **AI Chat** — Chat interface for adding expenses and asking questions
5. **Insights** — AI-generated spending reviews with period selector
6. **More** — Accounts (manual bank balances), Budgets, Settings, Export

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

**9b-lite + 9c — Households & Invite Link System** ✅ DONE
- [x] Create `households` table (id UUID, name, created_at)
- [x] Create `household_members` table (household_id, user_id, role: "owner"/"member", joined_at)
- [x] Create `invites` table (id, household_id, created_by, token, used, used_by, created_at, expires_at)
- [x] Auto-create household when user clicks "Create Your Household" (first-time flow)
- [x] NoHouseholdScreen for users not yet in a household
- [x] Invite token capture from URL query param (`?invite=TOKEN`)
- [x] Token persisted through OAuth redirect via localStorage
- [x] Auto-accept invite on sign-in (validate, join household, mark used)
- [x] "Invite Partner" button in Settings with copy-link modal
- [x] Reuse existing unused invite instead of creating duplicates
- [x] Users list fetched from household_members (not all profiles)
- [x] Household info card in Settings (member count + role)
- [x] Create tables in Supabase SQL Editor

**9b-full — Data Isolation (future)**
- [ ] Add `household_id` column to all data tables (expenses, accounts, recurring, categories, settings)
- [ ] Migrate existing data: assign to default household
- [ ] Enable Row Level Security (RLS) on all tables — users can only see data for their household
- [ ] Update all Supabase queries to filter by household_id

**9d — Role-Based Permissions**
- [ ] Owner role: full access to everything (the person who created the household)
- [ ] Member role: full access to all features EXCEPT Settings > Clear All Data
- [ ] Hide or disable "Clear All Data" button for members
- [ ] Show role badge in Settings (Owner / Member)
- [ ] Owner can see list of household members in Settings

**9e — Profile & Household UI**
- [ ] Profile section in Settings: name, email, avatar (from Google)
- [ ] Household name display (editable by owner)
- [ ] "addedBy" field uses actual user names from profiles (not hardcoded)
- [ ] Person filter on Dashboard/Expenses uses real household member names
- [ ] Summary cards show per-person breakdown using real names

### Phase 10 — Navigation & Tab Restructure

**10a — Household Auto-Create + Theme Persistence** ✅ DONE
- [x] Remove `NoHouseholdScreen` gate — don't block users on login
- [x] Auto-create household on first Google sign-in (no manual "Create" step)
- [x] Keep "Invite Partner" and household info in Settings (optional, not required)
- [x] Persist theme (dark/light) to localStorage — retain choice across login, logout, and page refreshes

**10b — Tab Restructure**

New 5-tab layout (mobile bottom nav / desktop sidebar):
```
Dashboard | Expenses | AI Chat | Accounts | More
```

- **Expenses tab** — sub-tabs: `List` | `Recurring`
  - [ ] Move Recurring from More into Expenses as a sub-tab
  - [ ] Expense list stays as-is (first sub-tab, default)
  - [ ] Recurring templates as second sub-tab

- **Accounts tab** (new main tab, merged) — sub-tabs: `Accounts` | `Budgets`
  - [ ] Move Accounts out of More into its own main tab
  - [ ] Move Budgets out of More into Accounts as second sub-tab
  - [ ] Bank balances + net worth in first sub-tab
  - [ ] General budget + per-category budgets in second sub-tab

- **More tab** — sub-tabs: `Insights` | `Settings`
  - [ ] Move Insights from main nav into More
  - [ ] Settings stays in More
  - [ ] Cleaner More tab with just 2 sub-tabs

**10c — Account-Linked Expenses**
- [ ] When adding an expense (manual form or AI Chat), user can optionally pick which account the money came from
- [ ] Account picker dropdown in the expense form (optional field, default "None")
- [ ] AI Chat: AI can ask or infer which account to use (e.g., "paid with BDO" → links to BDO account)
- [ ] On save, auto-deduct the expense amount from the selected account's balance
- [ ] On delete/edit, reverse or adjust the account balance accordingly
- [ ] Add `account_id` column to expenses table (nullable, references accounts)
- [ ] Show linked account name on expense list items (small label/tag)
- [ ] Account balance history — track balance changes over time (not just current snapshot)

### Phase 11 — Debt & Credit Tracking

**11a — Debt Data Model & UI**
- [ ] Create `debts` table: id (TEXT PK), name, type (Credit Card / Mortgage / Personal Loan / Car Loan / Other), total_amount, current_balance, due_date (day of month), interest_rate, min_payment, added_by, created_at, updated_at
- [ ] Debts management screen: list all debts with name, type icon, balance, due date, progress bar (paid vs total)
- [ ] Add/edit/delete debt entries with form (name, type dropdown, total amount, current balance, due date, interest rate, min payment)
- [ ] Manual balance update after payments (with date stamp)
- [ ] Payment history log per debt (date, amount paid, new balance)
- [ ] Total debt summary card (total owed, total minimum payments, next due date)
- [ ] Where it lives: under Accounts tab as a third sub-tab (`Accounts | Budgets | Debts`)

**11b — AI Debt Insights**
- [ ] AI calculates repayment timelines based on current balance, interest rate, and payment amounts
- [ ] "What if" scenarios: "If I pay P5,000/month on my credit card, when will it be paid off?"
- [ ] Interest savings calculator: "How much do I save by paying P2,000 extra per month?"
- [ ] AI can answer debt questions in the existing AI Chat (e.g., "How much do I owe total?", "When is my next credit card due?")
- [ ] Debt summary included in AI Insights reviews (alongside spending analysis)

**11c — Payment Alerts & Notifications**
- [ ] PWA push notifications for approaching due dates (3 days before, 1 day before, day of)
- [ ] Service Worker registration for push notifications
- [ ] Notification permission request flow (Settings toggle)
- [ ] Missed payment detection: if due date passes without a balance update, show alert
- [ ] In-app notification banner/badge on the Accounts tab when payments are due
- [ ] Daily/weekly debt summary notification (optional, configurable in Settings)
- [ ] Email notifications (future/lower priority): Supabase Edge Function to send reminder emails

---

## Cost

| Tier | Details | Price |
|---|---|---|
| **Current** | Vercel free tier + Supabase free tier + Claude API | ~$3-10/month (API usage only) |

---

## Limitations

- No real bank integration — balances are manual entry only
- Image processing — receipt images sent to Claude API as base64
- Session-based auth — PIN checked on load, stored in React state
- No push notifications yet — planned in Phase 11c (PWA push + optional email)
- Supabase free tier: 500MB database, 1GB file storage, 50K monthly active users
