// <flow-diagram state="idle|register|call" orientation="horizontal|vertical">
// — a native Web Component that draws the Agent / Browser / Page
// relationship as inline SVG, highlighting whichever leg of the flow is
// relevant to the current slide.
//
//   idle     — just the three boxes, nothing highlighted (introduces the shape).
//   register — highlights Page -> Browser, labeled registerTool().
//   call     — highlights the full round trip: Agent -> Browser (tool call),
//              Browser -> Page (runs execute()) and back (JSON result).
//
// "horizontal" (default) suits full-width slides; "vertical" stacks the
// boxes so the diagram can fill a side column next to code at a readable size.
//
// Renders into light DOM on purpose (see tool-card.js for why) and re-draws
// whenever an attribute or the language changes, so the same element can be
// reused across slides just by swapping attributes.
// Marker ids must be unique per diagram: url(#id) resolves to the first match
// in the document, and a marker inside a hidden slide doesn't render.
let flowDiagramCount = 0;

class FlowDiagram extends HTMLElement {
  static get observedAttributes() {
    return ["state", "orientation"];
  }

  connectedCallback() {
    this.uid ??= `flow-${++flowDiagramCount}`;
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

  render() {
    const state = this.getAttribute("state") || "idle";
    const vertical = this.getAttribute("orientation") === "vertical";

    // Brand palette: ink for the active path, soft line for the rest, and
    // the boxes involved in the step filled with highlighter yellow.
    const c = {
      active: "#141414",
      idle: "#cfc8b6",
      muted: "#5e584c",
      fill: (on) => (on ? "#ffd23f" : "#ffffff"),
      display: "'Space Grotesk', system-ui, sans-serif",
      mono: "'JetBrains Mono', monospace",
    };
    const on = { register: state === "register", call: state === "call" };
    const label = {
      agent: tr("Agente de IA", "AI Agent"),
      browser: tr("Navegador", "Browser"),
      page: tr("Página web", "Web Page"),
      tools: tr("(ferramentas registradas)", "(registered tools)"),
      call: tr("chamada", "tool call"),
      result: tr("resultado (JSON)", "result (JSON)"),
      aria: tr("Diagrama da relação entre agente, navegador e página", "Agent, browser and page relationship diagram"),
    };

    const markers = `
      <defs>
        <marker id="${this.uid}-active" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="${c.active}" />
        </marker>
        <marker id="${this.uid}-idle" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="${c.idle}" />
        </marker>
      </defs>`;
    const line = (x1, y1, x2, y2, isOn) =>
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${isOn ? c.active : c.idle}" stroke-width="2" marker-end="url(#${this.uid}-${isOn ? "active" : "idle"})"/>`;
    const text = (x, y, value, { size = 12, anchor = "middle", weight = 700, font = c.mono, color = c.active } = {}) =>
      `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="${weight}" fill="${color}" font-family="${font}">${value}</text>`;
    const box = (x, y, w, h, isOn, title, subtitle, titleSize) => {
      const titleY = subtitle ? y + h / 2 - 2 : y + h / 2 + titleSize * 0.35;
      return `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c.fill(isOn)}" stroke="${c.active}" stroke-width="2"/>
      ${text(x + w / 2, titleY, title, { size: titleSize, font: c.display, color: "#141414" })}
      ${subtitle ? text(x + w / 2, y + h / 2 + titleSize * 0.85, subtitle, { size: titleSize * 0.6, weight: 400, color: c.muted }) : ""}`;
    };

    this.innerHTML = vertical ? this.vertical({ c, on, label, markers, line, text, box }) : this.horizontal({ c, on, label, markers, line, text, box });
  }

  horizontal({ c, on, label, markers, line, text, box }) {
    return `
      <svg viewBox="0 0 720 220" role="img" aria-label="${label.aria}" style="width:100%; height:auto;">
        ${markers}
        ${box(20, 80, 180, 60, on.call, label.agent, "", 18)}
        ${box(270, 80, 180, 60, on.call || on.register, label.browser, "(WebMCP)", 18)}
        ${box(520, 80, 180, 60, on.call || on.register, label.page, label.tools, 18)}

        ${line(200, 100, 266, 100, on.call)}
        ${line(266, 122, 200, 122, on.call)}
        ${line(454, 100, 516, 100, on.call)}
        ${line(516, 122, 454, 122, on.call || on.register)}

        ${on.call ? text(233, 65, label.call) + text(485, 65, "execute(input)") + text(360, 168, label.result) : ""}
        ${on.register ? text(485, 158, "registerTool()", { size: 13 }) : ""}
      </svg>`;
  }

  vertical({ c, on, label, markers, line, text, box }) {
    // Boxes stacked top to bottom; arrows run down (call) and up (result,
    // registration), with their labels to the right of the connector.
    return `
      <svg viewBox="0 0 340 440" role="img" aria-label="${label.aria}" style="width:100%; height:auto; max-height:58vh;">
        ${markers}
        ${box(10, 10, 320, 84, on.call, label.agent, "", 26)}
        ${box(10, 178, 320, 84, on.call || on.register, label.browser, "(WebMCP)", 26)}
        ${box(10, 346, 320, 84, on.call || on.register, label.page, label.tools, 26)}

        ${line(155, 94, 155, 174, on.call)}
        ${line(185, 174, 185, 98, on.call)}
        ${line(155, 262, 155, 342, on.call)}
        ${line(185, 342, 185, 266, on.call || on.register)}

        ${on.call ? text(198, 139, label.call, { anchor: "start", size: 15 }) + text(198, 307, "execute(input)", { anchor: "start", size: 15 }) : ""}
        ${on.register ? text(198, 309, "registerTool()", { anchor: "start", size: 17 }) : ""}
      </svg>`;
  }
}

customElements.define("flow-diagram", FlowDiagram);
