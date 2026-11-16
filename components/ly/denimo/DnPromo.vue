<!--
  The promo bar above the header (Denimo's family-dark bar): up to four short messages from the shop's
  live data, one at a time, with ‹ › and pause. It turns every 6 s; it stops while the pointer or the keyboard is on it,
  while the tab is hidden, after the pause button, and never turns for a visitor who asks for less motion. The
  messages stack in one grid cell, so the bar keeps one height. Nothing names a shop, price or place.
-->
<template>
  <div v-if="msgs.length" :aria-label="t('dn.promo.aria', 'Offers and services')" class="dn-promo" role="region" @focusin="hold = true" @focusout="hold = false" @mouseenter="hold = true" @mouseleave="hold = false">
    <button v-if="msgs.length > 1" :aria-label="t('dn.promo.prev', 'Previous message')" class="dn-pr-b" type="button" @click="go(-1)"><ly-icon name="left" /></button>
    <div :aria-live="paused ? 'polite' : 'off'" class="dn-pr-stack">
      <p v-for="(m, i) in msgs" :key="m.k" :aria-hidden="i === at ? 'false' : 'true'" :class="['dn-pr-m', { on: i === at }]">
        <b>{{ m.text }}</b>
        <span v-if="m.links && m.links.length" class="dn-pr-ls"><router-link v-for="l in m.links" :key="l.label" :tabindex="i === at ? 0 : -1" :to="l.to" class="dn-pr-l">{{ l.label }}<ly-icon name="plus" /></router-link></span>
      </p>
    </div>
    <button v-if="msgs.length > 1" :aria-label="t('dn.promo.next', 'Next message')" class="dn-pr-b" type="button" @click="go(1)"><ly-icon name="right" /></button>
    <button v-if="msgs.length > 1 && !still" :aria-label="paused ? t('dn.promo.play', 'Play messages') : t('dn.promo.pause', 'Pause messages')" :aria-pressed="paused ? 'true' : 'false'" class="dn-pr-b dn-pr-p" type="button" @click="paused = !paused">
      <svg v-if="paused" aria-hidden="true" viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
      <svg v-else aria-hidden="true" viewBox="0 0 24 24"><path d="M7.5 5.5h3v13h-3zM13.5 5.5h3v13h-3z" fill="currentColor" /></svg>
    </button>
  </div>
</template>

<script>
import LyIcon from "../LyIcon.vue";
import { ly, priceView, shopFacts } from "../ly";
import { catalogueRoute, dealsRoute } from "../../kalio/kalio-catalog";
import { t } from "../../kalio/i18n/kalio-i18n";
import { currentCurrency } from "../../region-switcher/region";
import { audienceLabel, forAudience } from "./dn-data";

export default {
  name: "DnPromo",
  components: { LyIcon },
  data: () => ({ ly, at: 0, hold: false, paused: false, hidden: false, still: false, timer: 0 }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    facts() {
      return shopFacts(this.shop);
    },
    offMax() {
      void currentCurrency();
      let m = 0;
      for (const p of this.ly.products) m = Math.max(m, priceView(this.shop, p).off || 0);
      return Math.round(m);
    },
    msgs() {
      if (!this.ly.ready) return [];
      const out = [];
      if (this.offMax > 0) {
        const links = ["women", "men"]
          .filter((a) => this.ly.products.some((p) => forAudience(p, a) && priceView(this.shop, p).off > 0))
          .map((a) => {
            const d = dealsRoute();
            return { label: t("dn.promo.shopAud", "Shop {aud}", { aud: audienceLabel(a).toLowerCase() }), to: { ...d, query: { ...d.query, aud: a } } };
          });
        out.push({ k: "off", text: t("dn.promo.off", "Up to {off}% off selected styles", { off: this.offMax }), links: links.length ? links : [{ label: t("dn.promo.shopDeals", "Shop deals"), to: dealsRoute() }] });
      }
      const f = this.facts;
      if (f.pickup && f.pickup.free) out.push({ k: "pick", text: t("dn.promo.pickup", "Free pickup at the store"), links: [] });
      if (f.courier) {
        const days = f.courier.days.length === 7 ? t("dn.promo.everyDay", "every day") : "";
        const text = f.courier.free
          ? t("dn.promo.courierFree", "Free local delivery {days}", { days }).trim()
          : t("dn.promo.courier", "Local delivery {days}", { days }).trim();
        out.push({ k: "cour", text, links: [] });
      }
      const ret = this.returnsDays;
      if (ret) out.push({ k: "ret", text: t("dn.promo.returns", "{n}-day returns", { n: ret }), links: [] });
      out.push({ k: "new", text: t("dn.promo.new", "New styles every week"), links: [{ label: t("dn.promo.shopNew", "Shop new"), to: catalogueRoute({ sort: "newest" }) }] });
      return out.slice(0, 4);
    },
    /* "30 Days" on most products (four in five) -> 30; else nothing (no claim the shop does not make). */
    returnsDays() {
      const ps = this.ly.products;
      if (!ps.length) return 0;
      const count = new Map();
      for (const p of ps) {
        const m = String(p.warranty || p.return_warranty || "").match(/(\d+)\s*day/i);
        if (m) count.set(Number(m[1]), (count.get(Number(m[1])) || 0) + 1);
      }
      const top = [...count.entries()].sort((a, b) => b[1] - a[1])[0];
      return top && top[1] >= ps.length * 0.8 ? top[0] : 0;
    },
    paused_() {
      return this.paused || this.hold || this.hidden || this.still;
    },
  },
  watch: {
    "msgs.length"() {
      if (this.at >= this.msgs.length) this.at = 0;
    },
  },
  mounted() {
    try {
      this.still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      this.still = false;
    }
    this.onVis = () => (this.hidden = document.hidden);
    document.addEventListener("visibilitychange", this.onVis);
    this.timer = window.setInterval(() => {
      if (!this.paused_ && this.msgs.length > 1) this.at = (this.at + 1) % this.msgs.length;
    }, 6000);
  },
  beforeUnmount() {
    window.clearInterval(this.timer);
    document.removeEventListener("visibilitychange", this.onVis);
  },
  methods: {
    t,
    go(d) {
      const n = this.msgs.length;
      this.at = (this.at + d + n) % n;
    },
  },
};
</script>
