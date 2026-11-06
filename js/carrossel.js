// Carrossel de destaques da página inicial (inspirado no Bhadott Games)
(() => {
  const raiz = document.querySelector(".hero-carrossel");
  if (!raiz) return;
  const slides = [...raiz.querySelectorAll(".slide")];
  const pontos = raiz.querySelector(".carrossel-pontos");
  const parado = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let atual = 0, timer = null;

  slides.forEach((s, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", `Destaque ${i + 1}`);
    b.addEventListener("click", () => { ir(i); reiniciar(); });
    pontos.appendChild(b);
  });
  const botoes = [...pontos.children];

  function ir(n) {
    atual = (n + slides.length) % slides.length;
    slides.forEach((s, i) => {
      const ativo = i === atual;
      s.classList.toggle("ativo", ativo);
      s.toggleAttribute("inert", !ativo);
      s.setAttribute("aria-hidden", ativo ? "false" : "true");
    });
    botoes.forEach((b, i) => b.setAttribute("aria-selected", i === atual ? "true" : "false"));
  }
  const reiniciar = () => {
    clearInterval(timer);
    if (!parado) timer = setInterval(() => { if (!document.hidden) ir(atual + 1); }, 7000);
  };

  raiz.querySelector(".anterior").addEventListener("click", () => { ir(atual - 1); reiniciar(); });
  raiz.querySelector(".proximo").addEventListener("click", () => { ir(atual + 1); reiniciar(); });
  raiz.addEventListener("mouseenter", () => clearInterval(timer));
  raiz.addEventListener("mouseleave", reiniciar);
  raiz.addEventListener("focusin", () => clearInterval(timer));
  raiz.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { ir(atual - 1); reiniciar(); }
    if (e.key === "ArrowRight") { ir(atual + 1); reiniciar(); }
  });

  // deslizar o dedo no celular
  let x0 = null;
  raiz.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  raiz.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) { ir(atual + (dx < 0 ? 1 : -1)); reiniciar(); }
    x0 = null;
  });

  // botão "Falar com ela" abre a AURA
  raiz.querySelectorAll("[data-abrir-aura]").forEach((b) => b.addEventListener("click", () => document.querySelector(".fab-chat")?.click()));

  ir(0);
  reiniciar();
})();
