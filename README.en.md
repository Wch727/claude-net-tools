# Claude Code Net Tools

[中文](README.md)

Claude Code Net Tools is a local MCP server that gives Claude Code configurable web search, URL fetching, and content extraction tools.

## What Problem It Solves

When Claude Code is connected to external models/APIs, local proxies/VPNs, corporate proxies, or free search pages, built-in web search may be unavailable, unstable, or limited to official Claude accounts and specific model/tool combinations. This project moves web search and fetching into a local MCP tool layer:

- Uses your machine's network route, with explicit direct/proxy control.
- Tries free HTML/RSS search fallbacks such as DuckDuckGo, Bing, Sogou, and 360.
- Supports optional API providers such as Brave, Kimi/Moonshot, MiniMax, Serper, and Tavily.
- Basic search preserves provider order by default and does not pretend to understand the user's intent.
- Assisted filtering, reranking, and redirect resolution are explicit opt-in behavior.
- Recommended workflow: let the LLM rewrite the natural-language question into strong search queries, then let the tool execute them.
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

- Poppler `pdftotext`: needed by `fetch_pdf` to extract PDF text. Put `pdftotext` on PATH, or set `CLAUDE_NET_PDFTOTEXT` to the executable path. If local `pdftotext` is broken, run `pdf_status` first; you can also pass `extractor: "none"` to `fetch_pdf` to verify PDF downloads without text extraction.
- Search API keys: pass them only through environment variables, such as `BRAVE_SEARCH_API_KEY`, `KIMI_API_KEY`, `MINIMAX_API_KEY`, `SERPER_API_KEY`, and `TAVILY_API_KEY`.
- Local proxy/VPN: set `CLAUDE_NET_PROXY`, for example `http://127.0.0.1:7890` or `socks5h://127.0.0.1:7890`. Set it to `direct` to force direct access.

### Python Build (Fallback)

Required:

- Python 3.10 or newer. Check with `python --version`.

Not required:

- The default Python build does not need `pip install`. It uses only the Python standard library.

Optional:

- Poppler `pdftotext`: needed by `fetch_pdf`. If the local command fails, use `pdf_status` to check the path and version, or pass `extractor: "none"` to skip text extraction.
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

Equivalent manual MCP config:

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
| `CLAUDE_NET_DISABLED_PROVIDERS` | Disable providers, for example `duckduckgo,bing_html`. |
| `CLAUDE_NET_PROVIDER_FAIL_LIMIT` | Consecutive provider failures before automatic skip. Default `3`. |
| `CLAUDE_NET_CURL` | Custom curl path for the Node/curl build. |
| `CLAUDE_NET_PDFTOTEXT` | Custom `pdftotext` path. |
| `CLAUDE_NET_COOKIE_DIR` | Directory for cookie jars. |
| `BRAVE_SEARCH_API_KEY` | Brave Search API. |
| `KIMI_API_KEY` / `MOONSHOT_API_KEY` | Kimi/Moonshot web search. |
| `MINIMAX_API_KEY` | MiniMax web search. |
| `SERPER_API_KEY` / `GOOGLE_SERPER_API_KEY` | Serper API. |
| `TAVILY_API_KEY` | Tavily API. |
| `CLAUDE_NET_DEBUG` | Print more detailed error messages. |

## Configure API Keys

API keys are read only from environment variables. Do not write them into code, README files, commit history, or public repositories. `your_..._key` in the examples is only a placeholder.

Supported search API providers and environment variables:

| Provider | Required environment variable | Optional environment variables |
| --- | --- | --- |
| `kimi` | `KIMI_API_KEY` or `MOONSHOT_API_KEY` | `KIMI_BASE_URL`, `KIMI_MODEL` |
| `minimax` | `MINIMAX_API_KEY` | `MINIMAX_BASE_URL`, `MINIMAX_MODEL`, `MINIMAX_WEB_SEARCH_TOOL` |
| `brave` | `BRAVE_SEARCH_API_KEY` | - |
| `serper` | `SERPER_API_KEY` or `GOOGLE_SERPER_API_KEY` | - |
| `tavily` | `TAVILY_API_KEY` | - |

Important: setting a key alone does not force paid API usage. The default provider order still favors free providers: non-CJK queries use `duckduckgo,bing_rss,bing_html`, and CJK queries use `duckduckgo,sogou,so360,bing_html,bing_rss`. To use API providers, set `CLAUDE_NET_SEARCH_PROVIDERS` or pass `providers` in a single tool call.

### Option 1: Pass env vars through Claude Code MCP config

```powershell
claude mcp add net-tools -e KIMI_API_KEY=your_kimi_key -e CLAUDE_NET_SEARCH_PROVIDERS=kimi,duckduckgo,bing_rss -- node C:\path\to\claude-code-net-tools\claude_net_mcp.mjs
```

MiniMax example:

```powershell
claude mcp add net-tools -e MINIMAX_API_KEY=your_minimax_key -e CLAUDE_NET_SEARCH_PROVIDERS=minimax,duckduckgo,bing_rss -- node C:\path\to\claude-code-net-tools\claude_net_mcp.mjs
```

This stores the key in Claude Code's local MCP configuration. It is convenient for a personal machine, but do not commit config files that contain keys.

### Option 2: Set temporary vars in the current PowerShell window

```powershell
$env:KIMI_API_KEY = "your_kimi_key"
$env:MINIMAX_API_KEY = "your_minimax_key"
$env:CLAUDE_NET_SEARCH_PROVIDERS = "kimi,minimax,duckduckgo,bing_rss"
claude
```

This affects only the current PowerShell window and Claude Code sessions launched from it. Already-running Claude Code sessions usually need a restart.

### Option 3: Persist Windows user environment variables

```powershell
[Environment]::SetEnvironmentVariable("KIMI_API_KEY", "your_kimi_key", "User")
[Environment]::SetEnvironmentVariable("MINIMAX_API_KEY", "your_minimax_key", "User")
[Environment]::SetEnvironmentVariable("CLAUDE_NET_SEARCH_PROVIDERS", "kimi,minimax,duckduckgo,bing_rss", "User")
```

Restart PowerShell and Claude Code after setting them. To delete a key, set it to `$null`:

```powershell
[Environment]::SetEnvironmentVariable("KIMI_API_KEY", $null, "User")
```

### Option 4: Manual MCP JSON config

```json
{
  "mcpServers": {
    "net-tools": {
      "command": "node",
      "args": ["C:\\path\\to\\claude-code-net-tools\\claude_net_mcp.mjs"],
      "env": {
        "KIMI_API_KEY": "your_kimi_key",
        "MINIMAX_API_KEY": "your_minimax_key",
        "CLAUDE_NET_SEARCH_PROVIDERS": "kimi,minimax,duckduckgo,bing_rss"
      }
    }
  }
}
```

If you do not want paid API providers by default, do not put `kimi`, `minimax`, `brave`, `serper`, or `tavily` in `CLAUDE_NET_SEARCH_PROVIDERS`. Ask Claude Code to pass `providers: ["kimi"]` or `providers: ["minimax"]` only when needed.

After configuration, run `net-tools search_status` in Claude Code to see which providers are configured. Use `live: true` when you want an actual health probe.

## Recommended Claude Code Prompt

This MCP server executes search and fetching only. Understanding the user question, rewriting queries, and judging source quality should stay with the model running in Claude Code.

The repository provides copyable prompts in both Chinese and English:

- Chinese: [`prompts/claude-code-search.zh.md`](prompts/claude-code-search.zh.md)
- English: [`prompts/claude-code-search.en.md`](prompts/claude-code-search.en.md)

Prompt replacement instructions are also available in both languages:

- Chinese guide: [`prompts/README.zh.md`](prompts/README.zh.md)
- English guide: [`prompts/README.en.md`](prompts/README.en.md)

Quick replacement: choose the Chinese or English prompt, copy the full `text` code block, and paste it into the Claude Code instruction surface your setup actually loads, such as project `CLAUDE.md`, global memory/custom instructions, or the first session message for quick testing. If your MCP server name is not `net-tools`, replace `net-tools` in the prompt with the actual server name. After editing a prompt file in this repository, copy it into Claude Code again and restart/reload the session; repository prompt files do not become active automatically.

## Tools

- `proxy_status`: shows the current route, provider order, and important environment-variable status.
- `pdf_status`: checks the local `pdftotext` path, version, and executable status.
- `search_status`: shows provider key configuration, disabled status, recent success/failure counts, and optional live probes.
- `search_web`: basic web search. By default it only handles provider fallback, deduplication, and domain filters; it does not expand queries, apply strict relevance filtering, rerank results, or actively probe redirect final URLs. Let the LLM write the query first, then use this tool for source material.
- `search_web_focused`: explicit assisted web search with cleaned core-query expansion, strict relevance filtering, optional reranking, and optional redirect resolution. Use it only when basic search is too noisy.
- `scholar_search`: specialized paper search through Semantic Scholar, Crossref, and arXiv. For acronyms, the LLM should expand the query with the full name, authors, or paper ID first; the tool also fetches extra early arXiv candidates for short acronym queries.
- `package_search`: specialized developer package and repository search through npm, PyPI, and GitHub repositories.
- `fetch_url`: fetches a URL with `GET/POST/PUT/PATCH/DELETE`, custom headers, cookies, cookie jars, request bodies, and `auto/readable/text/markdown/raw` extraction modes; `auto` uses readable main-content extraction for HTML.
- `extract_links`: fetches a page and extracts normalized links, optionally limited to the same domain.
- `fetch_json`: fetches a JSON endpoint and pretty-prints parsed JSON.
- `fetch_rss`: fetches RSS/Atom feeds and returns feed entries.
- `fetch_pdf`: downloads a PDF and extracts text when `pdftotext` is installed; supports `extractor: auto|pdftotext|none`.

## Examples

In Claude Code, you can ask:

```text
Use net-tools proxy_status.
Use net-tools pdf_status.
Use net-tools search_status.
Use net-tools search_web to search "Claude Code MCP" count 5.
Use net-tools fetch_url to read https://example.com with extract readable.
Use net-tools fetch_url to read https://example.com as markdown.
Use net-tools extract_links to list same-domain links from https://example.com.
Use net-tools fetch_json to read https://api.github.com/repos/Wch727/claude-code-net-tools.
Use net-tools fetch_rss to read https://github.blog/feed/ count 5.
Use net-tools scholar_search to search "Attention Is All You Need" count 5.
Use net-tools scholar_search to search "BERT" count 3.
Use net-tools package_search to search "playwright" ecosystem npm count 5.
Use net-tools search_web to search "Attention Is All You Need arxiv pdf" count 5, then choose the official arXiv result and use net-tools fetch_pdf to read the PDF.
```

You can also specify providers directly in MCP arguments:

```json
{
  "query": "BERT Bidirectional Encoder Representations from Transformers Google arXiv 1810.04805",
  "count": 5,
  "providers": ["duckduckgo", "bing_rss"]
}
```

If basic search is too noisy, explicitly use assisted search:

```json
{
  "query": "BERT Bidirectional Encoder Representations from Transformers Google arXiv 1810.04805",
  "count": 5,
  "providers": ["duckduckgo", "bing_rss"],
  "strict_relevance": true,
  "rerank": false,
  "resolve_redirects": false
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