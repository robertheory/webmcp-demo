// Language switch shared by the presentation and the demo. Brazilian
// Portuguese is the default; English is opt-in through any [data-set-lang]
// button or a ?lang=en URL parameter, and the choice is remembered in
// localStorage so the deck and the demo stay in the same language.
//
// Loaded synchronously in <head>, so <html lang> is set before the body is
// parsed and the hidden language never flashes on screen. Markup carries
// both languages side by side: [data-lang="pt"] and [data-lang="en"].
(function () {
  const STORAGE_KEY = "webmcp-talk-lang";

  function normalize(value) {
    if (!value) return null;
    const v = String(value).toLowerCase();
    if (v.startsWith("en")) return "en";
    if (v.startsWith("pt")) return "pt-BR";
    return null;
  }

  function store(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Storage can be unavailable (privacy modes); the switch still works for this page.
    }
  }

  const fromUrl = normalize(new URLSearchParams(location.search).get("lang"));
  let stored = null;
  try {
    stored = normalize(localStorage.getItem(STORAGE_KEY));
  } catch {
    stored = null;
  }
  if (fromUrl) store(fromUrl);
  document.documentElement.lang = fromUrl || stored || "pt-BR";

  const style = document.createElement("style");
  style.textContent =
    'html[lang="pt-BR"] [data-lang="en"], html[lang="en"] [data-lang="pt"] { display: none !important; }';
  document.head.appendChild(style);

  // "pt" or "en" — the short form used by tr() and the components.
  window.getLang = () => (document.documentElement.lang === "en" ? "en" : "pt");

  // Picks the string for the current language.
  window.tr = (pt, en) => (window.getLang() === "en" ? en : pt);

  window.setLang = (lang) => {
    const next = normalize(lang) || "pt-BR";
    store(next);
    document.documentElement.lang = next;
    updateToggles();
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: window.getLang() } }));
  };

  // Attributes and <option>s can't hold two elements, so they carry both
  // strings as data-*-pt / data-*-en and get filled in here.
  function updateToggles() {
    const lang = window.getLang();
    document.querySelectorAll("[data-set-lang]").forEach((button) => {
      const active = normalize(button.dataset.setLang) === document.documentElement.lang;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll("[data-placeholder-pt]").forEach((el) => {
      el.placeholder = el.dataset[lang === "en" ? "placeholderEn" : "placeholderPt"];
    });
    document.querySelectorAll("[data-label-pt]").forEach((el) => {
      el.textContent = el.dataset[lang === "en" ? "labelEn" : "labelPt"];
    });
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-set-lang]");
    if (button) window.setLang(button.dataset.setLang);
  });
  document.addEventListener("DOMContentLoaded", updateToggles);
})();
