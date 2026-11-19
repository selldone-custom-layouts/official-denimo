# Denimo Casual Fashion — release notes

**Denimo Casual Fashion** (package `denimo-fashion`) is a Layout of the Selldone shop **Fashioni** (xapi `fashioni`), built for **denimo.selldone.shop**. It is a skin of the Layout base (see [`BASE.md`](BASE.md)): everything that makes it this Layout is `skins/denimo/skin.json` and `skins/denimo/photos/`; the code, the flows and the checks are the base's.

## Setup

| Area | What is set |
| --- | --- |
| Repo | `denimo-layout`, branch `main`; remote `upstream` (selldone/storefront, fetch only, push disabled); `origin` = `selldone-custom-layouts/official-denimo` once published (`scripts/publish-github.sh`) |
| Names | `manifest.json` and `selldone-layout.json` from the skin (`package` is permanent after the first upload; the `description` must be right on the FIRST upload, Selldone keeps it) |
| Dev server | port **9170**, shop `fashioni` (`.env`); `npm run serve` (launch entry `denimo-layout`) |
| Skin | Denim, Rust, Olive, Charcoal, Berry (brand `denim`), Archivo over DM Sans, radius 14 / 8 px, basket word "bag" |
| Layout id | **44** |

## Home

1. **hero** (campaign): the `hero` photo to the frame's edges, the biggest saving in big words on its calm side, a capsule per audience; on a phone the `hero-phone` portrait with the words under it.
2. **offerband** (band, tint band): the live saving, with a capsule + per audience on sale.
3. **tiles** (categories): Shop by category, every department with products as 3:4 tiles in one scrolling row.
4. **split** (two-up): two portrait banners of the departments that have a `split-<slug>` photo.
5. **rail** (trending, tint band): Trending now, best sellers, departments mixed, one scrolling row of cards.
6. **wide** (a): a wide banner, the first department that has a `wide-<slug>` photo, the words on the photo's calm side.
7. **rail** (sale): On sale now, the biggest saving first.
8. **tiles** (audiences, tint band): Shop for everyone, Women, Men, Girls, Boys, Baby (those with products) as tiles; circles on a phone.
9. **wide** (b): a second wide banner, for the second such department.
10. **rail** (new): New arrivals, the newest first.
11. **services** (cards, tint band): three service cards from the shop's facts (pickup, delivery, returns or payment).
12. **journal** (photo): the four newest posts beside the tall `journal` photo with the big word 'Journal'.

## Photos

| Slot | File | Size | In the build |
| --- | --- | --- | --- |
| hero | `skins/denimo/photos/hero.webp` | 2400 × 1000 | yes |
| hero-phone | `skins/denimo/photos/hero-phone.webp` | 1080 × 1350 | yes |
| split-tops-t-shirts | `skins/denimo/photos/split-tops-t-shirts.webp` | 1200 × 1500 | yes |
| split-activewear | `skins/denimo/photos/split-activewear.webp` | 1200 × 1500 | yes |
| wide-dresses-one-pieces | `skins/denimo/photos/wide-dresses-one-pieces.webp` | 2400 × 1000 | yes |
| wide-dresses-one-pieces-phone | `skins/denimo/photos/wide-dresses-one-pieces-phone.webp` | 860 × 1075 | yes |
| wide-footwear | `skins/denimo/photos/wide-footwear.webp` | 2400 × 1000 | yes |
| wide-footwear-phone | `skins/denimo/photos/wide-footwear-phone.webp` | 860 × 1075 | yes |
| journal | `skins/denimo/photos/journal.webp` | 1200 × 1400 | yes |
| footer | `skins/denimo/photos/footer.webp` | 2400 × 800 | yes |
| aud-women | `skins/denimo/photos/aud-women.webp` | 900 × 1200 | yes |
| aud-men | `skins/denimo/photos/aud-men.webp` | 900 × 1200 | yes |
| aud-girls | `skins/denimo/photos/aud-girls.webp` | 900 × 1200 | yes |
| aud-boys | `skins/denimo/photos/aud-boys.webp` | 900 × 1200 | yes |
| aud-baby | `skins/denimo/photos/aud-baby.webp` | 900 × 1200 | yes |
| each collection | `skins/denimo/photos/col-<slug of its title>.webp` | 900 × 1200 | 8 file(s); a collection without one shows its best sellers on a plate |

The 23 photos were generated with Magnific (Freepik) for Fashioni under the owner's Premium plan.

## Checks

<!-- CHECKS:START -->
The fast runner (`new-shop-kits/fast-checks`, config `scripts/fast-checks.config.mjs`) on https://denimo.selldone.shop: TOTAL 0 on 1.0.2 for every check type (the last run covered contrast, shape, text-col, box and i18n after the fixes; ring, card-edge, corner, circle, underline, cart and currency were 0 from the first run). Test inputs: product 710122 and 710203, category /activewear-category, search "denim", compare p710122_p710123_p710124.
<!-- CHECKS:END -->

## Releases

| Version | Date | Layout | Deploy | What |
| --- | --- | --- | --- | --- |
| 1.0.0 | 2026-11-16 | 44 | 679 | First release: the promo bar, the department row with mega menus, the twelve home sections, the listing, the card and the product page; live on denimo.selldone.shop |
| 1.0.1 | 2026-11-16 | 44 | 684 | Promo links wrap as one group and slide in; focus corners on the 14 / 8 px scale; full names in compare; section labels in Arabic |
| 1.0.2 | 2026-11-16 | 44 | 687 | The shop's spec, pros and units in Arabic (shop-data.ts, data/ar.json) |
| 1.0.3 | 2026-11-16 | 44 | 688 | The sample FAQ, terms, privacy, contact topics and footer line written for a clothing shop, in English and Arabic |
| 1.0.4 | 2026-11-16 | 44 | 695 | The checkout says "No delivery method reaches this bag yet" (with Contact the shop, no Place order) when the shop offers no way that can be chosen; the guest checkout walk reaches the payment window by courier |
| 1.0.5 | 2026-11-19 | 44 | 758 | Checkout: the buyer's delivery address comes back after a detour through pickup (before, choosing pickup and then the courier again left an empty address and "Add a delivery address" on Place order). Packed with `scripts/package-layout.mjs` (a Node port of Selldone's packager) on a computer without Python; server js/css match. Denimo's own walk on live (PRODUCT=710122, GEO Tehran), 1440 and 390: courier and pickup both open Selldone's payment window with Cash on delivery, nothing inside it pressed, no order. The pickup → courier detour itself was walked on Avenio 1.0.4 (same base code). |
| 1.0.6 | 2026-11-19 | 44 | 770 | Checkout: a just-chosen delivery way is the one priced. The bill counts as busy while a throttled basket update waits or is on its way (the answer to an update is dropped while a newer one waits), and Place order opens Selldone's payment window only once it has settled (at most 15 s). Found on Galio 1.0.6; same change as layout-base b10322f. PROD-CHECK OK; server js/css match. Denimo's own walk on live, 1440 and 390: courier and pickup open the payment window with the button's total ($41.50); no order. |
