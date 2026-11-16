<!--
  The campaign hero (sections.json hero "campaign"): the skin's photo to the frame's edges, the big
  words on its calm side, one capsule per audience that has products. Desktop: the words in the family's dark on the
  photo's light wall (dark mode keeps them dark: the photo does not change). Phone: the portrait photo, then the words
  under it on the page (never words over a busy photo). Without a photo: the family-dark band with the same words.
-->
<template>
  <section aria-labelledby="dn-hero-h" :class="['dn-hero', { 'no-ph': !photo }]">
    <div class="dn-hero-fr">
      <picture v-if="photo" class="dn-hero-ph">
        <source v-if="phone" :srcset="phone" media="(max-width: 767px)" />
        <img :alt="t('ly.home.heroAlt', 'Friends in casual clothes')" :src="photo" decoding="async" draggable="false" fetchpriority="high" />
      </picture>
      <div class="dn-hero-tx">
        <p class="dn-hero-k">{{ t("ly.home.heroEyebrow", "New season") }}</p>
        <h1 id="dn-hero-h" class="dn-hero-h">{{ headline }}</h1>
        <p class="dn-hero-p">{{ sub }}</p>
        <div v-if="ready" class="dn-hero-cta">
          <router-link v-for="b in buttons" :key="b.key" :to="b.to" class="dnh-cap dnh-cap-dk">{{ b.label }}</router-link>
        </div>
        <router-link v-if="ready && offMax" :to="dealsTo" class="dn-hero-more">{{ t("dn.home.allDeals", "See every deal") }}<ly-icon name="right" /></router-link>
      </div>
    </div>
  </section>
</template>

<script>
import LyIcon from "../../LyIcon.vue";
import homeData from "../../home/home-data";
import { slotPhoto } from "../../ly-photos";
import { catalogueRoute, dealsRoute } from "../../../kalio/kalio-catalog";
import { t } from "../../../kalio/i18n/kalio-i18n";
import { audTo, audiencesPresent, shopAud } from "./dn-home";

export default {
  name: "DnHero",
  components: { LyIcon },
  mixins: [homeData],
  computed: {
    photo() {
      return slotPhoto("hero");
    },
    phone() {
      return slotPhoto("hero-phone");
    },
    headline() {
      return this.offMax ? t("dn.home.heroOff", "Up to {off}% off", { off: this.offMax }) : t("ly.home.heroH", "Casual clothes for everyone");
    },
    sub() {
      return this.offMax ? t("dn.home.heroOffSub", "Casual styles for everyone, on sale now.") : t("ly.home.tagline", "Casual clothes, denim first");
    },
    buttons() {
      const auds = audiencesPresent(["women", "men"]);
      const out = auds.map((a) => ({ key: a, label: shopAud(a), to: audTo(a) }));
      if (out.length < 2) out.push({ key: "all", label: t("ly.home.shopAll", "Shop all"), to: catalogueRoute() });
      return out;
    },
    dealsTo() {
      return dealsRoute();
    },
  },
  methods: { t },
};
</script>
