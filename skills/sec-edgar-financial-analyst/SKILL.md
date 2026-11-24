---
name: sec-edgar-financial-analyst
description: Query official US SEC EDGAR company filings (10-K, 10-Q, 8-K, Form 4 insider trades), run EFTS full-text filing searches, and extract normalized XBRL financial statements (revenue, operating income, net income, EPS, cash, assets, equity) using zero-proxy SEC APIs or the hosted SEC EDGAR Remote MCP server. Use when analyzing US public companies, earnings, filings, or financial metrics.
license: MIT
compatibility: Requires outbound HTTPS access with a descriptive SEC-compliant User-Agent header.
---

# SEC EDGAR Financial & Filings Analysis Skill

Follow these exact rules when fetching official US SEC EDGAR data so requests never get blocked or misparsed.

## Mandatory SEC API Rules

1. **Always send a descriptive `User-Agent` header** (e.g., `MyResearchApp/1.0 (contact@domain.com)`). Default Python/Node User-Agents receive HTTP 403 from `sec.gov`.
2. **Respect rate spacing:** Stay well below 10 requests/second (200ms polite delay between calls).
3. **Resolve Ticker → 10-Digit Zero-Padded CIK:**
   - Fetch `https://www.sec.gov/files/company_tickers.json` and pad `cik_str` to 10 digits (e.g., AAPL → `0000320193`).
4. **Core Official Endpoints:**
   - **Recent Filings:** `https://data.sec.gov/submissions/CIK{cik10}.json` (build direct archive links via `https://www.sec.gov/Archives/edgar/data/{intCik}/{accNoNoDash}/{primaryDocument}`)
   - **Full-Text Search (EFTS):** `https://efts.sec.gov/LATEST/search-index?q=<PHRASE>&forms=10-K,8-K`
   - **XBRL Financials:** `https://data.sec.gov/api/xbrl/companyfacts/CIK{cik10}.json`
5. **Critical XBRL Pitfall to Avoid:**
   - Do **not** rely on a single US-GAAP revenue tag. Merge across `Revenues`, `RevenueFromContractWithCustomerExcludingAssessedTax`, `SalesRevenueNet`, and `SalesRevenueGoodsNet`.
   - For annual `10-K` duration metrics (Revenue, Net Income, EPS), filter entries to duration ≥ 300 days and key by period `end` date + `fp` so prior-year comparative rows never overwrite current fiscal year values.

## Hosted Remote MCP Shortcut

To skip custom XBRL parsing entirely, call the hosted Streamable HTTP MCP server:
- Endpoint: `https://shawn1905--sec-edgar-filings-mcp.apify.actor/mcp`
- Tools: `get_sec_company_filings`, `search_sec_filings`, `get_sec_company_financials`
- Listing: https://apify.com/shawn1905/sec-edgar-filings-mcp
