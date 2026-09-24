// Home page logic: renders the event grid, wires the declarative search
// form, handles favoriting, and boots the WebMCP debug panel.

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

function applyFilters() {
  const form = document.getElementById("search-form");
  const query = form.query.value.trim().toLowerCase();
  const category = form.category.value;
  const favoritesOnly = document.getElementById("favorites-only").checked;

  const filtered = EVENTS.filter((event) => {
    const matchesQuery =
      !query ||
      event.title.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query);
    const matchesCategory = !category || event.category === category;
    const matchesFavorite = !favoritesOnly || isFavorite(event.id);
    return matchesQuery && matchesCategory && matchesFavorite;
  });

  renderEvents(filtered);
}

document.getElementById("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  applyFilters();
});

document.getElementById("favorites-only").addEventListener("change", applyFilters);

renderSupportBanner(document.getElementById("support-banner"));
applyFilters();

registerImperativeTools().then(() => {
  initTesterPopover(document.getElementById("tester-toggle"), { sampleEventId: EVENTS[0].id });
});
