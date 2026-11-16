<!--
  The top bar and the header (design/src/shell.js topbar(),
  header(), menuPanel(); set A "Classic"):

  - the top bar (it scrolls away): the counter's days and hours, the way to
    pay and "Pickup at <street>" on the left; the language & currency pill
    (EN · USD; the region-switcher kit's chips in a small panel), the phone
    and the email on the right. All from the shop's live data.
  - the header (it sticks): "Shop ⌄" (every collection with its best
    seller's photo and its lowest price, and the deals line), Deals,
    Journal, About and Contact on the left; the shop's live title drawn as
    the centred wordmark (with the city under it); search (live suggestions from the
    catalogue, Enter opens every result), the account, the bag with its
    count and "Order now" on the right.
  - phone (≤979px): the menu button, the wordmark (never lost), search and
    the bag; the menu is a panel from the left with the collections (the
    first 6, "Show N more" past 8), the pages, the account, a "Language &
    currency" row (a bottom sheet) and the counter's lines. No bottom tab bar.

  Every layer opens on a click and closes on a second click, Esc, a click
  outside or a page change (ly.ts layers); the menu, the bag and the sheet
  add the scrim. The panels are teleported to <body>. A shop with custom
  header code keeps Selldone's header (StorefrontLayout).
-->
<template>
  <div v-if="!$store.getters.getIsNative" class="ly ly-hdrwrap">
    <a class="skip" href="#main" @click.prevent="skip">{{ t("ly.hdr.skip", "Skip to content") }}</a>

    <div class="topbar">
      <div class="wrap tb-in">
        <dn-promo class="tb-l" />
        <ul :aria-label="t('ly.hdr.contact', 'Contact')" class="tb-r">
          <li v-if="regionOn" class="tb-rg">
            <button
              :key="regionKey"
              :aria-expanded="is('rgp') ? 'true' : 'false'"
              :aria-label="t('ly.hdr.regionAria', 'Language and currency: {value}', { value: regionShort })"
              aria-controls="rgp"
              class="rg-pill rs-pick__btn"
              type="button"
              @click="toggle('rgp', $event)"
            >
              <ly-icon name="globe" /><span dir="ltr">{{ regionShort }}</span><ly-icon cls="chev" name="down" />
            </button>
          </li>
          
          
        </ul>
      </div>
    </div>

    <header id="hdr" class="hdr">
      <div class="wrap hdr-in">
        <button
          :aria-expanded="is('menu') ? 'true' : 'false'"
          :aria-label="t('ly.hdr.menu', 'Menu')"
          aria-controls="menu"
          class="ibtn menu-btn"
          type="button"
          @click="toggle('menu', $event)"
        >
          <ly-icon name="menu" />
        </button>

        <span aria-hidden="true" class="dn-hsp"></span>

        <ly-logo />

        <div class="tools">
          <button :aria-expanded="is('srch') ? 'true' : 'false'" :aria-label="t('ly.hdr.search', 'Search')" aria-controls="srch" class="dn-spill" type="button" @click="toggle('srch', $event)">
            <ly-icon name="search" /><span class="dn-spill-t">{{ t("ly.hdr.search", "Search") }}</span>
          </button>
          <router-link :aria-label="t('ly.hdr.account', 'Account')" :to="accountTo" class="ibtn acct"><ly-icon name="user" /></router-link>
          <button
            :aria-expanded="is('drawer') ? 'true' : 'false'"
            :aria-label="t('ly.hdr.bagAria', { one: 'Bag, {n} piece', other: 'Bag, {n} pieces' }, { n: units })"
            aria-controls="drawer"
            class="ibtn bag-btn"
            type="button"
            @click="toggle('drawer', $event)"
          >
            <ly-icon name="bag" /><span v-if="units" class="count">{{ units > 99 ? "99+" : units }}</span>
          </button>
          
        </div>
      </div>

      <!-- The department row: Deals, New, the audiences with their mega menus (a click opens one, a second
           click, Esc or a click outside closes it), the biggest departments as plain links, the journal. Only what the
           shop has: an audience without products is left out. -->
      <nav :aria-label="t('ly.hdr.main', 'Main')" class="dn-nav">
        <div class="wrap dn-nav-in">
          <ul class="dn-nl">
            <li>
              <router-link :aria-current="onDeals ? 'page' : undefined" :to="dealsTo" class="dn-na"><ly-icon name="tag" />{{ t("ly.hdr.deals", "Deals") }}</router-link>
            </li>
            <li>
              <router-link :to="newTo" class="dn-na">{{ t("dn.nav.new", "New") }}</router-link>
            </li>
            <li v-for="g in groups" :key="g.id" class="dn-has">
              <button :aria-controls="'mm-' + g.id" :aria-expanded="is('mm-' + g.id) ? 'true' : 'false'" class="dn-na" type="button" @click="toggle('mm-' + g.id, $event)">
                {{ g.label }}<ly-icon cls="chev" name="down" />
              </button>
              <div :id="'mm-' + g.id" :class="['dn-mega', { open: is('mm-' + g.id) }]">
                <div class="wrap dn-mg-in">
                  <div class="dn-mg-col">
                    <p class="dn-mg-h">{{ t("dn.nav.featured", "Featured") }}</p>
                    <ul>
                      <li><router-link :to="audAll(g.id, 'newest')">{{ t("dn.nav.newFor", "New arrivals") }}</router-link></li>
                      <li v-if="g.sale"><router-link :to="audDeals(g.id)">{{ t("dn.nav.saleFor", "On sale") }}</router-link></li>
                      <li><router-link :to="audAll(g.id)">{{ audAllLabel(g.id) }}</router-link></li>
                      <li v-for="k in g.subs" :key="k"><router-link :to="audAll(k)">{{ audLabel(k) }}</router-link></li>
                    </ul>
                  </div>
                  <div v-if="g.clothing.length" class="dn-mg-col">
                    <p class="dn-mg-h">{{ t("dn.nav.clothing", "Clothing") }}</p>
                    <ul>
                      <li v-for="c in g.clothing" :key="c.id"><router-link :to="audCat(g.id, c)"><bdi>{{ catTitle(c) }}</bdi></router-link></li>
                    </ul>
                  </div>
                  <div v-if="g.extras.length" class="dn-mg-col">
                    <p class="dn-mg-h">{{ t("dn.nav.shoesAcc", "Shoes & accessories") }}</p>
                    <ul>
                      <li v-for="c in g.extras" :key="c.id"><router-link :to="audCat(g.id, c)"><bdi>{{ catTitle(c) }}</bdi></router-link></li>
                    </ul>
                  </div>
                  <div v-if="g.tiles.length" class="dn-mg-tiles">
                    <router-link v-for="tile in g.tiles" :key="tile.key" :to="tile.to" class="dn-mg-tile">
                      <span class="dn-mg-ph"><img :src="tile.src" alt="" loading="lazy" /></span>
                      <b><bdi>{{ tile.label }}</bdi></b>
                    </router-link>
                  </div>
                </div>
              </div>
            </li>
            <li v-for="c in navCats" :key="c.id">
              <router-link :to="catTo(c)" class="dn-na"><bdi>{{ catTitle(c) }}</bdi></router-link>
            </li>
            <li>
              <router-link :aria-current="onJournal ? 'page' : undefined" :to="blogTo" class="dn-na">{{ t("ly.hdr.journal", "Journal") }}</router-link>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Search: suggestions while typing (the live catalogue); Enter opens every result. -->
      <div id="srch" :class="['srch', { open: is('srch') }]" role="search">
        <div class="wrap srch-in">
          <form class="srch-f" @submit.prevent="submit()">
            <ly-icon name="search" />
            <input
              ref="q"
              :aria-label="t('ly.hdr.searchLabel', 'Search the bakery')"
              :placeholder="searchPlaceholder"
              :value="q"
              autocomplete="off"
              enterkeyhint="search"
              type="search"
              @input="q = $event.target.value"
              @keydown.down.prevent="move(1)"
              @keydown.up.prevent="move(-1)"
            />
            <button :aria-label="t('ly.hdr.closeSearch', 'Close search')" class="ibtn x" type="button" @click="closeLayer()"><ly-icon name="close" /></button>
          </form>
          <div class="srch-out">
            <p v-if="!query" class="srch-hint">
              <template v-if="popular.length">{{ t("ly.hdr.popular", "Popular:") }}</template>
              <button v-for="w in popular" :key="w" class="chip" type="button" @click="setQuery(w)">{{ w }}</button>
            </p>
            <template v-else>
              <ul v-if="hits.length" class="srch-list" role="listbox">
                <li v-for="(p, i) in hits" :key="p.id">
                  <router-link :class="{ hl: i === cursor }" :to="productTo(p)" role="option">
                    <span class="th"><img :src="thumb(p)" alt="" /></span>
                    <span class="tx"
                      ><b>{{ p.title }}</b
                      ><small><bdi>{{ catTitle(catOf(p.category_id)) }}</bdi> · {{ t("ly.card.perLow", "per {unit}", { unit: unitOf(p) }) }}</small></span
                    >
                    <span class="ly money">{{ money(priceView(shop, p).now) }}</span>
                  </router-link>
                </li>
              </ul>
              <p v-if="!hits.length" class="srch-hint">{{ t("ly.hdr.noMatch", "Nothing matches “{q}”. Try another word.", { q: query }) }}</p>
              <router-link v-else :to="searchTo(query)" class="srch-all">{{ t("ly.hdr.allFor", "See every result for “{q}”", { q: query }) }}<ly-icon name="arrow" /></router-link>
            </template>
          </div>
        </div>
      </div>
    </header>

    <teleport to="body">
      <div :dir="rtl ? 'rtl' : 'ltr'" class="ly ly-layers">
        <!-- Language and currency (the region-switcher kit's chips; its class
             names stay on the pill, panel and sheet so its checks find them). -->
        <div v-if="regionOn" id="rgp" ref="rgp" :aria-label="t('region.title', 'Language & currency')" :class="['rgp', 'rs-pop', { open: is('rgp') }]" :style="rgpPos" role="dialog">
          <p class="dd-h">{{ regionTitle }}</p>
          <region-chips :key="regionKey" @picked="closeLayer()" />
          <p v-if="regionNote" class="rgp-note">{{ regionNote }}</p>
        </div>

        <!-- The phone menu: a panel from the left. -->
        <nav id="menu" :aria-label="t('ly.hdr.menu', 'Menu')" :class="['panel', 'menu', { open: is('menu') }]">
          <div class="pn-hd">
            <span class="pn-t">{{ t("ly.hdr.menu", "Menu") }}</span>
            <button :aria-label="t('ly.hdr.closeMenu', 'Close menu')" class="ibtn x" type="button" @click="closeLayer()"><ly-icon name="close" /></button>
          </div>
          <template v-if="groups.length">
            <p class="pn-h">{{ t("dn.nav.shopFor", "Shop for") }}</p>
            <ul class="pn-list dn-pn-aud">
              <li v-for="g in groups" :key="g.id">
                <router-link :to="audAll(g.id)">
                  <span class="th"><img v-if="g.photo" :src="g.photo" alt="" loading="lazy" /></span><span>{{ g.label }}</span><ly-icon cls="chev" name="right" />
                </router-link>
              </li>
            </ul>
          </template>
          <p class="pn-h">{{ t("dn.nav.departments", "Departments") }}</p>
          <ul class="pn-list">
            <li v-for="c in menuCats" :key="c.id">
              <router-link :to="catTo(c)">
                <span class="th"><img v-if="topImg(c)" :src="topImg(c)" alt="" loading="lazy" /></span><span><bdi>{{ catTitle(c) }}</bdi></span><ly-icon cls="chev" name="right" />
              </router-link>
            </li>
            <li v-if="menuRest.length">
              <button :aria-expanded="moreOpen ? 'true' : 'false'" class="pn-more" type="button" @click="moreOpen = !moreOpen">
                <span class="th"><ly-icon :name="moreOpen ? 'up' : 'down'" /></span
                ><span>{{ moreOpen ? t("ly.hdr.fewer", "Show fewer") : t("ly.hdr.more", "Show {n} more", { n: menuRest.length }) }}</span>
              </button>
            </li>
          </ul>
          <ul class="pn-list plain">
            <li>
              <router-link :to="dealsTo"><span>{{ t("ly.hdr.deals", "Deals") }}</span><ly-icon cls="chev" name="right" /></router-link>
            </li>
            <li>
              <router-link :to="blogTo"><span>{{ t("ly.hdr.journal", "Journal") }}</span><ly-icon cls="chev" name="right" /></router-link>
            </li>
            <li>
              <router-link :to="aboutTo"><span>{{ t("ly.hdr.about", "About") }}</span><ly-icon cls="chev" name="right" /></router-link>
            </li>
            <li>
              <router-link :to="contactTo"><span>{{ t("ly.hdr.contact", "Contact") }}</span><ly-icon cls="chev" name="right" /></router-link>
            </li>
            <li>
              <router-link :to="accountTo"><span>{{ t("ly.hdr.account", "Account") }}</span><ly-icon cls="chev" name="right" /></router-link>
            </li>
            <li v-if="regionOn">
              <button :key="regionKey" aria-controls="langsheet" class="pn-rg rs-row" type="button" @click="openLayer('langsheet', $event.currentTarget)">
                <span>{{ t("region.title", "Language & currency") }}</span><span class="pn-rg-v" dir="ltr">{{ regionShort }}</span><ly-icon cls="chev" name="right" />
              </button>
            </li>
          </ul>
          <div class="pn-info">
            <p v-if="openLine"><ly-icon name="clock" /><span>{{ openLine }}</span></p>
            <p v-if="facts.address"><ly-icon name="pin" /><span><bdi>{{ facts.address }}</bdi></span></p>
            <p v-if="facts.phone">
              <a :href="tel"><ly-icon name="phone" /><span dir="ltr">{{ facts.phone }}</span></a>
            </p>
          </div>
        </nav>

        <!-- The language & currency sheet (phone). -->
        <div v-if="regionOn" id="langsheet" :aria-label="t('region.title', 'Language & currency')" :class="['ly-sheet', 'rs-sheet', { open: is('langsheet') }]" aria-modal="true" role="dialog">
          <div class="pn-hd">
            <h2 class="pn-t">{{ t("region.title", "Language & currency") }}</h2>
            <button :aria-label="t('ly.hdr.close', 'Close')" class="ibtn x" type="button" @click="closeLayer()"><ly-icon name="close" /></button>
          </div>
          <div class="sh-body">
            <region-chips :key="regionKey" />
            <p v-if="regionNote" class="rgp-note">{{ regionNote }}</p>
            <button class="btn block" type="button" @click="closeLayer()">{{ t("region.done", "Done") }}</button>
          </div>
        </div>

        <div :class="['scrim', { open: scrim }]" @click="closeLayer()"></div>
        <ly-bag-drawer />
      </div>
      <ly-quick-view />
    </teleport>
  </div>
</template>

<script>
import LyLogo from "../LyLogo.vue";
import LyIcon from "../LyIcon.vue";
import LyBagDrawer from "./LyBagDrawer.vue";
import LyQuickView from "../ui/LyQuickView.vue";
import DnPromo from "../denimo/DnPromo.vue";
import { audienceLabel, audienceOfCategory, forAudience } from "../denimo/dn-data";
import { slotPhoto } from "../ly-photos";
import RegionChips from "../../region-switcher/RegionChips.vue";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { catalogueRoute, dealsRoute, percentOff } from "../../kalio/kalio-catalog";
import { journalRoute } from "../../kalio/pages/kalio-journal";
import { currencies, currentCurrency, currentLanguage, hasChoice, isRtl, regionState, showLanguages } from "../../region-switcher/region";
import { openLine as openLineOf,
  bySells,
  catOf,
  catTitle,
  catTo,
  closeLayer,
  closeOnRoute,
  ly,
  inCat,
  isModal,
  layer,
  loadDm,
  money,
  openLayer,
  priceView,
  productImage,
  productTo,
  scrollBehavior,
  shopFacts,
  toggleLayer,
  unitOf,
  wireLayers,
} from "../ly";
import { t } from "../../kalio/i18n/kalio-i18n";
import { collectionPhoto } from "../ly-photos";

/* Words that say nothing about a pastry, left out of "Popular". */
const STOP = new Set(["and", "with", "the", "of", "a", "an", "in", "on", "mini", "classic", "double", "cake", "cakes"]);

export default {
  name: "LyHeader",
  components: { LyLogo, LyIcon, LyBagDrawer, LyQuickView, RegionChips, DnPromo },
  props: {
    showSearch: { type: Boolean, default: true },
  },
  emits: ["search", "clear"],

  data: () => ({ q: "", cursor: -1, moreOpen: false, rgpPos: {}, layer, ly, region: regionState }),

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    facts() {
      return shopFacts(this.shop);
    },
    rtl() {
      void this.region.language;
      return isRtl();
    },
    /* Departments with products only; an empty audience folder (Women, Men…) never shows: it is an audience link. */
    cats() {
      if (!this.ly.ready) return [];
      return this.ly.cats.filter((c) => !audienceOfCategory(c) && inCat(c.id).length);
    },
    /* The audiences with products: Women, Men, Kids (Girls, Boys, Baby), each with its departments and two tiles. */
    groups() {
      if (!this.ly.ready) return [];
      const out = [];
      for (const a of ["women", "men", "kids"]) {
        const mine = this.ly.products.filter((p) => forAudience(p, a));
        if (!mine.length) continue;
        const ids = new Set(mine.map((p) => p.category_id));
        const cats = this.cats.filter((c) => ids.has(c.id));
        const subs = a === "kids" ? ["girls", "boys", "baby"].filter((k) => this.ly.products.some((p) => forAudience(p, k))) : [];
        const photo = slotPhoto("aud-" + (a === "kids" ? subs[0] || "girls" : a));
        const tiles = [];
        if (photo) tiles.push({ key: "aud", src: photo, label: this.audAllLabel(a), to: this.audAll(a) });
        const top = cats.map((c) => ({ c, n: mine.filter((p) => p.category_id === c.id).length })).sort((x, y) => y.n - x.n)[0];
        const cp = top && collectionPhoto(top.c);
        if (cp) tiles.push({ key: "cat", src: cp, label: catTitle(top.c), to: this.audCat(a, top.c) });
        out.push({
          id: a,
          label: audienceLabel(a),
          subs,
          photo,
          tiles,
          sale: mine.some((p) => priceView(this.shop, p).save > 0),
          clothing: cats.filter((c) => !this.isExtra(c)),
          extras: cats.filter((c) => this.isExtra(c)),
        });
      }
      return out;
    },
    /* The biggest departments as plain links after the audiences (three; the rest are in the mega menus). */
    navCats() {
      return this.cats
        .map((c, i) => ({ c, i, n: inCat(c.id).length }))
        .sort((a, b) => b.n - a.n || a.i - b.i)
        .slice(0, 3)
        .map((x) => x.c);
    },
    newTo() {
      return catalogueRoute({ sort: "newest" });
    },
    /* The most-ordered collection with its own photo (the Shop menu's feature card); none without a photo. */
    feature() {
      const ranked = this.cats
        .map((c, i) => ({ c, i, sold: inCat(c.id).reduce((s, p) => s + (p.sells || 0), 0) }))
        .filter((x) => x.sold || inCat(x.c.id).length)
        .sort((a, b) => b.sold - a.sold || a.i - b.i);
      const hit = ranked.find((x) => collectionPhoto(x.c));
      return hit ? hit.c : null;
    },
    featurePhoto() {
      return this.feature ? collectionPhoto(this.feature) : null;
    },
    street() {
      const p = this.facts.pickupPoint;
      return p?.address || String(this.facts.address || "").split(",")[0];
    },
    /* "Open every day 8:00–18:00" (the counter's days and hours). */
    openLine() {
      return openLineOf(this.facts);
    },
    tel() {
      return "tel:" + String(this.facts.phone || "").replace(/[^\d+]/g, "");
    },
    /* the Journal link stays lit on a post too (the router marks only the list itself) */
    onJournal() {
      const r = window.$storefront?.routes || {};
      return [r.BLOGS_PAGE, r.SHOP_BLOG_PAGE, r.SHOP_BLOG_PAGE_SLUG].filter(Boolean).includes(this.$route?.name);
    },
    onDeals() {
      return !!this.$route?.query?.filter && /only_has_discount/.test(String(this.$route.query.filter)) && !this.$route?.params?.category_name;
    },
    units() {
      return this.getBaskets().reduce((sum, b) => sum + (b?.items || []).reduce((n, it) => n + (it.count || 0), 0), 0);
    },
    scrim() {
      return !!this.layer.open && isModal(this.layer.open);
    },
    /* The region package reads its words when it draws. */
    regionKey() {
      return t("region.title", "Language & currency") + this.region.words;
    },
    regionOn() {
      void this.shop;
      return hasChoice();
    },
    /* "EN · USD": the language and the currency, also with one of each. */
    regionShort() {
      void this.region.currency;
      void this.region.language;
      void this.shop;
      return `${currentLanguage().toUpperCase()} · ${currentCurrency()}`;
    },
    regionTitle() {
      void this.shop;
      return showLanguages() ? t("region.title", "Language & currency") : t("region.currency", "Currency");
    },
    /* The chips say it themselves with one currency ("Prices and totals are
       in US dollars."); with a choice, that every price follows. */
    regionNote() {
      void this.shop;
      if (currencies().length <= 1 && !showLanguages()) return "";
      return t("region.note", "Prices everywhere change at once: cards, filters, bag and checkout.");
    },
    shopName() {
      const n = this.shop?.title || "";
      return n.charAt(0).toUpperCase() + n.slice(1);
    },
    menuCats() {
      return this.cats.length <= 8 || this.moreOpen ? this.cats : this.cats.slice(0, 6);
    },
    menuRest() {
      return this.cats.length <= 8 ? [] : this.cats.slice(6);
    },
    /* "25% off every piece" / "Up to 30% off", from the live deals. */
    dealsLine() {
      const offs = this.ly.products.map((p) => percentOff(this.shop, p)).filter((x) => x > 0);
      if (!offs.length) return t("ly.hdr.everyPastry", "Every pastry");
      const max = Math.max(...offs);
      const every = offs.length === this.ly.products.length && Math.min(...offs) === max;
      return every ? t("ly.hdr.offEvery", "{off}% off every piece", { off: max }) : t("ly.hdr.offUpTo", "Up to {off}% off", { off: max });
    },
    /* "Popular": the words most products share (flavours), from the live catalogue. */
    popular() {
      const count = new Map();
      const catWords = new Set(this.cats.flatMap((c) => catTitle(c).toLowerCase().split(/\s+/)).concat(this.cats.flatMap((c) => catTitle(c).toLowerCase().replace(/s$/, "").split(/\s+/))));
      for (const p of this.ly.products) {
        const seen = new Set();
        for (const w of String(p.title || "").split(/[^\p{L}]+/u)) {
          const k = w.toLowerCase();
          if (k.length < 4 || STOP.has(k) || catWords.has(k) || catWords.has(k + "s") || seen.has(k)) continue;
          seen.add(k);
          count.set(k, (count.get(k) || 0) + 1);
        }
      }
      return [...count.entries()]
        .filter(([, n]) => n >= 2)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 4)
        .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));
    },
    /* "Search croissants, tarts, flavours…" from the shop's own collections. */
    searchPlaceholder() {
      const names = this.cats.slice(0, 2).map((c) => catTitle(c).toLowerCase());
      return names.length ? t("ly.hdr.searchPh", "Search {examples}, flavours…", { examples: names.join(", ") }) : t("ly.hdr.searchPh0", "Search the bakery…");
    },
    query() {
      return this.q.trim();
    },
    hits() {
      const q = this.query.toLowerCase();
      if (!q) return [];
      const words = q.split(/\s+/).filter(Boolean);
      const score = (p) => {
        const title = String(p.title || "").toLowerCase();
        const hay = (title + " " + catTitle(catOf(p.category_id)) + " " + Object.values(p.spec || {}).flat().join(" ")).toLowerCase();
        let s = 0;
        for (const w of words) {
          if (title.includes(w)) s += 3;
          else if (hay.includes(w)) s += 1;
          else return 0;
        }
        return s;
      };
      return this.ly.products
        .map((p) => ({ p, s: score(p) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s || (b.p.sells || 0) - (a.p.sells || 0))
        .slice(0, 6)
        .map((x) => x.p);
    },
    r() {
      return window.$storefront.routes;
    },
    dealsTo() {
      return dealsRoute();
    },
    blogTo() {
      return journalRoute();
    },
    aboutTo() {
      return { name: this.r.SHOP_PROFILE_PAGE_ABOUT_US };
    },
    contactTo() {
      return { name: this.r.SHOP_CONTACT_US };
    },
    accountTo() {
      return { name: "KalioAccountHome" };
    },
    orderHref() {
      return "#selection";
    },
  },

  watch: {
    "layer.open"(id) {
      if (id === "srch") this.$nextTick(() => setTimeout(() => this.$refs.q?.focus({ preventScroll: true }), 60));
      if (id === "rgp") this.$nextTick(() => this.place());
      if (id !== "menu" && id !== "langsheet") this.moreOpen = false;
    },
    query() {
      this.cursor = -1;
    },
  },

  created() {
    loadDm();
    wireLayers();
    closeOnRoute(this.$router);
  },

  mounted() {
    this.onResize = () => {
      if (this.layer.open === "rgp") this.place();
    };
    window.addEventListener("resize", this.onResize, { passive: true });
    /* Any part of the page can open the bag. */
    this.openBag = () => openLayer("drawer");
    EventBus.$on("bakini:open-cart", this.openBag);
    EventBus.$on("ly:open-bag", this.openBag);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
    EventBus.$off("bakini:open-cart", this.openBag);
    EventBus.$off("ly:open-bag", this.openBag);
  },

  methods: {
    audLabel(a) {
      return audienceLabel(a);
    },
    audAllLabel(a) {
      return t("dn.nav.allFor", "Shop all {aud}", { aud: audienceLabel(a) });
    },
    /* Shoes and accessories vs clothing, from the department's own name. */
    isExtra(c) {
      return /shoe|foot|sneaker|boot|sandal|bag|accessor|sunglass|eyewear|glasses|hat|cap|jewel|watch|sock|belt|scarf/i.test(catTitle(c) + " " + (c?.name || ""));
    },
    audAll(a, sort) {
      return catalogueRoute(sort ? { sort, aud: a } : { aud: a });
    },
    audDeals(a) {
      const d = dealsRoute();
      return { ...d, query: { ...d.query, aud: a } };
    },
    audCat(a, c) {
      return { ...catTo(c), query: { aud: a } };
    },
    t,
    money,
    priceView,
    catTitle,
    catTo,
    catOf,
    unitOf,
    productTo,
    openLayer,
    closeLayer,
    is(id) {
      return this.layer.open === id;
    },
    toggle(id, e) {
      toggleLayer(id, e?.currentTarget || null);
    },
    /* The collection's best seller, as its thumbnail. */
    topImg(c) {
      const top = bySells(inCat(c.id))[0];
      return top ? productImage(top, 128) : null;
    },
    /* The collection's lowest price now, in the visitor's currency. */
    fromPrice(c) {
      void this.region.currency;
      const list = inCat(c.id);
      if (!list.length) return "";
      return money(Math.min(...list.map((p) => priceView(this.shop, p).now)));
    },
    thumb(p) {
      return productImage(p, 128);
    },
    /* Under the pill, its right edge on the pill's, never within 12px of an edge. */
    place() {
      const btn = document.querySelector('[aria-controls="rgp"]');
      const el = this.$refs.rgp;
      if (!btn || !el) return;
      const r = btn.getBoundingClientRect();
      const w = el.offsetWidth || 300;
      const left = Math.max(12, Math.min(window.innerWidth - w - 12, r.right - w));
      this.rgpPos = { top: `${r.bottom + 8}px`, left: `${left}px` };
    },
    move(d) {
      const n = this.hits.length;
      if (!n) return;
      this.cursor = (this.cursor + d + n) % n;
    },
    setQuery(w) {
      this.q = w;
      this.$nextTick(() => this.$refs.q?.focus({ preventScroll: true }));
    },
    searchTo(q) {
      return { name: this.r.SHOP_PAGE, query: { search: q } };
    },
    submit() {
      if (this.cursor >= 0 && this.hits[this.cursor]) {
        this.$router.push(productTo(this.hits[this.cursor]));
        return;
      }
      const text = this.query;
      closeLayer(true);
      if (!text) return this.$emit("clear");
      this.$emit("search", { search: text, search_type: null });
    },
    /* "Order now": today's selection on the home. */
    orderNow() {
      closeLayer(true);
      const go = () => {
        const el = document.getElementById("selection");
        if (el) el.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
      };
      if (document.getElementById("selection")) return go();
      this.$router.push({ path: "/" }).then(() => setTimeout(go, 400)).catch(() => {});
    },
    skip() {
      const m = document.getElementById("main") || document.querySelector("main");
      if (m) {
        m.setAttribute("tabindex", "-1");
        m.focus();
      }
    },
    catalogueRoute,
  },
};
</script>
