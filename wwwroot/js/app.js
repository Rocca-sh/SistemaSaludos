// ============================================================
//  app.js — Panel Recepcionista — Lógica principal
// ============================================================

// ── ESTADO GLOBAL ────────────────────────────────────────────
const state = {
  screens: [],
  visits: [],
  currentView: "screens",
  notifications: [],
  visitAlertsFired: new Set(),   // IDs de visitas cuya alerta ya se mostró
  ackPending: {},                // { messageId: { retries, timeout } }
  queueModal: { screenId: null },
};

// ── DOM HELPERS ──────────────────────────────────────────────
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  startClock();
  loadAll();
  setInterval(loadScreens, CONFIG.REFRESH_INTERVAL);
  setInterval(checkUpcomingVisits, 30000);
});

async function loadAll() {
  await Promise.all([loadScreens(), loadVisits()]);
  checkUpcomingVisits();
}

// ── CLOCK ─────────────────────────────────────────────────────
function startClock() {
  function tick() {
    const now = new Date();
    $("clock").textContent = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    $("date-label").textContent = now.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  }
  tick();
  setInterval(tick, 1000);
}

// ── NAVIGATION ───────────────────────────────────────────────
function navigateTo(view) {
  state.currentView = view;
  $$(".view").forEach(v => v.classList.remove("active"));
  $$(".nav-item").forEach(n => n.classList.remove("active"));
  const viewEl = $("view-" + view);
  const navEl  = $("nav-" + view);
  if (viewEl) viewEl.classList.add("active");
  if (navEl)  navEl.classList.add("active");
  const titles = { screens: "Pantallas", visits: "Visitas", send: "Enviar Bienvenida" };
  const t = $("topbar-title");
  if (t) t.textContent = titles[view] || "";
  if (view === "send") renderSendView();
  if (view === "visits") renderVisits();
}

// ── LOAD SCREENS ─────────────────────────────────────────────
async function loadScreens() {
  try {
    const fresh = await API.getScreens();

    // Detect newly reconnected screens that had a pending queue
    fresh.forEach(s => {
      const prev = state.screens.find(p => p.id === s.id);
      if (prev && prev.status === "offline" && s.status === "online" && s.queue?.length) {
        showReconnectConfirm(s);
      }
    });

    state.screens = fresh;
    renderScreens();
    updateBadges();
  } catch (e) {
    showToast("Error al cargar pantallas", "error");
  }
}

// ── RENDER SCREENS ───────────────────────────────────────────
function renderScreens() {
  const online  = state.screens.filter(s => s.status === "online").length;
  const offline = state.screens.length - online;
  if ($("stat-total"))   $("stat-total").textContent   = state.screens.length;
  if ($("stat-online"))  $("stat-online").textContent  = online;
  if ($("stat-offline")) $("stat-offline").textContent = offline;

  const grid = $("screens-grid");
  if (!grid) return;

  if (!state.screens.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-state-icon">📡</div>
      <div class="empty-state-text">No hay pantallas registradas</div>
    </div>`;
    return;
  }

  grid.innerHTML = state.screens.map(s => {
    const isOnline = s.status === "online";
    const active   = s.activeMessage;
    const qLen     = s.queue?.length || 0;

    const activeHtml = active
      ? `<div class="screen-active-msg">
          <span class="screen-active-label">MOSTRANDO AHORA</span>
          <span class="screen-active-text">${active.payload?.empresa || active.payload?.nombre || "—"}</span>
         </div>`
      : `<div class="screen-active-msg idle">
          <span class="screen-active-label">EN ESPERA</span>
          <span class="screen-active-text">Pantalla idle</span>
         </div>`;

    const queueHtml = qLen > 0
      ? `<button class="btn btn-queue btn-sm" onclick="openQueueModal('${s.id}')">
           📋 Cola <span class="queue-count">${qLen}</span>
         </button>`
      : `<button class="btn btn-ghost btn-sm" onclick="openQueueModal('${s.id}')" ${!isOnline ? "disabled" : ""}>
           📋 Cola <span class="queue-count">0</span>
         </button>`;

    return `
    <div class="screen-card ${s.status}" id="sc-${s.id}">
      <div class="screen-card-top">
        <div>
          <div class="screen-card-id">${s.id}</div>
          <div class="screen-card-location">${s.location}</div>
        </div>
        <div class="status-badge ${s.status}">
          <div class="status-dot"></div>
          ${isOnline ? "En línea" : "Desconectada"}
        </div>
      </div>
      ${activeHtml}
      <div class="screen-card-actions">
        <button class="btn btn-primary btn-sm" onclick="openSendModal('${s.id}')" ${!isOnline ? "disabled" : ""}>
          📨 Enviar
        </button>
        ${queueHtml}
        <button class="btn btn-danger btn-sm" onclick="clearScreen('${s.id}')" ${!isOnline ? "disabled" : ""}>
          🧹 Limpiar
        </button>
      </div>
    </div>`;
  }).join("");
}

// ── LOAD VISITS ──────────────────────────────────────────────
async function loadVisits() {
  try {
    state.visits = await API.getVisits();
    renderVisits();
    updateBadges();
  } catch (e) {
    showToast("Error al cargar visitas", "error");
  }
}

function renderVisits() {
  const list = $("visits-list");
  if (!list) return;

  const today = new Date().toISOString().split("T")[0];
  const todayVisits  = state.visits.filter(v => v.date === today);
  const futureVisits = state.visits.filter(v => v.date > today);

  if ($("stat-visits")) $("stat-visits").textContent = todayVisits.length;

  let html = "";

  if (todayVisits.length) {
    html += `<div class="visits-group-label">HOY</div>`;
    html += todayVisits.map(v => visitCardHtml(v)).join("");
  }

  if (futureVisits.length) {
    html += `<div class="visits-group-label" style="margin-top:24px">PRÓXIMAS</div>`;
    html += futureVisits.map(v => visitCardHtml(v)).join("");
  }

  if (!html) {
    html = `<div class="empty-state">
      <div class="empty-state-icon">📅</div>
      <div class="empty-state-text">No hay visitas registradas</div>
    </div>`;
  }

  list.innerHTML = html;
}

function visitCardHtml(v) {
  const sourceBadge = v.source === "ideeo"
    ? `<span class="source-badge ideeo">ideeo</span>`
    : `<span class="source-badge manual">manual</span>`;

  return `
  <div class="visit-card">
    <div>
      <div class="visit-time">${v.time}</div>
      <div class="visit-time-label">${v.durationMinutes} min</div>
    </div>
    <div class="visit-info">
      <div class="visit-company-row">
        <span class="visit-company">${v.company}</span>
        ${sourceBadge}
      </div>
      <div class="visit-meta">
        <span>🏷️ ${v.host}</span>
        <span>📍 ${v.area}</span>
      </div>
      <div class="visitors-chips">
        ${v.visitors.map(vis => `
          <div class="visitor-chip">
            <span class="visitor-chip-name">${vis.name}</span>
            <span class="visitor-chip-role">${vis.role}</span>
          </div>`).join("")}
      </div>
    </div>
    <div class="visit-actions">
      <button class="btn btn-primary btn-sm" onclick="openSendModalForVisit(${v.id})">
        📨 Enviar bienvenida
      </button>
    </div>
  </div>`;
}

// ── SYNC FROM IDEEO ──────────────────────────────────────────
async function syncFromIdeeo() {
  const btn = $("sync-btn");
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Sincronizando...`;
  try {
    const result = await API.syncVisitsFromIdeeo();
    await loadVisits();
    showToast(`Sincronización completa — ${result.synced} visita(s) importada(s)`, "success");
  } catch (e) {
    showToast("Error al sincronizar con ideeo", "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `🔄 Sincronizar con ideeo`;
  }
}

// ── UPCOMING VISIT ALERTS ────────────────────────────────────
function checkUpcomingVisits() {
  const now   = new Date();
  const today = now.toISOString().split("T")[0];

  state.visits
    .filter(v => v.date === today && !state.visitAlertsFired.has(v.id))
    .forEach(v => {
      const [h, m]    = v.time.split(":").map(Number);
      const visitTime = new Date(now);
      visitTime.setHours(h, m, 0, 0);
      const diffMin = (visitTime - now) / 60000;

      if (diffMin > 0 && diffMin <= CONFIG.VISIT_ALERT_MINUTES) {
        state.visitAlertsFired.add(v.id);
        showVisitAlert(v, Math.round(diffMin));
      }
    });
}

function showVisitAlert(visit, minutesLeft) {
  const alert = document.createElement("div");
  alert.className = "visit-alert";
  alert.innerHTML = `
    <div class="visit-alert-icon">⏰</div>
    <div class="visit-alert-body">
      <div class="visit-alert-title">Visita en ${minutesLeft} min</div>
      <div class="visit-alert-sub">${visit.company} — ${visit.time} — ${visit.area}</div>
    </div>
    <button class="btn btn-primary btn-sm" onclick="openSendModalForVisit(${visit.id}); this.closest('.visit-alert').remove()">
      Preparar
    </button>
    <button class="visit-alert-close" onclick="this.closest('.visit-alert').remove()">✕</button>
  `;
  $("alert-container").appendChild(alert);
  setTimeout(() => alert.remove(), 60000);
}

// ── SEND ─────────────────────────────────────────────────────
function openSendModal(screenId = null) {
  navigateTo("send");
  if (screenId) setTimeout(() => {
    const sel = $("send-screen-select");
    if (sel) sel.value = screenId;
  }, 60);
}

function openSendModalForVisit(visitId) {
  navigateTo("send");
  setTimeout(() => {
    const sel = $("send-visit-select");
    if (sel) sel.value = visitId;
  }, 60);
}

function renderSendView() {
  const screenSel = $("send-screen-select");
  const visitSel  = $("send-visit-select");
  if (!screenSel || !visitSel) return;

  const online = state.screens.filter(s => s.status === "online");
  screenSel.innerHTML =
    `<option value="">— Seleccionar pantalla —</option>` +
    online.map(s => `<option value="${s.id}">${s.location}</option>`).join("") +
    `<option value="all">📡 Todas las pantallas</option>`;

  const today = new Date().toISOString().split("T")[0];
  const todayV  = state.visits.filter(v => v.date === today);
  const futureV = state.visits.filter(v => v.date > today);

  visitSel.innerHTML = `<option value="">— Seleccionar visita —</option>`;
  if (todayV.length)  visitSel.innerHTML += `<optgroup label="Hoy">${todayV.map(visitOption).join("")}</optgroup>`;
  if (futureV.length) visitSel.innerHTML += `<optgroup label="Próximas">${futureV.map(visitOption).join("")}</optgroup>`;
}

function visitOption(v) {
  return `<option value="${v.id}">${v.time} — ${v.company} (${v.visitors.length} visitante${v.visitors.length !== 1 ? "s" : ""})</option>`;
}

async function sendGreeting() {
  const screenVal = $("send-screen-select").value;
  const visitId   = parseInt($("send-visit-select").value);
  const btn       = $("send-btn");

  if (!screenVal) { showToast("Selecciona una pantalla", "info"); return; }
  if (!visitId)   { showToast("Selecciona una visita", "info"); return; }

  const visit = state.visits.find(v => v.id === visitId);
  if (!visit) return;

  const isSingle = visit.visitors.length === 1;
  const type     = isSingle ? "saludoVisitante" : "saludoGrupo";
  const payload  = isSingle
    ? { nombre: visit.visitors[0].name, cargo: visit.visitors[0].role, empresa: visit.company, logo: visit.logo || null, anfitrion: visit.host, area: visit.area }
    : { empresa: visit.company, logo: visit.logo || null, visitantes: visit.visitors.map(v => ({ nombre: v.name, cargo: v.role })) };

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Enviando...`;

  try {
    if (screenVal === "all") {
      await API.broadcast(type, payload);
      showToast("Bienvenida enviada a todas las pantallas ✅", "success");
    } else {
      await sendWithAck(screenVal, type, payload, visit.id);
    }
  } finally {
    btn.disabled = false;
    btn.innerHTML = `📨 Enviar bienvenida`;
  }
}

// ── ACK SYSTEM ───────────────────────────────────────────────
async function sendWithAck(screenId, type, payload, visitId, attempt = 1) {
  try {
    const result = await API.sendToScreen(screenId, type, payload, visitId);

    if (result.ackReceived) {
      const screen = state.screens.find(s => s.id === screenId);
      showToast(`✅ Pantalla "${screen?.location || screenId}" confirmó recepción`, "success");
      await loadScreens();
    } else {
      throw new Error("Sin ACK");
    }
  } catch (e) {
    if (attempt < CONFIG.ACK_MAX_RETRIES) {
      showToast(`⚠️ Reintentando envío (${attempt}/${CONFIG.ACK_MAX_RETRIES})...`, "info");
      await new Promise(r => setTimeout(r, CONFIG.ACK_TIMEOUT_MS));
      return sendWithAck(screenId, type, payload, visitId, attempt + 1);
    } else {
      showToast(`❌ Error: la pantalla no confirmó recepción tras ${CONFIG.ACK_MAX_RETRIES} intentos. Verifica la conexión.`, "error");
      addNotification(`Sin respuesta de pantalla "${screenId}" — verificar conexión`, "error");
    }
  }
}

// ── QUEUE MODAL ──────────────────────────────────────────────
function openQueueModal(screenId) {
  state.queueModal.screenId = screenId;
  const screen = state.screens.find(s => s.id === screenId);
  if (!screen) return;

  $("queue-modal-title").textContent   = screen.location;
  $("queue-modal-screenid").textContent = screenId;
  renderQueueModal(screen.queue || []);
  $("modal-queue").classList.add("open");
}

function closeQueueModal() {
  $("modal-queue").classList.remove("open");
  state.queueModal.screenId = null;
}

function renderQueueModal(queue) {
  const list = $("queue-list");
  if (!queue.length) {
    list.innerHTML = `<div class="empty-state" style="padding:30px 0">
      <div class="empty-state-icon">✅</div>
      <div class="empty-state-text">Cola vacía</div>
    </div>`;
    return;
  }

  list.innerHTML = queue.map((item, idx) => `
    <div class="queue-item" id="qi-${item.id}" draggable="true"
      ondragstart="dragStart(event,'${item.id}')"
      ondragover="event.preventDefault()"
      ondrop="dragDrop(event,'${item.id}')">
      <div class="queue-item-handle">⠿</div>
      <div class="queue-item-info">
        <div class="queue-item-pos">${idx + 1}</div>
        <div>
          <div class="queue-item-company">${item.company}</div>
          <div class="queue-item-type">${item.type === "saludoGrupo" ? "Grupo" : "Individual"}</div>
        </div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="removeFromQueue('${item.id}')">✕</button>
    </div>`).join("");
}

// ── QUEUE DRAG & DROP ────────────────────────────────────────
let draggedId = null;

function dragStart(e, id) { draggedId = id; }

function dragDrop(e, targetId) {
  if (!draggedId || draggedId === targetId) return;
  const scr = state.screens.find(s => s.id === state.queueModal.screenId);
  if (!scr) return;
  const q    = scr.queue;
  const from = q.findIndex(i => i.id === draggedId);
  const to   = q.findIndex(i => i.id === targetId);
  if (from === -1 || to === -1) return;
  const [item] = q.splice(from, 1);
  q.splice(to, 0, item);
  renderQueueModal(q);
  API.updateScreenQueue(scr.id, q);
}

function removeFromQueue(itemId) {
  const scr = state.screens.find(s => s.id === state.queueModal.screenId);
  if (!scr) return;
  scr.queue = scr.queue.filter(i => i.id !== itemId);
  renderQueueModal(scr.queue);
  API.updateScreenQueue(scr.id, scr.queue);
  showToast("Mensaje eliminado de la cola", "info");
}

async function saveAndCloseQueue() {
  closeQueueModal();
  showToast("Cola actualizada", "success");
}

// ── RECONNECT CONFIRM ────────────────────────────────────────
function showReconnectConfirm(screen) {
  const modal = $("modal-reconnect");
  $("reconnect-screen-name").textContent = screen.location;
  $("reconnect-queue-count").textContent = screen.queue.length;

  $("reconnect-send-btn").onclick = async () => {
    modal.classList.remove("open");
    showToast(`Enviando cola pendiente a ${screen.location}...`, "info");
    for (const item of screen.queue) {
      await sendWithAck(screen.id, item.type, item.payload, item.visitId);
    }
  };

  $("reconnect-review-btn").onclick = () => {
    modal.classList.remove("open");
    openQueueModal(screen.id);
  };

  modal.classList.add("open");
}

// ── NOTIFICATIONS ────────────────────────────────────────────
function addNotification(msg, type = "info") {
  const n = { id: Date.now(), msg, type, time: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) };
  state.notifications.unshift(n);
  updateNotifBadge();
}

function updateNotifBadge() {
  const badge = $("notif-badge");
  if (!badge) return;
  badge.textContent = state.notifications.length;
  badge.style.display = state.notifications.length ? "flex" : "none";
}

// ── SCREEN ACTIONS ───────────────────────────────────────────
async function clearScreen(screenId) {
  try {
    await API.clearScreen(screenId);
    showToast("Pantalla limpiada", "success");
    await loadScreens();
  } catch (e) {
    showToast("Error al limpiar pantalla", "error");
  }
}

async function clearAllScreens() {
  try {
    await API.clearAll();
    showToast("Todas las pantallas limpiadas", "success");
    await loadScreens();
  } catch (e) {
    showToast("Error al limpiar pantallas", "error");
  }
}

// ── BADGES ───────────────────────────────────────────────────
function updateBadges() {
  const online = state.screens.filter(s => s.status === "online").length;
  const today  = new Date().toISOString().split("T")[0];
  const todayV = state.visits.filter(v => v.date === today).length;

  [["badge-screens", online], ["badge-send", online], ["badge-visits", todayV]].forEach(([id, val]) => {
    const el = $(id);
    if (!el) return;
    el.textContent = val;
    el.className = "nav-badge" + (id !== "badge-visits" && val > 0 ? " online" : "");
  });
}

// ── TOAST ────────────────────────────────────────────────────
function showToast(msg, type = "info") {
  const icons = { success: "✅", error: "❌", info: "ℹ️" };
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  $("toast-container").appendChild(el);
  setTimeout(() => el.remove(), 4000);
}
