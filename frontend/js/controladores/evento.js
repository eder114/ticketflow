// Controlador: detalle del evento y formulario de registro de eventos
var EventoControlador = (function () {
  "use strict";

  var PRECIO_UNITARIO = 120000; // lo trae la API en la historia de conexión

  function iniciarDetalle() {
    var entradas = document.getElementById("ev-entradas");
    if (!entradas) return;

    function recalcular() {
      var cantidad = parseInt(entradas.value, 10);
      if (!cantidad || cantidad < 1) cantidad = 1;

      var maximo = parseInt(entradas.max, 10) || 10;
      if (cantidad > maximo) cantidad = maximo;

      entradas.value = String(cantidad);
      EventoVista.pintarTotal(PRECIO_UNITARIO, cantidad);
    }

    entradas.addEventListener("input", recalcular);
    entradas.addEventListener("change", recalcular);
    recalcular();
  }

  function iniciarFormulario() {
    var estado = document.getElementById("nv-estado");
    if (!estado) return;

    estado.addEventListener("change", function () {
      EventoVista.alternarCausa(estado.value);
    });
    EventoVista.alternarCausa(estado.value);

    // La fecha de finalización no puede quedar antes que la de inicio.
    var inicio = document.getElementById("nv-inicio");
    var fin = document.getElementById("nv-fin");
    if (inicio && fin) {
      inicio.addEventListener("change", function () {
        fin.min = inicio.value;
        if (fin.value && fin.value < inicio.value) fin.value = "";
      });
    }
  }

  function iniciar() {
    iniciarDetalle();
    iniciarFormulario();
  }

  return { iniciar: iniciar };
})();
