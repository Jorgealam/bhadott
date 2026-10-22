// ============================================================
// Céu BHADOTT: estrelas, constelações, meteoros, cometa, efeito de
// "viagem" ao rolar, e o sistema solar do topo (erupções e inclinação 3D)
// ============================================================
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Sistema solar ----------
  document.querySelectorAll(".orbit").forEach((o) => {
    o.style.setProperty("--delay", `-${(Math.random() * parseFloat(o.style.getPropertyValue("--t"))).toFixed(2)}s`);
  });

  const sun = document.querySelector(".sun");
  if (sun) {
    const erupt = () => {
      if (sun.classList.contains("flaring")) return;
      sun.classList.add("flaring");
      setTimeout(() => sun.classList.remove("flaring"), 1400);
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const w = document.createElement("span");
          w.className = "wave";
          w.addEventListener("animationend", () => w.remove());
          sun.appendChild(w);
        }, i * 350);
      }
      for (let i = 0; i < 2; i++) {
        const p = document.createElement("span");
        p.className = "plasma";
        p.style.rotate = `${Math.random() * 360}deg`;
        p.addEventListener("animationend", () => p.remove());
        sun.appendChild(p);
      }
    };
    sun.addEventListener("click", erupt);
    if (!still) {
      const loop = () => setTimeout(() => { if (!document.hidden) erupt(); loop(); }, 7000 + Math.random() * 6000);
      loop();
    }
  }

  // Inclinação 3D do sistema solar acompanhando o mouse
  const wrap = document.querySelector(".solar-wrap");
  if (wrap && !still && matchMedia("(pointer: fine)").matches) {
    addEventListener("mousemove", (e) => {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      wrap.style.setProperty("--ry", `${x * 14}deg`);
      wrap.style.setProperty("--rx", `${18 - y * 12}deg`);
    }, { passive: true });
  }

  // ---------- Céu ----------
  const canvas = document.getElementById("sky");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(devicePixelRatio, 2);
  const hero = document.querySelector(".hero");
  // Constelações em fração da área do topo (hero), nos espaços livres
  const CONSTELACOES = [
    { nome: "Três Marias", x: 0.40, y: 0.06, w: 0.06, h: 0.05, pts: [[0, 1], [0.5, 0.5], [1, 0]], lin: [[0, 1], [1, 2]] },
    { nome: "Órion", x: 0.88, y: 0.04, w: 0.07, h: 0.2,
      pts: [[0, 0], [1, 0.05], [0.4, 0.5], [0.5, 0.52], [0.6, 0.54], [0.05, 1], [0.95, 0.95]],
      lin: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]] },
    { nome: "Cruzeiro do Sul", x: 0.06, y: 0.83, w: 0.045, h: 0.14, pts: [[0.5, 0], [0.5, 1], [0, 0.45], [1, 0.4], [0.7, 0.6]], lin: [[0, 1], [2, 3]] },
    { nome: "Escorpião", x: 0.26, y: 0.83, w: 0.11, h: 0.14,
      pts: [[0, 0], [0.15, 0.15], [0.3, 0.3], [0.35, 0.5], [0.5, 0.7], [0.75, 0.85], [1, 0.8], [0.95, 0.6]],
      lin: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]] },
  ];
  let stars = [], meteors = [], comet = null, mouse = { x: -1e4, y: -1e4 };
  let warp = 0, lastY = scrollY;
  addEventListener("mousemove", (e) => { mouse = { x: e.clientX * dpr, y: e.clientY * dpr }; }, { passive: true });
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

  const drawConstelacao = (c, r) => {
    const W = r.width * dpr, H = r.height * dpr, ox = r.left * dpr, oy = r.top * dpr;
    const p = c.pts.map(([px, py]) => [ox + (c.x + px * c.w) * W, oy + (c.y + py * c.h) * H]);
    const cx = ox + (c.x + c.w / 2) * W, cy = oy + (c.y + c.h / 2) * H;
    const near = Math.hypot(mouse.x - cx, mouse.y - cy) < Math.max(c.w * W, c.h * H) * 0.9;
    const base = light() ? "#4f46e5" : "#8fa6ff";
    ctx.globalAlpha = near ? 0.9 : 0.4;
    ctx.strokeStyle = near ? "#60a5fa" : base;
    ctx.lineWidth = (near ? 1.4 : 0.8) * dpr;
    ctx.beginPath();
    for (const [a, b] of c.lin) { ctx.moveTo(...p[a]); ctx.lineTo(...p[b]); }
    ctx.stroke();
    for (const [x, y] of p) {
      ctx.globalAlpha = near ? 1 : 0.7;
      ctx.fillStyle = light() ? "#4338ca" : "#fff";
      ctx.shadowColor = "#60a5fa"; ctx.shadowBlur = (near ? 12 : 4) * dpr;
      ctx.beginPath(); ctx.arc(x, y, (near ? 2.4 : 1.6) * dpr, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
    if (near) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = light() ? "#1e1b4b" : "#e8ebff";
      ctx.font = `${12 * dpr}px Inter, sans-serif`;
      ctx.fillText(c.nome, p[0][0], p[0][1] - 10 * dpr);
    }
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dark = !light();
    warp *= 0.92;
    for (const st of stars) {
      st.a = Math.max(0.2, Math.min(1, st.a + (Math.random() - 0.5) * 0.05));
      if (!still) { st.y += st.s + warp * st.s * 4; if (st.y > canvas.height) st.y = 0; }
      ctx.globalAlpha = st.a * (dark ? 1 : 0.5);
      ctx.fillStyle = dark ? "#cfe8ff" : "#6366f1";
      if (warp > 2) { // rastro de velocidade
        ctx.fillRect(st.x, st.y - warp * st.s * 6, st.r, warp * st.s * 6 + st.r);
      } else { ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fill(); }
    }

    const r = hero?.getBoundingClientRect();
    if (r && r.bottom > 0 && innerWidth > 960 && document.documentElement.dataset.section === "portal") {
      CONSTELACOES.forEach((c) => drawConstelacao(c, r));
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
