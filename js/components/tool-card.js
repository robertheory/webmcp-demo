// <tool-card> — a native Web Component that renders the anatomy of a
// WebMCP tool definition as a visual card, for the presentation slides.
//
// Deliberately renders into light DOM (no Shadow DOM): the slides already
// load Bootstrap's CSS, and reusing those classes here keeps this card
// visually consistent with the rest of the deck without duplicating any
// stylesheet into a shadow root.
//
// Usage:
// <tool-card
//   name="favorite_event"
//   description="Add a tech event to the user's favorites list by its id."
//   schema="eventId: string"
//   annotations="read-only"
// ></tool-card>
class ToolCard extends HTMLElement {
  static get observedAttributes() {
    return ["name", "description", "schema", "annotations"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const name = this.getAttribute("name") || "unnamed_tool";
    const description = this.getAttribute("description") || "";
    const schema = this.getAttribute("schema") || "";
    const annotations = (this.getAttribute("annotations") || "")
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    const badgeClass = {
      "read-only": "text-bg-success",
      consequential: "text-bg-danger",
      "untrusted output": "text-bg-warning",
      debug: "text-bg-secondary",
    };

    this.innerHTML = `
      <div class="card shadow-sm text-start">
        <div class="card-body">
          <div class="d-flex flex-wrap gap-2 justify-content-between align-items-start mb-2">
            <code class="fs-6">${name}</code>
            <div class="d-flex gap-1">
              ${annotations
                .map(
                  (a) =>
                    `<span class="badge ${badgeClass[a] || "text-bg-light"}">${a}</span>`
                )
                .join("")}
            </div>
          </div>
          <p class="mb-2 text-body-secondary">${description}</p>
          ${
            schema
              ? `<div class="border rounded p-2 bg-body-tertiary">
                  <div class="text-uppercase text-muted small mb-1">inputSchema</div>
                  <code class="small">{ ${schema} }</code>
                </div>`
              : ""
          }
        </div>
      </div>`;
  }
}

customElements.define("tool-card", ToolCard);
