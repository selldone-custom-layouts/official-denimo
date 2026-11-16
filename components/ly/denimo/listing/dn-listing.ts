/*
 * Denimo's listing helpers (the category page, search, deals, all products and the card), read from the shop's
 * live data only, on top of dn-data.ts (audiences, sizes, colours, clean variant values):
 *
 * - the audience asked for in the address (?aud=women…), else the audience of an empty audience category;
 * - Brand, Material and Fit from the product (its brand, then the spec), for the filters;
 * - "New" (created in the last 30 days), the second photo (another colour's own photo), the variant a quick-add
 *   puts in the bag (the size picked, in the first colour that has it in stock).
 */
import { coloursOf, colourName, cleanValue, isHex, normSize, sizeOfVariant, sizesOf, variantsOf } from "../dn-data";
import { shopText } from "../../../kalio/i18n/shop-data";

/** The audiences the address may ask for. */
export const AUD_IDS = ["women", "men", "girls", "boys", "baby", "kids"];

/** ?aud=women -> "women"; anything else -> "". */
export function audFromQuery(v: any): string {
  const s = String(Array.isArray(v) ? v[0] : v || "").toLowerCase().trim();
  return AUD_IDS.includes(s) ? s : "";
}

/* ━━━━━━━━━━━━ Spec facets ━━━━━━━━━━━━ */

/** A spec key without Selldone's invisible marks ("Department ‏" -> "department"). */
function keyName(k: string): string {
  return String(k || "")
    .replace(/[^\p{L}\p{N} &]/gu, "")
    .trim()
    .toLowerCase();
}

const FACET_KEYS: Record<string, string[]> = {
  brand: ["brand"],
  material: ["material", "materials"],
  fit: ["fit"],
};

/** A value worth a filter row: a short word, never a paragraph or an object. */
function facetWord(v: any): string {
  if (v == null || typeof v === "object") return "";
  const s = cleanValue(v).replace(/\s+/g, " ").trim();
  return s && s.length <= 60 ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

const facetCache = new WeakMap<object, Record<string, string[]>>();
/** The product's Brand / Material / Fit values (brand: the product's own brand first). */
export function facetOf(p: any, facet: string): string[] {
  if (!p) return [];
  let m = facetCache.get(p);
  if (!m) {
    m = {};
    for (const f of Object.keys(FACET_KEYS)) {
      const out = new Set<string>();
      if (f === "brand") {
        const b = facetWord(p.brand);
        if (b) out.add(b);
      }
      /* match the English spec names; show the value in the visitor's language (shop-data.ts) */
      const en = p._spec_en || p.spec;
      const spec = en && typeof en === "object" ? en : {};
      for (const k of Object.keys(spec)) {
        if (spec[k] === "group" || !FACET_KEYS[f].includes(keyName(k))) continue;
        for (const v of ([] as any[]).concat(spec[k])) {
          const w = facetWord(shopText(v));
          if (w) out.add(w);
        }
      }
      m[f] = [...out];
    }
    facetCache.set(p, m);
  }
  return m[facet] || [];
}

/** Every value of a facet across products, alphabetical, case-folded. */
export function facetValues(list: any[], facet: string): string[] {
  const seen = new Map<string, string>();
  for (const p of list) for (const v of facetOf(p, facet)) if (!seen.has(v.toLowerCase())) seen.set(v.toLowerCase(), v);
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

/** Does the product carry one of the picked values of a facet? */
export function hasFacet(p: any, facet: string, picked: string[]): boolean {
  const low = picked.map((x) => x.toLowerCase());
  return facetOf(p, facet).some((v) => low.includes(v.toLowerCase()));
}

/* ━━━━━━━━━━━━ Sizes and colours across a list ━━━━━━━━━━━━ */

/** The colours of a list, one per name ("Black" once, whatever its hexes), in first-seen order. */
export function colourFacet(list: any[]): { name: string; hex: string }[] {
  const m = new Map<string, { name: string; hex: string }>();
  for (const p of list) for (const c of coloursOf(p)) if (!m.has(c.name)) m.set(c.name, { name: c.name, hex: c.hex });
  return [...m.values()];
}

export function hasColour(p: any, names: string[]): boolean {
  return coloursOf(p).some((c) => names.includes(c.name));
}

export function hasSize(p: any, sizes: string[]): boolean {
  return sizesOf(p).some((s) => sizes.includes(s.size));
}

/* ━━━━━━━━━━━━ The card ━━━━━━━━━━━━ */

const DAY = 864e5;
/** Created in the last `days` days. */
export function isNew(p: any, days = 30): boolean {
  const at = Date.parse(String(p?.created_at || ""));
  return Number.isFinite(at) && Date.now() - at < days * DAY;
}

/** The hover photo: another colour's own photo (never the main one). */
export function secondPhoto(p: any): string | null {
  const main = String(p?.icon || "");
  for (const c of coloursOf(p)) if (c.image && c.image !== main) return c.image;
  for (const v of variantsOf(p)) if (v.image && v.image !== main) return v.image;
  return null;
}

const inStock = (v: any) => Number(v?.quantity ?? 0) > 0;

/** The variant a quick-add puts in the bag: that size in the first colour (shop's order) that has it in stock. */
export function quickVariant(p: any, size: string): any {
  const list = variantsOf(p);
  const ofSize = size ? list.filter((v) => sizeOfVariant(v) === size) : list;
  const order = coloursOf(p).map((c) => c.hex.toLowerCase());
  const rank = (v: any) => {
    const i = order.indexOf(String(v.color || "").toLowerCase());
    return i < 0 ? 999 : i;
  };
  return [...ofSize].sort((a, b) => rank(a) - rank(b)).find(inStock) || null;
}

/** "M · Black", "Leather text · Brown": a variant as words (sizes and pattern keys cleaned). */
export function variantWords(v: any): string {
  if (!v) return "";
  const size = sizeOfVariant(v);
  const other = [v.type, v.volume, v.style].map(cleanValue).filter((x) => x && normSize(x) !== size);
  const parts = [size, ...other, isHex(v.color) ? colourName(v.color) : cleanValue(v.color)];
  return [...new Set(parts.filter(Boolean))].join(" · ");
}
