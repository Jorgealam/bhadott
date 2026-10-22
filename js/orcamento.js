// Orçamento interativo: assistente em 4 etapas + estimativa de preço e prazo
// Valores-base preliminares; ajuste aqui conforme a tabela comercial.
(() => {
const BASE = {
  site: { nome: "Site ou portal", preco: 2500, semanas: 3 },
  app: { nome: "Aplicativo", preco: 12000, semanas: 8 },
  jogo: { nome: "Jogo", preco: 15000, semanas: 10 },
  sistema: { nome: "Sistema / SaaS", preco: 18000, semanas: 12 },
  ia: { nome: "IA / Automação", preco: 8000, semanas: 5 },
};
const TAMANHO = {
  mvp: { nome: "Essencial (MVP)", preco: 1, tempo: 1 },
  medio: { nome: "Profissional", preco: 1.8, tempo: 1.6 },
  completo: { nome: "Completo", preco: 3, tempo: 2.5 },
};
const EXTRAS = {
  login: ["Login de usuários", 2000], pagamentos: ["Pagamentos on-line", 3500], admin: ["Painel administrativo", 4000],
  offline: ["Funciona offline", 3000], ia: ["Recursos de IA", 5000], idiomas: ["Vários idiomas", 1500], design: ["Design/arte exclusivos", 2500],
};

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const form = document.getElementById("wizard");
const panes = [...form.querySelectorAll(".step-pane")];
const dots = [...form.querySelectorAll(".wizard-steps li")];
const prev = form.querySelector("[data-prev]");
const next = form.querySelector("[data-next]");
const status = form.querySelector(".form-status");
const enviar = document.getElementById("est-enviar");
let step = 0;
let resumo = null;

const val = (n) => form.querySelector(`[name="${n}"]:checked`)?.value;

function calc() {
  const tipo = val("tipo"), tam = val("tamanho"), prazo = val("prazo");
  const extras = [...form.querySelectorAll('[name="extras"]:checked')].map((i) => i.value);
  const itens = document.getElementById("est-itens");
  if (!tipo) { itens.innerHTML = "<li>Escolha o tipo de projeto para começar.</li>"; return; }

  const t = TAMANHO[tam || "mvp"];
  let preco = BASE[tipo].preco * t.preco + extras.reduce((s, e) => s + EXTRAS[e][1], 0);
  let semanas = BASE[tipo].semanas * t.tempo + extras.length;
  if (prazo === "urgente") { preco *= 1.25; semanas *= 0.7; }
  semanas = Math.max(2, Math.round(semanas));
  const min = Math.round((preco * 0.85) / 500) * 500, max = Math.round((preco * 1.2) / 500) * 500;

  document.getElementById("est-preco").textContent = `${brl.format(min)} – ${brl.format(max)}`;
  document.getElementById("est-prazo").textContent = semanas < 9 ? `${semanas} semanas` : `${Math.round(semanas / 4.3)} meses`;

  // Fases proporcionais ao prazo
  const fases = [["Descoberta", 0.12], ["Design", 0.18], ["Construção", 0.55], ["Testes e lançamento", 0.15]];
  document.getElementById("est-fases").innerHTML = fases
    .map(([n, p]) => `<span style="flex:${p}" title="${n}: ~${Math.max(1, Math.round(semanas * p))} sem."><b>${n}</b></span>`).join("");

  itens.innerHTML = [
    `<li><strong>${BASE[tipo].nome}</strong> · ${tam ? TAMANHO[tam].nome : "tamanho a definir"}</li>`,
    ...extras.map((e) => `<li>+ ${EXTRAS[e][0]}</li>`),
    prazo === "urgente" ? "<li>Prazo urgente</li>" : "",
  ].join("");

  resumo = `Simulação de orçamento: ${BASE[tipo].nome}, ${tam ? TAMANHO[tam].nome : "-"}` +
    (extras.length ? `, com ${extras.map((e) => EXTRAS[e][0]).join(", ")}` : "") +
    `. Prazo ${prazo}. Estimativa: ${brl.format(min)} a ${brl.format(max)} em ~${semanas} semanas.`;
  enviar.disabled = !(tipo && tam);
}

function show(n) {
  step = n;
  panes.forEach((p, i) => p.classList.toggle("active", i === n));
  dots.forEach((d, i) => { d.classList.toggle("active", i === n); d.classList.toggle("done", i < n); });
  prev.disabled = n === 0;
  next.textContent = n === panes.length - 1 ? "Ver resultado ✓" : "Próximo →";
  status.textContent = "";
}

next.addEventListener("click", () => {
  const req = panes[step].querySelector("[required]");
  if (req && !val(req.name)) {
    status.textContent = "Escolha uma opção para continuar.";
    status.className = "form-status err";
    return;
  }
  if (step < panes.length - 1) show(step + 1);
  else { enviar.focus(); document.querySelector(".estimate").classList.add("pulse-once"); }
});
prev.addEventListener("click", () => step > 0 && show(step - 1));
form.addEventListener("change", calc);

enviar.addEventListener("click", () => {
  try { sessionStorage.setItem("bh-orcamento", resumo); } catch {}
  if (typeof gtag === "function") gtag("event", "quote_simulated");
  location.href = "/contato.html#orcamento";
});

calc();
})();
