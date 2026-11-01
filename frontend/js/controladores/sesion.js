// Controlador: cerrar sesión y mantener el encabezado al día
var SesionControlador = (function () {
  "use strict";

  function iniciar() {
    document.addEventListener("click", function (e) {
      // Un evento puede venir de algo que no es un elemento (por ejemplo, uno
      // lanzado sobre el propio documento): ahí no hay nada que buscar.
      if (!e.target || !e.target.closest) return;
      var boton = e.target.closest("[data-cerrar-sesion]");
      if (!boton) return;
      SesionModelo.cerrar();
      SesionVista.actualizar(RutasModelo.actual());
      window.location.hash = "#/inicio";
    });

    SesionVista.actualizar(RutasModelo.actual());
  }

  return { iniciar: iniciar };
})();
