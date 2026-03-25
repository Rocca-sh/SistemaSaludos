// ============================================================
//  signalr-panel.js — Conexión SignalR para el panel recepcionista
//  Agregar DESPUÉS de config.js y ANTES de app.js en el index.html
// ============================================================

let hubConnection = null;

async function initSignalR() {
  hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(CONFIG.BASE_URL + "/hub")
    .withAutomaticReconnect([2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  // ── Una pantalla se registró (nueva conexión) ──
  // El servidor no emite este evento todavía, pero el polling
  // de loadScreens cada REFRESH_INTERVAL lo cubre.
  // Lo dejamos aquí para cuando se quiera emitir desde el Hub.
  hubConnection.on("PantallaRegistrada", () => {
    loadScreens();
  });

  // ── Una pantalla se desconectó ──
  hubConnection.on("PantallaDesconectada", () => {
    loadScreens();
  });

  // ── ACK recibido de una pantalla ──
  hubConnection.on("MessageAcknowledged", (screenId, messageId) => {
    console.log(`[SignalR] ACK de pantalla ${screenId} para mensaje ${messageId}`);
    loadScreens();
  });

  hubConnection.onreconnecting(() => {
    console.log("[SignalR Panel] Reconectando...");
  });

  hubConnection.onreconnected(async () => {
    console.log("[SignalR Panel] Reconectado");
    await joinAsReceptionist();
    loadScreens();
  });

  hubConnection.onclose(() => {
    console.log("[SignalR Panel] Conexión cerrada");
  });

  try {
    await hubConnection.start();
    console.log("[SignalR Panel] Conectado al hub");
    await joinAsReceptionist();
  } catch (err) {
    console.error("[SignalR Panel] Error al conectar:", err);
    // No es crítico — el panel funciona igual con polling HTTP
  }
}

async function joinAsReceptionist() {
  try {
    await hubConnection.invoke("JoinReceptionist");
    console.log("[SignalR Panel] Unido al grupo 'receptionist'");
  } catch (e) {
    console.error("[SignalR Panel] Error al unirse como recepcionista:", e);
  }
}

// Arranca SignalR cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  initSignalR();
});