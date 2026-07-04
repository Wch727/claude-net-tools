# Claude Code Net Tools

[English](README.en.md)

Claude Code Net Tools 是一个本地 MCP server，为 Claude Code 提供可配置网络出口的搜索、URL 抓取和内容提取工具。

## 解决的问题

当 Claude Code 接外部模型/API、本地代理/VPN、公司代理或免费搜索页面时，模型自带的联网搜索能力可能不可用、不稳定，或者只在 Claude 官方账号/特定模型组合里可用。这个项目把“联网搜索/抓取”拆成一个本地 MCP 工具层：

- 走本机网络环境，可显式指定 HTTP(S)/SOCKS 代理或直连。
- 免费搜索源优先可用，DuckDuckGo/Bing/Sogou/360 等失败时继续尝试其他 provider。
- 支持 Brave、Kimi/Moonshot、MiniMax、Serper、Tavily 等可选 API provider。
- 基础搜索默认保留 provider 顺序，不偷偷重排、不替 LLM 判断问题含义。
- 需要辅助过滤、重排、跳转解析时，显式调用增强搜索工具。
- 推荐先让 LLM 把自然语言问题改写成高质量搜索 query，再交给工具执行。
- 提供网页、链接、JSON、RSS/Atom、PDF 文本提取工具。
- API key 只从环境变量读取，不写入代码或仓库。

请遵守所在地区法律法规、目标网站规则和组织安全要求。本工具只提供技术访问能力，不绕过登录、验证码或权限控制。

## 安装要求

先下载项目：

```powershell
git clone https://github.com/Wch727/claude-code-net-tools.git
cd claude-code-net-tools
```

也可以从 GitHub 下载 ZIP 后解压。

### Node/curl 版（推荐）

必需安装：

- Node.js 20 或更新版本。用 `node -v` 检查。
- curl/curl.exe。Windows 10/11 通常自带 `curl.exe`，用 `curl.exe --version` 检查；macOS/Linux 用 `curl --version` 检查。

不需要安装：

- 默认 Node/curl 版不需要 `npm install`，代码只使用 Node 内置模块和系统 curl。

可选安装/配置：

- Poppler `pdftotext`：用于 `fetch_pdf` 提取 PDF 文本。安装后把 `pdftotext` 放进 PATH，或设置 `CLAUDE_NET_PDFTOTEXT` 指向可执行文件。若本机 `pdftotext` 有问题，先用 `pdf_status` 诊断；也可以在 `fetch_pdf` 里传 `extractor: "none"` 只验证 PDF 下载。
- 搜索 API key：只通过环境变量传入，例如 `BRAVE_SEARCH_API_KEY`、`KIMI_API_KEY`、`MINIMAX_API_KEY`、`SERPER_API_KEY`、`TAVILY_API_KEY`。
- 本地代理/VPN：可以设置 `CLAUDE_NET_PROXY`，例如 `http://127.0.0.1:7890` 或 `socks5h://127.0.0.1:7890`。未设置时工具会尝试常见本地代理端口；端口列表可用 `CLAUDE_NET_PROXY_PORTS` 调整。设置为 `direct` 可强制直连。

### Python 版（备用）

必需安装：

- Python 3.10 或更新版本。用 `python --version` 检查。

不需要安装：

- 默认 Python 版不需要 `pip install`，代码只使用 Python 标准库。

可选安装/配置：

- Poppler `pdftotext`：用于 `fetch_pdf`。如果本机命令异常，用 `pdf_status` 查路径和版本，或在 `fetch_pdf` 里传 `extractor: "none"` 跳过文本提取。
- 搜索 API key：同 Node/curl 版，通过环境变量传入。
- HTTP(S) 代理：Python 标准库可走 HTTP(S) 代理。SOCKS 代理不是标准库能力，建议用 Node/curl 版。

## 接入 Claude Code

Node/curl 版：

```powershell
claude mcp add net-tools node C:\path\to\claude-code-net-tools\claude_net_mcp.mjs
```

Python 版：

```powershell
claude mcp add net-tools-py python C:\path\to\claude-code-net-tools\claude_net_mcp.py
```

也可以手动写等价 MCP 配置：

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

如果不需要代理，可以删掉 `env`，或把 `CLAUDE_NET_PROXY` 设为 `direct`。

## 环境变量

| 变量 | 作用 |
| --- | --- |
| `CLAUDE_NET_PROXY` | 强制网络出口。支持 `http://`、`https://`、`socks5h://`（Node/curl 版）或 `direct`。 |
| `CLAUDE_NET_HTTP_PROXY` / `HTTPS_PROXY` / `HTTP_PROXY` | 未设置 `CLAUDE_NET_PROXY` 时的代理回退。 |
| `CLAUDE_NET_PROXY_PORTS` | 未指定代理时自动探测的本地端口列表，例如 `7890,7897,1080`。 |
| `CLAUDE_NET_SEARCH_PROVIDERS` | 覆盖搜索 provider 顺序，例如 `kimi,minimax,duckduckgo,bing_rss`。 |
| `CLAUDE_NET_SCHOLAR_PROVIDERS` | 覆盖学术搜索 provider 顺序，例如 `crossref,semantic_scholar,arxiv`。 |
| `CLAUDE_NET_DISABLED_PROVIDERS` | 禁用指定 provider，例如 `duckduckgo,bing_html`。 |
| `CLAUDE_NET_PROVIDER_FAIL_LIMIT` | provider 连续失败多少次后自动跳过，默认 `3`。 |
| `CLAUDE_NET_ARXIV_COOLDOWN_MS` | arXiv 返回 429 后的冷却时间，默认 `5000` 毫秒。 |
| `CLAUDE_NET_DEFAULT_MAX_CHARS` | `fetch_url` 默认返回字符数，默认 `12000`。 |
| `CLAUDE_NET_MAX_OUTPUT_CHARS` | 单次工具输出的最大字符数，默认 `200000`。 |
| `CLAUDE_NET_MAX_FETCH_BYTES` | 单次下载的最大字节数，默认由版本决定，可用于限制大文件。 |
| `CLAUDE_NET_CURL` | Node/curl 版自定义 curl 路径。 |
| `CLAUDE_NET_PDFTOTEXT` | 自定义 `pdftotext` 路径。 |
| `CLAUDE_NET_COOKIE_DIR` | cookie jar 存储目录。 |
| `BRAVE_SEARCH_API_KEY` | Brave Search API。 |
| `KIMI_API_KEY` / `MOONSHOT_API_KEY` | Kimi/Moonshot web search 调用。 |
| `MINIMAX_API_KEY` | MiniMax web search 调用。 |
| `SERPER_API_KEY` / `GOOGLE_SERPER_API_KEY` | Serper API。 |
| `TAVILY_API_KEY` | Tavily API。 |
| `CLAUDE_NET_DEBUG` | 输出更详细的错误信息。 |

## 配置 API Key

API key 只从环境变量读取，不要写进代码、README、提交记录或公开仓库。示例里的 `your_..._key` 都是占位符。

支持的搜索 API provider 和变量名：

| Provider | 必填环境变量 | 可选环境变量 |
| --- | --- | --- |
| `kimi` | `KIMI_API_KEY` 或 `MOONSHOT_API_KEY` | `KIMI_BASE_URL`、`KIMI_MODEL` |
| `minimax` | `MINIMAX_API_KEY` | `MINIMAX_BASE_URL`、`MINIMAX_MODEL`、`MINIMAX_WEB_SEARCH_TOOL` |
| `brave` | `BRAVE_SEARCH_API_KEY` | - |
| `serper` | `SERPER_API_KEY` 或 `GOOGLE_SERPER_API_KEY` | - |
| `tavily` | `TAVILY_API_KEY` | - |

注意：只配置 key 不等于一定会调用付费 API。当前默认 provider 顺序仍以免费搜索为主：非 CJK query 默认 `duckduckgo,bing_rss,bing_html`，CJK query 默认 `duckduckgo,sogou,so360,bing_html,bing_rss`。如果要让 API provider 参与搜索，需要设置 `CLAUDE_NET_SEARCH_PROVIDERS`，或在单次工具调用里传 `providers`。

### 方式 1：Claude Code MCP 配置里传入（最直接）

```powershell
claude mcp add net-tools -e KIMI_API_KEY=your_kimi_key -e CLAUDE_NET_SEARCH_PROVIDERS=kimi,duckduckgo,bing_rss -- node C:\path\to\claude-code-net-tools\claude_net_mcp.mjs
```

MiniMax 示例：

```powershell
claude mcp add net-tools -e MINIMAX_API_KEY=your_minimax_key -e CLAUDE_NET_SEARCH_PROVIDERS=minimax,duckduckgo,bing_rss -- node C:\path\to\claude-code-net-tools\claude_net_mcp.mjs
```

这个方式会把 key 存在 Claude Code 的本地 MCP 配置里。适合个人机器；不要把带 key 的配置文件提交到仓库。

### 方式 2：PowerShell 当前窗口临时设置

```powershell
$env:KIMI_API_KEY = "your_kimi_key"
$env:MINIMAX_API_KEY = "your_minimax_key"
$env:CLAUDE_NET_SEARCH_PROVIDERS = "kimi,minimax,duckduckgo,bing_rss"
claude
```

这种方式只对当前 PowerShell 窗口和从这个窗口启动的 Claude Code 生效。已经打开的 Claude Code 会话通常需要重启。

### 方式 3：Windows 用户环境变量持久设置

```powershell
[Environment]::SetEnvironmentVariable("KIMI_API_KEY", "your_kimi_key", "User")
[Environment]::SetEnvironmentVariable("MINIMAX_API_KEY", "your_minimax_key", "User")
[Environment]::SetEnvironmentVariable("CLAUDE_NET_SEARCH_PROVIDERS", "kimi,minimax,duckduckgo,bing_rss", "User")
```

设置后重启 PowerShell 和 Claude Code。删除某个 key 时可以把值设为 `$null`：

```powershell
[Environment]::SetEnvironmentVariable("KIMI_API_KEY", $null, "User")
```

### 方式 4：手动 MCP JSON 配置

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

如果你不想默认使用付费 API，就不要把 `kimi`、`minimax`、`brave`、`serper`、`tavily` 写进 `CLAUDE_NET_SEARCH_PROVIDERS`。需要时让 Claude Code 在单次调用里传 `providers: ["kimi"]` 或 `providers: ["minimax"]` 即可。

配置后可在 Claude Code 里运行 `net-tools search_status` 查看哪些 provider 已配置；需要实际探测时用 `live: true`。

## 网络出口和 provider 策略

默认情况下，工具会按顺序尝试可用网络出口：显式 `CLAUDE_NET_PROXY`、环境变量代理、常见本地代理端口、直连。这样可以适配本机代理/VPN、公司代理和普通直连环境。若你的代理端口不是常见端口，设置 `CLAUDE_NET_PROXY_PORTS`；若你只想直连，设置 `CLAUDE_NET_PROXY=direct`。

网页搜索和学术搜索是两套 provider 顺序：

- `CLAUDE_NET_SEARCH_PROVIDERS` 控制 `search_web` 和 `search_web_focused`。
- `CLAUDE_NET_SCHOLAR_PROVIDERS` 控制 `scholar_search`。
- `CLAUDE_NET_DISABLED_PROVIDERS` 对两类 provider 都生效，适合临时禁用不稳定或成本较高的 provider。

`scholar_search` 默认优先 `crossref,semantic_scholar,arxiv`。arXiv 对同一出口 IP 有频率限制；工具遇到 429 会进入短暂冷却，不会继续对同一个 query 连发多种 arXiv 请求。明确需要 arXiv 时可以把 `arxiv` 放进 providers；如果近期频繁 429，可以设置 `CLAUDE_NET_DISABLED_PROVIDERS=arxiv`，先用 Crossref 和 Semantic Scholar。

## 推荐 Claude Code 提示词

这个 MCP 的搜索工具只负责执行搜索和抓取材料，不负责理解用户问题。问题理解、query 改写和来源判断应该交给 Claude Code 当前连接的模型完成。

仓库里提供中英两版可复制提示词：

- 中文：[`prompts/claude-code-search.zh.md`](prompts/claude-code-search.zh.md)
- English：[`prompts/claude-code-search.en.md`](prompts/claude-code-search.en.md)

提示词替换说明也有中英两版：

- 中文说明：[`prompts/README.zh.md`](prompts/README.zh.md)
- English guide：[`prompts/README.en.md`](prompts/README.en.md)

快速换法：选择中文或英文提示词，复制其中的整个 `text` 代码块，粘贴到 Claude Code 实际加载的指令位置，例如项目里的 `CLAUDE.md`、全局记忆/自定义指令，或临时测试时的会话首条消息。如果你的 MCP 服务名不是 `net-tools`，把提示词里的 `net-tools` 改成实际服务名。修改仓库里的提示词文件后，需要重新复制到 Claude Code 配置并重启/reload 会话；仓库文件本身不会自动生效。

## 工具

- `proxy_status`：显示当前网络出口、provider 顺序和关键环境变量状态。
- `pdf_status`：检查本机 `pdftotext` 路径、版本和可执行状态。
- `search_status`：查看搜索 provider 的 key 配置、禁用状态、最近成功/失败和可选 live 探测。
- `search_web`：基础网页搜索。默认只做 provider 失败降级、去重和域名过滤；不扩写 query、不做严格相关性过滤、不做启发式重排、不主动探测跳转最终 URL。让 LLM 先写好 query，再用它拿材料。
- `search_web_focused`：显式增强网页搜索。支持 cleaned core query 扩展、严格相关性过滤、可选重排和可选跳转解析；适合基础搜索太吵时再用。
- `scholar_search`：专项搜索论文，当前支持 Crossref、Semantic Scholar、arXiv。论文简称最好由 LLM 先扩写成带全称/作者/编号的 query；默认把 arXiv 放在后面，并在遇到 429 时冷却，减少限速压力。
- `package_search`：专项搜索开发包和仓库，当前支持 npm、PyPI、GitHub repositories。
- `fetch_url`：抓取 URL，支持 `GET/POST/PUT/PATCH/DELETE`、自定义 headers、cookies、cookie jar、body，以及 `auto/readable/text/markdown/raw` 提取模式；支持 `offset`/`next_offset` 分页读取长文本，也可用 `include_links` 在同一次抓取里提取链接。
- `extract_links`：抓取页面并提取规范化链接，可限制同域名。若你同时需要正文和链接，优先用 `fetch_url` 的 `include_links`。
- `fetch_json`：抓取 JSON endpoint 并格式化输出。
- `fetch_rss`：抓取 RSS/Atom feed 并输出条目。
- `fetch_pdf`：下载 PDF，并在安装 `pdftotext` 时提取文本；支持 `extractor: auto|pdftotext|none`。

## 使用示例

在 Claude Code 里可以这样问：

```text
Use net-tools proxy_status.
Use net-tools pdf_status.
Use net-tools search_status.
Use net-tools search_web to search "Claude Code MCP" count 5.
Use net-tools fetch_url to read https://example.com with extract readable.
Use net-tools fetch_url to read https://example.com with extract readable include_links true link_limit 10.
Use net-tools fetch_url to continue from next_offset when the previous result says it was truncated.
Use net-tools fetch_url to read https://example.com as markdown.
Use net-tools extract_links to list same-domain links from https://example.com.
Use net-tools fetch_json to read https://api.github.com/repos/Wch727/claude-code-net-tools.
Use net-tools fetch_rss to read https://github.blog/feed/ count 5.
Use net-tools scholar_search to search "Attention Is All You Need" count 5.
Use net-tools scholar_search to search "BERT" count 3.
Use net-tools package_search to search "playwright" ecosystem npm count 5.
Use net-tools search_web to search "Attention Is All You Need arxiv pdf" count 5, then choose the official arXiv result and use net-tools fetch_pdf to read the PDF.
```

也可以在 MCP 调用参数里直接指定 provider：

```json
{
  "query": "BERT Bidirectional Encoder Representations from Transformers Google arXiv 1810.04805",
  "count": 5,
  "providers": ["duckduckgo", "bing_rss"]
}
```

如果基础搜索太吵，再显式使用增强搜索：

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

## 长页面、会话和 PDF

`fetch_url` 的 `max_chars` 是单次输出上限，不代表页面只下载这么多字符。结果里如果出现 `next_offset`，继续调用同一个 URL，并把 `offset` 设成 `next_offset` 即可分段读取。这样读长文档时不需要反复猜一个很大的 `max_chars`。

`cookie_jar` 可以保存同一 jar 名称下的 cookie，适合简单的连续请求；但它不是完整浏览器会话，不自动处理复杂登录、CSRF 流程、验证码或前端 JavaScript 状态。需要登录态或动态页面时，后续应配合浏览器自动化 MCP。

`fetch_pdf` 依赖本机 `pdftotext` 抽取文本。它适合快速读摘要、引言、结论和参考信息；对公式、表格、图片说明、复杂版式的论文，纯文本结果可能乱序。遇到这类文档，建议先用 `fetch_pdf extractor=none` 验证下载，再用本机 PDF 阅读器或后续浏览器/OCR 能力处理。

## 说明和限制

这个工具不是完整浏览器。它不执行 JavaScript、不保留网页登录态、不处理验证码。动态页面、需要登录的网站，建议后续配合浏览器自动化 MCP（例如 Playwright/Chromium）使用。

当前版本适合做搜索、公开网页读取、API/JSON/RSS 抓取、PDF 文本提取。以后可以继续扩展：

- 增加 Playwright 浏览器渲染模式，用于需要 JavaScript 的页面。
- 增加浏览器 cookie 导入或会话桥接。
- 增加 OCR、截图、页面结构化抽取。
- 增加更多搜索 provider，并把 provider 失败原因暴露得更清楚。

## Claude Code 烟测题

安装或改配置后，建议在 Claude Code 里按顺序问这些题。它们能覆盖网络出口、搜索、抓取、分页、学术搜索和 PDF。

```text
Use net-tools proxy_status.
Use net-tools search_status.
Use net-tools search_web to search "叶兰峰是谁" count 5.
Use net-tools search_web to search "BERT Bidirectional Encoder Representations from Transformers Google arXiv 1810.04805" count 5, then summarize the key sources.
Use net-tools fetch_url to read https://example.com with extract readable include_links true link_limit 10.
Use net-tools scholar_search to search "Attention Is All You Need Vaswani 2017 transformer" count 5.
Use net-tools search_web to search "Attention Is All You Need arXiv PDF" count 5, choose the official arXiv PDF, then use net-tools fetch_pdf to read it.
```

好的结果不要求所有 provider 都成功，但应满足：能显示当前 route；至少一个搜索 provider 可用；`fetch_url` 能返回正文、状态码和必要时的 `next_offset`；`scholar_search` 不应因 arXiv 429 一直连发请求；PDF 如果本机 `pdftotext` 不可用，应给出明确诊断。

## 开发检查

```powershell
npm run check
```

这个命令会检查 Node 版语法，并编译检查 Python 版。默认不下载依赖。