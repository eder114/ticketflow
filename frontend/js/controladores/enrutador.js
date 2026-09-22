// Controlador: cambia de pantalla según la ruta de la URL
var EnrutadorControlador = (function () {
  "use strict";

  function iniciar() {
    window.addEventListener("hashchange", function () {
      if (!RutasModelo.esRuta()) return;
      PantallaVista.mostrar(RutasModelo.actual());
    });

    if (RutasModelo.esRuta()) {
      PantallaVista.mostrar(RutasModelo.actual());
    } else {
      // Llegó con un ancla (.../#eventos): inicio sin mover el scroll
      PantallaVista.mostrar(RutasModelo.INICIAL, { conservarScroll: true });
      PantallaVista.irA(window.location.hash.slice(1));
    }
  }

  return { iniciar: iniciar };
})();
