// Drives the deck: a Bootstrap Carousel repurposed as full-height slides,
// built to be run with a slide clicker. This file renders the chrome around
// the slides in index.html — progress dots, slide counter, citation footers,
// the per-slide source index — and wires the keyboard and the action bar.

const deckEl = document.getElementById("deck");
const innerEl = deckEl.querySelector(".carousel-inner");
const carousel = bootstrap.Carousel.getOrCreateInstance(deckEl, { interval: false, wrap: false });
const indicatorsEl = document.getElementById("deck-indicators");
const counterEl = document.getElementById("slide-counter");

const allSlides = () => Array.from(innerEl.querySelectorAll(".carousel-item"));
const activeIndex = () => allSlides().findIndex((s) => s.classList.contains("active"));

function escapeHtml(text) {
  return text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

function refLink(ref, label) {
  return `<a href="${ref.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
}

// --- Layout ------------------------------------------------------------------

// Every slide's content goes into a .slide-body that takes the free height
// and centers itself, so a footer appended after it sits at the bottom in
// normal flow: it can never overlap the content, and never needs a scrollbar.
allSlides().forEach((item) => {
  const slide = item.querySelector(".slide");
  const body = document.createElement("div");
  body.className = "slide-body";
  while (slide.firstChild) body.appendChild(slide.firstChild);
  slide.appendChild(body);
});

// --- Citations ---------------------------------------------------------------

// A slide's sources, in footer order: its data-refs first, then any inline
// data-cite that wasn't already listed. Unknown ids are reported in the
// console instead of rendering a broken entry.
function slideRefIds(item) {
  const ids = (item.dataset.refs || "").split(/\s+/).filter(Boolean);
  item.querySelectorAll("[data-cite]").forEach((el) => {
    if (!ids.includes(el.dataset.cite)) ids.push(el.dataset.cite);
  });
  return ids.filter((id) => {
    if (REFERENCES[id]) return true;
    console.warn(`Unknown reference id "${id}"`, item);
    return false;
  });
}

function numberedRefs(ids) {
  return ids
    .map((id, i) => `<span class="slide-ref">[${i + 1}] ${refLink(REFERENCES[id], REFERENCES[id].short)}</span>`)
    .join("");
}

// The slide's title in one language: the first h1/h2 written in that
// language (or in both), reading the matching [data-lang] span if it has one.
function slideTitle(item, lang) {
  const heading = Array.from(item.querySelectorAll(".slide-body h1, .slide-body h2")).find(
    (h) => !h.dataset.lang || h.dataset.lang === lang
  );
  if (!heading) return "";
  const span = heading.querySelector(`[data-lang="${lang}"]`);
  return (span || heading).textContent.replace(/\[\d+\]/g, "").trim();
}

const citedSlides = [];

allSlides().forEach((item, index) => {
  const ids = slideRefIds(item);
  if (!ids.length) return;

  item.querySelectorAll("[data-cite]").forEach((el) => {
    const n = ids.indexOf(el.dataset.cite) + 1;
    if (!n) return;
    const ref = REFERENCES[el.dataset.cite];
    el.classList.add("cite");
    el.innerHTML = `<a href="${ref.url}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(ref.title)}">[${n}]</a>`;
  });

  const footer = document.createElement("footer");
  footer.className = "slide-refs";
  footer.innerHTML = numberedRefs(ids);
  item.querySelector(".slide").appendChild(footer);

  citedSlides.push({ number: index + 1, item, ids });
});

// --- Source index ------------------------------------------------------------

// The last slides index every source by the slide that cites it, using the
// same local [n] numbers as that slide's footer. Entries are paginated into
// as many slides as needed so nothing ever scrolls; the pagination is redone
// on language change, since titles have different lengths.
function indexEntry({ number, item, ids }) {
  const title = (lang) => escapeHtml(slideTitle(item, lang));
  return `
    <li class="index-entry">
      <span class="index-slide">${number}</span>
      <span>
        <span class="index-title"><span data-lang="pt">${title("pt")}</span><span data-lang="en">${title("en")}</span></span>
        <span class="index-refs">${numberedRefs(ids)}</span>
      </span>
    </li>`;
}

function newIndexSlide() {
  const item = document.createElement("div");
  item.className = "carousel-item source-index";
  item.innerHTML = `
    <div class="slide">
      <div class="slide-body slide-body-top">
        <div class="slide-kicker"><span data-lang="pt">Fontes</span><span data-lang="en">Sources</span></div>
        <h2><span data-lang="pt">Fontes por slide</span><span data-lang="en">Sources by slide</span></h2>
        <ol class="index-list"></ol>
      </div>
    </div>`;
  innerEl.appendChild(item);
  return item;
}

// Overflow can only be measured on a rendered slide, so each index slide is
// laid out off-screen while it's being filled.
function overflows(item) {
  const slide = item.querySelector(".slide");
  return slide.scrollHeight > slide.clientHeight + 1;
}

function buildSourceIndex() {
  innerEl.querySelectorAll(".source-index").forEach((el) => el.remove());
  let item = newIndexSlide();
  item.classList.add("measuring");
  citedSlides.forEach((entry) => {
    const list = item.querySelector(".index-list");
    list.insertAdjacentHTML("beforeend", indexEntry(entry));
    if (overflows(item) && list.children.length > 1) {
      const moved = list.lastElementChild;
      item.classList.remove("measuring");
      item = newIndexSlide();
      item.classList.add("measuring");
      item.querySelector(".index-list").appendChild(moved);
    }
  });
  item.classList.remove("measuring");

  const pages = innerEl.querySelectorAll(".source-index");
  pages.forEach((page, i) => {
    if (pages.length > 1) {
      page.querySelector("h2").insertAdjacentHTML("beforeend", ` <span class="text-muted fs-5">${i + 1}/${pages.length}</span>`);
    }
  });
}

// --- Progress dots and counter -----------------------------------------------

// Rebuilt from however many slides exist (the index slides are generated),
// instead of hand-numbering data-bs-slide-to attributes.
function buildIndicators() {
  const current = Math.max(activeIndex(), 0);
  indicatorsEl.innerHTML = allSlides()
    .map(
      (_, i) => `
      <button type="button" data-bs-target="#deck" data-bs-slide-to="${i}"
        class="${i === current ? "active" : ""}" aria-current="${i === current}"
        aria-label="Slide ${i + 1}"></button>`
    )
    .join("");
  updateCounter(current);
}

function updateCounter(index) {
  counterEl.textContent = `${index + 1} / ${allSlides().length}`;
}

// The fixed chrome (signature, counter, dots, action bar) flips colors on
// ink and yellow slides; switching at the start of the transition keeps it
// in step with the slide coming in.
function updateTheme(index) {
  const item = allSlides()[index];
  document.body.classList.toggle("on-ink", !!item?.classList.contains("theme-ink"));
  document.body.classList.toggle("on-yellow", !!item?.classList.contains("theme-yellow"));
}

deckEl.addEventListener("slide.bs.carousel", (event) => updateTheme(event.to));
deckEl.addEventListener("slid.bs.carousel", (event) => updateCounter(event.to));
updateTheme(0);

function updateDocumentTitle() {
  document.title = tr(
    "WebMCP: ensinando a Web a conversar com agentes de IA",
    "WebMCP: teaching the Web to talk to AI agents"
  );
}

buildSourceIndex();
buildIndicators();
updateDocumentTitle();

document.addEventListener("langchange", () => {
  const onIndex = allSlides()[activeIndex()]?.classList.contains("source-index");
  buildSourceIndex();
  if (onIndex) {
    const first = innerEl.querySelector(".source-index");
    allSlides().forEach((s) => s.classList.remove("active"));
    first.classList.add("active");
  }
  buildIndicators();
  updateDocumentTitle();
});

// --- Fullscreen, demo, language ------------------------------------------------

const fullscreenButton = document.getElementById("fullscreen-toggle");
const demoUrl = document.getElementById("demo-link").getAttribute("href");

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen();
}

fullscreenButton.addEventListener("click", toggleFullscreen);
document.addEventListener("fullscreenchange", () => {
  document.body.classList.toggle("is-fullscreen", !!document.fullscreenElement);
});

// --- Keyboard ------------------------------------------------------------------

// Slide clickers send PageDown/PageUp (some send arrows or Space). F, D and L
// let the operator go fullscreen, open the demo and switch language without
// reaching for the mouse. Capture phase + preventDefault keeps focused
// buttons from swallowing the keys.
document.addEventListener(
  "keydown",
  (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const actions = {
      ArrowRight: () => carousel.next(),
      PageDown: () => carousel.next(),
      " ": () => carousel.next(),
      ArrowLeft: () => carousel.prev(),
      PageUp: () => carousel.prev(),
      Home: () => carousel.to(0),
      End: () => carousel.to(allSlides().length - 1),
      f: toggleFullscreen,
      F: toggleFullscreen,
      d: () => (location.href = demoUrl),
      D: () => (location.href = demoUrl),
      l: toggleLang,
      L: toggleLang,
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  },
  { capture: true }
);
