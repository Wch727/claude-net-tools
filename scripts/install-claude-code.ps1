param(
  [string]$Name = "net-tools",
  [ValidateSet("local", "user", "project")]
  [string]$Scope = "local",
  [ValidateSet("auto", "node", "python")]
  [string]$Runtime = "auto",
  [string]$Proxy = "",
  [string]$Providers = "",
  [switch]$Python,
  [switch]$Force
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")

function Test-CommandAvailable([string]$Command) {
  return [bool](Get-Command $Command -ErrorAction SilentlyContinue)
}

if (-not (Test-CommandAvailable "claude")) {
  throw "Claude Code CLI 'claude' was not found in PATH. Install Claude Code first, then rerun this script."
}

if ($Python) {
  $Runtime = "python"
}

if ($Runtime -eq "auto") {
  if (Test-CommandAvailable "node") {
    $Runtime = "node"
  } elseif (Test-CommandAvailable "python") {
    $Runtime = "python"
  } else {
    throw "Neither 'node' nor 'python' was found in PATH. Install Node.js 20+ or Python 3.10+."
  }
}

$envArgs = @()
if ($Proxy.Trim()) {
  $envArgs += @("-e", "CLAUDE_NET_PROXY=$Proxy")
}
if ($Providers.Trim()) {
  $envArgs += @("-e", "CLAUDE_NET_SEARCH_PROVIDERS=$Providers")
}

if ($Runtime -eq "node") {
  if (-not (Test-CommandAvailable "node")) { throw "Runtime 'node' selected, but node was not found in PATH." }
  $Command = "node"
  $Entry = Join-Path $Root "claude_net_mcp.mjs"
} else {
  if (-not (Test-CommandAvailable "python")) { throw "Runtime 'python' selected, but python was not found in PATH." }
  $Command = "python"
  $Entry = Join-Path $Root "claude_net_mcp.py"
}

if (-not (Test-Path $Entry)) {
  throw "MCP entry file not found: $Entry"
}

if ($Force) {
  Write-Host "Removing existing Claude Code MCP server '$Name' if present..."
  & claude mcp remove $Name -s $Scope 2>$null | Out-Null
}

$argsList = @("mcp", "add", "--scope", $Scope, $Name)
if ($envArgs.Count -gt 0) {
  $argsList += $envArgs
  $argsList += "--"
}
$argsList += @($Command, $Entry)

Write-Host "Installing Claude Code MCP server '$Name' in $Scope scope with $Runtime runtime..."
Write-Host "claude $($argsList -join ' ')"
& claude @argsList

Write-Host ""
Write-Host "Done. In Claude Code, try: Use net-tools net_doctor live=true query='Claude Code MCP'."