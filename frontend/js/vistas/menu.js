// Vista: menú del encabezado en celular
var MenuVista = (function () {
  "use strict";

  function alternar(boton) {
    var enc = boton.closest(".encabezado");
    var abierto = enc.classList.toggle("abierto");
    boton.setAttribute("aria-expanded", String(abierto));
  }

  function cerrar() {
    var enc = document.querySelector(".encabezado.abierto");
    if (enc) {
      enc.classList.remove("abierto");
      var b = enc.querySelector(".menu-btn");
      if (b) b.setAttribute("aria-expanded", "false");
    }
  }

  return {
    alternar: alternar,
    cerrar: cerrar
  };
})();
