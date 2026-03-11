export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");

  try {
    const ids = req.query.ids || "bitcoin,ethereum,solana,ripple,tether,binancecoin,cardano,dogecoin,polkadot,avalanche-2,chainlink,matic-network";
    const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=php,usd&include_24hr_change=true`);
    if (!r.ok) return res.status(r.status).json({ error: "CoinGecko API error" });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch crypto prices" });
  }
}
