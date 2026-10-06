// Vista: muestra y esconde las tarjetas del catálogo
var CatalogoVista = (function () {
  "use strict";

  function tarjetas() {
    var lista = document.querySelector("[data-lista-eventos]");
    return lista ? lista.querySelectorAll(".evento") : [];
  }

  function mostrar(visibles) {
    var todas = tarjetas();
    Array.prototype.forEach.call(todas, function (t) {
      t.hidden = visibles.indexOf(t) === -1;
    });

    var vacio = document.querySelector("[data-sin-resultados]");
    if (vacio) vacio.hidden = visibles.length > 0;

    var conteo = document.querySelector("[data-conteo]");
    if (conteo) {
      conteo.textContent =
        visibles.length === 1
          ? "1 evento disponible"
          : visibles.length + " eventos disponibles";
    }
  }

  return {
    tarjetas: tarjetas,
    mostrar: mostrar
  };
})();
