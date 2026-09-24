// Shared WebMCP wiring used by both pages: tool registration, browser
// support detection, and a manual "tool tester" debug popover.
//
// WebMCP (https://webmachinelearning.github.io/webmcp/) lets a page expose
// callable "tools" to an AI agent running in the browser. There are two ways
// to define a tool:
//
//   1. Declarative — annotate an existing <form> with toolname/tooldescription
//      attributes. The browser derives the tool + its input schema from the
//      form fields. See <form toolname="search_events" ...> in index.html and
//      the second example, <form toolname="favorite_event_declarative" ...>.
//
//   2. Imperative — call modelContext.registerTool({...}) from JavaScript.
//      Use this when the action isn't a form submission, or when you need
//      full control over the input schema / result. That's what the tools
//      below do.
//
// The API is still experimental (Chrome, behind a flag, or the WebMCP
// extension). We feature-detect it so the demo still works — and is still
// testable — without it.

function getModelContext() {
  // Spec draft exposes it on `document`; some early implementations expose
  // it on `navigator` instead. Support both without assuming either.
  return window.document.modelContext || window.navigator.modelContext || null;
}

function isWebMcpSupported() {
  return !!getModelContext();
}

// Tools useful on every page: reading event details, reading favorites, and
// a deliberately slow tool that demonstrates cancellation via AbortSignal
// (registerTool/executeTool both accept a `signal` per the spec's WebIDL —
// executeTool's signal is forwarded into the tool's own execute callback).
async function registerSharedTools() {
  const modelContext = getModelContext();
  if (!modelContext) return;

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
    // readOnlyHint tells an agent (or a human skimming the tool list) that
    // calling this is always safe — it never changes anything.
    annotations: { readOnlyHint: true },
    execute: async ({ eventId }) => {
      const event = EVENTS.find((e) => e.id === eventId);
      if (!event) {
        return { content: [{ type: "text", text: `No event found with id "${eventId}".` }] };
      }
      return { content: [{ type: "text", text: JSON.stringify(event, null, 2) }] };
    },
  });

  await modelContext.registerTool({
    name: "list_favorite_events",
    description: "List the tech events the user has favorited.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => {
      const favorites = EVENTS.filter((e) => isFavorite(e.id));
      return { content: [{ type: "text", text: JSON.stringify(favorites, null, 2) }] };
    },
  });

  await modelContext.registerTool({
    name: "sync_favorites_to_cloud",
    description:
      "Simulates a slow 5s network sync of the favorites list. Exists to demonstrate " +
      "tool cancellation: call it, then hit Cancel in the tool tester before it finishes.",
    inputSchema: { type: "object", properties: {} },
    execute: async (_input, { signal }) => {
      await new Promise((resolve, reject) => {
        if (signal.aborted) {
          reject(new DOMException("Cancelled", "AbortError"));
          return;
        }
        const timer = setTimeout(resolve, 5000);
        signal.addEventListener("abort", () => {
          clearTimeout(timer);
          reject(new DOMException("Cancelled", "AbortError"));
        });
      });
      return { content: [{ type: "text", text: "Synced favorites to the cloud (simulated)." }] };
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

// Renders the annotations a tool declared (see ToolAnnotations in the spec)
// as small badges, so the tester makes an otherwise invisible bit of the
// tool's metadata visible.
function annotationBadges(tool) {
  const a = tool.annotations || {};
  const badges = [];
  if (a.readOnlyHint) badges.push('<span class="badge text-bg-success">read-only</span>');
  if (a.consequentialHint) badges.push('<span class="badge text-bg-danger">consequential</span>');
  if (a.untrustedContentHint)
    badges.push('<span class="badge text-bg-warning">untrusted output</span>');
  if (a.debugging) badges.push('<span class="badge text-bg-secondary">debug</span>');
  return badges.join(" ");
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
    .map((tool, i) => {
      const badges = annotationBadges(tool);
      return `
    <div class="border rounded p-2 mb-2">
      <code class="small">${tool.name}</code>
      ${badges ? `<div class="mb-1">${badges}</div>` : ""}
      <div class="text-muted small mb-1">${tool.description || ""}</div>
      <textarea class="form-control form-control-sm font-monospace" rows="4"
        data-tool-input="${i}">${buildSampleInput(tool, sampleEventId)}</textarea>
      <div class="d-flex gap-1 mt-1">
        <button class="btn btn-sm btn-outline-primary" data-run-tool="${i}">Run</button>
        <button class="btn btn-sm btn-outline-secondary" data-cancel-tool="${i}" disabled>Cancel</button>
      </div>
      <pre class="small mt-1 mb-0 bg-body-tertiary p-2 rounded" data-tool-result="${i}"></pre>
    </div>`;
    })
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
//
// Returns the created bootstrap.Popover instance (or null when WebMCP isn't
// supported) so a page that swaps its own tools at runtime — see
// registerFavoriteToggleTool() in event.js — can dispose() and re-init this
// popover to pick up the change.
async function initTesterPopover(triggerEl, { sampleEventId } = {}) {
  const modelContext = getModelContext();

  if (!modelContext) {
    return new bootstrap.Popover(triggerEl, {
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
  }

  // toolchange fires whenever registerTool()/an aborted registration signal
  // adds or removes a tool. We flash the wrench icon so that otherwise
  // invisible lifecycle event becomes visible. Guarded so re-running
  // initTesterPopover (see event.js) doesn't stack up duplicate listeners.
  if (!modelContext.__testerToolChangeBound) {
    modelContext.__testerToolChangeBound = true;
    modelContext.addEventListener("toolchange", () => {
      triggerEl.classList.add("tool-changed-flash");
      setTimeout(() => triggerEl.classList.remove("tool-changed-flash"), 800);
    });
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
  // so the Run/Cancel buttons need their listeners rebound on each open.
  // We replace (rather than stack) this listener on every init call, since
  // event.js re-inits this popover each time the page's tools change.
  if (triggerEl.__testerShownListener) {
    triggerEl.removeEventListener("shown.bs.popover", triggerEl.__testerShownListener);
  }
  const shownListener = () => {
    const tip = document.querySelector(".popover.show");
    if (!tip) return;
    const controllers = {};
    tools.forEach((tool, i) => {
      const runButton = tip.querySelector(`[data-run-tool="${i}"]`);
      const cancelButton = tip.querySelector(`[data-cancel-tool="${i}"]`);
      if (!runButton || runButton.dataset.bound) return;
      runButton.dataset.bound = "true";

      runButton.addEventListener("click", async () => {
        const input = tip.querySelector(`[data-tool-input="${i}"]`);
        const result = tip.querySelector(`[data-tool-result="${i}"]`);
        const controller = new AbortController();
        controllers[i] = controller;
        runButton.disabled = true;
        cancelButton.disabled = false;
        try {
          const parsedInput = JSON.parse(input.value || "{}");
          const output = await modelContext.executeTool(tool, parsedInput, {
            signal: controller.signal,
          });
          result.textContent = formatToolOutput(output);
        } catch (err) {
          result.textContent = `Error: ${err.message}`;
        } finally {
          runButton.disabled = false;
          cancelButton.disabled = true;
          delete controllers[i];
        }
      });

      cancelButton.addEventListener("click", () => {
        controllers[i]?.abort();
      });
    });
  };
  triggerEl.__testerShownListener = shownListener;
  triggerEl.addEventListener("shown.bs.popover", shownListener);

  return popover;
}
