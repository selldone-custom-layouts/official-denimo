<!--
  The product page's add box: "Add to bag" (with the page's quantity), then − n + in its place, for the page's
  chosen variant. The count is the bag's own line through kalio-basket's queue (quick taps are never lost); "+"
  takes the focus when the box appears. Without a chosen size (or option) it reads "Select a size" and a click
  emits "need" (the page points to the size row with a short line, no toast); sold out: "Sold out".
-->
<template>
  <button v-if="!q" :aria-disabled="blocked ? 'true' : undefined" :class="['btn', 'add', { '-off': blocked, '-need': needsChoice && !soldOut }]" type="button" @click.prevent.stop="more">
    <ly-icon v-if="!needsChoice && !blocked" name="bag" />{{ shownLabel }}
  </button>
  <div v-else :aria-label="t('ly.add.inBag', '{name} in bag', { name: product.title })" class="qb" role="group">
    <button :aria-label="t('ly.add.less', 'Remove one {name}', { name: product.title })" type="button" @click.prevent.stop="less"><ly-icon name="minus" /></button>
    <span aria-live="polite" class="qn">{{ q }}</span>
    <button
      ref="plus"
      :aria-disabled="full ? 'true' : undefined"
      :aria-label="t('ly.add.more', 'Add one more {name}', { name: product.title })"
      :title="full ? t('ly.add.noMore', 'No more in stock') : undefined"
      type="button"
      @click.prevent.stop="more"
    >
      <ly-icon name="plus" />
    </button>
  </div>
</template>

<script>
import LyIcon from "../LyIcon.vue";
import { addCount, basketLine, pendingLine, pendingLineFor, shownCount, stepTo } from "../../kalio/kalio-basket";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "LyPdAdd",
  components: { LyIcon },
  props: {
    product: { type: Object, required: true },
    /** The page's chosen variant (null for a product without options). */
    variant: { type: Object, default: null },
    /** The product has sizes or options but none is chosen yet. */
    needsChoice: { type: Boolean, default: false },
    /** The words while a choice is missing ("Select a size"). */
    needLabel: { type: String, default: "" },
    /** How many the first tap puts in the bag (the page's quantity). */
    count: { type: Number, default: 1 },
  },
  emits: ["need"],
  computed: {
    line() {
      const p = this.product;
      if (!p) return null;
      if (this.variant && !this.needsChoice) return basketLine(this, p, { id: this.variant.id }) || pendingLineFor(p, this.variant.id);
      if (this.needsChoice) return null;
      return basketLine(this, p) || pendingLine(p);
    },
    q() {
      return shownCount(this.product, this.line);
    },
    stock() {
      const n = this.variant ? this.variant.quantity : this.product.quantity;
      return Number.isFinite(Number(n)) ? Number(n) : 0;
    },
    soldOut() {
      return !this.needsChoice && !(this.stock > 0);
    },
    full() {
      return !this.soldOut && this.q >= this.stock;
    },
    blocked() {
      return this.soldOut || (!this.needsChoice && this.full);
    },
    shownLabel() {
      if (this.soldOut) return t("ly.pd.soldOut", "Sold out");
      if (this.needsChoice) return this.needLabel || t("ly.pd.chooseFirst", "Choose an option");
      return t("ly.add.add", "Add to bag");
    },
  },
  watch: {
    q(now, before) {
      if (before === 0 && now > 0 && this.hadFocus) this.$nextTick(() => this.$refs.plus?.focus({ preventScroll: true }));
    },
  },
  methods: {
    t,
    more(e) {
      if (this.needsChoice && !this.q) {
        this.$emit("need", e);
        return;
      }
      if (this.blocked) return;
      this.hadFocus = !!e?.currentTarget && document.activeElement === e.currentTarget;
      if (!this.q || !this.line) {
        const n = Math.max(1, Math.min(Math.floor(this.count) || 1, this.stock || 1));
        return addCount(this, this.product, this.variant, n);
      }
      stepTo(this, this.product, this.line, this.q + 1);
    },
    less() {
      if (this.q > 0 && this.line) stepTo(this, this.product, this.line, this.q - 1);
    },
  },
};
</script>
