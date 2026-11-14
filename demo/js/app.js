// Home page logic: renders the event grid, wires the search form, registers
// the page's imperative tools, and boots the WebMCP tool tester popover and
// activity panel.

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
    .map(localizeEvent)
    .map((event) => {
      const favorited = isFavorite(event.id);
      const tickets = getTicketCount(event.id);
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
                aria-label="${tr("Alternar favorito", "Toggle favorite")}"
                title="${tr("Alternar favorito", "Toggle favorite")}"
              >${favorited ? "&#9829;" : "&#9825;"}</button>
            </div>
            <div class="d-flex gap-1 mb-2">
              <span class="badge text-bg-secondary">${event.categoryLabel}</span>
              ${tickets ? `<span class="badge text-bg-success">${tickets} ${tr("ingresso(s)", "ticket(s)")}</span>` : ""}
            </div>
            <p class="text-muted small mb-2">${event.date} &middot; ${event.location}</p>
            <p class="small flex-grow-1">${event.description}</p>
            <a href="event.html?id=${event.id}" class="btn btn-sm btn-outline-primary mt-2">
              ${tr("Ver detalhes", "View details")}
            </a>
          </div>
        </div>
      </div>`;
    })
    .join("");

  grid.querySelectorAll("[data-favorite-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const eventId = button.dataset.favoriteId;
      const favorited = toggleFavorite(eventId);
      const event = findEvent(eventId);
      showToast(
        favorited
          ? tr(`"${event.title}" favoritado`, `Favorited "${event.title}"`)
          : tr(`"${event.title}" removido dos favoritos`, `Unfavorited "${event.title}"`),
        "success"
      );
      applyFilters();
    });
  });
}

// Pure filtering, split out from applyFilters() so the search tools can
// return exactly what's on screen instead of duplicating this logic.
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
      localized(event.description).toLowerCase().includes(query);
    const matchesCategory = !category || event.category === category;
    const matchesFavorite = !favoritesOnly || isFavorite(event.id);
    return matchesQuery && matchesCategory && matchesFavorite;
  });
}

function applyFilters() {
  renderEvents(getFilteredEvents());
}

// Tools specific to this page: searching, favoriting by an arbitrary id
// (there's no single "current" event here, unlike the detail page, so the
// id has to be a parameter), a page-state-aware read, and navigation. The
// rest are registered by registerSharedTools(), since both pages need them.
async function registerIndexPageTools() {
  const modelContext = getModelContext();
  if (!modelContext) return;

  // Drives the same search form a human uses, so the audience sees the
  // agent's query appear in the inputs and the grid update.
  await modelContext.registerTool({
    name: "search_events",
    title: tr("Buscar eventos", "Search events"),
    description: tr(
      "Busca eventos de tecnologia por palavra-chave e/ou categoria, e mostra o resultado na tela.",
      "Search tech events by keyword and/or category, and show the results on screen."
    ),
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: tr("Texto buscado no título, local e descrição.", "Text matched against title, location and description."),
        },
        category: { type: "string", enum: ["", "conference", "meetup", "hackathon"] },
      },
    },
    // Not readOnlyHint: it changes what the user sees (the form and grid),
    // even though no data is written.
    execute: async ({ query = "", category = "" }) => {
      const form = document.getElementById("search-form");
      form.query.value = query;
      form.category.value = CATEGORY_LABELS[category] ? category : "";
      applyFilters();
      const results = getFilteredEvents().map(localizeEvent);
      showToast(tr(`Agente buscou: ${results.length} evento(s)`, `Agent searched: ${results.length} event(s)`), "primary");
      return results;
    },
  });

  await modelContext.registerTool({
    name: "favorite_event",
    title: tr("Favoritar evento", "Favorite event"),
    description: tr(
      "Adiciona um evento de tecnologia à lista de favoritos do usuário pelo id.",
      "Add a tech event to the user's favorites list by its id."
    ),
    inputSchema: {
      type: "object",
      properties: {
        eventId: { type: "string", description: tr("O id do evento a favoritar.", "The id of the event to favorite.") },
      },
      required: ["eventId"],
    },
    execute: async ({ eventId }) => {
      const event = findEvent(eventId);
      if (!event) {
        showToast(escapeHtml(notFound(eventId)), "danger");
        return notFound(eventId);
      }
      if (!isFavorite(event.id)) toggleFavorite(event.id);
      applyFilters();
      showToast(tr(`Agente favoritou "${event.title}"`, `Agent favorited "${event.title}"`), "success");
      return tr(`"${event.title}" favoritado.`, `Favorited "${event.title}".`);
    },
  });

  await modelContext.registerTool({
    name: "unfavorite_event",
    title: tr("Desfavoritar evento", "Unfavorite event"),
    description: tr(
      "Remove um evento de tecnologia da lista de favoritos do usuário pelo id.",
      "Remove a tech event from the user's favorites list by its id."
    ),
    inputSchema: {
      type: "object",
      properties: {
        eventId: { type: "string", description: tr("O id do evento a desfavoritar.", "The id of the event to unfavorite.") },
      },
      required: ["eventId"],
    },
    execute: async ({ eventId }) => {
      const event = findEvent(eventId);
      if (!event) {
        showToast(escapeHtml(notFound(eventId)), "danger");
        return notFound(eventId);
      }
      if (isFavorite(event.id)) toggleFavorite(event.id);
      applyFilters();
      showToast(tr(`Agente desfavoritou "${event.title}"`, `Agent unfavorited "${event.title}"`), "success");
      return tr(`"${event.title}" removido dos favoritos.`, `Unfavorited "${event.title}".`);
    },
  });

  // No input at all — this tool answers "what is the user looking at right
  // now", reading the live search/category/favorites-only state instead of
  // asking the agent to re-supply filters the user already applied. That's
  // the kind of thing a REST API can't do: the tool is bound to this page's
  // actual current state.
  await modelContext.registerTool({
    name: "get_current_search_results",
    title: tr("Resultados atuais", "Current results"),
    description: tr(
      "Retorna os eventos de tecnologia visíveis na tela agora, respeitando a busca, a categoria " +
        "e o filtro de favoritos que o usuário aplicou. Não recebe entrada.",
      "Get the tech events currently visible on screen, respecting whatever search text, " +
        "category and favorites-only filter the user has applied. Takes no input."
    ),
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => {
      const results = getFilteredEvents().map(localizeEvent);
      showToast(
        tr(`Agente leu os resultados atuais (${results.length} evento(s))`, `Agent read the current results (${results.length} event(s))`),
        "primary"
      );
      return results;
    },
  });

  // Navigating unloads this page, and its tools with it — so an in-page
  // caller gets null back from executeTool() instead of this string.
  await modelContext.registerTool({
    name: "open_event_details",
    title: tr("Abrir página do evento", "Open event page"),
    description: tr(
      "Navega o navegador até a página de detalhes de um evento.",
      "Navigate the browser to a specific event's detail page."
    ),
    inputSchema: {
      type: "object",
      properties: {
        eventId: { type: "string", description: tr("O id do evento a abrir.", "The id of the event to open.") },
      },
      required: ["eventId"],
    },
    execute: async ({ eventId }) => {
      const event = findEvent(eventId);
      if (!event) {
        showToast(escapeHtml(notFound(eventId)), "danger");
        return notFound(eventId);
      }
      showToast(tr(`Agente está abrindo "${event.title}"...`, `Agent is opening "${event.title}"...`), "primary");
      window.location.href = `event.html?id=${event.id}`;
      return tr(`Abrindo "${event.title}"...`, `Opening "${event.title}"...`);
    },
  });
}

document.getElementById("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  applyFilters();
  showToast(tr(`${getFilteredEvents().length} evento(s) encontrado(s)`, `Found ${getFilteredEvents().length} event(s)`), "primary");
});

document.getElementById("favorites-only").addEventListener("change", applyFilters);
document.addEventListener("demo:datachange", applyFilters);

renderSupportBanner(document.getElementById("support-banner"));
applyFilters();
initActivityPanel();

Promise.all([registerSharedTools(), registerIndexPageTools()])
  .catch((err) =>
    showToast(tr(`Falha ao registrar ferramentas: ${escapeHtml(err.message)}`, `Tool registration failed: ${escapeHtml(err.message)}`), "danger")
  )
  .then(() =>
    // The hackathon is the event whose reviews carry the prompt injection.
    initTesterPopover(document.getElementById("tester-toggle"), { sampleEventId: "ai-agents-hackathon" })
  );
