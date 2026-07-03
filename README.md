# claude-code-net-tools

中文 | [English](README.en.md)

`claude-code-net-tools` 是一个本地 stdio MCP 工具，为 Claude Code 和其他 MCP 客户端提供可控的联网搜索与网页读取能力。它适合这样的场景：模型服务商或第三方兼容网关没有正确支持 Claude Code 内置的 `WebSearch`，但本机可以通过直连或本地 VPN/代理访问网页。

## 解决的问题

Claude Code 内置 `WebSearch` 是 provider-side 能力：是否可用取决于模型账号、API 网关和服务商是否支持并转发相关 server tool。使用第三方网关、OpenAI-compatible endpoint 或非官方模型时，内置搜索经常不可用、不可控，或者模型根本看不到这个工具。

本项目把“联网”这一步移到本机 MCP server：

- Agent 调 MCP 工具，而不是依赖模型服务商的 `WebSearch`。
- 本机负责搜索和抓取网页，可使用本地 VPN/代理。
- 免费搜索源和付费 API provider 可以组合使用。
- 两个实现版本功能对齐：Node/curl 版和 Python 标准库版。
- 搜索结果会显示 provider notes，方便判断到底用了哪个源、哪里失败。

外部网页内容只作为资料返回，不代表本项目观点；涉及事实、政策、法律、医疗、金融等内容时，请以权威来源和官方信息为准。

## 两个版本怎么选

### Node/curl 版：`claude_net_mcp.mjs`

推荐 Windows 用户优先使用。它通过 `curl.exe` 发请求，对本地 HTTP/SOCKS/混合代理兼容性更好。

```powershell
node --check .\claude_net_mcp.mjs
claude mcp add --scope user net-tools -- node C:\path\to\claude-code-net-tools\claude_net_mcp.mjs
```

如果 Claude Code 找不到 `node`，用绝对路径：

```powershell
claude mcp add --scope user net-tools -- C:\Progra~1\nodejs\node.exe C:\path\to\claude-code-net-tools\claude_net_mcp.mjs
```

### Python 版：`claude_net_mcp.py`

适合不想装 npm 依赖、只想用 Python 标准库跑的环境。注意：Python 标准库不支持 SOCKS 代理；如需 SOCKS，请用 Node/curl 版。

```powershell
python -m py_compile .\claude_net_mcp.py
claude mcp add --scope user net-tools-py -- python C:\path\to\claude-code-net-tools\claude_net_mcp.py
```

## 工具

- `proxy_status`：显示连接路线和搜索 provider 顺序。
- `search_web`：搜索网页，返回标题、URL、摘要、provider 和诊断信息。
- `fetch_url`：抓取 URL 并提取可读文本。

`search_web` 支持参数：

- `query`：搜索词。
- `count`：返回数量，1 到 10。
- `providers`：可选 provider 顺序，例如 `['duckduckgo', 'sogou', 'bing_html']`。
- `rerank`：可选启发式重排，默认 `false`。设为 `true` 时会多取候选，并优先展示更像人物主页、机构介绍、百科/资料页的结果；不开启时保留 provider 返回顺序。
- `allowed_domains`：可选域名白名单。
- `blocked_domains`：可选域名黑名单。

## 搜索源

默认顺序会根据查询语言调整。中文查询会优先使用更适合中文网页的 fallback，并对“某某是谁”这类查询抽取核心姓名再重试。默认不对结果排序；中文查询在不启用 `rerank` 时会限制单个 provider 的候选数量，避免一个源把结果页占满。

免费 fallback：

- `duckduckgo`
- `sogou`
- `so360`
- `bing_html`
- `bing_rss`

可选 API provider（默认不会调用，只有显式指定 `providers` 或 `CLAUDE_NET_SEARCH_PROVIDERS` 才会使用）：

- `brave`：`BRAVE_SEARCH_API_KEY`
- `serper`：`SERPER_API_KEY` 或 `GOOGLE_SERPER_API_KEY`
- `tavily`：`TAVILY_API_KEY`
- `kimi`：`KIMI_API_KEY` 或 `MOONSHOT_API_KEY`
- `minimax`：`MINIMAX_API_KEY`

Kimi 和 MiniMax 走兼容 chat completions + web search tool 的实验路径。不同账号、模型和网关对 web search tool 的支持可能不同；失败时工具会继续尝试其它 provider。仓库不包含任何 API key，也不会默认调用这些可能产生费用的 provider。

## 本地 VPN/代理配置

默认会按以下顺序尝试：

1. `CLAUDE_NET_PROXY`
2. `CLAUDE_NET_HTTP_PROXY`、`HTTPS_PROXY`、`HTTP_PROXY` 及小写变体
3. 常见本地端口：`7890`、`7897`、`7899`、`10809`、`10808`、`1080`、`8080`、`20171`、`2080`
4. direct

强制走本地代理：

```powershell
$env:CLAUDE_NET_PROXY = "http://127.0.0.1:7890"
```

强制直连：

```powershell
$env:CLAUDE_NET_PROXY = "direct"
```

指定搜索 provider 顺序：

```powershell
$env:CLAUDE_NET_SEARCH_PROVIDERS = "duckduckgo,sogou,bing_html"
```

API key 只从环境变量读取，不要写进仓库或 README。需要使用付费/账号 API 时，再显式把 provider 放进 `CLAUDE_NET_SEARCH_PROVIDERS` 或单次工具参数里。

## 使用示例

```text
Use net-tools proxy_status.
```

```text
Use net-tools search_web to search for 示例人物是谁.
```

```text
Use net-tools fetch_url to read https://example.com.
```

需要启用重排时：

```text
Use net-tools search_web to search for 示例人物是谁 with rerank true.
```

也可以限制域名：

```text
Use net-tools search_web to search for 示例学者 简介 with allowed_domains ['example.edu.cn'].
```

## 排错

检查 MCP 是否连接：

```powershell
claude mcp get net-tools
```

检查 Node 版：

```powershell
node --check C:\path\to\claude_net_mcp.mjs
```

检查 Python 版：

```powershell
python -m py_compile C:\path\to\claude_net_mcp.py
```

常见问题：

- `Failed to connect`：优先使用绝对 `node.exe` / `python.exe` 路径。
- 搜索结果跑偏：指定 `providers`、设置 `CLAUDE_NET_SEARCH_PROVIDERS`，或在需要人物/资料页优先时传 `rerank: true`。
- 代理变量污染：设置 `CLAUDE_NET_PROXY=direct` 或显式写本地代理地址。
- 某 API provider 报错：检查 key、模型名、base URL 和账号是否支持 web search。

## 说明

这个工具不是完整浏览器。它不执行 JavaScript、不保留登录态、不处理验证码。动态页面、需要登录的网站，建议配合浏览器自动化 MCP 使用。
