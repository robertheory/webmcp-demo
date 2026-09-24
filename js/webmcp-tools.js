// Shared WebMCP wiring used by both pages: imperative tool registration,
// browser-support detection, and a manual "tool tester" debug panel.
//
// WebMCP (https://webmachinelearning.github.io/webmcp/) lets a page expose
// callable "tools" to an AI agent running in the browser. There are two ways
// to define a tool:
//
//   1. Declarative — annotate an existing <form> with toolname/tooldescription
//      attributes. The browser derives the tool + its input schema from the
//      form fields. See the <form toolname="search_events" ...> in index.html.
//
//   2. Imperative — call modelContext.registerTool({...}) from JavaScript.
//      Use this when the action isn't a form submission (e.g. favoriting a
//      card) or when you need full control over the input schema / result.
//      That's what this file does below.
//
// The API is still experimental (Chrome, behind a flag). We feature-detect
// it so the demo still works — and is still testable — without it.

function getModelContext() {
  // Spec draft exposes it on `document`; some early implementations expose
  // it on `navigator` instead. Support both without assuming either.
  return window.document.modelContext || window.navigator.modelContext || null;
}

function isWebMcpSupported() {
  return !!getModelContext();
}

// Registers the tools that don't fit the declarative <form> pattern:
// favoriting is a click, not a form submission, and reading event details
// or the favorites list is a pure query.
async function registerImperativeTools() {
  const modelContext = getModelContext();
  if (!modelContext) return;

  await modelContext.registerTool({
    name: "favorite_event",
    description: "Add a tech event to the user's favorites list by its id.",
    inputSchema: {
      type: "object",
      properties: {
        eventId: { type: "string", description: "The id of the event to favorite." },
      },
      required: ["eventId"],
    },
    execute: async ({ eventId }) => {
      const event = EVENTS.find((e) => e.id === eventId);
      if (!event) {
        return { content: [{ type: "text", text: `No event found with id "${eventId}".` }] };
      }
      if (!isFavorite(event.id)) toggleFavorite(event.id);
      return { content: [{ type: "text", text: `Favorited "${event.title}".` }] };
    },
  });

  await modelContext.registerTool({
    name: "unfavorite_event",
    description: "Remove a tech event from the user's favorites list by its id.",
    inputSchema: {
      type: "object",
      properties: {
        eventId: { type: "string", description: "The id of the event to unfavorite." },
      },
      required: ["eventId"],
    },
    execute: async ({ eventId }) => {
      const event = EVENTS.find((e) => e.id === eventId);
      if (!event) {
        return { content: [{ type: "text", text: `No event found with id "${eventId}".` }] };
      }
      if (isFavorite(event.id)) toggleFavorite(event.id);
      return { content: [{ type: "text", text: `Unfavorited "${event.title}".` }] };
    },
  });

  await modelContext.registerTool({
    name: "list_favorite_events",
    description: "List the tech events the user has favorited.",
    inputSchema: { type: "object", properties: {} },
    execute: async () => {
      const favorites = EVENTS.filter((e) => isFavorite(e.id));
      return {
        content: [{ type: "text", text: JSON.stringify(favorites, null, 2) }],
      };
    },
  });

  await modelContext.registerTool({
    name: "get_event_details",
    description: "Get full details for a single tech event by its id.",
    inputSchema: {
      type: "object",
      properties: {
        eventId: { type: "string", description: "The id of the event to look up." },
      },
      required: ["eventId"],
    },
    execute: async ({ eventId }) => {
      const event = EVENTS.find((e) => e.id === eventId);
      if (!event) {
        return { content: [{ type: "text", text: `No event found with id "${eventId}".` }] };
      }
      return { content: [{ type: "text", text: JSON.stringify(event, null, 2) }] };
    },
  });
}

// Renders a banner explaining whether WebMCP is available in this browser.
function renderSupportBanner(container) {
  if (isWebMcpSupported()) {
    container.innerHTML = `
      <div class="alert alert-success py-2 mb-3" role="alert">
        WebMCP is available in this browser (<code>${
          window.document.modelContext ? "document.modelContext" : "navigator.modelContext"
        }</code>). Open the tool tester (wrench icon, top right) to see the registered tools.
      </div>`;
    return;
  }
  container.innerHTML = `
    <div class="alert alert-warning py-2 mb-3" role="alert">
      WebMCP isn't available in this browser, so no real agent can call these tools right now.
      This demo still works for browsing/favoriting; open the <strong>tool tester</strong>
      (wrench icon, top right) to simulate what an agent would do. WebMCP is experimental —
      try Chrome Canary with <code>chrome://flags/#web-machine-learning-model-context</code>
      enabled.
    </div>`;
}

// Builds a sample JSON body for a tool from its inputSchema, so the tester
// popover comes pre-filled instead of an empty "{}". The only field our
// tools ever ask for is `eventId`, so that's the only one we know how to
// fill with something meaningful; anything else is left blank.
function buildSampleInput(tool, sampleEventId) {
  const properties = (tool.inputSchema && tool.inputSchema.properties) || {};
  const body = {};
  for (const key of Object.keys(properties)) {
    body[key] = key === "eventId" ? sampleEventId : "";
  }
  return JSON.stringify(body, null, 2);
}

// Explains what this popover is for and points to a real WebMCP extension —
// shown whether or not this browser can register tools, since it's context
// the reader needs either way.
function testerIntro() {
  return `
    <p class="small text-muted mb-2">
      This is a stand-in for a real AI agent: it lists every WebMCP tool this
      page registered and lets you call it manually, the same way an agent
      would via <code>executeTool()</code>. Install the
      <a href="https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd" target="_blank" rel="noopener noreferrer">WebMCP - Model Context Tool Inspector</a>
      to have a real agent call these tools instead of testing them here.
    </p>`;
}

function buildTesterContent(tools, sampleEventId) {
  if (!tools.length) {
    return testerIntro() + '<p class="text-muted small mb-0">No tools registered.</p>';
  }
  const cards = tools
    .map(
      (tool, i) => `
    <div class="border rounded p-2 mb-2">
      <code class="small">${tool.name}</code>
      <div class="text-muted small mb-1">${tool.description || ""}</div>
      <textarea class="form-control form-control-sm font-monospace" rows="4"
        data-tool-input="${i}">${buildSampleInput(tool, sampleEventId)}</textarea>
      <button class="btn btn-sm btn-outline-primary mt-1" data-run-tool="${i}">Run</button>
      <pre class="small mt-1 mb-0 bg-body-tertiary p-2 rounded" data-tool-result="${i}"></pre>
    </div>`
    )
    .join("");
  return testerIntro() + cards;
}

// A tool's result comes back as { content: [{ type: "text", text: "..." }] }.
// Our tools often put a JSON string in that `text` field (get_event_details,
// list_favorite_events) — show it parsed and pretty-printed instead of an
// escaped string inside the envelope. Plain messages (favorite_event, ...)
// aren't JSON, so they're just shown as-is.
function formatToolOutput(output) {
  if (!output || !Array.isArray(output.content)) {
    return JSON.stringify(output, null, 2);
  }
  return output.content
    .map((item) => {
      if (item.type !== "text") return JSON.stringify(item, null, 2);
      try {
        return JSON.stringify(JSON.parse(item.text), null, 2);
      } catch {
        return item.text;
      }
    })
    .join("\n");
}

// Wires a Bootstrap Popover, anchored to `triggerEl`, that lets you call any
// registered tool by hand — the way an AI agent would via executeTool().
// Bootstrap's default click-trigger popover doesn't auto-close on an
// outside click, so it naturally stays open while you interact with the
// rest of the page (favoriting, searching, ...).
async function initTesterPopover(triggerEl, { sampleEventId } = {}) {
  const modelContext = getModelContext();

  if (!modelContext) {
    new bootstrap.Popover(triggerEl, {
      trigger: "click",
      html: true,
      sanitize: false,
      placement: "bottom",
      customClass: "webmcp-tester-popover",
      title: "WebMCP tool tester",
      content:
        testerIntro() +
        '<p class="text-muted small mb-0">No tools are registered in this browser yet — ' +
        "install the extension above and reload.</p>",
    });
    return;
  }

  const tools = await modelContext.getTools();
  const fallbackEventId = sampleEventId || EVENTS[0].id;
  const content = buildTesterContent(tools, fallbackEventId);

  const popover = new bootstrap.Popover(triggerEl, {
    trigger: "click",
    html: true,
    sanitize: false,
    placement: "bottom",
    customClass: "webmcp-tester-popover",
    title: "WebMCP tool tester",
    content,
  });

  // The popover's DOM is (re)inserted into the page every time it's shown,
  // so the Run buttons need their listeners rebound on each open.
  triggerEl.addEventListener("shown.bs.popover", () => {
    const tip = document.querySelector(".popover.show");
    if (!tip) return;
    tools.forEach((tool, i) => {
      const button = tip.querySelector(`[data-run-tool="${i}"]`);
      if (!button || button.dataset.bound) return;
      button.dataset.bound = "true";
      button.addEventListener("click", async () => {
        const input = tip.querySelector(`[data-tool-input="${i}"]`);
        const result = tip.querySelector(`[data-tool-result="${i}"]`);
        try {
          const parsedInput = JSON.parse(input.value || "{}");
          const output = await modelContext.executeTool(tool, parsedInput);
          result.textContent = formatToolOutput(output);
        } catch (err) {
          result.textContent = `Error: ${err.message}`;
        }
      });
    });
  });
}
