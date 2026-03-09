export default function handler(req, res) {
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0E0E14"/>
      <stop offset="100%" stop-color="#1A1A2E"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F5B526"/>
      <stop offset="100%" stop-color="#D4960E"/>
    </linearGradient>
    <radialGradient id="glow1" cx="85%" cy="15%" r="40%">
      <stop offset="0%" stop-color="rgba(245,181,38,0.12)"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <radialGradient id="glow2" cx="15%" cy="85%" r="35%">
      <stop offset="0%" stop-color="rgba(245,181,38,0.08)"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow1)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>
  <rect x="480" y="155" width="80" height="80" rx="20" fill="url(#gold)"/>
  <text x="520" y="210" font-family="system-ui,-apple-system,sans-serif" font-size="40" font-weight="800" fill="#1A1A2E" text-anchor="middle" letter-spacing="-2">RX</text>
  <text x="600" y="210" font-family="system-ui,-apple-system,sans-serif" font-size="56" font-weight="800" fill="#E0D5C0" text-anchor="start" letter-spacing="-1">R<tspan fill="#F5B526">X</tspan>penses</text>
  <text x="600" y="290" font-family="system-ui,-apple-system,sans-serif" font-size="26" font-weight="600" fill="#8A8078" text-anchor="middle">Free AI-Powered Expense Tracker for Couples</text>
  <rect x="228" y="340" width="120" height="40" rx="12" fill="rgba(245,181,38,0.12)" stroke="rgba(245,181,38,0.25)" stroke-width="1"/>
  <text x="288" y="366" font-family="system-ui,-apple-system,sans-serif" font-size="18" font-weight="600" fill="#F5B526" text-anchor="middle">AI Chat</text>
  <rect x="368" y="340" width="180" height="40" rx="12" fill="rgba(245,181,38,0.12)" stroke="rgba(245,181,38,0.25)" stroke-width="1"/>
  <text x="458" y="366" font-family="system-ui,-apple-system,sans-serif" font-size="18" font-weight="600" fill="#F5B526" text-anchor="middle">Receipt Scanning</text>
  <rect x="568" y="340" width="190" height="40" rx="12" fill="rgba(245,181,38,0.12)" stroke="rgba(245,181,38,0.25)" stroke-width="1"/>
  <text x="663" y="366" font-family="system-ui,-apple-system,sans-serif" font-size="18" font-weight="600" fill="#F5B526" text-anchor="middle">Shared Tracking</text>
  <rect x="778" y="340" width="120" height="40" rx="12" fill="rgba(245,181,38,0.12)" stroke="rgba(245,181,38,0.25)" stroke-width="1"/>
  <text x="838" y="366" font-family="system-ui,-apple-system,sans-serif" font-size="18" font-weight="600" fill="#F5B526" text-anchor="middle">Budgets</text>
  <text x="600" y="590" font-family="system-ui,-apple-system,sans-serif" font-size="20" font-weight="600" fill="#4A4540" text-anchor="middle">rxpenses.com</text>
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
  return res.status(200).send(svg);
}
