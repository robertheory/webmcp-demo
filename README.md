# WebMCP — Presentation + Demo

A talk-ready slide deck on the [WebMCP protocol](https://webmachinelearning.github.io/webmcp/),
paired with a hands-on demo you can jump into mid-presentation. No build
step, no dependencies to install — static HTML, CSS and JavaScript, plus
Bootstrap 5 via CDN.

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` for the presentation, or
`http://localhost:8000/demo/` for the demo directly.

## Structure

| Path            | What it is                                                              |
| ---------------- | ------------------------------------------------------------------------ |
| `index.html`      | The presentation — a full-screen slide deck built on Bootstrap's Carousel |
| `css/`, `js/`      | Presentation-only assets, including two Web Components used in the slides |
| [`demo/`](demo/)  | The Tech Events app the slides demo — see [`demo/README.md`](demo/README.md) |

The presentation is the landing page on purpose: it walks through why
WebMCP exists and how it works before pointing you at the demo. A floating
"Try the demo" button (bottom-right, on every slide) jumps there at any
point, and the demo's navbar links back with "← Presentation".

## The presentation

- **Slide engine**: Bootstrap's Carousel, repurposed for full-height slides
  instead of images (`interval: false`, no auto-advance).
- **Navigation**: arrow keys, on-screen prev/next controls, click-to-jump
  progress dots (generated from however many slides exist), and a
  "Present" button that toggles fullscreen.
- **Two Web Components** (`js/components/`) illustrate concepts Bootstrap
  alone can't draw:
  - `<flow-diagram state="idle|register|call">` — an SVG diagram of the
    Agent/Browser/Page relationship, reused across slides with a different
    highlighted state.
  - `<tool-card>` — renders a tool's `name`/`description`/`inputSchema`/
    `annotations` as a card, so the same visual shows up everywhere a tool
    definition is discussed.
- Everything else (tabs for declarative vs. imperative, the setup
  accordion, cards) is plain Bootstrap — no reason to build a component
  where a Bootstrap one already does the job.

## The demo

See [`demo/README.md`](demo/README.md) for what it demonstrates (dynamic
tool registration, cancellation, annotations, the manual tool tester, ...)
and how to run it on its own.

## References

- https://webmachinelearning.github.io/webmcp/
- https://developer.chrome.com/docs/ai/webmcp
- https://developer.chrome.com/docs/ai/webmcp/compare-mcp
- https://developer.chrome.com/docs/ai/webmcp/secure-tools
- https://developer.chrome.com/docs/agents/security
- https://blog.modelcontextprotocol.io/posts/2026-03-16-tool-annotations/
- https://developer.chrome.com/blog/webmcp-epp
- https://www.webfuse.com/blog/what-is-webmcp-the-practical-guide-to-the-web-model-context-protocol
- https://www.conversion.com.br/blog/google-webmcp-protocolo-agentes-ia
- https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd
