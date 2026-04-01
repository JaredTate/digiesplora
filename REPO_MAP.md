# REPO_MAP.md

Total source/config files documented: 95

### babel.config.json
- Type: `.json` (5 lines).
- Top-level keys: presets, babelrcRoots.

### client/npm-shrinkwrap.json
- Type: `.json` (2284 lines).
- Top-level keys: name, version, lockfileVersion, requires, packages.

### client/package.json
- Type: `.json` (58 lines).
- Top-level keys: name, version, author, license, scripts, dependencies, browserify.
- npm scripts: postinstall, dist.
- Dependency entries: 27.

### client/src/app.js
- Type: `.js` (451 lines).
- Exports: default export function `main`.
- Internal functions: main.
- Key dependencies: ./rxjs, @cycle/run/lib/adapt, ./lib/fees, ./lib/privacy-analysis, ./const, ./util, ./l10n, ./views, ....

### client/src/components/loading.js
- Type: `.js` (6 lines).
- Exports: default export (expression/component/factory).
- Key dependencies: snabbdom-pragma.

### client/src/const.js
- Type: `.js` (13 lines).
- Exports: named export `blockTxsPerPage`; named export `addrTxsPerPage`; named export `blocksPerPage`; named export `maxMempoolTxs`; named export `nativeAssetId`; named export `nativeAssetLabel`; named export `nativeAssetName`; named export `assetTxsPerPage`; named export `pegTxsPerPage`.

### client/src/driver/blinding.js
- Type: `.js` (95 lines).
- Exports: CommonJS export `blinders_str`.
- Internal functions: makeCommitmentMap, parseBlinders, verifyHex32, verifyNum.
- Key dependencies: ../rxjs, ../lib/libwally.

### client/src/driver/instascan.js
- Type: `.js` (75 lines).
- Exports: CommonJS export `makeScanDriver`; CommonJS export `_`.
- Internal functions: load, startScan, stopScan.
- Key dependencies: ../rxjs.

### client/src/driver/route.js
- Type: `.js` (44 lines).
- Exports: CommonJS export `history`.
- Internal functions: route.
- Key dependencies: querystring, path-to-regexp, ../rxjs.

### client/src/driver/search.js
- Type: `.js` (57 lines).
- Exports: default export (expression/component/factory).
- Key dependencies: superagent, ../util, ../rxjs.

### client/src/l10n.js
- Type: `.js` (21 lines).
- Exports: default export (expression/component/factory); named export `defaultLang`.
- Key dependencies: basic-l10n, in-browser-language, ../../lang/index.

### client/src/lib/deduce-blinded.js
- Type: `.js` (42 lines).
- Exports: named export function `deduceBlinded`.
- Internal functions: deduceBlinded.

### client/src/lib/fees.js
- Type: `.js` (122 lines).
- Exports: named export function `getMempoolDepth`; named export function `getConfEstimate`; named export function `squashFeeHistogram`; named export function `feerateCutoff`; named export function `calcSegwitFeeGains`.
- Internal functions: calcSegwitFeeGains, feerateCutoff, getConfEstimate, getMempoolDepth, squashFeeHistogram.

### client/src/lib/libwally.js
- Type: `.js` (107 lines).
- Exports: named export function `load`; named export function `generate_commitments`; named export function `asset_generator_from_bytes`; named export function `asset_value_commitment`.
- Internal functions: asset_generator_from_bytes, asset_value_commitment, checkCode, encodeHex, generate_commitments, load, parseHex, readBytes, split_int52_lo_hi.

### client/src/lib/privacy-analysis.js
- Type: `.js` (141 lines).
- Exports: default export function `getPrivacyAnalysis`.
- Internal functions: getPrivacyAnalysis.

### client/src/run-browser.js
- Type: `.js` (43 lines).
- Exports: none (script/side-effect module).
- Key dependencies: @cycle/rxjs-run, @cycle/http, @cycle/dom, @cycle/history, ./driver/route, ./driver/search, ./driver/instascan, ./rxjs, ....

### client/src/run-server.js
- Type: `.js` (80 lines).
- Exports: default export function `render`.
- Internal functions: done, htmlUpdate, render, stateUpdate.
- Key dependencies: @cycle/rxjs-run, @cycle/http, @cycle/html, ./driver/route, ./driver/search, ./rxjs, ./app, snabbdom-to-html/modules.

### client/src/rxjs.js
- Type: `.js` (33 lines).
- Exports: CommonJS export (factory/object).
- Key dependencies: rxjs/Observable.

### client/src/style.css
- Type: `.css` (67 lines).
- Notable selectors: .nav-container, .navbar-brand, .site-title, .site-title h1, .site-title h2, #selection, .nav-container, .navbar-brand, .site-title, h1.

### client/src/util.js
- Type: `.js` (159 lines).
- Exports: named export `notNully`; named export `isHash256`; named export `parseHashes`; named export `updateBlocks`; named export `isAllUnconfidential`; named export `isRbf`; named export `isAllNative`; named export `outTotal`; named export `isNativeOut`; named export `tryUnconfidentialAddress`; named export `processGoAddr`; named export `makeAddressQR`; named export `last`; named export `combine`; named export `dropErrors`; named export `extractErrors`; named export `tickWhileFocused`; named export `tickWhileViewing`; named export `dbg`; named export `updateQuery`.
- Key dependencies: querystring, qrcode, debug, assert, ./rxjs, ./const, bs58check.

### client/src/views/addr.js
- Type: `.js` (165 lines).
- Exports: default export (expression/component/factory).
- Key dependencies: snabbdom-pragma, ../util, ./layout, ./search, ./tx, ./util, ../const, ../components/loading.

### client/src/views/asset.js
- Type: `.js` (290 lines).
- Exports: default export (expression/component/factory).
- Key dependencies: snabbdom-pragma, ../util, ./util, ./layout, ./search, ./tx, ../const, ../components/loading.

### client/src/views/asset-list.js
- Type: `.js` (124 lines).
- Exports: default export (expression/component/factory).
- Key dependencies: snabbdom-pragma, ./util, ./layout, ../components/loading.

### client/src/views/block.js
- Type: `.js` (178 lines).
- Exports: default export (expression/component/factory).
- Key dependencies: snabbdom-pragma, ./layout, ./tx, ../util, ./util, ../const, ../components/loading.

### client/src/views/blocks-all.js
- Type: `.js` (19 lines).
- Exports: named export `recentBlocks`.
- Key dependencies: snabbdom-pragma, ./layout, ./blocks.

### client/src/views/blocks.js
- Type: `.js` (70 lines).
- Exports: named export `blks`.
- Key dependencies: snabbdom-pragma, ./util, ../components/loading.

### client/src/views/error.js
- Type: `.js` (17 lines).
- Exports: named export `error`; named export `notFound`.
- Key dependencies: snabbdom-pragma, ./layout.

### client/src/views/footer.js
- Type: `.js` (54 lines).
- Exports: default export (expression/component/factory).
- Key dependencies: snabbdom-pragma.

### client/src/views/home.js
- Type: `.js` (25 lines).
- Exports: named export `dashBoard`.
- Key dependencies: snabbdom-pragma, ./layout, ./blocks, ./transactions.

### client/src/views/index.js
- Type: `.js` (21 lines).
- Exports: none (script/side-effect module).
- Key dependencies: ./asset, ./asset-list.

### client/src/views/layout.js
- Type: `.js` (15 lines).
- Exports: default export (expression/component/factory).
- Key dependencies: snabbdom-pragma, ./navbar, ./footer, ./sub-navbar.

### client/src/views/loading.js
- Type: `.js` (11 lines).
- Exports: default export (expression/component/factory).
- Key dependencies: snabbdom-pragma, ./layout.

### client/src/views/mempool.js
- Type: `.js` (65 lines).
- Exports: default export (expression/component/factory).
- Key dependencies: snabbdom-pragma, ../lib/fees, ./util, ./layout, ./search.

### client/src/views/navbar.js
- Type: `.js` (14 lines).
- Exports: default export (expression/component/factory).
- Key dependencies: snabbdom-pragma, ./navbar-menu.

### client/src/views/navbar-menu.js
- Type: `.js` (30 lines).
- Exports: default export (expression/component/factory).
- Key dependencies: snabbdom-pragma, ./nav-toggle.

### client/src/views/nav-toggle.js
- Type: `.js` (95 lines).
- Exports: default export (expression/component/factory).
- Key dependencies: snabbdom-pragma, ../const, ../util.

### client/src/views/pushtx.js
- Type: `.js` (19 lines).
- Exports: default export (expression/component/factory).
- Key dependencies: snabbdom-pragma, ./layout.

### client/src/views/scan.js
- Type: `.js` (17 lines).
- Exports: default export (expression/component/factory).
- Key dependencies: snabbdom-pragma, ./layout.

### client/src/views/search.js
- Type: `.js` (23 lines).
- Exports: default export (expression/component/factory).
- Key dependencies: snabbdom-pragma.

### client/src/views/sub-navbar.js
- Type: `.js` (17 lines).
- Exports: default export (expression/component/factory).
- Key dependencies: snabbdom-pragma, ./search.

### client/src/views/transactions-all.js
- Type: `.js` (18 lines).
- Exports: named export `recentTxs`.
- Key dependencies: snabbdom-pragma, ./layout, ./transactions.

### client/src/views/transactions.js
- Type: `.js` (40 lines).
- Exports: named export `transactions`.
- Key dependencies: snabbdom-pragma, ./util, ../components/loading.

### client/src/views/tx.js
- Type: `.js` (189 lines).
- Exports: default export (expression/component/factory); named export `txBox`.
- Key dependencies: snabbdom-pragma, ./layout, ./search, ./tx-vin, ./tx-vout, ./tx-privacy-analysis, ./tx-segwit-gains, ./util, ....

### client/src/views/tx-privacy-analysis.js
- Type: `.js` (73 lines).
- Exports: default export (expression/component/factory).
- Key dependencies: snabbdom-pragma.

### client/src/views/tx-segwit-gains.js
- Type: `.js` (18 lines).
- Exports: default export (expression/component/factory).
- Key dependencies: snabbdom-pragma.

### client/src/views/tx-vin.js
- Type: `.js` (149 lines).
- Exports: default export (expression/component/factory).
- Key dependencies: snabbdom-pragma, ./util.

### client/src/views/tx-vout.js
- Type: `.js` (121 lines).
- Exports: default export (expression/component/factory).
- Key dependencies: snabbdom-pragma, ./util.

### client/src/views/util.js
- Type: `.js` (126 lines).
- Exports: named export `formatTime`; named export `formatSat`; named export `formatAssetAmount`; named export `formatOutAmount`; named export `formatHex`; named export `formatNumber`; named export `formatJson`; named export `linkToParentOut`; named export `linkToParentAddr`; named export `linkToAddr`; named export `formatVMB`; named export `getSupply`; named export `strTruncate`; named export `formatBlockNumber`.
- Key dependencies: snabbdom-pragma, move-decimal-point, fmtbtc, ../const, ../util.

### dev-server.js
- Type: `.js` (74 lines).
- Exports: none (script/side-effect module).
- Key dependencies: fs, pug, path, glob, express, browserify-middleware, cssjanus, morgan.

### Dockerfile
- Type: `Dockerfile` (67 lines).
- Container build/runtime definition.
- Base images/stages: blockstream/esplora-base:latest -> debian:bookworm-slim.

### Dockerfile.deps
- Type: `.deps` (93 lines).
- Container build/runtime definition.
- Base images/stages: blockstream/wallycore@sha256:62cc52bd3ad9176b55cb486482368f858a4debee248a15d2fada0a62eb074a05 -> debian:bookworm-slim.

### Dockerfile.tor
- Type: `.tor` (29 lines).
- Container build/runtime definition.
- Base images/stages: alpine@sha256:e15947432b813e8ffa90165da919953e2ce850bef511a0ad1287d7cb86de84b5 -> alpine@sha256:e15947432b813e8ffa90165da919953e2ce850bef511a0ad1287d7cb86de84b5.

### flavors/bitcoin-testnet/extras.css
- Type: `.css` (71 lines).
- Notable selectors: #BitcoinTestnet, #LiquidTestnet, #Bitcoin, #Liquid, .main-nav li.active a, .sub-nav .active, .details-btn > div, .transaction-box > .footer > div:nth-child(3), .navbar, .sub-nav a sup.highlight, .main-nav li a, .nav-link:hover.

### flavors/blockstream/electrum-hosts-bitcoin-mainnet.json
- Type: `.json` (5 lines).
- Top-level keys: electrum.blockstream.info, explorerzydxu5ecjrkwceayqybizmpjjznk5izmitf2modhcusuqlid.onion.

### flavors/blockstream/electrum-hosts-bitcoin-testnet.json
- Type: `.json` (5 lines).
- Top-level keys: electrum.blockstream.info, explorerzydxu5ecjrkwceayqybizmpjjznk5izmitf2modhcusuqlid.onion.

### flavors/blockstream/electrum-hosts-liquid-mainnet.json
- Type: `.json` (5 lines).
- Top-level keys: electrum.blockstream.info, explorerzydxu5ecjrkwceayqybizmpjjznk5izmitf2modhcusuqlid.onion.

### flavors/blockstream/extras.css
- Type: `.css` (55 lines).
- Notable selectors: .navbar-brand::before, .theme-light .navbar-brand::before, .footer-logo::before, .footer-logo, .footer-links, .theme-light .footer-logo::before, .footer-logo::before, .footer-logo::before, .theme-light .navbar-brand::before, .navbar-brand::before.

### flavors/liquid/extras.css
- Type: `.css` (250 lines).
- Notable selectors: .assets-table .assets-table-row, .assets-table .assets-table-row > *, .assets-table .assets-table-row.header, .assets-table .assets-table-row.asset-data, .assets-table .assets-table-row.header > *, .assets-table .assets-table-row.asset-data > *, .assets-table .assets-table-row.header > *, .assets-table .assets-table-row.asset-data, .assets-table .assets-table-row.asset-data:not(.loading):hover, .assets-table .assets-table-row.asset-data > *, .assets-table .assets-table-row.loading img, .assets-table .assets-table-row > div:nth-child(1).

### flavors/liquid-mainnet/extras.css
- Type: `.css` (22 lines).
- Notable selectors: .sub-nav .active, .details-btn > div, .transaction-box > .footer > div:nth-child(3), .navbar, .main-nav li.active a.

### flavors/liquid-testnet/extras.css
- Type: `.css` (74 lines).
- Notable selectors: #BitcoinTestnet, #LiquidTestnet, #Bitcoin, #Liquid, .main-nav li.active a, .sub-nav .active, .details-btn > div, .transaction-box > .footer > div:nth-child(3), .navbar, .sub-nav a sup.highlight, .table-title, .block-header-title, .transaction-header-title, .asset-page h1, .main-nav li a.

### lang/bg.json
- Type: `.json` (48 lines).
- Top-level keys: Address, Address: %s, Block %s, Block #%s: %s, Details, Height, In best chain (%s confirmations), Included in Block, lang_id, lang_name, Loading..., Load more, ....
- Translation entries: 39 locale strings.

### lang/bs.json
- Type: `.json` (44 lines).
- Top-level keys: Address, Address: %s, Block %s, Block #%s: %s, Confidential, Details, Height, In best chain (%s confirmations), Included in Block, lang_id, lang_name, Loading..., ....
- Translation entries: 32 locale strings.

### lang/de.json
- Type: `.json` (41 lines).
- Top-level keys: Address, Address: %s, Block %s, Block #%s: %s, Height, In best chain (%s confirmations), Included in Block, lang_id, lang_name, Loading..., Load more, Next, ....
- Translation entries: 29 locale strings.

### lang/en.json
- Type: `.json` (21 lines).
- Top-level keys: In best chain (%s confirmations), lang_id, lang_name, %s Confirmations, %s outputs, %s Transactions.
- Translation entries: 6 locale strings.

### lang/es.json
- Type: `.json` (49 lines).
- Top-level keys: Address, Address: %s, Block %s, Block #%s: %s, Details, Height, In best chain (%s confirmations), Included in Block, lang_id, lang_name, Loading..., Load more, ....
- Translation entries: 40 locale strings.

### lang/fr.json
- Type: `.json` (42 lines).
- Top-level keys: Address, Address: %s, Block %s, Block #%s: %s, Confidential, Details, Height, In best chain (%s confirmations), Included in Block, lang_id, lang_name, Loading..., ....
- Translation entries: 30 locale strings.

### lang/he.json
- Type: `.json` (127 lines).
- Top-level keys: Address, Address reuse, Address: %s, Asset ID, Block height, Block not found, Block %s, Block #%s: %s, Block timestamp, Broadcast raw transaction (hex), Broadcast transaction, Broadcast tx, ....
- Translation entries: 112 locale strings.

### lang/hr.json
- Type: `.json` (44 lines).
- Top-level keys: Address, Address: %s, Block %s, Block #%s: %s, Confidential, Details, Height, In best chain (%s confirmations), Included in Block, lang_id, lang_name, Loading..., ....
- Translation entries: 32 locale strings.

### lang/index.js
- Type: `.js` (21 lines).
- Exports: CommonJS export (factory/object).
- Key dependencies: ./en.json, ./pt-pt.json, ./de.json, ./fr.json, ./it.json, ./es.json, ./nl.json, ./bg.json, ....

### lang/it.json
- Type: `.json` (97 lines).
- Top-level keys: Address, Address: %s, Amount commitment, Asset commitment, Block Challenge, Block height, Block not found, Block %s, Block Solution, Block #%s: %s, Block timestamp, Broadcast raw transaction (hex), ....
- Translation entries: 82 locale strings.

### lang/jp.json
- Type: `.json` (48 lines).
- Top-level keys: Address, Address: %s, Block %s, Block #%s: %s, Coinbase, Details, Height, In best chain (%s confirmations), Included in Block, lang_id, lang_name, Loading..., ....
- Translation entries: 39 locale strings.

### lang/ko.json
- Type: `.json` (52 lines).
- Top-level keys: Address, Address: %s, Block %s, Block #%s: %s, Coinbase, Details, Height, In best chain (%s confirmations), Included in Block, lang_id, lang_name, Loading..., ....
- Translation entries: 43 locale strings.

### lang/me.json
- Type: `.json` (44 lines).
- Top-level keys: Address, Address: %s, Block %s, Block #%s: %s, Confidential, Details, Height, In best chain (%s confirmations), Included in Block, lang_id, lang_name, Loading..., ....
- Translation entries: 32 locale strings.

### lang/nl.json
- Type: `.json` (39 lines).
- Top-level keys: Address, Address: %s, Block %s, Block #%s: %s, Confidential, Height, In best chain (%s confirmations), Included in Block, lang_id, lang_name, Loading..., Load more, ....
- Translation entries: 27 locale strings.

### lang/pt-pt.json
- Type: `.json` (45 lines).
- Top-level keys: Address, Address: %s, Block %s, Block #%s: %s, Confidential, Details, Height, In best chain (%s confirmations), Included in Block, lang_id, lang_name, Loading..., ....
- Translation entries: 33 locale strings.

### lang/ru.json
- Type: `.json` (46 lines).
- Top-level keys: Address, Block %s, Details, Height, In best chain (%s confirmations), Included in Block, lang_id, lang_name, Loading..., Load more, Lock time, Next, ....
- Translation entries: 37 locale strings.

### lang/sr.json
- Type: `.json` (45 lines).
- Top-level keys: Address, Address: %s, Block %s, Block #%s: %s, Confidential, Details, Height, In best chain (%s confirmations), Included in Block, lang_id, lang_name, Loading..., ....
- Translation entries: 33 locale strings.

### lang/sv.json
- Type: `.json` (44 lines).
- Top-level keys: Address, Address: %s, Block %s, Block #%s: %s, Confidential, Details, Height, In best chain (%s confirmations), Included in Block, lang_id, lang_name, Loading..., ....
- Translation entries: 32 locale strings.

### lang/util/extract.js
- Type: `.js` (35 lines).
- Exports: none (script/side-effect module).
- Key dependencies: fs, @babel/parser, @babel/traverse.

### lang/util/json2po.js
- Type: `.js` (38 lines).
- Exports: none (script/side-effect module).
- Key dependencies: fs, path, ../en.json.

### lang/util/npm-shrinkwrap.json
- Type: `.json` (200 lines).
- Top-level keys: name, requires, lockfileVersion, dependencies.
- Dependency entries: 26.

### lang/util/package.json
- Type: `.json` (8 lines).
- Top-level keys: name, dependencies.
- Dependency entries: 2.

### lang/util/po2json.js
- Type: `.js` (26 lines).
- Exports: none (script/side-effect module).
- Key dependencies: pofile.

### lang/zh-cn.json
- Type: `.json` (45 lines).
- Top-level keys: Address, Address: %s, Block height, Block %s, Block #%s: %s, Confidential, Details, Height, In best chain (%s confirmations), Included in Block, lang_id, lang_name, ....
- Translation entries: 33 locale strings.

### npm-shrinkwrap.json
- Type: `.json` (8615 lines).
- Top-level keys: name, version, lockfileVersion, requires, packages.

### package.json
- Type: `.json` (39 lines).
- Top-level keys: name, version, scripts, author, license, browserslist, devDependencies, dependencies.
- npm scripts: dev-server, prerender-server, postinstall, dist, l10n:fetch, l10n:update-strings.
- Dependency entries: 15.

### prerender-server/npm-shrinkwrap.json
- Type: `.json` (452 lines).
- Top-level keys: name, version, lockfileVersion, requires, packages.

### prerender-server/package.json
- Type: `.json` (16 lines).
- Top-level keys: name, version, author, license, dependencies, scripts.
- npm scripts: start, dist.
- Dependency entries: 3.

### prerender-server/src/cluster.js
- Type: `.js` (18 lines).
- Exports: none (script/side-effect module).
- Key dependencies: cluster, os, ./server.

### prerender-server/src/server.js
- Type: `.js` (75 lines).
- Exports: none (script/side-effect module).
- Key dependencies: fs, pug, path, express, superagent, ../client/l10n, ../client/run-server, morgan, ....

### render-view.js
- Type: `.js` (18 lines).
- Exports: none (script/side-effect module).
- Key dependencies: pug, ./client/src/l10n, ./client/src/views, snabbdom-to-html.

### terraform/modules/prometheus/cloud-init/prometheus.yml
- Type: `.yml` (235 lines).
- Top-level YAML keys: bootcmd, mounts, users, write_files, runcmd.

### .travis.yml
- Type: `.yml` (8 lines).
- Top-level YAML keys: sudo, services, script.

### www/light-theme_style.css
- Type: `.css` (245 lines).
- Notable selectors: body.theme-light, .theme-light a, .theme-light a:link, .theme-light a:visited, .theme-light a:hover, .theme-light a:focus, .theme-light .main-nav li a, .theme-light .sub-nav a, .theme-light .toggle-container .toggle-menu, .theme-light .toggle-menu .section2 a, .theme-light .toggle-menu .section2 a:hover, .theme-light .toggle-menu .section1 .wallets-link .store-icons a, .theme-light .toggle-menu .section1 .wallets-link .store-icons a:hover, .theme-light .toggle-menu .section1 .wallets-link .wallets-logo .lightmode, .theme-light .toggle-menu .section1 .wallets-link .wallets-logo .darkmode.

### www/style.css
- Type: `.css` (2886 lines).
- Notable selectors: .hide, body, body.theme-dark, body[lang=he], .font-h1, .font-h2, .font-h3, .font-h4, .font-h5, .font-h6.
