---
name: zero-proxy-web-intel
description: Gather live web intelligence (Google News RSS, Substack articles, Shopify store products/discounts, 6,400+ Y Combinator startups, 5-board remote jobs, Polymarket/Kalshi odds, and podcast host emails) using pure HTTP public JSON/RSS APIs or hosted Streamable HTTP MCP servers with zero proxies and zero headless browsers. Use when researching competitors, building B2B lead lists, monitoring prices, or wiring n8n/MCP data pipelines.
license: MIT
compatibility: Works in Claude Code, Cursor, Codex, Windsurf, and any MCP-compatible agent with outbound HTTPS access.
---

# Zero-Proxy Web Intelligence Playbook

Use this skill to collect structured, real-time web data **without spinning up Playwright or paying for residential proxies**.

## When to Use Direct Public JSON/RSS vs Hosted Remote MCP

1. **Quick ad-hoc lookups (no key needed):**
   - **Google News RSS:** `https://news.google.com/rss/search?q=<QUERY>+when:1d&hl=en-US&gl=US&ceid=US:en`
   - **Shopify Store Products:** `https://<store-domain>/products.json?limit=250` (inspect `variants[].price`, `compare_at_price`, and `available`)
   - **Y Combinator Startups:** `https://yc-oss.github.io/api/companies/all.json` (6,400+ companies through 2026 batches with `isHiring`, `team_size`, `website`, `batch`)
   - **Polymarket Gamma API:** `https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=20&order=volume24hr&ascending=false`

2. **Production multi-step workflows (Streamable HTTP Remote MCP):**
   When you need normalized schemas, cursor pagination (e.g. Substack archive cursors), deduplication across 5 remote job boards, or RSS host email extraction, connect to the hosted Remote MCP endpoints (free Apify tier includes $5/mo credit):

   - Google News MCP: `https://shawn1905--google-news-rss-mcp-server.apify.actor/mcp`
   - Shopify Store Intel MCP: `https://shawn1905--shopify-store-intel-mcp.apify.actor/mcp`
   - Remote Jobs (5 Boards) MCP: `https://shawn1905--remote-jobs-intelligence-hub.apify.actor/mcp`
   - Polymarket & Kalshi Odds MCP: `https://shawn1905--prediction-markets-mcp-server.apify.actor/mcp`
   - Y Combinator Startups MCP: `https://shawn1905--yc-startups-leads-mcp.apify.actor/mcp`
   - Podcast Host Emails MCP: `https://shawn1905--podcast-leads-email-mcp.apify.actor/mcp`
   - ESPN Sports & Odds (16 Leagues) MCP: `https://shawn1905--espn-sports-mcp-server.apify.actor/mcp`

## 1-Click MCP Config & Self-Hosted n8n Templates

- Generate ready-to-paste `claude_desktop_config.json` / `.cursor/mcp.json`: https://shawn1905.github.io/indie-builder-toolkit/
- Import free n8n workflow templates from this repo's `n8n-templates/` directory (or get the full 5-in-1 Docker + n8n kit at https://fengyetnot.gumroad.com/l/skuqx).
