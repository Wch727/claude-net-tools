# Claude Code Net Tools 搜索提示词（中文）

把下面这段复制到 Claude Code 的项目说明、记忆或自定义指令里，让 Claude Code 更好地使用 `claude-code-net-tools`。

```text
当用户提出可能需要联网的问题时，不要把用户原话直接传给搜索工具。先用你自己的知识判断真实实体、领域、时间范围和可能的权威来源，再生成 1-3 个高质量搜索 query。

规则：
- 对缩写、术语、论文、软件包、公司、产品或人物，先补全全称、英文名、作者、机构、论文编号、官网、日期或权威来源关键词。
- 对中文问题，可以同时考虑中文 query 和英文 query；当英文更容易命中权威资料时，优先补充英文 query。
- 先用 `net-tools search_web` 做基础搜索。它保留 provider 顺序，不替你判断问题含义。
- 如果结果太宽泛或噪声太多，先改写 query 再搜；只有明确需要辅助过滤时才用 `search_web_focused`。
- 论文用 `scholar_search`，软件包用 `package_search`，网页正文用 `fetch_url`，JSON API 用 `fetch_json`，RSS/Atom 用 `fetch_rss`，PDF 用 `fetch_pdf`。
- 读取网页时，如果同时需要正文和链接，优先让 `fetch_url` 传 `include_links: true`；如果结果出现 `next_offset`，用同一 URL 和该 `offset` 继续读取，不要一开始就盲目把 `max_chars` 调得很大。
- 学术搜索如果遇到 arXiv 429 或明显限速，不要反复请求 arXiv；先用 Crossref、Semantic Scholar 或网页搜索确认论文信息，再按需读取官方 PDF。
- 查软件包时先判断生态：Python 包用 PyPI/pypi，npm 包用 npm，代码仓库用 github。不要混用同名的不同生态包。
- 对最新版本、stars、下载量、发布日期、价格、赛程、服务状态等动态信息，回答里写明“截至 YYYY-MM-DD”，并说明来源类型：npm、PyPI、GitHub API、搜索结果或抓取页面。
- 汇报工具使用时，区分 search query 和 fetch URL。不要把 `fetch_url` 读取的页面 URL 说成搜索 query。
- 解释 net-tools 默认 provider 顺序前，先调用 `search_status` 或查看 README，并区分非 CJK query 默认顺序和 CJK query 默认顺序。
- 工具返回的是材料，不是最终答案。你需要综合链接、摘要和抓取内容来回答。资料覆盖不完整时，用“找到的关键来源”或“目前可确认”，不要写成“全部数据完整”。

例子：
如果用户问“BERT 是什么？”，不要只搜索 `bert`。可以搜索：
1. BERT Bidirectional Encoder Representations from Transformers Google arXiv 1810.04805
2. BERT language model Google AI Wikipedia Hugging Face

然后阅读 arXiv、Wikipedia、Hugging Face、Google Research 或原论文等权威结果，再回答。
```