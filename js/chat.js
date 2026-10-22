// ============================================================
// Assistente AURA — a inteligência artificial da BHADOTT Studio.
// Cada mensagem acende uma estrela no céu do chat e a liga às anteriores,
// formando a constelação da conversa.
// Sem CHAT_API configurado, responde com a base local abaixo.
// ============================================================
(() => {
  const CFG = window.BHADOTT_CONFIG || {};
  const panel = document.getElementById("chat");
  const fab = document.querySelector(".fab-chat");
  if (!panel || !fab) return;
  const log = panel.querySelector(".chat-log");
  const chips = panel.querySelector(".chat-chips");
  const form = panel.querySelector(".chat-form");
  const input = panel.querySelector("#chat-input");
  const history = [];

  // ---------- Base de conhecimento local ----------
  const KB = [
    { k: ["oi", "ola", "olá", "bom dia", "boa tarde", "boa noite", "hey", "hello"],
      r: "Olá! 👋 Eu sou a AURA, a IA da BHADOTT Studio. Posso te mostrar nossos serviços, projetos, preços ou te levar ao orçamento. Por onde começamos?" },
    { k: ["preço", "preco", "quanto custa", "valor", "orçamento", "orcamento", "custo"],
      r: "Cada projeto tem um escopo, mas você pode ver uma estimativa na hora no <a href=\"/studio/orcamento.html\">orçamento interativo</a>. Para produtos prontos, as licenças começam em R$ 59/mês." },
    { k: ["prazo", "demora", "tempo", "quando fica"],
      r: "Sites e protótipos saem em poucas semanas; apps e sistemas completos levam alguns meses. O <a href=\"/studio/orcamento.html\">orçamento interativo</a> calcula o prazo para o seu caso." },
    { k: ["jogo", "jogos", "game", "godot", "unity", "unreal"],
      r: "Fazemos jogos 2D e 3D em Godot — veja <a href=\"/studio/cases/fathomfield.html\">FATHOMFIELD</a> e o serviço de <a href=\"/studio/servicos/jogos.html\">desenvolvimento de jogos</a>." },
    { k: ["app", "aplicativo", "android", "ios", "celular", "offline"],
      r: "Criamos apps para Android, iOS e desktop — inclusive apps que funcionam sem internet. Saiba mais em <a href=\"/studio/servicos/aplicativos.html\">Aplicativos</a>." },
    { k: ["sistema", "saas", "gestão", "gestao", "erp"],
      r: "Desenvolvemos sistemas de gestão e plataformas SaaS sob medida. Um exemplo é o <a href=\"/studio/cases/bhadott-agro.html\">BHADOTT Agro</a>." },
    { k: ["ia", "inteligência", "inteligencia", "chatbot", "automação", "automacao", "aura", "gpt", "claude", "gemini"],
      r: "IA é com a gente — inclusive eu! ✨ Sou a <a href=\"/studio/cases/aura.html\">AURA</a>: minha versão completa, no computador, conversa por voz, gera imagens e tem um núcleo holográfico. Veja também o serviço de <a href=\"/studio/servicos/ia-automacao.html\">IA e automação</a>." },
    { k: ["site", "portal", "landing", "seo"],
      r: "Fazemos sites e portais rápidos e otimizados para o Google — como este que você está vendo. Veja <a href=\"/studio/servicos/sites-portais.html\">Sites e Portais</a>." },
    { k: ["agro", "fazenda", "rural", "rebanho"],
      r: "O <a href=\"/studio/cases/bhadott-agro.html\">BHADOTT Agro</a> cuida de produção, estoque, financeiro e rebanho da propriedade." },
    { k: ["3d", "blender", "vídeo", "video", "animação", "animacao"],
      r: "Fazemos modelagem e animação 3D no Blender e vídeos com apoio de IA. Veja <a href=\"/studio/servicos/audiovisual-3d.html\">Audiovisual e 3D</a>." },
    { k: ["portfólio", "portfolio", "projetos", "cases", "exemplos"],
      r: "Todos os projetos estão no <a href=\"/studio/portfolio.html\">portfólio</a>, com o status real de cada um." },
    { k: ["vaga", "emprego", "trabalhar", "carreira", "colaborar", "freela"],
      r: "Trabalhamos com colaboradores remotos por projeto. Veja as <a href=\"/carreira.html\">colaborações abertas</a> e o desafio de código." },
    { k: ["contato", "falar", "whatsapp", "email", "e-mail", "telefone", "humano", "pessoa"],
      r: "Claro! Fale com a gente pela página de <a href=\"/contato.html\">contato</a>" + (CFG.WHATSAPP ? ` ou direto no <a href="https://wa.me/${CFG.WHATSAPP}" target="_blank" rel="noopener">WhatsApp</a>` : "") + "." },
    { k: ["código", "codigo", "fonte", "licença", "licenca", "plano", "planos"],
      r: "Há licenças mensal (R$ 59), anual (R$ 549), por prazo indeterminado (R$ 1.490) e a cessão com código-fonte (a partir de R$ 15.000). Compare no <a href=\"/studio/orcamento.html#planos\">comparador de planos</a>." },
    { k: ["investir", "investidor", "investimento", "parceria", "sócio", "socio"],
      r: "Que bom! Veja a página de <a href=\"/investimentos.html\">investidores</a> e peça a apresentação pelo contato." },
    { k: ["quem", "fundador", "jorge", "sobre", "empresa", "bhadott"],
      r: "A BHADOTT foi criada por Jorge Alam e reúne jogos, apps, sistemas e IA. Conheça a história em <a href=\"/sobre.html\">Sobre</a>." },
    { k: ["constelação", "constelacao", "estrela", "sol", "planeta"],
      r: "Cada mensagem nossa acende uma estrela aqui atrás ✨. Na página inicial, cada planeta é um serviço — e o Sol solta erupções quando você clica!" },
    { k: ["obrigado", "obrigada", "valeu", "thanks"],
      r: "Por nada! Boa viagem pelo universo BHADOTT 🚀" },
  ];
  const CHIPS = ["Quanto custa?", "Vocês fazem jogos?", "Quero um app", "Falar com uma pessoa"];
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  function localReply(text) {
    const t = norm(text);
    let best = null, score = 0;
    for (const item of KB) {
      // palavra inteira: "ia" não casa com "dia" nem "família"
      const s = item.k.filter((k) => ` ${t.replace(/[^a-z0-9]+/g, " ")} `.includes(` ${norm(k).replace(/[^a-z0-9]+/g, " ").trim()} `)).length;
      if (s > score) { score = s; best = item; }
    }
    return best ? best.r : "Ainda estou aprendendo sobre isso 🌌. Posso te levar ao <a href=\"/studio/orcamento.html\">orçamento</a>, ao <a href=\"/studio/portfolio.html\">portfólio</a> ou ao <a href=\"/contato.html\">contato</a> com nossa equipe.";
  }

  async function reply(text) {
    if (!CFG.CHAT_API) return localReply(text);
    try {
      const res = await fetch(CFG.CHAT_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history }) });
      const data = await res.json();
      return (data.reply || localReply(text)).replace(/</g, "&lt;");
    } catch { return localReply(text); }
  }

  // ---------- Céu do chat (constelação da conversa) ----------
  const sky = panel.querySelector(".chat-sky");
  const sctx = sky.getContext("2d");
  const stars = [];
  function addStar(user) {
    const w = sky.width, h = sky.height;
    const last = stars[stars.length - 1];
    const x = last ? Math.max(20, Math.min(w - 20, last.x + (Math.random() - 0.5) * 140)) : w * 0.5;
    const y = last ? Math.max(20, Math.min(h - 20, last.y + (Math.random() - 0.3) * 90)) : h * 0.3;
    stars.push({ x, y, user, born: performance.now() });
  }
  function drawSky(t) {
    if (panel.hidden) return;
    sctx.clearRect(0, 0, sky.width, sky.height);
    sctx.strokeStyle = "rgba(147,197,253,.35)";
    sctx.lineWidth = 1;
    sctx.beginPath();
    stars.forEach((s, i) => (i ? sctx.lineTo(s.x, s.y) : sctx.moveTo(s.x, s.y)));
    sctx.stroke();
    for (const s of stars) {
      const age = Math.min(1, (t - s.born) / 600);
      const tw = 0.7 + Math.sin(t / 500 + s.x) * 0.3;
      sctx.globalAlpha = age * tw;
      sctx.fillStyle = s.user ? "#c4b5fd" : "#93c5fd";
      sctx.shadowColor = sctx.fillStyle; sctx.shadowBlur = 10;
      sctx.beginPath(); sctx.arc(s.x, s.y, 2 + age * 1.5, 0, Math.PI * 2); sctx.fill();
    }
    sctx.globalAlpha = 1; sctx.shadowBlur = 0;
    requestAnimationFrame(drawSky);
  }

  // ---------- Interface ----------
  function bubble(html, who) {
    const b = document.createElement("div");
    b.className = `msg msg-${who}`;
    b.innerHTML = html;
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
    addStar(who === "user");
    return b;
  }
  function renderChips() {
    chips.innerHTML = "";
    CHIPS.forEach((c) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "chip"; b.textContent = c;
      b.addEventListener("click", () => send(c));
      chips.appendChild(b);
    });
  }
  async function send(text) {
    text = text.trim();
    if (!text) return;
    bubble(text.replace(/</g, "&lt;"), "user");
    history.push({ role: "user", content: text });
    const typing = bubble('<span class="typing"><i></i><i></i><i></i></span>', "bot");
    const answer = await reply(text);
    await new Promise((r) => setTimeout(r, 450));
    typing.innerHTML = answer;
    history.push({ role: "assistant", content: answer.replace(/<[^>]+>/g, "") });
    log.scrollTop = log.scrollHeight;
  }

  function toggle(open) {
    panel.hidden = !open;
    fab.setAttribute("aria-expanded", open);
    fab.classList.toggle("open", open);
    if (open) {
      const r = panel.getBoundingClientRect();
      sky.width = r.width; sky.height = r.height;
      if (!log.children.length) { bubble("Olá! Eu sou a <strong>AURA</strong> ✨, a inteligência artificial da BHADOTT Studio. Como posso ajudar?", "bot"); renderChips(); }
      requestAnimationFrame(drawSky);
      input.focus();
    } else fab.focus();
  }
  fab.addEventListener("click", () => toggle(panel.hidden));
  panel.querySelector(".chat-close").addEventListener("click", () => toggle(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) toggle(false); });
  form.addEventListener("submit", (e) => { e.preventDefault(); send(input.value); input.value = ""; });
})();
