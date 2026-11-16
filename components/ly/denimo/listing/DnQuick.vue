<!--
  Denimo's quick-add strip at the foot of a card's photo: the product's sizes as chips in
  ladder order (sold-out ones struck and off); a chip puts that size in the bag, in the first colour that has it in
  stock, through the base's basket queue (kalio-basket addVariant / stepTo: quick taps never lost); then the
  base's − n + stepper stands in its place with the size and colour in words. A product without sizes shows
  "Add to bag" (the first colour in stock). No toast: the strip itself answers.

  The card shows it on hover or focus (pointer devices); on a touch screen the card's "+" opens it (`open`) and its
  ✕ closes it (`close`).
-->
<template>
  <div :aria-label="t('dn.qa.aria', 'Quick add: {name}', { name: product.title })" :class="['dn-qa', { open, held: q > 0 }]" role="group">
    <div v-if="q > 0" class="qa-in qa-bag">
      <span class="qa-w"><bdi>{{ words }}</bdi></span>
      <div :aria-label="t('ly.add.inBag', '{name} in bag', { name: product.title })" class="qb" role="group">
        <button :aria-label="t('ly.add.less', 'Remove one {name}', { name: product.title })" type="button" @click.prevent.stop="step(-1)">
          <ly-icon name="minus" />
        </button>
        <span aria-live="polite" class="qn">{{ q }}</span>
        <button
          :aria-disabled="full ? 'true' : undefined"
          :aria-label="t('ly.add.more', 'Add one more {name}', { name: product.title })"
          :title="full ? t('ly.add.noMore', 'No more in stock') : undefined"
          type="button"
          @click.prevent.stop="!full && step(1)"
        >
          <ly-icon name="plus" />
        </button>
      </div>
    </div>
    <div v-else-if="sizes.length" class="qa-in">
      <p class="qa-h">{{ t("dn.qa.pick", "Pick a size") }}</p>
      <div class="qa-sz">
        <button
          v-for="s in sizes"
          :key="s.size"
          :aria-label="s.stock > 0 ? t('dn.qa.addSize', 'Add size {size} to bag', { size: s.size }) : t('dn.qa.soldSize', 'Size {size}, sold out', { size: s.size })"
          :class="['qa-c', { out: !(s.stock > 0) }]"
          :disabled="!(s.stock > 0)"
          type="button"
          @click.prevent.stop="add(s.size)"
        >
          <bdi>{{ s.size }}</bdi>
        </button>
      </div>
    </div>
    <div v-else class="qa-in">
      <button :disabled="soldOut" class="qa-add" type="button" @click.prevent.stop="add('')">
        {{ soldOut ? t("ly.add.soldOut", "Sold out") : t("dn.qa.add", "Add to bag") }}
      </button>
    </div>
    <button v-if="open" :aria-label="t('dn.qa.close', 'Close quick add')" class="qa-x" type="button" @click.prevent.stop="$emit('close')"><ly-icon name="close" /></button>
  </div>
</template>

<script>
import LyIcon from "../../LyIcon.vue";
import { t } from "../../../kalio/i18n/kalio-i18n";
import { addVariant, basketLine, pendingLine, pendingLineFor, quickAdd, shownCount, stepTo } from "../../../kalio/kalio-basket";
import { productTo } from "../../ly";
import { sizesOf, variantsOf } from "../dn-data";
import { quickVariant, variantWords } from "./dn-listing";

export default {
  name: "DnQuick",
  components: { LyIcon },
  props: {
    product: { type: Object, required: true },
    open: Boolean,
  },
  emits: ["close"],
  data: () => ({ picked: null }),
  computed: {
    sizes() {
      return sizesOf(this.product);
    },
    variants() {
      return variantsOf(this.product);
    },
    soldOut() {
      if (this.variants.length) return !quickVariant(this.product, "");
      return !(Number(this.product.quantity) > 0);
    },
    /* The bag line this strip added (a variant's, or the product's own when it has none). */
    line() {
      const p = this.product;
      if (this.picked) return basketLine(this, p, { id: this.picked.id }) || pendingLineFor(p, this.picked.id);
      if (!this.variants.length) return basketLine(this, p) || pendingLine(p);
      return null;
    },
    q() {
      return this.line ? shownCount(this.product, this.line) : 0;
    },
    full() {
      const max = Number(this.picked ? this.picked.quantity : this.product.quantity);
      return Number.isFinite(max) && max > 0 && this.q >= max;
    },
    words() {
      return this.picked ? variantWords(this.picked) : "";
    },
  },
  watch: {
    "product.id"() {
      this.picked = null;
    },
  },
  methods: {
    t,
    add(size) {
      const p = this.product;
      if (!this.variants.length) {
        quickAdd(this, p, () => this.$router.push(productTo(p)));
        return;
      }
      const v = quickVariant(p, size);
      if (!v || !v.id) {
        this.$router.push(productTo(p));
        return;
      }
      this.picked = v;
      addVariant(this, p, v);
    },
    step(delta) {
      if (!this.line) return;
      stepTo(this, this.product, this.line, this.q + delta);
    },
  },
};
</script>
