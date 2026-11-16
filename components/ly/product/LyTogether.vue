<!--
  Denimo: "Complete the look": the best seller of up to four other departments for
  the same audience as this product (dn-data's audienceOf: everyone when it has none), from the live catalogue.
  Each: its photo on the plate, the department, the name, the price with the struck was-price, its colours, and
  a capsule "Pick a size & add to bag" that opens its page (sizes are chosen there). Two per row on a wide
  screen, one under the other on a phone; nothing when fewer than two fit.
-->
<template>
  <section v-if="items.length" aria-labelledby="dn-pd-look-h" class="dn-pd-look">
    <div class="wrap">
      <h2 id="dn-pd-look-h" class="dn-pd-sec-h">{{ t("dn.pd.lookH", "Complete the look") }}</h2>
      <ul class="dn-pd-look-l">
        <li v-for="x in items" :key="x.p.id" class="dn-pd-look-i">
          <router-link :to="productTo(x.p)" aria-hidden="true" class="dn-pd-look-ph" tabindex="-1"><img :src="x.img" alt="" loading="lazy" /></router-link>
          <div class="dn-pd-look-tx">
            <span v-if="x.dept" class="dn-pd-look-c"
              ><bdi>{{ x.dept }}</bdi></span
            >
            <router-link :to="productTo(x.p)" class="dn-pd-look-n">{{ x.p.title }}</router-link>
            <span class="dn-pd-look-p"
              ><span class="now money">{{ money(x.v.now) }}</span><template v-if="x.v.was">{{ " " }}<s class="was money">{{ money(x.v.was) }}</s></template></span
            >
            <span v-if="x.colours" class="dn-pd-look-k">{{ t("dn.pd.colourIs", "Colour: {name}", { name: x.colours }) }}</span>
            <router-link :to="productTo(x.p)" class="dn-pd-cap">{{ x.cta }}</router-link>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import { catTitle, ly, loadDm, money, priceView, productImage, productTo } from "../ly";
import { colourWords, deptOf, lookFor } from "../denimo/product/dn-pick";
import { coloursOf, sizesOf } from "../denimo/dn-data";
import { currentCurrency } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "LyTogether",
  props: {
    product: { type: Object, required: true },
  },
  data: () => ({ ly }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    items() {
      void currentCurrency();
      void this.ly.products.length;
      return lookFor(this.product, 4).map((p) => ({
        p,
        v: priceView(this.shop, p, null),
        img: productImage(p),
        dept: catTitle(deptOf(p)),
        colours: colourWords(p),
        cta: sizesOf(p).length
          ? t("dn.pd.pickSize", "Pick a size & add to bag")
          : coloursOf(p).length > 1
            ? t("dn.pd.pickColour", "Pick a colour & add to bag")
            : t("dn.pd.seeAdd", "See it & add to bag"),
      }));
    },
  },
  created() {
    loadDm();
  },
  methods: {
    t,
    money,
    productTo,
  },
};
</script>
