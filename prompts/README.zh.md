# Claude Code 提示词配置

本目录提供 `claude-code-net-tools` 的可复制提示词和替换说明。

## 文件

- `claude-code-search.zh.md`：中文提示词。
- `claude-code-search.en.md`：英文提示词。
- `README.zh.md`：中文替换说明。
- `README.en.md`：英文替换说明。

## 在 Claude Code 中启用

1. 先安装并启用这个 MCP server。默认服务名是 `net-tools`。
2. 选择一个提示词文件：中文用 `claude-code-search.zh.md`，英文用 `claude-code-search.en.md`。
3. 复制文件里的整个 `text` 代码块。
4. 粘贴到 Claude Code 实际加载的指令位置，例如项目里的 `CLAUDE.md`、全局记忆/自定义指令，或者临时测试时的会话首条消息。
5. 如果你添加 MCP 时使用的服务名不是 `net-tools`，把提示词里的 `net-tools` 改成你的实际服务名，例如 `net-tools-py`。
6. 保存后重启、reload，或开启新的 Claude Code 会话，让新提示词生效。

## 怎么换提示词

1. 修改对应的提示词源文件，例如 `claude-code-search.zh.md` 或 `claude-code-search.en.md`。
2. 把修改后的 `text` 代码块重新复制到 Claude Code 实际加载的指令位置。
3. 重启、reload，或开启新的会话。

注意：仓库里的 `prompts/` 文件不会自动生效。它们只是方便维护和复制的源文本；真正生效的是 Claude Code 当前读取到的项目说明、记忆或自定义指令。

## 常见修改

- 把 `net-tools` 换成你的 MCP 服务名。
- 增加你常用的权威来源，例如官方文档、arXiv、PyPI、npm、GitHub、政府网站或公司文档。
- 设置语言偏好，例如“用中文回答，但英文资料更权威时优先搜索英文来源”。
- 设置成本规则，例如“先试免费 provider；只有 `search_status` 显示免费 provider 不可用时才用付费 API provider”。