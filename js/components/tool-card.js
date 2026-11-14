// <tool-card> — a native Web Component that renders the anatomy of a
// WebMCP tool definition as a visual card, for the presentation slides.
//
// Deliberately renders into light DOM (no Shadow DOM), so the deck's brand
// styles (.tool-card, .tag in css/presentation.css) apply directly instead
// of being duplicated into a shadow root.
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

    // Brand palette tags: yellow marks the one that needs attention.
    const badges = {
      "read-only": { cls: "tag", pt: "somente leitura" },
      consequential: { cls: "tag tag-ink", pt: "consequencial" },
      "untrusted output": { cls: "tag tag-yellow", pt: "saída não confiável" },
      debug: { cls: "tag tag-muted", pt: "debug" },
    };

    const schemaBlock = (label, body) => `
      <div class="tool-card-schema">
        <div class="tool-card-label">${label}</div>
        <code>{ ${body} }</code>
      </div>`;

    this.innerHTML = `
      <div class="tool-card">
        <div>
          <div class="d-flex flex-wrap gap-2 justify-content-between align-items-start mb-2">
            <code class="tool-card-name">${name}</code>
            <div class="d-flex gap-1">
              ${annotations
                .map((a) => {
                  const badge = badges[a] || { cls: "tag", pt: a };
                  return `<span class="${badge.cls}">${tr(badge.pt, a)}</span>`;
                })
                .join("")}
            </div>
          </div>
          ${title ? `<div class="small fw-semibold mb-1">${title}</div>` : ""}
          <p class="tool-card-description">${description}</p>
          ${schema ? schemaBlock("inputSchema", schema) : ""}
          ${output ? schemaBlock("outputSchema", output) : ""}
        </div>
      </div>`;
  }
}

customElements.define("tool-card", ToolCard);
