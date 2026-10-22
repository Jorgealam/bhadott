// ============================================================
// BHADOTT — configurações e integrações (único lugar a editar)
// Deixe vazio ("") o que ainda não estiver contratado: o site
// funciona em modo demonstração e esconde o que não tiver dado.
// ============================================================
window.BHADOTT_CONFIG = {
  // Google Analytics 4 (só carrega após o visitante aceitar cookies de análise)
  GA_ID: "",                       // ex.: "G-ABC123XYZ"

  // Envio de formulários (Formspree, Netlify Forms, Getform ou API própria)
  // Envio grátis via FormSubmit (sem conta). Na 1ª mensagem chega um e-mail de ativação: clique em "Activate Form".
  FORM_ENDPOINT: "https://formsubmit.co/ajax/bhaddottudio@gmail.com",

  // CRM: webhook que recebe uma cópia de cada lead (HubSpot, RD Station, Make, n8n...)
  CRM_WEBHOOK: "",

  // Anti-spam Cloudflare Turnstile (chave pública do site)
  TURNSTILE_SITEKEY: "",

  // Contatos
  WHATSAPP: "5591991549535",       // só números com DDI e DDD, ex.: "5591999999999"
  EMAIL: "bhaddottudio@gmail.com", // e-mail de contato exibido no site
  CALENDLY_URL: "",                // ex.: "https://calendly.com/bhadott/30min"

  // Assistente AURA: endpoint opcional de IA (ex.: Cloudflare Worker que chama a Claude API).
  // Recebe POST { messages: [{role, content}] } e responde { reply: "..." }.
  // Vazio = respostas automáticas locais.
  CHAT_API: "",

  // Pop-up de saída (oferta de e-book)
  EXIT_POPUP: true,
};
