<!--
  Denimo's product gallery: the first two photos side by side, then one large, then pairs (a last
  photo alone is large too), each contained on the family's plate. A click opens the photo full screen (arrows,
  Esc, a swipe on a phone, the page stops scrolling). Below 980px the same photos become one swipe row with dots.
  The ♡ (Selldone's wishlist) sits in the first photo's corner, clear of any words.
-->
<template>
  <div :class="['dn-pd-gal', 'n' + Math.min(photos.length, 9)]">
    <div ref="track" :aria-label="t('dn.pd.photos', 'Photos')" class="dn-pd-mo" role="list" @scroll.passive="onScroll">
      <div v-for="(ph, i) in photos" :key="ph.src" :class="['dn-pd-ph', { '-big': big(i) }]" role="listitem">
        <button :aria-label="t('dn.pd.zoomN', 'Open photo {n} of {total}', { n: i + 1, total: photos.length })" class="dn-pd-ph-b" type="button" @click="open(i, $event)">
          <img :alt="i === 0 ? ph.alt : ''" :loading="i < 2 ? 'eager' : 'lazy'" :src="ph.src" decoding="async" draggable="false" />
        </button>
      </div>
      <div v-if="!photos.length" class="dn-pd-ph -big -none" role="listitem"><ly-icon name="box" /></div>
    </div>
    <button
      v-if="product"
      :aria-label="isSaved ? t('dn.pd.unsave', 'Remove {name} from saved', { name: product.title }) : t('dn.pd.save', 'Save {name}', { name: product.title })"
      :aria-pressed="isSaved ? 'true' : 'false'"
      class="dn-pd-sv"
      type="button"
      @click="toggleSave"
    >
      <ly-icon name="heart" />
    </button>
    <div v-if="photos.length > 1" class="dn-pd-dots">
      <button
        v-for="(ph, i) in photos"
        :key="ph.src"
        :aria-current="i === at ? 'true' : undefined"
        :aria-label="t('dn.pd.photoN', 'Photo {n} of {total}', { n: i + 1, total: photos.length })"
        type="button"
        @click="go(i)"
      ></button>
    </div>

    <teleport to="body">
      <div v-if="zoom >= 0" :dir="rtl ? 'rtl' : 'ltr'" class="ly ly-layers">
        <div
          ref="zoomEl"
          :aria-label="t('dn.pd.zoomT', 'Photos of {name}', { name: product ? product.title : '' })"
          aria-modal="true"
          class="dn-pd-zoom"
          role="dialog"
          tabindex="-1"
          @click.self="close"
          @keydown="keys"
          @touchend.passive="swipeEnd"
          @touchstart.passive="swipeStart"
        >
          <img :key="photos[zoom].src" :alt="photos[zoom].alt" :src="photos[zoom].src" class="dn-pd-zoom-i" @click.self="close" />
          <p class="dn-pd-zoom-n" aria-live="polite">{{ t("dn.pd.nOfTotal", "{n} / {total}", { n: zoom + 1, total: photos.length }) }}</p>
          <button ref="zx" :aria-label="t('ly.modal.close', 'Close')" class="dn-pd-zoom-x" type="button" @click="close"><ly-icon name="close" /></button>
          <template v-if="photos.length > 1">
            <button :aria-label="t('dn.pd.prev', 'Previous photo')" class="dn-pd-zoom-a -prev" type="button" @click="step(-1)"><ly-icon name="left" /></button>
            <button :aria-label="t('dn.pd.next', 'Next photo')" class="dn-pd-zoom-a -next" type="button" @click="step(1)"><ly-icon name="right" /></button>
          </template>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import LyIcon from "../../LyIcon.vue";
import { saved, toggleSaved } from "../../../bakini/bakini";
import { isRtl, regionState } from "../../../region-switcher/region";
import { t } from "../../../kalio/i18n/kalio-i18n";

export default {
  name: "DnGallery",
  components: { LyIcon },
  props: {
    photos: { type: Array, default: () => [] },
    product: { type: Object, default: null },
  },
  data: () => ({ at: 0, zoom: -1, saved, region: regionState }),
  computed: {
    rtl() {
      void this.region.language;
      return isRtl();
    },
    isSaved() {
      const p = this.product;
      return !!p && (this.saved[p.id] ?? !!p.wishlist);
    },
  },
  watch: {
    /* a colour change brings its photo first: back to the start */
    "photos.0.src"() {
      this.at = 0;
      const el = this.$refs.track;
      if (el) el.scrollTo({ left: 0, behavior: "auto" });
    },
  },
  beforeUnmount() {
    if (this.zoom >= 0) document.documentElement.style.overflow = "";
  },
  methods: {
    t,
    /* the third photo is large, and a last photo alone on its row */
    big(i) {
      const n = this.photos.length;
      if (n === 1) return true;
      if (i < 2) return false;
      if (i === 2) return true;
      return i === n - 1 && (n - 3) % 2 === 1;
    },
    onScroll() {
      const el = this.$refs.track;
      if (!el || !el.clientWidth) return;
      this.at = Math.min(this.photos.length - 1, Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
    },
    go(i) {
      const el = this.$refs.track;
      if (!el) return;
      const left = (this.rtl ? -1 : 1) * i * el.clientWidth;
      el.scrollTo({ left, behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth" });
      this.at = i;
    },
    open(i, e) {
      this.opener = e?.currentTarget || null;
      this.zoom = i;
      document.documentElement.style.overflow = "hidden";
      this.$nextTick(() => this.$refs.zx?.focus({ preventScroll: true }));
    },
    close() {
      this.zoom = -1;
      document.documentElement.style.overflow = "";
      try {
        this.opener?.focus({ preventScroll: true });
      } catch {
        /* gone */
      }
    },
    step(d) {
      const n = this.photos.length;
      if (n < 2) return;
      this.zoom = (this.zoom + d + n) % n;
    },
    keys(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        this.close();
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        this.step((e.key === "ArrowRight") !== this.rtl ? 1 : -1);
      } else if (e.key === "Tab") {
        /* the focus stays inside the viewer */
        const f = [...this.$refs.zoomEl.querySelectorAll("button")];
        if (!f.length) return;
        const i = f.indexOf(document.activeElement);
        const j = e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : i >= f.length - 1 ? 0 : i + 1;
        f[j].focus();
        e.preventDefault();
      }
    },
    swipeStart(e) {
      this.sx = e.changedTouches?.[0]?.clientX ?? null;
    },
    swipeEnd(e) {
      if (this.sx == null) return;
      const dx = (e.changedTouches?.[0]?.clientX ?? this.sx) - this.sx;
      this.sx = null;
      if (Math.abs(dx) < 40) return;
      this.step((dx < 0) !== this.rtl ? 1 : -1);
    },
    toggleSave() {
      if (this.product) toggleSaved(this, this.product);
    },
  },
};
</script>
