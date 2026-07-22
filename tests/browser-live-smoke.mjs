import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nodeServer = path.join(root, "claude_net_mcp.mjs");
const pythonServer = path.join(root, "claude_net_mcp.py");

function findPython() {
  const candidates = process.platform === "win32"
    ? [{ command: "py", args: ["-3"] }, { command: "python", args: [] }, { command: "python3", args: [] }]
    : [{ command: "python3", args: [] }, { command: "python", args: [] }];
  return candidates.find(({ command, args }) => {
    const check = spawnSync(command, [...args, "--version"], { encoding: "utf8", windowsHide: true });
    return !check.error && check.status === 0;
  }) || null;
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

class McpClient {
  constructor(label, command, args, env) {
    this.label = label;
    this.id = 0;
    this.buffer = "";
    this.pending = new Map();
    this.child = spawn(command, args, { cwd: root, env, stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
    this.child.stdout.setEncoding("utf8");
    this.child.stderr.setEncoding("utf8");
    this.stderr = "";
    this.child.stderr.on("data", (chunk) => { this.stderr += chunk; });
    this.child.stdout.on("data", (chunk) => {
      this.buffer += chunk;
      while (this.buffer.includes("\n")) {
        const split = this.buffer.indexOf("\n");
        const line = this.buffer.slice(0, split).trim();
        this.buffer = this.buffer.slice(split + 1);
        if (!line) continue;
        const message = JSON.parse(line);
        const pending = this.pending.get(message.id);
        if (!pending) continue;
        clearTimeout(pending.timer);
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(JSON.stringify(message.error)));
        else pending.resolve(message.result);
      }
    });
  }

  request(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(this.label + " timed out during " + method + "\n" + this.stderr));
      }, 180000);
      this.pending.set(id, { resolve, reject, timer });
      this.child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    });
  }

  async initialize() {
    await this.request("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "browser-live-smoke", version: "1" },
    });
  }

  async call(name, args) {
    const result = await this.request("tools/call", { name, arguments: args });
    const text = (result.content || []).map((item) => item.text || "").join("\n");
    assert.equal(result.isError, undefined, this.label + " " + name + " failed:\n" + text);
    return text;
  }

  async close() {
    this.child.stdin.end();
    await new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.child.kill();
        resolve();
      }, 15000);
      this.child.once("exit", () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }
}

async function runRuntime(label, command, args, url) {
  const workDir = path.join(os.tmpdir(), "claude-net-tools-browser-live-" + label + "-" + process.pid);
  const env = {
    ...process.env,
    CLAUDE_NET_PROXY: "direct",
    CLAUDE_NET_BROWSER_FALLBACK: "auto",
    CLAUDE_NET_BROWSER_WORK_DIR: workDir,
  };
  delete env.CLAUDE_NET_PLAYWRIGHT_COMMAND;
  delete env.CLAUDE_NET_PLAYWRIGHT_ARGS;
  const client = new McpClient(label, command, args, env);
  try {
    await client.initialize();
    const rendered = await client.call("browser_fetch", { url, max_chars: 2000, include_links: true });
    assert.match(rendered, /Rendered by real Playwright/);
    assert.match(rendered, /\/next/);

    const automatic = await client.call("fetch_url", { url, max_chars: 2000, browser: "auto" });
    assert.match(automatic, /Rendered by real Playwright/);
    assert.match(automatic, /Browser fallback reason:/);
  } finally {
    await client.close();
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

const server = http.createServer((req, res) => {
  if (req.url === "/app") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end("<!doctype html><html><head><title>Live Browser Fixture</title></head><body><main id='app'></main><script>document.querySelector('#app').innerHTML='<h1>Rendered by real Playwright</h1><p>Dynamic body is available.</p><a href=\"/next\">Next</a>';</script></body></html>");
    return;
  }
  res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
  res.end("next");
});

const port = await listen(server);
const url = "http://127.0.0.1:" + port + "/app";
try {
  await runRuntime("node", process.execPath, [nodeServer], url);
  const python = findPython();
  if (python) await runRuntime("python", python.command, [...python.args, pythonServer], url);
  console.log("Real Playwright browser smoke passed for Node" + (python ? " and Python." : "."));
} finally {
  server.close();
}
