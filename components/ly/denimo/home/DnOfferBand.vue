<!--
  The offer band (sections.json "offerband"): the saving from the live deals on
  the tint band, then a capsule with + for every audience on sale. Hidden when nothing is on sale.
-->
<template>
  <section v-if="ready && offMax && links.length" aria-labelledby="dn-ob-h" :class="['dn-ob', { band }]">
    <div class="wrap dn-ob-in">
      <h2 id="dn-ob-h" class="dn-ob-h">{{ offLine }}</h2>
      <div class="dn-ob-cta">
        <router-link v-for="l in links" :key="l.key" :to="l.to" class="dnh-cap dnh-cap-act">{{ l.label }}<ly-icon name="plus" /></router-link>
      </div>
    </div>
  </section>
</template>

<script>
import LyIcon from "../../LyIcon.vue";
import homeData from "../../home/home-data";
import { dealsRoute } from "../../../kalio/kalio-catalog";
import { t } from "../../../kalio/i18n/kalio-i18n";
import { forAudience } from "../dn-data";
import { audDealsTo, shopAud } from "./dn-home";

export default {
  name: "DnOfferBand",
  components: { LyIcon },
  mixins: [homeData],
  computed: {
    links() {
      const on = this.products.filter((p) => this.pv(p).save > 0);
      const out = [];
      for (const a of ["women", "men"]) if (on.some((p) => forAudience(p, a))) out.push({ key: a, label: shopAud(a), to: audDealsTo(a) });
      if (on.some((p) => forAudience(p, "kids"))) out.push({ key: "kids", label: t("dn.home.shopKids", "Shop kids"), to: audDealsTo("kids") });
      out.push({ key: "all", label: t("dn.home.allDeals", "See every deal"), to: dealsRoute() });
      return out;
    },
  },
  methods: { t },
};
</script>
