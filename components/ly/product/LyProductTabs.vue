<!--
  Denimo: the buy column's accordions; a click
  opens one, a second click closes it, one at a time.
  - The details: the product's spec in the shop's own groups (keys and values cleaned, no pattern braces), the SKU.
  - Size & fit: the spec's fit rows, then "Need help finding your size?" → Size details (only with sizes).
  - Delivery + returns: each of the shop's ways with its days and windows, the pickup, the returns window.
  - Reviews (n): the base's reviews part: with none yet an honest note and "Write the first review" (a guest is
    asked to sign in; only a buyer can rate), with reviews Selldone's own list.
  - Share: the phone's share sheet when there is one, else the link is copied.
-->
<template>
  <div id="tabs" :aria-label="t('ly.pd.details', 'Details')" class="dn-pd-acc" role="region">
    <div v-for="s in sections" :key="s.k" :class="['dn-pd-acc-i', { on: cur === s.k }]">
      <h3 class="dn-pd-acc-h">
        <button :id="'tb-' + s.k" :aria-controls="'tp-' + s.k" :aria-expanded="cur === s.k ? 'true' : 'false'" class="dn-pd-acc-b" type="button" @click="toggle(s.k)">
          <span>{{ s.label }}</span><ly-icon :name="cur === s.k ? 'minus' : 'plus'" />
        </button>
      </h3>
      <div :id="'tp-' + s.k" :aria-labelledby="'tb-' + s.k" :hidden="cur !== s.k" class="dn-pd-acc-p" role="region">
        <!-- The details -->
        <template v-if="s.k === 'info'">
          <div v-for="g in groups" :key="g.group" class="dn-pd-spec-g">
            <h4 v-if="g.group" class="dn-pd-acc-sub">{{ g.group }}</h4>
            <dl class="dn-pd-dl">
              <div v-for="r in g.rows" :key="r[0]">
                <dt>{{ r[0] }}</dt>
                <dd>{{ r[1] }}</dd>
              </div>
            </dl>
          </div>
          <dl v-if="product.sku" class="dn-pd-dl">
            <div>
              <dt>{{ t("ly.pd.sku", "SKU") }}</dt>
              <dd dir="ltr">{{ product.sku }}</dd>
            </div>
          </dl>
        </template>

        <!-- Size & fit -->
        <template v-else-if="s.k === 'fit'">
          <ul v-if="fit.length" class="dn-pd-fit">
            <li v-for="r in fit" :key="r[0]">
              <b>{{ r[0] }}</b> <span>{{ r[1] }}</span>
            </li>
          </ul>
          <template v-if="hasSizes">
            <p class="dn-pd-acc-q">{{ t("dn.pd.needSize", "Need help finding your size?") }}</p>
            <button aria-controls="dn-pd-size" class="dn-pd-acc-link" type="button" @click="$emit('size', $event)"><ly-icon name="info" />{{ t("dn.pd.sizeDetails", "Size details") }}</button>
          </template>
        </template>

        <!-- Delivery + returns -->
        <template v-else-if="s.k === 'ship'">
          <ul class="dn-pd-svc -full">
            <li v-for="l in lines" :key="l.key">
              <span class="dn-pd-svc-i"><ly-icon :name="l.icon" /></span>
              <span class="dn-pd-svc-t"
                ><b>{{ l.title }}</b><span v-if="l.line">{{ l.line }}</span></span
              >
            </li>
          </ul>
        </template>

        <!-- Reviews -->
        <template v-else-if="s.k === 'rev'">
          <div v-if="!rated" class="dn-pd-rev">
            <p>{{ noReviewsText }}</p>
            <ul v-if="criteria.length" class="dn-pd-rev-c">
              <li v-for="c in criteria" :key="c">
                <span>{{ c }}</span><span class="dn-pd-rev-v">{{ t("ly.pd.noScore", "No score yet") }}</span>
              </li>
            </ul>
            <button v-if="!writing" class="btn sm alt" type="button" @click="write">
              {{ user ? t("ly.pd.writeFirst", "Write the first review") : t("ly.pd.signInReview", "Sign in to write a review") }}
            </button>
          </div>
          <div v-if="rated || writing" class="ly-rv-sd"><kalio-reviews /></div>
        </template>

        <!-- Share -->
        <template v-else-if="s.k === 'share'">
          <div class="dn-pd-share">
            <button class="btn sm alt" type="button" @click="share"><ly-icon :name="copied ? 'check' : canShare ? 'share' : 'copy'" />{{ shareLabel }}</button>
            <span aria-live="polite" class="dn-pd-share-ok">{{ copied ? t("dn.pd.copied", "Link copied") : "" }}</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import LyIcon from "../LyIcon.vue";
import KalioReviews from "../../kalio/product/KalioReviews.vue";
import { ratingNames } from "../ly";
import { fitRows, serviceLines, specTable } from "../denimo/product/dn-pick";
import { sizesOf } from "../denimo/dn-data";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "LyProductTabs",
  components: { LyIcon, KalioReviews },
  props: { product: { type: Object, required: true } },
  emits: ["size"],
  data: () => ({ cur: "", writing: false, copied: false }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    user() {
      return this.$store.getters.getUser;
    },
    rated() {
      return Number(this.product.rate_count) > 0;
    },
    criteria() {
      return ratingNames(this.product);
    },
    groups() {
      return specTable(this.product);
    },
    fit() {
      return fitRows(this.product);
    },
    hasSizes() {
      return sizesOf(this.product).length > 0;
    },
    lines() {
      return serviceLines(this.shop, this.product);
    },
    sections() {
      const out = [];
      if (this.groups.length || this.product.sku) out.push({ k: "info", label: t("dn.pd.theDetails", "The details") });
      if (this.fit.length || this.hasSizes) out.push({ k: "fit", label: t("dn.pd.sizeFit", "Size & fit") });
      if (this.lines.length) out.push({ k: "ship", label: t("dn.pd.shipReturns", "Delivery + returns") });
      out.push({ k: "rev", label: t("dn.pd.reviewsN", "Reviews ({n})", { n: Number(this.product.rate_count) || 0 }) });
      out.push({ k: "share", label: t("dn.pd.share", "Share") });
      return out;
    },
    noReviewsText() {
      return t("ly.pd.noReviewsP0", "Be the first to review the {name}.", { name: this.product.title });
    },
    canShare() {
      return typeof navigator !== "undefined" && !!navigator.share && window.matchMedia?.("(pointer: coarse)")?.matches;
    },
    shareLabel() {
      if (this.copied) return t("dn.pd.copied", "Link copied");
      return this.canShare ? t("dn.pd.shareThis", "Share this style") : t("dn.pd.copyLink", "Copy link");
    },
  },
  watch: {
    "product.id"() {
      this.cur = "";
      this.writing = false;
    },
  },
  beforeUnmount() {
    clearTimeout(this.timer);
  },
  methods: {
    t,
    toggle(k) {
      this.cur = this.cur === k ? "" : k;
    },
    /* "Reviews" elsewhere on the page opens this part. */
    open(k) {
      this.cur = k;
      this.$nextTick(() => {
        document.getElementById("tb-" + k)?.scrollIntoView({ behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth", block: "center" });
        document.getElementById("tb-" + k)?.focus({ preventScroll: true });
      });
    },
    write() {
      if (!this.user) {
        EventBus.$emit("need-login", true);
        return;
      }
      this.writing = true;
    },
    share() {
      const url = window.location.href.split("#")[0];
      const done = () => {
        this.copied = true;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => (this.copied = false), 2200);
      };
      if (this.canShare) {
        navigator.share({ title: this.product.title, url }).catch(() => {});
        return;
      }
      try {
        navigator.clipboard.writeText(url).then(done, () => {});
      } catch {
        /* no clipboard here: nothing claimed */
      }
    },
  },
};
</script>
