# BHADOTT — Portal Universo

Portal da BHADOTT em formato de sistema solar: a BHADOTT é o Sol e cada divisão/serviço é um planeta.
A primeira divisão é o **BHADOTT Studio** (jogos, apps, sistemas, sites, IA e 3D).

Arquitetura, cores e mapa do site: [docs/ARQUITETURA.md](docs/ARQUITETURA.md).

## Rodar no computador

Requisitos: Node.js 20+ e Python 3 (só para o servidor local).

```bash
npm run dev     # gera dist/ e abre em http://localhost:8080
npm test        # gera e verifica as 35 páginas (títulos, links, imagens, JSON)
npm run build   # versão de produção minificada em dist/
```

## Onde editar

| O quê | Arquivo |
|---|---|
| Projetos do portfólio | `src/data/cases.json` |
| Serviços | `src/data/servicos.json` |
| Posts do blog | `src/data/posts.json` |
| Vagas/colaborações | `src/data/vagas.json` |
| Perguntas frequentes | `src/data/faq.json` |
| Linha do tempo | `src/data/timeline.json` |
| Depoimentos (só com autorização) | `src/data/depoimentos.json` |
| Traduções EN/ES | `src/data/i18n.json` |
| Páginas | `src/pages/` |
| Cabeçalho, rodapé, widgets | `src/partials/` |
| **Integrações** (GA, formulários, WhatsApp, agenda, CRM, anti-spam, IA) | `js/config.js` |

## Publicação

- **GitHub Pages:** cada push na branch `main` publica automaticamente (`.github/workflows/deploy.yml`).
  Sem domínio próprio, o site fica em `https://<usuario>.github.io/<repositorio>/`. Para usar domínio,
  crie um arquivo `CNAME` na raiz com o domínio (ex.: `www.bhadott.studio`).
- **Cloudflare Pages / Netlify (recomendado para produção):** comando `node build.mjs`, pasta `dist`.
  Esses serviços aplicam os cabeçalhos de segurança de `_headers`.
- **Hospedagem Apache:** envie o conteúdo de `dist/` (inclui `.htaccess`).

Criado por Jorge Alam.
