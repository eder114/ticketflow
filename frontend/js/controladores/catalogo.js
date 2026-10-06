// Controlador: escucha los filtros del catálogo
var CatalogoControlador = (function () {
  "use strict";

  function filtroActual(form) {
    return {
      ciudad: form.elements.ciudad ? form.elements.ciudad.value : "",
      categoria: form.elements.categoria ? form.elements.categoria.value : "",
      precio: form.elements.precio ? form.elements.precio.value : "",
      desde: form.elements.desde ? form.elements.desde.value : ""
    };
  }

  function aplicar(form) {
    var visibles = CatalogoModelo.filtrar(CatalogoVista.tarjetas(), filtroActual(form));
    CatalogoVista.mostrar(visibles);
  }

  function iniciar() {
    var form = document.querySelector("[data-filtros]");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      aplicar(form);
    });

    // Filtrar al cambiar cualquier campo, sin esperar al botón.
    form.addEventListener("change", function () {
      aplicar(form);
    });

    form.addEventListener("reset", function () {
      // El reset del navegador corre después del evento.
      window.setTimeout(function () { aplicar(form); }, 0);
    });

    aplicar(form);
  }

  return { iniciar: iniciar };
})();
