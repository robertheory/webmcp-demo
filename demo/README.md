# Tech Events — WebMCP Demo

A small, framework-free demo showing how the [WebMCP protocol](https://webmachinelearning.github.io/webmcp/)
lets a web page expose "tools" that an AI agent running in the browser can
call directly — searching and favoriting tech events, in this case.

No build step, no dependencies to install. Just static HTML, CSS and
JavaScript, plus Bootstrap 5 via CDN.

> This is the hands-on half of the project. The [presentation](../index.html)
> one level up covers the concepts this demo puts into practice.

## Running it

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/demo/`.

(Opening `index.html` directly as a `file://` URL also works, since there's
no server-side code.)

## What it demonstrates

**Declarative vs. imperative registration.** WebMCP defines two ways to
register a tool:

- **Declarative** — annotate an existing `<form>` with `toolname` /
  `tooldescription` attributes; the browser derives the tool and its input
  schema from the form fields. Used twice, for direct comparison: the search
  form in [`index.html`](index.html) (`search_events`), and a second,
  collapsed "Declarative favoriting" form on the same page
  (`favorite_event_declarative`) that does the same thing as the imperative
  `favorite_event` tool below, just registered the other way.
- **Imperative** — call `modelContext.registerTool({...})` in JavaScript.
  Used for everything else, in [`js/webmcp-tools.js`](js/webmcp-tools.js),
  [`js/app.js`](js/app.js) and [`js/event.js`](js/event.js).

**Tools scoped to page state, not just parameters.** `get_current_search_results`
(index page) takes no input — it reads whatever search text/category/favorites
filter is currently applied and returns exactly what's on screen. That's
something a plain REST API can't do without the caller re-sending state it
already gave the page through the UI.

**Dynamic registration/unregistration.** The event detail page doesn't keep
both `favorite_this_event` and `unfavorite_this_event` registered at once —
only whichever one is currently valid exists, and toggling favorite status
unregisters one and registers the other. This uses the `signal` option on
`registerTool()`: aborting an `AbortController` unregisters that tool. Watch
the wrench icon flash briefly when this happens — that's the `toolchange`
event, which otherwise has no visible effect.

**Cancellation.** `sync_favorites_to_cloud` is a deliberately slow (5s)
fake tool. Run it from the tester and hit Cancel before it finishes: the
tester passes an `AbortSignal` to `executeTool()`, which is forwarded into
the tool's `execute(input, { signal })` callback.

**Tool annotations.** Read-only tools (`get_event_details`,
`list_favorite_events`, `get_current_search_results`) declare
`annotations: { readOnlyHint: true }`, shown as a badge in the tester. This
is metadata an agent can use to decide it's safe to call a tool without
asking the user first.

**Navigation as a tool.** `open_event_details` drives the browser to a
different page (`event.html?id=...`) instead of just reading or writing
data — a tool call can act on the browsing context itself.

## Manual tool tester

WebMCP is still experimental (Chrome, behind a flag:
`chrome://flags/#web-machine-learning-model-context`, Canary/Dev channel, or
the WebMCP extension). Every page has a wrench icon in the top-right of the
navbar that opens a popover listing every registered tool, each with a JSON
input box pre-filled with a sample body (real event ids where relevant), a
"Run" button that calls `executeTool()`, and a "Cancel" button that aborts
it mid-flight — the same call path a real agent uses. It's useful both as a
fallback when your browser has no WebMCP support, and as a quick way to
sanity-check a tool while you're building it. The popover stays open while
you interact with the rest of the page, since Bootstrap's click-triggered
popovers don't auto-dismiss on outside clicks.

## Files

| File                 | Purpose                                                    |
| -------------------- | ----------------------------------------------------------- |
| `index.html`         | Search + event grid + favorites filter                      |
| `event.html`         | Single event detail page                                     |
| `js/data.js`         | Static sample event dataset                                  |
| `js/storage.js`      | Favorites persisted to `localStorage`                        |
| `js/webmcp-tools.js` | Shared tools, support detection, tester popover              |
| `js/app.js`          | Home page logic + its page-specific tools                    |
| `js/event.js`        | Detail page logic + its dynamic favorite tool pair           |

## References

- https://webmachinelearning.github.io/webmcp/
- https://developer.chrome.com/blog/webmcp-epp
- https://www.webfuse.com/blog/what-is-webmcp-the-practical-guide-to-the-web-model-context-protocol
- https://www.conversion.com.br/blog/google-webmcp-protocolo-agentes-ia
- https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd
