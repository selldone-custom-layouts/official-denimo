/*
 * Denimo's product page, read from the product's own data (nothing names a product, price or category):
 *
 * - the three pickers: colour (a variant's hex), style (a value that is neither a colour nor a size: Selldone's
 *   pattern keys "{leather-text}", "Blue-White{s2}", always cleaned) and size (dn-data's sizeOfVariant);
 * - which variant a click selects: the clicked value is required, the other current choices are kept when the
 *   product has such a variant, in-stock variants first;
 * - the gallery: the chosen colour's photos first, then the product's own, then the other colours';
 * - the size and fit rows of the spec, "At a glance" from the pros, the service lines from the shop's ways;
 * - "Complete the look": other departments for the same audience.
 */
import { audienceOf, cleanValue, coloursOf, forAudience, isHex, looksLikeSize, photoUrl, sizeOfVariant, sizesOf, variantFor, variantsOf } from "../dn-data";
import { bySells, catOf, ly, money, prosOf, shopFacts, specGroups } from "../../ly";
import { t } from "../../../kalio/i18n/kalio-i18n";

/* ━━━━━━━━━━━━ A variant's three values ━━━━━━━━━━━━ */

export function hexOf(v: any): string {
  const h = String(v?.color || "").trim();
  return isHex(h) ? h.toLowerCase() : "";
}

/** The variant's value that is neither its colour nor its size (raw, as the key). */
export function styleOf(v: any): string {
  if (!v) return "";
  const parts: string[] = [];
  const put = (x: any, sizeLike: boolean) => {
    const s = String(x ?? "").trim();
    if (s && !sizeLike && cleanValue(s)) parts.push(s);
  };
  put(v.style, false);
  /* a size-like type or volume is the size (sizeOfVariant), never a style */
  put(v.type, looksLikeSize(v.type));
  put(v.volume, looksLikeSize(v.volume));
  put(v.weight, false);
  put(v.pack, false);
  return parts.join(" · ");
}

export function styleLabel(key: string): string {
  return key
    .split(" · ")
    .map((x) => cleanValue(x))
    .filter(Boolean)
    .join(" · ");
}

export interface Choice {
  key: string;
  label: string;
  stock: number;
}

/** The product's style values, in the shop's order, with their stock. */
export function stylesOf(p: any): Choice[] {
  const m = new Map<string, Choice>();
  for (const v of variantsOf(p)) {
    const k = styleOf(v);
    if (!k) continue;
    const cur = m.get(k) || { key: k, label: styleLabel(k), stock: 0 };
    cur.stock += Math.max(0, Number(v.quantity ?? 1));
    m.set(k, cur);
  }
  return [...m.values()];
}

export const inStock = (v: any) => !!v && Number(v.quantity) > 0;

/** The variant with exactly this colour, style and size (dn-data's variantFor when the product has no styles). */
export function exactVariant(p: any, hex: string, style: string, size: string): any {
  if (!stylesOf(p).length) {
    const v = variantFor(p, hex, size);
    return v && hexOf(v) === (hex || "").toLowerCase() && sizeOfVariant(v) === size ? v : null;
  }
  return variantsOf(p).find((v: any) => hexOf(v) === (hex || "").toLowerCase() && styleOf(v) === style && sizeOfVariant(v) === size) || null;
}

type Want = { hex?: string | null; style?: string | null; size?: string | null };

/** The variant a click selects: `need` must match; `keep` is kept where the product allows; in stock first. */
export function pickVariant(p: any, need: Want, keep: Want = {}): any {
  const list = variantsOf(p).filter(
    (v: any) =>
      (need.hex == null || hexOf(v) === need.hex.toLowerCase()) &&
      (need.style == null || styleOf(v) === need.style) &&
      (need.size == null || sizeOfVariant(v) === need.size),
  );
  let best: any = null;
  let score = -1;
  for (const v of list) {
    let s = 0;
    if (keep.hex != null && hexOf(v) === keep.hex.toLowerCase()) s += 8;
    if (keep.style != null && styleOf(v) === keep.style) s += 4;
    if (keep.size != null && sizeOfVariant(v) === keep.size) s += 2;
    if (inStock(v)) s += 1;
    if (s > score) {
      score = s;
      best = v;
    }
  }
  return best;
}

export interface SizeChip {
  size: string;
  /** the variant in the chosen colour and style (null when not made in it) */
  v: any;
  /** not made in this colour or style, but in stock in another: a click moves there */
  alt: any;
  out: boolean;
}

/** The product's sizes for one colour and style: sold out (struck), in stock, or in stock in another colour. */
export function sizeChips(p: any, hex: string, style: string): SizeChip[] {
  return sizesOf(p).map((s) => {
    const v = exactVariant(p, hex, style, s.size);
    const other = v ? null : pickVariant(p, { size: s.size }, { hex, style });
    const alt = other && inStock(other) ? other : null;
    return { size: s.size, v, alt, out: v ? !inStock(v) : !alt };
  });
}

export { coloursOf, sizesOf, sizeOfVariant, variantsOf };

/* ━━━━━━━━━━━━ Photos ━━━━━━━━━━━━ */

export interface Photo {
  src: string;
  thumb: string;
  alt: string;
  look: string;
}

const lookOf = (v: any) => (v ? hexOf(v) + "|" + styleOf(v) : "");

/** The gallery: the chosen colour's own photos first, then the product's, then the other colours'. */
export function photosOf(p: any, current: any): Photo[] {
  if (!p) return [];
  const byId = new Map<number, any>();
  for (const v of p.product_variants || []) byId.set(v.id, v);
  const all: Photo[] = [];
  const seen = new Set<string>();
  const put = (file: string | null | undefined, look: string, alt = "") => {
    const src = photoUrl(file);
    if (!src || seen.has(src)) return;
    seen.add(src);
    all.push({ src, thumb: photoUrl(file, 128) || src, alt: alt || p.title || "", look });
  };
  const want = lookOf(current);
  /* the chosen colour's own photo, then the main photo */
  for (const v of variantsOf(p)) if (v.image && lookOf(v) === want) put(v.image, want);
  put(p.icon, "");
  const images = [...(p.images || [])].sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0));
  for (const im of images) if (im?.path) put(im.path, im.variant_id ? lookOf(byId.get(im.variant_id)) : "", im.alt || "");
  for (const v of variantsOf(p)) if (v.image) put(v.image, lookOf(v));
  const rank = (x: Photo) => (want && x.look === want ? 0 : !x.look ? 1 : 2);
  return all
    .map((x, i) => ({ x, i }))
    .sort((a, b) => rank(a.x) - rank(b.x) || a.i - b.i)
    .map((y) => y.x)
    .slice(0, 12);
}

/* ━━━━━━━━━━━━ Spec ━━━━━━━━━━━━ */

/** A spec key without the stray direction marks some imports carry ("Department ‏"). */
export const cleanKey = (k: string) => String(k || "").replace(/[‎‏‪-‮]/g, "").trim();

function rows(p: any): [string, string][] {
  const out: [string, string][] = [];
  for (const g of specGroups(p)) for (const r of g.rows) out.push([cleanKey(r[0]), cleanValue(r[1]) || r[1]]);
  return out;
}

/** The spec rows about size and fit (Size, Size Range, Fit, Fit & Details, Waist…). */
export function sizeRows(p: any): [string, string][] {
  return rows(p).filter(([k]) => /size|fit|waist|inseam|rise|length|stretch/i.test(k) && !/package/i.test(k));
}
export function fitRows(p: any): [string, string][] {
  return rows(p).filter(([k]) => /fit|waist|inseam|rise|stretch/i.test(k));
}

/** The brand: the spec's Brand, else the product's own. */
export function brandOf(p: any): string {
  for (const [k, v] of rows(p)) if (/^brand$/i.test(k)) return v;
  return String(p?.brand || "").trim();
}

/** The spec in its groups, keys and values cleaned. */
export function specTable(p: any): { group: string; rows: [string, string][] }[] {
  return specGroups(p).map((g) => ({ group: cleanKey(g.group), rows: g.rows.map((r) => [cleanKey(r[0]), cleanValue(r[1]) || r[1]] as [string, string]) }));
}

/* ━━━━━━━━━━━━ At a glance ━━━━━━━━━━━━ */

const GLANCE: [RegExp, string][] = [
  [/material|fabric|composition|cotton|materyal|leather|denim/i, "tag"],
  [/care|wash|clean/i, "info"],
  [/import|made in|origin/i, "globe"],
  [/comfort|soft|ease/i, "heart"],
  [/closure|zip|button|strap|lace/i, "lock"],
  [/occasion|travel|everyday/i, "cal"],
  [/eco|environment|sustain/i, "gift"],
];

/** Up to three pros as small circles: an icon, the pro's name and its short text. */
export function glanceOf(p: any): { key: string; icon: string; title: string; text: string }[] {
  const pros = prosOf(p)
    .map(([a, b]) => [cleanKey(a), String(b || "").trim()] as [string, string])
    .filter(([a, b]) => (a || b) && !/department/i.test(a));
  const iconFor = (s: string) => (GLANCE.find(([re]) => re.test(s)) || [null, "check"])[1] as string;
  /* the ones a shopper looks for first (material, care, imported), then the shop's order */
  const score = (s: string) => {
    const i = GLANCE.findIndex(([re]) => re.test(s));
    return i < 0 ? 9 : i;
  };
  return pros
    .map((x, i) => ({ x, i }))
    .sort((a, b) => score(a.x[0]) - score(b.x[0]) || a.i - b.i)
    .slice(0, 3)
    .map(({ x }, i) => ({ key: i + x[0], icon: iconFor(x[0] + " " + x[1]), title: x[0], text: x[1].length > 60 ? x[1].slice(0, 58).replace(/[\s,;.]+\S*$/, "") + "…" : x[1] }));
}

/* ━━━━━━━━━━━━ Service lines ━━━━━━━━━━━━ */

export interface ServiceLine {
  key: string;
  icon: string;
  title: string;
  line: string;
}

/** Each delivery way with its days and windows, the pickup, then the product's returns or warranty. */
export function serviceLines(shop: any, p: any): ServiceLine[] {
  const f = shopFacts(shop);
  const out: ServiceLine[] = [];
  const fee = (w: any) => (w.free || !w.fee ? t("dn.pd.free", "Free") : money(w.fee));
  for (const w of f.ways) {
    if (w.pickup) {
      const pt = w.pickups?.[0];
      out.push({
        key: "pick-" + w.id,
        icon: "store",
        title: w.free || !w.fee ? t("dn.pd.freePickup", "Free pickup") : `${t("dn.pd.pickup", "Pickup")} · ${fee(w)}`,
        line: [pt?.name, pt?.address].filter(Boolean).join(" · ") || f.pickupNote || t("dn.pd.pickupLine", "Order online, pick it up at the store."),
      });
    } else {
      const days = w.days.length >= 7 || (!w.days.length && f.everyDay) ? t("dn.pd.everyDay", "Every day") : w.days.length ? t("dn.pd.daysWeek", { one: "{n} day a week", other: "{n} days a week" }, { n: w.days.length }) : "";
      out.push({
        key: "way-" + w.id,
        icon: w.type === "Global" || w.type === "Post" ? "plane" : "bike",
        title: `${w.title} · ${fee(w)}`,
        line: [days, w.windows.join(", "), w.freeOver ? t("dn.pd.freeOver", "Free over {amount}", { amount: money(w.freeOver, true) }) : ""].filter(Boolean).join(" · "),
      });
    }
  }
  const back = Number(p?.return_warranty) || 0;
  if (back > 0) out.push({ key: "ret", icon: "box", title: t("dn.pd.returnsN", "{n}-day returns", { n: back }), line: t("dn.pd.returnsLine", "Changed your mind? Send it back within {n} days.", { n: back }) });
  /* the warranty in the shop's words: a bare number says nothing, and "30 Days" equal to the returns window is
     already said; "One-Year Warranty" stands alone, anything else reads "Warranty: …" */
  const w = String(p?.warranty || "").trim();
  const days = w.match(/^(\d+)\s*days?$/i);
  if (w && !/^\d+([.,]\d+)?$/.test(w) && !(days && Number(days[1]) === back)) {
    out.push({ key: "war", icon: "check", title: /warrant|guarantee|protection|cover/i.test(w) ? w : t("dn.pd.warranty", "Warranty: {w}", { w }), line: "" });
  }
  return out;
}

/* ━━━━━━━━━━━━ Below the fold ━━━━━━━━━━━━ */

/** "Complete the look": the best seller (in stock) of up to four other departments, for the same audience. */
export function lookFor(p: any, n = 4): any[] {
  if (!p) return [];
  const aud = audienceOf(p);
  const pool = bySells(ly.products.filter((x) => x.id !== p.id && x.category_id !== p.category_id && x.quantity > 0 && forAudience(x, aud)));
  const out: any[] = [];
  const used = new Set<number>();
  for (const x of pool) {
    if (used.has(x.category_id)) continue;
    used.add(x.category_id);
    out.push(x);
    if (out.length === n) break;
  }
  /* a shop with few departments: fill from the same pool */
  for (const x of pool) {
    if (out.length >= Math.min(n, 3)) break;
    if (!out.includes(x)) out.push(x);
  }
  return out.length >= 2 ? out : [];
}

/** The department of a product (its own category record, else the shop's). */
export function deptOf(p: any): any {
  return p?.category || catOf(p?.category_id);
}

/** The names of a product's colours ("Burnt orange, Navy"), for a card's line. */
export function colourWords(p: any): string {
  return coloursOf(p)
    .map((c) => c.name)
    .slice(0, 3)
    .join(", ");
}

/* ━━━━━━━━━━━━ Size ladders (general, not the shop's) ━━━━━━━━━━━━ */

export interface Ladder {
  key: string;
  title: string;
  head: string[];
  rows: string[][];
}

/** The general ladders that fit a product's sizes: letters, EU shoes, kids' years, baby months. */
export function laddersFor(sizes: string[]): Ladder[] {
  const out: Ladder[] = [];
  const has = (re: RegExp) => sizes.some((s) => re.test(s));
  const cm = t("dn.sz.cm", "cm");
  if (has(/^(X{0,3}S|M|X{0,3}L|\dXL)$/i) || !sizes.length)
    out.push({
      key: "adult",
      title: t("dn.sz.adultT", "Clothing sizes"),
      head: [t("dn.sz.size", "Size"), t("dn.sz.us", "US"), t("dn.sz.eu", "EU"), `${t("dn.sz.chest", "Chest / bust")} (${cm})`, `${t("dn.sz.waist", "Waist")} (${cm})`, `${t("dn.sz.hips", "Hips")} (${cm})`],
      rows: [
        ["XS", "0–2", "32–34", "80–84", "62–66", "86–90"],
        ["S", "4–6", "36–38", "85–89", "67–71", "91–95"],
        ["M", "8–10", "40–42", "90–95", "72–77", "96–101"],
        ["L", "12–14", "44–46", "96–102", "78–84", "102–108"],
        ["XL", "16–18", "48–50", "103–110", "85–92", "109–116"],
      ],
    });
  if (has(/^(3[5-9]|4[0-7])$/))
    out.push({
      key: "shoes",
      title: t("dn.sz.shoesT", "Shoe sizes"),
      head: [t("dn.sz.eu", "EU"), t("dn.sz.uk", "UK"), t("dn.sz.usM", "US men"), t("dn.sz.usW", "US women"), `${t("dn.sz.foot", "Foot length")} (${cm})`],
      rows: [
        ["36", "3.5", "4.5", "6", "22.5"],
        ["37", "4", "5", "6.5", "23.5"],
        ["38", "5", "6", "7.5", "24"],
        ["39", "6", "7", "8.5", "25"],
        ["40", "6.5", "7.5", "9", "25.5"],
        ["41", "7.5", "8.5", "10", "26"],
        ["42", "8", "9", "10.5", "26.5"],
        ["43", "9", "10", "11.5", "27.5"],
        ["44", "9.5", "10.5", "12", "28"],
        ["45", "10.5", "11.5", "13", "29"],
      ],
    });
  if (has(/^(2[6-9]|3[0-5])$/))
    out.push({
      key: "kshoes",
      title: t("dn.sz.kidShoesT", "Kids’ shoe sizes"),
      head: [t("dn.sz.eu", "EU"), t("dn.sz.uk", "UK"), t("dn.sz.us", "US"), `${t("dn.sz.foot", "Foot length")} (${cm})`],
      rows: [
        ["28", "10", "11", "17"],
        ["29", "11", "12", "17.5"],
        ["30", "11.5", "12.5", "18.5"],
        ["31", "12.5", "13.5", "19"],
        ["32", "13", "1", "20"],
        ["33", "1", "2", "20.5"],
        ["34", "2", "3", "21.5"],
        ["35", "2.5", "3.5", "22"],
      ],
    });
  if (has(/^\d+\s*Y/i))
    out.push({
      key: "kids",
      title: t("dn.sz.kidsT", "Kids’ sizes"),
      head: [t("dn.sz.age", "Age"), `${t("dn.sz.height", "Height")} (${cm})`, `${t("dn.sz.chest", "Chest / bust")} (${cm})`],
      rows: [
        ["2Y", "86–92", "52–53"],
        ["3Y", "92–98", "53–55"],
        ["4Y", "98–104", "55–57"],
        ["5Y", "104–110", "57–59"],
        ["6Y", "110–116", "59–61"],
      ],
    });
  if (has(/^\d+\s*[–-]?\s*\d*\s*M$/i))
    out.push({
      key: "baby",
      title: t("dn.sz.babyT", "Baby sizes"),
      head: [t("dn.sz.age", "Age"), `${t("dn.sz.height", "Height")} (${cm})`, `${t("dn.sz.weight", "Weight")} (${t("dn.sz.kg", "kg")})`],
      rows: [
        ["0–3M", "56–62", "3.5–6"],
        ["3–6M", "62–68", "6–8"],
        ["6–12M", "68–80", "8–10"],
        ["12–18M", "80–86", "10–12"],
        ["18–24M", "86–92", "12–13.5"],
      ],
    });
  return out;
}
