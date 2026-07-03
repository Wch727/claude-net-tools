# Claude Code Net Tools

[中文](README.md)

Claude Code Net Tools is a local MCP server that gives Claude Code and other MCP clients configurable web search, URL fetching, and content extraction tools.

## What Problem It Solves

When Claude Code is connected to external models/APIs, local proxies/VPNs, corporate proxies, or free search pages, built-in web search may be unavailable, unstable, or limited to official Claude accounts and specific model/tool combinations. This project moves web search and fetching into a local MCP tool layer:

- Uses your machine's network route, with explicit direct/proxy control.
- Tries free HTML/RSS search fallbacks such as DuckDuckGo, Bing, Sogou, and 360.
- Supports optional API providers such as Brave, Kimi/Moonshot, MiniMax, Serper, and Tavily.
- Provides webpage, link, JSON, RSS/Atom, and PDF text extraction tools.
- Reads API keys only from environment variables. Do not commit keys to the repository.

Use it in compliance with local laws, site rules, and your organization's security requirements. This tool provides technical access only; it does not bypass login, captcha, or authorization controls.

## Requirements

Clone the project first:

```powershell
git clone https://github.com/Wch727/claude-code-net-tools.git
cd claude-code-net-tools
```

You can also download and unzip the repository from GitHub.

### Node/curl Build (Recommended)

Required:

- Node.js 20 or newer. Check with `node -v`.
- curl/curl.exe. Windows 10/11 usually includes `curl.exe`; check with `curl.exe --version`. On macOS/Linux, check with `curl --version`.

Not required:

- The default Node/curl build does not need `npm install`. It uses only Node built-in modules and the system curl binary.

Optional:

- Poppler `pdftotext`: needed by `fetch_pdf` to extract PDF text. Put `pdftotext` on PATH, or set `CLAUDE_NET_PDFTOTEXT` to the executable path.
- Search API keys: pass them only through environment variables, such as `BRAVE_SEARCH_API_KEY`, `KIMI_API_KEY`, `MINIMAX_API_KEY`, `SERPER_API_KEY`, and `TAVILY_API_KEY`.
- Local proxy/VPN: set `CLAUDE_NET_PROXY`, for example `http://127.0.0.1:7890` or `socks5h://127.0.0.1:7890`. Set it to `direct` to force direct access.

### Python Build (Fallback)

Required:

- Python 3.10 or newer. Check with `python --version`.

Not required:

- The default Python build does not need `pip install`. It uses only the Python standard library.

Optional:

- Poppler `pdftotext`: needed by `fetch_pdf`.
- Search API keys: same as the Node/curl build, passed through environment variables.
- HTTP(S) proxy: supported by Python's standard library. SOCKS proxies are not part of the standard library, so use the Node/curl build for SOCKS.

## Add To Claude Code

Node/curl build:

```powershell
claude mcp add net-tools node C:\path\to\claude-code-net-tools\claude_net_mcp.mjs
```

Python build:

```powershell
claude mcp add net-tools-py python C:\path\to\claude-code-net-tools\claude_net_mcp.py
```

Other MCP clients can use an equivalent config:

```json
{
  "mcpServers": {
    "net-tools": {
      "command": "node",
      "args": ["C:\\path\\to\\claude-code-net-tools\\claude_net_mcp.mjs"],
      "env": {
        "CLAUDE_NET_PROXY": "http://127.0.0.1:7890"
      }
    }
  }
}
```

If you do not need a proxy, remove `env` or set `CLAUDE_NET_PROXY` to `direct`.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `CLAUDE_NET_PROXY` | Force the route. Supports `http://`, `https://`, `socks5h://` in the Node/curl build, or `direct`. |
| `CLAUDE_NET_HTTP_PROXY` / `HTTPS_PROXY` / `HTTP_PROXY` | Proxy fallback when `CLAUDE_NET_PROXY` is not set. |
| `CLAUDE_NET_SEARCH_PROVIDERS` | Override provider order, for example `kimi,minimax,duckduckgo,bing_rss`. |
| `CLAUDE_NET_CURL` | Custom curl path for the Node/curl build. |
| `CLAUDE_NET_PDFTOTEXT` | Custom `pdftotext` path. |
| `CLAUDE_NET_COOKIE_DIR` | Directory for cookie jars. |
| `BRAVE_SEARCH_API_KEY` | Brave Search API. |
| `KIMI_API_KEY` / `MOONSHOT_API_KEY` | Kimi/Moonshot web search. |
| `MINIMAX_API_KEY` | MiniMax web search. |
| `SERPER_API_KEY` / `GOOGLE_SERPER_API_KEY` | Serper API. |
| `TAVILY_API_KEY` | Tavily API. |
| `CLAUDE_NET_DEBUG` | Print more detailed error messages. |

## Tools

- `proxy_status`: shows the current route, provider order, and important environment-variable status.
- `search_web`: searches the web. By default it does not apply heuristic reranking; it only deduplicates, applies basic relevance filtering, and honors domain filters. Pass `rerank: true` if you want heuristic reranking.
- `fetch_url`: fetches a URL with `GET/POST/PUT/PATCH/DELETE`, custom headers, cookies, cookie jars, request bodies, and `auto/text/markdown/raw` extraction modes.
- `extract_links`: fetches a page and extracts normalized links, optionally limited to the same domain.
- `fetch_json`: fetches a JSON endpoint and pretty-prints parsed JSON.
- `fetch_rss`: fetches RSS/Atom feeds and returns feed entries.
- `fetch_pdf`: downloads a PDF and extracts text when `pdftotext` is installed.

## Examples

In Claude Code, you can ask:

```text
Use net-tools proxy_status.
Use net-tools search_web to search "Claude Code MCP" count 5.
Use net-tools fetch_url to read https://example.com as markdown.
Use net-tools extract_links to list same-domain links from https://example.com.
Use net-tools fetch_json to read https://api.github.com/repos/Wch727/claude-code-net-tools.
Use net-tools fetch_rss to read https://github.blog/feed/ count 5.
Use net-tools search_web to search "Attention Is All You Need arxiv pdf" count 5, then choose the official arXiv result and use net-tools fetch_pdf to read the PDF.
```

You can also specify providers directly in MCP arguments:

```json
{
  "query": "Claude Code MCP",
  "count": 5,
  "providers": ["duckduckgo", "bing_rss"],
  "rerank": false
}
```

## Notes And Limits

This is not a full browser. It does not execute JavaScript, keep browser login sessions, or solve captchas. For dynamic or login-only pages, pair it later with a browser automation MCP such as Playwright/Chromium.

The current version is meant for search, public page reading, API/JSON/RSS fetching, and PDF text extraction. Future additions can include:

- A Playwright browser-rendering mode for JavaScript-heavy pages.
- Browser cookie import or session bridging.
- OCR, screenshots, and structured page extraction.
- More search providers and clearer provider failure reporting.

## Development Check

```powershell
npm run check
```

This checks the Node build syntax and compiles the Python build. It does not download dependencies.