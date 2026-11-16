<!--
  Denimo's "Shop by" tree: the audiences that have products (Women, Men, Kids with Girls,
  Boys and Baby under it), then the type categories that have products; the open one in bold, never underlined.
  An item either goes somewhere (`to`) or filters the page in place (`pick`, search / deals / all products).
-->
<template>
  <nav :aria-label="t('dn.ls.shopBy', 'Shop by')" class="dn-ls-tree">
    <ul v-if="audiences.length" class="tr-l tr-aud">
      <li v-for="a in audiences" :key="a.id">
        <router-link :aria-current="a.on ? 'page' : undefined" :class="['tr-a', { on: a.on }]" :to="a.to"><bdi>{{ a.label }}</bdi></router-link>
        <ul v-if="a.kids && a.kids.length" class="tr-l tr-sub">
          <li v-for="k in a.kids" :key="k.id">
            <router-link :aria-current="k.on ? 'page' : undefined" :class="['tr-a', { on: k.on }]" :to="k.to"><bdi>{{ k.label }}</bdi></router-link>
          </li>
        </ul>
      </li>
    </ul>
    <ul v-if="types.length" class="tr-l tr-types">
      <li v-for="c in types" :key="c.id">
        <router-link v-if="c.to" :aria-current="c.on ? 'page' : undefined" :class="['tr-a', { on: c.on }]" :to="c.to"><bdi>{{ c.label }}</bdi></router-link>
        <button v-else :aria-pressed="c.on ? 'true' : 'false'" :class="['tr-a', { on: c.on }]" type="button" @click="$emit('pick', c.id)"><bdi>{{ c.label }}</bdi></button>
      </li>
    </ul>
  </nav>
</template>

<script>
import { t } from "../../../kalio/i18n/kalio-i18n";

export default {
  name: "DnShopBy",
  props: {
    /* [{ id, label, to, on, kids: [{ id, label, to, on }] }] */
    audiences: { type: Array, default: () => [] },
    /* [{ id, label, to | null, on }] */
    types: { type: Array, default: () => [] },
  },
  emits: ["pick"],
  methods: { t },
};
</script>
