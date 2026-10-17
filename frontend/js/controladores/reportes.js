// Controlador: trae el tablero de reportes del administrador.
//
// El backend los devuelve todos en una sola llamada, así que la pantalla
// solo tiene que pedirlos cada vez que se abre.
var ReporteControlador = (function () {
  "use strict";

  function aviso(texto, esError) {
    var caja = document.querySelector("[data-rp-mensaje]");
    if (!caja) return;

    if (!texto) {
      caja.hidden = true;
      caja.textContent = "";
      return;
    }
    caja.hidden = false;
    caja.className = esError ? "aviso aviso-error" : "aviso";
    caja.textContent = texto;
  }

  function cargar() {
    if (!ApiModelo.hayApi()) {
      aviso("No hay conexión con el servidor, así que no se pueden calcular los reportes.", true);
      return;
    }

    aviso("Consultando la base de datos...");

    ApiModelo.tablero().then(function (tablero) {
      ReporteVista.pintarTablero(tablero);
      aviso("");
    }).catch(function (error) {
      aviso(error.message, true);
    });
  }

  function iniciar() {
    if (!document.querySelector("[data-rp-resumen]")) return;

    document.addEventListener("ticketflow:pantalla", function (e) {
      if (e.detail.pantalla === "panel-admin") cargar();
    });
  }

  return { iniciar: iniciar };
})();
