
// ---------- Constantes ----------
const LS_KEYS = {
    COLA: 'sim_colaturnos_v1',
    SIGUIENTE: 'sim_siguiente_v1',
    ATENDIDOS: 'sim_atendidos_v1'
  };
  
  let colaTurnos = [];
  let siguienteNumero = 1;
  let totalAtendidos = 0;
  
  function saveState() {
    localStorage.setItem(LS_KEYS.COLA, JSON.stringify(colaTurnos));
    localStorage.setItem(LS_KEYS.SIGUIENTE, String(siguienteNumero));
    localStorage.setItem(LS_KEYS.ATENDIDOS, String(totalAtendidos));
  }
  
  function loadState() {
    const rawCola = localStorage.getItem(LS_KEYS.COLA);
    const rawSig = localStorage.getItem(LS_KEYS.SIGUIENTE);
    const rawAtt = localStorage.getItem(LS_KEYS.ATENDIDOS);
  
    if (rawCola) {
      try { colaTurnos = JSON.parse(rawCola); } catch(e){ colaTurnos = []; }
    }
    if (rawSig) siguienteNumero = Number(rawSig) || 1;
    if (rawAtt) totalAtendidos = Number(rawAtt) || 0;
  }
  
  const $ = sel => document.querySelector(sel);
  const formSacar = $('#form-sacar-turno');
  const inputNombre = $('#nombre-input');
  const btnAtender = $('#btn-atender');
  const btnLlenarPrueba = $('#btn-llenar-prueba');
  const btnLimpiar = $('#btn-limpiar');
  const colaList = $('#cola-list');
  const spanSiguiente = $('#siguiente-num');
  const spanAtendidos = $('#total-atendidos');
  const spanPendientes = $('#pendientes');
  const formCancelar = $('#form-cancelar-turno');
  const inputCancelNum = $('#cancel-num-input');
  
  function renderCola() {
    colaList.innerHTML = '';
    if (colaTurnos.length === 0) {
      const li = document.createElement('div');
      li.className = 'list-group-item';
      li.textContent = 'No hay turnos en espera.';
      colaList.appendChild(li);
    } else {
      colaTurnos.forEach((t) => {
        const el = document.createElement('div');
        el.className = 'list-group-item d-flex justify-content-between align-items-center';
        el.innerHTML = `
          <div>
            <strong>N° ${t.numero}</strong> — ${escapeHtml(t.nombre)}
          </div>
          <div class="btn-group btn-group-sm" role="group" aria-label="acciones">
            <button class="btn btn-outline-success btn-att">Atender</button>
            <button class="btn btn-outline-danger btn-cancel">Cancelar</button>
          </div>
        `;
        // botones por item
        el.querySelector('.btn-att').addEventListener('click', () => {
          atenderTurnoEspecifico(t.numero);
        });
        el.querySelector('.btn-cancel').addEventListener('click', () => {
          cancelarTurnoPorNumeroUI(t.numero);
        });
        colaList.appendChild(el);
      });
    }
    spanSiguiente.textContent = String(siguienteNumero);
    spanAtendidos.textContent = String(totalAtendidos);
    spanPendientes.textContent = String(colaTurnos.length);
  }
  
  // escape básico para evitar inyección
  function escapeHtml(text) {
    const map = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'};
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }
  
  // ---------- Lógica (versión DOM) ----------
  function sacarTurnoUI(nombre) {
    const nombreTrim = String(nombre || '').trim();
    if (!nombreTrim) {
      showInlineAlert('Ingresa un nombre válido.', 'warning');
      return;
    }
    const turno = { numero: siguienteNumero, nombre: nombreTrim };
    colaTurnos.push(turno);
    siguienteNumero++;
    saveState();
    renderCola();
    showInlineAlert(`Turno N° ${turno.numero} agregado.`, 'success');
    inputNombre.value = '';
  }
  
  function atenderSiguienteUI() {
    if (colaTurnos.length === 0) {
      showInlineAlert('No hay turnos para atender.', 'info');
      return;
    }
    const atendido = colaTurnos.shift();
    totalAtendidos++;
    saveState();
    renderCola();
    showInlineAlert(`Atendiendo N° ${atendido.numero} — ${atendido.nombre}`, 'success');
  }
  
  function atenderTurnoEspecifico(numero) {
    const idx = colaTurnos.findIndex(t => t.numero === Number(numero));
    if (idx === -1) { showInlineAlert('Turno no encontrado.', 'warning'); return; }
    const atendido = colaTurnos.splice(idx,1)[0];
    totalAtendidos++;
    saveState();
    renderCola();
    showInlineAlert(`Atendiendo N° ${atendido.numero} — ${atendido.nombre}`, 'success');
  }
  
  function cancelarTurnoPorNumeroUI(numero) {
    const idx = colaTurnos.findIndex(t => t.numero === Number(numero));
    if (idx === -1) { showInlineAlert('No se encontró ese número.', 'warning'); return; }
    const eliminado = colaTurnos.splice(idx,1)[0];
    saveState();
    renderCola();
    showInlineAlert(`Se canceló N° ${eliminado.numero} — ${eliminado.nombre}`, 'info');
  }
  
  function cancelarTurnoPorNumeroFormulario(numero) {
    // llamada desde formulario
    cancelarTurnoPorNumeroUI(numero);
    inputCancelNum.value = '';
  }
  
  // llenar la cola
  function llenarColaDePrueba() {
    const nombresPrueba = ["Paula","Luis","Alvarito","Carlos","Sofía"];
    nombresPrueba.forEach(n => {
      colaTurnos.push({ numero: siguienteNumero, nombre: n });
      siguienteNumero++;
    });
    saveState();
    renderCola();
    showInlineAlert('Se añadieron turnos de prueba.', 'success');
  }
  
  function resetSimulador() {
    if (!confirm('¿Seguro deseas resetear todo el simulador? Esta acción borrará datos guardados.')) return;
    colaTurnos = [];
    siguienteNumero = 1;
    totalAtendidos = 0;
    saveState();
    renderCola();
    showInlineAlert('Simulador reseteado.', 'info');
  }
  
  const alertContainerId = 'sim-alert-container';
  function ensureAlertContainer() {
    if (document.getElementById(alertContainerId)) return;
    const c = document.createElement('div');
    c.id = alertContainerId;
    c.style.position = 'fixed';
    c.style.right = '18px';
    c.style.top = '18px';
    c.style.zIndex = 9999;
    document.body.appendChild(c);
  }
  
  function showInlineAlert(text, type='info', timeout=3000) {
    ensureAlertContainer();
    const cont = document.getElementById(alertContainerId);
    const el = document.createElement('div');
    const bs = {
      success: 'alert-success',
      info: 'alert-info',
      warning: 'alert-warning',
      danger: 'alert-danger'
    };
    el.className = `alert ${bs[type] || bs.info} fade show`;
    el.role = 'alert';
    el.style.minWidth = '220px';
    el.style.marginTop = '6px';
    el.innerHTML = text;
    cont.appendChild(el);
    setTimeout(() => {
      el.classList.remove('show');
      el.classList.add('hide');
      setTimeout(() => el.remove(), 400);
    }, timeout);
  }
  
  function eventos() {
    // sacar turno por formulario
    formSacar.addEventListener('submit', (e) => {
      e.preventDefault();
      sacarTurnoUI(inputNombre.value);
    });
  
    // atender siguiente
    btnAtender.addEventListener('click', (e) => {
      atenderSiguienteUI();
    });
  
    // llenar prueba
    btnLlenarPrueba.addEventListener('click', (e) => {
      llenarColaDePrueba();
    });
  
    // cancelar por formulario
    formCancelar.addEventListener('submit', (e) => {
      e.preventDefault();
      const num = Number(inputCancelNum.value);
      if (isNaN(num) || num <= 0) {
        showInlineAlert('Ingresa un número válido.', 'warning'); return;
      }
      cancelarTurnoPorNumeroFormulario(num);
    });
  
    // reset
    btnLimpiar.addEventListener('click', (e) => {
      resetSimulador();
    });
  
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'c') { inputNombre.focus(); }
    });
  }
  
  // ---------- Init ----------
  function init() {
    loadState();
    renderCola();
    eventos();
  }
  
  document.addEventListener('DOMContentLoaded', init);
  