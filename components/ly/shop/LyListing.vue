<!--
  Denimo's listing: a category, an audience, a search, the deals and all products, from the
  live catalogue (ly.ts, one read).

  - A slim title: the breadcrumb and the name centred, no photo band, so products show at first load (search keeps
    its box under the title; deals a one-line saving).
  - ?aud=women|men|girls|boys|baby|kids filters any listing by audience (dn-data forAudience); an empty audience
    category (/women-category) shows that audience's products from every category (audienceOfCategory).
  - The left column (sticky from 1200px, the base's side sheet below with a "Filter + Sort" button kept on screen):
    "Shop by" (audiences that have products, then the type categories that have products, the open one bold), then
    "Filter + Sort" accordions (a click opens and closes): Size chips in ladder order, Colour circles with names,
    Price (two thumbs), Brand / Material / Fit when they have two values or more, On sale, Sort by.
  - The grid: 3 columns beside the column at 1440, 4 at 1920, 2 on a phone (container rules on the list's own
    width); a change dims the cards with "Updating results…", then the new ones fade up.
  - Under the grid: "About <category>" (its description) and capsules to the other categories.

  Nothing names a product, category, size, colour or price: another shop gets its own.
-->
<template>
  <div :style="stickTop != null ? { '--dn-ls-top': stickTop + 'px' } : null" class="ly ly-listing dn-ls">
    <!-- The slim title -->
    <header class="dn-ls-t">
      <div class="wrap dn-ls-tin">
        <nav :aria-label="t('ly.pt.crumbs', 'Breadcrumb')" class="crumbs">
          <ol>
            <li>
              <router-link :to="{ path: '/' }">{{ t("ly.pt.home", "Home") }}</router-link>
            </li>
            <li v-for="(c, i) in crumbs" :key="i">
              <router-link v-if="c.to" :to="c.to"><bdi>{{ c.label }}</bdi></router-link>
              <span v-else aria-current="page"><bdi>{{ c.label }}</bdi></span>
            </li>
          </ol>
        </nav>
        <h1 class="dn-ls-h"><bdi>{{ title }}</bdi></h1>
        <p v-if="lead" class="dn-ls-lead">{{ lead }}</p>
        <form v-if="kind === 'search'" class="dn-ls-srch" role="search" @submit.prevent="submitSearch">
          <label class="sr" for="dn-sq">{{ t("ly.ls.searchLabel", "Search the store") }}</label>
          <ly-icon name="search" />
          <input id="dn-sq" :placeholder="searchPh" :value="q" autocomplete="off" enterkeyhint="search" type="search" @input="q = $event.target.value" />
          <button class="btn sm" type="submit">{{ t("ly.ls.searchBtn", "Search") }}</button>
        </form>
      </div>
    </header>

    <section :aria-label="sectionLabel" class="dn-ls-sec">
      <div class="wrap">
        <!-- Search: nothing matches -->
        <template v-if="kind === 'search' && ready && !pool.length">
          <ly-empty :text="noMatchLine" :title="search ? t('ly.ls.noMatchT', 'Nothing matches “{q}”', { q: search }) : t('ly.ls.searchT', 'Search the store')" cls="boxed" icon="search">
            <template v-if="popular.length" #acts>
              <router-link v-for="w in popular" :key="w" :to="searchTo(w)" class="chip">{{ w }}</router-link>
            </template>
          </ly-empty>
        </template>

        <div v-else class="lst has-fp dn-ls-lst">
          <div class="lst-in">
            <!-- The left column: a sticky column from 1200px, a side sheet below (teleported over the page). -->
            <teleport :disabled="wide" to="body">
              <div :dir="rtl ? 'rtl' : 'ltr'" class="ly ly-fpw dn-ls-fpw">
                <aside :id="fpId" :aria-label="t('dn.ls.filterSort', 'Filter + Sort')" :class="['panel', 'fp', 'dn-ls-fp', { open: layer.open === fpId }]">
                  <div class="pn-hd">
                    <h2 class="pn-t">{{ t("dn.ls.filterSort", "Filter + Sort") }}</h2>
                    <button :aria-label="t('ly.ls.closeFilters', 'Close filters')" class="ibtn x" type="button" @click="closeLayer()"><ly-icon name="close" /></button>
                  </div>
                  <div class="fp-body">
                    <!-- Shop by -->
                    <div v-if="wide && (audItems.length || typeItems.length)" class="dn-ls-by">
                      <h2 class="dn-ls-byh">{{ t("dn.ls.shopBy", "Shop by") }}</h2>
                      <dn-shop-by :audiences="audItems" :types="typeItems" @pick="setTab" />
                    </div>
                    <details v-else-if="audItems.length || typeItems.length" :open="openG.by" class="fg dn-ls-fg" @toggle="sync('by', $event)">
                      <summary>
                        <span>{{ t("dn.ls.shopBy", "Shop by") }}</span><span aria-hidden="true" class="fg-pm"><ly-icon cls="pm-p" name="plus" /><ly-icon cls="pm-m" name="minus" /></span>
                      </summary>
                      <div class="fg-body"><dn-shop-by :audiences="audItems" :types="typeItems" @pick="setTab" /></div>
                    </details>

                    <div class="fp-top dn-ls-fptop">
                      <h2 class="fp-h">{{ t("dn.ls.filterSort", "Filter + Sort") }}</h2>
                      <button v-if="active.length" class="qlink" type="button" @click="resetAll">{{ t("dn.ls.clearAll", "Clear all") }}</button>
                    </div>

                    <!-- Size -->
                    <details v-if="sizeOpts.length" :open="openG.size" class="fg dn-ls-fg" @toggle="sync('size', $event)">
                      <summary>
                        <span>{{ t("dn.ls.size", "Size") }}<span v-if="f.size.length" class="fg-n">{{ f.size.length }}</span></span
                        ><span aria-hidden="true" class="fg-pm"><ly-icon cls="pm-p" name="plus" /><ly-icon cls="pm-m" name="minus" /></span>
                      </summary>
                      <div :aria-label="t('dn.ls.size', 'Size')" class="fg-body dn-ls-sizes" role="group">
                        <button v-for="s in sizeOpts" :key="s" :aria-pressed="f.size.includes(s) ? 'true' : 'false'" class="dn-ls-sz" type="button" @click="toggle('size', s)">
                          <bdi>{{ s }}</bdi>
                        </button>
                      </div>
                    </details>

                    <!-- Colour -->
                    <details v-if="colourOpts.length" :open="openG.colour" class="fg dn-ls-fg" @toggle="sync('colour', $event)">
                      <summary>
                        <span>{{ t("dn.ls.colour", "Colour") }}<span v-if="f.colour.length" class="fg-n">{{ f.colour.length }}</span></span
                        ><span aria-hidden="true" class="fg-pm"><ly-icon cls="pm-p" name="plus" /><ly-icon cls="pm-m" name="minus" /></span>
                      </summary>
                      <div class="fg-body">
                        <div :aria-label="t('dn.ls.colour', 'Colour')" class="dn-ls-cols" role="group">
                          <template v-for="(c, i) in colourOpts" :key="c.name">
                            <button v-if="i < COLS || moreOpen.colour" :aria-pressed="f.colour.includes(c.name) ? 'true' : 'false'" class="dn-ls-col" type="button" @click="toggle('colour', c.name)">
                              <span :style="{ background: c.hex }" class="dn-ls-sw"></span><span class="dn-ls-cn"><bdi>{{ c.name }}</bdi></span>
                            </button>
                          </template>
                        </div>
                        <button v-if="colourOpts.length > COLS" :aria-expanded="moreOpen.colour ? 'true' : 'false'" class="fg-more" type="button" @click="moreOpen = { ...moreOpen, colour: !moreOpen.colour }">
                          <span class="fm-ic"><ly-icon name="down" /></span
                          ><span>{{ moreOpen.colour ? t("dn.ls.fewer", "Show fewer") : t("dn.ls.moreN", "Show {n} more", { n: colourOpts.length - COLS }) }}</span>
                        </button>
                      </div>
                    </details>

                    <!-- Price -->
                    <details v-if="hi > lo" :open="openG.price" class="fg dn-ls-fg" @toggle="sync('price', $event)">
                      <summary>
                        <span>{{ t("dn.ls.price", "Price") }}</span><span aria-hidden="true" class="fg-pm"><ly-icon cls="pm-p" name="plus" /><ly-icon cls="pm-m" name="minus" /></span>
                      </summary>
                      <div class="fg-body fg-price">
                        <div :style="{ '--ly-a': pctA + '%', '--ly-b': pctB + '%' }" class="rng">
                          <span class="rng-tr"></span><span class="rng-fill"></span>
                          <input :aria-label="t('ly.ls.lowest', 'Lowest price')" :max="hi" :min="lo" :value="min" step="1" type="range" @change="update()" @input="onMin($event.target.value)" />
                          <input :aria-label="t('ly.ls.highest', 'Highest price')" :max="hi" :min="lo" :value="max" step="1" type="range" @change="update()" @input="onMax($event.target.value)" />
                        </div>
                        <div class="rng-boxes">
                          <label class="mbox"
                            ><span>{{ sign }}</span
                            ><input :aria-label="t('ly.ls.minPrice', 'Minimum price')" :max="hi" :min="lo" :value="min" inputmode="numeric" type="number" @change="boxMin($event.target.value)"
                          /></label>
                          <span class="rng-to">{{ t("ly.ls.to", "to") }}</span>
                          <label class="mbox"
                            ><span>{{ sign }}</span
                            ><input :aria-label="t('ly.ls.maxPrice', 'Maximum price')" :max="hi" :min="lo" :value="max" inputmode="numeric" type="number" @change="boxMax($event.target.value)"
                          /></label>
                        </div>
                      </div>
                    </details>

                    <!-- Brand, Material, Fit -->
                    <details v-for="g in specFacets" :key="g.key" :open="openG[g.key]" class="fg dn-ls-fg" @toggle="sync(g.key, $event)">
                      <summary>
                        <span>{{ g.label }}<span v-if="f[g.key].length" class="fg-n">{{ f[g.key].length }}</span></span
                        ><span aria-hidden="true" class="fg-pm"><ly-icon cls="pm-p" name="plus" /><ly-icon cls="pm-m" name="minus" /></span>
                      </summary>
                      <div :class="['fg-body', { long: g.values.some((v) => v.length > 24) }]">
                        <template v-for="(v, i) in g.values" :key="v">
                          <div v-if="i < ROWS || moreOpen[g.key]" class="fg-row">
                            <label class="ck-l"
                              ><span class="cbx-w"><input :checked="f[g.key].includes(v)" class="cbx" type="checkbox" @change="toggle(g.key, v)" /><ly-icon cls="cbx-i" name="check" /></span
                              ><span class="ck-t"><bdi>{{ v }}</bdi></span></label
                            >
                          </div>
                        </template>
                        <button v-if="g.values.length > ROWS" :aria-expanded="moreOpen[g.key] ? 'true' : 'false'" class="fg-more" type="button" @click="moreOpen = { ...moreOpen, [g.key]: !moreOpen[g.key] }">
                          <span class="fm-ic"><ly-icon name="down" /></span
                          ><span>{{ moreOpen[g.key] ? t("dn.ls.fewer", "Show fewer") : t("dn.ls.moreN", "Show {n} more", { n: g.values.length - ROWS }) }}</span>
                        </button>
                      </div>
                    </details>

                    <!-- On sale -->
                    <div v-if="anyOffer && kind !== 'deals'" class="fg fg-sw dn-ls-sale">
                      <span :id="'dn-sale-' + id" class="fg-l">{{ t("dn.ls.onSale", "On sale") }}</span>
                      <button :aria-checked="offer ? 'true' : 'false'" :aria-labelledby="'dn-sale-' + id" class="switch" role="switch" type="button" @click="setOffer(!offer)"><span></span></button>
                    </div>

                    <!-- Sort by -->
                    <details :open="openG.sort" class="fg dn-ls-fg" @toggle="sync('sort', $event)">
                      <summary>
                        <span class="fg-st">{{ t("dn.ls.sortBy", "Sort by") }}<span class="fg-v">{{ sortLabel }}</span></span
                        ><span aria-hidden="true" class="fg-pm"><ly-icon cls="pm-p" name="plus" /><ly-icon cls="pm-m" name="minus" /></span>
                      </summary>
                      <div :aria-label="t('dn.ls.sortBy', 'Sort by')" class="fg-body dn-ls-sort" role="radiogroup">
                        <label v-for="s in sorts" :key="s[0]" class="rd-l"
                          ><input :checked="sort === s[0]" :name="'dn-sort-' + id" :value="s[0]" class="rd" type="radio" @change="setSort(s[0])" /><span>{{ s[1] }}</span></label
                        >
                      </div>
                    </details>
                  </div>
                  <div class="fp-ft">
                    <button class="btn quiet sm" type="button" @click="resetAll">{{ t("dn.ls.clearAll", "Clear all") }}</button>
                    <button class="btn sm" type="button" @click="closeLayer()">{{ t("ly.ls.showResults", "Show results") }}</button>
                  </div>
                </aside>
              </div>
            </teleport>

            <div class="lst-main">
              <div v-if="!wide || active.length" class="lst-bar dn-ls-bar">
                <button v-if="!wide" :aria-controls="fpId" :aria-expanded="layer.open === fpId ? 'true' : 'false'" class="dn-ls-fbtn" type="button" @click="toggleLayer(fpId, $event.currentTarget)">
                  <ly-icon name="filter" /><span>{{ t("dn.ls.filterSort", "Filter + Sort") }}</span><span v-if="active.length" class="fcount">{{ active.length }}</span>
                </button>
                <div v-if="active.length" class="actf">
                  <button v-for="a in active" :key="a.id" :aria-label="t('ly.ls.removeFilter', 'Remove filter {name}', { name: a.label })" class="chip on" type="button" @click="a.clear()">
                    <span><bdi>{{ a.label }}</bdi></span><ly-icon name="close" />
                  </button>
                  <button v-if="wide && active.length > 1" class="qlink dn-ls-clr" type="button" @click="resetAll">{{ t("dn.ls.clearAll", "Clear all") }}</button>
                </div>
              </div>
              <p :class="['upd', { on: busy }]" aria-live="polite"><span aria-hidden="true" class="spin"></span>{{ t("ly.ls.updating", "Updating results…") }}</p>
              <div v-if="!ready" class="grid">
                <div v-for="i in 9" :key="i" aria-hidden="true" class="pc dn-pc ly-skel"><div class="pc-plate"></div><div class="pc-tx"><span class="sk-l"></span><span class="sk-l s"></span></div></div>
              </div>
              <div v-else ref="grid" :class="['grid', { dim: busy }]" :data-n="shown.length" :style="fitStyle">
                <ly-card v-for="(p, i) in shown" :key="p.id + ':' + drawn" :cls="animate ? 'fu' : ''" :delay="animate ? Math.min(i, 12) * 25 : null" :eager="i < 3" :product="p" />
              </div>
              <ly-empty v-if="ready && !shown.length" :text="t('dn.ls.noneP', 'Clear a filter or widen the price range to see more styles.')" :title="t('ly.ls.noneT', 'No styles match these filters')" icon="search">
                <template #acts>
                  <button class="btn sm" type="button" @click="resetAll">{{ t("ly.ls.clearFilters", "Clear filters") }}</button>
                </template>
              </ly-empty>
            </div>
          </div>
        </div>

        <!-- Search: posts from the journal -->
        <div v-if="kind === 'search' && postHits.length" class="sr-posts">
          <h2 class="h3x">{{ t("ly.ls.fromJournal", "From the journal") }}</h2>
          <ul class="jl">
            <li v-for="b in postHits" :key="b.id">
              <router-link :to="postRoute(b)" class="jl-a"
                ><span class="jl-th"><img v-if="b.image" :src="postImg(b)" alt="" loading="lazy" /></span
                ><span class="jl-tx"><time v-if="b.created_at" :datetime="b.created_at">{{ fmtDate(b.created_at) }}</time><b>{{ b.title }}</b></span><ly-icon cls="chev" name="right"
              /></router-link>
            </li>
          </ul>
        </div>

        <!-- About the category -->
        <section v-if="about" :aria-labelledby="'dn-about-' + id" class="dn-ls-about">
          <h2 :id="'dn-about-' + id" class="dn-ls-about-h">{{ t("dn.ls.about", "About {name}", { name: title }) }}</h2>
          <div class="dn-ls-about-tx">
            <p v-for="(para, i) in about" :key="i">{{ para }}</p>
          </div>
        </section>

        <!-- The other categories -->
        <nav v-if="moreCats.length" :aria-label="t('dn.ls.moreToShop', 'More to shop')" class="dn-ls-more">
          <h2 class="dn-ls-more-h">{{ t("dn.ls.moreToShop", "More to shop") }}</h2>
          <ul>
            <li v-for="c in moreCats" :key="c.id">
              <router-link :to="c.to" class="dn-ls-cap"><bdi>{{ c.label }}</bdi></router-link>
            </li>
          </ul>
        </nav>
      </div>
    </section>
  </div>
</template>

<script>
import LyIcon from "../LyIcon.vue";
import LyEmpty from "../ui/LyEmpty.vue";
import LyCard from "../ui/LyCard.vue";
import DnShopBy from "../denimo/listing/DnShopBy.vue";
import { bySells, catOf, catTitle, catTo, closeLayer, ly, fmtDate, inCat, layer, loadDm, money, priceView, toggleLayer } from "../ly";
import { percentOff } from "../../kalio/kalio-catalog";
import { journalPage, postRoute } from "../../kalio/pages/kalio-journal";
import { currentCurrency, isRtl, regionState, signOf } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";
import { AUDIENCES, KIDS, audienceLabel, audienceOfCategory, forAudience, sizesOf, sortSizes } from "../denimo/dn-data";
import { audFromQuery, colourFacet, facetValues, hasColour, hasFacet, hasSize } from "../denimo/listing/dn-listing";

/* Colours shown before "Show n more"; rows of a Brand / Material / Fit list. */
const COLS = 12;
const ROWS = 6;
const SPEC = ["brand", "material", "fit"];
const EMPTY_F = () => ({ size: [], colour: [], brand: [], material: [], fit: [] });

export default {
  name: "LyListing",
  components: { LyIcon, LyEmpty, LyCard, DnShopBy },
  props: {
    categoryName: { type: String, default: null },
    search: { type: String, default: "" },
    deals: Boolean,
    initialSort: { type: String, default: "" },
  },
  /* fetched: the page's search-engine data (StorefrontSeo.updateProducts). */
  emits: ["fetched"],

  data: () => ({
    ly,
    layer,
    region: regionState,
    COLS,
    ROWS,
    q: "",
    tab: "all",
    sort: "featured",
    f: EMPTY_F(),
    offer: false,
    min: 0,
    max: 0,
    busy: false,
    animate: false,
    drawn: 0,
    snapshot: null,
    moreOpen: {},
    openG: { by: false, size: true, colour: true, price: false, brand: false, material: false, fit: false, sort: false },
    wide: true,
    posts: [],
    fitStyle: null,
    /* the sticky header's height as it sits (the column and the phone's bar stick under it) */
    stickTop: null,
  }),

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    currency() {
      return currentCurrency();
    },
    sign() {
      return signOf(this.currency) || this.currency;
    },
    rtl() {
      void this.region.language;
      return isRtl();
    },
    ready() {
      return this.ly.ready;
    },
    id() {
      return this.kind === "category" ? "cat" : this.kind === "search" ? "sr" : this.kind === "deals" ? "dl" : "all";
    },
    fpId() {
      return "fp-" + this.id;
    },
    kind() {
      if (this.categoryName) return "category";
      if (this.search) return "search";
      if (this.deals) return "deals";
      return "all";
    },
    cat() {
      return this.ly.cats.find((c) => c.name === this.categoryName) || null;
    },
    /* An audience category (Women, Men, Girls, Boys, Baby…): its audience, else "". */
    audPage() {
      if (this.kind !== "category") return "";
      return audienceOfCategory(this.cat || { name: this.categoryName });
    },
    /* The audience on this page: the address's ?aud=, else the audience category's. */
    aud() {
      return audFromQuery(this.$route.query.aud) || this.audPage;
    },
    audQuery() {
      return audFromQuery(this.$route.query.aud);
    },
    /* The products this page starts from, before the audience. */
    pool() {
      const all = this.ly.products;
      if (this.kind === "category") {
        if (this.audPage) return all;
        return this.cat ? inCat(this.cat.id) : all.filter((p) => String(p.category_id) === String(this.categoryName));
      }
      if (this.kind === "search") return this.matches(this.search);
      if (this.kind === "deals") return all.filter((p) => this.pv(p).save > 0);
      /* ?brand= (a Brands menu, the home's brand tiles): only that brand */
      if (this.brandQ) return all.filter((p) => String(p.brand || "").trim() === this.brandQ);
      return all;
    },
    brandQ() {
      return this.kind === "all" ? String(this.$route?.query?.brand || "").trim() : "";
    },
    /* …and with the audience (an audience category also keeps its own products, if it has any). */
    base() {
      const a = this.aud;
      if (!a) return this.pool;
      const own = this.audPage && this.cat ? this.cat.id : null;
      return this.pool.filter((p) => forAudience(p, a) || (own && p.category_id === own));
    },
    /* …and the category picked in "Shop by" on a search, the deals or all products. */
    scope() {
      return this.tab === "all" ? this.base : this.base.filter((p) => p.category_id === this.tab);
    },
    prices() {
      return this.scope.map((p) => this.pv(p).now);
    },
    lo() {
      return this.prices.length ? Math.floor(Math.min(...this.prices)) : 0;
    },
    hi() {
      return this.prices.length ? Math.ceil(Math.max(...this.prices)) : 0;
    },
    pctA() {
      const span = this.hi - this.lo || 1;
      return ((this.min - this.lo) / span) * 100;
    },
    pctB() {
      const span = this.hi - this.lo || 1;
      return ((this.max - this.lo) / span) * 100;
    },
    anyOffer() {
      return this.scope.some((p) => this.pv(p).save > 0);
    },
    sizeOpts() {
      return sortSizes(this.scope.flatMap((p) => sizesOf(p).map((s) => s.size)));
    },
    colourOpts() {
      return colourFacet(this.scope);
    },
    specFacets() {
      const labels = { brand: t("dn.ls.brand", "Brand"), material: t("dn.ls.material", "Material"), fit: t("dn.ls.fit", "Fit") };
      return SPEC.map((key) => ({ key, label: labels[key], values: facetValues(this.scope, key) })).filter((g) => g.values.length >= 2);
    },
    sorts() {
      return [
        ["featured", this.kind === "search" ? t("dn.ls.sMatch", "Best match") : t("dn.ls.sFeatured", "Featured")],
        ["low", t("dn.ls.sLow", "Price: low to high")],
        ["high", t("dn.ls.sHigh", "Price: high to low")],
        ["new", t("dn.ls.sNew", "Newest")],
        ["best", t("dn.ls.sBest", "Best sellers")],
        ["saving", t("dn.ls.sSaving", "Biggest saving")],
      ];
    },
    sortLabel() {
      return (this.sorts.find((s) => s[0] === this.sort) || this.sorts[0])[1];
    },
    list() {
      const f = this.f;
      const l = this.scope.filter((p) => {
        const now = this.pv(p).now;
        if (this.hi > this.lo && (now < this.min - 0.001 || now > this.max + 0.001)) return false;
        if (this.offer && !(this.pv(p).save > 0)) return false;
        if (f.size.length && !hasSize(p, f.size)) return false;
        if (f.colour.length && !hasColour(p, f.colour)) return false;
        for (const k of SPEC) if (f[k].length && !hasFacet(p, k, f[k])) return false;
        return true;
      });
      return this.sorted(l);
    },
    shown() {
      return this.snapshot || this.list;
    },
    active() {
      const out = [];
      if (this.audQuery && this.audQuery !== this.audPage) out.push({ id: "aud", label: audienceLabel(this.audQuery), clear: () => this.$router.push(this.withAud("")) });
      if (this.tab !== "all") out.push({ id: "tab", label: catTitle(catOf(this.tab)), clear: () => this.setTab("all") });
      for (const k of Object.keys(this.f)) for (const v of this.f[k]) out.push({ id: k + ":" + v, label: k === "size" ? t("dn.ls.sizeChip", "Size {size}", { size: v }) : v, clear: () => this.toggle(k, v) });
      if (this.offer) out.push({ id: "offer", label: t("dn.ls.onSale", "On sale"), clear: () => this.setOffer(false) });
      if (this.hi > this.lo && (this.min > this.lo || this.max < this.hi))
        out.push({
          id: "price",
          label: `${money(this.min, true)}–${money(this.max, true)}`,
          clear: () => {
            this.min = this.lo;
            this.max = this.hi;
            this.update();
          },
        });
      return out;
    },

    /* ━━━ Words ━━━ */
    title() {
      const a = this.aud;
      if (this.kind === "category") {
        if (this.audPage) return audienceLabel(a) || catTitle(this.cat);
        const name = catTitle(this.cat) || this.categoryName;
        return a ? this.audTitle(a, name) : name;
      }
      if (this.kind === "search") return this.search ? t("dn.ls.resultsFor", "Results for “{q}”", { q: this.search }) : t("ly.ls.search", "Search");
      if (this.kind === "deals") return a ? this.audTitle(a, t("dn.ls.deals", "Deals")) : t("dn.ls.deals", "Deals");
      if (this.brandQ) return a ? this.audTitle(a, this.brandQ) : this.brandQ;
      return a ? audienceLabel(a) : t("ly.ls.all", "Shop all");
    },
    crumbs() {
      const a = this.aud;
      const audCrumb = a ? [{ label: audienceLabel(a), to: this.audHome(a) }] : [];
      if (this.kind === "category") {
        if (this.audPage) return [{ label: this.title }];
        return [...audCrumb, { label: catTitle(this.cat) || this.categoryName }];
      }
      if (this.kind === "search") return [{ label: t("ly.ls.search", "Search") }];
      if (this.kind === "deals") return [...audCrumb, { label: t("dn.ls.deals", "Deals") }];
      if (this.brandQ) return [...audCrumb, { label: this.brandQ }];
      return a ? [{ label: audienceLabel(a) }] : [{ label: t("ly.ls.all", "Shop all") }];
    },
    lead() {
      if (this.brandQ) return t("ly.ls.brandLead", { one: "{n} piece from {brand}.", other: "{n} pieces from {brand}." }, { n: this.base.length, brand: this.brandQ });
      if (this.kind !== "deals") return "";
      const offs = this.base.map((p) => percentOff(this.shop, p)).filter((x) => x > 0);
      return offs.length ? t("dn.ls.dealsLead", "Up to {off}% off, already in the price.", { off: Math.max(...offs) }) : t("ly.ls.dealsNone", "Sale styles show here when the store has some.");
    },
    sectionLabel() {
      return this.title;
    },
    /* The category's description, in paragraphs (tags dropped). */
    about() {
      if (this.kind !== "category" || !this.cat) return null;
      const raw = String(this.cat.description || "")
        .replace(/<\/(p|div|li|h\d)>|<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();
      if (!raw) return null;
      return raw.split(/\n\s*\n|\n/).map((s) => s.trim()).filter(Boolean);
    },

    /* ━━━ Shop by ━━━ */
    /* The audiences that have products in this page's pool (audience pages: the whole shop). */
    audItems() {
      if (!this.ready) return [];
      const pool = this.pool;
      const has = (a) => pool.some((p) => forAudience(p, a));
      const item = (id) => ({ id, label: audienceLabel(id), to: this.audTo(id), on: this.aud === id });
      const out = AUDIENCES.filter((a) => !KIDS.includes(a.id) && has(a.id)).map((a) => item(a.id));
      if (has("kids")) {
        const kids = KIDS.filter((k) => pool.some((p) => forAudience(p, k))).map(item);
        out.push({ ...item("kids"), kids });
      }
      return out;
    },
    /* The type categories that have products (for this audience). */
    typeCats() {
      if (!this.ready) return [];
      const src = this.kind === "category" ? this.ly.products.filter((p) => forAudience(p, this.aud)) : this.base;
      const ids = new Set(src.map((p) => p.category_id));
      return this.ly.cats.filter((c) => ids.has(c.id) && !audienceOfCategory(c));
    },
    typeItems() {
      const inPlace = this.kind !== "category";
      return this.typeCats.map((c) => ({
        id: c.id,
        label: catTitle(c),
        to: inPlace ? null : this.catWithAud(c),
        on: inPlace ? this.tab === c.id : !this.audPage && !!this.cat && c.id === this.cat.id,
      }));
    },
    /* Under the grid: the other type categories (this audience kept). */
    moreCats() {
      const src = this.aud ? this.ly.products.filter((p) => forAudience(p, this.aud)) : this.ly.products;
      const ids = new Set(src.map((p) => p.category_id));
      return this.ly.cats
        .filter((c) => ids.has(c.id) && !audienceOfCategory(c) && !(this.cat && c.id === this.cat.id))
        .map((c) => ({ id: c.id, label: catTitle(c), to: this.catWithAud(c) }));
    },

    /* ━━━ Search ━━━ */
    popular() {
      const count = new Map();
      const catWords = new Set(this.ly.cats.flatMap((c) => catTitle(c).toLowerCase().split(/\s+/)));
      for (const p of this.ly.products) {
        const seen = new Set();
        for (const w of String(p.title || "").split(/[^\p{L}]+/u)) {
          const k = w.toLowerCase();
          if (k.length < 4 || catWords.has(k) || catWords.has(k + "s") || seen.has(k)) continue;
          seen.add(k);
          count.set(k, (count.get(k) || 0) + 1);
        }
      }
      return [...count.entries()]
        .filter(([, n]) => n >= 2)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 3)
        .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));
    },
    noMatchLine() {
      const ex = [...this.ly.cats.filter((c) => !audienceOfCategory(c)).slice(0, 2).map((c) => catTitle(c).toLowerCase()), ...this.popular.map((w) => w.toLowerCase())].slice(0, 5);
      return ex.length ? t("ly.ls.noMatchP", "Search by style or colour — {examples} — or start from a department.", { examples: ex.join(", ") }) : t("ly.ls.noMatchP0", "Try another word, or start from a collection.");
    },
    searchPh() {
      return t("dn.ls.searchPh", "Search styles, colours, brands…");
    },
    postHits() {
      const words = String(this.search || "").toLowerCase().split(/\s+/).filter(Boolean);
      if (!words.length) return [];
      return this.posts.filter((b) => words.every((w) => (String(b.title || "") + " " + String(b.description || "")).toLowerCase().includes(w))).slice(0, 3);
    },
  },

  watch: {
    base: {
      handler(list) {
        this.snapshot = null;
        if (this.ready && (this.kind !== "category" || this.cat || this.audPage)) this.$emit("fetched", { parent: this.cat || null, products: list });
      },
      immediate: true,
    },
    scope: {
      handler() {
        this.resetRange();
        this.snapshot = null;
        this.$nextTick(() => this.fit());
      },
      immediate: true,
    },
    search: {
      handler(v) {
        this.q = v || "";
        this.tab = "all";
      },
      immediate: true,
    },
    shown() {
      this.$nextTick(() => this.fit());
    },
  },

  created() {
    loadDm();
    this.sort = this.kind === "deals" ? "saving" : { most_sales: "best", newest: "new", cheapest: "low", most_expensive: "high" }[this.initialSort] || "featured";
  },

  mounted() {
    this.mq = window.matchMedia("(min-width: 1200px)");
    this.wide = this.mq.matches;
    this.onMq = () => {
      this.wide = this.mq.matches;
      if (this.wide && this.layer.open === this.fpId) closeLayer(true);
    };
    this.mq.addEventListener?.("change", this.onMq);
    this.onResize = () => {
      this.fit();
      this.measureTop();
    };
    window.addEventListener("resize", this.onResize, { passive: true });
    this.measureTop();
    const hw = document.querySelector(".ly-hdrwrap");
    if (hw && window.ResizeObserver) {
      this.ro = new ResizeObserver(() => this.measureTop());
      this.ro.observe(hw);
    }
    if (this.kind === "search")
      journalPage({ page: 1, limit: 30 })
        .then(({ articles }) => (this.posts = articles || []))
        .catch(() => (this.posts = []));
  },

  beforeUnmount() {
    this.mq?.removeEventListener?.("change", this.onMq);
    window.removeEventListener("resize", this.onResize);
    this.ro?.disconnect();
    clearTimeout(this.timer);
    if (this.layer.open === this.fpId) closeLayer(true);
  },

  methods: {
    t,
    money,
    catTitle,
    postRoute,
    fmtDate,
    toggleLayer,
    closeLayer,
    pv(p) {
      void this.currency;
      return priceView(this.shop, p);
    },
    postImg(b) {
      return b.image ? window.CDN.GET_SHOP_IMAGE_PATH(b.image, null) : null;
    },
    /* "Women's Activewear", "Girls' Deals"… */
    audTitle(a, name) {
      const forms = {
        women: ["dn.ls.forWomen", "Women's {name}"],
        men: ["dn.ls.forMen", "Men's {name}"],
        girls: ["dn.ls.forGirls", "Girls' {name}"],
        boys: ["dn.ls.forBoys", "Boys' {name}"],
        baby: ["dn.ls.forBaby", "Baby {name}"],
        kids: ["dn.ls.forKids", "Kids' {name}"],
      };
      const x = forms[a];
      return x ? t(x[0], x[1], { name }) : name;
    },
    /* This page's address with another audience ("" takes it off). */
    withAud(a) {
      const query = { ...this.$route.query };
      if (a) query.aud = a;
      else delete query.aud;
      return { path: this.$route.path, query };
    },
    /* An audience's own page: its category when the shop keeps one, else all products for it. */
    audHome(a) {
      const ac = this.ly.cats.find((c) => audienceOfCategory(c) === a);
      if (ac) return catTo(ac);
      return { name: window.$storefront.routes.SHOP_PAGE, query: { aud: a, sort: "featured" } };
    },
    /* "Shop by" → an audience: filters this page in place (a type category, a search, the deals), or opens the
       audience's page (an audience page, all products). The open one takes its audience off. */
    audTo(a) {
      const audWide = !!this.audPage || this.kind === "all";
      if (this.aud === a) return audWide ? this.$route.fullPath : this.withAud("");
      return audWide ? this.audHome(a) : this.withAud(a);
    },
    catWithAud(c) {
      const to = catTo(c);
      return this.aud ? { ...to, query: { aud: this.aud } } : to;
    },
    matches(q) {
      const words = String(q || "").toLowerCase().split(/\s+/).filter(Boolean);
      if (!words.length) return [];
      return this.ly.products
        .map((p) => {
          const title = String(p.title || "").toLowerCase();
          const hay = (title + " " + catTitle(catOf(p.category_id)) + " " + String(p.brand || "") + " " + Object.values(p.spec || {}).flat().join(" ")).toLowerCase();
          let s = 0;
          for (const w of words) {
            if (title.includes(w)) s += 3;
            else if (hay.includes(w)) s += 1;
            else return { p, s: 0 };
          }
          return { p, s };
        })
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s || (b.p.sells || 0) - (a.p.sells || 0))
        .map((x) => x.p);
    },
    sorted(l) {
      const out = [...l];
      const key = this.sort;
      if (key === "best") return bySells(out);
      if (key === "low") return out.sort((a, b) => this.pv(a).now - this.pv(b).now || a.id - b.id);
      if (key === "high") return out.sort((a, b) => this.pv(b).now - this.pv(a).now || a.id - b.id);
      if (key === "new") return out.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")) || b.id - a.id);
      if (key === "saving") return out.sort((a, b) => this.pv(b).off - this.pv(a).off || this.pv(b).save - this.pv(a).save || a.id - b.id);
      return out;
    },
    resetRange() {
      this.min = this.lo;
      this.max = this.hi;
      /* ?price=lo-hi (a mega menu's price bands, a home tile) */
      const m = String(this.$route?.query?.price || "").match(/^([0-9]*)-([0-9]*)$/);
      if (m && this.hi > this.lo) {
        if (m[1]) this.min = Math.max(this.lo, Math.min(this.hi, Number(m[1])));
        if (m[2]) this.max = Math.min(this.hi, Math.max(this.min, Number(m[2])));
      }
    },
    /* The part of the header that stays on screen (its height less the top bar that scrolls away). */
    measureTop() {
      const hw = document.querySelector(".ly-hdrwrap");
      if (!hw) return;
      const cs = getComputedStyle(hw);
      if (cs.position !== "sticky" && cs.position !== "fixed") {
        this.stickTop = 0;
        return;
      }
      const top = parseFloat(cs.top) || 0;
      this.stickTop = Math.max(0, Math.round(hw.getBoundingClientRect().height + Math.min(0, top)));
    },
    /* Fewer results than columns: the cards keep their width and the row starts at the start. */
    fit() {
      const g = this.$refs.grid;
      if (!g) return;
      const n = this.shown.length;
      const cs = getComputedStyle(g);
      const cols = parseInt(cs.getPropertyValue("--ly-cols"), 10) || 3;
      const gap = parseFloat(cs.columnGap) || 0;
      /* the cards keep their width and start the row (the owner, 23 Nov 2026: a lone result sat in the middle) */
      this.fitStyle = n && n < cols ? { gridTemplateColumns: `repeat(${n}, calc((100% - ${(cols - 1) * gap}px) / ${cols}))`, justifyContent: "start" } : null;
    },
    /* Dim, say "Updating results…", then draw the new list fading up. */
    update() {
      const still = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (still) {
        this.animate = false;
        this.snapshot = [...this.list];
        return;
      }
      this.busy = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.busy = false;
        this.animate = true;
        this.drawn++;
        this.snapshot = [...this.list];
      }, 300);
    },
    sync(key, e) {
      this.openG = { ...this.openG, [key]: e.target.open };
    },
    toggle(k, v) {
      const cur = [...(this.f[k] || [])];
      const i = cur.indexOf(v);
      if (i >= 0) cur.splice(i, 1);
      else cur.push(v);
      this.f = { ...this.f, [k]: cur };
      this.update();
    },
    setOffer(v) {
      this.offer = v;
      this.update();
    },
    setSort(s) {
      this.sort = s;
      this.update();
    },
    setTab(id) {
      this.tab = this.tab === id ? "all" : id;
      this.update();
    },
    onMin(v) {
      this.min = Math.min(Number(v), this.max);
    },
    onMax(v) {
      this.max = Math.max(Number(v), this.min);
    },
    boxMin(v) {
      const n = parseFloat(v);
      this.min = isNaN(n) ? this.lo : Math.max(this.lo, Math.min(Math.round(n), this.max));
      this.update();
    },
    boxMax(v) {
      const n = parseFloat(v);
      this.max = isNaN(n) ? this.hi : Math.min(this.hi, Math.max(Math.round(n), this.min));
      this.update();
    },
    /* Every filter and the category picked in "Shop by". */
    reset() {
      this.f = EMPTY_F();
      this.offer = false;
      this.tab = "all";
      this.resetRange();
      this.update();
    },
    /* "Clear all": the filters and the audience the address added (an audience page keeps its own). */
    resetAll() {
      this.reset();
      if (this.audQuery && this.audQuery !== this.audPage) this.$router.push(this.withAud(""));
    },
    searchTo(q) {
      return { name: window.$storefront.routes.SHOP_PAGE, query: { search: q } };
    },
    submitSearch() {
      const q = this.q.trim();
      if (!q) return;
      this.$router.push(this.searchTo(q));
    },
  },
};
</script>
