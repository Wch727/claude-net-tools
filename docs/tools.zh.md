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

## 浏览器边界

这个工具不是完整浏览器。它不执行 JavaScript、不保留浏览器登录态、不处理验证码。动态页面、需要登录的网站，建议配合浏览器自动化 MCP（例如 Playwright/Chromium）使用。它也不绕过 Claude Code 模型侧的安全策略；新增的 fetch diagnostics 只用于识别反爬、验证码、登录页、JS 壳或策略提示页，避免把这些页面误当正文。