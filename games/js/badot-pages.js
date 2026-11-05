/* Bhadott Games - Fase 01 - views publicas (renderizadas no navegador a partir de dados demonstrativos). */
(function () {
  'use strict';
  const B = window.Badot, V = B.views, t = (k, v) => B.t(k, v), esc = B.esc, u = B.url;

  /* ---------- blocos reutilizaveis ---------- */
  const catName = c => t('cat.' + c);
  const gName = g => g.name;
  const gTag = g => t('g.' + g.id + '.tag');
  const gDesc = g => t('g.' + g.id + '.desc');
  const priceHtml = g => g.free ? `<span class="price free">${esc(t('common.free'))}</span>`
    : g.sale ? `<span class="price"><s>${B.money(g.price)}</s> <b>${B.money(B.finalPrice(g))}</b></span>` : `<span class="price"><b>${B.money(g.price)}</b></span>`;
  const ageHtml = g => `<span class="age age-${g.age}" title="${esc(t('game.age'))}">${g.age === 'L' ? 'L' : g.age}</span>`;
  const isFav = id => B.S.fav.indexOf(id) >= 0;
  function cardHtml(g) {
    const inLib = B.S.lib.indexOf(g.id) >= 0;
    return `<article class="gcard" data-tilt>
      <a class="gcard-media" href="${u('jogo.html?id=' + g.id)}" aria-label="${esc(gName(g))}">
        <img loading="lazy" decoding="async" width="1600" height="800" src="${B.img(g, 'banner')}" alt="${esc(t('game.coverOf', [g.name]))}">
        <span class="gcard-cat">${esc(catName(g.cats[0]))}</span>
        ${g.free ? `<span class="tag free">${esc(t('common.free'))}</span>` : g.sale ? `<span class="tag sale">-${g.sale}%</span>` : g.new ? `<span class="tag new">${esc(t('common.new'))}</span>` : ''}
      </a>
      <div class="gcard-body">
        <h3 class="gcard-title"><a href="${u('jogo.html?id=' + g.id)}">${esc(gName(g))}</a></h3>
        <p class="gcard-tag">${esc(gTag(g))}</p>
        <div class="gcard-foot">
          ${priceHtml(g)}
          <span class="gcard-btns">
            <button class="icon-btn" data-act="fav" data-id="${g.id}" aria-pressed="${isFav(g.id)}" aria-label="${esc(t('fav.toggle'))}"><i class="bi ${isFav(g.id) ? 'bi-heart-fill' : 'bi-heart'}"></i></button>
            ${inLib ? `<a class="btn btn-sm btn-ghost" href="${u('biblioteca.html')}">${esc(t('store.inLibraryShort'))}</a>` : `<button class="btn btn-sm btn-primary" data-act="add" data-id="${g.id}">${esc(g.free ? t('common.get') : t('common.add'))}</button>`}
          </span>
        </div>
      </div></article>`;
  }
  const grid = list => list.length ? `<div class="gcards">${list.map(cardHtml).join('')}</div>` : `<div class="empty"><i class="bi bi-controller"></i><p>${esc(t('common.empty'))}</p></div>`;
  const head = (kicker, title, sub, extra) => `<header class="sec-head reveal"><div><p class="kicker">${esc(t(kicker))}</p><h2>${esc(t(title))}</h2>${sub ? `<p class="sec-sub">${esc(t(sub))}</p>` : ''}</div>${extra || ''}</header>`;
  const pageHead = (title, sub, crumb) => `<section class="page-head"><div class="container-xl"><nav class="crumbs" aria-label="breadcrumb"><a href="${u('index.html')}">${esc(t('nav.home'))}</a><span>/</span><b>${esc(t(crumb || title))}</b></nav><h1>${esc(t(title))}</h1>${sub ? `<p class="lead-bd">${esc(t(sub))}</p>` : ''}</div></section>`;
  const demoNote = key => `<div class="demo-note"><i class="bi bi-flask"></i><span>${esc(t(key || 'demo.note'))}</span></div>`;
  const games = () => B.data.games;
  const needLogin = () => `<section class="container-xl py-5"><div class="panel center"><i class="bi bi-person-lock big"></i><h1 class="h3">${esc(t('auth.required'))}</h1><p>${esc(t('auth.requiredText'))}</p><a class="btn btn-primary" href="${u('entrar.html')}">${esc(t('nav.login'))}</a> <a class="btn btn-ghost" href="${u('criar-conta.html')}">${esc(t('nav.signup'))}</a></div></section>`;

  /* ---------- HOME ---------- */
  const catPill = g => g.cats.slice(0, 2).map(catName).join(' / ');
  V.home = () => {
    const G = games(), more = ['bhadock-sprite', 'urbano-horizonte', 'magic-valmes', 'planetario-bhadock'].map(B.game).filter(Boolean), royal = B.game('royal-dama-3d'), plan = B.game('planetario-bhadock');
    const heros = B.data.heros.length ? B.data.heros : ['img/heros/heros01'];
    return `
    <section class="hero" id="hero">
      <h1 class="visually-hidden">Bhadott Games — ${esc(t('hero.sub'))}</h1>
      <div class="hero-car" id="heroCar" role="region" aria-roledescription="carousel" aria-label="Bhadott Games" tabindex="0">
        <div class="car-track">${heros.map((h, i) => `<div class="car-slide" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${heros.length}">
          <img class="hero-img" src="${u(h)}" width="1920" height="819" alt="${esc(t('hero.alt'))}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}>
          <div class="hero-cta"><a class="btn btn-primary btn-lg" href="${u('jogos.html')}"><i class="bi bi-controller"></i> ${esc(t('hero.explore'))}</a>
          <button type="button" class="btn btn-dark-o btn-lg" data-act="demo" data-msg="${esc(t('hero.trailerDemo'))}"><i class="bi bi-play-fill"></i> ${esc(t('hero.trailer'))}</button></div></div>`).join('')}</div>
        <div class="car-dots" role="tablist">${heros.map((h, i) => `<button type="button" role="tab" aria-label="${i + 1}" data-i="${i}"></button>`).join('')}</div>
      </div>
    </section>

    <section class="section tight"><div class="container-xl">
      ${head('home.k.featured', 'home.moreTitle')}
      <div class="wcards reveal">${more.map(g => `<a class="wcard" href="${u('jogo.html?id=' + g.id)}" aria-label="${esc(g.name)}"><img loading="lazy" width="1600" height="800" src="${B.img(g, 'banner')}" alt="${esc(g.name)}"><span class="wcard-cat">${esc(catPill(g))}</span></a>`).join('')}</div>
    </div></section>

    <section class="section tight"><div class="container-xl">
      ${head('home.k.new', 'home.launchTitle', null, `<a class="link-more" href="${u('jogos.html')}">${esc(t('common.seeAll'))} <i class="bi bi-chevron-right"></i></a>`)}
      <a class="wide reveal" href="${u('jogo.html?id=royal-dama-3d')}" aria-label="${esc(t('home.launchAlt'))}"><img loading="lazy" width="1920" height="480" src="${u('img/games/royal-dama-3d-wide.jpg')}" alt="${esc(t('home.launchAlt'))}"></a>
    </div></section>

    <section class="section tight"><div class="container-xl"><div class="duo reveal">
      <div class="duo-card duo-store"><img class="duo-art" loading="lazy" width="1200" height="600" src="${u('img/ui/loja-bhadott.jpg')}" alt="">
        <div class="duo-txt"><h2><i class="bi bi-cart3"></i> ${esc(t('home.storeCardTitle'))}</h2><p>${esc(t('home.storeCardText'))}</p><a class="btn btn-gold" href="${u('loja.html')}">${esc(t('home.storeGo'))} <i class="bi bi-arrow-right"></i></a></div></div>
      <div class="duo-card duo-planet"><img class="duo-art" loading="lazy" width="1600" height="800" src="${B.img(plan, 'banner')}" alt="">
        <div class="duo-txt"><h2>${esc(t('home.planetCardTitle'))}</h2><p>${esc(t('home.planetCardText'))}</p><a class="btn btn-violet" href="${u('planetario.html')}">${esc(t('home.planetGo'))} <i class="bi bi-arrow-right"></i></a></div></div>
    </div></div></section>

    <section class="section tight"><div class="container-xl"><div class="strip reveal">
      <a href="${u('jogos.html?cat=edu')}"><i class="bi bi-mortarboard"></i><div><h3>${esc(t('home.strip1t'))}</h3><p>${esc(t('home.strip1d'))}</p></div></a>
      <a href="${u('jogos.html')}"><i class="bi bi-controller"></i><div><h3>${esc(t('home.strip2t'))}</h3><p>${esc(t('home.strip2d'))}</p></div></a>
      <a href="${u('noticias.html')}"><i class="bi bi-calendar-event"></i><div><h3>${esc(t('home.strip3t'))}</h3><p>${esc(t('home.strip3d'))}</p></div></a>
    </div></div></section>`;
  };
  function marquee() {
    const items = B.data.partners.map(p => p.logo ? `<li class="mq-item"><img src="${u(p.logo)}" alt="${esc(p.name)}" height="44"></li>` : `<li class="mq-item mq-text" title="${esc(t('partners.logoPending'))}">${esc(p.name)}</li>`).join('');
    return `<div class="marquee reveal" aria-label="${esc(t('home.partnersTitle'))}"><ul class="mq-track">${items}${items}${items}${items}</ul></div>`;
  }
  function teamCard(m) {
    return `<article class="team-card"><img src="${u(m.photo)}" alt="${esc(t('team.photoPending', [m.name]))}" width="120" height="120" loading="lazy">
      <div><h3>${esc(m.name)}</h3><p>${esc(t(m.roleKey))}</p>${m.provisional ? `<span class="chip warn">${esc(t('team.provisional'))}</span>` : ''}</div></article>`;
  }
  function newsCard(n) {
    return `<article class="news-card"><img src="${u('img/news/' + n.img + '.jpg')}" alt="" loading="lazy" width="800" height="450"><div class="news-body"><time datetime="${n.date}">${esc(B.date(n.date))}</time><h3>${esc(t('news.' + n.id + '.t'))}</h3><p>${esc(t('news.' + n.id + '.d'))}</p><button class="link-more" data-act="demo" data-msg="${esc(t('news.demoMsg'))}">${esc(t('common.readMore'))} <i class="bi bi-arrow-right"></i></button></div></article>`;
  }

  V['home:after'] = app => { initCarousel(app, '#heroCar'); };

  /* ---------- carrossel ---------- */
  function initCarousel(app, sel) {
    const c = app.querySelector(sel || '#carousel'); if (!c) return;
    const track = c.querySelector('.car-track'), slides = c.querySelectorAll('.car-slide'), dots = c.querySelectorAll('.car-dots button'); let i = 0, timer = null, paused = false;
    function go(n) {
      i = (n + slides.length) % slides.length; track.style.transform = `translateX(-${i * 100}%)`;
      slides.forEach((s, k) => { s.setAttribute('aria-hidden', k !== i); s.querySelectorAll('a,button').forEach(a => a.tabIndex = k === i ? 0 : -1); });
      dots.forEach((d, k) => { d.classList.toggle('on', k === i); d.setAttribute('aria-selected', k === i); });
    }
    function start() { stop(); if (B.reduced) return; timer = setInterval(() => { if (!paused) go(i + 1); }, 6000); }
    function stop() { if (timer) clearInterval(timer); }
    const pv = c.querySelector('.prev'), nx = c.querySelector('.next'); if (pv) pv.onclick = () => { go(i - 1); start(); }; if (nx) nx.onclick = () => { go(i + 1); start(); };
    dots.forEach(d => d.onclick = () => { go(+d.getAttribute('data-i')); start(); });
    c.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { go(i - 1); e.preventDefault(); } else if (e.key === 'ArrowRight') { go(i + 1); e.preventDefault(); } });
    c.addEventListener('mouseenter', () => paused = true); c.addEventListener('mouseleave', () => paused = false);
    c.addEventListener('focusin', () => paused = true); c.addEventListener('focusout', () => paused = false);
    let x0 = null; c.addEventListener('pointerdown', e => { x0 = e.clientX; }); c.addEventListener('pointerup', e => { if (x0 == null) return; const d = e.clientX - x0; x0 = null; if (Math.abs(d) > 50) { go(i + (d < 0 ? 1 : -1)); start(); } });
    c.addEventListener('pointercancel', () => x0 = null);
    go(0); start();
  }

  /* ---------- particulas do hero ---------- */
  let heroRaf = 0;
  function initHeroCanvas(app) {
    cancelAnimationFrame(heroRaf);
    const cv = app.querySelector('#heroCanvas'); if (!cv || B.reduced) return; const ctx = cv.getContext('2d'); let w, h, ps = [];
    function size() { const r = cv.getBoundingClientRect(); w = cv.width = r.width; h = cv.height = r.height; ps = Array.from({ length: Math.min(70, Math.round(w / 22)) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.8 + .4, v: Math.random() * .35 + .08, c: Math.random() > .5 ? '61,240,255' : '139,92,246' })); }
    size(); window.addEventListener('resize', size);
    (function loop() { if (!document.body.contains(cv)) return; ctx.clearRect(0, 0, w, h); ps.forEach(p => { p.y -= p.v; if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; } ctx.beginPath(); ctx.fillStyle = `rgba(${p.c},.65)`; ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }); heroRaf = requestAnimationFrame(loop); })();
  }
  function initTilt(app) {
    if (B.reduced || !window.matchMedia('(hover:hover)').matches) return;
    app.querySelectorAll('[data-tilt]').forEach(el => {
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = `perspective(700px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-4px)`; });
      el.addEventListener('pointerleave', () => el.style.transform = '');
    });
  }

  /* ---------- CATALOGO ---------- */
  let flt = { q: '', cat: '', price: '', sort: 'featured' };
  function filtered(base) {
    let l = base.slice();
    if (flt.q) l = l.filter(g => (g.name + ' ' + gTag(g)).toLowerCase().indexOf(flt.q.toLowerCase()) >= 0);
    if (flt.cat) l = l.filter(g => g.cats.indexOf(flt.cat) >= 0);
    if (flt.price === 'free') l = l.filter(g => g.free); else if (flt.price === 'paid') l = l.filter(g => !g.free); else if (flt.price === 'sale') l = l.filter(g => g.sale > 0);
    const s = flt.sort;
    l.sort((a, b) => s === 'name' ? a.name.localeCompare(b.name) : s === 'low' ? B.finalPrice(a) - B.finalPrice(b) : s === 'high' ? B.finalPrice(b) - B.finalPrice(a) : s === 'rating' ? b.stars - a.stars : (b.featured - a.featured));
    return l;
  }
  const filterBar = () => `<form class="filters" role="search" onsubmit="return false">
    <label class="f-search"><i class="bi bi-search"></i><span class="visually-hidden">${esc(t('filter.search'))}</span><input type="search" id="fq" value="${esc(flt.q)}" placeholder="${esc(t('filter.search'))}"></label>
    <label><span class="visually-hidden">${esc(t('filter.category'))}</span><select id="fcat"><option value="">${esc(t('filter.allCats'))}</option>${B.data.categories.map(c => `<option value="${c}" ${flt.cat === c ? 'selected' : ''}>${esc(catName(c))}</option>`).join('')}</select></label>
    <label><span class="visually-hidden">${esc(t('filter.price'))}</span><select id="fprice">${['', 'free', 'paid', 'sale'].map(p => `<option value="${p}" ${flt.price === p ? 'selected' : ''}>${esc(t('filter.price.' + (p || 'all')))}</option>`).join('')}</select></label>
    <label><span class="visually-hidden">${esc(t('filter.sort'))}</span><select id="fsort">${['featured', 'rating', 'name', 'low', 'high'].map(p => `<option value="${p}" ${flt.sort === p ? 'selected' : ''}>${esc(t('filter.sort.' + p))}</option>`).join('')}</select></label></form>`;
  function bindFilters(app, base) {
    const g = app.querySelector('#gridOut'); if (!g) return;
    const upd = () => { g.innerHTML = grid(filtered(base)); initTilt(g); app.querySelector('#countOut').textContent = t('filter.count', [filtered(base).length]); };
    [['fq', 'q', 'input'], ['fcat', 'cat', 'change'], ['fprice', 'price', 'change'], ['fsort', 'sort', 'change']].forEach(x => { const el = app.querySelector('#' + x[0]); if (el) el.addEventListener(x[2], () => { flt[x[1]] = el.value; upd(); }); });
    upd();
  }
  V.games = () => { if (B.qs('q')) flt.q = B.qs('q'); if (B.qs('cat')) flt.cat = B.qs('cat'); return `${pageHead('games.title', 'games.sub', 'nav.games')}<section class="section"><div class="container-xl">${filterBar()}<p class="count" id="countOut" aria-live="polite"></p><div id="gridOut"></div></div></section>`; };
  V['games:after'] = app => bindFilters(app, games());
  V.free = () => `${pageHead('free.title', 'free.sub', 'nav.free')}<section class="section"><div class="container-xl">${grid(games().filter(g => g.free))}</div></section>`;
  V['free:after'] = app => initTilt(app);
  V.promos = () => {
    const s = games().filter(g => g.sale > 0);
    return `${pageHead('promos.title', 'promos.sub', 'nav.promos')}<section class="section"><div class="container-xl">${demoNote('promos.note')}${grid(s)}
      <h2 class="mt-5 h3">${esc(t('promos.packs'))}</h2><div class="cols3 mt-3">${B.data.credits.map(packHtml).join('')}</div></div></section>`;
  };
  V['promos:after'] = app => initTilt(app);

  /* ---------- DETALHE DO JOGO ---------- */
  V.game = () => {
    const g = B.game(B.qs('id') || ''); if (!g) return V.error(404);
    const sr = B.data.sysreq[g.sysreq], inLib = B.S.lib.indexOf(g.id) >= 0;
    document.title = g.name + ' | Bhadott Games';
    const rel = games().filter(x => x.id !== g.id && x.cats.some(c => g.cats.indexOf(c) >= 0)).slice(0, 3);
    return `<section class="game-hero"><div class="game-hero-bg" style="background-image:url('${B.img(g, 'banner')}')"></div><div class="game-hero-shade"></div>
      <div class="container-xl game-hero-in">
        <nav class="crumbs" aria-label="breadcrumb"><a href="${u('jogos.html')}">${esc(t('nav.games'))}</a><span>/</span><b>${esc(g.name)}</b></nav>
        <div class="game-top"><img class="game-cover" src="${B.img(g, 'banner')}" alt="${esc(t('game.coverOf', [g.name]))}" width="1600" height="800">
          <div><div class="chips">${g.cats.map(c => `<span class="chip">${esc(catName(c))}</span>`).join('')}${ageHtml(g)}</div>
            <h1>${esc(g.name)}</h1><p class="lead-bd">${esc(gTag(g))}</p>
            <p class="stars" aria-label="${g.stars} / 5"><i class="bi bi-star-fill"></i> ${g.stars.toFixed(1)} <small>${esc(t('game.demoRating'))}</small></p>
            <div class="buy-box"><div class="buy-price">${priceHtml(g)}${g.sale ? `<span class="tag sale">-${g.sale}%</span>` : ''}</div>
              <div class="buy-btns">${inLib ? `<a class="btn btn-primary btn-lg" href="${u('biblioteca.html')}">${esc(t('store.inLibraryShort'))}</a>` : `<button class="btn btn-primary btn-lg" data-act="add" data-id="${g.id}"><i class="bi bi-bag-plus"></i> ${esc(g.free ? t('common.get') : t('store.addToCart'))}</button>`}
                <button class="btn btn-ghost btn-lg" data-act="fav" data-id="${g.id}" aria-pressed="${isFav(g.id)}"><i class="bi ${isFav(g.id) ? 'bi-heart-fill' : 'bi-heart'}"></i> ${esc(t('fav.title'))}</button>
                ${g.extUrl ? `<a class="btn btn-ghost btn-lg" href="${esc(g.extUrl)}" target="_blank" rel="noopener">${esc(t('game.external'))}</a>` : `<button class="btn btn-ghost btn-lg" data-act="demo" data-msg="${esc(t('game.externalSoon'))}"><i class="bi bi-box-arrow-up-right"></i> ${esc(t('game.external'))}</button>`}</div>
              <p class="small text-muted-bd mb-0"><i class="bi bi-flask"></i> ${esc(t('game.notReleased'))} — ${esc(t('game.release'))}: ${esc(B.date(g.release))}</p></div>
          </div></div></div></section>
    <section class="section"><div class="container-xl"><div class="game-grid">
      <div>
        <h2 class="h3">${esc(t('game.gallery'))}</h2>
        <div class="gallery">${[1, 2, 3].map(n => `<button type="button" class="shot" data-shot="${n}" aria-label="${esc(t('game.shot', [n]))}"><img loading="lazy" src="${u('img/games/' + g.id + '-shot' + n + '.jpg')}" alt="${esc(t('game.shotAlt', [g.name, n]))}"></button>`).join('')}</div>
        <h2 class="h3 mt-4">${esc(t('game.about'))}</h2><p>${esc(gDesc(g))}</p>
        <h2 class="h3 mt-4">${esc(t('game.features'))}</h2><ul class="check">${[1, 2, 3].map(n => `<li>${esc(t('g.' + g.id + '.f' + n))}</li>`).join('')}</ul>
      </div>
      <aside>
        <div class="panel"><h2 class="h5">${esc(t('game.sysreq'))} <span class="chip warn">${esc(t('common.demo'))}</span></h2>
          <dl class="spec"><dt>${esc(t('sr.os'))}</dt><dd>${esc(sr.os)}</dd><dt>${esc(t('sr.cpu'))}</dt><dd>${esc(sr.cpu)}</dd><dt>${esc(t('sr.ram'))}</dt><dd>${esc(sr.ram)}</dd><dt>${esc(t('sr.gpu'))}</dt><dd>${esc(sr.gpu)}</dd><dt>${esc(t('sr.disk'))}</dt><dd>${esc(sr.disk)}</dd></dl></div>
        <div class="panel mt-3"><h2 class="h5">${esc(t('game.info'))}</h2>
          <dl class="spec"><dt>${esc(t('game.age'))}</dt><dd>${ageHtml(g)} <small>${esc(t('game.ageDemo'))}</small></dd><dt>${esc(t('game.players'))}</dt><dd>${g.players}</dd><dt>${esc(t('filter.category'))}</dt><dd>${g.cats.map(catName).join(', ')}</dd></dl></div>
      </aside></div>
      ${rel.length ? `<h2 class="h3 mt-5">${esc(t('game.related'))}</h2>${grid(rel)}` : ''}</div></section>`;
  };
  V['game:after'] = app => {
    initTilt(app);
    const g = B.game(B.qs('id') || ''); if (!g) return;
    app.querySelectorAll('[data-shot]').forEach(b => b.addEventListener('click', () => {
      let n = +b.getAttribute('data-shot');
      const dlg = B.modal({ title: g.name, html: `<div class="lightbox"><img id="lbImg" src="${u('img/games/' + g.id + '-shot' + n + '.jpg')}" alt="${esc(t('game.shotAlt', [g.name, n]))}"></div>`, footer: `<button class="btn btn-ghost" id="lbP"><i class="bi bi-chevron-left"></i></button><span id="lbN">${n} / 3</span><button class="btn btn-ghost" id="lbX"><i class="bi bi-chevron-right"></i></button>` });
      const set = k => { n = (k + 2) % 3 + 1; dlg.querySelector('#lbImg').src = u('img/games/' + g.id + '-shot' + n + '.jpg'); dlg.querySelector('#lbN').textContent = n + ' / 3'; };
      dlg.querySelector('#lbP').onclick = () => set(n - 1); dlg.querySelector('#lbX').onclick = () => set(n + 1);
    }));
  };

  /* ---------- LOJA ---------- */
  const packHtml = p => `<div class="pack ${p.bonus ? 'best' : ''}"><i class="bi bi-coin"></i><b>${p.coins}</b><span>${esc(t('wallet.coins'))}</span>${p.bonus ? `<em>${esc(t('wallet.bonus'))}</em>` : ''}<strong>${B.money(p.price)}</strong><button class="btn btn-primary btn-sm" data-act="topup" data-id="${p.id}">${esc(t('wallet.buySim'))}</button></div>`;
  V.store = () => {
    const sale = games().filter(g => g.sale > 0)[0] || games()[0];
    return `${pageHead('store.title', 'store.sub', 'nav.store')}<section class="section"><div class="container-xl">${demoNote('store.note')}
      <div class="store-feature" style="background-image:url('${B.img(sale, 'banner')}')"><div class="store-feature-in"><span class="tag sale">-${sale.sale || 0}%</span><h2>${esc(sale.name)}</h2><p>${esc(gTag(sale))}</p><div>${priceHtml(sale)}</div><a class="btn btn-primary" href="${u('jogo.html?id=' + sale.id)}">${esc(t('common.details'))}</a></div></div>
      <nav class="store-links" aria-label="${esc(t('store.sections'))}"><a href="${u('promocoes.html')}"><i class="bi bi-tag"></i>${esc(t('nav.promos'))}</a><a href="${u('gratuitos.html')}"><i class="bi bi-gift"></i>${esc(t('nav.free'))}</a><a href="${u('carteira.html')}"><i class="bi bi-wallet2"></i>${esc(t('nav.wallet'))}</a><a href="${u('pedidos.html')}"><i class="bi bi-receipt"></i>${esc(t('nav.orders'))}</a><a href="${u('carrinho.html')}"><i class="bi bi-bag"></i>${esc(t('nav.cart'))}</a></nav>
      <h2 class="h3 mt-4">${esc(t('store.catalog'))}</h2>${filterBar()}<p class="count" id="countOut" aria-live="polite"></p><div id="gridOut"></div>
      <div class="panel mt-5"><h2 class="h5"><i class="bi bi-box-arrow-up-right"></i> ${esc(t('store.external'))}</h2><p class="mb-0">${esc(t('store.externalText'))}</p></div></div></section>`;
  };
  V['store:after'] = app => bindFilters(app, games());

  /* ---------- CARRINHO / CHECKOUT ---------- */
  const cartGames = () => B.S.cart.map(B.game).filter(Boolean);
  const totals = () => { const l = cartGames(); const price = l.reduce((a, g) => a + B.finalPrice(g), 0); return { price: Math.round(price * 100) / 100, coins: l.reduce((a, g) => a + B.coins(g), 0), n: l.length }; };
  V.cart = () => {
    const l = cartGames(), T = totals();
    return `${pageHead('cart.title', null, 'nav.cart')}<section class="section"><div class="container-xl">${demoNote('cart.note')}
      ${!l.length ? `<div class="empty"><i class="bi bi-bag"></i><p>${esc(t('cart.empty'))}</p><a class="btn btn-primary" href="${u('loja.html')}">${esc(t('cart.continue'))}</a></div>` : `
      <div class="cart-grid"><ul class="cart-list">${l.map(g => `<li><img src="${B.img(g, 'banner')}" alt="" width="144" height="72"><div><h3><a href="${u('jogo.html?id=' + g.id)}">${esc(g.name)}</a></h3><p>${esc(catName(g.cats[0]))}</p></div><div class="cart-price">${priceHtml(g)}</div><button class="icon-btn" data-act="remove" data-id="${g.id}" aria-label="${esc(t('cart.remove', [g.name]))}"><i class="bi bi-trash"></i></button></li>`).join('')}</ul>
        <aside class="panel summary"><h2 class="h5">${esc(t('cart.summary'))}</h2><dl class="spec"><dt>${esc(t('cart.items'))}</dt><dd>${T.n}</dd><dt>${esc(t('cart.total'))}</dt><dd><b>${B.money(T.price)}</b></dd><dt>${esc(t('cart.inCoins'))}</dt><dd>${T.coins} ${esc(t('wallet.coins'))}</dd></dl>
          <a class="btn btn-primary w-100" href="${u('checkout.html')}">${esc(t('cart.checkout'))}</a><a class="btn btn-ghost w-100 mt-2" href="${u('loja.html')}">${esc(t('cart.continue'))}</a></aside></div>`}
      </div></section>`;
  };
  let payMethod = 'coins';
  V.checkout = () => {
    const l = cartGames(), T = totals();
    if (!l.length) return V.cart();
    return `${pageHead('checkout.title', 'checkout.sub', 'nav.checkout')}<section class="section"><div class="container-xl">
      <div class="sim-banner" role="alert"><i class="bi bi-exclamation-triangle"></i><div><b>${esc(t('checkout.simTitle'))}</b><br>${esc(t('checkout.simText'))}</div></div>
      ${!B.S.user ? `<div class="panel center"><p>${esc(t('checkout.needLogin'))}</p><a class="btn btn-primary" href="${u('entrar.html')}">${esc(t('nav.login'))}</a></div>` : `
      <div class="cart-grid"><div class="panel"><h2 class="h5">${esc(t('checkout.method'))}</h2>
        <div class="pay-opts" role="radiogroup">
          ${[['coins', 'bi-coin', t('checkout.coins', [B.S.coins])], ['pix', 'bi-qr-code', t('checkout.pixSim')], ['card', 'bi-credit-card', t('checkout.cardSim')]].map(x => `<label class="pay"><input type="radio" name="pay" value="${x[0]}" ${payMethod === x[0] ? 'checked' : ''}><span><i class="bi ${x[1]}"></i> ${esc(x[2])}</span></label>`).join('')}
          <label class="pay disabled"><input type="radio" disabled><span><i class="bi bi-box-arrow-up-right"></i> ${esc(t('checkout.steam'))} <em>${esc(t('common.soon'))}</em></span></label>
        </div><p class="small text-muted-bd mt-3 mb-0"><i class="bi bi-shield-check"></i> ${esc(t('checkout.noCard'))}</p></div>
        <aside class="panel summary"><h2 class="h5">${esc(t('cart.summary'))}</h2><ul class="mini-list">${l.map(g => `<li><span>${esc(g.name)}</span><b>${g.free ? esc(t('common.free')) : B.money(B.finalPrice(g))}</b></li>`).join('')}</ul>
          <dl class="spec"><dt>${esc(t('cart.total'))}</dt><dd><b>${B.money(T.price)}</b></dd><dt>${esc(t('cart.inCoins'))}</dt><dd>${T.coins}</dd></dl>
          <button class="btn btn-primary w-100" data-act="placeOrder"><i class="bi bi-check2-circle"></i> ${esc(t('checkout.confirm'))}</button></aside></div>`}
      </div></section>`;
  };
  V['checkout:after'] = app => app.querySelectorAll('input[name=pay]').forEach(r => r.addEventListener('change', () => payMethod = r.value));
  B.actions.placeOrder = () => {
    const l = cartGames(), T = totals(); if (!l.length) return;
    if (payMethod === 'coins' && B.S.coins < T.coins) { B.toast(t('checkout.noCoins'), 'warn'); return; }
    if (payMethod === 'coins') { B.S.coins -= T.coins; B.S.tx.unshift({ d: new Date().toISOString(), k: 'spend', v: -T.coins }); }
    const o = { id: 'DEMO-' + String(Date.now()).slice(-6), d: new Date().toISOString(), items: l.map(g => g.id), total: T.price, method: payMethod };
    B.S.orders.unshift(o); l.forEach(g => { if (B.S.lib.indexOf(g.id) < 0) B.S.lib.push(g.id); }); B.S.cart = []; B.save();
    document.getElementById('app').innerHTML = `<section class="container-xl py-5"><div class="panel center"><i class="bi bi-check-circle big ok"></i><h1 class="h3">${esc(t('checkout.done'))}</h1><p>${esc(t('checkout.doneText', [o.id]))}</p><span class="chip warn">${esc(t('checkout.simTitle'))}</span><div class="mt-3"><a class="btn btn-primary" href="${u('biblioteca.html')}">${esc(t('nav.library'))}</a> <a class="btn btn-ghost" href="${u('pedidos.html')}">${esc(t('nav.orders'))}</a></div></div></section>`;
    window.scrollTo(0, 0);
  };
  B.actions.topup = el => {
    if (!B.S.user) { B.toast(t('auth.required'), 'warn'); return; }
    const p = B.data.credits.filter(x => x.id === el.getAttribute('data-id'))[0];
    B.confirm(t('wallet.buySim'), t('wallet.confirmText', [p.coins, B.money(p.price)]), () => { B.S.coins += p.coins; B.S.tx.unshift({ d: new Date().toISOString(), k: 'topup', v: p.coins }); B.save(); B.toast(t('wallet.done', [p.coins]), 'ok'); B.render(); });
  };

  /* ---------- AREA DO JOGADOR ---------- */
  V.orders = () => {
    if (!B.S.user) return needLogin();
    return `${pageHead('orders.title', 'orders.sub', 'nav.orders')}<section class="section"><div class="container-xl">${demoNote('orders.note')}
      ${!B.S.orders.length ? `<div class="empty"><i class="bi bi-receipt"></i><p>${esc(t('orders.empty'))}</p></div>` : `<div class="table-wrap"><table class="bd-table"><thead><tr><th>${esc(t('orders.id'))}</th><th>${esc(t('orders.date'))}</th><th>${esc(t('orders.items'))}</th><th>${esc(t('cart.total'))}</th><th>${esc(t('orders.method'))}</th></tr></thead><tbody>${B.S.orders.map(o => `<tr><td data-l="${esc(t('orders.id'))}">${o.id}</td><td data-l="${esc(t('orders.date'))}">${new Date(o.d).toLocaleString(B.lang)}</td><td data-l="${esc(t('orders.items'))}">${o.items.map(i => esc((B.game(i) || {}).name)).join(', ')}</td><td data-l="${esc(t('cart.total'))}">${B.money(o.total)}</td><td data-l="${esc(t('orders.method'))}">${esc(t('pay.' + o.method))}</td></tr>`).join('')}</tbody></table></div>`}</div></section>`;
  };
  V.wallet = () => {
    if (!B.S.user) return needLogin();
    return `${pageHead('wallet.title', 'wallet.sub', 'nav.wallet')}<section class="section"><div class="container-xl">${demoNote('wallet.note')}
      <div class="wallet-top panel"><div><p class="kicker">${esc(t('wallet.balance'))}</p><div class="balance"><i class="bi bi-coin"></i> ${B.S.coins} <small>${esc(t('wallet.coins'))}</small></div></div></div>
      <h2 class="h4 mt-4">${esc(t('wallet.packs'))}</h2><div class="cols3 mt-3">${B.data.credits.map(packHtml).join('')}</div>
      <h2 class="h4 mt-5">${esc(t('wallet.history'))}</h2>${!B.S.tx.length ? `<div class="empty"><p>${esc(t('wallet.noTx'))}</p></div>` : `<ul class="tx">${B.S.tx.slice(0, 20).map(x => `<li><span>${new Date(x.d).toLocaleString(B.lang)}</span><span>${esc(t('wallet.tx.' + x.k))}</span><b class="${x.v < 0 ? 'neg' : 'pos'}">${x.v > 0 ? '+' : ''}${x.v}</b></li>`).join('')}</ul>`}</div></section>`;
  };
  V.library = () => {
    if (!B.S.user) return needLogin();
    const l = B.S.lib.map(B.game).filter(Boolean);
    return `${pageHead('library.title', 'library.sub', 'nav.library')}<section class="section"><div class="container-xl">${demoNote('library.note')}${!l.length ? `<div class="empty"><i class="bi bi-collection-play"></i><p>${esc(t('library.empty'))}</p><a class="btn btn-primary" href="${u('loja.html')}">${esc(t('nav.store'))}</a></div>` : `<div class="gcards">${l.map(g => `<article class="gcard" data-tilt><a class="gcard-media" href="${u('jogo.html?id=' + g.id)}"><img loading="lazy" src="${B.img(g, 'banner')}" alt="${esc(t('game.coverOf', [g.name]))}"><span class="gcard-cat">${esc(catName(g.cats[0]))}</span></a><div class="gcard-body"><h3 class="gcard-title">${esc(g.name)}</h3><p class="gcard-tag">${esc(gTag(g))}</p><div class="gcard-foot">${g.id === 'planetario-bhadock' ? `<a class="btn btn-sm btn-primary" href="${u('planetario.html')}"><i class="bi bi-play-fill"></i> ${esc(t('library.play'))}</a>` : `<button class="btn btn-sm btn-primary" data-act="demo" data-msg="${esc(t('library.playDemo'))}"><i class="bi bi-play-fill"></i> ${esc(t('library.play'))}</button>`}</div></div></article>`).join('')}</div>`}</div></section>`;
  };
  V['library:after'] = app => initTilt(app);
  V.favorites = () => {
    if (!B.S.user) return needLogin();
    const l = B.S.fav.map(B.game).filter(Boolean);
    return `${pageHead('fav.title', 'fav.sub', 'nav.favorites')}<section class="section"><div class="container-xl">${grid(l)}</div></section>`;
  };
  V['favorites:after'] = app => initTilt(app);
  V.profile = () => {
    const us = B.S.user; if (!us) return needLogin();
    const lvl = 1 + Math.floor((B.S.lib.length + B.S.orders.length) / 2);
    return `${pageHead('profile.title', 'profile.sub', 'nav.profile')}<section class="section"><div class="container-xl"><div class="profile-grid">
      <div class="panel center"><span class="bd-avatar xl" style="--h:${us.hue}">${esc(us.name.charAt(0).toUpperCase())}</span><h2 class="h4 mt-3">${esc(us.name)}</h2><span class="bd-pill">${esc(t('demo.mode'))}</span><p class="small text-muted-bd mt-2">${esc(t('profile.since', [new Date(us.since).toLocaleDateString(B.lang)]))}</p></div>
      <div><div class="stats4"><div class="stat"><b>${lvl}</b><span>${esc(t('profile.level'))}</span></div><div class="stat"><b>${B.S.lib.length}</b><span>${esc(t('nav.library'))}</span></div><div class="stat"><b>${B.S.fav.length}</b><span>${esc(t('nav.favorites'))}</span></div><div class="stat"><b>${B.S.coins}</b><span>${esc(t('wallet.coins'))}</span></div></div>
        <form class="panel mt-3" id="formNome" novalidate><h2 class="h5">${esc(t('profile.edit'))}</h2><label class="fld"><span>${esc(t('auth.nickname'))}</span><input id="pNome" maxlength="24" required value="${esc(us.name)}"></label><button class="btn btn-primary mt-2" type="submit">${esc(t('common.save'))}</button></form></div></div></div></section>`;
  };
  V['profile:after'] = app => { const f = app.querySelector('#formNome'); if (f) f.onsubmit = e => { e.preventDefault(); const v = f.querySelector('#pNome').value.trim(); if (!v) { B.toast(t('auth.nameRequired'), 'warn'); return; } B.S.user.name = v; B.save(); B.toast(t('common.saved'), 'ok'); B.render(); }; };
  V.settings = () => {
    if (!B.S.user) return needLogin(); const s = B.S.settings;
    return `${pageHead('settings.title', 'settings.sub', 'nav.settings')}<section class="section"><div class="container-xl"><div class="panel narrow">
      ${[['sound', 'settings.sound'], ['motion', 'settings.motion'], ['newsletter', 'settings.news']].map(x => `<label class="switch"><input type="checkbox" data-set="${x[0]}" ${s[x[0]] ? 'checked' : ''}><span class="knob"></span><span>${esc(t(x[1]))}</span></label>`).join('')}
      <label class="fld mt-3"><span>${esc(t('settings.language'))}</span><select id="sLang"><option value="pt-BR" ${B.lang === 'pt-BR' ? 'selected' : ''}>Português (Brasil)</option><option value="en-US" ${B.lang === 'en-US' ? 'selected' : ''}>English (US)</option></select></label>
      <hr><button class="btn btn-ghost" data-act="resetDemo"><i class="bi bi-arrow-counterclockwise"></i> ${esc(t('settings.reset'))}</button></div></div></section>`;
  };
  V['settings:after'] = app => {
    app.querySelectorAll('[data-set]').forEach(c => c.addEventListener('change', () => { B.S.settings[c.getAttribute('data-set')] = c.checked; B.save(); B.toast(t('common.saved'), 'ok'); }));
    const l = app.querySelector('#sLang'); if (l) l.addEventListener('change', () => B.setLang(l.value));
  };
  B.actions.resetDemo = () => B.confirm(t('settings.reset'), t('settings.resetText'), () => { B.ls.del('badot.state'); location.href = u('index.html'); });

  /* ---------- LOGIN / CADASTRO DEMO ---------- */
  function enter(name, hue) {
    const first = !B.S.user && !B.S.since; const now = new Date().toISOString();
    B.S.user = { name: name, hue: hue != null ? hue : Math.floor(Math.random() * 360), since: now };
    if (first || !B.S.since) { B.S.since = now; B.S.coins = B.S.coins || 500; B.S.tx.unshift({ d: now, k: 'welcome', v: 500 }); }
    games().filter(g => g.free).forEach(g => { if (B.S.lib.indexOf(g.id) < 0) B.S.lib.push(g.id); });
    B.save(); B.toast(t('auth.welcome', [name]), 'ok');
  }
  const authCard = (title, sub, inner, foot) => `<section class="auth"><div class="auth-bg" style="background-image:url('${u('img/heros/heros01.jpg')}')"></div><div class="auth-card"><a class="bd-brand mb-3" href="${u('index.html')}"><img src="${u('img/brand/badot-mark.svg')}" width="38" height="38" alt=""><span class="bd-brand-text"><b>BHADOTT</b><small>GAMES</small></span></a><span class="bd-pill">${esc(t('demo.mode'))}</span><h1 class="h3 mt-2">${esc(t(title))}</h1><p class="text-muted-bd">${esc(t(sub))}</p>${inner}<p class="small mt-3 mb-0 text-muted-bd">${foot}</p></div></section>`;
  V.login = () => authCard('auth.loginTitle', 'auth.loginSub', `<form id="fAuth" novalidate><label class="fld"><span>${esc(t('auth.nickname'))}</span><input id="aNome" maxlength="24" autocomplete="off" placeholder="${esc(t('auth.nickPh'))}" required></label><div class="fld-err" id="aErr" role="alert"></div><button class="btn btn-primary w-100 mt-2" type="submit">${esc(t('auth.enter'))}</button></form><div class="sim-note"><i class="bi bi-shield-lock"></i> ${esc(t('auth.noPassword'))}</div>`, `<a href="${u('recuperar-senha.html')}">${esc(t('auth.forgot'))}</a> · <a href="${u('criar-conta.html')}">${esc(t('nav.signup'))}</a>`);
  V['login:after'] = app => { const f = app.querySelector('#fAuth'); f.onsubmit = e => { e.preventDefault(); const v = f.querySelector('#aNome').value.trim(); if (v.length < 2) { app.querySelector('#aErr').textContent = t('auth.nameRequired'); f.querySelector('#aNome').focus(); return; } enter(v); location.href = u('perfil.html'); }; };
  V.signup = () => authCard('auth.signupTitle', 'auth.signupSub', `<form id="fAuth" novalidate><label class="fld"><span>${esc(t('auth.nickname'))}</span><input id="aNome" maxlength="24" autocomplete="off" required></label><label class="fld"><span>${esc(t('auth.country'))}</span><select id="aPais"><option>Brasil</option><option>United States</option><option>Portugal</option><option>Other</option></select></label><label class="check-line"><input type="checkbox" id="aTermo"><span>${esc(t('auth.terms'))}</span></label><div class="fld-err" id="aErr" role="alert"></div><button class="btn btn-primary w-100 mt-2" type="submit">${esc(t('auth.create'))}</button></form><div class="sim-note"><i class="bi bi-shield-lock"></i> ${esc(t('auth.noPassword'))}</div>`, `<a href="${u('entrar.html')}">${esc(t('auth.haveAccount'))}</a>`);
  V['signup:after'] = app => { const f = app.querySelector('#fAuth'); f.onsubmit = e => { e.preventDefault(); const v = f.querySelector('#aNome').value.trim(), err = app.querySelector('#aErr'); if (v.length < 2) { err.textContent = t('auth.nameRequired'); return; } if (!f.querySelector('#aTermo').checked) { err.textContent = t('auth.termsRequired'); return; } enter(v); location.href = u('perfil.html'); }; };
  V.recover = () => authCard('auth.recoverTitle', 'auth.recoverSub', `<form id="fAuth" novalidate><label class="fld"><span>${esc(t('auth.nickname'))}</span><input id="aNome" maxlength="24" autocomplete="off" required></label><div class="fld-err" id="aErr" role="alert"></div><button class="btn btn-primary w-100 mt-2" type="submit">${esc(t('auth.recoverBtn'))}</button></form><div class="sim-note"><i class="bi bi-envelope-x"></i> ${esc(t('auth.recoverNote'))}</div>`, `<a href="${u('entrar.html')}">${esc(t('auth.back'))}</a>`);
  V['recover:after'] = app => { const f = app.querySelector('#fAuth'); f.onsubmit = e => { e.preventDefault(); if (f.querySelector('#aNome').value.trim().length < 2) { app.querySelector('#aErr').textContent = t('auth.nameRequired'); return; } B.toast(t('auth.recoverDone'), 'warn'); f.reset(); }; };

  /* ---------- INSTITUCIONAL ---------- */
  V.about = () => `${pageHead('about.title', 'about.sub', 'nav.studio')}
    <section class="section"><div class="container-xl"><div class="split-grid"><div class="reveal"><p class="kicker">${esc(t('about.k.history'))}</p><h2>${esc(t('about.historyTitle'))}</h2><p>${esc(t('about.history1'))}</p><p>${esc(t('about.history2'))}</p></div>
      <div class="reveal about-art" style="background-image:url('${B.img(B.game('magic-valmes'), 'banner')}')" role="img" aria-label="${esc(t('about.artAlt'))}"></div></div></div></section>
    <section class="section alt"><div class="container-xl">${head('about.k.values', 'about.valuesTitle')}<div class="cols3 reveal">${[['bi-controller', 'about.v1'], ['bi-mortarboard', 'about.v2'], ['bi-people', 'about.v3']].map(x => `<div class="feat"><i class="bi ${x[0]}"></i><h3>${esc(t(x[1] + 't'))}</h3><p>${esc(t(x[1] + 'd'))}</p></div>`).join('')}</div></div></section>
    <section class="section" id="equipe"><div class="container-xl">${head('about.k.team', 'about.teamTitle', 'about.teamSub')}
      <div class="team-grid reveal">${B.data.team.map(m => `<article class="team-full"><img src="${u(m.photo)}" alt="${esc(t('team.photoPending', [m.name]))}" width="220" height="220" loading="lazy"><div><h3>${esc(m.name)}</h3><p class="role">${esc(t(m.roleKey))}</p>${m.provisional ? `<span class="chip warn">${esc(t('team.provisional'))}</span>` : ''}<ul class="check">${[1, 2, 3, 4, 5].filter(n => B.dict['team.' + m.id + '.r' + n]).map(n => `<li>${esc(t('team.' + m.id + '.r' + n))}</li>`).join('')}</ul><p class="small text-muted-bd mb-0"><i class="bi bi-camera"></i> ${esc(t('team.photoNote'))}</p></div></article>`).join('')}</div></div></section>`;
  V['about:after'] = () => { };
  V.partners = () => `${pageHead('partners.title', 'partners.sub', 'nav.partners')}<section class="section"><div class="container-xl">${demoNote('partners.note')}${marquee()}
    <div class="cols3 mt-4 reveal">${B.data.partners.map(p => `<article class="partner" id="${p.id}"><div class="partner-logo">${p.logo ? `<img src="${u(p.logo)}" alt="${esc(p.name)}">` : `<span class="partner-ph">${esc(p.name)}</span>`}</div><h3>${esc(p.name)}</h3><p>${esc(t('partner.' + p.id + '.d'))}</p>${p.logo ? '' : `<span class="chip warn">${esc(t('partners.logoPending'))}</span>`}${p.url ? `<a class="btn btn-ghost btn-sm" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(t('partners.visit'))} <i class="bi bi-box-arrow-up-right"></i></a>` : `<button class="btn btn-ghost btn-sm" data-act="demo" data-msg="${esc(t('partners.linkPending'))}">${esc(t('partners.visit'))}</button>`}</article>`).join('')}</div></div></section>`;
  V.news = () => `${pageHead('news.title', 'news.sub', 'nav.news')}<section class="section"><div class="container-xl">${demoNote('news.note')}<div class="cols3 reveal">${B.data.news.map(newsCard).join('')}</div></div></section>`;

  /* ---------- PLANETARIUM (produto) e PLANETARIO (experiencia) ---------- */
  V.planetarium = () => {
    const g = B.game('planetario-bhadock');
    return `<section class="game-hero"><div class="game-hero-bg" style="background-image:url('${B.img(B.game('planetario-bhadock'), 'banner')}')"></div><div class="game-hero-shade"></div><div class="container-xl game-hero-in"><p class="kicker">${esc(t('plan.product'))}</p><h1>Bhadott Planetarium</h1><p class="lead-bd">${esc(t('plan.productSub'))}</p><div class="hero-cta"><a class="btn btn-primary btn-lg" href="${u('planetario.html')}">${esc(t('plan.launch'))} <i class="bi bi-stars"></i></a><a class="btn btn-ghost btn-lg" href="${u('jogo.html?id=planetario-bhadock')}">${esc(t('common.details'))}</a></div></div></section>
    <section class="section"><div class="container-xl"><div class="cols3 reveal">${[['bi-brightness-high', 'plan.f1'], ['bi-globe2', 'plan.f2'], ['bi-sliders', 'plan.f3']].map(x => `<div class="feat"><i class="bi ${x[0]}"></i><h3>${esc(t(x[1] + 't'))}</h3><p>${esc(t(x[1] + 'd'))}</p></div>`).join('')}</div>
      <h2 class="h3 mt-5">${esc(t('game.gallery'))}</h2><div class="gallery">${[1, 2, 3].map(n => `<div class="shot"><img loading="lazy" src="${u('img/games/planetario-bhadock-shot' + n + '.jpg')}" alt="${esc(t('game.shotAlt', ['Bhadott Planetarium', n]))}"></div>`).join('')}</div>
      <div class="panel mt-4">${priceHtml(g)} <span class="chip warn">${esc(t('common.demo'))}</span> <button class="btn btn-primary ms-2" data-act="add" data-id="${g.id}">${esc(t('common.get'))}</button></div></div></section>`;
  };
  V.planetario = () => '<div id="planetRoot"></div>'; // montado por planetarium.js

  /* ---------- CONTATO / PRIVACIDADE / TERMOS ---------- */
  V.contact = () => `${pageHead('legal.contactTitle', 'legal.contactSub', 'footer.contact')}<section class="section"><div class="container-xl"><form class="panel narrow" id="fContact" novalidate>${demoNote('demo.note')}<label class="fld"><span>${esc(t('legal.name'))}</span><input id="cNome" maxlength="60" required></label><label class="fld"><span>${esc(t('legal.message'))}</span><textarea id="cMsg" rows="5" maxlength="600" required></textarea></label><div class="fld-err" id="cErr" role="alert"></div><button class="btn btn-primary" type="submit">${esc(t('legal.send'))}</button></form></div></section>`;
  V['contact:after'] = app => { const f = app.querySelector('#fContact'); f.onsubmit = e => { e.preventDefault(); if (!f.querySelector('#cNome').value.trim() || !f.querySelector('#cMsg').value.trim()) { app.querySelector('#cErr').textContent = t('auth.nameRequired'); return; } B.toast(t('legal.sent'), 'warn'); f.reset(); }; };
  V.privacy = () => `${pageHead('legal.privacyTitle', 'legal.privacySub', 'footer.privacy')}<section class="section"><div class="container-xl prose">${[1, 2, 3].map(n => '<p>' + esc(t('legal.p' + n)) + '</p>').join('')}</div></section>`;
  V.terms = () => `${pageHead('legal.termsTitle', 'legal.termsSub', 'footer.terms')}<section class="section"><div class="container-xl prose">${[1, 2, 3].map(n => '<p>' + esc(t('legal.t' + n)) + '</p>').join('')}</div></section>`;

  /* ---------- ERRO ---------- */
  V.error = c => { document.title = '404 | Bhadott Games'; return `<section class="container-xl py-5"><div class="empty err"><i class="bi bi-rocket-takeoff"></i><h1>${esc(t('error.title'))}</h1><p>${esc(t('error.text'))}</p><a class="btn btn-primary" href="${u('index.html')}">${esc(t('error.back'))}</a> <a class="btn btn-ghost" href="${u('jogos.html')}">${esc(t('nav.games'))}</a></div></section>`; };
  V.erro = V.error;
})();
