// Generates app/theme-dark.css: the dark theme as one derived layer, not page-specific CSS.
//
// Every colour in the site's stylesheets is re-mapped by the role of the property it sits in:
//   surface (backgrounds)          light -> dark;  already-dark panels stay as designed
//   ink (text, fills, carets)      dark  -> light; already-light text stays
//   line (borders, outlines, rules) light -> dim;  dark lines stay
// Hue and alpha are kept (in OKLCH), so accents, status colours and translucent overlays keep
// their meaning. Selectors are prefixed with :root[data-theme="dark"] and keep their @media /
// @container context and source order. Media (images, video) is never touched.
//
// Run after changing any stylesheet:   node scripts/build-dark-theme.mjs
// data/theme.test.ts fails if the committed output is stale.
import { readFileSync, writeFileSync } from "node:fs";
import postcss from "postcss";

export const SOURCES = ["app/globals.css"];
export const OUTPUT = "app/theme-dark.css";
const PREFIX = ':root[data-theme="dark"]';

// ---- colour maths (sRGB <-> OKLab/OKLCH)
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
function rgbToOklch([r, g, b]) {
  const [lr, lg, lb] = [r, g, b].map((v) => toLinear(v / 255));
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), Math.atan2(B, A)];
}
function oklchToRgb([L, C, H]) {
  const A = C * Math.cos(H), B = C * Math.sin(H);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return rgb.map((v) => Math.round(Math.min(1, Math.max(0, toGamma(Math.min(1, Math.max(0, v))))) * 255));
}
const lerp = (a, b, t) => a + (b - a) * t;

function remap(rgb, role) {
  const [L, C, H] = rgbToOklch(rgb);
  let nL = L, nC = C;
  if (role === "surface" && L > 0.6) { nL = lerp(0.3, 0.17, (L - 0.6) / 0.4); nC = C * 0.7; }
  else if (role === "ink" && L < 0.62) { nL = lerp(0.95, 0.72, L / 0.62); nC = Math.min(C, 0.16); }
  else if (role === "line" && L > 0.6) { nL = lerp(0.42, 0.3, (L - 0.6) / 0.4); nC = C * 0.6; }
  else return null;
  return oklchToRgb([nL, nC, H]);
}

// ---- colour literals
const NAMED = { white: [255, 255, 255], black: [0, 0, 0] };
const COLOR_RE = /#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b|rgba?\(([^)]*)\)|\b(white|black)\b/g;
function parse(match, hex, fn, named) {
  if (named) return { rgb: NAMED[named], a: 1 };
  if (hex) {
    const h = hex.length <= 4 ? [...hex].map((x) => x + x).join("") : hex;
    return { rgb: [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)), a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 };
  }
  const parts = fn.replace(/\//, " ").split(/[\s,]+/).filter(Boolean);
  if (parts.length < 3 || parts.slice(0, 3).some((p) => p.includes("var("))) return null;
  const rgb = parts.slice(0, 3).map((p) => (p.endsWith("%") ? parseFloat(p) * 2.55 : parseFloat(p)));
  const a = parts[3] === undefined ? 1 : parts[3].endsWith("%") ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
  return rgb.some(Number.isNaN) ? null : { rgb, a };
}
const fmt = ({ rgb, a }) => (a >= 1 ? "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("") : `rgb(${rgb.join(" ")} / ${+a.toFixed(3)})`);

function roleOf(prop) {
  if (prop.startsWith("--")) {
    if (/bg|background|panel|card|surface/.test(prop)) return "surface";
    if (/border|line/.test(prop)) return "line";
    return "ink";
  }
  if (/^background/.test(prop)) return "surface";
  if (/^(border|outline|column-rule|box-shadow)/.test(prop)) return "line";
  if (/^(color|fill|stroke|caret-color|accent-color|text-decoration-color|-webkit-text-fill-color|text-shadow)$/.test(prop)) return prop === "stroke" ? "line" : "ink";
  return null;
}

function convertValue(value, role) {
  let changed = false;
  const out = value.replace(COLOR_RE, (match, hex, fn, named) => {
    const c = parse(match, hex, fn, named);
    if (!c) return match;
    const mapped = remap(c.rgb, role);
    if (!mapped) return match;
    changed = true;
    return fmt({ rgb: mapped, a: c.a });
  });
  return changed ? out : null;
}

export function build() {
  const out = postcss.root();
  out.append(postcss.comment({ text: " GENERATED by scripts/build-dark-theme.mjs from " + SOURCES.join(", ") + ". Do not edit. " }));
  out.append(postcss.rule({ selector: PREFIX, nodes: [postcss.decl({ prop: "color-scheme", value: "dark" })] }));
  for (const file of SOURCES) {
    const root = postcss.parse(readFileSync(file, "utf8"), { from: file });
    const walk = (container, target) => {
      container.each((node) => {
        if (node.type === "atrule") {
          if (!["media", "container", "supports"].includes(node.name)) return;
          const clone = postcss.atRule({ name: node.name, params: node.params, nodes: [] });
          walk(node, clone);
          if (clone.nodes.length) target.append(clone);
        } else if (node.type === "rule") {
          if (node.parent?.type === "atrule" && node.parent.name === "keyframes") return;
          const decls = [];
          node.each((d) => {
            if (d.type !== "decl") return;
            const role = roleOf(d.prop);
            if (!role) return;
            const value = convertValue(d.value, role);
            if (value) decls.push(postcss.decl({ prop: d.prop, value, important: d.important }));
          });
          if (!decls.length) return;
          const selector = node.selectors.map((s) => (/^(:root|html)\b/.test(s) ? s.replace(/^(:root|html)/, PREFIX) : `${PREFIX} ${s}`)).join(",\n");
          target.append(postcss.rule({ selector, nodes: decls }));
        }
      });
    };
    walk(root, out);
  }
  return out.toString() + "\n";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(OUTPUT, build());
  console.log("wrote", OUTPUT);
}
