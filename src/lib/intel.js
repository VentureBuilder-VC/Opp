// Live Intel client — fetches real-time market data via /api/intel
// Works with both dev (direct) and production (proxy) modes

const isDev = import.meta.env.DEV;

let _authToken = null;
export const setIntelAuthToken = (token) => { _authToken = token; };

async function callIntel(body) {
  // In dev mode without proxy, skip (no local intel API)
  const url = isDev ? "/api/intel" : "/api/intel";

  const headers = { "Content-Type": "application/json" };
  if (_authToken) headers["Authorization"] = `Bearer ${_authToken}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Intel API error: ${res.status}`);
  }
  return res.json();
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function fetchCompanyNews(ticker, companyName) {
  return callIntel({ action: "company_news", ticker, query: `${companyName} oil gas energy` });
}

export async function fetchSECFilings(ticker) {
  return callIntel({ action: "sec_filings", ticker });
}

export async function fetchStockQuote(ticker) {
  return callIntel({ action: "stock_quote", ticker });
}

export async function fetchCompanyFull(ticker, companyName) {
  return callIntel({ action: "company_full", ticker, query: `${companyName} energy oilfield` });
}

export async function fetchIndustryNews(sector) {
  return callIntel({ action: "industry_news", sector });
}

export async function fetchFundingNews(query) {
  return callIntel({ action: "funding_news", query });
}

export async function fetchMarketOverview(sector) {
  return callIntel({ action: "market_overview", sector });
}
