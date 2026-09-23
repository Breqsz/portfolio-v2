import { images } from "./media";
import type { CaseBook } from "./types";

// Same sources and boundaries as pt.ts. Numbers keep their date and condition.
export const casesEn: CaseBook = {
  carga: {
    slug: "carga",
    name: "Carga",
    kind: "Independent study · synthetic data",
    status: "study",
    year: "2026",
    role: "Sole author: research, product scoping, spec, physical model, algorithm, tests and interface.",
    hook: "The route fits. Does the battery?",
    problem:
      "Before an electric fleet leaves the depot, someone has to know whether each route fits in each scooter's battery — and which scooter to send on which route.",
    summary: {
      what: "A decision layer over existing routes: it tells whether each route fits in each scooter's battery and assigns scooters to routes so that as few routes as possible run out of margin.",
      did: "All of it, from scoping to testing: market research, spec, energy model, assignment with the Hungarian algorithm and a static interface that runs with no server.",
      proves:
        "I can scope a problem so it doesn't compete with mature tools, pick the simplest solution that works, and prove with tests that it is the right one.",
    },
    home: {
      lead: "Route planners solve the order of stops and ignore the battery. Electric-fleet software handles charging and never looks at the route. Carga sits in between: it takes existing routes and answers whether each one fits in each scooter's battery.",
      facts: [
        "In a synthetic scenario with 40 routes and 40 scooters, assigning by each scooter's battery cuts the routes with no margin from 32 to 19 — and 15 don't close with any scooter at all.",
        "Assignment with the Hungarian algorithm: an exact optimum, in milliseconds, checked against exhaustive enumeration.",
        "A pure TypeScript core, in the browser, with no server: 431 unit tests and 23 end-to-end tests.",
      ],
    },
    context: [
      "The Brazilian route-planning market is crowded and solves the sequence of stops, but ignores the battery's state of charge. Electric-fleet software handles charging and doesn't look at the route. The intersection — given a set of ready-made routes and an electric fleet, which ones fit in each scooter's battery — has no owner.",
      "Carga takes that space as an independent study of last-mile electric logistics, built from how operators in the sector publicly describe their own planning: routes by time window, density and fleet range. The scenario has 40 synthetic routes over the real geography of Sorocaba, Brazil, with elevation and street layout precomputed.",
    ],
    constraints: [
      "It had to be a self-explanatory link: whoever receives it won't clone a repository or spin up a server.",
      "It had to keep working months later, with no server that sleeps and no quota that expires.",
      "No real operational data — the premise is stated on its own page, not hidden.",
      "Two readers on different clocks: three minutes for whoever decides, thirty for the engineer.",
      "A reality gate before any interface: if the model didn't reproduce known consumption (25–45 Wh/km, 80–120 km of range), the project stopped there.",
    ],
    decision: {
      chosen: "A decision layer over routes that already exist.",
      discarded: "Building a route planner that generates the best sequence of stops.",
      why: "Route planning has years of market R&D behind it, and the algorithm is rarely the bottleneck in delivery. A layer over existing routes adds value whatever tool generates them. The accepted cost: the product depends on someone supplying those routes.",
    },
    secondary: [
      {
        title: "The Hungarian algorithm, not a metaheuristic",
        body: "Assigning scooters to routes has an exact, cheap optimum — O(n³), milliseconds for 150 routes. Unnecessary complexity reads as technical insecurity. The intelligence lives in the cost matrix, and optimality is checked against exhaustive enumeration.",
      },
      {
        title: "A pure core in the browser, no backend",
        body: "Zero cost, nothing expires, and the core stays property-testable. The boundary between core and interface is enforced by lint and tests, not by discipline. The accepted cost is a scale ceiling of around 150 routes.",
      },
      {
        title: "Fix the ruler before loosening the number",
        body: "A latency test was measuring the CI's emulated WebGL, not the page. Instead of relaxing the threshold, it became three gates — none of them loosened.",
      },
    ],
    architecture: {
      caption: "Everything happens in the browser. There is no server.",
      frame: "Browser",
      nodes: [
        { title: "Precomputed scenario", detail: "40 synthetic routes, real street layout and elevation, bundled at build time" },
        { title: "Energy model", detail: "Wh per leg: mass that drops at every delivery, elevation, cost per stop, regeneration" },
        { title: "Route simulator", detail: "Charge curve per route × scooter pair; battery health measured or estimated" },
        { title: "Allocator", detail: "Cost matrix solved by the Hungarian algorithm" },
        { title: "Comparison", detail: "Arrival order against energy feasibility" },
        { title: "Static interface", detail: "Comparison, a bench with levers, charge curve, map and premises" },
      ],
      loop: "The interface's levers recompute the assignment live.",
    },
    validation: [
      {
        value: "32 → 19",
        label: "routes with no battery margin, out of 40, changing only the scooter↔route assignment",
        when: "09/2026",
        condition: "Synthetic scenario. 15 routes don't close with any scooter: the optimum fixed 13 of the 17 fixable ones.",
      },
      {
        value: "100/100",
        label: "unseen seeds improve with the optimal assignment, with no regressions",
        when: "09/2026",
        condition: "Seeded synthetic scenarios",
      },
      {
        value: "36.9 Wh/km",
        label: "model consumption, inside the band set before implementing (25–45 Wh/km)",
        when: "09/2026",
        condition: "Urban scooter profile; no test loosened",
      },
      {
        value: "431 + 23",
        label: "unit tests (including property-based) and end-to-end tests passing",
        when: "09/2026",
        condition: "Local run; CI hasn't run on this branch yet",
      },
      {
        value: "24–40 ms",
        label: "INP on the keyboard flow, unthrottled — 96–120 ms with a 4× slower CPU",
        when: "09/2026",
        condition: "Measured on a local machine",
      },
    ],
    limits: [
      "It doesn't generate routes. It isn't a TMS, a tracker or a driver app.",
      "It isn't a deployment or a partnership with any company, and it uses no real operational data.",
      "The output is a deterministic charge margin. Probabilistic output and charge scheduling are designed, not implemented.",
      "Temperature isn't part of the model. There is only one vehicle type, and one route per scooter per day.",
      "“32 → 19” is a count of routes in a synthetic scenario — not savings and not real-world impact.",
    ],
    learning:
      "While making the scenario more realistic, with fewer scooters than routes, I unknowingly opened a path where the algorithm won by dropping the hard routes — which didn't count as failures. The test passed 8 out of 8 for the wrong reason. I closed it by counting unserved routes as failures and running two configurations; the thesis survived both.",
    stack: ["TypeScript", "Next.js 16 (static export)", "React 19", "Tailwind 4", "MapLibre + PMTiles", "Vitest + fast-check", "Playwright + axe", "Lighthouse CI"],
    links: [],
    linksNote: "Private repository and the site isn't published yet. The screens below are captures of the build.",
    media: [
      {
        src: images.carga.comparativo,
        alt: "Carga's first screen: 32 routes with no margin by arrival order against 19 by energy feasibility, with the grid of all 40 routes.",
        caption: "The first screen answers in 30 seconds: same fleet, same routes, a different assignment.",
        device: "desktop",
      },
      {
        src: images.carga.bancada,
        alt: "Carga's bench: reserve and departure-charge levers, route 14 described in text, the route map and the battery charge curve.",
        caption: "The bench: two levers recompute the whole assignment, live, in the browser.",
        device: "desktop",
      },
      {
        src: images.carga.premissas,
        alt: "Carga's premises page: every number comes from public literature and manufacturer data.",
        caption: "The premise up front: no real operational data, and what 30 days of telemetry would change.",
        device: "desktop",
      },
      {
        src: images.carga.mobile,
        alt: "Carga on a phone, with the 32 against 19 comparison in a single column.",
        device: "mobile",
      },
    ],
    seo: {
      title: "Carga — route energy feasibility",
      description:
        "Independent study: a decision layer that tells whether each route fits in each electric scooter's battery and assigns scooters with the Hungarian algorithm. TypeScript core, no server.",
    },
  },

  hold: {
    slug: "hold",
    name: "Hold Corretora",
    kind: "Real client · live website",
    status: "live",
    year: "2026",
    role: "Building the site and making the interface and engineering calls: components, mobile, accessibility, images, the WhatsApp form and technical SEO. The brand was settled with the client.",
    hook: "A consultative business, translated into a digital experience.",
    problem:
      "An insurance and benefits brokerage with four lines of business and two kinds of client needed a site that took every visitor to a conversation with an advisor — without looking like one more generic brokerage.",
    summary: {
      what: "Hold's corporate website: health plans, insurance, consortiums and financial solutions, for individuals and companies, in Portuguese and English.",
      did: "I built the site and ran the rounds with the client page by page — from the component system to the mobile polish, the detail modal and the form that turns into a WhatsApp message.",
      proves: "I ship for real clients, in production, and iterate on feedback without breaking what was already approved.",
    },
    home: {
      lead: "Four lines of business, two audiences, one goal: a conversation with an advisor. The content forks into “For you” and “For your company” when the argument changes, and every block ends in contact.",
      facts: [
        "Three ~200-line modals became one component with a real focus trap — the PR removed more than it added (+505 / −752).",
        "Mobile polish across four pages without moving a single pixel of the desktop the client had already approved.",
        "Bilingual, with one simple rule: no translation key ships without the other.",
      ],
    },
    context: [
      "A corporate website with four lines of business, always in this order: Health, Insurance, Consortiums and Financial Solutions. Success is measured in qualified conversations — WhatsApp and the form — not in time on site. That's why every section ends in contact.",
      "The site evolved through rounds of client feedback, page by page, with the desktop approved before mobile.",
    ],
    constraints: [
      "Approved desktop: no mobile change could move a single desktop pixel.",
      "Pages share components, and improving one could silently break another. Rule: one page at a time, and shared components only change additively.",
      "Client copy was untouchable in several deliveries.",
      "Portuguese and English in the same commit — one missing key had already broken cards in production.",
      "Typography with a proper commercial license.",
    ],
    decision: {
      chosen: "Premium restraint: one navy per line of business, red only for action, and WhatsApp as the conversion yardstick.",
      discarded: "The market default — light blue, grids of identical cards, stock photos — and an expressive, colorful look.",
      why: "The first erases the brand; the second clashes with the seriousness of health and insurance. A first version with gold and an editorial serif was dropped during execution because it blurred the distinction between the lines of business. The color tells visitors where they are; the call to action always leads to a conversation.",
    },
    secondary: [
      {
        title: "Mobile as surgical polish, with a gate",
        body: "Redoing it mobile-first put the approved desktop at risk. The rule: any mobile value changed on an element that also appears on desktop gets its desktop value pinned back. A 13 px text floor, 44 px touch targets, one page per branch.",
      },
      {
        title: "One modal instead of three copies",
        body: "Three ~200-line forks became one component, with Radix Dialog bringing a real focus trap — before, you could Tab out of an open dialog. Three visual directions were compared side by side; the glass one lost on contrast and on the cost of backdrop-filter on mid-range Android.",
      },
      {
        title: "The form that becomes a conversation",
        body: "The form stopped depending on an email service and now builds the message straight into WhatsApp, through a single shared builder.",
      },
    ],
    architecture: {
      caption: "Every path ends in a conversation.",
      nodes: [
        { title: "Visitor", detail: "An individual or a company, mostly on a phone" },
        { title: "Home and four lines", detail: "Each line with its own navy, in two languages" },
        { title: "For you / For your company", detail: "Forks the argument when it changes" },
        { title: "Card → detail modal", detail: "One global component on Radix Dialog" },
        { title: "Contact", detail: "WhatsApp or the form, built by a single builder" },
        { title: "A conversation with an advisor" },
      ],
      loop: "Every block has a shortcut straight to contact.",
    },
    validation: [
      {
        value: "3 → 1",
        label: "duplicated modals consolidated into one component; +505 / −752 lines across 15 files",
        when: "07/2026",
        condition: "22/22 component tests; build with 9/9 pages",
      },
      {
        value: "4 pages",
        label: "with mobile polish, identical desktop and touch targets of at least 44 px",
        when: "07/2026",
        condition: "4 PRs reviewed and merged",
      },
      {
        value: "360 → 1280 px",
        label: "image variant served on the cards — stretched before, sharp on retina now",
        when: "06/2026",
        condition: "Checked via currentSrc in the browser",
      },
      {
        value: "Live",
        label: "global modal, the mobile photo fix and the single typeface verified in the served HTML",
        when: "07/2026",
      },
    ],
    limits: [
      "There is no recorded measurement of conversion, leads or traffic — which is why no outcome number appears here.",
      "The brand identity was settled with the client. Years in business and number of partners are Hold's, not my metrics.",
    ],
    learning:
      "Three layout bugs in the new modal got through per-task review, a full-branch review and 22 green tests — and only showed up when I opened the screen. The test environment doesn't compute layout. Since then, a visual change is only done once it's measured in the browser.",
    stack: ["Next.js (App Router)", "React", "TypeScript", "Tailwind", "Framer Motion", "Radix Dialog", "react-hook-form + zod", "Vitest + Testing Library", "Vercel"],
    links: [{ label: "holdcorretora.com", href: "https://www.holdcorretora.com" }],
    media: [
      {
        src: images.hold.home,
        alt: "Hold's home page: “One ecosystem. Four fronts.” over an image of four hands assembling a red puzzle.",
        caption: "The home page introduces the four lines of business before asking for anything.",
        device: "desktop",
      },
      {
        src: images.hold.saude,
        alt: "Hold's Health page, in that line's navy, with the argument for families, sole traders and companies.",
        caption: "Each line has its own navy: the color tells visitors where they are.",
        device: "desktop",
      },
      {
        src: images.hold.contato,
        alt: "Hold's three-step contact form — profile, interest and contact — which ends in a WhatsApp message.",
        caption: "The form builds the message and hands over the conversation, ready, in WhatsApp.",
        device: "desktop",
      },
      {
        src: images.hold.consorcios,
        alt: "Hold's Consortiums page: plans to build, strategies to grow.",
        device: "desktop",
      },
    ],
    seo: {
      title: "Hold Corretora — corporate website",
      description:
        "A real client, in production: Hold Corretora's website, with four lines of business, two audiences and every path ending in a conversation with an advisor.",
    },
  },

  neurorace: {
    slug: "neurorace",
    name: "NeuroRace",
    kind: "Team project · web MVP",
    status: "live",
    year: "2025–2026",
    role: "The project's web platform — race, performance, leaderboard and QR-code entry — and organizing the team's code on GitHub.",
    hook: "Between the signal and the experience.",
    problem: "Turning attention measured by an EEG sensor into a race the audience understands instantly and wants to play again.",
    summary: {
      what: "A game where focus, read by an EEG sensor, drives the race — with a leaderboard and feedback on your own performance. A finalist in Future Makers, the undergraduate research competition at Next FIAP 2025.",
      did: "The web front: the experience the audience sees and touches, in Next.js 16 and React 19, and the move of the code into the team's organization with its history preserved.",
      proves: "I work in teams, on products with hardware and sensitive data, outside the usual CRUD.",
    },
    home: {
      lead: "An EEG sensor reads the player's focus; the stronger the focus, the better the race goes. The web is where that becomes an experience: the race, personal performance and the leaderboard.",
      facts: [
        "A finalist in Future Makers, the undergraduate research competition at Next FIAP 2025.",
        "A web MVP in Next.js 16 and React 19, with state in zustand, charts in recharts and race entry by QR code.",
        "Privacy before persistence: no real EEG data is stored before there is a biometric data policy.",
      ],
    },
    context: [
      "A cognitive-experience platform: a game controlled by attention, measured by a NeuroSky sensor, with a leaderboard and performance feedback. It's a team project living in a GitHub organization, with separate repositories for the web, the backend and the edge service.",
      "The web front is the MVP: race screens, “my race”, the leaderboard and QR-code entry, with the project's own visual direction.",
    ],
    constraints: [
      "Biometric data is sensitive: no persisting real EEG data before a written privacy decision.",
      "A demonstrable experience first, without getting stuck on premature infrastructure.",
      "Hardware and real time bring infrastructure complexity that has to be validated before it's adopted.",
      "Code split between the organization and personal accounts.",
    ],
    decision: {
      chosen: "Web MVP first; EEG, real time and persistence come in stages.",
      discarded: "Building the full infrastructure before there was an experience to show.",
      why: "A demonstrable experience is worth more, sooner, than a complete architecture with no users. And biometric data needs its own privacy decision before storing any real reading.",
    },
    secondary: [
      {
        title: "An official repository in the organization, history preserved",
        body: "The web moved into the organization with its entire main branch — no squash, no fresh start — and the personal repository stayed as a backup. Before the push, I checked that the environment-variables file had never entered the history.",
      },
      {
        title: "Privacy before persistence",
        body: "A rule written from the start: no real EEG data is stored while there is no biometric data policy.",
      },
    ],
    architecture: {
      caption: "Solid line: built. Dashed: planned, or another part of the team.",
      nodes: [
        { title: "EEG sensor", detail: "Attention reading", planned: true },
        { title: "Edge service", detail: "Bridge between the sensor and the cloud", planned: true },
        { title: "Backend and real time", detail: "Live leaderboard and persistence", planned: true },
        { title: "Web platform", detail: "Race, performance, leaderboard, QR-code entry" },
        { title: "AI Coach", detail: "Feedback on performance", planned: true },
      ],
    },
    validation: [
      {
        value: "Finalist",
        label: "in Future Makers, the undergraduate research competition at Next FIAP 2025",
        when: "2025",
        condition: "As stated on the project's public site",
      },
      {
        value: "30 commits",
        label: "of web history moved into the organization, with no squash",
        when: "07/2026",
      },
    ],
    limits: [
      "The backend, the edge service and the AI Coach belong to other parts of the team; the scope here is the web.",
      "End-to-end EEG integration isn't confirmed, and no biometric data is stored.",
    ],
    learning:
      "Being a member of a GitHub organization doesn't grant write access to a specific repository. When the migration push came back 403, I diagnosed the permission through the API instead of cycling through credentials.",
    stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind", "Framer Motion", "zustand", "recharts", "qrcode.react"],
    links: [
      { label: "Web repository", href: "https://github.com/NeuroRace/web-plataform" },
      { label: "Project site", href: "https://neurorace-v2.vercel.app" },
    ],
    media: [
      {
        src: images.neurorace.home,
        alt: "NeuroRace's web platform: “Your mind, measured in real time”, with the attention and meditation chart in demo mode.",
        caption: "The platform today: the sensor's signal becomes a live chart — shown here in demo mode.",
        device: "desktop",
      },
      {
        src: images.neurorace.sobre,
        alt: "NeuroRace's “The Project” page: “Attention has become the most contested resource.”",
        caption: "The project page, redesigned around the “Noise → Signal” concept.",
        device: "desktop",
      },
      {
        src: images.neurorace.mobile,
        alt: "NeuroRace's platform on a phone, with the live signal chart in demo mode.",
        device: "mobile",
      },
    ],
    seo: {
      title: "NeuroRace — web platform",
      description:
        "Team project, a Future Makers finalist (Next FIAP 2025): a game controlled by attention measured with EEG. Scope: the web platform, in Next.js 16 and React 19.",
    },
  },

  autofix: {
    slug: "autofix",
    name: "AutoFix AI",
    kind: "Real client · working demo in production",
    status: "demo",
    year: "2026",
    role: "End to end: client discovery, scoping, architecture, cost and data-protection analysis, provisioning, code, tests and the presentation script.",
    hook: "Automation that knows when to bring in a person.",
    problem:
      "After the service, the repair shop loses the customer: nobody asks whether everything went well or reminds them of the next check-up, and the base of past customers sits idle.",
    summary: {
      what: "A WhatsApp after-sales agent for a car repair shop: it follows up 48 hours after the service, reminds customers of the next check-up when it's due, and hands over to a person when the subject goes past its limit.",
      did: "From discovery to deploy: I scoped it with the shop owner, designed the architecture, analyzed cost and data protection, provisioned WhatsApp, database and hosting, and wrote the demo that runs in production on a fictional customer base.",
      proves:
        "I build automation with brakes — the system knows what it can't say and when to bring in a person — and I think about real risk, like data protection and a banned number, before writing code.",
    },
    home: {
      lead: "A WhatsApp after-sales agent for a car repair shop. The limit of what it can do was drawn with the client and lives in the code: every fact comes from the database, and anything that isn't there goes to a person.",
      facts: [
        "The database owns all state, and there is a single exit path to WhatsApp — where opt-out, the 24-hour window, business hours and auditing live.",
        "An injectable clock: the system never calls now(). The demo's “skip 48 h” button runs the same engine as production.",
        "512 out of 512 tests against a real database, none skipped.",
      ],
    },
    ceiling: ["It doesn't diagnose.", "It doesn't quote prices.", "It doesn't promise deadlines.", "It doesn't invent time slots."],
    context: [
      "The client asked to start with after-sales. The system sends a follow-up 48 hours after the service, closes or escalates the conversation, and reminds the customer of the preventive check-up when it's due, offering a time slot.",
      "The first message is never written by the AI: outside the 24-hour window, WhatsApp only delivers templates approved by Meta. The natural conversation starts when the customer replies. The demo runs in production on a fictional customer base, with a three-scene stage to present to the shop owner.",
    ],
    constraints: [
      "WhatsApp rules: the 24-hour window, approved templates and a message category decided by Meta.",
      "Ban risk: the shop's main number couldn't be put at risk, so the agent uses a dedicated number.",
      "Data protection: the historical base never gave explicit opt-in. Legal basis chosen: legitimate interest, with opt-out in every message.",
      "The automation ceiling was drawn with the client.",
      "Zero budget for the demo and two weeks until the presentation.",
      "Everything depends on time — 48 hours, six months — and you can't test it by waiting for the real clock.",
    ],
    decision: {
      chosen: "The database owns all state, with a single exit path to WhatsApp.",
      discarded: "A visual orchestrator holding flow and state — or everything in code, rewriting ready-made connectors.",
      why: "The queue is a SQL function, and every send goes through a single function where opt-out, the 24-hour window, business hours and auditing live. Two sending paths would drift apart — and on the day they did, someone would get a message at 11 p.m., or after asking to stop.",
    },
    secondary: [
      {
        title: "After-sales only, for now",
        body: "The full suite from the brief — campaigns, technical triage, catalog and pricing — was left out, and so was a multi-vertical platform from day one. Abstracting before having one vertical in production means abstracting the wrong things. The slice chosen is also the safest one legally.",
      },
      {
        title: "An injectable clock",
        body: "The system never calls now(): a global time offset in the database lets the demo's “skip 48 h” button run the same engine as production, and makes the six-month rule testable in seconds.",
      },
      {
        title: "Escalate by subject, and the shop replies on the same channel",
        body: "A question about price, deadline or warranty opens a pending item for the shop, and the conversation carries on. Symptom triage only follows scripts approved by the shop, never the model's guess. The human reply goes out through the same sending function, with the same controls.",
      },
    ],
    architecture: {
      caption: "Application and database in the São Paulo region.",
      nodes: [
        { title: "Service completed", detail: "An event in the customer base" },
        { title: "Postgres", detail: "State, queue and the domain clock" },
        { title: "Single sender", detail: "Opt-out, 24-hour window, business hours and auditing" },
        { title: "WhatsApp", detail: "Meta's Cloud API to the customer's phone" },
        { title: "Signed webhook", detail: "Stores the reply and renews the window" },
        { title: "Agent with 10 tools", detail: "Queries the database; a validator blocks prices, deadlines and invented time slots" },
        { title: "Resolve, open a pending item or escalate", detail: "The shop replies on the same channel" },
      ],
      loop: "The shop's reply goes back through the single sender, with the same controls.",
    },
    validation: [
      {
        value: "512/512",
        label: "tests against a real database, none skipped",
        when: "09/2026",
        condition: "With the test environment loaded",
      },
      {
        value: "7/7",
        label: "real scenarios on WhatsApp: praise, mixed question, confirmation, triage, complaint and a request to stop",
        when: "08/2026",
        condition: "Inside the 24-hour window; 3 to 8 s per turn",
      },
      {
        value: "401 / 200",
        label: "on the production webhook: invalid signature rejected, valid one accepted",
        when: "08/2026",
      },
      {
        value: "4.3 s × 50.5 s",
        label: "the same answer with the model's low and high reasoning — low stayed",
        when: "08/2026",
        condition: "Identical final text",
      },
    ],
    limits: [
      "It's a working demo on a fictional base; the pilot with real customers hasn't started.",
      "No recovered-revenue figure: the demo's amounts are fictional.",
      "Real proactive sending depends on Meta approving the templates.",
      "n8n orchestration, calendar integration and a multi-user inbox were left for the pilot.",
    ],
    learning:
      "The webhook compared phone numbers by exact match, and WhatsApp delivers numbers from some Brazilian area codes without the ninth digit. No reply from customers in those regions would have been processed in the pilot — with no error at all, because “customer not found” was silent on purpose. I fixed it by accepting both forms and separating “not a customer” from “the database is down”. Wherever there is a silent drop, the dropped data has to show up somewhere.",
    stack: ["Next.js (App Router)", "TypeScript", "Supabase (Postgres, RLS, Realtime)", "WhatsApp Cloud API", "Pluggable tool-using LLM", "Vitest against a real database", "Vercel"],
    links: [],
    linksNote: "Private repository and a gated demo: it's a client project. The diagram below shows how it works.",
    media: [],
    seo: {
      title: "AutoFix AI — WhatsApp after-sales",
      description:
        "A real client: a WhatsApp after-sales agent for a car repair shop, with state in the database, a single sending path and an automation ceiling drawn with the client.",
    },
  },
};
