# Claude Code Net Tools

[English](README.en.md)

Claude Code Net Tools 是一个本地 MCP server，为 Claude Code 提供可配置网络出口的搜索、URL 抓取和内容提取工具。

## 解决的问题

当 Claude Code 接外部模型/API、本地代理/VPN、公司代理或免费搜索页面时，模型自带的联网搜索能力可能不可用、不稳定，或者只在 Claude 官方账号/特定模型组合里可用。这个项目把“联网搜索/抓取”拆成一个本地 MCP 工具层：让 Claude Code 负责理解问题和改写 query，让本地工具负责稳定执行搜索、抓取网页、读取 JSON/RSS/PDF，并通过环境变量控制网络出口和 provider。

本工具只提供技术访问能力。请遵守所在地区法律法规、目标网站规则和组织安全要求；它不绕过登录、验证码或权限控制。

## 快速开始

推荐用安装脚本把 MCP 加到 Claude Code：

```powershell
.\scripts\install-claude-code.ps1
```

macOS/Linux：

```bash
./scripts/install-claude-code.sh
```

需要代理/VPN 时：

```powershell
.\scripts\install-claude-code.ps1 -Proxy http://127.0.0.1:7890
```

安装后在 Claude Code 里先跑总诊断：

```text
Use net-tools net_doctor live=true query="Claude Code MCP"
```

Node/curl 版推荐使用 Node.js 20+ 和系统 `curl`/`curl.exe`，默认不需要 `npm install`。Python 备用版也可手动添加：

```powershell
claude mcp add net-tools-py python C:\path\to\claude-code-net-tools\claude_net_mcp.py
```

不需要代理时，可以不设 `CLAUDE_NET_PROXY`，或设置为 `direct`。

## 常用工具
- `net_doctor`：Claude Code 联网总诊断，默认只检查配置，`live=true` 才实际搜索。
- `search_web`：Claude Code 的基础网页搜索；可用时查询两个独立 provider 家族，按配置顺序轮询合并，不打分重排，也不替 LLM 理解问题。
- `search_web_focused`：显式增强搜索，仅在基础搜索太吵时使用。
- `scholar_search`：论文搜索，支持 Crossref、Semantic Scholar、arXiv。
- `package_search`：npm、PyPI、GitHub repository 搜索。
- `fetch_url` / `extract_links` / `fetch_json` / `fetch_rss` / `fetch_pdf`：抓取网页、链接、JSON、RSS/Atom、PDF。
- `session_create` / `session_status` / `session_clear`：命名 HTTP session，保存默认 headers/cookies/referer，并复用独立 cookie jar。
- `proxy_status` / `search_status` / `pdf_status`：分项诊断网络出口、provider 状态和 PDF 提取工具。

## 浏览器搜索（可选）

`browser_search` 和 `browser_fetch` 通过本机 Playwright 打开真实搜索页并读取 JavaScript 渲染后的内容。`search_web`、`search_web_focused` 和 `fetch_url` 支持 `browser=never|auto|always`；默认 `auto` 在普通 HTTP 搜索结果不足、独立来源不足，或网页被拦截/只有 JS 空壳时回退。

首次使用浏览器功能前检查并安装：

```powershell
npx --yes --package @playwright/cli playwright-cli --help
npx --yes --package @playwright/cli playwright-cli install-browser
```

浏览器功能是可选的；不安装时原有 HTTP 搜索、抓取、API 和 PDF 工具仍可使用。用 `browser_status live=true` 做真实浏览器诊断。

## 文档

- [配置和 API key](docs/config.zh.md)
- [工具说明和限制](docs/tools.zh.md)
- [测试、烟测题和开发检查](docs/testing.zh.md)
- [Claude Code 搜索提示词说明](prompts/README.zh.md)

## 最小验证

```powershell
npm test
```

`npm test` 会离线启动 fixture，并通过 MCP JSON-RPC 同时测试 Node/curl 版和 Python 版，不下载依赖。

已安装 Playwright 浏览器时，可再运行真实渲染烟测：

```powershell
npm run test:browser-live
```