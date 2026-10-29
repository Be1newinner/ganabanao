#!/usr/bin/env node
// Screenshots of a running site for design review.
//
// node shots.mjs --base http://localhost:3000 --out temp/shots/tag \
//   [--cookies path/to/curl-cookie-jar] [--themes dark,light] [--theme-key theme] /path1 /path2
//
// Needs `playwright-core` resolvable from the current directory and Chrome at
// /usr/bin/google-chrome (override with CHROME_PATH).
import { mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const base = opt("base", "http://localhost:3000");
const out = path.resolve(opt("out", "shots"));
const jar = opt("cookies", "");
const themes = opt("themes", "dark,light").split(",");
const themeKey = opt("theme-key", "theme");
const pages = args.length ? args : ["/"];

const require = createRequire(path.join(process.cwd(), "noop.js"));
const { chromium } = require("playwright-core");
mkdirSync(out, { recursive: true });

// curl/Netscape cookie jar → Playwright cookies for the base host
const host = new URL(base).hostname;
const cookies = jar
  ? readFileSync(jar, "utf8")
      .split("\n")
      .filter((l) => l.trim() && (!l.startsWith("#") || l.startsWith("#HttpOnly_")))
      .map((l) => l.replace(/^#HttpOnly_/, "").split("\t"))
      .filter((f) => f.length >= 7)
      .map((f) => ({ name: f[5], value: f[6].trim(), domain: host, path: "/", httpOnly: true }))
  : [];

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome" });
const devices = { desktop: { width: 1440, height: 1000 }, mobile: { width: 390, height: 844 } };

for (const theme of themes) {
  for (const [device, viewport] of Object.entries(devices)) {
    const ctx = await browser.newContext({ viewport });
    if (cookies.length) await ctx.addCookies(cookies);
    await ctx.addInitScript(([k, t]) => localStorage.setItem(k, t), [themeKey, theme]);
    const page = await ctx.newPage();
    for (const p of pages) {
      await page.goto(base + p, { waitUntil: "networkidle" });
      await page.waitForTimeout(1200);
      const name = `${p.replace(/\W+/g, "_").replace(/^_|_$/g, "") || "home"}-${theme}-${device}.png`;
      await page.screenshot({ path: path.join(out, name), fullPage: device === "desktop" });
      console.log(path.join(out, name));
    }
    await ctx.close();
  }
}
await browser.close();
