// Event detail page: reads ?id= from the URL, renders the event, and wires
// the favorite button. get_event_details/list_favorite_events are shared
// with the home page via registerSharedTools() in webmcp-tools.js.
//
// Favoriting here works differently from the home page's favorite_event(id):
// this page already knows which event it's showing, so it registers a
// single no-argument tool — "favorite_this_event" or "unfavorite_this_event"
// — and swaps which one exists whenever the favorite state changes. That
// swap is done with the AbortSignal that registerTool() accepts: aborting it
// unregisters the tool, which is what lets us replace one with the other
// instead of ending up with both registered at once.

let currentEvent = null;
let favoriteToolAbortController = null;
let testerPopover = null;

function renderEventDetail() {
  const params = new URLSearchParams(window.location.search);
  currentEvent = EVENTS.find((e) => e.id === params.get("id"));
  const container = document.getElementById("event-detail");

  if (!currentEvent) {
    container.innerHTML = `<p class="text-danger">Event not found.</p>`;
    return;
  }

  const favorited = isFavorite(currentEvent.id);
  container.innerHTML = `
    <div class="d-flex justify-content-between align-items-start">
      <h1 class="h3">${currentEvent.title}</h1>
      <button
        id="favorite-toggle"
        class="btn ${favorited ? "btn-danger" : "btn-outline-danger"}"
      >${favorited ? "&#9829; Favorited" : "&#9825; Favorite"}</button>
    </div>
    <span class="badge text-bg-secondary mb-2">${currentEvent.category}</span>
    <p class="text-muted">${currentEvent.date} &middot; ${currentEvent.location}</p>
    <p>${currentEvent.description}</p>
    <a href="${currentEvent.url}" target="_blank" rel="noopener noreferrer">${currentEvent.url}</a>
    <p class="text-muted small mt-3">Event id: <code>${currentEvent.id}</code></p>
  `;

  document.getElementById("favorite-toggle").addEventListener("click", handleFavoriteToggle);
}

// Registers whichever of favorite_this_event / unfavorite_this_event
// matches the current state, unregistering the other one first. Neither
// takes an eventId — they're scoped to whatever event this page is showing.
async function registerFavoriteToggleTool(modelContext) {
  if (favoriteToolAbortController) favoriteToolAbortController.abort();
  favoriteToolAbortController = new AbortController();

  const favorited = isFavorite(currentEvent.id);
  const tool = favorited
    ? {
        name: "unfavorite_this_event",
        description: `Remove "${currentEvent.title}" (the event currently open on this page) from favorites. No input needed.`,
        inputSchema: { type: "object", properties: {} },
        execute: async () => {
          toggleFavorite(currentEvent.id);
          await handleFavoriteChanged();
          return { content: [{ type: "text", text: `Unfavorited "${currentEvent.title}".` }] };
        },
      }
    : {
        name: "favorite_this_event",
        description: `Add "${currentEvent.title}" (the event currently open on this page) to favorites. No input needed.`,
        inputSchema: { type: "object", properties: {} },
        execute: async () => {
          toggleFavorite(currentEvent.id);
          await handleFavoriteChanged();
          return { content: [{ type: "text", text: `Favorited "${currentEvent.title}".` }] };
        },
      };

  await modelContext.registerTool(tool, { signal: favoriteToolAbortController.signal });
}

// Re-renders the page, re-registers the (now opposite) favorite tool, and
// rebuilds the tester popover so it reflects the swapped tool name. Runs
// whether the toggle came from the button click or from an agent calling
// the tool directly, so both paths stay in sync.
async function handleFavoriteChanged() {
  renderEventDetail();
  const modelContext = getModelContext();
  if (!modelContext) return;
  await registerFavoriteToggleTool(modelContext);
  await refreshTesterPopover();
}

function handleFavoriteToggle() {
  toggleFavorite(currentEvent.id);
  handleFavoriteChanged();
}

// The popover's tool list is a snapshot taken at init time, so it needs to
// be rebuilt (dispose + re-init) whenever the page's tools change — which
// happens here every time the favorite state flips.
async function refreshTesterPopover() {
  if (testerPopover) testerPopover.dispose();
  testerPopover = await initTesterPopover(document.getElementById("tester-toggle"), {
    sampleEventId: currentEvent ? currentEvent.id : EVENTS[0].id,
  });
}

renderSupportBanner(document.getElementById("support-banner"));
renderEventDetail();

(async () => {
  await registerSharedTools();
  const modelContext = getModelContext();
  if (modelContext && currentEvent) {
    await registerFavoriteToggleTool(modelContext);
  }
  await refreshTesterPopover();
})();
