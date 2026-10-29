#!/usr/bin/env node
// WCAG 2.x contrast checker.
// Usage: node contrast.mjs "#fg on #bg" ["#fg on #bg" ...]
// Accepts #rgb, #rrggbb and #rrggbbaa (alpha is composited over the background).

const parse = (hex) => {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(h)) throw new Error(`Bad colour: ${hex}`);
  const n = (i) => parseInt(h.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
};

const over = (fg, bg) => ({
  r: fg.r * fg.a + bg.r * (1 - fg.a),
  g: fg.g * fg.a + bg.g * (1 - fg.a),
  b: fg.b * fg.a + bg.b * (1 - fg.a),
});

const luminance = ({ r, g, b }) => {
  const ch = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
};

const ratio = (fgHex, bgHex) => {
  const bg = parse(bgHex);
  const fg = over(parse(fgHex), bg);
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
};

const pairs = process.argv.slice(2);
if (!pairs.length) {
  console.error('Usage: node contrast.mjs "#fg on #bg" ...');
  process.exit(1);
}

let failed = 0;
for (const pair of pairs) {
  const [fg, bg] = pair.split(/\s+on\s+/i);
  const r = ratio(fg, bg);
  const body = r >= 7 ? "AAA" : r >= 4.5 ? "AA" : "FAIL";
  const large = r >= 4.5 ? "AAA" : r >= 3 ? "AA" : "FAIL";
  if (body === "FAIL") failed++;
  console.log(`${pair.padEnd(26)} ${r.toFixed(2).padStart(6)}:1   body ${body.padEnd(4)}  large/UI ${large}`);
}
process.exit(failed ? 2 : 0);
