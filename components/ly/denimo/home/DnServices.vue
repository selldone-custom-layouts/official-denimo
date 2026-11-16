<!--
  Three service cards (sections.json "services"), from the shop's own
  facts only: pickup (free or its fee), the local delivery (its days and windows), returns (when four in five products
  name the same number of days), else how to pay, else "Write to us". Never a claim the shop does not make.
-->
<template>
  <section v-if="ready && cards.length" :aria-label="t('dn.home.services', 'Services')" :class="['dnh-svc', { band }]">
    <div class="wrap">
      <ul class="dnh-svc-in">
        <li v-for="c in cards" :key="c.k">
          <component :is="c.to ? 'router-link' : 'div'" :to="c.to" class="dnh-svc-c">
            <span class="dnh-svc-i"><ly-icon :name="c.icon" /></span>
            <span class="dnh-svc-t"><b>{{ c.title }}</b><span>{{ c.text }}</span></span>
          </component>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import LyIcon from "../../LyIcon.vue";
import homeData from "../../home/home-data";
import { money } from "../../ly";
import { t } from "../../../kalio/i18n/kalio-i18n";

export default {
  name: "DnServices",
  components: { LyIcon },
  mixins: [homeData],
  computed: {
    returnsDays() {
      const ps = this.products;
      const count = new Map();
      for (const p of ps) {
        const m = String(p.warranty || p.return_warranty || "").match(/(\d+)\s*day/i);
        if (m) count.set(Number(m[1]), (count.get(Number(m[1])) || 0) + 1);
      }
      const top = [...count.entries()].sort((a, b) => b[1] - a[1])[0];
      return top && ps.length && top[1] >= ps.length * 0.8 ? top[0] : 0;
    },
    cards() {
      const f = this.facts;
      const out = [];
      if (f.pickup) out.push({ k: "pick", icon: "store", title: f.pickup.free ? t("dn.svc.pickFree", "Free pickup") : t("ly.strip.pickupT", "Pickup at the store"), text: f.pickup.free ? t("dn.svc.pickP", "Order online, collect it at the store.") : t("dn.svc.pickFee", "Collect it at the store for {fee}.", { fee: money(f.pickup.fee) }) });
      if (f.courier) {
        const w = f.courier.windows;
        out.push({ k: "cour", icon: "bike", title: f.courier.free ? t("dn.svc.courFree", "Free local delivery") : t("dn.svc.cour", "Local delivery"), text: w.length ? t("dn.svc.courP", "{days}, in the window you choose: {windows}.", { days: f.courier.days.length === 7 ? t("dn.svc.everyDay", "Every day") : t("dn.svc.days", "{n} days a week", { n: f.courier.days.length }), windows: w.join(", ") }) : t("dn.svc.courP0", "Brought to your door.") });
      }
      if (this.returnsDays) out.push({ k: "ret", icon: "box", title: t("dn.svc.ret", "{n}-day returns", { n: this.returnsDays }), text: t("dn.svc.retP", "Not the right fit? Send it back within {n} days.", { n: this.returnsDays }) });
      else if (f.gateway) out.push({ k: "pay", icon: "cash", title: f.gateway.name, text: f.gateway.description || "" });
      if (out.length < 3) out.push({ k: "chat", icon: "chat", title: t("dn.svc.chat", "Questions?"), text: t("dn.svc.chatP", "Write to us, we answer every message."), to: { name: window.$storefront.routes.SHOP_CONTACT_US } });
      return out.slice(0, 3);
    },
  },
};
</script>
