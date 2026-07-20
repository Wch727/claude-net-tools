# Tools And Limits

[中文](tools.zh.md) · [Back to README](../README.en.md)

## Status Tools

- `net_doctor`: main Claude Code networking diagnostic. By default it checks local runtime, route, provider configuration, and PDF extraction without running a real web search. Pass `live=true` for one actual search smoke test; paid API providers stay skipped unless `include_paid=true`.
- `proxy_status`: shows the current route, default provider order, and auto-detected proxy ports.
- `search_status`: shows web/scholar provider key configuration, disabled status, recent success/failure counts, and optional live probes. It does not live-probe paid API providers by default unless `include_paid: true` is passed or only that provider is selected.
- `pdf_status`: checks the local `pdftotext` path, version, and executable status.

## Search Tools

- `search_web`: basic web search. It handles provider fallback, deduplication, and domain filters; it does not expand queries, apply strict relevance filtering, rerank results, or actively probe redirect final URLs. Let the LLM write the query first.
- `search_web_focused`: explicit assisted search with cleaned core-query expansion, strict relevance filtering, optional reranking, and optional redirect resolution.
- `scholar_search`: paper search through Crossref, Semantic Scholar, and arXiv. arXiv is later in the default order and enters cooldown after HTTP 429.
- `package_search`: package and repository search through npm, PyPI, and GitHub repositories.

## Fetch Tools

- `fetch_url`: fetches a URL with `GET/POST/PUT/PATCH/DELETE`, headers, cookies, cookie jars, request bodies, and `auto/readable/text/markdown/raw` extraction modes.
- `extract_links`: fetches a page and extracts normalized links, optionally limited to the same domain. If you need both body text and links, prefer `fetch_url include_links=true`.
- `fetch_json`: fetches a JSON endpoint and pretty-prints parsed JSON.
- `fetch_rss`: fetches RSS/Atom feeds and returns entries.
- `fetch_pdf`: downloads a PDF and extracts text when `pdftotext` is installed; supports `extractor: auto|pdftotext|none`.

`fetch_url` `max_chars` is the output limit for one tool call; it is not the downloaded page size. If the result includes `next_offset`, call the same URL again with `offset` set to that value.

## Named Sessions

`session_create`, `session_status`, and `session_clear` provide lightweight HTTP session management. This is not a browser login session. It saves default headers, cookies, referer, and a dedicated cookie jar for later Set-Cookie values.

Example:

```json
{
  "name": "docs",
  "headers": { "X-Client": "claude-code" },
  "cookies": { "token": "example" },
  "referer": "https://example.com/"
}
```

Then pass the session to fetch tools:

```json
{
  "url": "https://example.com/api",
  "session": "docs"
}
```

Rules:

- Explicit `headers`, `cookies`, and `cookie_jar` override session defaults.
- `update_referer=true` by default, so the session referer is updated to the final URL after a request.
- `session_status` redacts cookie values and shows only count/type.
- Complex login, CSRF, captchas, and JavaScript state still require browser automation.

## PDF Limits

`fetch_pdf` relies on local `pdftotext`. It is useful for abstracts, introductions, conclusions, and bibliographic information. For formulas, tables, captions, and complex scientific layouts, plain text may be out of order. For those documents, first use `fetch_pdf extractor=none` to verify download, then read the PDF locally or with browser/OCR support.

## Browser Boundary

This tool is not a full browser. It does not execute JavaScript, keep browser login sessions, or solve captchas. For dynamic or login-only pages, pair it with a browser automation MCP such as Playwright/Chromium. It also does not bypass Claude Code model-side safety decisions; fetch diagnostics only identify anti-bot, captcha, login, JavaScript shell, or policy/interstitial pages so they are not mistaken for article content.