# Shop Requirements

The Layout reads everything from your shop. Nothing about Fashioni is hard-coded. Here is what your shop's data needs so that each part looks as it does on [denimo.selldone.shop](https://denimo.selldone.shop). A section with no data folds away or shrinks to what the shop has; it never shows an empty box, and no fact is invented to fill one.

## Settings (yours to choose)

| Setting | What to set | What the Layout does |
| --- | --- | --- |
| **OAuth client id** | Set it up for your shop first | Sign-in uses your shop's own sign-in. Without it, sign-in leaves for Selldone and shows an error. |
| **Business model** | A normal shop with one seller | Denimo is made for one shop. |
| **Shop title** | The name you want read | It is drawn as the wordmark (in capitals), the footer's name, the tab icon's letter, the shop's mark and the page titles. |
| **Guest checkout** | Your choice | When guests may buy, the sign-in sheet offers "Continue as guest", the checkout's Contact card says "Checkout does not need an account", and a guest's account shows the orders kept on that device; otherwise the shopper signs in to place the order. |
| **Payment methods** | At least one, for your currency (cash on delivery is fine) | A service card on the home names the way to pay when the products name no returns window; the bag ("Pay in cash when the order arrives."), the checkout ("Place order · pay $x on delivery", or "at pickup") and the order page name it. Without one, the checkout says "This shop is not taking payment right now" instead of showing Place order. |
| **Delivery ways** (transportations) | What you offer, each with a title, a fixed fee, a free-shipping threshold if you have one, a distance for a courier, its **days** and **time windows** | The promo bar ("Free pickup at the store" for a free pickup; "Local delivery every day", or "Free local delivery…" when it costs nothing), the home's service cards (the pickup and its fee, the local delivery with its days and windows), the footer's line, the product page's delivery lines and its **Delivery + returns** (each way with its fee, days, windows and "Free over $x"), the bag's "How it reaches you", the delivery sheet, the checkout's method cards and windows, and the order page. A way without a title gets words from its kind ("<Shop> courier", "Worldwide shipping", "By post", "Pickup"). The windows (`time_spans`) are the choices at checkout; a window shows only for the way that offers it. |
| **Pickup point** | If you have a store: a pickup point with an address and a note that holds the hours, e.g. "Open daily, 8:00-18:00" | the store hours are read from that note (a time range like `8:00-18:00`, `8:00–18:00` or `8:00 to 18:00`), else from the shop info's own hours line. They show in the footer's Visit column and on Contact. The pickup point's name and address make the product page's pickup line. With no hours anywhere, the hours are left out. |
| **Checkout map** | On or off | On: the address sheet has a map and a pin. Off: it is a short form with search. |
| **Login modes** | Your choice | The sign-in sheet shows your shop's own ways in (social logins as you switch them on, an email code, phone). |
| **Currency, country, language** | Your market | Prices, the address form, and the language and currency pill in the top bar (the phone menu's "Language & currency" row). The pill shows even with one currency and one language ("EN · USD"). Denimo's own words are in English and Arabic; another language needs a few files (see [Customize](Customize#languages)). |
| **Home of the domain** | The shop page | The designed home is the shop page. A Page Builder page set as Home replaces it on `/`. |

## Shop info

The facts on the home, the header, the footer, Contact and the sample pages come from the shop's own info (Selldone dashboard, the shop's contact information). Until it has loaded, every line built from it is left out, so no sentence is drawn half-made and then rewritten:

- **Address**, city, region and postal code: the footer's Visit column, the copyright line (the city), the About page and Contact.
- **Location** (the pin on the map): the map on Contact. Without a location (or without a map key), Contact shows the map's calm water colour and the pin, nothing invented.
- **Open days:** "Open every day" or "Open n days a week", in the footer and Contact's Hours card.
- **Phone** and **email:** the footer's Contact column (the phone set large), Contact and the FAQ's "Still wondering?".

## Collections (categories)

- Each **top-level category** is a department (a collection of one type of clothing: tops, jeans, shoes…): a link in the Women / Men / Kids mega menus (under Clothing, or under Shoes & accessories when its name says shoes, bags, accessories, sunglasses and the like) for each audience it has products for, a link in the department row (the three with the most products), a row in the phone menu (with its best seller as a thumbnail), a tile in the home's **Shop by category**, an entry in the listing's **Shop by**, a capsule under the other departments' grids, a link in the footer's Shop column (the first eight), and its own page.
- Each department's photo is `skins/denimo/photos/col-<slug of its title>.webp` in the Layout (see [Photos](#photos-for-the-photo-slots)); without it, its best seller on a plate. It shows on the home's Shop by category tiles, as the second tile of a mega menu (the audience's biggest department) and on the About page. A department can also have a portrait banner (`split-<slug>.webp`) or a wide banner (`wide-<slug>.webp`) on the home.
- Give each one a short **description**: it shows under the department page's grid and on About.
- Order them in Selldone; departments with the same sales keep your order.
- Many clothing shops also keep **audience categories** (Women, Men, Girls, Boys, Baby), often empty. Denimo does not need them: a product's audience comes from its tags (see [Products](#products)), and an empty audience category opens its audience's products.
- The portrait banners take the first two departments (by pieces sold) that have a `split-<slug>` photo, the wide banners the first two that have a `wide-<slug>` photo; **Complete the look** takes the best seller of up to four other departments for the same audience.

## Photos for the photo slots

The home's campaign hero (desktop and phone), the departments' portrait and wide banners, the audience tiles, the journal and the footer's texture are **photo slots**, and each department has a photo. Each reads one file from `skins/denimo/photos/` in the repository. The repository ships 23 for Fashioni (photos generated with Magnific (Freepik) for Fashioni under the owner's Premium plan):

| File | Size |
| --- | --- |
| `hero.webp` (the campaign hero, to the frame's edges; people on the right, the left 45% a light, calm wall for the words) | 2400 × 1000 |
| `hero-phone.webp` (the hero on a phone; the words sit under it) | 1080 × 1350 |
| `split-<slug>.webp` (a department's portrait banner; its lower third darker, for the white words) | 1200 × 1500 |
| `wide-<slug>.webp` (a department's wide banner; one side calm, where the words go) | 2400 × 1000 |
| `wide-<slug>-phone.webp` (the same banner on a phone) | 860 × 1075 |
| `aud-<women\|men\|girls\|boys\|baby>.webp` (an audience tile, a mega menu's first tile, the phone menu's audiences) | 900 × 1200 |
| `journal.webp` (beside the journal's posts; "Journal" sits over it) | 1200 × 1400 |
| `footer.webp` (the footer's dark denim texture, under a family scrim) | 2400 × 800 |
| `col-<slug>.webp` (a department's photo, where `<slug>` is made from its title: "Tops & T-Shirts" → `tops-and-t-shirts`; its address name in Selldone is tried too) | 900 × 1200 |

- A slot without its file shows its fallback (the hero: the family-dark band with the same words; an audience or department tile: its best seller on a plate; the journal: the family tint; the footer: the plain family dark), and a banner without its photo is left out, so a new department or a missing photo never shows an empty box, a caption or a file name.
- No words, logos or price tags on any photo, and no product cut by the edge. Where the Layout's words sit over a photo (the hero's light left side, a wide banner's calm side, a portrait banner's darker lower third, the journal's word) leave that part of the photo calm and plain.
- The photos are part of the Layout, so a new one needs a new release, and each one is a file of the 300 the build may have. See [Customize](Customize#photos).

## Products

- The **main photo** as a **transparent cut-out** (PNG or WebP, the product alone on no ground). Every card, Complete the look, the product page, the bag and the tiles' fallbacks set it on a tinted plate; a photo with its own ground shows as a square on the plate. More photos make the product page's mosaic.
- An **audience** for clothes made for someone: a tag `women`, `men`, `girls`, `boys`, `baby` or `kids`; without one, a word in the title ("Women's…", "Boys'…"), then a spec "Department". It puts the product under Women / Men / Kids in the menus, the listing's **Shop by**, `?aud=` filters and **Shop for everyone**. A product with none shows in its department and the other listings, but under no audience.
- **Variants** for sizes and colours: the size in a variant's `type` or `volume` (S, M, XL, 2Y, 30…; shown in size order), the colour as a hex in its `color` (named for the shopper from the nearest of a short list) and, best, the colour's own photo. They make the card's colour dots, its second photo and its quick-add strip of sizes, the listing's **Size** and **Colour** filters, and the product page's **Colour** circles and **Size** chips (a sold-out size struck; "Select a size" until one is chosen). A product without sizes is added in its first colour in stock. Options only when the product really has them.
- A **price**, and a **discount** for a saving: the struck was-price, the "Save n%" chip on the card, "Price: Now $x ~~$y~~ Save n%" on the product page. The promo bar, the hero and the offer band say "Up to X% off".
- **Deals** (in the department row and the menus) lists the pieces that have a saving, biggest saving first. When every style has one, that is every style.
- **Discount dates:** a deal with a real end date gets "Deal ends in" and a clock on the product page. Without an end date there is no clock; no date is ever invented.
- **Returns** (Selldone's return days, `return_warranty`): "n-day returns" on the product page and in its Delivery + returns; when four in five products name the same number, the promo bar and a service card on the home say it too. A **warranty** in words shows on the product page.
- **Pros** (Selldone's product pros, a title and a line each): the product page's **At a glance** circles (material, care and the like first); Compare's "Why pick it" lists the first two.
- **Rating criteria** (for example "Fit", "Comfort"): shown as "No score yet" in the Reviews accordion until the first review.
- **Stock:** "Only n left in this size" on the product page at five or fewer of the chosen size; the bag shows "Only n left".
- A **product code** (SKU) shows in The details.
- A **unit** (Selldone's `unit` field) shows only in the search suggestions ("per piece" without one).
- **Sales:** Trending now, the banners' choice of departments, Complete the look, the Best sellers sort and the 404's products are ranked by Selldone's own sales count. With no sales yet, Trending now shows the newest first.
- Denimo reads up to **250 products** in one go; a larger catalogue shows its first 250 in the listings and on the home.

## Specs and filters

The listing's filters, the product page's The details and Size & fit, and Compare come from each product's **spec**:

- Write specs **flat**: `{"Group": "group", "Key": ["value"]}` with `spec_order`. A nested spec is not shown anywhere.
- Three spec keys become filters: **Brand** (or the product's own brand), **Material** (or "Materials") and **Fit**, each when the products on the page have two or more different values; a value longer than 60 characters is never a filter. Keep them short.
- The other filters come from the variants and prices: **Size** (chips in size order), **Colour** (circles with names), **Price** (two thumbs, when the prices differ) and **On sale** whenever something on the page has a saving (Deals has only those). Nothing else is invented, so a department may show fewer filters than another.
- The filters sit in a sticky column with **Shop by** (**Filter + Sort**; a side sheet below 1200px). They are read live from the products, so a spec change shows on the next visit. No category filter list is needed.
- Sort: Featured (Best match on search), Price: low to high, Price: high to low, Newest, Best sellers, Biggest saving. Deals starts on Biggest saving.
- Compare shows the spec in your own groups, with the collections' "… Profile" groups as one "Profile".

## Content

- **Articles** (blog posts) with **cover images**: the home's journal shows the four newest; the journal page shows the newest as a featured card, then every other post in a grid with a search, newest first, and "More posts". Publish **five or more** to fill both. A post without a cover gets the card's plate with the whisk drawing.
- In an article's text, **link the products** it talks about (`/product/<id>` links): the article has one panel of those products (four at most) with "Add all". Without links, the panel shows the products the text names. Links inside a post's own text are underlined, the only underlined words in the Layout.
- **FAQ** entries: the FAQ page, grouped by topic (each entry's first tag), with the topics as chips. Until you add some, it shows sample questions (ordering pieces, delivery windows, pickup, the way to pay, allergens) built from your shop's facts, under the sample label below.
- **About us, Terms, Privacy, Contact us** pages (Selldone's shop profiles). Until you write them, About, Terms and Privacy show sample text built only from your shop's facts (no invented history, names or reviews), under a clear "Sample text — the shop has not written this page yet" label. Your own Terms and Privacy headings become the page's index. Contact always shows your real lines and the message form; your own Contact text shows above the form.
- **Social links:** shown in the footer's legal row.
- Denimo's footer does not read a Selldone footer menu: its columns come from your shop's facts and collections, and its legal row links Privacy, Terms and FAQ.

## Checklist

- [ ] The shop's OAuth client id is set up
- [ ] The shop's title reads the way the wordmark should (it is set in capitals)
- [ ] Collections have a short description, and products carry their audience (tags `women`, `men`, `girls`, `boys`, `baby`)
- [ ] Products have a cut-out main photo, sizes and colours as variants, return days, pros, flat specs with short values (Brand, Material, Fit), and an SKU
- [ ] Some products have discounts, with end dates only where the deal really ends
- [ ] At least one payment method (cash on delivery is fine)
- [ ] Delivery ways with titles, fees, days and time windows; a pickup point whose note holds the hours
- [ ] The shop info has an address, a location on the map, open days, a phone and an email
- [ ] Five or more articles with covers, linking the products they talk about
- [ ] FAQ entries, and your own About, Terms and Privacy
- [ ] The photos in `skins/denimo/photos/`: Fashioni's kept on purpose, replaced with yours, or removed for the fallbacks
- [ ] The domain's Home is the shop page
