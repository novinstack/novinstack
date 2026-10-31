/* Public frontend configuration. Never place API keys or secrets in this file. */
window.NOVINSTACK_CONFIG = {
  // After deploying the Cloudflare Worker, paste its HTTPS URL (without /chat).
  apiBaseUrl: "https://novinstack-assistant-api.novinstack.workers.dev/",
  // Cloudflare Turnstile PUBLIC site key; secret key belongs only in Worker secrets.
  turnstileSiteKey: "0x4AAAAAAFtztZGt3WVtR59g"
};
