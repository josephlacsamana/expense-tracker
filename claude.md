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
| **Auth** | PIN-based login (Joseph / Rowena), stored in localStorage |
| **Storage** | localStorage for dev, Supabase planned for production |
| **Currency** | PHP (Philippine Peso, ₱) |

---

## Data Model

```
"expenses"   → [{id, amount, category, description, date, addedBy, createdAt}]
"categories" → ["Food", "Transport", "Bills", "Shopping", "Health", "Entertainment", "Subscriptions", "Other"]
"accounts"   → [{name, balance, type, updatedAt}]
"settings"   → {josephPin, rowenaPin}
"budgets"    → {Food: 5000, Transport: 3000, ...}
"recurring"  → [{id, amount, category, description, frequency, nextDate, addedBy}]
```

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
- [ ] Logout option in Settings

**6b — Budget Limits**
- [ ] Set a **general monthly budget** (e.g. P30,000/month total spending limit)
- [ ] Budget vs actual on dashboard with progress bar (green/yellow/red)
- [ ] Warning when approaching or exceeding the monthly budget
- [ ] **Optional:** per-category budget limits (e.g. Food: P5,000) — not required, just a nice-to-have
- [ ] Budget settings page in More tab

**6c — Recurring Expenses**
- [ ] Add recurring templates (Netflix, PLDT, Meralco, etc.)
- [ ] Frequency: monthly, weekly, yearly
- [ ] Auto-reminder or manual "apply recurring" button
- [ ] Edit/delete recurring templates in More tab

**6d — Budget vs Actual Chart**
- [ ] Bar chart comparing budget vs actual per category
- [ ] Color-coded: under (green), near limit (yellow), over (red)

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

**8b — AI Insights Better Styling & Charts**
- [ ] Improve spacing and typography for easier reading
- [ ] Add visual charts (recharts) where relevant in insights
- [ ] Better formatting: clear section headers, bullet points, spacing
- [ ] Polished and well-structured layout, not a wall of text

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

---

## Cost

| Tier | Details | Price |
|---|---|---|
| **Current (Vercel)** | Vercel free tier + Claude API | ~$3-10/month (API usage) |
| **Future (Supabase)** | + Supabase free tier for DB & auth | Same |

---

## Limitations

- No real bank integration — balances are manual entry only
- Image processing — receipt images sent to Claude API as base64
- Session-based auth — PIN checked on load, stored in React state
- No push notifications — browser-only app
