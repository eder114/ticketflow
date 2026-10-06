// Controlador: cerrar sesión y mantener el encabezado al día
var SesionControlador = (function () {
  "use strict";

  function iniciar() {
    document.addEventListener("click", function (e) {
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
