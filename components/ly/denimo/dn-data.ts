/*
 * Denimo's clothing helpers, read from the shop's live data only (nothing names a product, price or category):
 *
 * - the audience of a product (women, men, girls, boys, baby): its tags first (women / men / girls / boys / baby /
 *   unisex / kids), else words in its title, else its spec "Department"; "" = for everyone;
 * - the audience categories a shop may keep empty (Women, Men, Girls, Boys, Baby): their products are the ones whose
 *   audience matches, so a menu link to them never opens an empty page;
 * - sizes: a variant's `type` and `volume` (Selldone keeps sizes in either), normalised ("s" -> "S", "xxl" -> "XXL")
 *   and ordered on one ladder (XXS…XXXL, 0–3M…24M, 2Y…16Y, then numbers);
 * - colours: a variant's hex with a readable name (nearest of a short table), its own photo when it has one;
 * - pattern keys ("{leather-text}", "Blue-White{s2}") are never printed raw: cleanValue() drops the braces.
 */
import { t } from "../../kalio/i18n/kalio-i18n";

export type Audience = "women" | "men" | "girls" | "boys" | "baby" | "";

export const AUDIENCES: { id: Exclude<Audience, "">; key: string; en: string }[] = [
  { id: "women", key: "dn.aud.women", en: "Women" },
  { id: "men", key: "dn.aud.men", en: "Men" },
  { id: "girls", key: "dn.aud.girls", en: "Girls" },
  { id: "boys", key: "dn.aud.boys", en: "Boys" },
  { id: "baby", key: "dn.aud.baby", en: "Baby" },
];
/** The "Kids" group of the menu. */
export const KIDS: Audience[] = ["girls", "boys", "baby"];

export function audienceLabel(a: string): string {
  const x = AUDIENCES.find((y) => y.id === a);
  return x ? t(x.key, x.en) : a === "kids" ? t("dn.aud.kids", "Kids") : "";
}

const norm = (s: any) => String(s || "").toLowerCase();

function fromWords(s: string): Audience | "kids" {
  const x = " " + norm(s).replace(/[^a-z']+/g, " ") + " ";
  if (/ (baby|babies|infant|infants|newborn|newborns|toddler|toddlers) /.test(x)) return "baby";
  if (/ (girl|girls|girl's|girls') /.test(x)) return "girls";
  if (/ (boy|boys|boy's|boys') /.test(x)) return "boys";
  if (/ (kid|kids|kid's|children|child|youth|junior) /.test(x)) return "kids";
  if (/ (women|woman|women's|womens|ladies|lady) /.test(x)) return "women";
  if (/ (men|man|men's|mens) /.test(x)) return "men";
  return "";
}

function specDept(p: any): string {
  /* the English spec (shop-data.ts keeps it when the visitor reads another language) */
  const s = p?._spec_en || p?.spec || {};
  for (const k of Object.keys(s)) if (/^\s*department/i.test(k.replace(/[^\w ]/g, ""))) return [].concat(s[k]).join(" ");
  return "";
}

const cache = new WeakMap<object, Audience | "kids">();
/** "women", "men", "girls", "boys", "baby", "kids" (a child, girl or boy unknown) or "" (everyone). */
export function audienceOf(p: any): Audience | "kids" {
  if (!p) return "";
  if (cache.has(p)) return cache.get(p)!;
  let a: Audience | "kids" = "";
  const tags: string[] = (p.tags || []).map((x: any) => norm(typeof x === "string" ? x : x?.tag || x?.name));
  for (const tg of tags) {
    if (["women", "men", "girls", "boys", "baby", "kids"].includes(tg)) {
      a = tg as any;
      break;
    }
  }
  if (!a) a = fromWords(p.title) || fromWords(specDept(p));
  cache.set(p, a);
  return a;
}

/** Does product p belong to audience a ("kids" takes girls, boys, baby and kids; "" takes everything)? */
export function forAudience(p: any, a: string): boolean {
  if (!a) return true;
  const x = audienceOf(p);
  if (a === "kids") return x === "kids" || KIDS.includes(x as Audience);
  if (a === "girls" || a === "boys") return x === a || x === "kids";
  return x === a;
}

/** An audience category (an empty "Women" folder the shop keeps): its audience id, else "". */
export function audienceOfCategory(c: any): string {
  const k = norm(c?.name || c?.title).replace(/[^a-z]+/g, "-");
  if (/^(women|womens|ladies)$/.test(k)) return "women";
  if (/^(men|mens)$/.test(k)) return "men";
  if (/^(girls?)$/.test(k)) return "girls";
  if (/^(boys?)$/.test(k)) return "boys";
  if (/^(baby|babies|baby-girls|baby-boys|infants?)$/.test(k)) return "baby";
  if (/^(kids|children)$/.test(k)) return "kids";
  return "";
}

/* ━━━━━━━━━━━━ Values ━━━━━━━━━━━━ */

/** A variant value without Selldone's pattern keys: "{leather-text}" -> "Leather text", "Blue-White{s2}" -> "Blue-White". */
export function cleanValue(v: any): string {
  const s = String(v ?? "").trim();
  if (!s) return "";
  const inner = s.match(/^\{([^}]*)\}$/);
  if (inner) {
    const w = inner[1].replace(/[-_]+/g, " ").trim();
    return w ? w.charAt(0).toUpperCase() + w.slice(1) : "";
  }
  return s.replace(/\{[^}]*\}/g, "").trim();
}
export function isPatternKey(v: any): boolean {
  return /\{[^}]*\}/.test(String(v ?? ""));
}

/* ━━━━━━━━━━━━ Sizes ━━━━━━━━━━━━ */

const LETTERS = ["XXXS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL"];
const ONE = /^(one ?size|os|free ?size)$/i;

export function normSize(v: any): string {
  let s = cleanValue(v);
  if (!s) return "";
  if (/^(x{0,3}[sml]|x{1,3}l|\dxl)$/i.test(s)) s = s.toUpperCase();
  if (s === "X") s = "XL";
  return s.replace(/\s*[–—-]\s*/g, "–");
}

function sizeRank(s: string): number {
  const i = LETTERS.indexOf(s.toUpperCase());
  if (i >= 0) return 100 + i;
  const m = s.match(/^(\d+)\s*[–-]?\s*(\d*)\s*M$/i);
  if (m) return 200 + Number(m[2] || m[1]);
  const y = s.match(/^(\d+)\s*Y/i);
  if (y) return 300 + Number(y[1]);
  const n = parseFloat(s.replace(",", "."));
  if (!isNaN(n)) return 400 + n;
  if (ONE.test(s)) return 50;
  return 900;
}
export function sortSizes(list: string[]): string[] {
  return [...new Set(list.filter(Boolean))].sort((a, b) => sizeRank(a) - sizeRank(b) || a.localeCompare(b));
}

/** Is this value a size (not a colour word or a pattern)? */
export function looksLikeSize(v: any): boolean {
  const s = normSize(v);
  return !!s && !isPatternKey(v) && sizeRank(s) < 900;
}

/** The variants that can be bought (enabled), with their size and colour read once. */
export function variantsOf(p: any): any[] {
  const list = (p?.product_variants?.length ? p.product_variants : p?.variants) || [];
  return list.filter((v: any) => v && v.enable !== false);
}
export function sizeOfVariant(v: any): string {
  if (looksLikeSize(v?.type)) return normSize(v.type);
  if (looksLikeSize(v?.volume)) return normSize(v.volume);
  return "";
}
/** The product's sizes in ladder order, each with stock (any colour). */
export function sizesOf(p: any): { size: string; stock: number }[] {
  const m = new Map<string, number>();
  for (const v of variantsOf(p)) {
    const s = sizeOfVariant(v);
    if (s) m.set(s, (m.get(s) || 0) + Math.max(0, Number(v.quantity ?? 1)));
  }
  return sortSizes([...m.keys()]).map((size) => ({ size, stock: m.get(size)! }));
}

/* ━━━━━━━━━━━━ Colours ━━━━━━━━━━━━ */

const NAMES: [string, string][] = [
  ["#000000", "Black"], ["#1c1c1c", "Jet black"], ["#3b3b3b", "Charcoal"], ["#6e6e6e", "Grey"], ["#a8a8a8", "Light grey"], ["#d9d9d9", "Silver"],
  ["#ffffff", "White"], ["#f5f0e6", "Cream"], ["#e8dcc8", "Ecru"], ["#d2b48c", "Tan"], ["#c19a6b", "Camel"], ["#8b5a2b", "Brown"],
  ["#5c3a21", "Chocolate"], ["#3e2a1e", "Espresso"], ["#a0522d", "Rust"], ["#d77838", "Burnt orange"], ["#ff8c00", "Orange"], ["#f4c430", "Mustard"],
  ["#ffd700", "Yellow"], ["#f0e68c", "Butter"], ["#808000", "Olive"], ["#556b2f", "Army green"], ["#2e8b57", "Green"], ["#2b7a78", "Teal"],
  ["#98ff98", "Mint"], ["#9caf88", "Sage"], ["#87ceeb", "Sky blue"], ["#4682b4", "Steel blue"], ["#1e90ff", "Blue"], ["#243b64", "Navy"],
  ["#191970", "Midnight"], ["#5b7fa6", "Denim blue"], ["#795b99", "Lavender"], ["#800080", "Purple"], ["#4b0082", "Indigo"], ["#ff69b4", "Pink"],
  ["#f4a7b9", "Blush"], ["#c71585", "Fuchsia"], ["#dc143c", "Red"], ["#8b0000", "Burgundy"], ["#722f37", "Wine"], ["#fa8072", "Coral"],
];
const rgb = (h: string) => {
  const x = h.replace("#", "");
  const f = x.length === 3 ? x.split("").map((c) => c + c).join("") : x.slice(0, 6);
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
};
export function isHex(v: any): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(String(v || "").trim());
}
/** A readable name for a colour hex (the nearest of the table). */
export function colourName(hex: string): string {
  if (!isHex(hex)) return cleanValue(hex);
  const [r, g, b] = rgb(hex);
  let best = NAMES[0];
  let d = Infinity;
  for (const n of NAMES) {
    const [R, G, B] = rgb(n[0]);
    /* weighted ("redmean") distance: close to how eyes judge it */
    const rm = (r + R) / 2;
    const e = (2 + rm / 256) * (r - R) ** 2 + 4 * (g - G) ** 2 + (2 + (255 - rm) / 256) * (b - B) ** 2;
    if (e < d) {
      d = e;
      best = n;
    }
  }
  return t("dn.col." + best[1].toLowerCase().replace(/\s+/g, "-"), best[1]);
}
/** The product's colours in the shop's order: { hex, name, image (a variant's own photo or null), stock }. */
export function coloursOf(p: any): { hex: string; name: string; image: string | null; stock: number }[] {
  const m = new Map<string, { hex: string; name: string; image: string | null; stock: number }>();
  for (const v of variantsOf(p)) {
    const hex = String(v.color || "").trim();
    if (!isHex(hex)) continue;
    const k = hex.toLowerCase();
    const cur = m.get(k) || { hex, name: colourName(hex), image: null, stock: 0 };
    if (!cur.image && v.image) cur.image = v.image;
    cur.stock += Math.max(0, Number(v.quantity ?? 1));
    m.set(k, cur);
  }
  return [...m.values()];
}

/** The variant for a colour and a size (either may be empty when the product has no such dimension). */
export function variantFor(p: any, hex: string, size: string): any {
  return (
    variantsOf(p).find((v: any) => (!hex || String(v.color || "").toLowerCase() === hex.toLowerCase()) && (!size || sizeOfVariant(v) === size)) || null
  );
}

declare const window: any;
/** A Selldone file name or URL -> a CDN URL for a product photo (size: 128 or null for the original; Selldone has no 256/512). */
export function photoUrl(file: string | null | undefined, size: number | null = null): string | null {
  if (!file) return null;
  if (/^https?:/.test(file)) return file;
  return window.CDN.GET_SHOP_IMAGE_PATH(file, size);
}
