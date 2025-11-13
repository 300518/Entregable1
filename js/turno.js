const DEFAULT_LS_KEYS = {
  COLA: "sim_colaturnos_v1",
  SIGUIENTE: "sim_siguiente_v1",
  ATENDIDOS: "sim_atendidos_v1",
};


function agregarTurno(cola, nombre, siguienteNumero) {
  const nombreTrim = String(nombre || "").trim();
  if (!nombreTrim)
    return { error: "Nombre inválido", cola: [...cola], siguienteNumero };
  const nuevoTurno = { numero: Number(siguienteNumero), nombre: nombreTrim };
  const nuevaCola = [...cola, nuevoTurno];
  return {
    error: null,
    cola: nuevaCola,
    siguienteNumero: Number(siguienteNumero) + 1,
    turno: nuevoTurno,
  };
}


function atenderTurno(cola) {
  if (!Array.isArray(cola) || cola.length === 0)
    return { atendido: null, nuevaCola: [...cola] };
  const [atendido, ...resto] = cola;
  return { atendido, nuevaCola: resto };
}

class TurnManager {
  constructor(lsKeys = DEFAULT_LS_KEYS) {
    this._lsKeys = lsKeys;
    this._cola = [];
    this._siguienteNumero = 1;
    this._totalAtendidos = 0;
    this._cargarEstado();
  }

  _saveEstado() {
    try {
      localStorage.setItem(this._lsKeys.COLA, JSON.stringify(this._cola));
      localStorage.setItem(
        this._lsKeys.SIGUIENTE,
        String(this._siguienteNumero)
      );
      localStorage.setItem(
        this._lsKeys.ATENDIDOS,
        String(this._totalAtendidos)
      );
    } catch (e) {
      // Si falla localStorage, no rompemos la app; registramos el error.
      console.error("Error guardando estado en localStorage", e);
    }
  }

  _cargarEstado() {
    try {
      const rawCola = localStorage.getItem(this._lsKeys.COLA);
      const rawSig = localStorage.getItem(this._lsKeys.SIGUIENTE);
      const rawAtt = localStorage.getItem(this._lsKeys.ATENDIDOS);
      this._cola = rawCola ? JSON.parse(rawCola) : [];
      this._siguienteNumero = rawSig ? Number(rawSig) || 1 : 1;
      this._totalAtendidos = rawAtt ? Number(rawAtt) || 0 : 0;
    } catch (e) {
      console.warn("No se pudo cargar estado. Se usará estado por defecto.", e);
      this._cola = [];
      this._siguienteNumero = 1;
      this._totalAtendidos = 0;
    }
  }

 
  agregarTurno(nombre) {
    const nombreTrim = String(nombre || "").trim();
    if (!nombreTrim) return { error: "Nombre inválido" };
    const turno = { numero: this._siguienteNumero, nombre: nombreTrim };
    this._cola.push(turno);
    this._siguienteNumero += 1;
    this._saveEstado();
    return { turno, cola: [...this._cola] };
  }

  
  atenderSiguiente() {
    if (this._cola.length === 0) return { atendido: null };
    const atendido = this._cola.shift();
    this._totalAtendidos += 1;
    this._saveEstado();
    return { atendido, cola: [...this._cola] };
  }

  /**
   * atenderNumero(numero)
   * - Atiende un turno por número.
   */
  atenderNumero(numero) {
    const idx = this._cola.findIndex((t) => t.numero === Number(numero));
    if (idx === -1) return { error: "No encontrado" };
    const atendido = this._cola.splice(idx, 1)[0];
    this._totalAtendidos += 1;
    this._saveEstado();
    return { atendido, cola: [...this._cola] };
  }

  
  cancelarTurno(numero) {
    const idx = this._cola.findIndex((t) => t.numero === Number(numero));
    if (idx === -1) return { error: "No encontrado" };
    const eliminado = this._cola.splice(idx, 1)[0];
    this._saveEstado();
    return { eliminado, cola: [...this._cola] };
  }

  llenarTurno(arrayNombres = []) {
    arrayNombres.forEach((n) => {
      this._cola.push({ numero: this._siguienteNumero, nombre: String(n) });
      this._siguienteNumero++;
    });
    this._saveEstado();
    return { cola: [...this._cola] };
  }

  resetearSimulador(confirmCallback = () => true) {
    if (!confirmCallback()) return { canceled: true };
    this._cola = [];
    this._siguienteNumero = 1;
    this._totalAtendidos = 0;
    this._saveEstado();
    return { canceled: false, cola: [...this._cola] };
  }

  saberEstado() {
    return {
      cola: [...this._cola],
      siguienteNumero: this._siguienteNumero,
      totalAtendidos: this._totalAtendidos,
      pendientes: this._cola.length,
    };
  }
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

const ALERT_CONTAINER_ID = "sim-alert-container";
function alertaContenedor() {
  if (document.getElementById(ALERT_CONTAINER_ID))
    return document.getElementById(ALERT_CONTAINER_ID);
  const c = document.createElement("div");
  c.id = ALERT_CONTAINER_ID;
  c.style.position = "fixed";
  c.style.right = "18px";
  c.style.top = "18px";
  c.style.zIndex = 9999;
  document.body.appendChild(c);
  return c;
}
function mostrarAlerta(text, type = "info", timeout = 3000) {
  const cont = alertaContenedor();
  const el = document.createElement("div");
  const bs = {
    success: "alert-success",
    info: "alert-info",
    warning: "alert-warning",
    danger: "alert-danger",
  };
  el.className = `alert ${bs[type] || bs.info} fade show`;
  el.role = "alert";
  el.style.minWidth = "220px";
  el.style.marginTop = "6px";
  el.innerHTML = escapeHtml(String(text));
  cont.appendChild(el);
  setTimeout(() => {
    el.classList.remove("show");
    el.classList.add("hide");
    setTimeout(() => el.remove(), 400);
  }, timeout);
}

function CargarPorEstado(manager, elements) {
  const state = manager.saberEstado();
  const colaList = elements.colaList;
  colaList.innerHTML = "";
  if (state.cola.length === 0) {
    const li = document.createElement("div");
    li.className = "list-group-item";
    li.textContent = "No hay turnos en espera.";
    colaList.appendChild(li);
  } else {
    state.cola.forEach((t) => {
      const el = document.createElement("div");
      el.className =
        "list-group-item d-flex justify-content-between align-items-center";
      el.innerHTML = `
        <div>
          <strong>N° ${t.numero}</strong> — ${escapeHtml(t.nombre)}
        </div>
        <div class="btn-group btn-group-sm" role="group" aria-label="acciones">
          <button class="btn btn-outline-success btn-att">Atender</button>
          <button class="btn btn-outline-danger btn-cancel">Cancelar</button>
        </div>
      `;
      el.querySelector(".btn-att").addEventListener("click", () => {
        const r = manager.atenderNumero(t.numero);
        if (r.error) mostrarAlerta("Turno no encontrado.", "warning");
        else
          mostrarAlerta(
            `Atendiendo N° ${r.atendido.numero} — ${r.atendido.nombre}`,
            "success"
          );
        CargarPorEstado(manager, elements);
      });
      el.querySelector(".btn-cancel").addEventListener("click", () => {
        const r = manager.cancelarTurno(t.numero);
        if (r.error) mostrarAlerta("No se encontró ese número.", "warning");
        else
          mostrarAlerta(
            `Se canceló N° ${r.eliminado.numero} — ${r.eliminado.nombre}`,
            "info"
          );
        CargarPorEstado(manager, elements);
      });
      colaList.appendChild(el);
    });
  }
  elements.spanSiguiente.textContent = String(state.siguienteNumero);
  elements.spanAtendidos.textContent = String(state.totalAtendidos);
  elements.spanPendientes.textContent = String(state.pendientes);
}

/* ---------- Init: solo aquí se consulta el DOM y se enlazan eventos ---------- */
function init() {
  // Crear una instancia del manager (sin exponerla globalmente)
  const manager = new TurnManager();

  // --- Consulta de elementos DOM (solo aquí) ---
  const $ = (sel) => document.querySelector(sel);
  const formSacar = $("#form-sacar-turno");
  const inputNombre = $("#nombre-input");
  const btnAtender = $("#btn-atender");
  const btnLlenarPrueba = $("#btn-llenar-prueba");
  const btnLimpiar = $("#btn-limpiar");
  const colaList = $("#cola-list");
  const spanSiguiente = $("#siguiente-num");
  const spanAtendidos = $("#total-atendidos");
  const spanPendientes = $("#pendientes");
  const formCancelar = $("#form-cancelar-turno");
  const inputCancelNum = $("#cancel-num-input");

  const elements = { colaList, spanSiguiente, spanAtendidos, spanPendientes };

  // --- Render inicial ---
  CargarPorEstado(manager, elements);

  // --- Eventos ---
  formSacar.addEventListener("submit", (e) => {
    e.preventDefault();
    const r = manager.agregarTurno(inputNombre.value);
    if (r.error) {
      mostrarAlerta(r.error, "warning");
      return;
    }
    mostrarAlerta(`Turno N° ${r.turno.numero} agregado.`, "success");
    inputNombre.value = "";
    CargarPorEstado(manager, elements);
  });

  btnAtender.addEventListener("click", () => {
    const r = manager.atenderSiguiente();
    if (!r.atendido) mostrarAlerta("No hay turnos para atender.", "info");
    else
      mostrarAlerta(
        `Atendiendo N° ${r.atendido.numero} — ${r.atendido.nombre}`,
        "success"
      );
    CargarPorEstado(manager, elements);
  });

  btnLlenarPrueba.addEventListener("click", () => {
    manager.llenarTurno(["Paula", "Luis", "Alvarito", "Carlos", "Sofía"]);
    mostrarAlerta("Se añadieron turnos de prueba.", "success");
    CargarPorEstado(manager, elements);
  });

  formCancelar.addEventListener("submit", (e) => {
    e.preventDefault();
    const num = Number(inputCancelNum.value);
    if (isNaN(num) || num <= 0) {
      mostrarAlerta("Ingresa un número válido.", "warning");
      return;
    }
    const r = manager.cancelarTurno(num);
    if (r.error) mostrarAlerta("No se encontró ese número.", "warning");
    else {
      mostrarAlerta(
        `Se canceló N° ${r.eliminado.numero} — ${r.eliminado.nombre}`,
        "info"
      );
      inputCancelNum.value = "";
    }
    CargarPorEstado(manager, elements);
  });

  btnLimpiar.addEventListener("click", () => {
    manager.resetearSimulador(() =>
      confirm(
        "¿Seguro deseas resetear todo el simulador? Esta acción borrará datos guardados."
      )
    );
    mostrarAlerta("Simulador reseteado.", "info");
    CargarPorEstado(manager, elements);
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "c") {
      inputNombre.focus();
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
