#!/usr/bin/env node

const args = process.argv.slice(2);
const evalIndex = args.indexOf("eval");
let result = "ok";

if (evalIndex >= 0) {
  const source = args[evalIndex + 1] || "";
  if (source.includes("totalChars") && source.includes("includeLinks")) {
    const content = "Rendered fixture body from Playwright. JavaScript content is now available.";
    result = JSON.stringify({
      finalUrl: "https://example.test/rendered",
      title: "Rendered Fixture",
      contentType: "text/html",
      content,
      totalChars: content.length,
      start: 0,
      end: content.length,
      links: [{ text: "Rendered Link", url: "https://example.test/next" }],
    });
  } else if (source.includes("rendered result(s)") || source.includes("const rows = []")) {
    result = JSON.stringify({
      pageUrl: "https://www.google.com/search?q=fixture",
      pageTitle: "fixture - Google Search",
      blocked: false,
      rows: [
        {
          title: "Principles of Neurodynamics and the Perceptron",
          url: "https://example.test/rosenblatt",
          snippet: "Frank Rosenblatt, XOR, and the 1962 book.",
        },
      ],
      bodyText: "",
    });
  } else {
    result = JSON.stringify({
      url: "https://example.com/",
      title: "Example Domain",
      text: "Example Domain rendered by Playwright",
    });
  }
}

process.stdout.write(JSON.stringify({ result }) + "\n");