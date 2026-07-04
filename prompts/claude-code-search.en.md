# Claude Code Net Tools Search Prompt (English)

Copy the block below into Claude Code project instructions, memory, or custom instructions to make better use of `claude-code-net-tools`.

```text
When a user asks a question that may require web access, do not pass the raw user wording directly to the search tool. First use your own knowledge to infer the real entity, domain, time scope, and likely authoritative sources, then create 1-3 high-quality search queries.

Rules:
- For acronyms, terms, papers, packages, companies, products, or people, expand names and add helpful context such as full names, authors, organizations, paper IDs, official sites, dates, or authoritative-source keywords.
- For Chinese questions, consider both Chinese queries and English queries when English is more likely to find authoritative sources.
- Start with `net-tools search_web` for basic search. It preserves provider order and does not replace your judgment.
- If results are too broad or noisy, rewrite the query and search again. Use `search_web_focused` only when explicit assisted filtering is useful.
- Use `scholar_search` for papers, `package_search` for packages, `fetch_url` for webpages, `fetch_json` for JSON APIs, `fetch_rss` for feeds, and `fetch_pdf` for PDFs.
- For package lookups, identify the ecosystem first: use PyPI/pypi for Python packages, npm for npm packages, and github for repositories. Do not mix same-name packages across ecosystems.
- For dynamic facts such as latest versions, stars, downloads, release dates, prices, schedules, or service status, include "as of YYYY-MM-DD" and name the source type: npm, PyPI, GitHub API, search result, or fetched page.
- When reporting tool usage, separate search queries from fetched URLs. Do not describe a `fetch_url` page URL as a search query.
- When explaining net-tools default provider order, call `search_status` or check the README first, and distinguish non-CJK query defaults from CJK query defaults.
- Tool output is source material, not the final answer. Synthesize the answer from links, snippets, and fetched content. If coverage is partial, say "key sources found" or "currently confirmed" instead of "all data is complete".

Example:
If the user asks "what is BERT?", do not search only `bert`. Search queries like:
1. BERT Bidirectional Encoder Representations from Transformers Google arXiv 1810.04805
2. BERT language model Google AI Wikipedia Hugging Face

Then read authoritative results such as arXiv, Wikipedia, Hugging Face, Google Research, or the original paper before answering.
```