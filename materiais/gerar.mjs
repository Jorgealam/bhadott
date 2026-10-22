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

for (const f of fs.readdirSync(SRC).filter((f) => f.endsWith(".html") && f !== "og-image.html")) {
  const pdf = path.join(OUT, f.replace(/\.html$/, ".pdf"));
  run([`--print-to-pdf=${pdf}`, pathToFileURL(path.join(SRC, f)).href]);
  console.log("PDF:", path.relative(".", pdf), `${Math.round(fs.statSync(pdf).size / 1024)} KB`);
}

const og = path.resolve("assets/og-image.png");
run([`--screenshot=${og}`, "--window-size=1200,630", "--hide-scrollbars", pathToFileURL(path.join(SRC, "og-image.html")).href]);
console.log("Imagem:", path.relative(".", og), `${Math.round(fs.statSync(og).size / 1024)} KB`);
