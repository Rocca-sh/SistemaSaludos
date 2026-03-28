// ============================================================
//  mensajes.js — Vista "Mensaje Libre"
//  Se apoya en state.screens (definido en app.js) y API (api.js)
// ============================================================

// ── ESTADO LOCAL ─────────────────────────────────────────────
var msgState = {
  tipo: "bienvenida",           // tipo activo
  pantallasSeleccionadas: [],   // ids de pantallas marcadas
};

// ── NAVEGAR A MENSAJES ────────────────────────────────────────
// app.js llama navigateTo('mensajes'), que activa la view.
// Enganchamos el evento para refrescar la lista de pantallas.
var _navigateToOriginal = null;
document.addEventListener("DOMContentLoaded", function() {
  // Esperar a que app.js defina navigateTo, luego wrapearlo
  setTimeout(function() {
    if (typeof navigateTo === "function") {
      var original = navigateTo;
      window.navigateTo = function(view) {
        original(view);
        if (view === "mensajes") {
          refrescarPantallasCheck();
          actualizarPreview();
        }
      };
    }
  }, 100);
});

// ── TIPO DE MENSAJE ───────────────────────────────────────────
function seleccionarTipo(tipo) {
  msgState.tipo = tipo;

  // Botones
  ["bienvenida","texto","aviso","imagen","limpiar"].forEach(function(t) {
    var btn = document.getElementById("tipo-" + t);
    if (btn) btn.className = "msg-tipo-btn" + (t === tipo ? " active" : "");
  });

  // Campos
  ["bienvenida","texto","aviso","imagen","limpiar"].forEach(function(t) {
    var el = document.getElementById("campos-" + t);
    if (el) el.style.display = t === tipo ? "block" : "none";
  });

  actualizarPreview();
}

// ── PREVIEW ───────────────────────────────────────────────────
function actualizarPreview() {
  var contenido = document.getElementById("preview-contenido");
  if (!contenido) return;
  var html = "";

  switch (msgState.tipo) {

    case "bienvenida": {
      var nombre   = (document.getElementById("msg-nombre")    || {}).value || "";
      var cargo    = (document.getElementById("msg-cargo")     || {}).value || "";
      var empresa  = (document.getElementById("msg-empresa")   || {}).value || "";
      var anf      = (document.getElementById("msg-anfitrion") || {}).value || "";

      html += '<div class="preview-bienvenido">Bienvenido</div>';
      html += '<div class="preview-nombre">' + escHtml(nombre || "Nombre del visitante") + '</div>';
      if (cargo)   html += '<div class="preview-sub">' + escHtml(cargo) + '</div>';
      if (empresa) html += '<div class="preview-empresa">' + escHtml(empresa) + '</div>';
      if (anf)     html += '<div class="preview-sub" style="margin-top:8px">Visita a <strong style="color:rgba(244,240,232,0.6)">' + escHtml(anf) + '</strong></div>';
      break;
    }

    case "texto": {
      var titulo   = (document.getElementById("msg-titulo")    || {}).value || "";
      var subtexto = (document.getElementById("msg-subtexto")  || {}).value || "";

      html += '<div class="preview-texto-libre">' + escHtml(titulo || "Título del mensaje") + '</div>';
      if (subtexto) html += '<div class="preview-subtexto" style="margin-top:10px">' + escHtml(subtexto) + '</div>';
      break;
    }

    case "aviso": {
      var icono    = (document.getElementById("msg-aviso-icono") || {}).value || "📢";
      var avisoTxt = (document.getElementById("msg-aviso-texto") || {}).value || "";
      var avisoSub = (document.getElementById("msg-aviso-sub")   || {}).value || "";

      html += '<div class="preview-aviso-icono">' + icono + '</div>';
      html += '<div class="preview-aviso-texto">' + escHtml(avisoTxt || "Texto del aviso") + '</div>';
      if (avisoSub) html += '<div class="preview-aviso-sub" style="margin-top:8px">' + escHtml(avisoSub) + '</div>';
      break;
    }

    case "imagen": {
      var imagenUrl = (document.getElementById("msg-imagen-url") || {}).value || "";
      var imgTitulo = (document.getElementById("msg-imagen-titulo") || {}).value || "";
      var imgTexto  = (document.getElementById("msg-imagen-texto") || {}).value || "";

      if (imgTitulo) {
          html += '<div style="font-size: 1.4rem; font-weight: 700; color: #c9a84c; margin-bottom: 8px;">' + escHtml(imgTitulo) + '</div>';
      }

      if (imagenUrl) {
          html += '<img src="' + escHtml(imagenUrl) + '" class="preview-imagen-img">';
      } else {
          html += '<div style="font-size:2rem;opacity:0.35">🖼️</div>';
          html += '<div style="color:rgba(244,240,232,0.3);font-size:0.9rem;margin-top:8px">Selecciona una imagen</div>';
      }
      
      if (imgTexto) {
          html += '<div class="preview-imagen-texto">' + escHtml(imgTexto) + '</div>';
      }
      break;
    }

    case "limpiar": {
      html += '<div style="font-size:2.5rem;opacity:0.35">🧹</div>';
      html += '<div style="color:rgba(244,240,232,0.3);font-size:1rem;margin-top:8px">Pantalla en espera</div>';
      break;
    }
  }

  contenido.innerHTML = html;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

// ── SUBIR IMAGEN ──────────────────────────────────────────────
async function previsualizarImagen() {
  var fileInput = document.getElementById("msg-imagen-file");
  var file = fileInput.files && fileInput.files[0];
  if (!file) return;

  var btn = document.getElementById("msg-send-btn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Subiendo imagen...";
  }

  var formData = new FormData();
  formData.append("requestFile", file);

  try {
    var res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });
    if (!res.ok) throw new Error("Error subiendo imagen");
    var data = await res.json();
    var urlInput = document.getElementById("msg-imagen-url");
    if (urlInput) urlInput.value = data.url;
    actualizarPreview();
  } catch (e) {
    console.error(e);
    if (typeof showToast === "function") showToast("Error al subir la imagen", "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "📤 Enviar mensaje";
    }
  }
}

// ── LISTA DE PANTALLAS ────────────────────────────────────────
function refrescarPantallasCheck() {
  var grid = document.getElementById("pantallas-check-grid");
  if (!grid) return;

  // state.screens viene de app.js
  var screens = (typeof state !== "undefined" && state.screens) ? state.screens : [];
  var online  = screens.filter(function(s) { return s.status === "online"; });

  if (!online.length) {
    grid.innerHTML = '<div style="color:var(--text-secondary,#94a3b8);font-size:0.85rem">No hay pantallas en línea</div>';
    msgState.pantallasSeleccionadas = [];
    return;
  }

  // Mantener selección previa
  var prevSel = msgState.pantallasSeleccionadas.slice();

  grid.innerHTML = online.map(function(s) {
    var checked = prevSel.length === 0 || prevSel.indexOf(s.id) !== -1;
    if (checked && msgState.pantallasSeleccionadas.indexOf(s.id) === -1) {
      msgState.pantallasSeleccionadas.push(s.id);
    }
    return '<label class="pantalla-check-item' + (checked ? " checked" : "") + '" id="check-item-' + s.id + '">' +
             '<input type="checkbox" value="' + s.id + '"' + (checked ? " checked" : "") + ' onchange="togglePantalla(\'' + s.id + '\',this.checked)">' +
             '<div class="pantalla-check-dot"></div>' +
             escHtml(s.location || s.name || s.id) +
           '</label>';
  }).join("");
}

function togglePantalla(id, checked) {
  var idx = msgState.pantallasSeleccionadas.indexOf(id);
  if (checked && idx === -1) msgState.pantallasSeleccionadas.push(id);
  if (!checked && idx !== -1) msgState.pantallasSeleccionadas.splice(idx, 1);

  var item = document.getElementById("check-item-" + id);
  if (item) item.className = "pantalla-check-item" + (checked ? " checked" : "");
}

function toggleTodas(sel) {
  var screens = (typeof state !== "undefined" && state.screens) ? state.screens : [];
  var online  = screens.filter(function(s) { return s.status === "online"; });

  msgState.pantallasSeleccionadas = sel ? online.map(function(s) { return s.id; }) : [];

  online.forEach(function(s) {
    var cb   = document.querySelector("#check-item-" + s.id + " input");
    var item = document.getElementById("check-item-" + s.id);
    if (cb)   cb.checked = sel;
    if (item) item.className = "pantalla-check-item" + (sel ? " checked" : "");
  });
}

// ── ENVIAR ────────────────────────────────────────────────────
async function enviarMensajeLibre() {
  var btn = document.getElementById("msg-send-btn");

  if (msgState.pantallasSeleccionadas.length === 0) {
    if (typeof showToast === "function") showToast("Selecciona al menos una pantalla", "info");
    return;
  }

  var tipo    = msgState.tipo;
  var payload = construirPayload(tipo);
  if (payload === null) return; // validación fallida

  btn.disabled = true;
  btn.textContent = "Enviando...";

  try {
    var screens = (typeof state !== "undefined" && state.screens) ? state.screens : [];
    var todas   = screens.filter(function(s) { return s.status === "online"; });
    var esTodas = msgState.pantallasSeleccionadas.length === todas.length;

    if (esTodas) {
      // Broadcast a todas
      await API.broadcast(tipo, payload);
      if (typeof showToast === "function") showToast("✅ Mensaje enviado a todas las pantallas", "success");
    } else {
      // Enviar individualmente a cada seleccionada
      var errores = 0;
      for (var i = 0; i < msgState.pantallasSeleccionadas.length; i++) {
        var id = msgState.pantallasSeleccionadas[i];
        try {
          await API.sendToScreen(id, tipo, payload);
        } catch(e) {
          errores++;
        }
      }
      if (errores === 0) {
        if (typeof showToast === "function") showToast("✅ Mensaje enviado a " + msgState.pantallasSeleccionadas.length + " pantalla(s)", "success");
      } else {
        if (typeof showToast === "function") showToast("⚠️ " + errores + " pantalla(s) no recibieron el mensaje", "error");
      }
    }

    if (tipo !== "limpiar") limpiarFormMensaje();

  } catch(e) {
    console.error("Error al enviar mensaje libre:", e);
    if (typeof showToast === "function") showToast("❌ Error al enviar el mensaje", "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "📤 Enviar mensaje";
  }
}

function construirPayload(tipo) {
  switch (tipo) {

    case "bienvenida": {
      var nombre = (document.getElementById("msg-nombre") || {}).value || "";
      if (!nombre.trim()) {
        if (typeof showToast === "function") showToast("Escribe el nombre del visitante", "info");
        return null;
      }
      return {
        nombre:    nombre.trim(),
        cargo:     ((document.getElementById("msg-cargo")     || {}).value || "").trim(),
        empresa:   ((document.getElementById("msg-empresa")   || {}).value || "").trim(),
        anfitrion: ((document.getElementById("msg-anfitrion") || {}).value || "").trim(),
      };
    }

    case "texto": {
      var titulo = (document.getElementById("msg-titulo") || {}).value || "";
      if (!titulo.trim()) {
        if (typeof showToast === "function") showToast("Escribe el título del mensaje", "info");
        return null;
      }
      return {
        titulo:    titulo.trim(),
        subtexto:  ((document.getElementById("msg-subtexto") || {}).value || "").trim(),
      };
    }

    case "aviso": {
      var texto = (document.getElementById("msg-aviso-texto") || {}).value || "";
      if (!texto.trim()) {
        if (typeof showToast === "function") showToast("Escribe el texto del aviso", "info");
        return null;
      }
      return {
        icono:  ((document.getElementById("msg-aviso-icono") || {}).value || "📢"),
        texto:  texto.trim(),
        sub:    ((document.getElementById("msg-aviso-sub")   || {}).value || "").trim(),
      };
    }

    case "imagen": {
      var imagenUrl = (document.getElementById("msg-imagen-url") || {}).value || "";
      if (!imagenUrl) {
        if (typeof showToast === "function") showToast("Espera a que se suba la imagen o selecciona una nueva", "info");
        return null; // Cancel format
      }
      return {
        imagenUrl: imagenUrl,
        titulo:    ((document.getElementById("msg-imagen-titulo") || {}).value || "").trim(),
        texto:     ((document.getElementById("msg-imagen-texto") || {}).value || "").trim(),
      };
    }

    case "limpiar":
      return {};

    default:
      return {};
  }
}

// ── LIMPIAR FORMULARIO ────────────────────────────────────────
function limpiarFormMensaje() {
  ["msg-nombre","msg-cargo","msg-empresa","msg-anfitrion",
   "msg-titulo","msg-subtexto","msg-aviso-texto","msg-aviso-sub",
   "msg-imagen-titulo","msg-imagen-texto"]
  .forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = "";
  });
  var imgFile = document.getElementById("msg-imagen-file");
  if (imgFile) imgFile.value = "";
  var imgUrl = document.getElementById("msg-imagen-url");
  if (imgUrl) imgUrl.value = "";

  var iconoSel = document.getElementById("msg-aviso-icono");
  if (iconoSel) iconoSel.selectedIndex = 0;
  actualizarPreview();
}

// ── GUARDAR EN SERVIDOR ────────────────────────────────────────
async function guardarMensajeEnServidor() {
  var texto = "";
  if (msgState.tipo === "texto") {
    texto = (document.getElementById("msg-titulo") || {}).value || "";
  } else if (msgState.tipo === "aviso") {
    texto = (document.getElementById("msg-aviso-texto") || {}).value || "";
  } else if (msgState.tipo === "bienvenida") {
    var n = (document.getElementById("msg-nombre") || {}).value || "";
    if (n) texto = "¡Bienvenido " + n + "!";
  } else if (msgState.tipo === "imagen") {
    var imgU = (document.getElementById("msg-imagen-url") || {}).value || "";
    var imgTi = (document.getElementById("msg-imagen-titulo") || {}).value || "";
    var imgT = (document.getElementById("msg-imagen-texto") || {}).value || "";
    if (imgU) {
       texto = JSON.stringify({ type: "imagen", imagenUrl: imgU, titulo: imgTi, texto: imgT });
    }
  } else {
    if (typeof showToast === "function") showToast("Escribe un mensaje en otra pestaña de mensaje", "info");
    return;
  }

  texto = texto.trim();
  if (!texto) {
    if (typeof showToast === "function") showToast("El mensaje está vacío. Escríbelo primero.", "error");
    return;
  }

  try {
    var resp = await fetch("/api/greetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: texto })
    });
    if (resp.ok) {
      if (typeof showToast === "function") showToast("✅ Guardado en rotación de servidor como JSON", "success");
    } else {
      throw new Error("HTTP error " + resp.status);
    }
  } catch(e) {
    if (typeof showToast === "function") showToast("❌ Hubo un error al intentar guardarlo", "error");
  }
}