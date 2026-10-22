// Busca e filtro de categorias do blog
(() => {
const search = document.getElementById("blog-search");
const posts = [...document.querySelectorAll("#posts .post")];
const empty = document.getElementById("no-posts");
let cat = "all";

function apply() {
  const q = search.value.trim().toLowerCase();
  let shown = 0;
  posts.forEach((p) => {
    const ok = (cat === "all" || p.dataset.cat === cat) && (!q || p.dataset.search.includes(q));
    p.hidden = !ok;
    if (ok) shown++;
  });
  empty.hidden = shown > 0;
}

search.addEventListener("input", apply);
document.querySelectorAll(".filters .filter").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".filters .filter").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    cat = b.dataset.filter;
    apply();
  })
);
})();
