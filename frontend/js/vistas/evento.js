// Vista: el total del detalle del evento y el campo de causa del formulario
var EventoVista = (function () {
  "use strict";

  function pesos(valor) {
    return "$" + valor.toLocaleString("es-CO");
  }

  function pintarTotal(precioUnitario, cantidad) {
    var destino = document.querySelector("[data-total]");
    if (destino) destino.textContent = pesos(precioUnitario * cantidad);
  }

  // La causa de cancelación solo tiene sentido cuando el estado es Cancelado,
  // y ahí sí es obligatoria: el reporte de eventos cancelados la necesita.
  function alternarCausa(estado) {
    var caja = document.querySelector("[data-campo-causa]");
    if (!caja) return;

    var cancelado = estado === "Cancelado";
    caja.hidden = !cancelado;

    var campo = caja.querySelector("textarea");
    if (!campo) return;
    if (cancelado) {
      campo.dataset.reglas = "requerido";
    } else {
      delete campo.dataset.reglas;
      campo.value = "";
      campo.removeAttribute("aria-invalid");
      var error = caja.querySelector(".error");
      if (error) error.textContent = "";
    }
  }

  return {
    pesos: pesos,
    pintarTotal: pintarTotal,
    alternarCausa: alternarCausa
  };
})();
