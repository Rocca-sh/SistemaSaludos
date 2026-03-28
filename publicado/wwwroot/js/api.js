// ============================================================
//  api.js — Capa de comunicación con el backend
// ============================================================

const API = {

  async getScreens() {
    if (CONFIG.USE_MOCK) {
      return new Promise(r => setTimeout(() => r(JSON.parse(JSON.stringify(MOCK.screens))), 200));
    }
    const res = await fetch(CONFIG.BASE_URL + CONFIG.ENDPOINTS.SCREENS);
    if (!res.ok) throw new Error("Error al obtener pantallas");
    return res.json();
  },

  async getVisits() {
    if (CONFIG.USE_MOCK) {
      return new Promise(r => setTimeout(() => r(JSON.parse(JSON.stringify(MOCK.visits))), 200));
    }
    const res = await fetch(CONFIG.BASE_URL + CONFIG.ENDPOINTS.VISITS);
    if (!res.ok) throw new Error("Error al obtener visitas");
    return res.json();
  },

  async syncVisitsFromIdeeo() {
    if (CONFIG.USE_MOCK) {
      return new Promise(r => setTimeout(() => r({ synced: 2, message: "Sincronización completada" }), 1200));
    }
    const res = await fetch(CONFIG.BASE_URL + CONFIG.ENDPOINTS.VISITS_SYNC, { method: "POST" });
    if (!res.ok) throw new Error("Error al sincronizar con ideeo");
    return res.json();
  },

  async sendToScreen(screenId, type, payload, visitId = null) {
    if (CONFIG.USE_MOCK) {
      console.log(`[MOCK] → ${screenId}:`, { type, payload });
      return new Promise(r => setTimeout(() => r({ ok: true, ackReceived: true }), 400));
    }
    const endpoint = CONFIG.ENDPOINTS.SCREEN_SEND.replace("{id}", screenId);
    const res = await fetch(CONFIG.BASE_URL + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, payload, visitId }),
    });
    if (!res.ok) throw new Error("Error al enviar mensaje");
    return res.json();
  },

  async broadcast(type, payload) {
    if (CONFIG.USE_MOCK) {
      console.log("[MOCK] broadcast:", { type, payload });
      return new Promise(r => setTimeout(() => r({ ok: true }), 400));
    }
    const res = await fetch(CONFIG.BASE_URL + CONFIG.ENDPOINTS.BROADCAST, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, payload }),
    });
    if (!res.ok) throw new Error("Error en broadcast");
    return res.json();
  },

  async clearScreen(screenId) {
    return this.sendToScreen(screenId, "limpiar", {});
  },

  async clearAll() {
    return this.broadcast("limpiar", {});
  },

  async updateScreenQueue(screenId, queue) {
    if (CONFIG.USE_MOCK) {
      return new Promise(r => setTimeout(() => r({ ok: true }), 200));
    }
    const res = await fetch(`${CONFIG.BASE_URL}/screens/${screenId}/queue`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queue }),
    });
    if (!res.ok) throw new Error("Error al actualizar cola");
    return res.json();
  },

  async deleteScreen(screenId) {
    if (CONFIG.USE_MOCK) return new Promise(r => setTimeout(() => r({ ok: true }), 200));
    const res = await fetch(`${CONFIG.BASE_URL}/pantallas/${screenId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar pantalla");
    return res.json();
  },
};
