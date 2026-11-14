// Single source of truth for every source cited in the deck. Slides refer to
// these entries by id — via a slide-level data-refs="id id" attribute and/or
// inline <sup data-cite="id"></sup> markers — and presentation.js renders the
// per-slide footer and the final "References" slide from them. Keeping the
// catalog here (instead of hand-written footers) means a slide can't cite a
// source the references slide forgets, or vice versa.
//
// `accessed` is when the source was last checked against the claim it backs.
const REFERENCE_GROUPS = [
  "Spec & standards process",
  "Chrome & Edge",
  "Browser positions",
  "Agents & ecosystem",
  "Security",
  "Guides",
];

// Portuguese labels for the groups above. Source titles stay in the
// language each source was published in.
const REFERENCE_GROUP_LABELS_PT = {
  "Spec & standards process": "Spec e processo de padronização",
  "Chrome & Edge": "Chrome e Edge",
  "Browser positions": "Posições dos navegadores",
  "Agents & ecosystem": "Agentes e ecossistema",
  Security: "Segurança",
  Guides: "Guias",
};

const REFERENCES = {
  // --- Spec & standards process -------------------------------------------
  spec: {
    title: "WebMCP — Draft Community Group Report (13 Nov 2026)",
    short: "WebMCP spec",
    url: "https://webmachinelearning.github.io/webmcp/",
    group: "Spec & standards process",
    accessed: "2026-11-13",
  },
  pr338: {
    title: "Remove declarative API from spec (webmcp PR #338, merged 8 Oct 2026)",
    short: "Spec PR #338",
    url: "https://github.com/webmachinelearning/webmcp/pull/338",
    group: "Spec & standards process",
    accessed: "2026-11-13",
  },
  pr375: {
    title: "Introduce generic tool calling explainer (webmcp PR #375, open)",
    short: "Spec PR #375 (proposal)",
    url: "https://github.com/webmachinelearning/webmcp/pull/375",
    group: "Spec & standards process",
    accessed: "2026-11-14",
  },
  declarativeExplainer: {
    title: "Declarative API explainer (webmcp repo)",
    short: "Declarative explainer",
    url: "https://github.com/webmachinelearning/webmcp/blob/main/declarative-api-explainer.md",
    group: "Spec & standards process",
    accessed: "2026-11-13",
  },
  tpacMinutes: {
    title: "WebML CG F2F at TPAC 2026 — minutes (27 Oct 2026)",
    short: "TPAC 2026 minutes",
    url: "https://www.w3.org/2026/10/27-webmachinelearning-minutes.html",
    group: "Spec & standards process",
    accessed: "2026-11-13",
  },
  charterPr829: {
    title: "[wg/webmachinelearning] Adds WebMCP in scope (w3c/charter-drafts PR #829)",
    short: "W3C charter draft PR #829",
    url: "https://github.com/w3c/charter-drafts/pull/829",
    group: "Spec & standards process",
    accessed: "2026-11-14",
  },

  // --- Chrome & Edge -------------------------------------------------------
  chromeOverview: {
    title: "WebMCP — Chrome for Developers (updated 7 Oct 2026)",
    short: "Chrome: WebMCP overview",
    url: "https://developer.chrome.com/docs/ai/webmcp",
    group: "Chrome & Edge",
    accessed: "2026-11-13",
  },
  chromeImperative: {
    title: "WebMCP Imperative API — Chrome for Developers (updated 16 Oct 2026)",
    short: "Chrome: Imperative API",
    url: "https://developer.chrome.com/docs/ai/webmcp/imperative-api",
    group: "Chrome & Edge",
    accessed: "2026-11-14",
  },
  chromeCompareMcp: {
    title: "WebMCP and MCP — Chrome for Developers (updated 27 Oct 2026)",
    short: "Chrome: WebMCP vs. MCP",
    url: "https://developer.chrome.com/docs/ai/webmcp/compare-mcp",
    group: "Chrome & Edge",
    accessed: "2026-11-14",
  },
  chromeOtBlog: {
    title: "Join the WebMCP origin trial — Chrome blog (9 Jun 2026)",
    short: "Chrome: origin trial blog",
    url: "https://developer.chrome.com/blog/ai-webmcp-origin-trial",
    group: "Chrome & Edge",
    accessed: "2026-11-14",
  },
  chromeIo26: {
    title: "Chrome at Google I/O 2026 — Chrome blog (19 May 2026)",
    short: "Chrome at I/O 2026",
    url: "https://developer.chrome.com/blog/chrome-at-io26",
    group: "Chrome & Edge",
    accessed: "2026-11-14",
  },
  chromeEpp: {
    title: "WebMCP early preview program — Chrome blog (10 Feb 2026)",
    short: "Chrome: early preview",
    url: "https://developer.chrome.com/blog/webmcp-epp",
    group: "Chrome & Edge",
    accessed: "2026-11-14",
  },
  blinkExtend: {
    title: "Intent to Extend Experiment: WebMCP — blink-dev thread (Sep 2026)",
    short: "blink-dev: Intent to Extend",
    url: "https://www.mail-archive.com/blink-dev@chromium.org/msg17897.html",
    group: "Chrome & Edge",
    accessed: "2026-11-13",
  },
  edgeBlog: {
    title: "New in Edge for developers — WebMCP ready for testing (21 Sep 2026)",
    short: "Edge blog",
    url: "https://blogs.windows.com/msedgedev/2026/09/21/new-in-edge-for-developers-create-better-components-and-make-your-site-agent-ready/",
    group: "Chrome & Edge",
    accessed: "2026-11-14",
  },
  edgeOt: {
    title: "WebMCP — Microsoft Edge origin trial (expires 30 Mar 2027)",
    short: "Edge origin trial",
    url: "https://developer.microsoft.com/en-us/microsoft-edge/origin-trials/trials/0b76fe60-b266-458e-a285-04e375c0c31a",
    group: "Chrome & Edge",
    accessed: "2026-11-13",
  },
  edgeLabs: {
    title: "MicrosoftEdge/webmcp-labs — samples and WebMCP Explorer",
    short: "Edge webmcp-labs",
    url: "https://github.com/MicrosoftEdge/webmcp-labs",
    group: "Chrome & Edge",
    accessed: "2026-11-14",
  },
  inspectorExtension: {
    title: "WebMCP - Model Context Tool Inspector (Chrome Web Store)",
    short: "Tool Inspector extension",
    url: "https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd",
    group: "Chrome & Edge",
    accessed: "2026-11-14",
  },

  // --- Browser positions ---------------------------------------------------
  webkitPosition: {
    title: "WebKit standards position on WebMCP — oppose (issue #670)",
    short: "WebKit position",
    url: "https://github.com/WebKit/standards-positions/issues/670",
    group: "Browser positions",
    accessed: "2026-11-14",
  },
  mozillaPosition: {
    title: "Mozilla standards position on WebMCP — neutral (issue #1412)",
    short: "Mozilla position",
    url: "https://github.com/mozilla/standards-positions/issues/1412",
    group: "Browser positions",
    accessed: "2026-11-14",
  },
  bravePr: {
    title: "[AI Chat]: Enable WebMCP by default (brave-core PR #40616)",
    short: "Brave PR #40616",
    url: "https://github.com/brave/brave-core/pull/40616",
    group: "Browser positions",
    accessed: "2026-11-14",
  },

  // --- Agents & ecosystem --------------------------------------------------
  openaiSiteTools: {
    title: "Site tools (WebMCP) — ChatGPT Learn",
    short: "OpenAI: site tools",
    url: "https://learn.chatgpt.com/docs/webmcp",
    group: "Agents & ecosystem",
    accessed: "2026-11-14",
  },
  ecosystemTracker: {
    title: "WebMCP Ecosystem Adoption Tracker (webmcp.com, updated 15 Oct 2026)",
    short: "Ecosystem tracker",
    url: "https://webmcp.com/ecosystem-tracker",
    group: "Agents & ecosystem",
    accessed: "2026-11-13",
  },

  // --- Security ------------------------------------------------------------
  chromeSecureTools: {
    title: "Build secure WebMCP tools — Chrome for Developers (updated 1 Sep 2026)",
    short: "Chrome: secure tools",
    url: "https://developer.chrome.com/docs/ai/webmcp/secure-tools",
    group: "Security",
    accessed: "2026-11-14",
  },
  chromeAgentSecurity: {
    title: "Agent security considerations for WebMCP — Chrome for Developers (9 Jun 2026)",
    short: "Chrome: agent security",
    url: "https://developer.chrome.com/docs/agents/security",
    group: "Security",
    accessed: "2026-11-14",
  },
  mcpAnnotations: {
    title: "Tool annotations — Model Context Protocol blog (16 Mar 2026)",
    short: "MCP blog: tool annotations",
    url: "https://blog.modelcontextprotocol.io/posts/2026-03-16-tool-annotations/",
    group: "Security",
    accessed: "2026-11-14",
  },
  lethalTrifecta: {
    title: "The lethal trifecta for AI agents — Simon Willison (16 Jun 2025)",
    short: "Lethal trifecta",
    url: "https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/",
    group: "Security",
    accessed: "2026-11-14",
  },

  // --- Guides --------------------------------------------------------------
  chromeBestPractices: {
    title: "WebMCP best practices — Chrome for Developers (updated 30 Oct 2026)",
    short: "Chrome: best practices",
    url: "https://developer.chrome.com/docs/ai/webmcp/best-practices",
    group: "Guides",
    accessed: "2026-11-14",
  },
};
