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

const blocks = {
  posts_cards: data.posts.map((p) => `
        <article class="card post reveal" data-cat="${esc(p.categoria)}" data-search="${esc((p.titulo + " " + p.resumo + " " + p.categoria).toLowerCase())}">
          <span class="tag">${esc(p.categoria)}</span>
          <h3><a href="/blog/${p.slug}.html">${esc(p.titulo)}</a></h3>
          <p>${esc(p.resumo)}</p>
          <p class="post-meta"><time datetime="${p.data}">${fmtDate(p.data)}</time> · ${p.leitura} min de leitura</p>
        </article>`).join(""),
  posts_latest: data.posts.slice(0, 3).map((p) => `
          <article class="card post reveal"><span class="tag">${esc(p.categoria)}</span>
            <h3><a href="/blog/${p.slug}.html">${esc(p.titulo)}</a></h3><p>${esc(p.resumo)}</p>
            <p class="post-meta"><time datetime="${p.data}">${fmtDate(p.data)}</time></p></article>`).join(""),
  blog_categories: [...new Set(data.posts.map((p) => p.categoria))]
    .map((c) => `<button class="filter" data-filter="${esc(c)}">${esc(c)}</button>`).join(""),
  cases_cards: data.cases.map((c) => `
          <article class="card project reveal" data-cat="${esc(c.filtro)}">
            <div class="project-thumb" style="--hue:${c.hue}"><svg class="ico ico-xl"><use href="/assets/icons.svg#${c.icone}"/></svg></div>
            ${statusBadge(c.status)} ${tags(c.tags)}
            <h3><a href="/studio/cases/${c.slug}.html">${esc(c.nome)}</a></h3>
            <p>${esc(c.resumo)}</p>
          </article>`).join(""),
  cases_featured: data.cases.filter((c) => c.destaque).map((c) => `
          <a class="card project reveal" href="/studio/cases/${c.slug}.html">
            <div class="project-thumb" style="--hue:${c.hue}"><svg class="ico ico-xl"><use href="/assets/icons.svg#${c.icone}"/></svg></div>
            ${statusBadge(c.status)}<h3>${esc(c.nome)}</h3><p>${esc(c.resumo)}</p></a>`).join(""),
  servicos_cards: data.servicos.map((s) => `
          <a class="card service reveal" href="/studio/servicos/${s.slug}.html">
            <div class="icon"><svg class="ico"><use href="/assets/icons.svg#${s.icone}"/></svg></div>
            <h3>${esc(s.nome)}</h3><p>${esc(s.resumo)}</p><span class="more">Saiba mais →</span></a>`).join(""),
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
  addPage(`blog/${p.slug}.html`, render(tpl("post"), { ...p, data_fmt: fmtDate(p.data), conteudo: p.conteudo.join("\n") }),
    { title: `${p.titulo} | Blog BHADOTT`, description: p.resumo, type: "article", section: "portal" });
}
for (const c of data.cases) {
  addPage(`studio/cases/${c.slug}.html`, render(tpl("case"), {
    ...c, tags_html: tags(c.tags), status_html: statusBadge(c.status),
    destaques: c.destaques.map((d) => `<li>${esc(d)}</li>`).join(""), stack: c.stack.map((s) => `<span class="tech">${esc(s)}</span>`).join(""),
  }), { title: `${c.nome} | Portfólio BHADOTT Studio`, description: c.resumo, section: "studio" });
}
for (const s of data.servicos) {
  addPage(`studio/servicos/${s.slug}.html`, render(tpl("servico"), {
    ...s, entregas: s.entregas.map((e) => `<li>${esc(e)}</li>`).join(""), beneficios: s.beneficios.map((b) => `<div class="card reveal"><h3>${esc(b[0])}</h3><p>${esc(b[1])}</p></div>`).join(""),
  }), { title: `${s.nome} | BHADOTT Studio`, description: s.resumo, section: "studio" });
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
    robots: pg.meta.noindex ? "noindex" : "index, follow",
    scripts: (pg.meta.scripts || []).map((s) => `<script src="${s}?v=${version}" defer></script>`).join("\n  "),
    version,
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
fs.mkdirSync(path.join(OUT, "data"), { recursive: true });
fs.copyFileSync("src/data/i18n.json", path.join(OUT, "data/i18n.json"));
for (const f of ["robots.txt", "_headers", ".htaccess", "manifest.webmanifest"]) fs.copyFileSync(f, path.join(OUT, f));
fs.writeFileSync(path.join(OUT, "sw.js"), read("sw.js").replace("__VERSION__", version));

const urls = pages.filter((p) => !p.meta.noindex).map((p) => "/" + p.out.replace(/index\.html$/, ""));
fs.writeFileSync(path.join(OUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>`).join("\n") +
  `\n</urlset>\n`);

if (!DEV) {
  const run = (cmd) => execSync(cmd, { stdio: "inherit" });
  run(`npx --yes lightningcss-cli@1.25.1 --minify css/style.css -o ${OUT}/css/style.css`);
  for (const f of fs.readdirSync("js")) run(`npx --yes terser@5.31.0 js/${f} -c -m -o ${OUT}/js/${f}`);
}

// Prefixa os caminhos absolutos com BASE (publicação em subpasta)
if (BASE) {
  const ROOTS = "assets|css|js|data|studio|blog|sobre|contato|carreira|investimentos|recursos|privacidade|404|sw\\.js|manifest";
  const re = new RegExp(`(["'\`(])\\/(?=(?:${ROOTS})|["'\`#?])`, "g");
  const fix = (dir) => {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) { fix(full); continue; }
      if (!/\.(html|js|css|webmanifest)$/.test(f)) continue;
      fs.writeFileSync(full, read(full).replace(re, `$1${BASE}/`));
    }
  };
  fix(OUT);
}
console.log(`Build ${DEV ? "(dev) " : ""}concluído: ${pages.length} páginas em ${OUT}/`);
