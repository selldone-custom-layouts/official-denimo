<!--
  Denimo: the top of the product page.
  - Left (about 60% from 1200px): the gallery mosaic (DnGallery): two photos side by side, one large, then pairs,
    contained on the family plate; a click opens it full screen. Below 980px a swipe row with dots, and the name
    sits above it as on the phone page.
  - Right, staying in view while the photos scroll (a column taller than the window scrolls with the page until
    its foot shows, then stays): the brand (the spec's Brand, else the product's), the name; "Price: Now $x $y
    Save n%" (Selldone's own rules; the deal's clock only for a real end date); "Colour: <name>" with the
    colour circles (the chosen one ringed inside, a sold-out colour dimmed and crossed); "Style" chips for values
    that are neither colour nor size (pattern keys cleaned, never braces); "Size" with "Size details" on the
    same row and the size chips for the chosen colour (sold out struck and disabled; the chosen one filled).
    Colour, style and size together select the real Selldone variant (SProductOverview's current_variant), so
    price, stock and the bag line follow it. Then the quantity and the full-width "Add to bag" capsule (without
    a size: "Select a size", which points to the size row with a short line), "− n +" in place once in the bag;
    the shop's delivery, pickup and returns lines; "At a glance" from the pros; the accordions (LyProductTabs).
  - On a phone, once the Add box has scrolled away, a buy bar at the foot (a plain teleported panel).
  Every commerce behaviour is Selldone's SProductOverview (through Kalio's). A product that needs more than a
  count (a service, a valuation form, extra pricing, a subscription) keeps Selldone's own buy section here.
-->
<template>
  <section :aria-label="$product.title" class="dn-pd">
    <div class="wrap dn-pd-in">
      <dn-gallery :photos="photos" :product="$product" class="dn-pd-gal" />

      <div ref="side" :style="stickTop != null ? { top: stickTop + 'px' } : null" class="dn-pd-side">
        <div class="dn-pd-head">
          <p v-if="brand" class="dn-pd-brand">
            <bdi>{{ brand }}</bdi>
          </p>
          <h1 class="dn-pd-h">{{ $product.title }}</h1>
        </div>

        <div class="dn-pd-buy">
          <div v-if="isSubscription" class="dn-pd-row ly-sd-sub">
            <s-subscription-price-select
              v-model="selected_subscription_price"
              :disabled="!$product.quantity"
              :subscription-prices="subscription_prices"
              return-object
            ></s-subscription-price-select>
          </div>
          <template v-else>
            <div class="dn-pd-row dn-pd-price">
              <span class="dn-pd-k">{{ t("dn.pd.price", "Price:") }}</span>
              <span class="dn-pd-pv">
                <template v-if="pv.was"
                  ><span class="dn-pd-now"
                    >{{ t("dn.pd.nowW", "Now") }}{{ " " }}<span class="money">{{ money(pv.now) }}</span></span
                  >{{ " " }}<s class="was money">{{ money(pv.was) }}</s>{{ " " }}<span v-if="pv.off > 0" class="dn-pd-save">{{ t("dn.pd.saveP", "Save {off}%", { off: pv.off }) }}</span></template
                >
                <span v-else class="dn-pd-now money">{{ money(pv.now) }}</span>
              </span>
            </div>
            <p v-if="dealEndsAt" class="dn-pd-deal"><ly-icon name="clock" />{{ t("ly.pd.dealEnds", "Deal ends in") }}{{ " " }}<bakini-deal-clock :end="dealEndsAt" mode="bare" /></p>
          </template>
          <s-product-section-tax></s-product-section-tax>
          <p v-if="!has_original_warranty" class="dn-pd-note">{{ $t("product_info.fake") }}</p>

          <!-- Colour -->
          <div v-if="colours.length" class="dn-pd-opt">
            <p class="dn-pd-opt-l">
              <span class="dn-pd-k">{{ t("dn.pd.colourK", "Colour:") }}</span
              ><span v-if="colourNow" class="dn-pd-opt-v">{{ colourNow }}</span>
            </p>
            <div :aria-label="t('ly.pd.colour', 'Colour')" class="dn-pd-sws" role="radiogroup">
              <button
                v-for="c in colours"
                :key="c.hex"
                :aria-checked="c.hex.toLowerCase() === hex ? 'true' : 'false'"
                :aria-label="c.stock > 0 ? c.name : t('dn.pd.nameOut', '{name}, sold out', { name: c.name })"
                :class="['dn-pd-sw', { '-out': !(c.stock > 0) }]"
                :style="{ '--sw': c.hex }"
                :title="c.name"
                role="radio"
                type="button"
                @click="pickColour(c.hex)"
              ></button>
            </div>
          </div>

          <!-- Style (pattern keys and other values, cleaned) -->
          <div v-if="styles.length" class="dn-pd-opt">
            <p class="dn-pd-opt-l">
              <span class="dn-pd-k">{{ t("dn.pd.styleK", "Style:") }}</span
              ><span v-if="style" class="dn-pd-opt-v">{{ styleWord }}</span>
            </p>
            <div :aria-label="t('dn.pd.style', 'Style')" class="dn-pd-chips -wide" role="radiogroup">
              <button
                v-for="s in styles"
                :key="s.key"
                :aria-checked="s.key === style ? 'true' : 'false'"
                :class="['dn-pd-chip', { '-out': !(s.stock > 0) }]"
                role="radio"
                type="button"
                @click="pickStyle(s.key)"
              >
                {{ s.label }}
              </button>
            </div>
          </div>

          <!-- Size -->
          <div v-if="sizeList.length" id="dn-pd-size-row" ref="sizeRow" :class="['dn-pd-opt', 'dn-pd-size', { '-need': needMsg }]">
            <div class="dn-pd-opt-l dn-pd-size-l">
              <span
                ><span class="dn-pd-k">{{ t("dn.pd.size", "Size") }}</span
                ><span v-if="chosenSize" class="dn-pd-opt-v" dir="ltr">{{ chosenSize }}</span></span
              >
              <button aria-controls="dn-pd-size" class="dn-pd-link" type="button" @click="openSize($event)">{{ t("dn.pd.sizeDetails", "Size details") }}</button>
            </div>
            <div :aria-label="t('dn.pd.size', 'Size')" class="dn-pd-chips" role="radiogroup">
              <button
                v-for="c in chips"
                :key="c.size"
                :aria-checked="chosenSize === c.size ? 'true' : 'false'"
                :aria-disabled="c.out ? 'true' : undefined"
                :aria-label="c.out ? t('dn.pd.sizeOut', '{size}, sold out', { size: c.size }) : c.alt ? t('dn.pd.sizeOther', '{size}, in another colour', { size: c.size }) : c.size"
                :class="['dn-pd-chip', { '-out': c.out, '-other': !!c.alt }]"
                :title="c.alt ? t('dn.pd.sizeOther', '{size}, in another colour', { size: c.size }) : undefined"
                dir="ltr"
                role="radio"
                type="button"
                @click="pickSize(c)"
              >
                {{ c.size }}
              </button>
            </div>
            <p v-if="needMsg" class="dn-pd-need" role="alert"><ly-icon name="info" />{{ t("dn.pd.pleaseSize", "Please select a size.") }}</p>
            <p v-else-if="lowStock" class="dn-pd-low">{{ t("dn.pd.onlyLeft", "Only {n} left in this size", { n: stock }) }}</p>
          </div>

          <div class="ly-sd-more">
            <s-product-section-service v-model:preferences="preferences"></s-product-section-service>
            <s-product-section-valuation
              v-if="preferences && preferences.valuation"
              :correspondingBasketItem="corresponding_basket_item"
              :current-variant="current_variant"
              :preferences="preferences"
            ></s-product-section-valuation>
            <s-product-section-extra-pricings
              :current-variant="current_variant"
              :preferences="preferences"
              :quantity="corresponding_basket_item?.count"
              :selected-vendor-product="selected_vendor_product"
              @select="(val) => $refs.buy_section?.triggerBuyButton(val.min)"
            ></s-product-section-extra-pricings>
          </div>

          <!-- Quantity, Add to bag -->
          <div id="pd-acts" ref="add" class="dn-pd-acts">
            <div v-if="simple && !inBag && !soldOutNow" class="dn-pd-qty-row">
              <span class="dn-pd-k">{{ t("dn.pd.qty", "Quantity") }}</span>
              <div :aria-label="t('dn.pd.qty', 'Quantity')" class="qb dn-pd-qty" role="group">
                <button :aria-disabled="qty <= 1 ? 'true' : undefined" :aria-label="t('dn.pd.qtyLess', 'One less')" type="button" @click="qty = Math.max(1, qty - 1)"><ly-icon name="minus" /></button>
                <span aria-live="polite" class="qn">{{ qty }}</span>
                <button :aria-disabled="qty >= qtyMax ? 'true' : undefined" :aria-label="t('dn.pd.qtyMore', 'One more')" type="button" @click="qty = Math.min(qtyMax, qty + 1)"><ly-icon name="plus" /></button>
              </div>
            </div>
            <div class="dn-pd-add">
              <ly-pd-add v-if="simple" :count="qty" :need-label="needLabel" :needs-choice="needsChoice" :product="$product" :variant="current_variant" @need="pointToSize" />
              <s-product-section-buy-button
                v-else
                ref="buy_section"
                :can-buy="canBuy"
                :current-variant="current_variant"
                :hss-sticky-but-button="hssStickyButButton"
                :preferences="preferences"
                :quick-buy-mode="quickBuyMode"
                :selected-subscription-price="selected_subscription_price"
                :selected-vendor-product="selected_vendor_product"
                class="ly-sd-buy"
              ></s-product-section-buy-button>
            </div>
            <button class="dn-pd-cmp" type="button" @click="compareNow"><ly-icon name="compare" />{{ t("ly.pd.compare", "Compare") }}</button>
          </div>

          <!-- Delivery, pickup, returns -->
          <ul v-if="lines.length" class="dn-pd-svc">
            <li v-for="l in lines" :key="l.key">
              <span class="dn-pd-svc-i"><ly-icon :name="l.icon" /></span>
              <span class="dn-pd-svc-t"
                ><b>{{ l.title }}</b><span v-if="l.line">{{ l.line }}</span></span
              >
            </li>
          </ul>

          <!-- At a glance -->
          <div v-if="glance.length" class="dn-pd-glance">
            <h2 class="dn-pd-glance-h">{{ t("dn.pd.glance", "At a glance") }}</h2>
            <ul :class="['dn-pd-glance-l', 'n' + glance.length]">
              <li v-for="g in glance" :key="g.key">
                <span aria-hidden="true" class="dn-pd-glance-c"><ly-icon :name="g.icon" /></span>
                <b>{{ g.title }}</b>
                <span v-if="g.text">{{ g.text }}</span>
              </li>
            </ul>
          </div>

          <ly-product-tabs ref="tabs" :product="$product" @size="openSize" />
        </div>
      </div>
    </div>

    <dn-size-sheet v-if="sizeList.length" :product="$product" />

    <!-- The phone's buy bar, once the Add box has scrolled away (a plain panel: Vuetify overlays move fixed sheets). -->
    <teleport to="body">
      <div class="ly ly-layers">
        <div :aria-hidden="barOn ? undefined : 'true'" :class="['buybar', 'dn-pd-bb', { on: barOn }]">
          <div class="wrap bb-in">
            <span class="bb-pl"><img v-if="photos[0]" :src="photos[0].thumb" alt="" /></span>
            <span class="bb-tx"
              ><b>{{ $product.title }}</b
              ><span
                ><span class="now money">{{ money(pv.now) }}</span><template v-if="pv.was">{{ " " }}<s class="was money">{{ money(pv.was) }}</s></template
                ><template v-if="chosenSize || colourNow"
                  >{{ " · " }}<span class="dn-pd-bb-v">{{ [colourNow, chosenSize].filter(Boolean).join(" · ") }}</span></template
                ></span
              ></span
            >
            <div class="bb-a">
              <ly-pd-add v-if="simple" :count="qty" :need-label="needLabel" :needs-choice="needsChoice" :product="$product" :variant="current_variant" @need="pointToSize" />
              <button v-else class="btn sm" type="button" @click="toAdd">{{ t("ly.add.add", "Add to bag") }}</button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </section>
</template>

<script>
import KalioProductOverview from "../../kalio/product/KalioProductOverview.vue";
import BakiniDealClock from "../../bakini/BakiniDealClock.vue";
import LyIcon from "../LyIcon.vue";
import LyPdAdd from "./LyPdAdd.vue";
import LyProductTabs from "./LyProductTabs.vue";
import DnGallery from "../denimo/product/DnGallery.vue";
import DnSizeSheet from "../denimo/product/DnSizeSheet.vue";
import { ly, money, openLayer, priceView } from "../ly";
import { dealEnd } from "../../bakini/bakini";
import { basketLine, pendingLineFor, shownCount } from "../../kalio/kalio-basket";
import { currentCurrency } from "../../region-switcher/region";
import { brandOf, coloursOf, glanceOf, hexOf, inStock, photosOf, pickVariant, serviceLines, sizeChips, sizeOfVariant, sizesOf, styleLabel, styleOf, stylesOf } from "../denimo/product/dn-pick";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "LyProductOverview",
  extends: KalioProductOverview,
  components: { BakiniDealClock, LyIcon, LyPdAdd, LyProductTabs, DnGallery, DnSizeSheet },
  emits: ["reviews"],

  data() {
    return { barOn: false, ly, sizeChosen: false, needMsg: false, qty: 1, stickTop: null };
  },

  computed: {
    currency() {
      return currentCurrency();
    },
    pv() {
      void this.currency;
      return priceView(this.shop || this.$shop, this.$product, this.current_variant);
    },
    dealEndsAt() {
      return dealEnd(this.$product, this.current_variant);
    },
    brand() {
      return brandOf(this.$product);
    },
    hex() {
      return hexOf(this.current_variant);
    },
    style() {
      return styleOf(this.current_variant);
    },
    styleWord() {
      return styleLabel(this.style);
    },
    colours() {
      return coloursOf(this.$product);
    },
    colourNow() {
      const c = this.colours.find((x) => x.hex.toLowerCase() === this.hex);
      return c ? c.name : "";
    },
    styles() {
      return stylesOf(this.$product);
    },
    sizeList() {
      return sizesOf(this.$product);
    },
    chips() {
      return sizeChips(this.$product, this.hex, this.style);
    },
    curSize() {
      return sizeOfVariant(this.current_variant);
    },
    chosenSize() {
      return this.sizeChosen ? this.curSize : "";
    },
    needsSize() {
      return this.sizeList.length > 0 && !this.sizeChosen;
    },
    needsChoice() {
      return this.needsSize || (this.product_variants.length > 0 && !this.current_variant);
    },
    needLabel() {
      return this.needsSize ? t("dn.pd.selectSize", "Select a size") : t("ly.pd.chooseFirst", "Choose an option");
    },
    photos() {
      return photosOf(this.$product, this.current_variant);
    },
    stock() {
      const n = this.current_variant ? this.current_variant.quantity : this.$product.quantity;
      return Number(n) || 0;
    },
    lowStock() {
      return this.sizeChosen && this.stock > 0 && this.stock <= 5;
    },
    soldOutNow() {
      return !this.needsChoice && !(this.stock > 0);
    },
    qtyMax() {
      return Math.max(1, Math.min(this.stock || 1, 99));
    },
    inBag() {
      if (this.needsChoice) return false;
      const p = this.$product;
      const v = this.current_variant;
      const line = v ? basketLine(this, p, { id: v.id }) || pendingLineFor(p, v.id) : basketLine(this, p);
      return shownCount(p, line) > 0;
    },
    lines() {
      return serviceLines(this.shop || this.$shop, this.$product);
    },
    glance() {
      return glanceOf(this.$product);
    },
    /* A plain product: the add box; anything Selldone's own button knows more about keeps that button. */
    simple() {
      const p = this.$product;
      if (!p || this.isSubscription) return false;
      if ((p.type || "PHYSICAL") !== "PHYSICAL") return false;
      if (this.preferences && (this.preferences.valuation || this.preferences.service)) return false;
      if (p.valuation || (p.extra_pricings && p.extra_pricings.length)) return false;
      return true;
    },
    comparing() {
      return (this.$store.getters.getProductsComparison || []).some((p) => p.id === this.$product.id);
    },
  },

  watch: {
    "current_variant.id"() {
      this.qty = 1;
    },
  },

  created() {
    this.startChoice();
  },

  mounted() {
    document.documentElement.classList.add("ly-buybar");
    if (typeof IntersectionObserver !== "undefined" && this.$refs.add) {
      this.io = new IntersectionObserver(
        (entries) => {
          const e = entries[entries.length - 1];
          this.barOn = !!e && !e.isIntersecting;
        },
        /* in view while anywhere below the top of the window: the bar shows once the box has scrolled away above */
        { threshold: 0, rootMargin: "0px 0px 100000px 0px" },
      );
      this.io.observe(this.$refs.add);
    }
    this.onFrame = () => {
      if (this.raf) return;
      this.raf = requestAnimationFrame(() => {
        this.raf = 0;
        this.stick();
      });
    };
    window.addEventListener("scroll", this.onFrame, { passive: true });
    window.addEventListener("resize", this.onFrame, { passive: true });
    if (typeof ResizeObserver !== "undefined" && this.$refs.side) {
      this.ro = new ResizeObserver(this.onFrame);
      this.ro.observe(this.$refs.side);
    }
    this.stick();
  },

  beforeUnmount() {
    document.documentElement.classList.remove("ly-buybar");
    this.io?.disconnect();
    this.ro?.disconnect();
    window.removeEventListener("scroll", this.onFrame);
    window.removeEventListener("resize", this.onFrame);
    if (this.raf) cancelAnimationFrame(this.raf);
  },

  methods: {
    t,
    money,
    /* The size counts as chosen when the page opened on a variant (a link with ?variant_id, a line already in the
       bag) or the product has one size; otherwise the shopper picks it. A first variant that is sold out gives way
       to one in stock of the same colour. */
    startChoice() {
      const p = this.$product;
      const v = this.current_variant;
      const q = String(this.$route?.query?.variant_id || "");
      const fromLink = !!v && /^[1-9]\d*$/.test(q) && String(v.id) === q;
      const fromBag = !!v && !!(this.basket?.items || []).find((i) => i.product_id === p.id && i.variant_id === v.id);
      this.sizeChosen = fromLink || fromBag || this.sizeList.length === 1;
      if (!this.sizeChosen && v && !inStock(v)) {
        const w = pickVariant(p, {}, { hex: hexOf(v), style: styleOf(v) });
        if (w && w !== v) this.current_variant = w;
      }
    },
    pickColour(hex) {
      const v = pickVariant(this.$product, { hex }, { style: this.style, size: this.sizeChosen ? this.curSize : null });
      if (!v) return;
      const keep = this.sizeChosen && sizeOfVariant(v) === this.curSize;
      this.current_variant = v;
      this.sizeChosen = keep || this.sizeList.length === 1;
    },
    pickStyle(key) {
      const v = pickVariant(this.$product, { style: key }, { hex: this.hex, size: this.sizeChosen ? this.curSize : null });
      if (!v) return;
      const keep = this.sizeChosen && sizeOfVariant(v) === this.curSize;
      this.current_variant = v;
      this.sizeChosen = keep || this.sizeList.length === 1;
    },
    pickSize(c) {
      if (c.out) return;
      const v = c.v || c.alt;
      if (!v) return;
      this.current_variant = v;
      this.sizeChosen = true;
      this.needMsg = false;
    },
    /* "Select a size": to the size row, a short line under it, the first size in stock takes the focus. */
    pointToSize() {
      const row = this.$refs.sizeRow;
      if (!row) return;
      this.needMsg = true;
      row.scrollIntoView({ behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth", block: "center" });
      const first = row.querySelector('.dn-pd-chip:not([aria-disabled="true"])');
      setTimeout(() => first?.focus({ preventScroll: true }), 350);
    },
    openSize(e) {
      openLayer("dn-pd-size", e?.currentTarget || null);
    },
    /* The buy column stays in view: under the header when it fits the window, else it scrolls with the page
       until its foot shows and stays there. */
    stick() {
      const side = this.$refs.side;
      if (!side || window.innerWidth < 980) {
        this.stickTop = null;
        return;
      }
      const hdr = document.querySelector(".ly-hdrwrap");
      const top = Math.max(0, hdr ? hdr.getBoundingClientRect().bottom : 0) + 20;
      const room = window.innerHeight - side.offsetHeight - 24;
      const next = Math.round(room < top ? room : top);
      if (next !== this.stickTop) this.stickTop = next;
    },
    /* Add this style to Selldone's comparison and open the compare page: what the shopper already compares,
       else this with two of its own department's best sellers. */
    compareNow() {
      if (!this.comparing) this.addToProductComparison(this.$product, this.current_variant, true);
      const stored = (this.$store.getters.getProductsComparison || []).map((p) => ({ p: p.id, v: p.variant?.id || null }));
      let refs = stored.filter((r) => r.p !== this.$product.id);
      refs.unshift({ p: this.$product.id, v: this.current_variant?.id || null });
      if (refs.length < 2) {
        const mates = this.ly.products
          .filter((p) => p.category_id === this.$product.category_id && p.id !== this.$product.id)
          .sort((a, b) => (b.sells || 0) - (a.sells || 0))
          .slice(0, 2);
        refs = refs.concat(mates.map((p) => ({ p: p.id, v: null })));
      }
      const list = refs
        .slice(0, 4)
        .map((r) => `p${r.p}${r.v ? `v${r.v}` : ""}`)
        .join("_");
      this.$router.push({ name: window.$storefront.routes.COMPARISON_PAGE, query: { list } });
    },
    toAdd() {
      this.$refs.add?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
  },
};
</script>
