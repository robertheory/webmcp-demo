// Event detail page: reads ?id= from the URL, renders the event and its
// reviews, and wires the favorite button. The other tools are shared with
// the home page via registerSharedTools() in webmcp-tools.js.
//
// Favoriting here works differently from the home page's favorite_event(id):
// this page already knows which event it's showing, so it registers a
// single no-argument tool — "favorite_this_event" or "unfavorite_this_event"
// — and swaps which one exists whenever the favorite state changes. That
// swap is done with the AbortSignal that registerTool() accepts: aborting it
// unregisters the tool, which is what lets us replace one with the other
// instead of ending up with both registered at once. The tester popover and
// activity panel pick the swap up through the toolchange event.

let currentEvent = null;
let favoriteToolAbortController = null;

function renderReviews() {
  const reviews = REVIEWS[currentEvent.id] || [];
  if (!reviews.length) return `<p class="text-muted small">${tr("Nenhuma review ainda.", "No reviews yet.")}</p>`;
  return reviews
    .map(
      (r) => `
      <div class="border rounded p-2 mb-2">
        <div class="small"><strong>${escapeHtml(r.author)}</strong> <span class="text-warning">${"&#9733;".repeat(r.rating)}</span></div>
        <div class="small text-muted">${escapeHtml(localized(r.text))}</div>
      </div>`
    )
    .join("");
}

function renderEventDetail() {
  const params = new URLSearchParams(window.location.search);
  currentEvent = findEvent(params.get("id"));
  const container = document.getElementById("event-detail");

  if (!currentEvent) {
    container.innerHTML = `<p class="text-danger">${tr("Evento não encontrado.", "Event not found.")}</p>`;
    return;
  }

  const event = localizeEvent(currentEvent);
  const favorited = isFavorite(event.id);
  const tickets = getTicketCount(event.id);
  container.innerHTML = `
    <div class="d-flex justify-content-between align-items-start">
      <h1 class="h3">${event.title}</h1>
      <button
        id="favorite-toggle"
        class="btn ${favorited ? "btn-danger" : "btn-outline-danger"}"
      >${favorited ? `&#9829; ${tr("Favoritado", "Favorited")}` : `&#9825; ${tr("Favoritar", "Favorite")}`}</button>
    </div>
    <div class="d-flex gap-1 mb-2">
      <span class="badge text-bg-secondary">${event.categoryLabel}</span>
      ${tickets ? `<span class="badge text-bg-success">${tickets} ${tr("ingresso(s)", "ticket(s)")}</span>` : ""}
    </div>
    <p class="text-muted">${event.date} &middot; ${event.location}</p>
    <p>${event.description}</p>
    <a href="${event.url}" target="_blank" rel="noopener noreferrer">${event.url}</a>
    <p class="text-muted small mt-3">${tr("Id do evento", "Event id")}: <code>${event.id}</code></p>

    <h2 class="h6 mt-4">Reviews <span class="badge text-bg-warning align-middle">${tr(
      "geradas por usuários · não confiáveis",
      "user-generated · untrusted"
    )}</span></h2>
    ${renderReviews()}
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
  const title = currentEvent.title;
  const tool = favorited
    ? {
        name: "unfavorite_this_event",
        title: tr("Desfavoritar este evento", "Unfavorite this event"),
        description: tr(
          `Remove "${title}" (o evento aberto nesta página) dos favoritos. Não precisa de entrada.`,
          `Remove "${title}" (the event currently open on this page) from favorites. No input needed.`
        ),
        inputSchema: { type: "object", properties: {} },
        execute: async () => {
          toggleFavorite(currentEvent.id);
          await handleFavoriteChanged();
          return tr(`"${title}" removido dos favoritos.`, `Unfavorited "${title}".`);
        },
      }
    : {
        name: "favorite_this_event",
        title: tr("Favoritar este evento", "Favorite this event"),
        description: tr(
          `Adiciona "${title}" (o evento aberto nesta página) aos favoritos. Não precisa de entrada.`,
          `Add "${title}" (the event currently open on this page) to favorites. No input needed.`
        ),
        inputSchema: { type: "object", properties: {} },
        execute: async () => {
          toggleFavorite(currentEvent.id);
          await handleFavoriteChanged();
          return tr(`"${title}" favoritado.`, `Favorited "${title}".`);
        },
      };

  // registerTool() rejects with the abort reason if the signal is aborted
  // before registration settles — expected when toggling quickly.
  await modelContext
    .registerTool(tool, { signal: favoriteToolAbortController.signal })
    .catch((err) => {
      if (err.name !== "AbortError") throw err;
    });
}

// Re-renders the page and re-registers the (now opposite) favorite tool.
// Runs whether the toggle came from the button click or from an agent
// calling the tool directly, so both paths stay in sync.
async function handleFavoriteChanged() {
  renderEventDetail();
  const favorited = isFavorite(currentEvent.id);
  showToast(
    favorited
      ? tr(`"${currentEvent.title}" favoritado`, `Favorited "${currentEvent.title}"`)
      : tr(`"${currentEvent.title}" removido dos favoritos`, `Unfavorited "${currentEvent.title}"`),
    "success"
  );
  const modelContext = getModelContext();
  if (!modelContext) return;
  await registerFavoriteToggleTool(modelContext);
}

function handleFavoriteToggle() {
  toggleFavorite(currentEvent.id);
  handleFavoriteChanged();
}

document.addEventListener("demo:datachange", () => {
  if (currentEvent) renderEventDetail();
});

renderSupportBanner(document.getElementById("support-banner"));
renderEventDetail();
initActivityPanel();

(async () => {
  try {
    await registerSharedTools();
    const modelContext = getModelContext();
    if (modelContext && currentEvent) {
      await registerFavoriteToggleTool(modelContext);
    }
  } catch (err) {
    showToast(
      tr(`Falha ao registrar ferramentas: ${escapeHtml(err.message)}`, `Tool registration failed: ${escapeHtml(err.message)}`),
      "danger"
    );
  }
  await initTesterPopover(document.getElementById("tester-toggle"), {
    sampleEventId: () => (currentEvent ? currentEvent.id : EVENTS[0].id),
  });
})();
