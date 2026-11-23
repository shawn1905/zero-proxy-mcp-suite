#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const REMOTE_ENDPOINTS = {
    google_news: 'https://shawn1905--google-news-rss-mcp-server.apify.actor/mcp',
    espn_sports: 'https://shawn1905--espn-sports-mcp-server.apify.actor/mcp',
    remote_jobs: 'https://shawn1905--remote-jobs-intelligence-hub.apify.actor/mcp',
    prediction_markets: 'https://shawn1905--prediction-markets-mcp-server.apify.actor/mcp',
    shopify_intel: 'https://shawn1905--shopify-store-intel-mcp.apify.actor/mcp',
    podcast_leads: 'https://shawn1905--podcast-leads-email-mcp.apify.actor/mcp',
    yc_startups: 'https://shawn1905--yc-startups-leads-mcp.apify.actor/mcp',
    sec_edgar: 'https://shawn1905--sec-edgar-filings-mcp.apify.actor/mcp',
    website_contacts: 'https://shawn1905--website-contacts-tech-mcp.apify.actor/mcp',
} as const;

type ServerKey = keyof typeof REMOTE_ENDPOINTS;

async function callRemoteApifyMcp(serverKey: ServerKey, toolName: string, args: Record<string, unknown>) {
    const token = process.env.APIFY_TOKEN?.trim();
    const url = REMOTE_ENDPOINTS[serverKey];
    if (!token) {
        return {
            error: 'APIFY_TOKEN environment variable is required to invoke hosted Apify Standby MCP tools.',
            endpoint: url,
            getFreeToken: 'https://console.apify.com/settings/integrations',
        };
    }

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json, text/event-stream',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'tools/call',
            params: { name: toolName, arguments: args },
        }),
        signal: AbortSignal.timeout(45000),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Remote MCP ${serverKey} HTTP ${res.status}: ${text.slice(0, 300)}`);
    }

    const payload = (await res.json()) as {
        result?: { content?: Array<{ text?: string }> };
        error?: { message?: string };
    };
    if (payload.error) {
        throw new Error(payload.error.message || 'Remote MCP tool call failed');
    }
    const text = payload.result?.content?.[0]?.text;
    if (!text) return payload.result ?? {};
    try {
        return JSON.parse(text);
    } catch {
        return { text };
    }
}

function decodeXmlEntities(s: string): string {
    return s
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

async function fetchGoogleNewsRssLocal(query: string, country = 'US', language = 'en', limit = 10) {
    const ceid = `${country.toUpperCase()}:${language.toLowerCase()}`;
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${encodeURIComponent(language)}&gl=${encodeURIComponent(country.toUpperCase())}&ceid=${encodeURIComponent(ceid)}`;
    const res = await fetch(url, {
        headers: { 'User-Agent': 'ZeroProxyMCPSuite/1.1' },
        signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`Google News RSS HTTP ${res.status}`);
    const xml = await res.text();
    const items: Array<{ title: string; link: string; pubDate: string; source: string }> = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let m: RegExpExecArray | null;
    while ((m = itemRegex.exec(xml)) !== null && items.length < limit) {
        const block = m[1];
        const title = decodeXmlEntities((block.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
        const link = decodeXmlEntities((block.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '');
        const pubDate = decodeXmlEntities((block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '');
        const source = decodeXmlEntities((block.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1] || '');
        if (title) items.push({ title, link, pubDate, source });
    }
    return { query, country, count: items.length, articles: items };
}

export function createSuiteServer(): McpServer {
    const server = new McpServer({
        name: 'zero-proxy-mcp-suite',
        version: '1.1.0',
    });

    server.tool(
        'search_google_news_rss',
        'Search real-time Google News RSS headlines (works locally without any API key, zero proxies).',
        {
            query: z.string().min(1).describe('Search keyword or phrase, e.g. "AI agents" or "NVDA"'),
            country: z.string().optional().default('US').describe('2-letter ISO country code'),
            language: z.string().optional().default('en').describe('Language code'),
            limit: z.number().int().min(1).max(30).optional().default(10),
        },
        async ({ query, country, language, limit }) => {
            const data = await fetchGoogleNewsRssLocal(query, country, language, limit);
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        },
    );

    server.tool(
        'list_hosted_mcp_servers',
        'List all 9 hosted zero-proxy Streamable HTTP MCP endpoints in the Zero-Proxy MCP Suite along with their store URLs and capabilities.',
        {},
        async () => {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                suite: 'Zero-Proxy Remote MCP Suite',
                                configGenerator: 'https://shawn1905.github.io/indie-builder-toolkit/',
                                endpoints: REMOTE_ENDPOINTS,
                            },
                            null,
                            2,
                        ),
                    },
                ],
            };
        },
    );

    server.tool(
        'invoke_hosted_mcp_tool',
        'Proxy a tool call to any of the 9 hosted Zero-Proxy Apify Standby MCP servers (requires APIFY_TOKEN env var).',
        {
            server: z
                .enum([
                    'google_news',
                    'espn_sports',
                    'remote_jobs',
                    'prediction_markets',
                    'shopify_intel',
                    'podcast_leads',
                    'yc_startups',
                    'sec_edgar',
                    'website_contacts',
                ])
                .describe('Target hosted MCP server key'),
            toolName: z.string().min(1).describe('Remote MCP tool name to invoke'),
            argumentsJson: z.string().optional().default('{}').describe('JSON string of tool arguments'),
        },
        async ({ server: serverKey, toolName, argumentsJson }) => {
            let parsedArgs: Record<string, unknown> = {};
            try {
                parsedArgs = JSON.parse(argumentsJson || '{}') as Record<string, unknown>;
            } catch {
                throw new Error('argumentsJson must be valid JSON');
            }
            const data = await callRemoteApifyMcp(serverKey, toolName, parsedArgs);
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        },
    );

    return server;
}

const isDirectRun = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isDirectRun) {
    const server = createSuiteServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
