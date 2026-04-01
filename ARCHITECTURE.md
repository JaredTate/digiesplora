# DigiEsplora Architecture

## Executive Summary

DigiEsplora is a Cycle.js-based blockchain explorer frontend with optional server-side prerendering and a static production build pipeline. The app is organized around:

- **Reactive UI runtime** (`client/src/app.js`) that maps route + user events to HTTP API requests and view state.
- **Dual execution targets**:
  - **Browser runtime** (`client/src/run-browser.js`) for interactive SPA behavior.
  - **Server runtime** (`client/src/run-server.js`, `prerender-server/src/server.js`) for SEO/no-JS prerendering.
- **Composable view layer** (`client/src/views/*`) using JSX/snabbdom virtual DOM.
- **Environment/flavor-driven deployment** (Docker + chain flavor CSS/assets + env vars).

The project is effectively a **frontend/rendering layer** that expects a separate backend API (`API_URL`, usually `/api`) for chain data (blocks, txs, mempool, fees, assets).

## ASCII Architecture Diagram

```text
                           +-----------------------------+
                           |   Browser / User Request    |
                           +--------------+--------------+
                                          |
                             +------------v------------+
                             | Route + Events + Query  |
                             |  (driver/route, search) |
                             +------------+------------+
                                          |
                       +------------------v------------------+
                       |       Cycle.js App Core             |
                       |        client/src/app.js            |
                       |  - state streams                    |
                       |  - HTTP intent streams              |
                       |  - view selection                   |
                       +----------+---------------+----------+
                                  |               |
                     +------------v----+     +----v----------------+
                     | HTTP Driver     |     | View Components     |
                     | (@cycle/http)   |     | client/src/views/*  |
                     +-------+---------+     +----+----------------+
                             |                    |
                             | /api/*             | virtual DOM
                             v                    v
                    +----------------+      +------------------+
                    | Explorer API   |      | DOM/HTML Drivers |
                    | (external svc) |      | browser / SSR    |
                    +----------------+      +---------+--------+
                                                      |
                              +-----------------------+----------------------+
                              |                                              |
                    +---------v---------+                          +---------v-----------+
                    | Browser Runtime   |                          | Prerender Runtime   |
                    | run-browser.js    |                          | run-server.js +     |
                    | DOM + History +   |                          | prerender-server    |
                    | localStorage      |                          | express+pug         |
                    +-------------------+                          +---------------------+
```

## Directory Structure

```text
.
├── client/
│   ├── src/
│   │   ├── app.js                 # Main reactive app graph
│   │   ├── run-browser.js         # Browser entrypoint
│   │   ├── run-server.js          # SSR/prerender entrypoint
│   │   ├── driver/                # Custom Cycle drivers (route/search/scan/blinding)
│   │   ├── lib/                   # Analysis/math/wally helpers
│   │   ├── views/                 # Page and partial render components
│   │   └── util.js                # Shared app helpers
│   └── package.json
├── prerender-server/
│   └── src/
│       ├── server.js              # Express server invoking SSR renderer
│       └── cluster.js             # Multi-process launcher
├── lang/
│   ├── *.json                     # Localized translation dictionaries
│   ├── index.js                   # Locale index export
│   └── util/                      # i18n conversion scripts (json/po/extract)
├── flavors/                       # Per-network/per-brand CSS + host lists
├── www/                           # Static assets and core stylesheet(s)
├── Dockerfile*                    # Build/runtime/deps/tor images
├── dev-server.js                  # Local development web server + browserify
└── terraform/modules/prometheus/  # Infra monitoring config
```

## Key Components

### 1) Reactive application core (`client/src/app.js`)
- Defines route streams (`goBlock$`, `goTx$`, `goAddr$`, etc.), user interaction streams, and HTTP response streams.
- Implements most UI state as Rx streams: loading, theme, language, blocks, tx detail, mempool stats, fees, asset states.
- Produces combined state and delegates rendering to `views/*`.
- Includes optional **Elements-specific** behavior (asset pages, unblinding data, asset map).

### 2) Runtime adapters
- **Browser adapter (`run-browser.js`)**:
  - Wires DOM/HTTP/history/storage/scanner/blinding drivers.
  - Handles title updates and localStorage fallback.
- **Server adapter (`run-server.js`)**:
  - Wires HTML driver + route emulation for SSR.
  - Handles timeout/error/redirect behavior and returns rendered HTML/state metadata.

### 3) Drivers
- `driver/route.js`: path matching + query parsing + history integration.
- `driver/search.js`: smart search resolution (height/hash/short txo/address) through API checks.
- `driver/instascan.js`: QR scanning driver (browser conditional).
- `driver/blinding.js`: Elements blinding/unblinding data parser + lookup helpers.

### 4) View layer (`client/src/views/*`)
- Pure rendering modules for blocks, transactions, mempool, address, search, navbar/footer, etc.
- Utility formatters in `views/util.js` for currency/amount/time/links.
- `views/index.js` is a view registry with conditional Elements exports.

### 5) Domain helpers (`client/src/lib/*`)
- `fees.js`: fee histogram processing, confirmation estimates, segwit gains.
- `privacy-analysis.js`: transaction privacy heuristics.
- `deduce-blinded.js` and `libwally.js`: confidential tx commitment helpers.

### 6) Servers
- `dev-server.js`: developer server with browserify bundling, CSS preprocessing, optional custom assets/CORS/nojs redirects.
- `prerender-server/src/server.js`: express + cookies/theme/lang management + SSR rendering pipeline.

## Data Flow

1. **Route/Event input** enters via history driver, DOM events, scanner input, or search query.
2. `app.js` maps inputs to **API request intents** (blocks, txs, addresses, mempool, fee estimates, etc.).
3. HTTP driver executes requests against `API_URL`.
4. Responses are merged into stream-based state models (`blocks$`, `tx$`, `mempool$`, `asset$`, etc.).
5. State is rendered by selected view component.
6. Output goes to:
   - Browser DOM (interactive SPA), or
   - HTML string for prerender server response.

## Config & Deployment

### Environment-driven behavior
Important env vars used across runtime/build:
- `API_URL`, `BASE_HREF`, `SITE_TITLE`
- `IS_ELEMENTS`, `ASSET_MAP_URL`, `NATIVE_ASSET_*`
- `PRERENDER_TIMEOUT`, `SOCKET_PATH`, `PORT`
- Dev server: `CUSTOM_ASSETS`, `CUSTOM_CSS`, `CORS_ALLOW`, `NOSCRIPT_REDIR_BASE`

### Build/deployment stack
- Root `package.json` orchestrates client + prerender-server install/build.
- Docker chain:
  - `Dockerfile.deps` builds dependencies (bitcoin/elements/electrs/libwally wasm).
  - `Dockerfile` builds static explorer outputs for multiple networks/flavors.
  - `Dockerfile.tor` provides tor runtime image.
- CI (`.travis.yml`) validates Docker builds.
- Terraform Prometheus module contains monitoring cloud-init/service units.

## Design Patterns

- **Functional Reactive Programming (FRP):** app logic expressed as observable stream transformations.
- **Driver-based architecture (Cycle.js):** I/O (DOM, HTTP, history, storage, scanner) abstracted into drivers.
- **Isomorphic rendering:** same app graph reused for browser and server rendering entrypoints.
- **Feature flags via env vars:** Elements/asset behavior and deployment flavors are compile/runtime-configured.
- **Modular view composition:** page-level view modules with shared formatting/utilities.

## Notes Specific to DigiByte Adaptation

The codebase is originally structured as Esplora with Bitcoin/Elements assumptions in defaults and flavor folders, but it is adaptable to DigiByte by:
- setting network/native asset env defaults,
- pointing `API_URL` to DigiByte-compatible backend endpoints,
- customizing flavor assets/CSS and chain labels.
