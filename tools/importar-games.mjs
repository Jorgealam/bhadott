// Importa o site Bhadott Games (cópia de bhadott.com.br) para a área /games/ do portal.
//   node tools/importar-games.mjs ["<pasta da cópia>"]
// Adapta: .aspx -> .html, raiz do app -> /games/, scripts embutidos -> arquivos (CSP), link de volta ao portal.
import fs from "node:fs";
import path from "node:path";

const SRC = process.argv[2] || "D:/TRABALHO/PROJETOS/02_SITES_E_PORTAIS/Bhadott Games - Copia do site publicado";
const OUT = path.resolve("games");
const PAGE = (name) => (name === "default" ? "index" : name);

fs.rmSync(OUT, { recursive: true, force: true });
for (const d of ["css", "data", "img", "js", "lang"]) fs.cpSync(path.join(SRC, d), path.join(OUT, d), { recursive: true });

// Links para páginas: /x.aspx e x.aspx -> /games/x.html (default -> index)
const linkPage = (s, prefix) => s.replace(/(["'(])\/?([\w-]+)\.aspx/g, (_, q, n) => `${q}${prefix}${PAGE(n)}.html`);

// ---------- Páginas ----------
const THEME_JS = "try{var __t=JSON.parse(localStorage.getItem('badot.theme')||'null');if(__t)document.documentElement.setAttribute('data-theme',__t)}catch(e){}\n";
fs.writeFileSync(path.join(OUT, "js/tema-inicial.js"), "// Aplica o tema salvo antes da pintura\n" + THEME_JS);
fs.writeFileSync(path.join(OUT, "js/iniciar.js"), "// Inicia o app Bhadott Games\nBadot.start();\n");

const pages = fs.readdirSync(SRC).filter((f) => f.endsWith(".aspx"));
for (const f of pages) {
  let h = fs.readFileSync(path.join(SRC, f), "utf8");
  h = h.replace(/<script>\s*try\{var __t=[\s\S]*?<\/script>/, '<script src="/games/js/tema-inicial.js"></script>');
  h = h.replace(/<script>\s*Badot\.start\(\);?\s*<\/script>/, '<script src="/games/js/iniciar.js"></script>');
  h = h.replace(/https:\/\/(www\.)?bhadott\.com\.br\//g, "/games/");
  h = h.replace(/data-root="\/"/, 'data-root="/games/"');
  h = linkPage(h, "/games/");
  h = h.replace(/(src|href)="\/(img|js|css|data|lang)\//g, '$1="/games/$2/');
  h = h.replace(/(src|href)="(img|js|css|data|lang)\//g, '$1="/games/$2/');
  // Link de volta ao portal BHADOTT no fim do menu principal
  h = h.replace(/(<ul class="navbar-nav bd-menu[^"]*">[\s\S]*?)(<\/ul>)/,
    '$1    <li class="nav-item"><a class="nav-link text-nowrap" href="/" title="Voltar ao portal BHADOTT" aria-label="Voltar ao portal BHADOTT"><i class="bi bi-stars"></i><span class="d-lg-none d-xxl-inline"> Portal</span></a></li>\n                    $2');
  h = h.replace(/<title>\s*([\s\S]*?)\s*<\/title>/, (_, t) => `<title>${t.trim()}</title>`);
  fs.writeFileSync(path.join(OUT, PAGE(path.basename(f, ".aspx")) + ".html"), h);
}

// ---------- JavaScript, CSS e dados ----------
const walk = (d) => fs.readdirSync(d).flatMap((f) => { const p = path.join(d, f); return fs.statSync(p).isDirectory() ? walk(p) : [p]; });
for (const f of walk(OUT)) {
  if (/vendor/.test(f)) continue;
  if (/\.(js|json)$/.test(f)) {
    const s = fs.readFileSync(f, "utf8");
    const t = linkPage(s, "");
    if (t !== s) fs.writeFileSync(f, t);
  }
  if (/\.css$/.test(f)) {
    const s = fs.readFileSync(f, "utf8");
    const t = s.replace(/url\(\s*(['"]?)\/(img|css|fonts)\//g, "url($1/games/$2/");
    if (t !== s) fs.writeFileSync(f, t);
  }
}
// ---------- Somente BHADOTT: retira terceiros e marcas do ecossistema dela ----------
const FORA = (p) => /terceiros/i.test(`${p.id} ${p.name} ${p.url} ${p.logo}`) || p.id === "terceiros";
const jsonPath = path.join(OUT, "data/games.json");
const dados = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
for (const p of (dados.partners || []).filter(FORA)) if (p.logo) fs.rmSync(path.join(OUT, p.logo), { force: true });
dados.partners = (dados.partners || []).filter((p) => !FORA(p));
for (const m of dados.team || []) if (m.id === "jorge") m.name = "Jorge Alam";
fs.writeFileSync(jsonPath, JSON.stringify(dados, null, 2) + "\n");

const TEXTOS = {
  "pt-BR": { "footer.group": "Universo BHADOTT", "partners.sub": "Marcas e empresas que acompanham a Bhadott Games." },
  "en-US": { "footer.group": "BHADOTT Universe", "partners.sub": "Brands and companies that accompany Bhadott Games." },
};
for (const [lang, novos] of Object.entries(TEXTOS)) {
  const p = path.join(OUT, `lang/${lang}.json`);
  const t = JSON.parse(fs.readFileSync(p, "utf8"));
  Object.assign(t, novos);
  for (const k of Object.keys(t)) if (/^partner\.(terceiros|terceiros)\./.test(k)) delete t[k];
  fs.writeFileSync(p, JSON.stringify(t, null, 2) + "\n");
}
// Rodapé: "Universo BHADOTT" -> link para o portal BHADOTT
for (const f of fs.readdirSync(OUT).filter((f) => f.endsWith(".html"))) {
  const p = path.join(OUT, f);
  const h = fs.readFileSync(p, "utf8").replace(/<a class="bd-group"[\s\S]*?<\/a>/,
    '<a class="bd-group" href="/" aria-label="Universo BHADOTT"><span data-i18n="footer.group">Universo BHADOTT</span> <i class="bi bi-stars"></i></a>');
  fs.writeFileSync(p, h);
}
// ---------- Por enquanto: sem parceiros e equipe só com o fundador ----------
const d2 = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
for (const p of d2.partners || []) if (p.logo) fs.rmSync(path.join(OUT, p.logo), { force: true });
d2.partners = [];
d2.team = (d2.team || []).filter((m) => m.id === "jorge");
fs.writeFileSync(jsonPath, JSON.stringify(d2, null, 2) + "\n");
const EQUIPE = {
  "pt-BR": { "team.jorge.role": "Fundador e Criador de Projetos Digitais" },
  "en-US": { "team.jorge.role": "Founder and Creator of Digital Projects" },
};
for (const [lang, novos] of Object.entries(EQUIPE)) {
  const p = path.join(OUT, `lang/${lang}.json`);
  const t = JSON.parse(fs.readFileSync(p, "utf8"));
  Object.assign(t, novos);
  for (const k of Object.keys(t)) if (/^(team\.integrante|partner\.)/.test(k)) delete t[k];
  fs.writeFileSync(p, JSON.stringify(t, null, 2) + "\n");
}
fs.rmSync(path.join(OUT, "parceiros.html"), { force: true });
for (const f of fs.readdirSync(OUT).filter((f) => f.endsWith(".html"))) {
  const p = path.join(OUT, f);
  const h = fs.readFileSync(p, "utf8")
    .replace(/\s*<li class="nav-item"><a class="nav-link" data-nav="partners"[^>]*>[^<]*<\/a><\/li>/, "")
    .replace(/\s*<a href="\/games\/parceiros\.html"[^>]*>[^<]*<\/a>/g, "");
  fs.writeFileSync(p, h);
}

// Garantia: nenhuma menção restante
const sobra = walk(OUT).filter((f) => /\.(html|js|json|css)$/.test(f) && !/vendor/.test(f) && /terceiros/i.test(fs.readFileSync(f, "utf8")));
if (sobra.length) throw new Error("Ainda há menções à terceiros em: " + sobra.join(", "));

console.log(`Bhadott Games importado em games/: ${pages.length} páginas (sem terceiros)`);
