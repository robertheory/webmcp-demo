# Tech Events — WebMCP Demo

A small, framework-free demo showing how the [WebMCP protocol](https://webmachinelearning.github.io/webmcp/)
lets a web page expose "tools" that an AI agent running in the browser can
call directly — searching and favoriting tech events, in this case.

No build step, no dependencies to install. Just static HTML, CSS and
JavaScript, plus Bootstrap 5 via CDN.

## Running it

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

(Opening `index.html` directly as a `file://` URL also works, since there's
no server-side code.)

## What it demonstrates

WebMCP defines two ways to register a tool for an agent to call:

- **Declarative** — annotate an existing `<form>` with `toolname` /
  `tooldescription` attributes; the browser derives the tool and its input
  schema from the form fields. Used for the search form in
  [`index.html`](index.html).
- **Imperative** — call `modelContext.registerTool({...})` in JavaScript.
  Used for `favorite_event`, `unfavorite_event`, `list_favorite_events` and
  `get_event_details` in [`js/webmcp-tools.js`](js/webmcp-tools.js), since
  favoriting isn't a form submission.

Both approaches are commented in the code where they're used.

## Manual tool tester

WebMCP is still experimental (Chrome, behind a flag:
`chrome://flags/#web-machine-learning-model-context`, Canary/Dev channel, or
the WebMCP extension). Every page has a wrench icon in the top-right of the
navbar that opens a popover listing every registered tool, each with a JSON
input box pre-filled with a sample body (real event ids where relevant) and
a "Run" button that calls `executeTool()` — the same call path a real agent
uses. It's useful both as a fallback when your browser has no WebMCP support,
and as a quick way to sanity-check a tool while you're building it. The
popover stays open while you interact with the rest of the page, since
Bootstrap's click-triggered popovers don't auto-dismiss on outside clicks.

## Files

| File                 | Purpose                                                         |
| -------------------- | --------------------------------------------------------------- |
| `index.html`         | Search + event grid + favorites filter                          |
| `event.html`         | Single event detail page                                        |
| `js/data.js`         | Static sample event dataset                                     |
| `js/storage.js`      | Favorites persisted to `localStorage`                           |
| `js/webmcp-tools.js` | Imperative tool registration, support detection, tester popover |
| `js/app.js`          | Home page logic                                                 |
| `js/event.js`        | Detail page logic                                               |

## References

- https://webmachinelearning.github.io/webmcp/
- https://developer.chrome.com/blog/webmcp-epp
- https://www.webfuse.com/blog/what-is-webmcp-the-practical-guide-to-the-web-model-context-protocol
- https://www.conversion.com.br/blog/google-webmcp-protocolo-agentes-ia
- https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd
