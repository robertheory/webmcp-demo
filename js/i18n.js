// EN/PT-BR switch for the deck. English is the source text in the HTML;
// each translatable element carries its Portuguese version in `data-pt`
// (innerHTML) or `data-pt-description` (a <tool-card> attribute). Switching
// stashes the English once and swaps. The chosen language is remembered.

function setLang(lang) {
  const pt = lang === "pt";
  document.documentElement.lang = pt ? "pt-BR" : "en";

  document.querySelectorAll("[data-pt]").forEach((el) => {
    el.dataset.en ??= el.innerHTML;
    el.innerHTML = pt ? el.dataset.pt : el.dataset.en;
  });
  document.querySelectorAll("[data-pt-description]").forEach((el) => {
    el.dataset.enDescription ??= el.getAttribute("description");
    el.setAttribute("description", pt ? el.dataset.ptDescription : el.dataset.enDescription);
  });
  // The diagram reads <html lang> for its labels; redraw it.
  document.querySelectorAll("flow-diagram").forEach((el) => el.render());

  document.querySelectorAll(".lang-switch [data-lang]").forEach((btn) => {
    const on = btn.dataset.lang === lang;
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-pressed", on);
  });
  try { localStorage.setItem("deck-lang", lang); } catch {}
}

document.querySelectorAll(".lang-switch [data-lang]").forEach((btn) =>
  btn.addEventListener("click", () => setLang(btn.dataset.lang))
);

let saved = "en";
try { saved = localStorage.getItem("deck-lang") || "en"; } catch {}
setLang(saved);
