// Vercel serverless function — fetches live market intel from public APIs
// Aggregates: Google News RSS, SEC EDGAR, and financial data
// Requires: GOOGLE_CLIENT_ID (for auth), optionally NEWS_API_KEY

import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyAuth(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) throw new Error("Missing token");
  const ticket = await googleClient.verifyIdToken({
    idToken: auth.slice(7),
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (payload.hd !== "venturebuilder.vc") throw new Error("Domain not allowed");
  return payload;
}

// ── Google News RSS (no API key needed) ─────────────────────────────────────
async function fetchGoogleNews(query, count = 8) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  const res = await fetch(url);
  const xml = await res.text();

  // Simple XML parsing — extract <item> blocks
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < count) {
    const block = match[1];
    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}>(.*?)</${tag}>`));
      return m ? m[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1") : "";
    };
    items.push({
      title: get("title"),
      link: get("link"),
      pubDate: get("pubDate"),
      source: get("source"),
    });
  }
  return items;
}

// ── SEC EDGAR — recent company filings ──────────────────────────────────────
async function fetchSECFilings(ticker, count = 5) {
  // Use EDGAR full-text search API (no key needed)
  const url = `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(ticker)}%22&dateRange=custom&startdt=${getDateMonthsAgo(6)}&enddt=${getToday()}&forms=10-K,10-Q,8-K,DEF%2014A&from=0&size=${count}`;

  try {
    const res = await fetch("https://efts.sec.gov/LATEST/search-index?q=" + encodeURIComponent(`"${ticker}"`) + `&forms=10-K,10-Q,8-K&from=0&size=${count}`, {
      headers: { "User-Agent": "VentureBuilder/1.0 (billy@venturebuilder.vc)" },
    });
    if (!res.ok) {
      // Fallback to company search
      return await fetchSECByCompany(ticker, count);
    }
    const data = await res.json();
    return (data.hits?.hits || []).map(h => ({
      form: h._source?.form_type || h._source?.file_type || "Filing",
      company: h._source?.entity_name || ticker,
      date: h._source?.file_date || h._source?.period_of_report,
      description: h._source?.display_names?.[0] || h._source?.entity_name || "",
      url: h._id ? `https://www.sec.gov/Archives/edgar/data/${h._source?.entity_id}/${h._id}` : "",
    }));
  } catch {
    return await fetchSECByCompany(ticker, count);
  }
}

async function fetchSECByCompany(ticker, count = 5) {
  try {
    const cikRes = await fetch(`https://www.sec.gov/cgi-bin/browse-edgar?company=&CIK=${encodeURIComponent(ticker)}&type=10-K&dateb=&owner=include&count=${count}&search_text=&action=getcompany&output=atom`, {
      headers: { "User-Agent": "VentureBuilder/1.0 (billy@venturebuilder.vc)" },
    });
    const xml = await cikRes.text();
    const entries = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let m;
    while ((m = entryRegex.exec(xml)) !== null && entries.length < count) {
      const block = m[1];
      const get = (tag) => {
        const r = block.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`));
        return r ? r[1] : "";
      };
      const linkMatch = block.match(/<link[^>]*href="([^"]+)"/);
      entries.push({
        form: get("category") || "Filing",
        company: get("title"),
        date: get("updated")?.slice(0, 10),
        description: get("summary")?.slice(0, 200),
        url: linkMatch ? linkMatch[1] : "",
      });
    }
    return entries;
  } catch {
    return [];
  }
}

// ── Financial quote data (Yahoo Finance unofficial) ─────────────────────────
async function fetchStockQuote(ticker) {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=5d&interval=1d`, {
      headers: { "User-Agent": "VentureBuilder/1.0" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const closes = result.indicators?.quote?.[0]?.close || [];
    const prevClose = closes.length >= 2 ? closes[closes.length - 2] : meta.chartPreviousClose;
    const currentPrice = meta.regularMarketPrice;
    const change = currentPrice - (prevClose || currentPrice);
    const changePct = prevClose ? ((change / prevClose) * 100) : 0;

    return {
      ticker: meta.symbol,
      price: currentPrice,
      change: Math.round(change * 100) / 100,
      changePct: Math.round(changePct * 100) / 100,
      currency: meta.currency,
      marketCap: meta.marketCap || null,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
      exchange: meta.exchangeName,
    };
  } catch {
    return null;
  }
}

// ── Industry news feed ──────────────────────────────────────────────────────
async function fetchIndustryNews(sector = "energy oilfield services") {
  return fetchGoogleNews(`${sector} venture investment startup 2026`, 10);
}

// ── Funding/Deal news ───────────────────────────────────────────────────────
async function fetchFundingNews(query = "energy startup funding") {
  return fetchGoogleNews(`${query} series seed funding 2026`, 8);
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getDateMonthsAgo(months) {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

// ══════════════════════════════════════════════════════════════════════════════
// HANDLER
// ══════════════════════════════════════════════════════════════════════════════

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Auth
  try {
    await verifyAuth(req);
  } catch (err) {
    return res.status(403).json({ error: "Unauthorized: " + err.message });
  }

  const { action, ticker, query, sector } = req.body;

  try {
    switch (action) {
      case "company_news": {
        const news = await fetchGoogleNews(query || ticker, 8);
        return res.json({ news, fetchedAt: new Date().toISOString() });
      }

      case "sec_filings": {
        const filings = await fetchSECFilings(ticker, 5);
        return res.json({ filings, fetchedAt: new Date().toISOString() });
      }

      case "stock_quote": {
        const quote = await fetchStockQuote(ticker);
        return res.json({ quote, fetchedAt: new Date().toISOString() });
      }

      case "industry_news": {
        const news = await fetchIndustryNews(sector || "energy oilfield services");
        return res.json({ news, fetchedAt: new Date().toISOString() });
      }

      case "funding_news": {
        const news = await fetchFundingNews(query || "energy startup funding");
        return res.json({ news, fetchedAt: new Date().toISOString() });
      }

      case "company_full": {
        // Fetch everything for one company in parallel
        const [news, filings, quote] = await Promise.all([
          fetchGoogleNews(query || ticker, 6),
          fetchSECFilings(ticker, 5),
          fetchStockQuote(ticker),
        ]);
        return res.json({ news, filings, quote, fetchedAt: new Date().toISOString() });
      }

      case "market_overview": {
        // Broad market intel — industry news + funding news + key tickers
        const tickers = ["BKR", "SLB", "HAL", "XOM", "CVX"];
        const [industryNews, fundingNews, ...quotes] = await Promise.all([
          fetchIndustryNews(sector),
          fetchFundingNews("oilfield energy startup funding"),
          ...tickers.map(t => fetchStockQuote(t)),
        ]);
        return res.json({
          industryNews,
          fundingNews,
          quotes: tickers.map((t, i) => ({ ticker: t, ...(quotes[i] || {}) })).filter(q => q.price),
          fetchedAt: new Date().toISOString(),
        });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
