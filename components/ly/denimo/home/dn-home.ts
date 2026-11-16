/*
 * Denimo's home sections share the base's home mixin (home-data.ts: the shop, its facts, the catalogue, prices) plus
 * this one: the departments that really have products (an empty audience folder is never a department), the
 * audiences present, routes filtered by audience, and banner photos found by the department's slug
 * (skins/<name>/photos/split-<slug>.webp, wide-<slug>.webp, wide-<slug>-phone.webp). A department without its
 * banner photo simply has no banner, so a cloned shop never shows an empty frame.
 */
import { catTitle, catTo, inCat, ly, mixed } from "../../ly";
import { slotPhoto, slugOf } from "../../ly-photos";
import { catalogueRoute, dealsRoute } from "../../../kalio/kalio-catalog";
import { t } from "../../../kalio/i18n/kalio-i18n";
import { audienceLabel, audienceOfCategory, forAudience } from "../dn-data";

export function departments(): any[] {
  if (!ly.ready) return [];
  return ly.cats.filter((c: any) => !audienceOfCategory(c) && inCat(c.id).length);
}

export function slugsOf(c: any): string[] {
  return [...new Set([String(c?.name || ""), slugOf(c?.name), slugOf(catTitle(c)), slugOf(catTitle(c)).replace(/-and-/g, "-")].filter(Boolean))];
}

/** The department's banner photo for a prefix ("split", "wide"), else null. */
export function bannerOf(prefix: string, c: any, suffix = ""): string | null {
  for (const s of slugsOf(c)) {
    const u = slotPhoto(`${prefix}-${s}${suffix}`);
    if (u) return u;
  }
  return null;
}

export function audiencesPresent(list: string[] = ["women", "men", "girls", "boys", "baby"]): string[] {
  return list.filter((a) => ly.products.some((p: any) => forAudience(p, a)));
}

export function audTo(a: string, sort = "") {
  return catalogueRoute(sort ? { sort, aud: a } : { aud: a });
}
export function audCatTo(a: string, c: any) {
  return { ...catTo(c), query: { aud: a } };
}
export function audDealsTo(a: string) {
  const d = dealsRoute();
  return { ...d, query: { ...d.query, aud: a } };
}
export function shopAud(a: string): string {
  return t("dn.home.shopAud", "Shop {aud}", { aud: audienceLabel(a) });
}

/** Up to n products, the categories mixed (never one department in a whole row). */
export function spread(list: any[], n: number): any[] {
  return mixed(list).slice(0, n);
}
