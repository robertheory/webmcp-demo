// Event detail page: reads ?id= from the URL, renders the event, and wires
// the favorite button. Tool registration (favorite_event, get_event_details,
// ...) is shared with the home page via webmcp-tools.js.

function renderEventDetail() {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");
  const event = EVENTS.find((e) => e.id === eventId);
  const container = document.getElementById("event-detail");

  if (!event) {
    container.innerHTML = `<p class="text-danger">Event not found.</p>`;
    return;
  }

  const favorited = isFavorite(event.id);
  container.innerHTML = `
    <div class="d-flex justify-content-between align-items-start">
      <h1 class="h3">${event.title}</h1>
      <button
        id="favorite-toggle"
        class="btn ${favorited ? "btn-danger" : "btn-outline-danger"}"
      >${favorited ? "&#9829; Favorited" : "&#9825; Favorite"}</button>
    </div>
    <span class="badge text-bg-secondary mb-2">${event.category}</span>
    <p class="text-muted">${event.date} &middot; ${event.location}</p>
    <p>${event.description}</p>
    <a href="${event.url}" target="_blank" rel="noopener noreferrer">${event.url}</a>
    <p class="text-muted small mt-3">Event id: <code>${event.id}</code></p>
  `;

  document.getElementById("favorite-toggle").addEventListener("click", () => {
    toggleFavorite(event.id);
    renderEventDetail();
  });
}

renderSupportBanner(document.getElementById("support-banner"));
renderEventDetail();

registerImperativeTools().then(() => {
  const params = new URLSearchParams(window.location.search);
  const currentEvent = EVENTS.find((e) => e.id === params.get("id"));
  initTesterPopover(document.getElementById("tester-toggle"), {
    sampleEventId: currentEvent ? currentEvent.id : EVENTS[0].id,
  });
});
