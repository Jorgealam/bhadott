// Testes automáticos do site gerado em dist/
// Verifica: título, descrição, um <h1>, links internos válidos, imagens com alt,
// marcadores de modelo não substituídos e JSON-LD válido.
import fs from "node:fs";
import path from "node:path";

const OUT = "dist";
const BASE = (process.env.BASE_PATH || "").replace(/\/$/, "");
const errors = [];
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const full = path.join(d, f);
    fs.statSync(full).isDirectory() ? walk(full) : files.push(full);
  }
})(OUT);

const exists = (url) => {
  let p = decodeURI(url.split(/[?#]/)[0]);
  if (BASE && p.startsWith(BASE)) p = p.slice(BASE.length);
  if (p.endsWith("/")) p += "index.html";
  return fs.existsSync(path.join(OUT, p));
};

const pages = files.filter((f) => f.endsWith(".html"));
for (const file of pages) {
  const html = fs.readFileSync(file, "utf8");
  const rel = path.relative(OUT, file);
  const fail = (m) => errors.push(`${rel}: ${m}`);

  if (!/<title>[^<]{10,}<\/title>/.test(html)) fail("título ausente ou curto");
  if (!/<meta name="description" content="[^"]{20,}"/.test(html)) fail("descrição ausente ou curta");
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) fail(`esperado 1 <h1>, encontrado ${h1}`);
  if (/\{\{[>\s\w-]+\}\}/.test(html)) fail("marcador {{ }} não substituído");
  for (const [, tag] of html.matchAll(/(<img\b[^>]*>)/g)) if (!/\balt=/.test(tag)) fail(`imagem sem alt: ${tag.slice(0, 60)}`);
  for (const [, url] of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    if (url.startsWith("//")) continue;
    if (!exists(url)) fail(`link quebrado: ${url}`);
  }
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(json); } catch { fail("JSON-LD inválido"); }
  }
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) fail(`ids duplicados: ${[...new Set(dup)].join(", ")}`);
}

for (const f of files.filter((f) => f.endsWith(".json"))) {
  try { JSON.parse(fs.readFileSync(f, "utf8")); } catch { errors.push(`${f}: JSON inválido`); }
}

if (errors.length) {
  console.error(`✗ ${errors.length} problema(s):\n` + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(`✓ ${pages.length} páginas verificadas, nenhum problema.`);
