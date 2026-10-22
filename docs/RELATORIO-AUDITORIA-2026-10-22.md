# Relatório de auditoria — Portal BHADOTT

**Data:** 22/10/2026 · **Site:** https://jorgealam.github.io/bhadott/ · **Versão auditada:** primeira publicação

## Como foi verificado

1. **Varredura das 35 páginas** em tela de celular (375 px): erros de script, imagens quebradas, um título principal por página e largura da página.
2. **Google Lighthouse** (modo celular) na página inicial e no orçamento: desempenho, acessibilidade, boas práticas e SEO.
3. **Teste manual** do assistente, dos formulários, do WhatsApp e do e-mail.
4. **Teste automático** do projeto (`npm test`): títulos, descrições, links internos, imagens com texto alternativo, marcadores de modelo e JSON.

## Resultado geral

| Item | Antes | Depois |
|---|---|---|
| Páginas com erro de script | 0 de 35 | 0 de 35 |
| Links internos quebrados | 0 | 0 |
| Páginas que "escorregavam" no celular | 2 (Início e Studio) | 0 |
| Lighthouse — SEO | 100 | 100 |
| Lighthouse — Boas práticas | 100 | 100 |
| Lighthouse — Acessibilidade | 90 / 92 | **100** |
| Lighthouse — Desempenho (celular) | 83 / 86 | 81–86 (varia a cada medição; ver pendências) |

## Erros encontrados e corrigidos

| # | Gravidade | Erro | Causa | Correção |
|---|---|---|---|---|
| 1 | **Alta** | No celular a página "crescia e diminuía" e o botão da IA saía da tela e voltava | As órbitas e os anéis giram; um quadrado girado fica mais largo, e isso esticava a página de 375 px para até 483 px | O conteúdo que gira agora é recortado dentro do próprio bloco (`overflow-x: clip`); a largura fica fixa |
| 2 | Média | A IA respondia sobre "IA" quando o visitante dizia "bom dia" | A palavra-chave "ia" era procurada dentro de outras palavras ("d**ia**", "famíl**ia**") | Agora só palavras inteiras contam |
| 3 | Média | Leitores de tela não diziam o nome dos planetas (links sem nome) | O nome estava só no rótulo visual | Cada planeta tem nome acessível |
| 4 | Baixa | Textos secundários com pouco contraste no tema claro | Cinza claro demais sobre fundo claro | Cinza mais escuro no tema claro |
| 5 | Baixa | Ordem dos títulos pulava do nível 2 para o 4 no rodapé | Títulos do rodapé eram `h4` | Passaram a `h3` (visual igual) |
| 6 | Baixa | Nome acessível do logo diferente do texto visível | `aria-label` "BHADOTT — Início" | Removido; vale o texto visível |
| 7 | Baixa | Barra de fases do orçamento com atributo inválido | `aria-label` em `div` sem papel | Recebeu `role="img"` |

## Mudanças pedidas nesta rodada

- O assistente agora é a **AURA, a inteligência artificial da BHADOTT Studio** (nome, avatar holográfico, apresentação e respostas). A constelação da conversa continua.
- **WhatsApp** (91) 99154-9535 ligado no botão flutuante, no contato e na AURA.
- **E-mail** bhaddottudio@gmail.com exibido na página de contato.

## Pendências (não são erros do código)

| Item | Por quê | O que fazer |
|---|---|---|
| Desempenho 83–86 no celular | A primeira pintura leva ~3 s em 4G simulado: fontes do Google e cache curto do GitHub Pages (10 min, não configurável) | Migrar para Cloudflare Pages (aplica o cache de 1 ano já configurado em `_headers`) |
| Cabeçalhos de segurança | O GitHub Pages ignora o arquivo `_headers` | Também resolvido com Cloudflare Pages ou Netlify |
| Formulários em modo demonstração | Falta o serviço de envio | Criar conta no Formspree e colar o endereço em `FORM_ENDPOINT` (`js/config.js`) |
| Google Analytics desligado | Falta o ID | Colar o ID em `GA_ID` |
| Imagem de compartilhamento | `og-image.png` não existe | Criar uma imagem 1200×630 |
| E-mail "bhaddottudio@gmail.com" | Confirmar a grafia (parece faltar o "s" de *studio*) | Se estiver errado, corrigir em `EMAIL` |
| A AURA do site responde por palavras-chave | Ainda não está ligada a um modelo de IA | Ligar a uma API (ex.: Worker na Cloudflare) e preencher `CHAT_API` |
