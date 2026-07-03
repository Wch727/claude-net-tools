# Claude Code Net Tools

[English](README.en.md)

Claude Code Net Tools 是一个本地 MCP server，为 Claude Code 和其他 MCP 客户端提供可配置网络出口的搜索、URL 抓取和内容提取工具。

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
- 本地代理/VPN：设置 `CLAUDE_NET_PROXY`，例如 `http://127.0.0.1:7890` 或 `socks5h://127.0.0.1:7890`。设置为 `direct` 可强制直连。

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

其他 MCP 客户端可以使用等价配置：

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
| `CLAUDE_NET_SEARCH_PROVIDERS` | 覆盖搜索 provider 顺序，例如 `kimi,minimax,duckduckgo,bing_rss`。 |
| `CLAUDE_NET_DISABLED_PROVIDERS` | 禁用指定 provider，例如 `duckduckgo,bing_html`。 |
| `CLAUDE_NET_PROVIDER_FAIL_LIMIT` | provider 连续失败多少次后自动跳过，默认 `3`。 |
| `CLAUDE_NET_CURL` | Node/curl 版自定义 curl 路径。 |
| `CLAUDE_NET_PDFTOTEXT` | 自定义 `pdftotext` 路径。 |
| `CLAUDE_NET_COOKIE_DIR` | cookie jar 存储目录。 |
| `BRAVE_SEARCH_API_KEY` | Brave Search API。 |
| `KIMI_API_KEY` / `MOONSHOT_API_KEY` | Kimi/Moonshot web search 调用。 |
| `MINIMAX_API_KEY` | MiniMax web search 调用。 |
| `SERPER_API_KEY` / `GOOGLE_SERPER_API_KEY` | Serper API。 |
| `TAVILY_API_KEY` | Tavily API。 |
| `CLAUDE_NET_DEBUG` | 输出更详细的错误信息。 |

## 推荐 Agent 提示词

这个 MCP 的搜索工具只负责执行搜索和抓取材料，不负责理解用户问题。建议把下面这段放进 Claude Code、OpenClaw 或其它 agent 的 system/developer prompt：

```text
当用户提出需要联网的问题时，不要把原问题机械传给搜索工具。先用你的已有知识判断用户真正想查的实体、领域、时间范围和可能的权威来源，然后生成 1-3 个高质量搜索 query。

优先规则：
- 对简称、术语、论文、软件包，先补全全称、英文名、作者/机构、论文编号、官网或权威来源关键词。
- 对中文问题，可以同时生成中文 query 和更容易命中权威资料的英文 query。
- 先调用 net-tools search_web 执行基础搜索，保留原始 provider 顺序；不要依赖工具替你判断结果好坏。
- 如果结果太泛或太吵，再用更具体的 query 重搜，或显式调用 search_web_focused。
- 论文用 scholar_search，软件包用 package_search，网页正文用 fetch_url，PDF 用 fetch_pdf。
- 查软件包时必须先判断生态：Python 包显式用 PyPI/pypi，npm 包显式用 npm，GitHub 仓库显式用 github；不要把同名 npm 包和 PyPI 包混用。
- 涉及“最新版本、stars、下载量、发布日期、价格、状态”等动态信息时，必须写明“截至 YYYY-MM-DD”，并说明来源是 npm、PyPI、GitHub API、搜索结果还是页面抓取。
- 记录工具调用时要区分 search query 和 fetch URL；不要把 fetch_url 读取的页面 URL 写成搜索 query。
- 解释 net-tools 默认 provider 顺序时，先调用 search_status 或查 README，并区分非中文 query 和中文 query 的默认顺序。
- 工具返回的是材料，不是最终答案；最终答案必须由你综合结果、链接和上下文判断。资料不完整时用“关键资料已查到/目前可确认”，不要写“数据全部到位”。

例子：
用户问“bert是啥”时，可以先搜索：
1. BERT Bidirectional Encoder Representations from Transformers Google arXiv 1810.04805
2. BERT language model Google AI Wikipedia Hugging Face
然后再读取 arXiv/Wikipedia/Hugging Face 等结果。
```

## 工具

- `proxy_status`：显示当前网络出口、provider 顺序和关键环境变量状态。
- `pdf_status`：检查本机 `pdftotext` 路径、版本和可执行状态。
- `search_status`：查看搜索 provider 的 key 配置、禁用状态、最近成功/失败和可选 live 探测。
- `search_web`：基础网页搜索。默认只做 provider 失败降级、去重和域名过滤；不扩写 query、不做严格相关性过滤、不做启发式重排、不主动探测跳转最终 URL。让 LLM 先写好 query，再用它拿材料。
- `search_web_focused`：显式增强网页搜索。支持 cleaned core query 扩展、严格相关性过滤、可选重排和可选跳转解析；适合基础搜索太吵时再用。
- `scholar_search`：专项搜索论文，当前支持 Semantic Scholar、Crossref、arXiv。论文简称最好由 LLM 先扩写成带全称/作者/编号的 query；工具内部也会为短简称多抓一些 arXiv 早期候选。
- `package_search`：专项搜索开发包和仓库，当前支持 npm、PyPI、GitHub repositories。
- `fetch_url`：抓取 URL，支持 `GET/POST/PUT/PATCH/DELETE`、自定义 headers、cookies、cookie jar、body，以及 `auto/readable/text/markdown/raw` 提取模式；`auto` 默认使用正文抽取。
- `extract_links`：抓取页面并提取规范化链接，可限制同域名。
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

## 说明和限制

这个工具不是完整浏览器。它不执行 JavaScript、不保留网页登录态、不处理验证码。动态页面、需要登录的网站，建议后续配合浏览器自动化 MCP（例如 Playwright/Chromium）使用。

当前版本适合做搜索、公开网页读取、API/JSON/RSS 抓取、PDF 文本提取。以后可以继续扩展：

- 增加 Playwright 浏览器渲染模式，用于需要 JavaScript 的页面。
- 增加浏览器 cookie 导入或会话桥接。
- 增加 OCR、截图、页面结构化抽取。
- 增加更多搜索 provider，并把 provider 失败原因暴露得更清楚。

## 开发检查

```powershell
npm run check
```

这个命令会检查 Node 版语法，并编译检查 Python 版。默认不下载依赖。