// Home page logic: renders the event grid, wires the declarative search
// and favorite forms, registers the page's imperative tools, and boots the
// WebMCP tool tester popover.

function renderEvents(events) {
  const grid = document.getElementById("event-grid");
  const emptyState = document.getElementById("empty-state");

  if (!events.length) {
    grid.innerHTML = "";
    emptyState.classList.remove("d-none");
    return;
  }
  emptyState.classList.add("d-none");

  grid.innerHTML = events
    .map((event) => {
      const favorited = isFavorite(event.id);
      return `
      <div class="col-md-6 col-lg-4">
        <div class="card h-100 event-card">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start">
              <h3 class="h6 mb-1">
                <a href="event.html?id=${event.id}" class="text-decoration-none">${event.title}</a>
              </h3>
              <button
                class="btn btn-link p-0 favorite-btn ${favorited ? "active" : ""}"
                data-favorite-id="${event.id}"
                aria-label="Toggle favorite"
                title="Toggle favorite"
              >${favorited ? "&#9829;" : "&#9825;"}</button>
            </div>
            <span class="badge text-bg-secondary mb-2 align-self-start">${event.category}</span>
            <p class="text-muted small mb-2">${event.date} &middot; ${event.location}</p>
            <p class="small flex-grow-1">${event.description}</p>
            <a href="event.html?id=${event.id}" class="btn btn-sm btn-outline-primary mt-2">
              View details
            </a>
          </div>
        </div>
      </div>`;
    })
    .join("");

  grid.querySelectorAll("[data-favorite-id]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleFavorite(button.dataset.favoriteId);
      applyFilters();
    });
  });
}

// Pure filtering, split out from applyFilters() so the get_current_search_results
// tool can return exactly what's on screen instead of duplicating this logic.
function getFilteredEvents() {
  const form = document.getElementById("search-form");
  const query = form.query.value.trim().toLowerCase();
  const category = form.category.value;
  const favoritesOnly = document.getElementById("favorites-only").checked;

  return EVENTS.filter((event) => {
    const matchesQuery =
      !query ||
      event.title.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query);
    const matchesCategory = !category || event.category === category;
    const matchesFavorite = !favoritesOnly || isFavorite(event.id);
    return matchesQuery && matchesCategory && matchesFavorite;
  });
}

function applyFilters() {
  renderEvents(getFilteredEvents());
}

// Tools specific to this page: favoriting by an arbitrary id (there's no
// single "current" event here, unlike the detail page, so the id has to be
// a parameter), a page-state-aware read, and navigation. get_event_details
// and list_favorite_events are registered by registerSharedTools() instead,
// since both pages need them.
async function registerIndexPageTools() {
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
      applyFilters();
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
      applyFilters();
      return { content: [{ type: "text", text: `Unfavorited "${event.title}".` }] };
    },
  });

  // No input at all — this tool answers "what is the user looking at right
  // now", reading the live search/category/favorites-only state instead of
  // asking the agent to re-supply filters it already told the page about
  // through the search form. That's the kind of thing a REST API can't do:
  // the tool is bound to this page's actual current state.
  await modelContext.registerTool({
    name: "get_current_search_results",
    description:
      "Get the tech events currently visible on screen, respecting whatever search text, " +
      "category and favorites-only filter the user has applied. Takes no input.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => {
      return { content: [{ type: "text", text: JSON.stringify(getFilteredEvents(), null, 2) }] };
    },
  });

  await modelContext.registerTool({
    name: "open_event_details",
    description: "Navigate the browser to a specific event's detail page.",
    inputSchema: {
      type: "object",
      properties: {
        eventId: { type: "string", description: "The id of the event to open." },
      },
      required: ["eventId"],
    },
    execute: async ({ eventId }) => {
      const event = EVENTS.find((e) => e.id === eventId);
      if (!event) {
        return { content: [{ type: "text", text: `No event found with id "${eventId}".` }] };
      }
      window.location.href = `event.html?id=${event.id}`;
      return { content: [{ type: "text", text: `Opening "${event.title}"...` }] };
    },
  });
}

document.getElementById("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  applyFilters();
});

document.getElementById("favorites-only").addEventListener("change", applyFilters);

// Second implementation of the SAME action as favorite_event above — this
// time declarative, for direct side-by-side comparison. The browser derives
// this tool from the form's attributes; our submit listener just makes it
// also work for a human clicking the button.
document.getElementById("event-id-list").innerHTML = EVENTS.map(
  (e) => `<option value="${e.id}">${e.title}</option>`
).join("");

document.getElementById("favorite-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const eventId = e.target.eventId.value.trim();
  const event = EVENTS.find((ev) => ev.id === eventId);
  if (event) {
    if (!isFavorite(event.id)) toggleFavorite(event.id);
    applyFilters();
  }
  e.target.reset();
});

renderSupportBanner(document.getElementById("support-banner"));
applyFilters();

Promise.all([registerSharedTools(), registerIndexPageTools()]).then(() => {
  initTesterPopover(document.getElementById("tester-toggle"), { sampleEventId: EVENTS[0].id });
});
