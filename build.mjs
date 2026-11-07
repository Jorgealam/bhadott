// Gerador estático do site BHADOTT
//   node build.mjs        → dist/ minificado (produção)
//   node build.mjs --dev  → dist/ sem minificar (rápido, para testar)
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const DEV = process.argv.includes("--dev");
const OUT = "dist";
const SITE_URL = process.env.SITE_URL || "https://www.bhadott.studio";
// Subpasta de publicação (ex.: GitHub Pages sem domínio → "/bhadott"). Vazio = raiz do domínio.
const BASE = (process.env.BASE_PATH || "").replace(/\/$/, "");
const read = (f) => fs.readFileSync(f, "utf8");
const json = (f) => JSON.parse(read(f));
const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const partials = Object.fromEntries(
  fs.readdirSync("src/partials").map((f) => [path.basename(f, ".html"), read(`src/partials/${f}`)])
);
const data = Object.fromEntries(
  fs.readdirSync("src/data").filter((f) => f.endsWith(".json")).map((f) => [path.basename(f, ".json"), json(`src/data/${f}`)])
);

// ---------- Blocos gerados a partir de src/data ----------
const fmtDate = (d) => new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const tags = (list) => list.map((t) => `<span class="tag">${esc(t)}</span>`).join("");
const statusBadge = (s) => `<span class="status status-${s.toLowerCase().replace(/[^a-z]+/g, "-")}">${esc(s)}</span>`;

// Capa do projeto: imagem quando houver (data/cases.json > capa), senão o ícone
const thumb = (c) => c.capa
  ? `<div class="project-thumb com-capa" style="--hue:${c.hue}"><img src="${c.capa}" alt="" loading="lazy" width="1600" height="900" /></div>`
  : `<div class="project-thumb" style="--hue:${c.hue}"><svg class="ico ico-xl"><use href="/assets/icons.svg#${c.icone}"/></svg></div>`;

// Área de cada serviço/projeto: muda só a cor de destaque (css/tema-bhadott.css)
const AREA_SERVICO = { jogos: "jogos", aplicativos: "apps", sistemas: "sistemas", "ia-automacao": "ia", "sites-portais": "sites", "audiovisual-3d": "audiovisual" };
const AREA_CASE = { jogos: "jogos", app: "apps", software: "sistemas", ia: "ia" };

// Capas das páginas geradas (assets/arte/*.jpg)
const ARTE_CATEGORIA = { "Jogos": "jogos", "Inteligência Artificial": "aura", "Aplicativos": "apps", "Novidades": "universo" };
const capaPost = (p) => `/assets/arte/${ARTE_CATEGORIA[p.categoria] || "universo"}.jpg`;
const capaMidia = (src, extra = "") => `<span class="midia-capa"><img src="${src}" alt="" loading="lazy" width="1600" height="900" />${extra}</span>`;

const blocks = {
  posts_cards: data.posts.map((p) => `
        <a class="card midia post reveal" href="/blog/${p.slug}.html" data-cat="${esc(p.categoria)}" data-search="${esc((p.titulo + " " + p.resumo + " " + p.categoria).toLowerCase())}">
          ${capaMidia(capaPost(p), `<span class="status">${esc(p.categoria)}</span>`)}
          <span class="midia-corpo"><h3>${esc(p.titulo)}</h3><p>${esc(p.resumo)}</p>
          <span class="post-meta"><time datetime="${p.data}">${fmtDate(p.data)}</time> · ${p.leitura} min de leitura</span></span>
        </a>`).join(""),
  posts_latest: data.posts.slice(0, 3).map((p) => `
          <a class="card midia post reveal" href="/blog/${p.slug}.html">
            ${capaMidia(capaPost(p), `<span class="status">${esc(p.categoria)}</span>`)}
            <span class="midia-corpo"><h3>${esc(p.titulo)}</h3><p>${esc(p.resumo)}</p>
            <span class="post-meta"><time datetime="${p.data}">${fmtDate(p.data)}</time></span></span></a>`).join(""),
  blog_categories: [...new Set(data.posts.map((p) => p.categoria))]
    .map((c) => `<button class="filter" data-filter="${esc(c)}">${esc(c)}</button>`).join(""),
  cases_cards: data.cases.map((c) => `
          <article class="card project reveal" data-cat="${esc(c.filtro)}">
            ${thumb(c)}
            ${statusBadge(c.status)} ${tags(c.tags)}
            <h3><a href="/studio/cases/${c.slug}.html">${esc(c.nome)}</a></h3>
            <p>${esc(c.resumo)}</p>
          </article>`).join(""),
  cases_featured: data.cases.filter((c) => c.destaque).map((c) => `
          <a class="card project reveal" href="/studio/cases/${c.slug}.html">
            ${thumb(c)}
            ${statusBadge(c.status)}<h3>${esc(c.nome)}</h3><p>${esc(c.resumo)}</p></a>`).join(""),
  servicos_cards: data.servicos.map((s) => `
          <a class="card midia service reveal" href="/studio/servicos/${s.slug}.html">
            ${capaMidia(s.capa, `<span class="icon midia-icone"><svg class="ico"><use href="/assets/icons.svg#${s.icone}"/></svg></span>`)}
            <span class="midia-corpo"><h3>${esc(s.nome)}</h3><p>${esc(s.resumo)}</p><span class="more">Saiba mais →</span></span></a>`).join(""),
  vagas_cards: data.vagas.map((v) => `
          <div class="card job reveal"><div><h3>${esc(v.titulo)}</h3>${tags([v.modelo, ...v.tags])}<p>${esc(v.resumo)}</p></div>
            <a href="#candidatura" class="btn btn-ghost" data-vaga="${esc(v.titulo)}">Quero colaborar</a></div>`).join(""),
  vagas_options: data.vagas.map((v) => `<option>${esc(v.titulo)}</option>`).join(""),
  timeline: data.timeline.map((t) => `
          <li class="reveal"><span class="when">${esc(t.quando)}</span><h3>${esc(t.titulo)}</h3><p>${esc(t.texto)}</p></li>`).join(""),
  faq: data.faq.map((f) => `
          <details class="faq-item"><summary>${esc(f.p)}</summary><p>${f.r}</p></details>`).join(""),
  tecnologias: data.tecnologias.map((g) => `
          <div class="card reveal"><h3>${esc(g.grupo)}</h3><div class="tech-list">${g.itens.map((i) => `<span class="tech">${esc(i)}</span>`).join("")}</div></div>`).join(""),
  recursos_cards: data.recursos.map((r) => `
          <article class="card reveal"><div class="icon"><svg class="ico"><use href="/assets/icons.svg#${r.icone}"/></svg></div>
            <span class="tag">${esc(r.formato)}</span><h3>${esc(r.titulo)}</h3><p>${esc(r.resumo)}</p>
            <button class="btn btn-ghost" data-recurso="${esc(r.titulo)}">Receber grátis</button></article>`).join(""),
  depoimentos: data.depoimentos.length
    ? data.depoimentos.map((d) => `<figure class="card quote reveal"><blockquote>${esc(d.texto)}</blockquote><figcaption>${esc(d.nome)} · ${esc(d.empresa)}</figcaption></figure>`).join("")
    : `<div class="card empty reveal"><svg class="ico ico-xl"><use href="/assets/icons.svg#star"/></svg><h3>Seu depoimento pode estar aqui</h3>
        <p>Publicamos depoimentos (inclusive em vídeo) somente com autorização de quem contratou. Seja um dos primeiros projetos parceiros.</p>
        <a class="btn btn-ghost" href="/contato.html">Começar um projeto</a></div>`,
};

// ---------- Renderização ----------
function render(tpl, vars) {
  for (let i = 0; i < 3; i++) tpl = tpl.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, p) => partials[p] ?? "");
  return tpl.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m));
}

const pages = []; // { out, meta, body }
function addPage(out, body, meta) { pages.push({ out, body, meta }); }

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) { walk(full); continue; }
    const src = read(full);
    const m = src.match(/^<!--(\{[\s\S]*?\})-->\r?\n/);
    const meta = m ? JSON.parse(m[1]) : {};
    addPage(path.relative("src/pages", full).replace(/\\/g, "/"), m ? src.slice(m[0].length) : src, meta);
  }
}
walk("src/pages");

// Páginas geradas por modelo
const tpl = (n) => read(`src/templates/${n}.html`);
for (const p of data.posts) {
  addPage(`blog/${p.slug}.html`, render(tpl("post"), { ...p, capa_url: capaPost(p), data_fmt: fmtDate(p.data), conteudo: p.conteudo.join("\n") }),
    { title: `${p.titulo} | Blog BHADOTT`, description: p.resumo, type: "article", section: "portal" });
}
for (const c of data.cases) {
  addPage(`studio/cases/${c.slug}.html`, render(tpl("case"), {
    capa_url: c.capa || "/assets/arte/studio.jpg",
    ...c, tags_html: tags(c.tags), status_html: statusBadge(c.status),
    destaques: c.destaques.map((d) => `<li>${esc(d)}</li>`).join(""), stack: c.stack.map((s) => `<span class="tech">${esc(s)}</span>`).join(""),
  }), { title: `${c.nome} | Portfólio BHADOTT Studio`, description: c.resumo, section: "studio", area: AREA_CASE[c.filtro.split(" ")[0]] });
}
for (const s of data.servicos) {
  addPage(`studio/servicos/${s.slug}.html`, render(tpl("servico"), {
    capa_url: s.capa,
    ...s, entregas: s.entregas.map((e) => `<li>${esc(e)}</li>`).join(""), beneficios: s.beneficios.map((b) => `<div class="card reveal"><h3>${esc(b[0])}</h3><p>${esc(b[1])}</p></div>`).join(""),
  }), { title: `${s.nome} | BHADOTT Studio`, description: s.resumo, section: "studio", area: AREA_SERVICO[s.slug] });
}

// ---------- Saída ----------
fs.rmSync(OUT, { recursive: true, force: true });
const version = Date.now().toString(36);
for (const pg of pages) {
  const url = "/" + pg.out.replace(/index\.html$/, "");
  const vars = {
    ...blocks,
    title: pg.meta.title || "BHADOTT",
    description: pg.meta.description || "",
    canonical: SITE_URL + url,
    og_type: pg.meta.type || "website",
    section: pg.meta.section || "portal",
    area: pg.meta.area || "",
    robots: pg.meta.noindex ? "noindex" : "index, follow",
    scripts: (pg.meta.scripts || []).map((s) => `<script src="${s}?v=${version}" defer></script>`).join("\n  "),
    version,
    site_url: SITE_URL,
    year: new Date().getFullYear(),
  };
  vars.content = render(pg.body, vars);
  const html = render(partials.layout, vars);
  const dest = path.join(OUT, pg.out);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html);
}

// Arquivos estáticos
for (const d of ["css", "js", "assets"]) fs.cpSync(d, path.join(OUT, d), { recursive: true });
// Área Bhadott Games (gerada por tools/importar-games.mjs)
if (fs.existsSync("games")) fs.cpSync("games", path.join(OUT, "games"), { recursive: true });
fs.mkdirSync(path.join(OUT, "data"), { recursive: true });
fs.copyFileSync("src/data/i18n.json", path.join(OUT, "data/i18n.json"));
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`);
// Arquivos de verificação do Google Search Console (googleXXXX.html) vão para a raiz
for (const f of fs.readdirSync(".").filter((f) => /^google[0-9a-f]+.html$/.test(f))) fs.copyFileSync(f, path.join(OUT, f));
for (const f of ["_headers", ".htaccess", "manifest.webmanifest"]) fs.copyFileSync(f, path.join(OUT, f));
fs.writeFileSync(path.join(OUT, "sw.js"), read("sw.js").replace("__VERSION__", version));

const urls = pages.filter((p) => !p.meta.noindex).map((p) => "/" + p.out.replace(/index\.html$/, ""));
// Páginas públicas da área de jogos (as de conta/carrinho ficam fora do Google)
const GAMES_PUBLIC = ["", "jogos.html", "loja.html", "planetario.html", "gratuitos.html", "promocoes.html", "estudio.html", "noticias.html"];
if (fs.existsSync("games")) urls.push(...GAMES_PUBLIC.map((p) => "/games/" + p));
fs.writeFileSync(path.join(OUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>`).join("\n") +
  `\n</urlset>\n`);

if (!DEV) {
  const run = (cmd) => execSync(cmd, { stdio: "inherit" });
  for (const f of ["style.css", "tema-bhadott.css"]) run(`npx --yes lightningcss-cli@1.25.1 --minify css/${f} -o ${OUT}/css/${f}`);
  for (const f of fs.readdirSync("js")) run(`npx --yes terser@5.31.0 js/${f} -c -m -o ${OUT}/js/${f}`);
}

// Prefixa os caminhos absolutos com BASE (publicação em subpasta)
if (BASE) {
  const ROOTS = "assets|css|js|data|studio|games|blog|sobre|contato|carreira|investimentos|recursos|privacidade|404|sw\\.js|manifest";
  const re = new RegExp(`(["'\`(])\\/(?=(?:${ROOTS})|["'\`#?])`, "g");
  const fix = (dir) => {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) { fix(full); continue; }
      if (!/\.(html|js|css|webmanifest)$/.test(f)) continue;
      if (/\.min\.(js|css)$/.test(f) || /[\\/]vendor[\\/]/.test(full)) continue; // bibliotecas de terceiros ficam intactas
      fs.writeFileSync(full, read(full).replace(re, `$1${BASE}/`));
    }
  };
  fix(OUT);
}
console.log(`Build ${DEV ? "(dev) " : ""}concluído: ${pages.length} páginas em ${OUT}/`);
