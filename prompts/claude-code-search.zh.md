# Claude Code Net Tools 搜索提示词（中文）

把下面整个 `text` 代码块放进 Claude Code 实际加载的 `CLAUDE.md`、全局记忆/自定义指令，或会话首条消息。仓库里的本文件不会自动生效。

```text
当用户的问题可能需要联网时，先用你自己的知识判断实体、领域、时间范围和权威来源，再生成 1-3 个高质量查询。不要只把用户原句机械传给工具，也不要因为第一次返回 0 条就停止。

工具使用规则：
- 需要接近真实搜索页面的结果时，优先调用 `net-tools browser_search`。它使用 Playwright 渲染 Google、Bing 或 DuckDuckGo，并保留页面顺序，不做重排。
- 需要快速、低成本搜索时调用 `net-tools search_web`。默认 `browser=auto`，HTTP provider 结果不足时会回退浏览器；需要强制浏览器时传 `browser=always`。
- 结果噪声较多时，先改写 query；确实需要相关性过滤时再调用 `net-tools search_web_focused`。除非用户明确要求，不要启用 `rerank`。
- 对缩写、论文、人物、产品和软件包，补充全称、英文名、作者、机构、年份、论文编号、官网或来源类型。中文问题可同时生成中英文查询。
- 论文优先调用 `net-tools scholar_search`。返回 0 条时，去掉年份和泛化词，保留作者、题名关键词再次查询，或调用 `browser_search` 搜索题名。遇到 arXiv 429 不要连续重试。
- 网页正文统一使用 `net-tools fetch_url`；JavaScript 页面、HTTP 抓取为空或被拦截时使用 `net-tools browser_fetch`，也可以给 `fetch_url` 传 `browser=auto|always`。
- 不要改用 Claude Code 内置的 `Fetch`、`WebFetch` 或同类网页抓取工具读取外网 URL；它们可能触发 Anthropic 域名安全校验。除非用户明确指定，搜索和正文读取都通过 `net-tools` 完成。
- JSON API 用 `net-tools fetch_json`，RSS/Atom 用 `net-tools fetch_rss`，PDF 用 `net-tools fetch_pdf`，软件包/仓库用 `net-tools package_search`。
- 需要正文和链接时给 `fetch_url` 或 `browser_fetch` 传 `include_links=true`。结果有 `next_offset` 时，用同一 URL 和该 offset 继续读取。
- 工具输出是来源材料，不是最终答案。综合标题、摘要、正文和来源后回答；动态信息注明截至日期；证据不足时明确说明目前能确认的范围。

示例：用户问“BERT 是什么”，可搜索：
1. BERT Bidirectional Encoder Representations from Transformers Google arXiv 1810.04805
2. BERT language model Google Research Hugging Face

示例：学术查询 `McDermott R1 rule-based configurer computer systems 1982` 返回 0 条时，继续尝试 `McDermott R1 rule based configurer computer systems` 或通过 `browser_search` 搜索论文题名，不要直接回答“没有资料”。
```
