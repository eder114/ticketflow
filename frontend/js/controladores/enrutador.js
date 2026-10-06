// Controlador: cambia de pantalla según la ruta de la URL
var EnrutadorControlador = (function () {
  "use strict";

  // Si la pantalla no le corresponde al perfil, lo devuelve: al inicio de sesión
  // si no ha entrado, o a la portada si entró pero con otro perfil.
  function permitida(pantalla) {
    if (SesionModelo.puedeVer(pantalla)) return null;
    return SesionModelo.iniciada() ? RutasModelo.INICIAL : "iniciar-sesion";
  }

  function ir(pantalla, opciones) {
    var desvio = permitida(pantalla);
    if (desvio) {
      window.location.hash = "#/" + desvio;
      return;
    }
    PantallaVista.mostrar(pantalla, opciones);
    SesionVista.actualizar(pantalla);
  }

  function iniciar() {
    window.addEventListener("hashchange", function () {
      if (!RutasModelo.esRuta()) return;
      ir(RutasModelo.actual());
    });

    if (RutasModelo.esRuta()) {
      ir(RutasModelo.actual(), { sinFoco: true });
    } else {
      // Llegó con un ancla (.../#eventos): inicio sin mover el scroll
      ir(RutasModelo.INICIAL, { conservarScroll: true });
      PantallaVista.irA(window.location.hash.slice(1));
    }
  }

  return { iniciar: iniciar };
})();
