# BHADOTT — Arquitetura do site

## Conceito: o Universo BHADOTT
O site inteiro é um **sistema solar**:
- **BHADOTT (o Sol)** — o portal principal: a marca-mãe, quem somos, investidores, carreira, novidades e contato.
- **Planetas = divisões e serviços.** A primeira divisão é o **BHADOTT Studio** (jogos, aplicativos, software, IA). Novas divisões entram como novos planetas, sem refazer nada.
- **Constelações = navegação e assistente.** O assistente virtual "Constelação" liga pontos (perguntas) a destinos (páginas).

## Identidade visual
Segue o brand guide oficial (`branding/brand-guide.md` do portal anterior), mais o dourado do Sol:

| Token | Cor | Uso |
|---|---|---|
| `--bg` | `#020617` (escuro) / `#f5f7ff` (claro) | Fundo |
| `--blue` | `#3b82f6` | Cor principal, botões, links |
| `--violet` | `#8b5cf6` | Studio, gradientes |
| `--sun` | `#fbbf24` | Portal BHADOTT, títulos "solares" |
| `--pink` | `#e879f9` | Acentos nos gradientes |

Tipografia: **Space Grotesk** (títulos) + **Inter** (texto). Tema claro/escuro com botão no topo (segue o sistema por padrão).

## Mapa do site
```
/                     Portal: hero com sistema solar clicável, divisões, números, linha do tempo,
                      clientes, depoimentos, FAQ, CTA
/sobre.html           História (linha do tempo), equipe, certificações, missão/visão/valores
/investimentos.html   Investidores: simulador de ROI e gráficos
/blog.html            Blog com busca e categorias  →  /blog/<post>.html
/recursos.html        Materiais gratuitos (e-books) em troca do e-mail
/carreira.html        Cultura, vagas (data/vagas.json, pronto p/ Gupy), desafio de código, currículo
/contato.html         Formulário, WhatsApp, agendamento, mapa, FAQ
/privacidade.html     Política de Privacidade e cookies (LGPD)
/studio/              BHADOTT Studio: jogos, apps, software, IA
/studio/servicos/<s>  Uma página por serviço (SEO)
/studio/portfolio.html + /studio/cases/<case>.html
/studio/orcamento.html  Orçamento interativo, calculadora de prazo, comparador de planos
/studio/tecnologias.html
```

## Elementos globais (todas as páginas)
- Tela de carregamento com foguete (1x por sessão) e logo animado
- Céu com estrelas, constelações, meteoros, cometa e efeito de "viagem" ao rolar
- Cursor com rastro de luz e botões magnéticos (só desktop)
- Transições entre páginas (View Transitions)
- Seletor de idioma PT / EN / ES e tema claro/escuro
- Botão flutuante de WhatsApp e assistente "Constelação" com o mascote **Bha**
- Banner de cookies LGPD (Analytics só liga após aceite)
- Pop-up de saída oferecendo o e-book (1x por visitante)
- PWA: instala como app e funciona offline após a 1ª visita

## Código
```
src/partials   cabeçalho, rodapé, widgets globais
src/pages      páginas (front matter JSON em comentário na 1ª linha)
src/templates  modelos de post, case e serviço
src/data       posts, cases, serviços, vagas, traduções  ← edite o conteúdo aqui
js/config.js   IDs e integrações (GA, formulário, WhatsApp, agenda, CRM, anti-spam, IA)
build.mjs      gera dist/ (npm run build) · npm run dev serve em localhost:8080 · npm test
```

## Integrações que precisam de conta (preencher em js/config.js)
Google Analytics · Formspree (ou similar) · WhatsApp · Calendly · HubSpot/RD Station (webhook) ·
Cloudflare Turnstile · endpoint de IA para o assistente · Gupy (vagas) · Search Console.
Sem elas, o site funciona em modo demonstração.
