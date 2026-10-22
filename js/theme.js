// Aplica o tema salvo antes da pintura (evita "piscar")
try { const t = localStorage.getItem("bh-theme"); if (t) document.documentElement.dataset.theme = t; } catch {}
