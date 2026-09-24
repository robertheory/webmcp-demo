// Static sample dataset — tech events. Field names double as the shape
// exposed to WebMCP tools (search_events, get_event_details, ...).
// Inspired by findtech.dev's event listing structure, not scraped content.
const EVENTS = [
  {
    id: "web-summit-2026",
    title: "Web Summit",
    category: "conference",
    date: "2026-11-09",
    location: "Lisbon, Portugal",
    description:
      "One of the largest tech conferences in the world, bringing together startups, investors and engineers to discuss the future of the web.",
    url: "https://websummit.com",
  },
  {
    id: "js-conf-brasil-2026",
    title: "JSConf Brasil",
    category: "conference",
    date: "2026-08-15",
    location: "Sao Paulo, Brazil",
    description:
      "A community-driven conference focused on JavaScript, covering frontend frameworks, runtimes, and the evolving web platform.",
    url: "https://jsconfbrasil.org",
  },
  {
    id: "pycon-us-2027",
    title: "PyCon US",
    category: "conference",
    date: "2027-05-12",
    location: "Pittsburgh, USA",
    description:
      "The largest annual gathering for the Python community, with talks, sprints and tutorials for all experience levels.",
    url: "https://us.pycon.org",
  },
  {
    id: "devops-meetup-berlin",
    title: "DevOps Meetup Berlin",
    category: "meetup",
    date: "2026-10-02",
    location: "Berlin, Germany",
    description:
      "Monthly meetup for infrastructure and platform engineers to share war stories about CI/CD, observability and cloud cost control.",
    url: "https://devopsmeetup.berlin",
  },
  {
    id: "ai-agents-hackathon",
    title: "AI Agents Hackathon",
    category: "hackathon",
    date: "2026-12-05",
    location: "Remote",
    description:
      "A 48-hour hackathon focused on building autonomous agents and tool-calling integrations, including WebMCP-based demos.",
    url: "https://aiagentshack.dev",
  },
  {
    id: "react-summit-2027",
    title: "React Summit",
    category: "conference",
    date: "2027-06-18",
    location: "Amsterdam, Netherlands",
    description:
      "A conference dedicated to the React ecosystem: server components, concurrent rendering, and the tools around them.",
    url: "https://reactsummit.com",
  },
  {
    id: "rust-nation-uk",
    title: "Rust Nation UK",
    category: "conference",
    date: "2027-02-27",
    location: "London, UK",
    description:
      "A community conference for Rust developers covering systems programming, WASM, and performance engineering.",
    url: "https://rustnationuk.com",
  },
  {
    id: "open-source-meetup-sp",
    title: "Open Source Meetup SP",
    category: "meetup",
    date: "2026-09-20",
    location: "Sao Paulo, Brazil",
    description:
      "Local meetup for maintainers and contributors to discuss open source governance, funding and community building.",
    url: "https://osmeetup.dev",
  },
];
