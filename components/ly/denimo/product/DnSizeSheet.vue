<!--
  "Size details": the product's own size and fit rows from its spec, its sizes, then the general
  size ladders that fit them (clothing XS–XL, shoes, kids, baby: general measurements, not the shop's), and
  "Need help? Write to us" to the shop's contact page. The base's modal (LyModal: a centred card, a bottom sheet
  on a phone; ✕, Esc and a click outside close it); the scrim is its own, under the card.
-->
<template>
  <div>
    <teleport to="body">
      <div class="ly ly-layers">
        <div :class="['scrim', 'dn-pd-sz-scrim', { open }]" @click="close"></div>
      </div>
    </teleport>
    <ly-modal :id="id" :title="t('dn.pd.sizeDetails', 'Size details')" cls="dn-pd-szm wide">
      <div class="dn-pd-sz">
        <section v-if="rows.length || sizes.length" class="dn-pd-sz-own">
          <h3 class="dn-pd-sz-h">{{ t("dn.sz.thisStyle", "This style") }}</h3>
          <p v-if="sizes.length" class="dn-pd-sz-chips">
            <span class="dn-pd-sz-k">{{ t("dn.sz.madeIn", "Made in") }}</span>
            <span v-for="s in sizes" :key="s" class="dn-pd-sz-c" dir="ltr">{{ s }}</span>
          </p>
          <dl v-if="rows.length" class="dn-pd-dl">
            <div v-for="r in rows" :key="r[0]">
              <dt>{{ r[0] }}</dt>
              <dd>{{ r[1] }}</dd>
            </div>
          </dl>
        </section>

        <section v-for="l in ladders" :key="l.key" class="dn-pd-sz-l">
          <h3 class="dn-pd-sz-h">{{ l.title }}</h3>
          <div class="dn-pd-sz-tw">
            <table class="dn-pd-sz-t">
              <thead>
                <tr>
                  <th v-for="h in l.head" :key="h" scope="col">{{ h }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in l.rows" :key="r[0]" :class="{ '-has': sizes.includes(r[0]) }">
                  <th dir="ltr" scope="row">{{ r[0] }}</th>
                  <td v-for="(c, i) in r.slice(1)" :key="i" dir="ltr">{{ c }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <p class="dn-pd-sz-note">{{ t("dn.sz.note", "A general guide: measure over light clothing and compare. Between two sizes? Take the larger one for an easier fit.") }}</p>

        <p class="dn-pd-sz-help">
          <ly-icon name="chat" />
          <span
            >{{ t("dn.sz.help", "Need help finding your size?") }}{{ " " }}<router-link :to="contactTo" @click="close">{{ t("dn.sz.write", "Write to us") }}</router-link></span
          >
        </p>
      </div>
    </ly-modal>
  </div>
</template>

<script>
import LyIcon from "../../LyIcon.vue";
import LyModal from "../../ui/LyModal.vue";
import { closeLayer, layer } from "../../ly";
import { laddersFor, sizeRows } from "./dn-pick";
import { sizesOf } from "../dn-data";
import { t } from "../../../kalio/i18n/kalio-i18n";

export default {
  name: "DnSizeSheet",
  components: { LyIcon, LyModal },
  props: {
    product: { type: Object, required: true },
    id: { type: String, default: "dn-pd-size" },
  },
  data: () => ({ layer }),
  computed: {
    open() {
      return this.layer.open === this.id;
    },
    sizes() {
      return sizesOf(this.product).map((s) => s.size);
    },
    rows() {
      return sizeRows(this.product);
    },
    ladders() {
      return laddersFor(this.sizes);
    },
    contactTo() {
      return { name: window.$storefront.routes.SHOP_CONTACT_US };
    },
  },
  watch: {
    /* the page stays still under the sheet */
    open(on) {
      document.documentElement.style.overflow = on ? "hidden" : "";
    },
  },
  beforeUnmount() {
    if (this.open) closeLayer(true);
  },
  methods: {
    t,
    close() {
      if (this.open) closeLayer();
    },
  },
};
</script>
