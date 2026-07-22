# Claude Code Net Tools

[中文](README.md)

Claude Code Net Tools is a local MCP server that gives Claude Code configurable web search, URL fetching, and content extraction tools.

## What Problem It Solves

When Claude Code is connected to external models/APIs, local proxies/VPNs, corporate proxies, or free search pages, built-in web search may be unavailable, unstable, or limited to official Claude accounts and specific model/tool combinations. This project moves search/fetching into a local MCP layer: Claude Code handles intent and query rewriting, while the local tool handles search execution, page fetching, JSON/RSS/PDF reading, and route/provider control through environment variables.

Use it in compliance with local laws, site rules, and your organization's security requirements. This tool provides technical access only; it does not bypass login, captcha, or authorization controls.

## Quick Start

Recommended Claude Code install:

```powershell
.\scripts\install-claude-code.ps1
```

macOS/Linux:

```bash
./scripts/install-claude-code.sh
```

With a proxy/VPN:

```powershell
.\scripts\install-claude-code.ps1 -Proxy http://127.0.0.1:7890
```

After installing, run the main diagnostic inside Claude Code:

```text
Use net-tools net_doctor live=true query="Claude Code MCP"
```

The recommended Node/curl build needs Node.js 20+ and system `curl`/`curl.exe`. It does not need `npm install` by default. Python fallback can also be added manually:

```powershell
claude mcp add net-tools-py python C:\path\to\claude-code-net-tools\claude_net_mcp.py
```

If you do not need a proxy, leave `CLAUDE_NET_PROXY` unset or set it to `direct`.

## Common Tools
- `net_doctor`: main Claude Code networking diagnostic; configuration-only by default, real search only with `live=true`.
- `search_web`: primary Claude Code web search; when available it queries two independent provider families and merges them round-robin in configured order without relevance reranking.
- `search_web_focused`: explicit assisted search for noisy results.
- `scholar_search`: paper search through Crossref, Semantic Scholar, and arXiv.
- `package_search`: npm, PyPI, and GitHub repository search.
- `fetch_url` / `extract_links` / `fetch_json` / `fetch_rss` / `fetch_pdf`: fetch webpages, links, JSON, RSS/Atom, and PDFs.
- `session_create` / `session_status` / `session_clear`: named HTTP sessions with default headers/cookies/referer and a dedicated cookie jar.
- `proxy_status` / `search_status` / `pdf_status`: focused diagnostics for routes, provider status, and PDF extraction.

## Browser Search (Optional)

`browser_search` and `browser_fetch` use local Playwright to open real search pages and read JavaScript-rendered content. `search_web`, `search_web_focused`, and `fetch_url` accept `browser=never|auto|always`; the default `auto` falls back when HTTP search returns too few results, too little independent-source coverage, or a page is blocked/JavaScript-only.

Check and install browser support before first use:

```powershell
npx --yes --package @playwright/cli playwright-cli --help
npx --yes --package @playwright/cli playwright-cli install-browser
```

Browser support is optional. Existing HTTP search, fetch, API, and PDF tools continue to work without it. Run `browser_status live=true` for a real browser diagnostic.

## Documentation

- [Configuration and API keys](docs/config.en.md)
- [Tools and limits](docs/tools.en.md)
- [Testing, smoke prompts, and development checks](docs/testing.en.md)
- [Claude Code search prompt guide](prompts/README.en.md)

## Minimal Verification

```powershell
npm test
```

`npm test` starts an offline fixture and tests both the Node/curl and Python builds through MCP JSON-RPC. It does not download dependencies.

When a Playwright browser is installed, run the real rendering smoke test too:

```powershell
npm run test:browser-live
```