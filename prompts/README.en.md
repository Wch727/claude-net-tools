# Claude Code Prompt Setup

This directory provides copyable prompts and replacement instructions for `claude-code-net-tools`.

## Files

- `claude-code-search.zh.md`: Chinese prompt.
- `claude-code-search.en.md`: English prompt.
- `README.zh.md`: Chinese setup guide.
- `README.en.md`: English setup guide.

## Enable In Claude Code

1. Install and enable this MCP server first. The default server name is `net-tools`.
2. Choose one prompt file: use `claude-code-search.zh.md` for Chinese, or `claude-code-search.en.md` for English.
3. Copy the full `text` code block from that file.
4. Paste it into the Claude Code instruction surface your setup actually loads, such as project `CLAUDE.md`, global memory/custom instructions, or the first message of a session for quick testing.
5. If your MCP server name is not `net-tools`, replace `net-tools` in the prompt with your actual server name, such as `net-tools-py`.
6. Save and restart, reload, or open a new Claude Code session so the instructions become active.

## How To Replace The Prompt

1. Edit the source prompt file, such as `claude-code-search.zh.md` or `claude-code-search.en.md`.
2. Copy the updated `text` code block into the Claude Code instruction surface that is actually loaded.
3. Restart, reload, or open a new session.

Note: files under `prompts/` do not become active automatically. They are source copies for maintenance and copying; the active prompt is whatever Claude Code reads from your project instructions, memory, or custom instructions.

## Common Edits

- Change `net-tools` to your MCP server name.
- Add preferred authoritative sources, such as official docs, arXiv, PyPI, npm, GitHub, government sites, or company docs.
- Add language preferences, for example: "answer in Chinese, but search English sources first when they are more authoritative".
- Add cost rules, for example: "try free providers first; use paid API providers only after `search_status` shows free providers are failing".