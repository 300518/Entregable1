/* turno.js
   Simulador de Turno para entrega Entregable1+Apellido
*/

// ---------- Variables y constantes ----------
const NOMBRE_LOCAL = "Turno de atención Ejecutivo Banco"; // constante
let colaTurnos = []; // array que contiene objetos {numero, nombre}
let siguienteNumero = 1; // variable que aumenta con cada turno creado
let totalAtendidos = 0; // estadística

// ---------- Funciones (entrada → procesamiento → salida) ----------

/**
 * entrada: solicita nombre (prompt)
 * proceso: crea un objeto turno y lo agrega al array
 * salida: confirma con alert y registra en consola
 */
function sacarTurno() {
  // Entrada
  let nombre = prompt("Ingrese nombre para sacar turno:");

  // Validaciones simples (condicional)
  if (!nombre) {
    alert("No se ingresó un nombre. Operación cancelada.");
    console.log("Intento de sacar turno sin nombre.");
    return; // salida temprana
  }

  // Procesamiento
  const turno = { numero: siguienteNumero, nombre: nombre.trim() };
  colaTurnos.push(turno);
  siguienteNumero++;

  // Salida
  alert("Turno sacado:\nNº " + turno.numero + " — " + turno.nombre);
  console.log("Nuevo turno agregado:", turno);
}

/**
 * entrada: no requiere (es función de consulta)
 * proceso: recorre la cola con un bucle for
 * salida: imprime la cola en la consola (formato legible)
 */
function verColaEnConsola() {
  console.log("---- Cola de turnos en " + NOMBRE_LOCAL + " ----");
  console.log("Turnos pendientes: " + colaTurnos.length);
  if (colaTurnos.length === 0) {
    console.log("No hay turnos en espera.");
    return;
  }

  // Uso de for para listar los elementos (ciclo pedido en la consigna)
  for (let i = 0; i < colaTurnos.length; i++) {
    const t = colaTurnos[i];
    console.log((i + 1) + ". Turno N°" + t.numero + " — " + t.nombre);
  }
  console.log("-----------------------------------------------");
}

/**
 * entrada: confirmación para atender (confirm)
 * proceso: si hay turnos, extrae el primero (shift)
 * salida: muestra alert + log en consola del atendido
 */
function atenderSiguiente() {
  if (colaTurnos.length === 0) {
    alert("No hay turnos para atender.");
    console.log("Atender solicitado pero la cola está vacía.");
    return;
  }

  // Confirmación antes de atender
  const confirma = confirm("¿Deseas atender al siguiente cliente? (Sí = atender)");
  if (!confirma) {
    console.log("Atender cancelado por el usuario.");
    return;
  }

  // Procesamiento: atender (FIFO)
  const atendido = colaTurnos.shift();
  totalAtendidos++;

  // Salida: mostrar resultado
  alert("Atendiendo:\nN° " + atendido.numero + " — " + atendido.nombre);
  console.log("Atendido:", atendido);
}

/**
 * entrada: prompt pidiendo el número a cancelar
 * proceso: busca en el array y elimina si existe (uso de ciclo + condicional)
 * salida: informa por alert/console si fue cancelado o no encontrado
 */
function cancelarTurnoPorNumero() {
  if (colaTurnos.length === 0) {
    alert("No hay turnos para cancelar.");
    console.log("Cancelar turno solicitado pero cola vacía.");
    return;
  }

  const input = prompt("Ingrese el número de turno a cancelar (por ejemplo: 3):");
  const numero = parseInt(input, 10);

  if (isNaN(numero)) {
    alert("Número inválido. Operación cancelada.");
    console.log("Número inválido recibido en cancelarTurnoPorNumero:", input);
    return;
  }

  // Buscar el índice del turno con ese número
  let idx = -1;
  for (let i = 0; i < colaTurnos.length; i++) {
    if (colaTurnos[i].numero === numero) {
      idx = i;
      break;
    }
  }

  if (idx === -1) {
    alert("No se encontró un turno con el número " + numero);
    console.log("Intento de cancelar turno no existente: N°" + numero);
    return;
  }

  // Eliminar usando, se averigua la función splice.
  const eliminado = colaTurnos.splice(idx, 1)[0];
  alert("Turno cancelado:\nN° " + eliminado.numero + " — " + eliminado.nombre);
  console.log("Turno eliminado:", eliminado);
}

/**
 * entrada: ninguna
 * proceso: compone un resumen de estadísticas
 * salida: muestra el resumen concatenado con saltos de línea en alert y consola
 */
function mostrarEstadisticas() {
  const pendientes = colaTurnos.length;
  // concatenación con saltos de línea
  const mensaje = 
    "Resumen del día en " + NOMBRE_LOCAL + ":\n" +
    "Total atendidos: " + totalAtendidos + "\n" +
    "Turnos pendientes: " + pendientes + "\n\n" +
    "Cola actual (ver en consola para más detalle).";

  alert(mensaje);
  console.log("Estadísticas:", { totalAtendidos, pendientes, colaTurnos });
  verColaEnConsola(); // llamada a otra función para mostrar detalle
}

// ---------- Menú principal (controlador) ----------

/**
 * Menú: usa prompt para mostrar opciones y un bucle while para repetir
 * Invoca las funciones anteriores según elección del usuario.
 */
function menuPrincipal() {
  console.log("Iniciando Turnero - " + NOMBRE_LOCAL);
  let opcion = "";

  // Usamos un bucle do..while para asegurar al menos una ejecución
  do {
    opcion = prompt(
      "MENU - Turnero " + NOMBRE_LOCAL + "\n\n" +
      "1 - Sacar turno\n" +
      "2 - Ver cola (Consola)\n" +
      "3 - Atender siguiente\n" +
      "4 - Cancelar turno por número\n" +
      "5 - Mostrar estadísticas\n" +
      "6 - Llenar cola de prueba (agregar 5 turnos) [utilidad para pruebas]\n" +
      "7 - Salir\n\n" +
      "Ingresa el número de la opción:"
    );

    switch (opcion) {
      case "1":
        sacarTurno();
        break;
      case "2":
        verColaEnConsola();
        break;
      case "3":
        atenderSiguiente();
        break;
      case "4":
        cancelarTurnoPorNumero();
        break;
      case "5":
        mostrarEstadisticas();
        break;
      case "6":
        llenarColaDePrueba();
        break;
      case "7":
        console.log("Usuario salió del menú.");
        break;
      default:
        if (opcion !== null) {
          alert("Opción inválida. Ingresa un número del 1 al 7.");
        } else {
          // usuario presionó Cancel en el prompt: confirmamos salida
          const salir = confirm("¿Deseas salir del simulador?");
          if (salir) {
            opcion = "7"; // forzar salida
          }
        }
    }
  } while (opcion !== "7");

  alert("Gracias por usar el simulador. Revisa la consola para detalles.");
  console.log("Turnero finalizado. Estado final:", { siguienteNumero, totalAtendidos, colaTurnos });
}

/**
 * Función auxiliar de prueba (entrada: ninguna, proceso: agrega varios turnos, salida: console)
 * demuestra el uso de ciclos for para agregar varios elementos.
 */
function llenarColaDePrueba() {
  const nombresPrueba = ["Ana", "Luis", "María", "Carlos", "Sofía"];
  for (let i = 0; i < nombresPrueba.length; i++) {
    const t = { numero: siguienteNumero, nombre: nombresPrueba[i] };
    colaTurnos.push(t);
    siguienteNumero++;
  }
  alert("Se agregaron " + nombresPrueba.length + " turnos de prueba.");
  console.log("Cola rellenada con turnos de prueba.");
}

// ---------- Llamada inicial para ejecutar el menú al cargar la página ----------
//menuPrincipal();
document.addEventListener("DOMContentLoaded", () => {
    const boton = document.getElementById("btnIniciar");
    //Se genera y averigua función para el click de botonera.
    boton.addEventListener("click", () => {
      alert("¡Bienvenido al simulador de turnos!\nTe recordamos abrir la consola previamente\nSi no lo hiciste, hazlo y actualiza la página");
      menuPrincipal();
    });
  });
