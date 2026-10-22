// Service worker BHADOTT: funciona offline depois da primeira visita
const CACHE = "bhadott-__VERSION__";
const CORE = ["/", "/404.html", "/css/style.css", "/js/config.js", "/js/main.js", "/js/sky.js", "/js/chat.js", "/assets/icons.svg", "/assets/bha.svg", "/assets/favicon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  // Rede primeiro (sempre a versão mais nova); cache só quando estiver offline
  e.respondWith(fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || (req.mode === "navigate" ? caches.match("/404.html") : undefined))));
});
