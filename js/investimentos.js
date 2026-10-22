// Gráficos de investimento (Chart.js carregado antes deste arquivo)
(() => {
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const css = getComputedStyle(document.documentElement);
const C = { cyan: "#60a5fa", violet: "#8b5cf6", pink: "#e879f9", muted: css.getPropertyValue("--muted").trim(), grid: "rgba(120,140,255,.12)" };

Chart.defaults.color = C.muted;
Chart.defaults.font.family = "Inter, system-ui, sans-serif";
Chart.defaults.borderColor = C.grid;
if (matchMedia("(prefers-reduced-motion: reduce)").matches) Chart.defaults.animation = false;

const moneyAxis = { ticks: { callback: (v) => brl.format(v) } };
const tooltipMoney = { callbacks: { label: (c) => `${c.dataset.label}: ${brl.format(c.parsed.y)}` } };

const $ = (id) => document.getElementById(id);
const inputs = ["inv", "ganho", "manut", "meses"].map($);

// Resultado acumulado mês a mês: -investimento + (ganho - manutenção) * mês
const serie = (inv, liquido, meses) => Array.from({ length: meses + 1 }, (_, m) => -inv + liquido * m);

const roiChart = new Chart($("chart-roi"), {
  type: "line",
  data: { labels: [], datasets: [{ label: "Resultado acumulado", data: [], borderColor: C.cyan, borderWidth: 2, pointRadius: 0, tension: 0.25, fill: { target: { value: 0 }, above: "rgba(62,240,255,.15)", below: "rgba(255,79,216,.15)" } }] },
  options: { maintainAspectRatio: false, interaction: { mode: "index", intersect: false }, scales: { y: moneyAxis, x: { title: { display: true, text: "Mês" } } }, plugins: { legend: { display: false }, tooltip: tooltipMoney } },
});

const cenChart = new Chart($("chart-cenarios"), {
  type: "line",
  data: { labels: [], datasets: [
    { label: "Conservador (-30%)", borderColor: C.pink, data: [] },
    { label: "Base", borderColor: C.cyan, data: [] },
    { label: "Otimista (+30%)", borderColor: C.violet, data: [] },
  ].map((d) => ({ ...d, borderWidth: 2, pointRadius: 0, tension: 0.25 })) },
  options: { maintainAspectRatio: false, interaction: { mode: "index", intersect: false }, scales: { y: moneyAxis }, plugins: { tooltip: tooltipMoney } },
});

new Chart($("chart-solucoes"), {
  type: "bar",
  data: {
    // Substitua pelos números reais dos cases da BHADOTT
    labels: ["Automação de processos", "Apps mobile", "Plataformas web", "IA e dados", "Cloud / FinOps"],
    datasets: [{ label: "Ganho de eficiência", data: [42, 27, 31, 38, 35], backgroundColor: [C.cyan, C.violet, C.pink, C.cyan, C.violet], borderRadius: 8 }],
  },
  options: { maintainAspectRatio: false, indexAxis: "y", scales: { x: { ticks: { callback: (v) => `${v}%` } } }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `+${c.parsed.x}% de eficiência` } } } },
});

function update() {
  const [inv, ganho, manut, meses] = inputs.map((i) => Number(i.value));
  $("inv-out").textContent = brl.format(inv);
  $("ganho-out").textContent = brl.format(ganho);
  $("manut-out").textContent = brl.format(manut);
  $("meses-out").textContent = `${meses} meses`;

  const liquido = ganho - manut;
  const labels = Array.from({ length: meses + 1 }, (_, m) => m);
  const base = serie(inv, liquido, meses);
  const final = base[meses];

  $("r-roi").textContent = `${Math.round((final / inv) * 100)}%`;
  $("r-payback").textContent = liquido > 0 && Math.ceil(inv / liquido) <= meses ? `${Math.ceil(inv / liquido)} meses` : "Fora do horizonte";
  $("r-lucro").textContent = brl.format(final);

  roiChart.data.labels = labels;
  roiChart.data.datasets[0].data = base;
  roiChart.update();

  cenChart.data.labels = labels;
  [0.7, 1, 1.3].forEach((f, i) => { cenChart.data.datasets[i].data = serie(inv, ganho * f - manut, meses); });
  cenChart.update();
}

inputs.forEach((i) => i.addEventListener("input", update));
update();
})();
