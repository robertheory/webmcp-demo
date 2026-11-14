# WebMCP: ensinando a Web a conversar com agentes de IA

*Teaching the Web to talk to AI agents.*

Today, an AI agent uses your website the way a tourist reads a menu in a
language they don't speak: it takes screenshots, guesses what each button
does, and hopes the layout didn't change since yesterday.

**What if the page just told the agent what it can do?**

That's WebMCP: a proposed web standard, already in an origin trial in Chrome
and Edge and shipping inside ChatGPT's desktop browser, that lets a page hand
an agent a list of typed tools instead of a screenshot. This repository is a
portable talk about it — slides plus a live demo — with every claim linked
to its source.

### ▶ [Open the presentation](https://robertheory.github.io/webmcp-demo/) · [Try the live demo](https://robertheory.github.io/webmcp-demo/demo/)

## What the talk covers

- Why scraping pixels and DOM is a dead end for agents, and what a tool call changes.
- How a page registers a tool, and how an agent calls it.
- The uncomfortable part: prompt injection, the "lethal trifecta", and what annotations can and can't promise.
- Where it really stands in November 2026 — who ships it, who opposes it, and what's about to change.

## The demo

A small tech-events site where almost everything you can click is also a
tool an agent can call. Ask an agent to summarize the reviews of the AI
Agents Hackathon and see what happens — one of those reviews wasn't written
for humans.

To let an agent in, turn on `chrome://flags/#enable-webmcp-testing` in Chrome
(or use the ChatGPT desktop app's built-in browser). The
[demo README](demo/README.md) has a five-minute script for driving it with a
real agent.

## Presenting it

Clone or download the repository and open `index.html` in a browser. That's
it: no build, no server, nothing to install. The demo also works straight
from disk (`demo/index.html`), including WebMCP itself in Chrome with the flag
above. The styles load Bootstrap from a CDN, so keep an internet connection.

The talk and the demo are in Brazilian Portuguese, with a PT / EN switch
(or add `?lang=en` to the URL); the choice carries over between the two.

It's built for a slide clicker: nothing on a slide needs a click. Clickers
(PageDown/PageUp), arrows and Space move between slides; the operator can
press **F** for fullscreen, **D** to open the demo and **L** to switch
language — the same three actions as the icons in the bottom-right corner.
Every slide lists its sources in a footer, and the last slides index them
by slide.

## References

Every source cited in the presentation, grouped by topic (accessed 13–14
Nov 2026). The slides cite them from a single catalog,
[`js/references.js`](js/references.js), and the deck's last slides list
them by slide.

**Spec & standards process**

- [WebMCP — Draft Community Group Report](https://webmachinelearning.github.io/webmcp/)
- [Remove declarative API from spec — webmcp PR #338](https://github.com/webmachinelearning/webmcp/pull/338)
- [Introduce generic tool calling explainer — webmcp PR #375 (open)](https://github.com/webmachinelearning/webmcp/pull/375)
- [Declarative API explainer](https://github.com/webmachinelearning/webmcp/blob/main/declarative-api-explainer.md)
- [WebML CG F2F at TPAC 2026 — minutes (27 Oct 2026)](https://www.w3.org/2026/10/27-webmachinelearning-minutes.html)
- [Adds WebMCP in scope — w3c/charter-drafts PR #829](https://github.com/w3c/charter-drafts/pull/829)

**Chrome & Edge**

- [WebMCP — Chrome for Developers](https://developer.chrome.com/docs/ai/webmcp)
- [WebMCP Imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api)
- [WebMCP and MCP](https://developer.chrome.com/docs/ai/webmcp/compare-mcp)
- [Join the WebMCP origin trial (9 Jun 2026)](https://developer.chrome.com/blog/ai-webmcp-origin-trial)
- [Chrome at Google I/O 2026 (19 May 2026)](https://developer.chrome.com/blog/chrome-at-io26)
- [WebMCP early preview program (10 Feb 2026)](https://developer.chrome.com/blog/webmcp-epp)
- [Intent to Extend Experiment: WebMCP — blink-dev](https://www.mail-archive.com/blink-dev@chromium.org/msg17897.html)
- [New in Edge for developers — WebMCP ready for testing (21 Sep 2026)](https://blogs.windows.com/msedgedev/2026/09/21/new-in-edge-for-developers-create-better-components-and-make-your-site-agent-ready/)
- [WebMCP — Microsoft Edge origin trial](https://developer.microsoft.com/en-us/microsoft-edge/origin-trials/trials/0b76fe60-b266-458e-a285-04e375c0c31a)
- [MicrosoftEdge/webmcp-labs](https://github.com/MicrosoftEdge/webmcp-labs)
- [WebMCP - Model Context Tool Inspector](https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd)

**Browser positions**

- [WebKit standards position — oppose (#670)](https://github.com/WebKit/standards-positions/issues/670)
- [Mozilla standards position — neutral (#1412)](https://github.com/mozilla/standards-positions/issues/1412)
- [Enable WebMCP by default — brave-core PR #40616](https://github.com/brave/brave-core/pull/40616)

**Agents & ecosystem**

- [Site tools (WebMCP) — ChatGPT Learn](https://learn.chatgpt.com/docs/webmcp)
- [WebMCP Ecosystem Adoption Tracker](https://webmcp.com/ecosystem-tracker)

**Security**

- [Build secure WebMCP tools](https://developer.chrome.com/docs/ai/webmcp/secure-tools)
- [Agent security considerations for WebMCP](https://developer.chrome.com/docs/agents/security)
- [Tool annotations — Model Context Protocol blog](https://blog.modelcontextprotocol.io/posts/2026-03-16-tool-annotations/)
- [The lethal trifecta for AI agents — Simon Willison](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/)

**Guides**

- [WebMCP best practices](https://developer.chrome.com/docs/ai/webmcp/best-practices)
