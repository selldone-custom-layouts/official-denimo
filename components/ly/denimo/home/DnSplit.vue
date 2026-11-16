<!--
  Two portrait banners side by side (sections.json "split"): the departments that have
  a split-<slug> photo in the skin, the first two by products sold. The department's name in big words and a white
  capsule on the photo's dark lower third (a soft shade under the words). Stacked on a phone. Hidden without photos.
-->
<template>
  <section v-if="items.length" :aria-label="t('dn.home.featuredDeps', 'Featured departments')" :class="['dn-split', { band, one: items.length === 1 }]">
    <div class="wrap dn-split-in">
      <router-link v-for="x in items" :key="x.c.id" :to="x.to" class="dn-sp">
        <img :src="x.photo" alt="" decoding="async" draggable="false" loading="lazy" />
        <span class="dn-sp-tx">
          <b class="dn-sp-h"><bdi>{{ x.label }}</bdi></b>
          <span v-if="x.line" class="dn-sp-p">{{ x.line }}</span>
          <span class="dnh-cap dnh-cap-lt">{{ t("dn.home.shopCat", "Shop {cat}", { cat: x.label }) }}</span>
        </span>
      </router-link>
    </div>
  </section>
</template>

<script>
import homeData from "../../home/home-data";
import { bySells, catTitle, catTo, inCat } from "../../ly";
import { t } from "../../../kalio/i18n/kalio-i18n";
import { bannerOf, departments } from "./dn-home";

export default {
  name: "DnSplit",
  mixins: [homeData],
  computed: {
    items() {
      if (!this.ready) return [];
      return departments()
        .map((c, i) => ({ c, i, photo: bannerOf("split", c), sold: bySells(inCat(c.id)).reduce((s, p) => s + (p.sells || 0), 0), n: inCat(c.id).length }))
        .filter((x) => x.photo)
        .sort((a, b) => b.sold - a.sold || b.n - a.n || a.i - b.i)
        .slice(0, 2)
        .map((x) => ({ ...x, label: catTitle(x.c), to: catTo(x.c), line: this.lineOf(x.c) }));
    },
  },
  methods: {
    t,
    /* the department's own description, first sentence, short */
    lineOf(c) {
      const d = String(c?.description || "").split(/(?<=[.!?])\s/)[0] || "";
      return d.length <= 90 ? d : "";
    },
  },
};
</script>
