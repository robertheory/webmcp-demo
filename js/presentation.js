// Wires the Bootstrap Carousel used as the slide deck: keyboard navigation,
// dynamically-generated progress dots, a slide counter, a fullscreen
// "present mode" toggle, and the citation footers + References slide built
// from js/references.js. The deck itself (the slides) lives in index.html;
// this file only drives the chrome around it.

const deckEl = document.getElementById("deck");
const carousel = bootstrap.Carousel.getOrCreateInstance(deckEl, { interval: false, wrap: false });
const slides = deckEl.querySelectorAll(".carousel-item");
const indicatorsEl = document.getElementById("deck-indicators");
const counterEl = document.getElementById("slide-counter");

// Build the progress dots from however many slides actually exist, instead
// of hand-numbering data-bs-slide-to attributes that would drift out of
// sync whenever a slide is added or removed.
indicatorsEl.innerHTML = Array.from(slides)
  .map(
    (_, i) => `
    <button
      type="button"
      data-bs-target="#deck"
      data-bs-slide-to="${i}"
      class="${i === 0 ? "active" : ""}"
      aria-current="${i === 0 ? "true" : "false"}"
      aria-label="Slide ${i + 1}"
    ></button>`
  )
  .join("");

function updateCounter(index) {
  counterEl.textContent = `${index + 1} / ${slides.length}`;
}
updateCounter(0);

deckEl.addEventListener("slid.bs.carousel", (event) => updateCounter(event.to));

// --- Citations ---------------------------------------------------------------

function escapeHtml(text) {
  return text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

function refLink(ref, label) {
  return `<a href="${ref.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
}

// A slide's sources, in footer order: its data-refs first, then any inline
// data-cite that wasn't already listed. Unknown ids are reported in the
// console instead of rendering a broken entry.
function slideRefIds(slide) {
  const ids = (slide.dataset.refs || "").split(/\s+/).filter(Boolean);
  slide.querySelectorAll("[data-cite]").forEach((el) => {
    if (!ids.includes(el.dataset.cite)) ids.push(el.dataset.cite);
  });
  return ids.filter((id) => {
    if (REFERENCES[id]) return true;
    console.warn(`Unknown reference id "${id}"`, slide);
    return false;
  });
}

const citedIds = [];

slides.forEach((slide) => {
  const ids = slideRefIds(slide);
  if (!ids.length) return;

  slide.querySelectorAll("[data-cite]").forEach((el) => {
    const n = ids.indexOf(el.dataset.cite) + 1;
    if (!n) return;
    const ref = REFERENCES[el.dataset.cite];
    el.classList.add("cite");
    el.innerHTML = `<a href="${ref.url}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(ref.title)}">[${n}]</a>`;
  });

  const footer = document.createElement("footer");
  footer.className = "slide-refs";
  footer.innerHTML = ids
    .map((id, i) => `<span class="slide-ref">[${i + 1}] ${refLink(REFERENCES[id], REFERENCES[id].short)}</span>`)
    .join("");
  slide.appendChild(footer);

  ids.forEach((id) => {
    if (!citedIds.includes(id)) citedIds.push(id);
  });
});

// The References slide lists exactly what the deck cites — grouped, in the
// order of REFERENCE_GROUPS — so it can't drift from the per-slide footers.
// Re-rendered on language change, since group labels are localized.
function renderReferences() {
  const pt = getLang() === "pt";
  document.getElementById("references-list").innerHTML = REFERENCE_GROUPS.map((group) => {
    const ids = citedIds.filter((id) => REFERENCES[id].group === group);
    if (!ids.length) return "";
    return `
      <section class="references-group">
        <h6>${escapeHtml(pt ? REFERENCE_GROUP_LABELS_PT[group] : group)}</h6>
        <ul>
          ${ids
            .map((id) => {
              const ref = REFERENCES[id];
              return `<li>${refLink(ref, ref.title)} <span class="text-muted">· ${pt ? "acessado em" : "accessed"} ${ref.accessed}</span></li>`;
            })
            .join("")}
        </ul>
      </section>`;
  }).join("");
}

function updateDocumentTitle() {
  document.title = tr("WebMCP — Apresentação", "WebMCP — Presentation");
}

renderReferences();
updateDocumentTitle();
document.addEventListener("langchange", () => {
  renderReferences();
  updateDocumentTitle();
});

// --- Navigation --------------------------------------------------------------

// Capture phase + preventDefault: without this, when focus is on a
// Bootstrap tab button (role="tab"), the browser's own ARIA tablist
// keyboard handling intercepts Left/Right to switch tabs instead of
// letting the event reach here to advance the slide.
document.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "ArrowRight" || event.key === " ") {
      event.preventDefault();
      carousel.next();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      carousel.prev();
    }
  },
  { capture: true }
);

document.getElementById("present-mode-toggle").addEventListener("click", () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
});
