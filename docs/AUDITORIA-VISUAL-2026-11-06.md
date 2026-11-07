# Auditoria visual — Portal BHADOTT × Bhadott Games

**Data:** 06/11/2026 · **Objetivo:** levar o padrão visual do Bhadott Games (`/games/`) para todas as áreas do portal.

## Diagnóstico

| # | Área | Problema | Impacto |
|---|---|---|---|
| 1 | Página inicial | O topo é um sistema solar em CSS pequeno e inclinado; os nomes só aparecem ao passar o mouse e, no celular, a animação parece "estranha" | Primeira impressão fraca |
| 2 | Todo o portal | Duas identidades: portal (azul/dourado, Space Grotesk) × Games (vermelho/roxo, títulos em itálico grosso) — parecem dois sites | Falta de unidade de marca |
| 3 | Todo o portal | Quase nenhuma imagem: cartões só com ícones | Aparência menos profissional |
| 4 | Cabeçalho | Menu em texto pequeno, sem o peso visual do Games | — |
| 5 | Cartões | Planos, sem capa nem zoom ao passar o mouse | — |
| 6 | Desempenho | Fontes baixadas do Google atrasam a primeira pintura (~3 s no 4G) | Nota 81–86 |
| 7 | Games | Marcas de terceiros (parceiros, logos e link de grupo no rodapé) | **Corrigido** — somente BHADOTT |
| 8 | Games | Nome "Jorge Alan" | **Corrigido** para Jorge Alam |

## Padrão adotado (vindo do Bhadott Games)

- **Fundo** `#0a0b12` com brilhos roxo e vermelho; superfícies `#141824` / `#1b2030`
- **Títulos** em fonte de sistema (Bahnschrift / Segoe UI), **itálico 800** — mais rápido que fontes da internet
- **Menu** em MAIÚSCULAS com sublinhado em degradê
- **Botão principal** em degradê; botão secundário escuro com contorno
- **Kicker** (texto acima do título) colorido e espaçado; **chips** arredondados
- **Cartões de mídia** com capa grande, zoom e brilho ao passar o mouse

## Cada área com sua cor (mesma base)

| Área | Destaque |
|---|---|
| Portal BHADOTT | Vermelho → laranja (igual ao Games) |
| BHADOTT Studio | Azul → violeta |
| Bhadott Games | Vermelho (original) |

## Plano

1. **Base visual** (cores, fontes, botões, cartões, cabeçalho, rodapé) em todo o portal ✔
2. **Página inicial** com carrossel de imagens grandes no lugar da animação do Sol ✔
3. **Arte própria** para AURA, Studio, Agro, Video, Academy e Universo (ilustrações geradas em código, trocáveis por arte definitiva) ✔
4. Próximas rodadas: páginas de produto no padrão do Games (galeria, ficha, relacionados); menu único entre portal e jogos

## Rodada 2 (07/11/2026)

- **Retirados do Bhadott Games:** parceiros e integrantes de terceiros, a página Parceiros e os textos "empresas do grupo". Equipe: só Jorge Alam (Fundador e Criador de Projetos Digitais).
- **Visual completo em todas as áreas:** capa ilustrada no topo de todas as páginas internas (Sobre, Blog, Materiais, Carreira, Contato, Investidores, Privacidade, Serviços, Portfólio, Tecnologias, Orçamento) e de cada serviço, projeto e post; cartões de serviços e do blog com capa.
- 12 ilustrações no total (`assets/arte/`), geradas por `node materiais/gerar.mjs`.
- Tema claro corrigido quando vem da configuração do sistema.

## Pendências que dependem do dono
- Histórico do Git saneado em 07/11/2026 — ver docs/HISTORICO-GIT.md.
