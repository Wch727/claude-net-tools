#!/usr/bin/env bash
set -euo pipefail

NAME="net-tools"
SCOPE="local"
RUNTIME="auto"
PROXY=""
PROVIDERS=""
FORCE="0"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name) NAME="$2"; shift 2 ;;
    --scope) SCOPE="$2"; shift 2 ;;
    --runtime) RUNTIME="$2"; shift 2 ;;
    --proxy) PROXY="$2"; shift 2 ;;
    --providers) PROVIDERS="$2"; shift 2 ;;
    --python) RUNTIME="python"; shift ;;
    --force) FORCE="1"; shift ;;
    -h|--help)
      cat <<'HELP'
Usage: scripts/install-claude-code.sh [--name net-tools] [--scope local|user|project] [--runtime auto|node|python] [--proxy URL|direct] [--providers LIST] [--force]

Examples:
  scripts/install-claude-code.sh
  scripts/install-claude-code.sh --proxy http://127.0.0.1:7890
  scripts/install-claude-code.sh --providers bing_rss,duckduckgo,bing_html
HELP
      exit 0
      ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

case "$SCOPE" in local|user|project) ;; *) echo "--scope must be local, user, or project" >&2; exit 2 ;; esac

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

command -v claude >/dev/null 2>&1 || { echo "Claude Code CLI 'claude' was not found in PATH." >&2; exit 1; }

if [[ "$RUNTIME" == "auto" ]]; then
  if command -v node >/dev/null 2>&1; then
    RUNTIME="node"
  elif command -v python3 >/dev/null 2>&1 || command -v python >/dev/null 2>&1; then
    RUNTIME="python"
  else
    echo "Neither node nor python was found in PATH. Install Node.js 20+ or Python 3.10+." >&2
    exit 1
  fi
fi

args=(mcp add --scope "$SCOPE" "$NAME")
if [[ -n "$PROXY" ]]; then
  args+=(-e "CLAUDE_NET_PROXY=$PROXY")
fi
if [[ -n "$PROVIDERS" ]]; then
  args+=(-e "CLAUDE_NET_SEARCH_PROVIDERS=$PROVIDERS")
fi
if [[ -n "$PROXY" || -n "$PROVIDERS" ]]; then
  args+=(--)
fi

if [[ "$RUNTIME" == "node" ]]; then
  command -v node >/dev/null 2>&1 || { echo "Runtime node selected, but node was not found in PATH." >&2; exit 1; }
  entry="$ROOT/claude_net_mcp.mjs"
  cmd="node"
elif [[ "$RUNTIME" == "python" ]]; then
  if command -v python3 >/dev/null 2>&1; then cmd="python3"; else cmd="python"; fi
  command -v "$cmd" >/dev/null 2>&1 || { echo "Runtime python selected, but python was not found in PATH." >&2; exit 1; }
  entry="$ROOT/claude_net_mcp.py"
else
  echo "--runtime must be auto, node, or python" >&2
  exit 2
fi

[[ -f "$entry" ]] || { echo "MCP entry file not found: $entry" >&2; exit 1; }

if [[ "$FORCE" == "1" ]]; then
  echo "Removing existing Claude Code MCP server '$NAME' if present..."
  claude mcp remove "$NAME" -s "$SCOPE" >/dev/null 2>&1 || true
fi

args+=("$cmd" "$entry")

echo "Installing Claude Code MCP server '$NAME' in $SCOPE scope with $RUNTIME runtime..."
printf 'claude'; printf ' %q' "${args[@]}"; printf '\n'
claude "${args[@]}"

echo
echo "Done. In Claude Code, try: Use net-tools net_doctor live=true query='Claude Code MCP'."