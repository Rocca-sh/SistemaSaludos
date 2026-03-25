// ============================================================
//  config.js — Configuración de la API
//  BASE_URL se toma automáticamente del servidor que sirvió la página,
//  así nunca hay que cambiar la IP a mano.
// ============================================================

const CONFIG = {
  // Si la página la sirve el propio servidor C#, window.location.origin
  // siempre apunta a la IP correcta (ej: http://192.168.1.13:5000)
  BASE_URL: window.location.origin,

  get WS_URL() {
    return this.BASE_URL.replace("http", "ws") + "/hub";
  },

  ENDPOINTS: {
    SCREENS:      "/api/pantallas/obtener",
    SCREEN_SEND:  "/api/pantallas/enviar/{id}",
    BROADCAST:    "/api/pantallas/broadcast",
    VISITS:       "/api/visits",
    VISITS_TODAY: "/api/visits/today",
    VISITS_SYNC:  "/api/visits/sync",
    SCREEN_QUEUE: "/api/pantallas/{id}/queue",
  },

  ACK_TIMEOUT_MS:      10000,
  ACK_MAX_RETRIES:     3,
  REFRESH_INTERVAL:    5000,
  VISIT_ALERT_MINUTES: 15,
  USE_MOCK:            false,
};