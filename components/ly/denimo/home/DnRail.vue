<!--
  A one-line product rail (sections.json "rail"), the cards of the listing (LyCard), five in
  view at 1440, arrows from 980px, one row that scrolls (never a second row):
  - "trending": by pieces sold, then the newest, departments mixed;
  - "sale": the biggest saving first;
  - "new": the newest first.
  "See all" opens the matching listing. Hidden when the shop has nothing for it.
-->
<template>
  <section v-if="list.length >= 4" :aria-labelledby="hid" :class="['dnh-rail', 'v-' + variant, { band }]">
    <div class="wrap">
      <header class="dn-sh">
        <h2 :id="hid" class="dn-h2">{{ title }}</h2>
        <router-link :to="allTo" class="dn-all">{{ t("dn.home.seeAll", "See all") }}<ly-icon name="right" /></router-link>
        <div class="dn-arrows">
          <button :aria-label="t('dn.home.prev', 'Scroll back')" class="dn-arr" type="button" @click="scroll(-1)"><ly-icon name="left" /></button>
          <button :aria-label="t('dn.home.next', 'Scroll on')" class="dn-arr" type="button" @click="scroll(1)"><ly-icon name="right" /></button>
        </div>
      </header>
      <ul ref="row" class="dn-rrow">
        <li v-for="p in list" :key="p.id"><ly-card :product="p" /></li>
      </ul>
    </div>
  </section>
</template>

<script>
import LyIcon from "../../LyIcon.vue";
import LyCard from "../../ui/LyCard.vue";
import homeData from "../../home/home-data";
import { mixed } from "../../ly";
import { catalogueRoute, dealsRoute } from "../../../kalio/kalio-catalog";
import { t } from "../../../kalio/i18n/kalio-i18n";

const time = (p) => Date.parse(p.created_at || p.updated_at || 0) || 0;

export default {
  name: "DnRail",
  components: { LyIcon, LyCard },
  mixins: [homeData],
  computed: {
    hid() {
      return "dnh-rail-" + this.variant;
    },
    title() {
      if (this.variant === "sale") return t("dn.home.onSale", "On sale now");
      if (this.variant === "new") return t("dn.home.newIn", "New arrivals");
      return t("dn.home.trending", "Trending now");
    },
    allTo() {
      if (this.variant === "sale") return dealsRoute();
      if (this.variant === "new") return catalogueRoute({ sort: "newest" });
      return catalogueRoute({ sort: "best" });
    },
    list() {
      if (!this.ready) return [];
      const inStock = this.products.filter((p) => p.quantity > 0);
      let l;
      if (this.variant === "sale") l = inStock.filter((p) => this.pv(p).save > 0).sort((a, b) => this.pv(b).off - this.pv(a).off || a.id - b.id);
      else if (this.variant === "new") l = [...inStock].sort((a, b) => time(b) - time(a) || b.id - a.id);
      else l = [...inStock].sort((a, b) => (b.sells || 0) - (a.sells || 0) || (b.visits || 0) - (a.visits || 0) || time(b) - time(a));
      /* the trending and new rails mix departments; never the same product in two rails next to each other */
      const out = this.variant === "sale" ? l : mixed(l);
      const skip = this.variant === "new" ? 12 : 0;
      return out.slice(skip, skip + 12).length >= 4 ? out.slice(skip, skip + 12) : out.slice(0, 12);
    },
  },
  methods: {
    t,
    scroll(d) {
      const el = this.$refs.row;
      if (!el) return;
      const rtl = getComputedStyle(el).direction === "rtl" ? -1 : 1;
      el.scrollBy({ left: d * rtl * el.clientWidth * 0.8, behavior: "smooth" });
    },
  },
};
</script>
