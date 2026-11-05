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
    '$1    <li class="nav-item"><a class="nav-link text-nowrap" href="/" title="Voltar ao portal BHADOTT" aria-label="Voltar ao portal BHADOTT"><i class="bi bi-stars"></i> Portal</a></li>\n                    $2');
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
console.log(`Bhadott Games importado em games/: ${pages.length} páginas`);
