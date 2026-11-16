<!--
  - Copyright (c) 2023. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!--
    Denimo's product page: the breadcrumb (the department chain, the audience when the
    product has one, the name), then the gallery mosaic and the sticky buy column with its accordions
    (LyProductOverview, LyProductTabs); the product's own story when it has one; Selldone's own sections for
    other kinds of product (offers, includes, files, membership, a product landing page) when it has them;
    "Complete the look" (other departments, same audience: LyTogether); "More <department>" (five, never this
    one); "Recently viewed" (this browser only, hidden when empty); the departments as capsules.
  -->
  <div class="ly ly-pdp s--product dn-pdp">
    <slot name="header" :center="true"></slot>
    <nav :aria-label="t('ly.pt.crumbs', 'Breadcrumb')" class="wrap dn-pd-crumbs">
      <ol>
        <li>
          <router-link :to="{ path: '/' }">{{ t("ly.pt.home", "Home") }}</router-link>
        </li>
        <li v-for="(c, i) in crumbs" :key="i">
          <router-link v-if="c.to" :to="c.to"><bdi>{{ c.label }}</bdi></router-link>
          <span v-else aria-current="page"><bdi>{{ c.label }}</bdi></span>
        </li>
      </ol>
    </nav>

    <ly-product-overview v-if="product" :key="product.id" can-buy show-cover />
    <section v-else aria-hidden="true" class="dn-pd dn-pd-skel">
      <div class="wrap dn-pd-in">
        <div class="dn-pd-gal"><i></i><i></i></div>
        <div class="dn-pd-side"><i class="-a"></i><i class="-b"></i><i class="-c"></i><i class="-d"></i><i class="-e"></i></div>
      </div>
    </section>

    <template v-if="product">
      <section v-if="story" aria-labelledby="dn-pd-story-h" class="dn-pd-story">
        <div class="wrap">
          <h2 id="dn-pd-story-h" class="dn-pd-sec-h">{{ t("dn.pd.storyH", "About this style") }}</h2>
          <div class="dn-pd-story-b ly-pd-article" v-html="story"></div>
        </div>
      </section>

      <div class="wrap ly-pd-sd">
        <s-product-offers class="s--product-section"></s-product-offers>
        <s-product-includes></s-product-includes>
        <s-product-files-list></s-product-files-list>
        <s-product-subscription-membership></s-product-subscription-membership>
      </div>
      <s-product-landing></s-product-landing>

      <ly-together :product="product" />

      <section v-if="more.length" aria-labelledby="dn-pd-more-h" class="dn-pd-rail-s">
        <div class="wrap">
          <div class="dn-pd-rail-hd">
            <h2 id="dn-pd-more-h" class="dn-pd-sec-h">{{ t("dn.pd.moreH", "More {name}", { name: catTitle(cat) }) }}</h2>
            <router-link v-if="cat" :to="catTo(cat)" class="dn-pd-rail-all">{{ t("dn.pd.shopAll", "Shop all") }}<ly-icon name="right" /></router-link>
          </div>
          <div class="dn-pd-rail">
            <ly-card v-for="p in more" :key="p.id" :product="p" no-cat />
          </div>
        </div>
      </section>

      <section v-if="recent.length" aria-labelledby="dn-pd-recent-h" class="dn-pd-rail-s -recent">
        <div class="wrap">
          <div class="dn-pd-rail-hd">
            <h2 id="dn-pd-recent-h" class="dn-pd-sec-h">{{ t("dn.pd.recentH", "Recently viewed") }}</h2>
          </div>
          <div class="dn-pd-rail">
            <ly-card v-for="p in recent" :key="p.id" :product="p" no-cat />
          </div>
        </div>
      </section>

      <nav v-if="depts.length" :aria-label="t('dn.pd.deptsAria', 'Departments')" class="wrap dn-pd-depts">
        <router-link v-for="d in depts" :key="d.key" :to="d.to" class="dn-pd-cap -soft"><bdi>{{ d.label }}</bdi></router-link>
      </nav>
    </template>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import LyIcon from "../../components/ly/LyIcon.vue";
import LyCard from "../../components/ly/ui/LyCard.vue";
import LyProductOverview from "../../components/ly/product/LyProductOverview.vue";
import LyTogether from "../../components/ly/product/LyTogether.vue";
import { bySells, catOf, catTitle, catTo, inCat, ly, loadDm } from "../../components/ly/ly";
import { rememberViewed, viewedIds } from "../../components/bakini/bakini";
import { audienceLabel, audienceOf, audienceOfCategory } from "../../components/ly/denimo/dn-data";
import { t } from "../../components/kalio/i18n/kalio-i18n";
import { GtagEcommerce } from "@selldone/components-vue/plugins/gtag/GtagEcommerce";
import SProductIncludes from "@selldone/components-vue/storefront/product/includes/SProductIncludes.vue";
import SProductFilesList from "@selldone/components-vue/storefront/product/file/list/SProductFilesList.vue";
import SProductSubscriptionMembership from "@selldone/components-vue/storefront/product/subscription/membership/SProductSubscriptionMembership.vue";
import SProductOffers from "@selldone/components-vue/storefront/product/offers/SProductOffers.vue";
import { computed } from "vue";
import SProductAdminButton from "@selldone/components-vue/storefront/product/admin/button/SProductAdminButton.vue";
import { XapiProductGetTypes } from "@selldone/sdk-storefront/product";
import SProductLanding from "@selldone/components-vue/storefront/product/landing/SProductLanding.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import { StorefrontSeo } from "../../helpers/StorefrontSeo";

export default {
  name: "StorefrontPageProduct",
  mixins: [CurrencyMixin],

  inject: ["$shop"],
  props: {},
  components: {
    LyIcon,
    LyCard,
    LyProductOverview,
    LyTogether,
    SProductLanding,
    SProductAdminButton,
    SProductOffers,
    SProductSubscriptionMembership,
    SProductFilesList,
    SProductIncludes,
  },

  /* The product and the chosen variant, for Selldone's sections. */
  provide() {
    return {
      $product: computed(() => this.product),
      $variant: computed(() => this.current_variant),
    };
  },

  data: function () {
    return {
      product: null,
      busy: false,
      ly,
    };
  },

  computed: {
    current_variant() {
      return this.$store.getters.getCurrentSelectedVariant;
    },
    cat() {
      return this.product ? this.product.category || catOf(this.product.category_id) : null;
    },
    /* The department chain (its parents first), the audience when the product has one (that department for
       that audience), then the name. */
    crumbs() {
      const out: any[] = [];
      const chain: any[] = [];
      let c = this.cat;
      for (let i = 0; c && i < 6; i++) {
        chain.unshift(c);
        c = c.parent || (c.parent_id ? catOf(c.parent_id) : null);
      }
      for (const x of chain) out.push({ to: catTo(x), label: catTitle(x) });
      const aud = this.product ? audienceOf(this.product) : "";
      if (aud && this.cat) {
        const to: any = catTo(this.cat);
        out.push({ to: { ...to, query: { ...(to.query || {}), aud } }, label: audienceLabel(aud) });
      }
      if (this.product) out.push({ label: this.product.title });
      return out;
    },
    /* The product's own article, when it says something. */
    story() {
      const body = this.product?.article_pack?.article?.body;
      return body && String(body).replace(/<[^>]*>/g, "").trim() ? body : null;
    },
    /* Five more of the same department, best sellers first, never this one. */
    more() {
      if (!this.product) return [];
      return bySells(this.ly.products.filter((p) => p.category_id === this.product.category_id && p.id !== this.product.id)).slice(0, 5);
    },
    /* What this browser opened before (this product left out), from the live catalogue. */
    recent() {
      if (!this.product) return [];
      void this.ly.products.length;
      const ids = viewedIds().filter((id) => id !== this.product.id);
      return ids
        .map((id) => this.ly.products.find((p) => p.id === id))
        .filter(Boolean)
        .slice(0, 5);
    },
    /* The departments with products, as capsules (the audience kept when the product has one). */
    depts() {
      if (!this.product) return [];
      const aud = audienceOf(this.product);
      return this.ly.cats
        .filter((c) => !audienceOfCategory(c) && c.id !== this.product.category_id && inCat(c.id).length)
        .map((c) => {
          const to: any = catTo(c);
          return { key: c.id, label: catTitle(c), to: aud ? { ...to, query: { ...(to.query || {}), aud } } : to };
        });
    },
  },

  watch: {
    $route() {
      this.getProduct();
    },
  },

  created() {
    loadDm();
    this.getProduct();
  },

  methods: {
    t,
    catTitle,
    catTo,

    getProduct() {
      const seoNavigation = StorefrontSeo.captureNavigation();
      const handleSuccessResponse = ({ product }: XapiProductGetTypes.IResponse) => {
        this.product = product;
        rememberViewed(product.id);

        GtagEcommerce.MeasuringViewsOfProductDetails(this.$shop, product, this.GetUserSelectedCurrency().code, "product-page");

        // Reject initial-load and superseded responses, including SDK cache callbacks.
        StorefrontSeo.updateProduct(product, this.$shop, seoNavigation, this.GetUserSelectedCurrency().code);
      };

      if (window.PRE_LOADED_DATA?.PRODUCT_PACK) {
        console.log("⚡ Turbo load product.");
        handleSuccessResponse(window.PRE_LOADED_DATA.PRODUCT_PACK);
        window.PRE_LOADED_DATA = null; // Clear!
      } else {
        this.busy = true;
      }

      window.$storefront.products
        .optimize(60)
        .get(this.getId(this.$route.params.product_id), {
          "augmented-categories": 3, // Return 3 categories in the parent folder of current category
          "augmented-cross-sells": true, // Return max 3 cross-selling items
        })
        .cache(handleSuccessResponse)
        .then(handleSuccessResponse)
        .catch((e) => {
          NotificationService.showLaravelError(e);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
