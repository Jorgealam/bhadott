// ============================================================
// Céu BHADOTT: estrelas, meteoros, cometa e efeito de "viagem" ao rolar
// ============================================================
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("sky");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(devicePixelRatio, 2);
  let stars = [], meteors = [], comet = null;
  let warp = 0, lastY = scrollY;
  addEventListener("scroll", () => { warp = Math.min(30, warp + Math.abs(scrollY - lastY) * 0.15); lastY = scrollY; }, { passive: true });

  const light = () => document.documentElement.dataset.theme === "light" ||
    (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: light)").matches);

  const resize = () => {
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    stars = Array.from({ length: Math.min(260, innerWidth / 5) }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.4 * dpr, s: Math.random() * 0.15 + 0.02, a: Math.random(),
    }));
  };

  const spawnMeteor = () => {
    const ang = Math.PI * (0.15 + Math.random() * 0.15), v = (9 + Math.random() * 6) * dpr;
    meteors.push({ x: Math.random() * canvas.width * 0.8, y: Math.random() * canvas.height * 0.4, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, life: 1 });
  };
  const spawnComet = () => {
    const fromLeft = Math.random() < 0.5;
    comet = { x: fromLeft ? -50 : canvas.width + 50, y: Math.random() * canvas.height * 0.5, vx: (fromLeft ? 1 : -1) * 2.2 * dpr, vy: 0.5 * dpr, tail: [] };
  };

  const draw = () => {
    if (document.hidden) { requestAnimationFrame(draw); return; } // aba em segundo plano: não desenha
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dark = !light();
    warp *= 0.92;
    for (const st of stars) {
      st.a = Math.max(0.2, Math.min(1, st.a + (Math.random() - 0.5) * 0.05));
      if (!still) { st.y += st.s + warp * st.s * 4; if (st.y > canvas.height) st.y = 0; }
      ctx.globalAlpha = st.a * (dark ? 1 : 0.5);
      ctx.fillStyle = dark ? "#cfe8ff" : "#6366f1";
      if (warp > 2) ctx.fillRect(st.x, st.y - warp * st.s * 6, st.r, warp * st.s * 6 + st.r); // rastro de velocidade
      else { ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fill(); }
    }

    if (!still) {
      if (Math.random() < 0.01) spawnMeteor();
      if (!comet && Math.random() < 0.0008) spawnComet();
    }
    meteors = meteors.filter((m) => m.life > 0);
    for (const m of meteors) {
      const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 8, m.y - m.vy * 8);
      g.addColorStop(0, dark ? "rgba(255,255,255,1)" : "rgba(79,70,229,1)");
      g.addColorStop(1, "rgba(96,165,250,0)");
      ctx.globalAlpha = m.life;
      ctx.strokeStyle = g; ctx.lineWidth = 2 * dpr;
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 8, m.y - m.vy * 8); ctx.stroke();
      m.x += m.vx; m.y += m.vy; m.life -= 0.015;
    }
    if (comet) {
      comet.tail.unshift({ x: comet.x, y: comet.y });
      comet.tail.length = Math.min(comet.tail.length, 60);
      comet.tail.forEach((t, i) => {
        ctx.globalAlpha = (1 - i / 60) * 0.5;
        ctx.fillStyle = i % 3 ? "#93c5fd" : "#c4b5fd";
        ctx.beginPath(); ctx.arc(t.x, t.y, (5 - i / 14) * dpr, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff"; ctx.shadowColor = "#93c5fd"; ctx.shadowBlur = 20 * dpr;
      ctx.beginPath(); ctx.arc(comet.x, comet.y, 4 * dpr, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      comet.x += comet.vx; comet.y += comet.vy;
      if (comet.x < -100 || comet.x > canvas.width + 100) comet = null;
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  };
  addEventListener("resize", resize);
  resize(); draw();
})();
