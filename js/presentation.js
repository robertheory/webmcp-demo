// Wires the Bootstrap Carousel used as the slide deck: keyboard navigation,
// dynamically-generated progress dots, a slide counter, and a fullscreen
// "present mode" toggle. The deck itself (the slides) lives in index.html;
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
