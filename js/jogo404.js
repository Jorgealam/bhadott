// Minijogo da página 404: caçar estrelas por 20 segundos
(() => {
  const tela = document.getElementById("j-tela");
  if (!tela) return;
  const ctx = tela.getContext("2d");
  const $ = (id) => document.getElementById(id);
  const botao = $("j-iniciar");
  const DURACAO = 20;
  let itens = [], pontos = 0, fim = 0, rodando = false, ultimo = 0, efeitos = [];
  let recorde = 0;
  try { recorde = +localStorage.getItem("bh-recorde404") || 0; } catch {}
  $("j-recorde").textContent = recorde;

  const novo = () => {
    const r = Math.random();
    const tipo = r < 0.12 ? "meteoro" : r < 0.3 ? "ouro" : "estrela";
    itens.push({ tipo, x: 30 + Math.random() * (tela.width - 60), y: -20, v: 1.4 + Math.random() * 1.8 + (DURACAO - (fim - performance.now()) / 1000) * 0.05, r: tipo === "estrela" ? 16 : 20, giro: Math.random() * 6 });
  };

  const estrela = (x, y, r, giro, cor) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(giro); ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fillStyle = cor; ctx.shadowColor = cor; ctx.shadowBlur = 16; ctx.fill(); ctx.restore();
  };

  function quadro(t) {
    const dt = Math.min(40, t - ultimo); ultimo = t;
    ctx.clearRect(0, 0, tela.width, tela.height);
    const resta = Math.max(0, (fim - t) / 1000);
    $("j-tempo").textContent = Math.ceil(resta);
    if (Math.random() < 0.045) novo();
    for (const it of itens) {
      it.y += it.v * dt / 16; it.giro += 0.03;
      if (it.tipo === "meteoro") {
        const g = ctx.createRadialGradient(it.x, it.y, 2, it.x, it.y, it.r);
        g.addColorStop(0, "#ffd0c0"); g.addColorStop(0.5, "#ff4b3a"); g.addColorStop(1, "rgba(200,20,28,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(it.x, it.y, it.r, 0, 7); ctx.fill();
      } else estrela(it.x, it.y, it.r, it.giro, it.tipo === "ouro" ? "#ffc247" : "#bfe3ff");
    }
    itens = itens.filter((it) => it.y < tela.height + 30);
    efeitos = efeitos.filter((e) => (e.vida -= dt / 600) > 0);
    for (const e of efeitos) { ctx.globalAlpha = e.vida; ctx.fillStyle = e.cor; ctx.font = "bold 22px Bahnschrift, sans-serif"; ctx.fillText(e.txt, e.x, e.y - (1 - e.vida) * 30); }
    ctx.globalAlpha = 1;
    if (resta <= 0) return terminar();
    requestAnimationFrame(quadro);
  }

  function terminar() {
    rodando = false; itens = [];
    if (pontos > recorde) { recorde = pontos; try { localStorage.setItem("bh-recorde404", recorde); } catch {} }
    $("j-recorde").textContent = recorde;
    ctx.clearRect(0, 0, tela.width, tela.height);
    ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "italic 800 34px Bahnschrift, sans-serif";
    ctx.fillText(`${pontos} pontos!`, tela.width / 2, tela.height / 2 - 6);
    ctx.font = "18px Segoe UI, sans-serif"; ctx.fillStyle = "#aab3c7";
    ctx.fillText(pontos >= recorde && pontos > 0 ? "Novo recorde do universo! 🚀" : "Tente de novo e bata seu recorde.", tela.width / 2, tela.height / 2 + 28);
    ctx.textAlign = "start";
    botao.textContent = "Jogar de novo"; botao.hidden = false;
  }

  function clique(e) {
    if (!rodando) return;
    const r = tela.getBoundingClientRect();
    const x = (e.clientX - r.left) * (tela.width / r.width), y = (e.clientY - r.top) * (tela.height / r.height);
    const alvo = itens.find((it) => Math.hypot(it.x - x, it.y - y) < it.r + 12);
    if (!alvo) return;
    const valor = alvo.tipo === "meteoro" ? -2 : alvo.tipo === "ouro" ? 3 : 1;
    pontos = Math.max(0, pontos + valor);
    $("j-pontos").textContent = pontos;
    efeitos.push({ x: alvo.x, y: alvo.y, txt: (valor > 0 ? "+" : "") + valor, cor: valor > 0 ? "#3ddc97" : "#ff5d6c", vida: 1 });
    itens.splice(itens.indexOf(alvo), 1);
  }

  tela.addEventListener("pointerdown", clique);
  botao.addEventListener("click", () => {
    pontos = 0; itens = []; efeitos = []; $("j-pontos").textContent = 0;
    fim = performance.now() + DURACAO * 1000; ultimo = performance.now(); rodando = true; botao.hidden = true;
    requestAnimationFrame(quadro);
  });
})();
