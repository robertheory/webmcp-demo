// <tool-card> — a native Web Component that renders the anatomy of a
// WebMCP tool definition as a visual card, for the presentation slides.
//
// Deliberately renders into light DOM (no Shadow DOM): the slides already
// load Bootstrap's CSS, and reusing those classes here keeps this card
// visually consistent with the rest of the deck without duplicating any
// stylesheet into a shadow root.
//
// Text attributes are Portuguese by default, with *-en variants used when
// the deck is switched to English (see js/lang.js).
//
// Usage:
// <tool-card
//   name="get_event_details"
//   tool-title="Detalhes do evento"   tool-title-en="Event details"
//   description="Retorna os detalhes." description-en="Get full details."
//   schema="eventId: string"
//   output="id, title, date, ..."
//   annotations="read-only"
// ></tool-card>
class ToolCard extends HTMLElement {
  static get observedAttributes() {
    return [
      "name",
      "tool-title",
      "tool-title-en",
      "description",
      "description-en",
      "schema",
      "output",
      "annotations",
    ];
  }

  connectedCallback() {
    this.render();
    this.onLangChange = () => this.render();
    document.addEventListener("langchange", this.onLangChange);
  }

  disconnectedCallback() {
    document.removeEventListener("langchange", this.onLangChange);
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  localized(attr) {
    const en = getLang() === "en" ? this.getAttribute(`${attr}-en`) : null;
    return en ?? this.getAttribute(attr) ?? "";
  }

  render() {
    const name = this.getAttribute("name") || "unnamed_tool";
    const title = this.localized("tool-title");
    const description = this.localized("description");
    const schema = this.getAttribute("schema") || "";
    const output = this.getAttribute("output") || "";
    const annotations = (this.getAttribute("annotations") || "")
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    const badges = {
      "read-only": { cls: "text-bg-success", pt: "somente leitura" },
      consequential: { cls: "text-bg-danger", pt: "consequencial" },
      "untrusted output": { cls: "text-bg-warning", pt: "saída não confiável" },
      debug: { cls: "text-bg-secondary", pt: "debug" },
    };

    const schemaBlock = (label, body) => `
      <div class="border rounded p-2 bg-body-tertiary mt-2">
        <div class="text-uppercase text-muted small mb-1">${label}</div>
        <code class="small">{ ${body} }</code>
      </div>`;

    this.innerHTML = `
      <div class="card shadow-sm text-start h-100">
        <div class="card-body">
          <div class="d-flex flex-wrap gap-2 justify-content-between align-items-start mb-1">
            <code class="fs-6">${name}</code>
            <div class="d-flex gap-1">
              ${annotations
                .map((a) => {
                  const badge = badges[a] || { cls: "text-bg-light", pt: a };
                  return `<span class="badge ${badge.cls}">${tr(badge.pt, a)}</span>`;
                })
                .join("")}
            </div>
          </div>
          ${title ? `<div class="small fw-semibold mb-1">${title}</div>` : ""}
          <p class="mb-0 text-body-secondary">${description}</p>
          ${schema ? schemaBlock("inputSchema", schema) : ""}
          ${output ? schemaBlock("outputSchema", output) : ""}
        </div>
      </div>`;
  }
}

customElements.define("tool-card", ToolCard);
