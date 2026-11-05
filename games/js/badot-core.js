/* Bhadott Games - Fase 01 - nucleo: i18n (JSON), estado demonstrativo, utilitarios, header/footer.
   Todo estado fica no navegador (localStorage). Nada e enviado a servidor. */
(function () {
  'use strict';
  var B = window.Badot = window.Badot || {};
  var body = document.body;
  B.root = body.getAttribute('data-root') || '/';
  B.views = B.views || {};
  B.lang = 'pt-BR';
  B.dict = {};
  B.data = null;

  /* ---------- utilitarios ---------- */
  B.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  B.url = function (p) { return B.root + p; };
  B.qs = function (k) { return new URLSearchParams(location.search).get(k); };
  var LS = B.ls = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { } }
  };
  B.t = function (key, vars) {
    var s = B.dict[key];
    if (s == null) s = key;
    if (vars) for (var i = 0; i < vars.length; i++) s = s.split('{' + i + '}').join(vars[i]);
    return s;
  };
  B.money = function (n) {
    try { return new Intl.NumberFormat(B.lang, { style: 'currency', currency: 'BRL' }).format(n); } catch (e) { return 'R$ ' + n.toFixed(2); }
  };
  B.date = function (iso) {
    try { return new Date(iso + 'T12:00:00').toLocaleDateString(B.lang, { day: '2-digit', month: 'long', year: 'numeric' }); } catch (e) { return iso; }
  };
  B.finalPrice = function (g) { return g.free ? 0 : Math.round(g.price * (100 - (g.sale || 0))) / 100; };
  B.coins = function (g) { return Math.round(B.finalPrice(g) * 10); };
  B.game = function (id) { return (B.data.games || []).filter(function (g) { return g.id === id; })[0]; };
  B.img = function (g, kind) { return B.url('img/games/' + g.id + '-' + kind + '.jpg'); }; // arte do proprietario: img/games/<id>-banner.jpg
  /* Imagem ausente => espaco reservado com proporcao e nome tecnico do arquivo (nunca imagem aleatoria). */
  document.addEventListener('error', function (e) {
    var i = e.target; if (!i || i.tagName !== 'IMG' || i.dataset.ph || !/\/img\/(games|news|ui|team)\//.test(i.src)) return;
    var path = i.src.replace(/^.*?\/img\//, 'img/').split('?')[0], ar = /-wide\./.test(path) ? '4 / 1' : /-banner\.|banner/.test(path) ? '2 / 1' : /-shot|news/.test(path) ? '16 / 9' : /loja/.test(path) ? '2 / 1' : (i.width && i.height ? i.width + ' / ' + i.height : '16 / 9');
    var d = document.createElement('div'); d.className = 'ph ' + (i.className || ''); d.setAttribute('role', 'img'); d.setAttribute('aria-label', B.t('ph.title') + ': ' + path); d.style.aspectRatio = ar;
    d.innerHTML = '<i class="bi bi-image"></i><b>' + B.esc(B.t('ph.title')) + '</b><code>' + B.esc(path) + '</code>';
    i.dataset.ph = 1; i.replaceWith(d);
  }, true);
  B.reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- estado demonstrativo ---------- */
  var DEF = { cart: [], fav: [], lib: [], user: null, coins: 0, orders: [], tx: [], since: null, settings: { sound: true, motion: true, newsletter: false } };
  B.S = LS.get('badot.state', null) || JSON.parse(JSON.stringify(DEF));
  for (var k in DEF) if (!(k in B.S)) B.S[k] = DEF[k];
  B.save = function () { LS.set('badot.state', B.S); B.refreshChrome(); };

  /* ---------- toasts e modal ---------- */
  B.toast = function (msg, type) {
    var box = document.getElementById('toasts'); if (!box) return;
    var el = document.createElement('div');
    el.className = 'bd-toast ' + (type || 'info'); el.setAttribute('role', 'status');
    el.innerHTML = '<i class="bi ' + (type === 'ok' ? 'bi-check-circle' : type === 'warn' ? 'bi-exclamation-triangle' : 'bi-info-circle') + '"></i><span>' + B.esc(msg) + '</span>';
    box.appendChild(el);
    setTimeout(function () { el.classList.add('out'); setTimeout(function () { el.remove(); }, 400); }, 3600);
  };
  var lastFocus = null;
  B.modal = function (opt) {
    var root = document.getElementById('modalRoot'); lastFocus = document.activeElement;
    root.innerHTML = '<div class="bd-modal-back" data-close></div><div class="bd-modal" role="dialog" aria-modal="true" aria-labelledby="mTitle"><div class="bd-modal-head"><h2 id="mTitle">' + B.esc(opt.title) + '</h2><button type="button" class="icon-btn" data-close aria-label="' + B.esc(B.t('common.close')) + '"><i class="bi bi-x-lg"></i></button></div><div class="bd-modal-body">' + opt.html + '</div>' + (opt.footer ? '<div class="bd-modal-foot">' + opt.footer + '</div>' : '') + '</div>';
    var dlg = root.querySelector('.bd-modal'); body.classList.add('modal-open-bd');
    var f = dlg.querySelector('input,select,textarea,button:not([data-close])') || dlg.querySelector('button');
    if (f) f.focus();
    root.onclick = function (e) { if (e.target.closest('[data-close]')) B.closeModal(); };
    root.onkeydown = function (e) {
      if (e.key === 'Escape') B.closeModal();
      if (e.key === 'Tab') { var els = dlg.querySelectorAll('a[href],button:not([disabled]),input,select,textarea'); if (!els.length) return; var a = els[0], z = els[els.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
    };
    return dlg;
  };
  B.closeModal = function () { var r = document.getElementById('modalRoot'); r.innerHTML = ''; r.onclick = null; r.onkeydown = null; body.classList.remove('modal-open-bd'); if (lastFocus && lastFocus.focus) lastFocus.focus(); };
  B.confirm = function (title, text, onYes) {
    var dlg = B.modal({ title: title, html: '<p>' + B.esc(text) + '</p>', footer: '<button class="btn btn-ghost" data-close>' + B.esc(B.t('common.cancel')) + '</button><button class="btn btn-primary" id="mYes">' + B.esc(B.t('common.confirm')) + '</button>' });
    dlg.querySelector('#mYes').onclick = function () { B.closeModal(); onYes(); };
  };

  /* ---------- i18n ---------- */
  function applyI18n(scope) {
    (scope || document).querySelectorAll('[data-i18n]').forEach(function (el) { var v = B.dict[el.getAttribute('data-i18n')]; if (v != null) el.textContent = v; });
    (scope || document).querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) { var p = pair.split(':'); var v = B.dict[p[1]]; if (v != null) el.setAttribute(p[0], v); });
    });
  }
  B.applyI18n = applyI18n;
  function loadJson(path) { return fetch(B.url(path) + '?v=6').then(function (r) { if (!r.ok) throw new Error(path + ' ' + r.status); return r.json(); }); }
  B.setLang = function (lang, silent) {
    return loadJson('lang/' + lang + '.json').then(function (d) {
      B.lang = lang; B.dict = d; LS.set('badot.lang', lang);
      document.cookie = 'badot_lang=' + lang + ';path=/;max-age=31536000;SameSite=Lax';
      document.documentElement.lang = lang === 'en-US' ? 'en' : 'pt-BR';
      applyI18n(); B.refreshChrome();
      document.querySelectorAll('[data-lang]').forEach(function (b) { var on = b.getAttribute('data-lang') === lang; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      var cur = document.getElementById('langCur'); if (cur) cur.innerHTML = '<img src="' + B.url('img/ui/flag-' + (lang === 'en-US' ? 'us' : 'br') + '.svg') + '" width="20" height="14" alt=""> ' + (lang === 'en-US' ? 'EN' : 'PT');
      var tk = 'meta.' + (body.getAttribute('data-view') || 'home'); if (d[tk + '.title']) document.title = d[tk + '.title'];
      if (!silent) B.render();
    }).catch(function (e) { console.error('Badot i18n', e); });
  };

  /* ---------- chrome (header/footer dinamicos) ---------- */
  /* ---------- tema claro/escuro ---------- */
  B.theme = function () { return LS.get('badot.theme', 'dark'); };
  B.setTheme = function (th) { LS.set('badot.theme', th); document.documentElement.setAttribute('data-theme', th); var m = document.querySelector('meta[name=theme-color]'); if (m) m.content = th === 'light' ? '#f3f4f9' : '#0a0b12'; B.refreshChrome(); };
  B.refreshChrome = function () {
    var n = B.S.cart.length, c = document.getElementById('cartCount');
    if (c) { c.hidden = n === 0; c.textContent = n; }
    var slot = document.getElementById('userSlot'); if (!slot) return;
    var u = B.S.user, th = B.theme(), item = function (href, key) { return '<li><a class="dropdown-item" href="' + B.url(href) + '">' + B.esc(B.t(key)) + '</a></li>'; };
    var dbar = document.getElementById('demoBar'); if (dbar) dbar.hidden = !u;
    slot.innerHTML = '<div class="dropdown"><button class="' + (u ? 'bd-user' : 'bd-icon-link bd-user-ico') + ' dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" aria-label="' + B.esc(B.t('nav.account')) + '">' +
      (u ? '<span class="bd-avatar">' + B.esc(u.name.charAt(0).toUpperCase()) + '</span><span class="bd-user-name">' + B.esc(u.name) + '</span>' : '<i class="bi bi-person-fill"></i>') + '</button>' +
      '<ul class="dropdown-menu dropdown-menu-end bd-dd">' +
      (u ? '<li class="dropdown-header"><span class="bd-pill">' + B.esc(B.t('demo.mode')) + '</span> · ' + B.S.coins + ' ' + B.esc(B.t('wallet.coins')) + '</li>' + item('perfil.html', 'nav.profile') + item('biblioteca.html', 'nav.library') + item('favoritos.html', 'nav.favorites') + item('carteira.html', 'nav.wallet') + item('pedidos.html', 'nav.orders') : item('entrar.html', 'nav.login') + item('criar-conta.html', 'nav.signup')) +
      '<li><hr class="dropdown-divider"></li>' +
      '<li><button type="button" class="dropdown-item ' + (th === 'dark' ? 'on' : '') + '" data-act="theme" data-theme="dark"><i class="bi bi-moon-stars"></i> ' + B.esc(B.t('theme.dark')) + '</button></li>' +
      '<li><button type="button" class="dropdown-item ' + (th === 'light' ? 'on' : '') + '" data-act="theme" data-theme="light"><i class="bi bi-brightness-high"></i> ' + B.esc(B.t('theme.light')) + '</button></li>' +
      '<li><a class="dropdown-item" href="' + B.url('configuracoes.html') + '"><i class="bi bi-gear"></i> ' + B.esc(B.t('nav.settings')) + '</a></li>' +
      (u ? '<li><button class="dropdown-item" data-act="logout"><i class="bi bi-box-arrow-right"></i> ' + B.esc(B.t('nav.logout')) + '</button></li>' : '') + '</ul></div>';
  };

  /* ---------- acoes globais (delegacao) ---------- */
  B.actions = {
    lang: function (el) { B.setLang(el.getAttribute('data-lang')); },
    logout: function () { B.S.user = null; B.save(); B.toast(B.t('auth.loggedOut'), 'info'); if (/perfil|biblioteca|favoritos|carteira|pedidos|configuracoes/.test(location.pathname)) location.href = B.url('entrar.html'); else B.render(); },
    add: function (el) {
      var id = el.getAttribute('data-id'), g = B.game(id); if (!g) return;
      if (B.S.lib.indexOf(id) >= 0) { B.toast(B.t('store.inLibrary'), 'info'); return; }
      if (B.S.cart.indexOf(id) >= 0) { B.toast(B.t('store.alreadyCart'), 'info'); return; }
      B.S.cart.push(id); B.save(); B.toast(B.t('store.added', [g.name]), 'ok');
      el.classList.add('bump'); setTimeout(function () { el.classList.remove('bump'); }, 500);
      var cc = document.getElementById('cartCount'); if (cc) { cc.classList.remove('pop'); void cc.offsetWidth; cc.classList.add('pop'); }
    },
    remove: function (el) { var i = B.S.cart.indexOf(el.getAttribute('data-id')); if (i >= 0) B.S.cart.splice(i, 1); B.save(); B.render(); },
    fav: function (el) {
      var id = el.getAttribute('data-id'), i = B.S.fav.indexOf(id);
      if (i >= 0) { B.S.fav.splice(i, 1); B.toast(B.t('fav.removed'), 'info'); } else { B.S.fav.push(id); B.toast(B.t('fav.added'), 'ok'); }
      B.save(); var on = B.S.fav.indexOf(id) >= 0; document.querySelectorAll('[data-act="fav"][data-id="' + id + '"]').forEach(function (b) { b.setAttribute('aria-pressed', on); b.querySelector('i').className = 'bi ' + (on ? 'bi-heart-fill' : 'bi-heart'); });
      if (body.getAttribute('data-view') === 'favorites') B.render();
    },
    search: function () { var d = B.modal({ title: B.t('filter.search'), html: '<form id="sf"><input class="modal-input" id="sq" type="search" placeholder="' + B.esc(B.t('filter.search')) + '"></form>' }); d.querySelector('#sf').onsubmit = function (e) { e.preventDefault(); location.href = B.url('jogos.html?q=' + encodeURIComponent(d.querySelector('#sq').value)); }; },
    theme: function (el) { B.setTheme(el.getAttribute('data-theme')); },
    demo: function (el) { B.toast(el.getAttribute('data-msg') || B.t('demo.action'), 'warn'); }
  };
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act],[data-lang]'); if (!el) return;
    if (el.hasAttribute('data-lang') && !el.hasAttribute('data-act')) { B.actions.lang(el); return; }
    var fn = B.actions[el.getAttribute('data-act')]; if (fn) { e.preventDefault(); fn(el, e); }
  });

  /* ---------- render ---------- */
  B.render = function () {
    var view = body.getAttribute('data-view'), app = document.getElementById('app'); if (!app) return;
    var fn = B.views[view] || B.views.error;
    app.innerHTML = fn() || '';
    applyI18n(app);
    var after = B.views[view + ':after']; if (after) after(app);
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      var map = { home: ['home'], games: ['games', 'game', 'free', 'promos'], store: ['store', 'cart', 'checkout', 'orders', 'wallet'], planetario: ['planetario', 'planetarium'], about: ['about'], partners: ['partners'], news: ['news'] };
      var on = (map[a.getAttribute('data-nav')] || []).indexOf(view) >= 0; a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    initReveal(app);
  };
  function initReveal(scope) {
    var els = scope.querySelectorAll('.reveal:not(.in)');
    if (B.reduced || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  function probe(base) { var exts = ['jpg', 'png', 'webp']; return exts.reduce(function (p, e) { return p.then(function (f) { return f || new Promise(function (res) { var i = new Image(); i.onload = function () { res(base + '.' + e); }; i.onerror = function () { res(null); }; i.src = B.url(base + '.' + e); }); }); }, Promise.resolve(null)); }
  B.start = function () {
    var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
    var pref = LS.get('badot.lang', null) || body.getAttribute('data-lang-server') || 'pt-BR';
    Promise.all([loadJson('data/games.json'), B.setLang(pref, true)]).then(function (r) {
      B.data = r[0]; return Promise.all((B.data.heros || []).map(probe)).then(function (l) { B.data.heros = l.filter(Boolean); return r; });
    }).then(function (r) { B.render(); B.refreshChrome();
      var h = location.hash; if (h) { var t = document.querySelector(h); if (t) t.scrollIntoView(); }
    }).catch(function (e) { console.error('Badot start', e); var a = document.getElementById('app'); if (a) a.innerHTML = '<div class="container-xl py-5"><p class="empty">Erro ao carregar dados / Failed to load data.</p></div>'; });
  };
})();
