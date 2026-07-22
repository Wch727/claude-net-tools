# Testing, Smoke Prompts, And Development Checks

[中文](testing.zh.md) · [Back to README](../README.en.md)

## Claude Code Smoke Prompts

After installation or config changes, ask these in Claude Code in order. They cover the main doctor check, route detection, search, fetching, paging, scholar search, and PDF handling.

```text
Use net-tools net_doctor live=true query="Claude Code MCP".
Use net-tools proxy_status.
Use net-tools search_status.
Use net-tools search_web to search "叶兰峰是谁" count 5.
Use net-tools search_web to search "BERT Bidirectional Encoder Representations from Transformers Google arXiv 1810.04805" count 5, then summarize the key sources.
Use net-tools fetch_url to read https://example.com with extract readable include_links true link_limit 10.
Use net-tools scholar_search to search "Attention Is All You Need Vaswani 2017 transformer" count 5.
Use net-tools search_web to search "Attention Is All You Need arXiv PDF" count 5, choose the official arXiv PDF, then use net-tools fetch_pdf to read it.
```

A good run does not require every provider to succeed. It should show the active route, have at least one working search provider, return body text/status/`next_offset` where applicable from `fetch_url`, avoid repeated arXiv requests after HTTP 429, and provide clear diagnostics if local `pdftotext` is unavailable.

## Browser Smoke Prompts

```text
Use net-tools browser_status with live=true.
Use net-tools browser_search to search "Rosenblatt XOR problem Principles of Neurodynamics 1962" count 3, preserving browser order.
Use net-tools scholar_search to search "McDermott R1 rule-based configurer computer systems 1982" count 3 with provider semantic_scholar; if empty, report the relaxed query attempt.
Use net-tools browser_fetch to read https://en.wikipedia.org/wiki/Frank_Rosenblatt with include_links true. Do not use Claude Code built-in Fetch.
```

The last prompt must show a `net-tools browser_fetch` or `net-tools fetch_url` call. If Claude Code switches to built-in `Fetch` and reports “Unable to verify if domain is safe to fetch,” that is a separate tool's domain verification, not a net-tools fetch failure.

## Session Smoke Prompts

```text
Use net-tools session_create to create a session named demo with headers {"X-Test":"ok"}, cookies {"token":"example"}, and referer "https://example.com/".
Use net-tools session_status for session demo.
Use net-tools fetch_url to read https://example.com with session demo and extract readable.
Use net-tools session_clear for session demo.
```

## Development Check

```powershell
npm run check
npm test
npm run test:browser-live
```

`npm run check` checks Node syntax and compiles the Python build. `npm test` starts a local offline fixture and tests both builds through MCP JSON-RPC, covering:

- Tool list and schema parity.
- `net_doctor` configuration-only diagnostics without paid API calls.
- `fetch_url` paging/link extraction plus protection against false blocked-page diagnostics when complete articles contain ordinary phrases such as “security check.”
- `session_create/session_status/session_clear` plus session headers/cookies/referer.
- `search_status` provider diagnostics.
- arXiv HTTP 429 cooldown without repeated requests.

`npm test` does not download dependencies. `npm run test:browser-live` requires an installed Playwright browser and uses a local JavaScript-rendered page to test `browser_fetch` and automatic fallback in both Node and Python builds.