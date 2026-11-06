// Gera os PDFs dos materiais gratuitos e a imagem de compartilhamento (og-image.png)
// usando o Microsoft Edge (ou Chrome) instalado no Windows.
//   node materiais/gerar.mjs
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const BROWSERS = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
];
const browser = process.env.BROWSER || BROWSERS.find((b) => fs.existsSync(b));
if (!browser) throw new Error("Edge ou Chrome não encontrado. Defina a variável BROWSER.");

const SRC = path.resolve("materiais");
const OUT = path.resolve("assets/materiais");
fs.mkdirSync(OUT, { recursive: true });
const run = (args) => execFileSync(browser, ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", ...args], { stdio: "ignore" });

for (const f of fs.readdirSync(SRC).filter((f) => f.endsWith(".html") && !["og-image.html", "arte.html"].includes(f))) {
  const pdf = path.join(OUT, f.replace(/\.html$/, ".pdf"));
  run([`--print-to-pdf=${pdf}`, pathToFileURL(path.join(SRC, f)).href]);
  console.log("PDF:", path.relative(".", pdf), `${Math.round(fs.statSync(pdf).size / 1024)} KB`);
}

const og = path.resolve("assets/og-image.png");
run([`--screenshot=${og}`, "--window-size=1200,630", "--hide-scrollbars", pathToFileURL(path.join(SRC, "og-image.html")).href]);
console.log("Imagem:", path.relative(".", og), `${Math.round(fs.statSync(og).size / 1024)} KB`);

// Capas ilustradas das áreas do portal (assets/arte/<tema>.png)
const ARTE = path.resolve("assets/arte");
fs.mkdirSync(ARTE, { recursive: true });
for (const tema of ["universo", "aura", "studio", "agro", "video", "academy", "jogos"]) {
  const out = path.join(ARTE, tema + ".png");
  run([`--screenshot=${out}`, "--window-size=1600,900", "--hide-scrollbars", pathToFileURL(path.join(SRC, "arte.html")).href + "?tema=" + tema]);
  console.log("Arte:", path.relative(".", out), `${Math.round(fs.statSync(out).size / 1024)} KB`);
}
// PNG (pesado) -> JPEG (~55 KB cada)
execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", path.join(SRC, "png-para-jpg.ps1"), ARTE], { stdio: "inherit" });
console.log("Capas convertidas para JPEG em", path.relative(".", ARTE));
