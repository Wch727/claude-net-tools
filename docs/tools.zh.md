# 工具说明和限制

[English](tools.en.md) · [返回首页](../README.md)

## 状态工具

- `net_doctor`：Claude Code 联网总诊断。默认只检查本机 runtime、网络出口、provider 配置和 PDF 提取，不实际搜索；传 `live=true` 才做一次真实搜索烟测，付费 API provider 默认仍跳过，除非传 `include_paid=true`。
- `proxy_status`：显示当前网络出口、默认 provider 顺序和自动探测代理端口。
- `search_status`：查看 web/scholar provider 的 key 配置、禁用状态、最近成功/失败和可选 live 探测。默认不 live 探测付费 API provider，除非显式传 `include_paid: true` 或只指定该 provider。
- `pdf_status`：检查本机 `pdftotext` 路径、版本和可执行状态。

## 搜索工具

- `search_web`：基础网页搜索。默认只做 provider 失败降级、去重和域名过滤；不扩写 query、不做严格相关性过滤、不启发式重排、不主动探测跳转最终 URL。让 LLM 先写好 query，再用它拿材料。
- `search_web_focused`：显式增强网页搜索。支持 cleaned core query 扩展、严格相关性过滤、可选重排和可选跳转解析；适合基础搜索太吵时再用。
- `scholar_search`：论文搜索，支持 Crossref、Semantic Scholar、arXiv。默认把 arXiv 放后面，并在遇到 429 时冷却。
- `package_search`：开发包和仓库搜索，支持 npm、PyPI、GitHub repositories。

## 抓取工具

- `fetch_url`：抓取 URL，支持 `GET/POST/PUT/PATCH/DELETE`、headers、cookies、cookie jar、body，以及 `auto/readable/text/markdown/raw` 提取模式。
- `extract_links`：抓取页面并提取规范化链接，可限制同域名。如果同时需要正文和链接，优先用 `fetch_url include_links=true`。
- `fetch_json`：抓取 JSON endpoint 并格式化输出。
- `fetch_rss`：抓取 RSS/Atom feed 并输出条目。
- `fetch_pdf`：下载 PDF，并在安装 `pdftotext` 时提取文本；支持 `extractor: auto|pdftotext|none`。

`fetch_url` 的 `max_chars` 是单次输出上限，不代表页面只下载这么多字符。结果里如果出现 `next_offset`，继续调用同一个 URL，并把 `offset` 设成 `next_offset` 即可分段读取。

## Named Session

`session_create`、`session_status`、`session_clear` 提供轻量 HTTP session 管理。它不是浏览器登录态，只是为 HTTP 请求保存默认 headers、cookies、referer，并为该 session 使用独立 cookie jar 接收后续 Set-Cookie。

示例：

```json
{
  "name": "docs",
  "headers": { "X-Client": "claude-code" },
  "cookies": { "token": "example" },
  "referer": "https://example.com/"
}
```

之后在抓取工具里传：

```json
{
  "url": "https://example.com/api",
  "session": "docs"
}
```

规则：

- 显式传入的 `headers`、`cookies`、`cookie_jar` 优先级高于 session 默认值。
- 默认 `update_referer=true`，请求完成后 session 的 referer 会更新为最终 URL。
- `session_status` 会隐藏 cookie 值，只显示 cookie 数量或类型。
- 复杂登录、CSRF、验证码、JavaScript 状态仍需要浏览器自动化工具。

## PDF 限制

`fetch_pdf` 依赖本机 `pdftotext`。它适合快速读摘要、引言、结论和参考信息；对公式、表格、图片说明、复杂版式论文，纯文本结果可能乱序。遇到这类文档，建议先用 `fetch_pdf extractor=none` 验证下载，再用本机 PDF 阅读器或后续浏览器/OCR 能力处理。

## 浏览器模式与边界

- `browser_status`：显示 Playwright 命令、默认引擎、缓存、profile，并可用 `live=true` 打开真实网页诊断。
- `browser_search`：打开 Google、Bing 或 DuckDuckGo 的真实搜索页，执行 JavaScript 后按页面原顺序提取标题、链接和摘要，不打分重排。
- `browser_fetch`：打开目标 URL，读取渲染后的正文和链接，支持 `max_chars`、`offset` 和 `next_offset` 分段读取。
- `search_web`、`search_web_focused`、`fetch_url` 的 `browser` 参数支持 `never|auto|always`。`auto` 只在结果不足、HTTP 失败、反爬页或 JavaScript 空壳时回退。

浏览器 session 在 MCP 进程内复用。设置 `CLAUDE_NET_BROWSER_PROFILE` 可使用专用持久化 profile 保存浏览器 cookie 和登录状态；它与 `session_create` 的 HTTP cookie jar 相互独立。

Playwright 能执行 JavaScript，但不会自动破解验证码、绕过登录/授权或规避网站规则，也不会绕过 Claude Code 模型侧安全决策。Claude Code 内置 `Fetch` 的“Unable to verify if domain is safe to fetch”不来自本项目；要避免走那套域名校验，应在提示词中要求使用 `net-tools fetch_url` 或 `net-tools browser_fetch`。
