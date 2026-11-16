<!--
  Tiles (sections.json "tiles"):
  - "categories": every department with products, a 3:4 photo (the skin's col-<slug>, else the department's best
    seller on its plate) with the name under it; one row that scrolls, arrows from 980px;
  - "audiences": Women, Men, Girls, Boys, Baby (only those with products), the skin's aud-<id> photos (else a product),
    circles on a phone.
-->
<template>
  <section v-if="tiles.length" :aria-labelledby="hid" :class="['dn-tiles', 'v-' + variant, { band }]">
    <div class="wrap">
      <header class="dn-sh">
        <h2 :id="hid" class="dn-h2">{{ title }}</h2>
        <div v-if="tiles.length > 4" class="dn-arrows">
          <button :aria-label="t('dn.home.prev', 'Scroll back')" class="dn-arr" type="button" @click="scroll(-1)"><ly-icon name="left" /></button>
          <button :aria-label="t('dn.home.next', 'Scroll on')" class="dn-arr" type="button" @click="scroll(1)"><ly-icon name="right" /></button>
        </div>
      </header>
      <ul ref="row" class="dn-trow">
        <li v-for="x in tiles" :key="x.key">
          <router-link :to="x.to" class="dn-tile">
            <span :class="['dn-tile-ph', { cut: !x.photo }]"><img :alt="''" :src="x.photo || x.cut" decoding="async" draggable="false" loading="lazy" /></span>
            <b><bdi>{{ x.label }}</bdi></b>
          </router-link>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import LyIcon from "../../LyIcon.vue";
import homeData from "../../home/home-data";
import { bySells, catTitle, catTo, inCat, productImage } from "../../ly";
import { collectionPhoto, slotPhoto } from "../../ly-photos";
import { t } from "../../../kalio/i18n/kalio-i18n";
import { audienceLabel, forAudience } from "../dn-data";
import { audTo, audiencesPresent, departments } from "./dn-home";

export default {
  name: "DnTiles",
  components: { LyIcon },
  mixins: [homeData],
  computed: {
    hid() {
      return "dn-tiles-" + this.variant;
    },
    title() {
      return this.variant === "audiences" ? t("dn.home.forEveryone", "Shop for everyone") : t("dn.home.byCategory", "Shop by category");
    },
    tiles() {
      if (!this.ready) return [];
      if (this.variant === "audiences") {
        return audiencesPresent().map((a) => {
          const best = bySells(this.products.filter((p) => forAudience(p, a)))[0];
          return { key: a, label: audienceLabel(a), to: audTo(a), photo: slotPhoto("aud-" + a), cut: best ? productImage(best) : "" };
        });
      }
      return departments().map((c) => {
        const best = bySells(inCat(c.id))[0];
        return { key: c.id, label: catTitle(c), to: catTo(c), photo: collectionPhoto(c), cut: best ? productImage(best) : "" };
      });
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
