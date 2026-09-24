// <flow-diagram state="idle|register|call"> — a native Web Component that
// draws the Agent / Browser / Page relationship as inline SVG, highlighting
// whichever leg of the flow is relevant to the current slide.
//
//   idle     — just the three boxes, nothing highlighted (introduces the shape).
//   register — highlights Page -> Browser, labeled registerTool().
//   call     — highlights the full round trip: Agent -> Browser -> Page
//              (executeTool()) and Page -> Browser -> Agent (result).
//
// Renders into light DOM on purpose (see tool-card.js for why) and re-draws
// whenever the `state` attribute changes, so the same element can be reused
// across slides just by swapping the attribute.
class FlowDiagram extends HTMLElement {
  static get observedAttributes() {
    return ["state"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const state = this.getAttribute("state") || "idle";
    const active = "#0d6efd";
    const idle = "#adb5bd";

    const registerOn = state === "register";
    const callOn = state === "call";

    this.innerHTML = `
      <svg viewBox="0 0 720 220" role="img" aria-label="Agent, browser and page relationship diagram" style="width:100%; height:auto;">
        <defs>
          <marker id="arrow-active" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="${active}" />
          </marker>
          <marker id="arrow-idle" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="${idle}" />
          </marker>
        </defs>

        <!-- Agent -->
        <rect x="20" y="80" width="180" height="60" rx="10" fill="#fff" stroke="${callOn ? active : idle}" stroke-width="2"/>
        <text x="110" y="115" text-anchor="middle" font-size="18" font-family="sans-serif">AI Agent</text>

        <!-- Browser -->
        <rect x="270" y="80" width="180" height="60" rx="10" fill="#fff" stroke="${callOn || registerOn ? active : idle}" stroke-width="2"/>
        <text x="360" y="110" text-anchor="middle" font-size="18" font-family="sans-serif">Browser</text>
        <text x="360" y="128" text-anchor="middle" font-size="12" fill="#6c757d" font-family="sans-serif">(WebMCP)</text>

        <!-- Page -->
        <rect x="520" y="80" width="180" height="60" rx="10" fill="#fff" stroke="${callOn || registerOn ? active : idle}" stroke-width="2"/>
        <text x="610" y="110" text-anchor="middle" font-size="18" font-family="sans-serif">Web Page</text>
        <text x="610" y="128" text-anchor="middle" font-size="12" fill="#6c757d" font-family="sans-serif">(registered tools)</text>

        <!-- Agent <-> Browser -->
        <line x1="200" y1="100" x2="266" y2="100" stroke="${callOn ? active : idle}" stroke-width="2" marker-end="url(#${callOn ? "arrow-active" : "arrow-idle"})"/>
        <line x1="266" y1="122" x2="200" y2="122" stroke="${callOn ? active : idle}" stroke-width="2" marker-end="url(#${callOn ? "arrow-active" : "arrow-idle"})"/>

        <!-- Browser <-> Page -->
        <line x1="454" y1="100" x2="516" y2="100" stroke="${callOn ? active : idle}" stroke-width="2" marker-end="url(#${callOn ? "arrow-active" : "arrow-idle"})"/>
        <line x1="516" y1="122" x2="454" y2="122" stroke="${callOn || registerOn ? active : idle}" stroke-width="2" marker-end="url(#${callOn || registerOn ? "arrow-active" : "arrow-idle"})"/>

        ${
          callOn
            ? `<text x="233" y="65" text-anchor="middle" font-size="12" fill="${active}" font-family="sans-serif">executeTool()</text>
               <text x="485" y="65" text-anchor="middle" font-size="12" fill="${active}" font-family="sans-serif">executeTool()</text>
               <text x="360" y="150" text-anchor="middle" font-size="12" fill="${active}" font-family="sans-serif">result</text>`
            : ""
        }
        ${
          registerOn
            ? `<text x="485" y="150" text-anchor="middle" font-size="13" fill="${active}" font-family="sans-serif">registerTool()</text>`
            : ""
        }
      </svg>`;
  }
}

customElements.define("flow-diagram", FlowDiagram);
