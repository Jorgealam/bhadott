// ============================================================
// BHADOTT — núcleo do site
// ============================================================
(() => {
const CFG = window.BHADOTT_CONFIG || {};
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
};
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// ---------- Tela de carregamento (1x por sessão) ----------
const loader = $(".loader");
if (loader) {
  let seen = false;
  try { seen = sessionStorage.getItem("bh-loaded"); sessionStorage.setItem("bh-loaded", "1"); } catch {}
  if (seen || still) loader.remove();
  else {
    const hide = () => { loader.classList.add("done"); setTimeout(() => loader.remove(), 700); };
    if (document.readyState === "complete") setTimeout(hide, 900);
    else addEventListener("load", () => setTimeout(hide, 900));
  }
}

// ---------- Menu ----------
const burger = $(".burger");
const menu = $(".menu");
burger?.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
  burger.classList.toggle("open", open);
});
const path = location.pathname.replace(/index\.html$/, "");
$$(".menu a, .subnav a").forEach((a) => {
  const href = a.getAttribute("href").replace(/index\.html$/, "");
  const inMenu = !!a.closest(".menu");
  const active = href === "/" ? path === "/"
    : href === "/studio/" && inMenu ? path.startsWith("/studio/")
    : href === "/studio/servicos/" ? path.startsWith(href)
    : path === href;
  if (active) { a.classList.add("active"); a.setAttribute("aria-current", "page"); }
});
addEventListener("scroll", () => $(".header")?.classList.toggle("scrolled", scrollY > 10), { passive: true });

// ---------- Tema claro/escuro ----------
const themeBtn = $(".theme-toggle");
const currentTheme = () => document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
const syncThemeIcon = () => themeBtn?.querySelector("use")?.setAttribute("href", `/assets/icons.svg#${currentTheme() === "dark" ? "sun" : "moon"}`);
themeBtn?.addEventListener("click", () => {
  const t = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = t;
  store.set("bh-theme", t);
  syncThemeIcon();
});
syncThemeIcon();

// ---------- Idiomas (PT padrão; EN/ES via data/i18n.json) ----------
const langSel = $(".lang");
const original = new Map();
async function setLang(lang) {
  document.documentElement.lang = { pt: "pt-BR", en: "en", es: "es" }[lang];
  if (langSel) langSel.value = lang;
  let dict = {};
  if (lang !== "pt") {
    try { dict = (await (await fetch("/data/i18n.json")).json())[lang] || {}; } catch {}
  }
  $$("[data-i18n],[data-i18n-html],[data-i18n-ph]").forEach((el) => {
    const key = el.dataset.i18n || el.dataset.i18nHtml || el.dataset.i18nPh;
    if (!original.has(el)) original.set(el, el.dataset.i18nPh ? el.placeholder : el.dataset.i18nHtml ? el.innerHTML : el.textContent);
    const txt = dict[key] ?? original.get(el);
    if (el.dataset.i18nPh) el.placeholder = txt;
    else if (el.dataset.i18nHtml) el.innerHTML = txt;
    else el.textContent = txt;
  });
}
langSel?.addEventListener("change", () => { store.set("bh-lang", langSel.value); setLang(langSel.value); });
const savedLang = store.get("bh-lang");
if (savedLang && savedLang !== "pt") setLang(savedLang);

// ---------- Cookies (LGPD) + Google Analytics só com consentimento ----------
function loadGA() {
  if (!CFG.GA_ID || window.gtag) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${CFG.GA_ID}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag("js", new Date());
  gtag("config", CFG.GA_ID, { anonymize_ip: true });
}
const cookie = $(".cookie");
const ckAnalytics = $("#ck-analytics");
let consent = null;
try { consent = JSON.parse(store.get("bh-consent")); } catch {}
function saveConsent(analytics) {
  consent = { analytics, data: new Date().toISOString() };
  store.set("bh-consent", JSON.stringify(consent));
  cookie.hidden = true;
  if (analytics) loadGA();
}
if (consent) { if (consent.analytics) loadGA(); }
else if (cookie) setTimeout(() => (cookie.hidden = false), 1200);
$$("[data-cookie]").forEach((b) => b.addEventListener("click", () => {
  const a = b.dataset.cookie;
  saveConsent(a === "accept" ? true : a === "reject" ? false : ckAnalytics.checked);
}));
$$("[data-open-cookies]").forEach((b) => b.addEventListener("click", () => {
  ckAnalytics.checked = !!consent?.analytics;
  cookie.hidden = false;
}));

// ---------- Contatos vindos da configuração ----------
const whatsUrl = CFG.WHATSAPP ? `https://wa.me/${CFG.WHATSAPP}?text=${encodeURIComponent("Olá! Vim pelo site da BHADOTT.")}` : "";
$$("[data-whatsapp]").forEach((a) => {
  if (whatsUrl) { a.href = whatsUrl; a.target = "_blank"; a.rel = "noopener"; a.hidden = false; }
  else if (a.classList.contains("fab")) a.remove();
  else a.closest("li")?.remove();
});
$$("[data-email]").forEach((a) => {
  if (CFG.EMAIL) { a.href = `mailto:${CFG.EMAIL}`; a.textContent = CFG.EMAIL; } else a.closest("li")?.remove();
});
$$("[data-calendly]").forEach((a) => {
  if (CFG.CALENDLY_URL) { a.href = CFG.CALENDLY_URL; return; }
  a.textContent = "Peça um horário pelo formulário";
  a.addEventListener("click", (e) => { e.preventDefault(); $("#mensagem")?.focus(); });
});

// ---------- Animação de entrada e contadores ----------
const io = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add("visible");
  io.unobserve(e.target);
}), { threshold: 0.12 });
$$(".reveal").forEach((el) => io.observe(el));

const counter = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (!e.isIntersecting) return;
  const el = e.target, to = +el.dataset.to, t0 = performance.now();
  const tick = (t) => {
    const p = Math.min(1, (t - t0) / 1400);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  still ? (el.textContent = to) : requestAnimationFrame(tick);
  counter.unobserve(el);
}), { threshold: 0.6 });
$$(".count").forEach((el) => counter.observe(el));

// ---------- Filtro do portfólio (o blog tem o seu em blog.js) ----------
if (!$("#posts")) {
  $$(".filter").forEach((btn) => btn.addEventListener("click", () => {
    $$(".filter").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const cat = btn.dataset.filter;
    $$("[data-cat]").forEach((item) => { item.hidden = cat !== "all" && !item.dataset.cat.split(" ").includes(cat); });
  }));
}

// ---------- Atalhos para formulários ----------
$$("[data-vaga]").forEach((a) => a.addEventListener("click", () => {
  const sel = $("#c-vaga");
  if (sel) sel.value = a.dataset.vaga;
}));
$$("[data-recurso]").forEach((b) => b.addEventListener("click", () => {
  const sel = $("#r-material");
  if (sel) sel.value = b.dataset.recurso;
  $("#receber")?.scrollIntoView({ behavior: still ? "auto" : "smooth" });
  $("#r-nome")?.focus({ preventScroll: true });
}));

// Orçamento simulado → formulário de contato
const resumoBox = $(".orcamento-resumo");
if (resumoBox) {
  let r = null;
  try { r = sessionStorage.getItem("bh-orcamento"); } catch {}
  if (r) {
    resumoBox.hidden = false;
    resumoBox.textContent = r;
    $("#assunto").value = "Orçamento de projeto";
    $("#mensagem").value = r + "\n\nMais detalhes sobre o projeto: ";
  }
}

// ---------- Compartilhar posts ----------
$$("[data-share]").forEach((el) => el.addEventListener("click", async (e) => {
  e.preventDefault();
  const url = location.href;
  const kind = el.dataset.share;
  if (kind === "copy") { try { await navigator.clipboard.writeText(url); el.textContent = "Link copiado!"; } catch {} return; }
  const target = kind === "linkedin"
    ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    : `https://wa.me/?text=${encodeURIComponent(document.title + " " + url)}`;
  open(target, "_blank", "noopener");
}));

// ---------- Validação de formulários ----------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const onlyDigits = (v) => v.replace(/\D/g, "");
const maskPhone = (v) => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};
$$('[data-mask="phone"]').forEach((el) => el.addEventListener("input", () => { el.value = maskPhone(el.value); }));

function validateField(el) {
  if (el.closest(".hp") || el.type === "hidden") return "";
  if (el.type === "checkbox") return el.required && !el.checked ? "É preciso marcar esta opção para continuar." : "";
  const v = el.value.trim();
  const label = (el.labels?.[0]?.textContent || "Este campo").replace(/\*|\(opcional\)/gi, "").trim();
  if (el.type === "file") {
    const file = el.files[0];
    if (el.required && !file) return "Anexe o arquivo.";
    if (file && !/\.pdf$/i.test(file.name)) return "O arquivo deve estar em PDF.";
    if (file && el.dataset.maxsize && file.size > el.dataset.maxsize * 1048576) return `O arquivo deve ter no máximo ${el.dataset.maxsize} MB.`;
    return "";
  }
  if (el.tagName === "SELECT" && el.required && !v) return "Selecione uma opção.";
  if (el.required && !v) return `${label} é obrigatório.`;
  if (!v) return "";
  if (el.type === "email" && !EMAIL_RE.test(v)) return "Informe um e-mail válido, como nome@empresa.com.";
  if (el.type === "tel" && ![10, 11].includes(onlyDigits(v).length)) return "Informe um telefone com DDD, como (11) 90000-0000.";
  if (el.type === "url") { try { new URL(v); } catch { return "Informe um link completo, começando com https://."; } }
  if (el.minLength > 0 && v.length < el.minLength) return `${label} precisa ter pelo menos ${el.minLength} caracteres.`;
  if (el.maxLength > 0 && v.length > el.maxLength) return `${label} pode ter no máximo ${el.maxLength} caracteres.`;
  return "";
}

function showError(el, msg) {
  const host = el.closest(".field") || el.closest(".check");
  if (!host) return;
  let err = host.querySelector(".field-error");
  if (!err) {
    err = document.createElement("small");
    err.className = "field-error";
    err.id = `${el.id || el.name}-error`;
    host.appendChild(err);
  }
  err.textContent = msg;
  el.setAttribute("aria-invalid", msg ? "true" : "false");
  msg ? el.setAttribute("aria-describedby", err.id) : el.removeAttribute("aria-describedby");
}

// Anti-spam Cloudflare Turnstile (se configurado)
if (CFG.TURNSTILE_SITEKEY && $(".turnstile")) {
  $$(".turnstile").forEach((d) => { d.className = "cf-turnstile"; d.dataset.sitekey = CFG.TURNSTILE_SITEKEY; });
  const s = document.createElement("script");
  s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
  s.async = true;
  document.head.appendChild(s);
}

const SUCCESS = {
  newsletter: "Inscrição confirmada! Fique de olho no seu e-mail.",
  ebook: "Pronto! O guia está a caminho do seu e-mail.",
  recurso: "Pronto! O material está a caminho do seu e-mail.",
  carreira: "Candidatura recebida! Respondemos todos os envios.",
  contato: "Mensagem enviada! Respondemos em até 1 dia útil.",
};

$$("form[data-form]").forEach((form) => {
  const inputs = $$("input, select, textarea", form);
  inputs.forEach((el) => {
    el.addEventListener("blur", () => showError(el, validateField(el)));
    el.addEventListener("input", () => { if (el.getAttribute("aria-invalid") === "true") showError(el, validateField(el)); });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = $(".form-status", form);
    if (form.elements.website?.value) return; // honeypot preenchido = robô
    let firstInvalid = null;
    inputs.forEach((el) => {
      const msg = validateField(el);
      showError(el, msg);
      if (msg && !firstInvalid) firstInvalid = el;
    });
    if (firstInvalid) {
      status.textContent = "Revise os campos destacados.";
      status.className = "form-status err";
      firstInvalid.focus();
      return;
    }
    const btn = $('[type="submit"]', form);
    btn.disabled = true;
    const body = new FormData(form);
    body.append("_origem", form.dataset.form);
    body.append("_pagina", location.pathname);
    try {
      if (CFG.FORM_ENDPOINT) {
        const res = await fetch(CFG.FORM_ENDPOINT, { method: "POST", body, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error();
      }
      if (CFG.CRM_WEBHOOK) {
        const lead = Object.fromEntries([...body].filter(([, v]) => typeof v === "string"));
        fetch(CFG.CRM_WEBHOOK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) }).catch(() => {});
      }
      status.textContent = (SUCCESS[form.dataset.form] || SUCCESS.contato) + (CFG.FORM_ENDPOINT ? "" : " (modo demonstração)");
      status.className = "form-status ok";
      if (typeof gtag === "function") gtag("event", "generate_lead", { form: form.dataset.form });
      form.reset();
      try { sessionStorage.removeItem("bh-orcamento"); } catch {}
      if (form.closest("dialog")) setTimeout(() => form.closest("dialog").close(), 1800);
    } catch {
      status.textContent = "Não foi possível enviar agora. Tente novamente em instantes" + (CFG.EMAIL ? ` ou escreva para ${CFG.EMAIL}.` : ".");
      status.className = "form-status err";
    } finally {
      btn.disabled = false;
    }
  });
});

// ---------- Pop-up de saída (1x por visitante, só desktop) ----------
const exitModal = $(".exit-modal");
if (exitModal && CFG.EXIT_POPUP && finePointer && !store.get("bh-exit") && !location.pathname.includes("recursos")) {
  const onLeave = (e) => {
    if (e.relatedTarget || e.clientY > 8 || (cookie && !cookie.hidden)) return;
    store.set("bh-exit", "1");
    exitModal.showModal();
    document.removeEventListener("mouseout", onLeave);
  };
  setTimeout(() => document.addEventListener("mouseout", onLeave), 15000);
}
exitModal && $(".modal-close", exitModal).addEventListener("click", () => exitModal.close());
exitModal?.addEventListener("click", (e) => { if (e.target === exitModal) exitModal.close(); });

// ---------- Botões magnéticos ----------
if (finePointer && !still) {
  $$(".magnetic").forEach((b) => {
    b.addEventListener("mousemove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.25}px ${(e.clientY - r.top - r.height / 2) * 0.35}px`;
    });
    b.addEventListener("mouseleave", () => { b.style.translate = ""; });
  });
}

// ---------- Rastro de luz do cursor ----------
const trail = $(".trail");
if (trail && finePointer && !still) {
  const ctx = trail.getContext("2d");
  const pts = [];
  const size = () => { trail.width = innerWidth; trail.height = innerHeight; };
  size(); addEventListener("resize", size);
  addEventListener("mousemove", (e) => pts.push({ x: e.clientX, y: e.clientY, life: 1 }), { passive: true });
  const draw = () => {
    ctx.clearRect(0, 0, trail.width, trail.height);
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      p.life -= 0.05;
      if (p.life <= 0) { pts.splice(i, 1); continue; }
      ctx.globalAlpha = p.life * 0.55;
      ctx.fillStyle = i % 2 ? "#60a5fa" : "#a78bfa";
      ctx.beginPath(); ctx.arc(p.x, p.y, 3 * p.life + 0.5, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(draw);
  };
  draw();
} else trail?.remove();

// ---------- PWA (instalável e offline) ----------
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
})();
