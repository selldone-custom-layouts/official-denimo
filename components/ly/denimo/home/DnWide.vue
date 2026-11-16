<!--
  A wide banner (sections.json "wide"): a department that has a
  wide-<slug> photo in the skin (variant "a" = the first such department by products sold, "b" = the second), its name
  in big words on the photo's calm side (the side is found from the photo: words at the start, or at the end for
  a second banner), a capsule for the department and one per audience it has. On a phone the photo's own phone crop
  (wide-<slug>-phone) with the words under it. Hidden without a photo.
-->
<template>
  <section v-if="item" :aria-labelledby="hid" :class="['dn-wide', 'v-' + variant, { band }]">
    <div class="wrap">
      <div :class="['dn-wd', 'side-' + side, 'tone-' + tone]">
        <picture class="dn-wd-ph">
          <source v-if="item.phone" :srcset="item.phone" media="(max-width: 767px)" />
          <img :src="item.photo" alt="" decoding="async" draggable="false" loading="lazy" @load="read" />
        </picture>
        <div class="dn-wd-tx">
          <h2 :id="hid" class="dn-wd-h"><bdi>{{ item.label }}</bdi></h2>
          <p v-if="item.line" class="dn-wd-p">{{ item.line }}</p>
          <div class="dn-wd-cta">
            <router-link :to="item.to" class="dnh-cap dnh-cap-dk">{{ t("dn.home.shopCat", "Shop {cat}", { cat: item.label }) }}</router-link>
            <router-link v-for="a in item.auds" :key="a.id" :to="a.to" class="dnh-cap dnh-cap-ol">{{ a.label }}</router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import homeData from "../../home/home-data";
import { catTitle, catTo, inCat } from "../../ly";
import { t } from "../../../kalio/i18n/kalio-i18n";
import { audienceLabel, forAudience } from "../dn-data";
import { audCatTo, bannerOf, departments } from "./dn-home";

export default {
  name: "DnWide",
  mixins: [homeData],
  data: () => ({ side: "start", tone: "dark" }),
  computed: {
    hid() {
      return "dn-wide-" + this.variant;
    },
    item() {
      if (!this.ready) return null;
      const list = departments()
        .map((c, i) => ({ c, i, photo: bannerOf("wide", c), phone: bannerOf("wide", c, "-phone"), n: inCat(c.id).length }))
        .filter((x) => x.photo)
        .sort((a, b) => a.i - b.i);
      const x = list[this.variant === "b" ? 1 : 0];
      if (!x) return null;
      const ps = inCat(x.c.id);
      const auds = ["women", "men", "kids"]
        .filter((a) => ps.some((p) => forAudience(p, a)))
        .slice(0, 2)
        .map((a) => ({ id: a, label: audienceLabel(a), to: audCatTo(a, x.c) }));
      const d = String(x.c.description || "").split(/(?<=[.!?])\s/)[0] || "";
      return { ...x, label: catTitle(x.c), to: catTo(x.c), auds, line: d.length <= 110 ? d : "" };
    },
  },
  methods: {
    t,
    /* Where the photo is calm: the 40% side (start or end) with the least variation gets the words; light ground ->
       dark words, dark ground -> white words. Read once from a 64 px copy of the photo (same-origin asset). */
    read(e) {
      try {
        const img = e.target;
        if (img.currentSrc && img.currentSrc !== this.item.photo && !img.currentSrc.endsWith(this.item.photo)) return;
        const w = 64, h = Math.max(8, Math.round((64 * img.naturalHeight) / img.naturalWidth));
        const cv = document.createElement("canvas");
        cv.width = w; cv.height = h;
        const cx = cv.getContext("2d", { willReadFrequently: true });
        cx.drawImage(img, 0, 0, w, h);
        const stat = (x0, x1) => {
          const d = cx.getImageData(x0, 0, x1 - x0, h).data;
          let n = 0, sum = 0, sq = 0;
          for (let i = 0; i < d.length; i += 4) { const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; sum += l; sq += l * l; n++; }
          const m = sum / n;
          return { m, v: sq / n - m * m };
        };
        const L = stat(0, Math.round(w * 0.4)), R = stat(Math.round(w * 0.6), w);
        const leftCalm = L.v <= R.v;
        const rtl = getComputedStyle(img).direction === "rtl";
        this.side = leftCalm !== rtl ? "start" : "end";
        this.tone = (leftCalm ? L.m : R.m) > 150 ? "dark" : "light";
      } catch {
        /* keep the defaults */
      }
    },
  },
};
</script>
