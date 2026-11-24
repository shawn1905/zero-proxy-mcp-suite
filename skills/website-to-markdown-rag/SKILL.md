---
name: website-to-markdown-rag
description: Convert webpages, documentation portals, and sitemap.xml files into clean boilerplate-free LLM/RAG Markdown with token estimates, or enrich company domains with business emails, phones, social links, and 25+ tech stack signals without headless browsers. Use when building RAG pipelines, indexing documentation, or enriching B2B lead domains.
license: MIT
compatibility: Works in Claude Code, Cursor, Codex, and MCP clients.
---

# Fast Website-to-Markdown & B2B Domain Enrichment Skill

Use this workflow to extract clean LLM context and B2B company intelligence from public websites using lightweight pure-HTTP requests.

## Clean RAG Extraction Checklist

1. **Prefer `sitemap.xml` over blind crawling:** Fetch `https://<domain>/sitemap.xml` (or `sitemap_index.xml`), filter by path prefix (e.g. `/docs`, `/blog`), and exclude static assets.
2. **Isolate semantic content before HTML-to-Markdown conversion:**
   - Target `<article>`, `<main>`, or `[role="main"]` first; fall back to `<body>` only when absent.
   - Strip `<nav>`, `<header>`, `<footer>`, `<aside>`, `<script>`, `<style>`, and cookie banners before converting to ATX Markdown.
   - Estimate LLM token budget as `Math.ceil(markdown.length / 4)`.
3. **B2B Domain Enrichment Pattern:**
   - Parse `mailto:`, `tel:`, `<script type="application/ld+json">` (`Organization` / `sameAs`), social anchors (LinkedIn, X, GitHub, YouTube), and tech-stack signatures (Shopify, Stripe, HubSpot, Next.js, Webflow, Cloudflare, Vercel, PostHog).
   - Follow up to 2 internal `/contact` or `/about` links while filtering placeholder emails (`example.com`, `wixpress.com`, image asset strings).

## Hosted Remote MCP Shortcuts

- **Fast Website & Docs to Markdown MCP ($1.50/1K pages):**
  `https://shawn1905--fast-website-to-markdown-mcp.apify.actor/mcp`
  Tools: `fetch_url_as_markdown`, `crawl_docs_to_markdown`, `discover_sitemap_urls`
- **Website Emails, Socials & Tech Stack MCP ($2.00/1K domains):**
  `https://shawn1905--website-contacts-tech-mcp.apify.actor/mcp`
  Tools: `extract_website_contacts_and_tech`, `batch_enrich_domains`
- **1-Click Config Generator:** https://shawn1905.github.io/indie-builder-toolkit/
