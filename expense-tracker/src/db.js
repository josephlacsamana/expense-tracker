import { supabase } from "./supabase";

export const sb = {
  // Load all data from Supabase
  loadAll: async (hid) => {
    const [eR, aR, rR, cR, bR, gR, pR, dR, dpR] = await Promise.all([
      supabase.from("expenses").select("*").eq("household_id", hid).order("created_at", { ascending: false }),
      supabase.from("accounts").select("*").eq("household_id", hid),
      supabase.from("recurring").select("*").eq("household_id", hid),
      supabase.from("categories").select("*").eq("household_id", hid).order("sort_order"),
      supabase.from("settings").select("*").eq("key", "budgets").eq("household_id", hid).maybeSingle(),
      supabase.from("settings").select("*").eq("key", "genBudget").eq("household_id", hid).maybeSingle(),
      supabase.from("settings").select("*").eq("key", "pins").eq("household_id", hid).maybeSingle(),
      supabase.from("debts").select("*").eq("household_id", hid).order("created_at", { ascending: false }),
      supabase.from("debt_payments").select("*").eq("household_id", hid).order("created_at", { ascending: false }),
    ]);
    return {
      expenses: eR.data?.map(r => ({ id: r.id, amount: Number(r.amount), category: r.category, description: r.description || "", date: r.date, addedBy: r.added_by, accountId: r.account_id || null, createdAt: r.created_at })) || [],
      accounts: aR.data?.map(r => ({ id: r.id, name: r.name, balance: Number(r.balance), type: r.type, updatedAt: r.updated_at })) || [],
      recurring: rR.data?.map(r => ({ id: r.id, amount: Number(r.amount), category: r.category, description: r.description || "", frequency: r.frequency, nextDate: r.next_date, addedBy: r.added_by, createdAt: r.created_at })) || [],
      categories: cR.data?.length > 0 ? cR.data.map(r => r.name) : null,
      budgets: bR.data?.value || null,
      genBudget: gR.data?.value ?? null,
      pins: pR.data?.value || null,
      debts: dR.data?.map(r => ({ id: r.id, name: r.name, type: r.type, totalAmount: Number(r.total_amount), currentBalance: Number(r.current_balance), dueDate: r.due_date ? Number(r.due_date) : null, interestRate: Number(r.interest_rate || 0), minPayment: Number(r.min_payment || 0), addedBy: r.added_by, createdAt: r.created_at, updatedAt: r.updated_at })) || [],
      debtPayments: dpR.data?.map(r => ({ id: r.id, debtId: r.debt_id, amount: Number(r.amount), date: r.date, newBalance: Number(r.new_balance), createdAt: r.created_at })) || [],
    };
  },
  // Expenses
  upsertExpense: async (e, hid) => {
    await supabase.from("expenses").upsert({ id: e.id, amount: e.amount, category: e.category, description: e.description || "", date: e.date, added_by: e.addedBy, account_id: e.accountId || null, household_id: hid, created_at: e.createdAt });
  },
  upsertExpenses: async (arr, hid) => {
    if (!arr.length) return;
    await supabase.from("expenses").upsert(arr.map(e => ({ id: e.id, amount: e.amount, category: e.category, description: e.description || "", date: e.date, added_by: e.addedBy, account_id: e.accountId || null, household_id: hid, created_at: e.createdAt })));
  },
  deleteExpense: async (id, hid) => { await supabase.from("expenses").delete().eq("id", id).eq("household_id", hid); },
  deleteAllExpenses: async (hid) => { await supabase.from("expenses").delete().eq("household_id", hid); },
  // Accounts
  upsertAccount: async (a, hid) => {
    await supabase.from("accounts").upsert({ id: a.id, name: a.name, balance: a.balance, type: a.type, household_id: hid, updated_at: a.updatedAt });
  },
  deleteAccount: async (id, hid) => { await supabase.from("accounts").delete().eq("id", id).eq("household_id", hid); },
  deleteAllAccounts: async (hid) => { await supabase.from("accounts").delete().eq("household_id", hid); },
  // Recurring
  upsertRecurring: async (r, hid) => {
    await supabase.from("recurring").upsert({ id: r.id, amount: r.amount, category: r.category, description: r.description || "", frequency: r.frequency, next_date: r.nextDate, added_by: r.addedBy, household_id: hid, created_at: r.createdAt });
  },
  upsertRecurringBulk: async (arr, hid) => {
    if (!arr.length) return;
    await supabase.from("recurring").upsert(arr.map(r => ({ id: r.id, amount: r.amount, category: r.category, description: r.description || "", frequency: r.frequency, next_date: r.nextDate, added_by: r.addedBy, household_id: hid, created_at: r.createdAt })));
  },
  deleteRecurring: async (id, hid) => { await supabase.from("recurring").delete().eq("id", id).eq("household_id", hid); },
  deleteAllRecurring: async (hid) => { await supabase.from("recurring").delete().eq("household_id", hid); },
  // Debts
  upsertDebt: async (d, hid) => {
    await supabase.from("debts").upsert({ id: d.id, name: d.name, type: d.type, total_amount: d.totalAmount, current_balance: d.currentBalance, due_date: d.dueDate, interest_rate: d.interestRate, min_payment: d.minPayment, added_by: d.addedBy, household_id: hid, created_at: d.createdAt, updated_at: d.updatedAt });
  },
  deleteDebt: async (id, hid) => { await supabase.from("debt_payments").delete().eq("debt_id", id).eq("household_id", hid); await supabase.from("debts").delete().eq("id", id).eq("household_id", hid); },
  deleteAllDebts: async (hid) => { await supabase.from("debt_payments").delete().eq("household_id", hid); await supabase.from("debts").delete().eq("household_id", hid); },
  upsertDebtPayment: async (p, hid) => {
    await supabase.from("debt_payments").upsert({ id: p.id, debt_id: p.debtId, amount: p.amount, date: p.date, new_balance: p.newBalance, household_id: hid, created_at: p.createdAt });
  },
  // Account History
  loadAccountHistory: async (hid) => {
    const { data } = await supabase.from("account_history").select("*").eq("household_id", hid).order("created_at", { ascending: false });
    return data?.map(r => ({ id: r.id, accountId: r.account_id, oldBalance: Number(r.old_balance), newBalance: Number(r.new_balance), change: Number(r.change_amount), reason: r.reason, description: r.description || "", createdAt: r.created_at })) || [];
  },
  upsertAccountHistory: async (h, hid) => {
    await supabase.from("account_history").upsert({ id: h.id, account_id: h.accountId, old_balance: h.oldBalance, new_balance: h.newBalance, change_amount: h.change, reason: h.reason, description: h.description || "", household_id: hid, created_at: h.createdAt });
  },
  deleteAccountHistoryByAccount: async (accountId, hid) => {
    await supabase.from("account_history").delete().eq("account_id", accountId).eq("household_id", hid);
  },
  deleteAllAccountHistory: async (hid) => { await supabase.from("account_history").delete().eq("household_id", hid); },
  // Categories
  saveCategories: async (cats, hid) => {
    await supabase.from("categories").delete().eq("household_id", hid);
    if (cats.length > 0) await supabase.from("categories").insert(cats.map((c, i) => ({ name: c, sort_order: i, household_id: hid })));
  },
  // Settings (key-value)
  saveSetting: async (key, value, hid) => {
    await supabase.from("settings").upsert({ key, value, household_id: hid });
  },
  clearAllSettings: async (hid) => { await supabase.from("settings").delete().eq("household_id", hid); },
  // Insights
  loadInsights: async (hid) => {
    const { data } = await supabase.from("insights").select("*").eq("household_id", hid).order("created_at", { ascending: false }).limit(20);
    return data?.map(r => ({ id: r.id, period: r.period, data: r.data, createdAt: r.created_at })) || [];
  },
  upsertInsight: async (ins, hid) => {
    await supabase.from("insights").upsert({ id: ins.id, household_id: hid, period: ins.period, data: ins.data, created_at: ins.createdAt });
  },
  deleteInsight: async (id, hid) => { await supabase.from("insights").delete().eq("id", id).eq("household_id", hid); },
  deleteAllInsights: async (hid) => { await supabase.from("insights").delete().eq("household_id", hid); },
  // Migrate localStorage → Supabase (one-time)
  migrate: async (expenses, accounts, recurring, categories, budgets, genBudget, pins, hid) => {
    const ops = [];
    if (expenses.length) ops.push(sb.upsertExpenses(expenses, hid));
    if (accounts.length) ops.push(supabase.from("accounts").upsert(accounts.map(a => ({ id: a.id, name: a.name, balance: a.balance, type: a.type, household_id: hid, updated_at: a.updatedAt }))));
    if (recurring.length) ops.push(sb.upsertRecurringBulk(recurring, hid));
    if (categories.length) ops.push(sb.saveCategories(categories, hid));
    if (budgets) ops.push(sb.saveSetting("budgets", budgets, hid));
    if (genBudget) ops.push(sb.saveSetting("genBudget", genBudget, hid));
    if (pins) ops.push(sb.saveSetting("pins", pins, hid));
    await Promise.all(ops);
  },
};
