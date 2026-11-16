<!--
  Denimo's product card: an open card, no box.

  - the photo: a 3:4 plate in the family's tint (--ly-plate), the product contained; on a pointer device, hovering
    shows the second photo (another colour's own photo) and the quick-add strip at the photo's foot (DnQuick: size
    chips, then − n + in place); on a touch screen a "+" circle in the photo's lower corner opens the strip;
  - on the photo: a small "Save n%" chip top-left, the ♡ (Selldone's favourites) top-right; nothing touches words;
  - under it: "New" (created in the last 30 days) or "Sale" in the family's colour, the name (two lines), the struck
    price and the price, the colour dots (five, then "+n").

  Every value comes from the product (cleanValue for variant values, colourName for hexes); nothing is written in.
-->
<template>
  <article :class="['pc', 'dn-pc', cls, { 'qa-on': qaOpen, 'has-2': !!second }]" :style="delay != null ? { '--ly-d': delay + 'ms' } : null" @focusin="warm = true" @mouseenter="warm = true">
    <div class="pc-plate">
      <router-link :to="to" aria-hidden="true" class="pc-ph" tabindex="-1">
        <img
          :loading="eager ? 'eager' : 'lazy'"
          :src="img"
          :srcset="srcset"
          alt=""
          class="pc-im"
          decoding="async"
          draggable="false"
          height="800"
          sizes="(max-width: 760px) 50vw, 320px"
          width="600"
          @error="dropSrcset"
        />
        <img v-if="second && warm" :src="second" alt="" class="pc-im2" decoding="async" draggable="false" height="800" width="600" />
      </router-link>
      <span v-if="pv.off > 0" class="pc-save"><bdi>{{ t("dn.card.save", "Save {off}%", { off: pv.off }) }}</bdi></span>
      <button
        :aria-label="isSaved ? t('dn.card.unsave', 'Remove {name} from favourites', { name: product.title }) : t('dn.card.saveFav', 'Add {name} to favourites', { name: product.title })"
        :aria-pressed="isSaved ? 'true' : 'false'"
        class="pc-fav"
        type="button"
        @click.prevent.stop="fav"
      >
        <ly-icon name="heart" />
      </button>
      <dn-quick :open="qaOpen" :product="product" @close="closeQa" />
      <button
        v-if="!qaOpen"
        :aria-label="t('dn.qa.open', 'Quick add: {name}', { name: product.title })"
        class="pc-plus"
        type="button"
        @click.prevent.stop="openQa"
      >
        <ly-icon name="plus" />
      </button>
    </div>
    <div class="pc-tx">
      <p v-if="flag" class="pc-flag">{{ flag }}</p>
      <h3 class="pc-t">
        <router-link :to="to">{{ product.title }}</router-link>
      </h3>
      <p class="pc-ly">
        <template v-if="pv.was"><s class="was money">{{ money(pv.was) }}</s>{{ " " }}</template><span :class="['now', 'money', { deal: pv.was }]">{{ money(pv.now) }}</span>
      </p>
      <p v-if="colours.length" :aria-label="t('dn.card.colours', 'Colours: {n}', { n: colours.length })" class="pc-dots" role="img">
        <span v-for="c in colours.slice(0, 5)" :key="c.hex" :style="{ background: c.hex }" :title="c.name" class="pc-dot"></span
        ><span v-if="colours.length > 5" aria-hidden="true" class="pc-more">+{{ colours.length - 5 }}</span>
      </p>
    </div>
  </article>
</template>

<script>
import LyIcon from "../LyIcon.vue";
import DnQuick from "../denimo/listing/DnQuick.vue";
import { money, priceView, productImage, productTo } from "../ly";
import { dropSrcset, productSrcset } from "../../kalio/kalio-catalog";
import { saved, toggleSaved } from "../../bakini/bakini";
import { currentCurrency } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";
import { coloursOf, photoUrl } from "../denimo/dn-data";
import { isNew, secondPhoto } from "../denimo/listing/dn-listing";

export default {
  name: "LyCard",
  components: { LyIcon, DnQuick },
  props: {
    product: { type: Object, required: true },
    /* kept for the pages that pass it (the card names no category) */
    noCat: Boolean,
    eager: Boolean,
    cls: { type: [String, Array, Object], default: "" },
    delay: { type: Number, default: null },
  },
  data: () => ({ warm: false, qaOpen: false }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    pv() {
      void currentCurrency();
      return priceView(this.shop, this.product);
    },
    to() {
      return productTo(this.product);
    },
    img() {
      return productImage(this.product);
    },
    srcset() {
      return productSrcset(this.product);
    },
    second() {
      return photoUrl(secondPhoto(this.product));
    },
    colours() {
      return coloursOf(this.product);
    },
    flag() {
      if (isNew(this.product)) return t("dn.card.new", "New");
      if (this.pv.save > 0) return t("dn.card.sale", "Sale");
      return "";
    },
    isSaved() {
      return saved[this.product?.id] ?? !!this.product?.wishlist;
    },
  },
  beforeUnmount() {
    document.removeEventListener("click", this.onOut, true);
  },
  methods: {
    t,
    money,
    dropSrcset,
    fav() {
      toggleSaved(this, this.product);
    },
    openQa() {
      this.qaOpen = true;
      this.onOut = (e) => {
        if (!this.$el.contains(e.target)) this.closeQa();
      };
      document.addEventListener("click", this.onOut, true);
    },
    closeQa() {
      this.qaOpen = false;
      document.removeEventListener("click", this.onOut, true);
    },
  },
};
</script>
