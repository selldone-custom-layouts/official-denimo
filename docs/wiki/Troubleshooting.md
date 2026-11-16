# Troubleshooting

## Sign in goes to Selldone and shows an error

The shop has no OAuth client for sign-in. Set up the shop's OAuth client id (shop dashboard, or the Selldone MCP connector's `selldone_shop_client_create`). See [Shop Requirements](Shop-Requirements).

## The shop shows a blank page, or an old page flashes first

A chunk imports `../shop.js`, so the app loads twice through Selldone's redirect. Keep shared code in the `core` chunk and don't use `experimentalMinChunkSize` (both in `vite.config.ts`). When you add a chunk group, keep its rule: a module joins a group only when everything it imports outside core is in the same group. `release.sh` refuses a build with `../shop.js` imports, and its production-bundle check (step 5b) refuses a build that does not draw the home in a real browser.

## `release.sh` stops with "PROD-CHECK FAILED: not uploading"

Nothing was uploaded, and the version number is not used up. The built bundle did not draw one of home, a collection, a product, the journal, a post, the bag or the checkout, or a page error happened. The lines above the message name the page and the error.

| Message | Fix |
| --- | --- |
| `FAIL home`, then "the home did not draw; the bundle does not start" | The build itself is broken, typically a chunking change (code that runs before what it needs). Undo the last change to `vite.config.ts` or to what the entry imports, rebuild and run `scripts/prod-check.mjs dist/app` again. |
| `FAIL category: no collection link on the home` / `FAIL product` / `FAIL post` | The page before it drew, but had nothing to follow: the shop in `SHOP_URL` has no collections, products or posts. Use a shop with data (the default `https://denimo.selldone.shop` has them). |
| "has no private Layout release in its loader" | The `SHOP_URL` domain has no Layout pinned, so there is no loader to point at the build. Use the default, or a domain of yours with a Layout pinned. |
| `Cannot find module` / an error naming Playwright | `PW` does not point at your Playwright: set `PW=<path>/node_modules/playwright/index.js`, and run `npx playwright install chromium` once. |
| "no dist/app/shop.js" | Build first (`npm run build-production`, or run the whole `release.sh`). |

Fix the cause and run `release.sh` again with the same version number.

## Chunks fail with a MIME error (`text/x-java`)

Selldone stores the MIME type it sniffs from each file. Every JS file must start with `"use strict";`: that is `sniffAsJavaScript` in `vite.config.ts`. Check with `file --mime-type dist/app/js/*.js`.

## The upload is rejected

| Message | Fix |
| --- | --- |
| `CHECK FAILED` from `release.sh`, with `files:` over 300 | Too many files. Denimo's release refuses more than 300 (1.0.0 has 281; each photo in `skins/denimo/photos/` adds one, and a new dependency can add many). Remove what you added, or group it with the code it travels with in `vite.config.ts`. |
| "The manifest must be an array." | Upload with `scripts/kalio-deploy.mjs`, not the plain CLI. |
| "Archive paths must be safe relative app/ paths." | Remove `dist/index.html`, and use no spaces or brackets in file names. |
| "Active SVG attributes" / "only passive vector shapes" | Run `node scripts/kalio-svg-flatten.mjs dist/app`. |
| Request cut off after ~100 s, and the version exists but is empty | Too many files reached the server. Stay at 300 or fewer, then upload a **new** version number. |
| 401 | The CLI is signed out (`~/.selldone-dev/.persist` is empty). Run `selldone` → Login. |
| `node: bad option: --use-system-ca` | Your Node.js is too old for the release scripts. Use Node.js 22.15 or newer. |

## The upload worked but the shop still shows the old version

- The version isn't attached yet: see [Go Live](Go-Live).
- A custom domain keeps its own selection. Attach the version to that domain, or set it to **inherit**.
- You checked a URL with a query. Open the plain address and read `window.sdShopLayout`.
- The ZIP was stale: always package with `--force` and compare `shop.js` with `cmp`.

## `/` shows a landing page, the Layout is only on `/shop`

The Home is a Page Builder page. Set Home to **Shop** for the shop, or for that domain: see [Go Live](Go-Live).

## The Layout's description on Selldone is not the one in `manifest.json`

Selldone keeps the description of the first upload; later uploads do not change it. Write the description before the first upload.

## A product sits on a white or coloured square

Its photo has its own ground. Denimo sets every style on a tinted plate (the family's dark plate in dark mode), so the main photo must be a **transparent cut-out** (PNG or WebP). Replace the photo in Selldone; no release is needed. See [Shop Requirements](Shop-Requirements#products).

## A product photo is blurry, or a small one does not load

Selldone's CDN keeps product photos only at their original size and as a 128 px thumbnail; any other size is a 404. In code, use `productImage(p)` (the original, in `components/ly/ly.ts`) for anything wider than a thumbnail, and `productImage(p, 128)` only for small thumbnails.

## A photo slot shows a plain colour or a product instead of a photo

That is the slot's fallback (a plain family colour, or your best seller on a plate): the Layout has no file for it. A department banner without its file is left out. Add `skins/denimo/photos/<exact name>.webp` (`hero.webp`, `aud-women.webp`, `journal.webp`…; for a department, `col-<slug of its title>.webp`, `split-<slug>.webp` or `wide-<slug>.webp`, as in `col-tops-and-t-shirts.webp`), then build and release a new version: the files are listed at build time. See [Customize](Customize#photos).

## A collection shows a photo that is not mine

The repository ships Fashioni's eight department photos (`col-activewear`, `col-footwear`, `col-dresses-one-pieces`, `col-tops-t-shirts`, … in `skins/denimo/photos/`) and four department banners (`split-tops-t-shirts`, `split-activewear`, `wide-dresses-one-pieces`, `wide-footwear`). A collection of yours whose title (or address name) makes the same slug picks one up. Replace the file with your own photo, or delete it (the collection then shows its best seller on a plate, and has no banner), and release a new version. The same goes for the other slot photos (the hero, the audiences, the journal, the footer): they were made for Fashioni, and you can replace or delete any of them.

## A home section is missing

Each section folds away without its data, or shrinks to what the shop has:

| Section | Needs |
| --- | --- |
| The hero's saving and capsules | a product with a saving for "Up to n% off" (else "Casual clothes for everyone"); a Women and a Men capsule for the audiences with products (Shop all fills in when fewer than two); the hero itself always shows |
| The offer band | a product with a saving |
| Shop by category | departments with products |
| The two portrait banners | departments with a `split-<slug>` photo (one banner when only one has a photo) |
| Trending now, On sale now, New arrivals | four or more products for each (four on sale for On sale now) |
| The wide banners | a department with a `wide-<slug>` photo for the first, a second one for the second |
| Shop for everyone | products with an audience (a tag, a word in the title or a spec "Department") |
| The journal | published articles |

The service cards always show: the pickup, the local delivery and the returns window (or the way to pay) that the shop has, and "Questions?" to fill the row; their words come from the shop's facts and wait until the shop's details have loaded. See [Shop Requirements](Shop-Requirements).

## The top bar is empty for a moment, then fills in

That is by design: the promo bar's messages (the biggest saving, free pickup, local delivery, returns, new styles) wait until the shop's own data has loaded, so no line is drawn half-made and then rewritten. If only "New styles every week" ever appears, the shop has no saving, no free pickup, no local delivery and no returns window on most products: see [Shop Requirements](Shop-Requirements#products).

## On a very wide screen (or zoomed out) the page looks like a strip

Denimo draws one page frame, 1920 px wide and centred: the photos that run to an edge (the campaign hero, the journal's photo) stop at the frame's edge, so the hero and the sections below share the same left and right edges, and the content column grows a little (up to 1600 px) on big screens; the wide and portrait banners sit inside that column. Wider than the frame, the sides show the page's own ground, while the promo bar and the footer with its denim texture still run the window's full width. Nothing is sized from the window, so text never squeezes into a thin column.

## A loading picture stays for a moment after the page is ready

On the first page load of a browser session Denimo keeps its own loading picture (the same as the domain's loading screen) until the shop's data, the collections and the first page are in and the first photo has decoded, and at least 1.2 s after the visit began, so the ring turns once; it is always gone by 4 s and never shows again in that session. With reduced motion it has no minimum and no animation. It lives in `components/ly/shell/LySplash.vue`.

## Deals shows only some pieces

Deals lists the pieces that have a saving. Give the other pieces a discount, or find them on their collection page and in search.

## The Women / Men / Kids menus don't open on hover

That is by design: the mega menus, the search and the menus open on a click and close on a second click, Esc, a click outside or a page change.

## the store hours are missing

They are read from the pickup point's note, as a time range: `8:00-18:00`, `8:00–18:00` or `8:00 to 18:00`, else from the shop info's hours line. Write them that way. Without a range, the hours are left out everywhere; nothing is guessed.

## Checkout shows no time windows

The windows are your delivery ways' own time spans. Add them to each delivery way in the Selldone dashboard. A window shows only for the way that offers it.

## Contact's map shows no streets

Neither the shop info nor the pickup point has a location. Set the shop's location on the map in the Selldone dashboard. Without one, Contact shows the map's calm water colour and the pin only.

## Filters are missing, or a spec key never becomes a filter

- Specs must be **flat**, plus `spec_order`. A nested spec is not shown anywhere.
- Only **Brand** (or the product's own brand), **Material** (or "Materials") and **Fit** become filters, each when the products on the page have two or more different values; a value longer than 60 characters is not offered. Every other key shows in the product page's The details. Size and Colour come from the variants, Price shows when the prices differ, and On sale when something on the page has a saving.

See [Shop Requirements](Shop-Requirements#specs-and-filters).

## Checkout says "This shop is not taking payment right now"

The shop has no payment method for this currency. Add one in the Selldone dashboard (cash on delivery is fine). Denimo shows this line instead of a Place order button that opens an empty window; the bag is kept.

## About, Terms, Privacy or FAQ say "Sample text"

The shop has not written that page yet. The sample is built only from your shop's facts. Write the page (or the FAQ entries) in the Selldone dashboard and the label goes away.

## A post ends with no products

The panel in a post shows the products its text links to (`/product/<id>` links, four at most), else the ones it names. Link the products in the article's text.

## Links in a post are underlined

That is by design: links inside a post's own text are the only underlined words in the Layout, so a reader can tell them from the text. Everywhere else no word or icon has a line under it.

## The footer's Theme row doesn't show on my shop

That is by design: with `themeSwitcher: "showcase"` it shows only on the Layout's own showcase shops. Set `themeSwitcher: "on"` in `components/ly/ly-theme.settings.ts` to give your visitors the switcher. See [Theme and colours](Theme-and-colours).

## A palette changes the buttons but the page keeps the brand colours

Every palette re-tints the whole page (bands, plates, lines, words, the dark top bar and footer) through `components/ly/ly-family.ts`, which builds the family from the palette's seed in `LY_SEEDS` (from `skins/denimo/skin.json`). A palette is added in `skins/denimo/skin.json` (`palettes.list`: an id, a name and a seed), then `node scripts/skin-apply.mjs` writes its action colours and the switcher shows it; a palette without a seed is refused there.

## Selldone's default purple appears in some places

Those are Selldone's own components using the theme colour. Denimo's switcher writes the palette into `--ly-act*` and the inherited `--bk-act*` names, from which the shared tokens (`style/kalio-tokens.scss`) set `--v-theme-primary`, and `ly-family.ts` paints Vuetify's theme colours from the palette's family; if a part still shows Selldone's purple, make it read that variable rather than a fixed colour. To change the colours themselves, use the settings file, not the tokens.

## Selldone's header or footer shows instead of Denimo's

The shop has custom header or footer code in Selldone. A shop with its own code keeps Selldone's header or footer (`layouts/StorefrontLayout.vue`). Remove the custom code to get Denimo's.

## I edited `style/ly/*.css` and my change was lost

Those files are generated from the mockup by `(the base's own stylesheets)`. Put the change in `style/ly-layout.scss` instead. See [Customize](Customize#styles).

## A corner looks round next to a sharp one

Denimo keeps one shape language: round for round things (circles, and capsules for the main buttons), 14 px for panels and photos, 8 px for inner parts, square only where a band meets the window's edge. A part that breaks it is usually one of Selldone's own pieces, or a new rule of yours: map it onto `--ly-r-pn` or `--ly-r-in` in `style/ly-layout.scss`, and run `scripts/shape-check.cjs` (see [Theme and colours](Theme-and-colours#checks)).

## A product page shows a plain purple page in a headless test

A headless browser opening a `/product/` link directly gets Selldone's SEO page. Open the home first and move with the Layout's links, or test in a normal browser or the dev server.

## The map in the address sheet is grey or 0 px tall

`mapbox-gl.css` sets `position: relative` on the map; its canvas must stay `position: absolute` (`style/kalio-checkout.scss`). The address sheet uses the `streets-v12` style. Search finds streets and numbers, not landmarks. With the checkout map off, the address sheet is a short form with search instead.

## Sticky parts don't stick

Vuetify's `.v-application` has `overflow: hidden`, which stops anything sticking. `style/ly-layout.scss` switches it to `overflow: clip` (the header and the product page's buy column stick); keep that rule if you restyle the page.

## GitHub blocks the push: "Mapbox Secret Access Token"

Selldone's storefront history contains Selldone's **public** Mapbox browser key (`pk.`). It has been public in `selldone/storefront` since 2023. Allow it once with the link GitHub prints, or remove it from your own commits.

## A word stays in English after picking another language

If it is your shop's data (a product, collection, unit, pros, spec or article), translate it in the Selldone dashboard. If Denimo writes it, it is a string not yet wrapped in `t()`: wrap it with a new `ly.…` key and add it to `ly.en.ts` and each `ly.<code>.ts` (Arabic: `ly.ar.ts`), or with a new `dn.…` key and add its translations to `skins/denimo/skin.json` "words" (then `node scripts/skin-apply.mjs`), then build and release. See [Customize](Customize#languages).

## I can't see the Arabic pages on my dev server

The language list is the shop's own. If your shop sells in English only, set `localStorage["denimo-dev-languages"] = "ar"` in the browser's console on the dev server and reload: Arabic is then offered in the language and currency pill (dev build only).

## A red "429 Too Many Attempts" message, or a page that stays empty

Selldone limits how many requests one address may send in a minute. Many test browsers at once (or several Layouts tested from one computer) reach it; shoppers do not. Denimo tries its shared reads up to four times, pausing as Selldone's Retry-After says; wait a minute and reload. Run the checks one at a time.
