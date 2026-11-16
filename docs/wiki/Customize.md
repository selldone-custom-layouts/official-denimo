# Customize

Denimo's design lives in its own components and style sheets. Selldone's commerce logic underneath (basket, bill, checkout, variants, orders, payment) stays untouched. After any change in the code, or a new photo in `skins/denimo/photos/`: build and upload a new version ([Build and Upload](Build-and-Upload)) and put it live ([Go Live](Go-Live)). A change in your shop's data (a title, a product photo, a delivery window, an article) needs no release: it shows on the next visit.

## The name and the wordmark

The wordmark is your **shop's title**, read live. `components/ly/LyLogo.vue` draws it in Archivo, in capitals, at weight 800 with wide letter spacing, and nothing under it (the skin's `wordmark`: `case` "upper", `weight` 800, `tracking` .14em, `sub` "none"; the rules are in `components/ly/ly-wordmark.ts`); a long title steps the size down so it never leaves the header. The footer's name, the copyright, the page titles and the messages use the same title. Rename the shop in Selldone and the Layout follows.

`components/kalio/kalio-brand.ts`: `BRAND.name = null` keeps the shop's title. A string there replaces it everywhere the storefront names the shop.

The mark (the browser tab's icon and the shop's avatar on order messages) is drawn from the title's first letter: `markFor()` in the same file for the tab (a pale capital in Archivo on a family-dark circle), and `components/ly/ui/LyMark.vue` (the letter on the family's dark) for the messages; the account draws the shopper's own letter the same way. It is inline, so there is no image file to replace; change those two to change it.

## The colours, dark or light

One file: `components/ly/ly-theme.settings.ts`. See [Theme and colours](Theme-and-colours). Do not edit the palettes in `components/ly/ly-theme.ts`, the family maths in `components/ly/ly-family.ts` or the tokens in `style/ly-skin.gen.scss` for a merchant's theme.

## Type, tokens and words

| What | Where |
| --- | --- |
| Fonts (Archivo for headings, the wordmark and numbers set large; DM Sans for text, buttons and the nav; Material Symbols Rounded only for Selldone's own parts and the shared pieces; an Arabic face only when Arabic is picked) | `components/kalio/kalio-fonts.ts` |
| Icons (inline line icons, one stroke width) and the mockup's product drawings (line drawings kept from the base; Denimo uses none) | `components/ly/ly-icons.ts`, drawn by `LyIcon.vue` and `LyArt.vue` |
| Type and shape tokens, and the brand palette's colours for the first paint (light in `:root`, dark in `html.ly-dark`), all generated from the skin | `style/ly-skin.gen.scss`, every name `--ly-…` |
| Every colour after the first paint: the grounds, plates, lines, words, the dark top bar and footer of the palette on the page | `components/ly/ly-family.ts`, written inline on `<html>` |
| "Bag" instead of basket in Selldone's own English strings | `components/kalio/kalio-brand.ts` (`bagWords()`) |
| Denimo's own words (through `t("ly.…", "English")` and `t("dn.…", "English")`) | the components, with the English at the call site; the `ly.*` words also in `components/kalio/i18n/ly.en.ts` and `ly.ar.ts`; the skin's own words (every `dn.*` word in Arabic, and Denimo's replacements for base words) in `skins/denimo/skin.json` "words" (see [Languages](#languages)) |

## Photos

| Picture | Where it comes from |
| --- | --- |
| Products on every card (the rails, the listings), Complete the look, the product page, the bag and the search suggestions | each product's main photo, a transparent cut-out (PNG or WebP); a colour's own photo is the card's second photo on hover; more photos make the product page's mosaic |
| The phone menu's departments | each department's best seller, as a thumbnail |
| Department photos: the home's **Shop by category** tiles, the mega menus' second tile, the About page | `skins/denimo/photos/col-<slug of its title>.webp` when the Layout has it, else its best seller on a plate (three on the About page; in a mega menu, no tile) |
| The photo slots: the campaign hero (desktop and phone), the departments' portrait and wide banners, the audience tiles (also the mega menus' first tile and the phone menu's audiences), the journal, the footer's texture | `skins/denimo/photos/<slot>.webp` when the Layout has it, else the slot's fallback in the table below (`components/ly/LyPhoto.vue`, `LyCuts.vue`) |
| The journal and each post | each article's cover image |
| Contact | a static map of the shop's location (Selldone's map service: the dark style in dark mode, the street style in light) with the shop's pin |

Product pictures are changed in the Selldone dashboard, not in the code. The cut-outs matter: the Layout sets every style on a tinted plate, and a photo with its own ground shows as a square. See [Shop Requirements](Shop-Requirements#products).

The repository's 23 photos (hero, banners, audiences, departments, journal and footer) were made for Fashioni. Photos generated with Magnific (Freepik) for Fashioni under the owner's Premium plan.

### The photo slots

| Slot | File in `skins/denimo/photos/` | Size | Without the file |
| --- | --- | --- | --- |
| The campaign hero (people on the right; the left 45% a light, calm wall for the words) | `hero.webp` | 2400 × 1000 | the family-dark band with the same words |
| The hero on a phone (the words sit under it) | `hero-phone.webp` | 1080 × 1350 | `hero.webp` cropped |
| A department's portrait banner (the lower third darker, for white words) | `split-<slug>.webp` | 1200 × 1500 | no banner for that department |
| A department's wide banner (one side calm; the Layout reads which, and whether the words are dark or white) | `wide-<slug>.webp` | 2400 × 1000 | no banner for that department |
| The same banner on a phone | `wide-<slug>-phone.webp` | 860 × 1075 | the wide photo cropped |
| An audience tile (Women, Men, Girls, Boys, Baby) | `aud-<women\|men\|girls\|boys\|baby>.webp` | 900 × 1200 | the audience's best seller on a plate |
| The journal ("Journal" over it) | `journal.webp` | 1200 × 1400 | the family tint |
| The footer's texture (dark denim) | `footer.webp` | 2400 × 800 | the plain family dark |
| Each department's tile | `col-<slug>.webp` | 900 × 1200 | its best seller on a plate |

`<slug>` is made from the collection's title: lower case, `&` as "and", every other run of signs a hyphen ("Tops & T-Shirts" → `tops-and-t-shirts`; the address name `tops-t-shirts` is tried too). The collection's address name in Selldone is tried too. The `split-<slug>` and `wide-<slug>` banners use the same slug. The repository ships Fashioni's eight department photos (`col-activewear`, `col-footwear`, `col-dresses-one-pieces`, `col-tops-t-shirts`, …) and four banners (`split-tops-t-shirts`, `split-activewear`, `wide-dresses-one-pieces`, `wide-footwear`); a collection whose title and address name match none of them shows its plate and has no banner. To add a photo:

1. Make it at the exact size, as WebP, with the exact name. No words, logos or price tags on it, and no product cut by the edge. Where the Layout's words sit over the photo (the hero's light left side, a wide banner's calm side, a portrait banner's darker lower third, the journal's word), leave that part calm and plain.
2. Put it in `skins/denimo/photos/`. `components/ly/ly-photos.ts` lists the files that exist at build time, so nothing else changes.
3. Build and release a new version, and check that the file count stays at 300 or fewer.

To drop a photo, delete its file and release: the slot shows its fallback. A slot never shows a caption, a file name or a size, with or without its file.

## Sections and pages

| What | Where |
| --- | --- |
| Header (the family-dark promo bar with the language and currency pill; the wordmark row with the wordmark, the search pill with live suggestions, the account and the bag button; the department row with Deals, New, the Women / Men / Kids mega menus, the biggest departments and Journal; the phone menu and the language sheet) | `components/ly/shell/LyHeader.vue`; the promo bar's messages in `components/ly/denimo/DnPromo.vue` |
| Bag drawer (the lines, the receipt, Checkout and View bag, Often added) | `components/ly/shell/LyBagDrawer.vue` |
| Footer (the shop's name and its line, Visit, Shop, Contact; the Theme row; the legal row) | `components/ly/shell/LyFooter.vue` |
| Wordmark | `components/ly/LyLogo.vue` |
| Home (campaign hero, offer band, Shop by category, two portrait banners, Trending now, a wide banner, On sale now, Shop for everyone, a second wide banner, New arrivals, service cards, journal; the order is the skin's `home` list) | `components/ly/home/LyHome.vue`; Denimo's sections in `components/ly/denimo/home/` (`DnHero.vue`, `DnOfferBand.vue`, `DnTiles.vue`, `DnSplit.vue`, `DnRail.vue`, `DnWide.vue`, `DnServices.vue`, `dn-home.ts`), the journal in `components/ly/home/sections/JournalSection.vue`; inside `pages/products/StorefrontPageProducts.vue` |
| Photo slots and drawings | `components/ly/LyPhoto.vue`, `LyCuts.vue`, `LyArt.vue`, `ly-photos.ts` |
| Shared data and layers (the collections and catalogue read once, the shop's facts, one layer open at a time) | `components/ly/ly.ts`; the audiences, sizes and colours in `components/ly/denimo/dn-data.ts` |
| Shared pieces (the card with its quick-add strip, the title band, add box, modal, empty state, sample label, icon lines, the shop's mark) | `components/ly/ui/` (`LyCard.vue`, `LyPt.vue`, `LyModal.vue`, `LyEmpty.vue`, `LySampleTag.vue`, `LyIcLine.vue`, `LyMark.vue`), `components/ly/denimo/listing/DnQuick.vue`, `components/ly/LyAdd.vue` |
| Listings (a department, an audience, search, deals, every style; the breadcrumb and name, Shop by, Filter + Sort, the grid, the description and the other departments under it) | `components/ly/shop/LyListing.vue`, `components/ly/denimo/listing/` (`DnShopBy.vue`, `dn-listing.ts`), inside `pages/products/StorefrontPageProducts.vue` |
| Product page (photo mosaic, buy column, Colour and Size, the size details sheet, add box, the delivery, pickup and returns lines, At a glance, the accordions, Complete the look, More &lt;department&gt;, Recently viewed, phone buy bar) | `pages/product/StorefrontPageProduct.vue`, `components/ly/product/` (`LyProductOverview.vue`, `LyPdAdd.vue`, `LyProductTabs.vue` for the accordions, `LyTogether.vue` for Complete the look, `pd.ts`), `components/ly/denimo/product/` (`DnGallery.vue`, `DnSizeSheet.vue`, `dn-pick.ts`) |
| Compare | `components/ly/compare/LyCompare.vue`, `pages/comparison/` |
| Bag page and checkout (the lines, How it reaches you, the receipt, step pills, Contact, Delivery and its windows, address or pickup point, Billing, note) | `pages/basket/cart/StorefrontPageBasketCart.vue` (Selldone's script, Denimo's markup), `components/ly/buy/ly-cart.ts`, `LyLineQb.vue` |
| Delivery ways and the delivery sheet | `pages/basket/cart/SCartShippingOptions.vue`, `components/ly/buy/LyShipSheet.vue` |
| Address sheet and payment window | `components/kalio/checkout/KalioAddressSheet.vue` and Selldone's window, dressed by `style/ly-sd.scss` |
| Order page (title band, progress, products, payment, receiver, chat) | `pages/basket/order/` (and `physical/dashbaord/`), `components/ly/order/` (`LyOrderPay.vue`, `LyOrderReceiver.vue`, `LyOrderChat.vue`, `od.ts`) |
| Account (Overview, Orders, Addresses, Profile) | `components/kalio/account/` (`KalioAccountShell.vue`, `KalioAccountHome.vue`, `KalioOrdersBoard.vue`, `kalio-account.ts`), `pages/user/` |
| Sign-in sheet | `components/kalio/shell/KalioSignIn.vue` |
| Journal and post | `pages/blog/list/StorefrontPageBlogsList.vue`, `pages/blog/view/StorefrontPageBlogsView.vue`, `components/ly/read/LyPost.vue` |
| About, Terms, Privacy, Contact, FAQ (with the sample text and its label) | `pages/official/`, `pages/faq/StorefrontPageFaq.vue`, `components/ly/read/` (`LyLegal.vue`, `LyMap.vue`, `rd.ts`) |
| 404 | `pages/errors/404/StorefrontPageError404.vue` |

Every page's markup is Denimo's own; the scripts underneath are Selldone's and the Kalio base's (bag, checkout, order, account, sign-in, compare). A shop with its own custom header or footer code in Selldone keeps Selldone's header or footer (`layouts/StorefrontLayout.vue`).

## Styles

| File | Holds |
| --- | --- |
| `style/ly-skin.gen.scss` | Denimo's tokens (`--ly-…`): type, the shape scale (`--ly-r-pn` 14 px for panels, `--ly-r-in` 8 px for inner parts, 50 % for round things), and the brand palette's colours of both modes for the first paint (`:root` light, `html.ly-dark` dark). |
| `components/ly/ly-family.ts` | not a style sheet, but it writes every colour of the palette on the page inline on `<html>` after the first paint; the theme switcher writes only the action colour (`--ly-act`, `-deep`, `-on`, `-text`) and Vuetify's primary on top. |
| `style/ly/base.css`, `pages.css`, `look.css`; `style/ly/variants.css` | the base's look (the first Layout's mockup stylesheets, now the base's own source): every rule scoped to the Layout's own markup (`:is(.ly, .ly *)`), custom properties `--ly-…`, dark mode `html.ly-dark`, keyframes `ly-*`; the section variants in `variants.css`. Change them in the base (`layout-base`) so every Layout gets the fix; a Layout's own touch goes in `style/ly-layout.scss`. |
| `style/ly-layout.scss` | the Layout's own touches, loaded after the base's sheets: the shell and pages, Selldone's and Vuetify's parts inside Denimo's pages mapped onto the same shape scale, and the places where the Vue markup differs from the mockup's. Change the look here. |
| `style/ly-sd.scss` | the parts Denimo borrows, in its dress: Kalio's address sheet (map on or off), Selldone's payment window, the scrim under the sheets |
| `style/ly/dn-shell.css`, `dn-listing.css`, `dn-product.css` | Denimo's own parts, loaded last: the promo bar, the department row and mega menus, the home's sections, the listing, the card and the product page |
| `style/storefront.scss` and the shared `kalio-*.scss` / `bakini-*.scss` it loads | the Kalio base's skin for Selldone's own components; their `--bk-act*` colours follow the palette, so Vuetify's primary follows it too |

All of them are loaded from `StorefrontApp.vue`: `storefront.scss` first, then `ly-theme.scss`, the generated `ly-skin.gen.scss`, `base.css`, `pages.css`, `look.css`, `ly-sd.scss`, `ly-layout.scss`, `variants.css`, and the three `dn-*.css` last. Every Denimo component wraps its markup in an element with the class `ly`, so these rules never touch Selldone's or Vuetify's parts outside it.

## Languages

Every word Denimo writes goes through `t("key", "English")` (`components/kalio/i18n/kalio-i18n.ts`). The English is the second argument at the call site; the dictionaries are files beside it:

| File | Holds |
| --- | --- |
| `components/kalio/i18n/base/<code>.ts` | the shared Kalio words (bag, checkout, account, compare, theme…), the same in every Kalio-family Layout |
| `components/kalio/i18n/ly.<code>.ts` | the Layout's own words: `ly.*` |
| `components/kalio/i18n/bakini.<code>.ts` | the `bakini.*` words the shared Kalio and Bakini code still uses |
| `skins/denimo/skin.json` "words" | per language (`en`, `ar`): the skin's own words, which win over the files above: Denimo's replacements for base words, and every `dn.*` word (the promo bar, the department row, the home's sections, the listing, the card, the product page) in Arabic; the English of a `dn.*` word is only at its call site |
| `components/kalio/i18n/lang-<code>.ts` | merges the three files and puts the skin's words for that language on top; loaded only when a visitor picks that language |
| `components/kalio/i18n/index.ts` | `EN` (English, bundled) and `LOADERS`, the list of other languages Denimo knows |

Denimo ships English and Arabic (`ar`, right to left: the whole page mirrors). The visitor picks one from the language and currency pill in the top bar (the phone menu's "Language & currency" row); the list is the shop's own languages (Selldone dashboard › Shop › Languages).

On the dev server only, `localStorage["denimo-dev-languages"] = "ar"` offers Arabic in your own browser even when the shop sells in English only, so you can see the Arabic pages before you switch the language on in the shop. The production build ignores it.

To change a word: edit the English at the call site, and the same key's value in `ly.en.ts` and in each `ly.<code>.ts` (a `dn.*` word, or a word the skin replaces, in `skin.json` "words", then run `node scripts/skin-apply.mjs`; a `bakini.*` word lives in `bakini.en.ts` and `bakini.<code>.ts`; a shared Kalio word, one without a prefix such as `theme.title`, in `base/en.ts` and `base/<code>.ts`).

To add a language your shop offers:

1. Copy `ly.en.ts` to `ly.<code>.ts` and `bakini.en.ts` to `bakini.<code>.ts`, and translate every value (keep `{n}`, `{shop}` and the other `{…}` words; plural keys end in `.one` / `.other`, and a language with more forms adds `.zero`, `.two`, `.few`, `.many`).
2. Translate `base/en.ts` into `base/<code>.ts` the same way, and add a `"<code>"` block to `skin.json` "words" with every key of its `ar` block translated (the `dn.*` words among them); run `node scripts/skin-apply.mjs`.
3. Copy `lang-ar.ts` to `lang-<code>.ts` and change its three imports.
4. Add one line to `LOADERS` in `index.ts`, next to `ar: () => import("./lang-ar")`.
5. Build and check every page in that language. A word still in English is a string that is not wrapped in `t()` yet: wrap it with a new `ly.…` or `dn.…` key.

The words the shop writes (product names, collections, units, pros, spec, articles) are the shop's data: translate them in the Selldone dashboard.

Right to left, Denimo keeps these rules:

- logical CSS everywhere (`margin-inline`, `inset-inline`, `padding-inline`, `text-align: start`, logical corner radii), so the page mirrors: the hero's photo is mirrored so its calm side stays under the words, which move to the right; a wide banner puts its words on whichever side of its photo is calm; the rails' arrows flip; the theme row's arrow keys follow the direction;
- only the parts that slide with `translateX` (the drawer, the menu, the filter panel, centred toasts) keep physical directions;
- the shop's own words (names, collections, addresses) sit in `<bdi>`, so each keeps its own direction inside a translated sentence; phone numbers stay left to right;
- an Arabic face (Noto Sans Arabic) is loaded only when Arabic is picked.

## Rules the design keeps

- **One colour family.** Every colour on the page comes from the palette's hue, plus white and the family's near-black: the page and its soft tint bands, the plates, the lines, the words, the dark top bar and footer, the chips and the map pin. A palette or a custom colour re-tints the whole page, never just the buttons. Two tint bands never sit side by side. Every colour is a token.
- **One action colour.** Denim (or your palette) for every button, chosen state and link.
- **One shape language.** Round for round things (circles, and capsules for the main buttons and the "Save n%" chip), 14 px for panels and photos, 8 px for inner parts; square only where a band meets the window's edge; never sharp and round on neighbouring parts. Selldone's own sheets, windows and chips are mapped onto the same scale.
- **Flat.** Buttons without shadows; hover changes the colour only; no line under any word or icon. The one exception: links inside a post's own text are underlined, so a reader can see them.
- **Rings inside the box.** Every selection ring and card edge is an inset shadow, never an outline; a focus ring keeps the control's shape, and a field has one inset ring.
- **Cut-outs on plates.** Product photos are transparent cut-outs on tinted plates, so there is no white square in either mode.
- **Corners off words.** On a card the "Save n%" chip and the ♡ sit in the photo's top corners and the + (on a touch screen) in a lower corner, where there are no words; the chip ends in "…" rather than run under the ♡.
- **Photos carry no words.** The photo files have no text; where the Layout's own words sit over a photo, they sit on a calm part of it, elsewhere beside or under the photo.
- **A click opens, a second click closes.** The Women / Men / Kids mega menus, the search, the menus and the sheets open on a click and close on a second click, Esc, a click outside or a page change; one layer at a time.
- **Moving parts can stop.** The promo bar holds on hover and keyboard focus, has a pause button and stands still for reduced motion; the listing's results fade without motion when the visitor asks for less.
- **Bag, not cart.** In the Layout's words and in Selldone's own English strings.
- **Honest words.** No invented history, awards, names, counts or reviews; no product count in the shop's words; sample pages say they are samples; "every style" only when every style has the same saving; delivery lines and windows only from the shop's own delivery ways; opening hours only from the pickup note or the shop's hours; deal clocks only to a deal's real end date; no stars without reviews; no options without real variants; "not taking payment" when there is no payment method; no fact drawn before the shop's details have loaded.
- **Live data.** Nothing names a product, price, collection, delivery way or opening hour; another shop gets its own.
