import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

async function main() {
    const child = spawn('node', ['dist/index.js'], { stdio: ['pipe', 'pipe', 'inherit'] });
    const send = (msg: unknown) => child.stdin.write(JSON.stringify(msg) + '\n');

    const lines: string[] = [];
    let buf = '';
    const waitLine = () =>
        new Promise<Record<string, any>>((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('Timeout waiting for MCP response')), 15000);
            const check = () => {
                if (lines.length > 0) {
                    clearTimeout(timer);
                    resolve(JSON.parse(lines.shift()!));
                }
            };
            child.stdout.on('data', (chunk) => {
                buf += chunk.toString();
                let idx: number;
                while ((idx = buf.indexOf('\n')) !== -1) {
                    const line = buf.slice(0, idx).trim();
                    buf = buf.slice(idx + 1);
                    if (line) lines.push(line);
                }
                check();
            });
            check();
        });

    try {
        send({
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '1.0' } },
        });
        const initRes = await waitLine();
        assert.ok(initRes.result?.serverInfo?.name === 'zero-proxy-mcp-suite');

        send({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} });
        send({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
        const listRes = await waitLine();
        const names = listRes.result.tools.map((t: any) => t.name);
        console.log('STDIO MCP tools:', names);
        assert.ok(names.includes('search_google_news_rss'));
        assert.ok(names.includes('list_hosted_mcp_servers'));
        assert.ok(names.includes('invoke_hosted_mcp_tool'));

        send({
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: { name: 'search_google_news_rss', arguments: { query: 'OpenAI', limit: 3 } },
        });
        const callRes = await waitLine();
        const payload = JSON.parse(callRes.result.content[0].text);
        console.log(`Live RSS test returned ${payload.count} articles. First: ${payload.articles[0]?.title?.slice(0, 60)}`);
        assert.ok(payload.count >= 1);
        console.log('ALL STDIO MCP TESTS PASSED!');
    } finally {
        child.kill();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
