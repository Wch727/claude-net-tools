# claude-code-net-tools

[中文](README.md) | English

`claude-code-net-tools` is a local stdio MCP server that gives Claude Code and other MCP clients controllable web search and URL fetching tools. It is built for setups where the provider-side Claude Code `WebSearch` tool is unavailable or unreliable, while the local machine can access the web directly or through a local VPN/proxy.

## Problem Solved

Claude Code's built-in `WebSearch` is a provider-side capability. Whether it works depends on the model account, API gateway, and provider support for server tools. When Claude Code is routed through a third-party gateway, an OpenAI-compatible endpoint, or a model that does not forward those tools, built-in search may disappear or fail.

This project moves the network step into a local MCP server:

- The agent calls MCP tools instead of relying on provider-side `WebSearch`.
- The local machine performs search and page fetching, using direct networking or a local VPN/proxy.
- Free fallback sources and paid search APIs can be combined.
- Two implementations expose the same tool surface: Node/curl and Python stdlib.
- Results include provider notes so failures and fallback behavior are visible.

External web content is returned only as source material. It does not represent the project's position. For factual, policy, legal, medical, or financial topics, verify with authoritative and official sources.

## Which Version Should I Use?

### Node/curl build: `claude_net_mcp.mjs`

Recommended for Windows users. It uses `curl.exe`, which handles local HTTP, SOCKS, and mixed proxy setups better.

```powershell
node --check .\claude_net_mcp.mjs
claude mcp add --scope user net-tools -- node C:\path\to\claude-code-net-tools\claude_net_mcp.mjs
```

If Claude Code cannot find `node`, use an absolute path:

```powershell
claude mcp add --scope user net-tools -- C:\Progra~1\nodejs\node.exe C:\path\to\claude-code-net-tools\claude_net_mcp.mjs
```

### Python build: `claude_net_mcp.py`

Useful when you want a no-npm stdlib fallback. Python stdlib does not support SOCKS proxies; use the Node/curl build for SOCKS.

```powershell
python -m py_compile .\claude_net_mcp.py
claude mcp add --scope user net-tools-py -- python C:\path\to\claude-code-net-tools\claude_net_mcp.py
```

## Tools

- `proxy_status`: show connection routes and provider order.
- `search_web`: search the web and return titles, URLs, snippets, providers, and diagnostics.
- `fetch_url`: fetch a URL and return extracted readable text.

`search_web` arguments:

- `query`: search query.
- `count`: number of results, 1 to 10.
- `providers`: optional provider order, for example `['duckduckgo', 'sogou', 'bing_html']`.
- `rerank`: optional heuristic re-ranking, default `false`. When `true`, the tool gathers extra candidates and prioritizes results that look like person profiles, organization pages, encyclopedic pages, or source pages. When omitted, provider order is preserved.
- `allowed_domains`: optional domain allowlist.
- `blocked_domains`: optional domain blocklist.

## Search Providers

Provider order is adjusted by query language. For Chinese queries, the tool prefers Chinese-friendly fallbacks and retries with the core name extracted from questions such as "who is X". By default, results are not re-ranked. For Chinese queries without `rerank`, each provider is capped so one source cannot fill the whole result page.

Free fallbacks:

- `duckduckgo`
- `sogou`
- `so360`
- `bing_html`
- `bing_rss`

Optional API providers (not called by default; used only when explicitly listed in `providers` or `CLAUDE_NET_SEARCH_PROVIDERS`):

- `brave`: `BRAVE_SEARCH_API_KEY`
- `serper`: `SERPER_API_KEY` or `GOOGLE_SERPER_API_KEY`
- `tavily`: `TAVILY_API_KEY`
- `kimi`: `KIMI_API_KEY` or `MOONSHOT_API_KEY`
- `minimax`: `MINIMAX_API_KEY`

Kimi and MiniMax support is implemented as an experimental compatible chat completions + web search tool path. Actual availability depends on your account, model, and gateway. If a provider fails, the tool continues with the next provider. The repository contains no API keys and does not call potentially billable providers by default.

## Local VPN/Proxy Configuration

Routes are tried in this order:

1. `CLAUDE_NET_PROXY`
2. `CLAUDE_NET_HTTP_PROXY`, `HTTPS_PROXY`, `HTTP_PROXY`, and lowercase variants
3. Common local ports: `7890`, `7897`, `7899`, `10809`, `10808`, `1080`, `8080`, `20171`, `2080`
4. direct

Force a local proxy:

```powershell
$env:CLAUDE_NET_PROXY = "http://127.0.0.1:7890"
```

Force direct networking:

```powershell
$env:CLAUDE_NET_PROXY = "direct"
```

Override provider order:

```powershell
$env:CLAUDE_NET_SEARCH_PROVIDERS = "duckduckgo,sogou,bing_html"
```

API keys are read only from environment variables. Do not commit keys to the repository or documentation. To use paid/account-backed APIs, explicitly add those providers to `CLAUDE_NET_SEARCH_PROVIDERS` or a one-off tool call.

## Examples

```text
Use net-tools proxy_status.
```

```text
Use net-tools search_web to search for sample person profile.
```

```text
Use net-tools fetch_url to read https://example.com.
```

Enable re-ranking when you want profile/source pages first:

```text
Use net-tools search_web to search for sample person profile with rerank true.
```

Restrict domains:

```text
Use net-tools search_web to search for sample researcher profile with allowed_domains ['example.edu.cn'].
```

## Troubleshooting

Check MCP connectivity:

```powershell
claude mcp get net-tools
```

Check the Node build:

```powershell
node --check C:\path\to\claude_net_mcp.mjs
```

Check the Python build:

```powershell
python -m py_compile C:\path\to\claude_net_mcp.py
```

Common issues:

- `Failed to connect`: use absolute `node.exe` / `python.exe` paths.
- Irrelevant search results: pass `providers` explicitly, set `CLAUDE_NET_SEARCH_PROVIDERS`, or use `rerank: true` when profile/source pages should be preferred.
- Proxy pollution: set `CLAUDE_NET_PROXY=direct` or explicitly set the local proxy URL.
- API provider errors: check the key, model, base URL, and whether the account supports web search.

## Notes

This is not a full browser. It does not execute JavaScript, preserve login state, or solve captchas. For dynamic or authenticated pages, pair it with a browser automation MCP.
