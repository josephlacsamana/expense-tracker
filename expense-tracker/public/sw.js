/* RXpenses Service Worker — local notification scheduler */

const CACHE_NAME = "rxpenses-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// Listen for messages from the app to check and notify
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CHECK_NOTIFICATIONS") {
    const { debts, recurring, today } = event.data;
    const notifications = [];

    // Check debts due within 3 days or overdue
    if (debts && debts.length) {
      const dayOfMonth = new Date(today).getDate();
      debts.forEach((d) => {
        if (d.currentBalance <= 0 || !d.dueDate) return;
        const diff = d.dueDate - dayOfMonth;
        if (diff === 0) {
          notifications.push({ title: "Debt due today", body: `${d.name} — payment due today` });
        } else if (diff > 0 && diff <= 3) {
          notifications.push({ title: "Upcoming payment", body: `${d.name} — due in ${diff} day${diff > 1 ? "s" : ""}` });
        } else if (diff < 0 && diff >= -3) {
          notifications.push({ title: "Overdue payment", body: `${d.name} — was due ${Math.abs(diff)} day${Math.abs(diff) > 1 ? "s" : ""} ago` });
        }
      });
    }

    // Check recurring expenses that are due
    if (recurring && recurring.length) {
      recurring.forEach((r) => {
        if (r.nextDate <= today) {
          notifications.push({ title: "Recurring expense due", body: `${r.description} — PHP ${r.amount}` });
        }
      });
    }

    // Send notifications (max 5 to avoid spam)
    notifications.slice(0, 5).forEach((n) => {
      self.registration.showNotification(n.title, {
        body: n.body,
        icon: "/favicon.svg",
        badge: "/favicon.svg",
        tag: n.title + n.body,
        renotify: false,
      });
    });
  }
});

// Handle notification click — open app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      if (clients.length > 0) {
        clients[0].focus();
      } else {
        self.clients.openWindow("/");
      }
    })
  );
});
