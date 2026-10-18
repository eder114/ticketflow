// Controlador: abre y cierra el cajón del menú.
var MenuControlador = (function () {
  "use strict";

  function iniciar() {
    document.addEventListener("click", function (e) {
      var abrir = e.target.closest("[data-abrir-cajon]");
      if (abrir) {
        e.preventDefault();
        MenuVista.alternar(abrir);
        return;
      }

      if (e.target.closest("[data-cerrar-cajon]")) {
        MenuVista.cerrar(true);
        return;
      }

      // Al elegir una pantalla del menú, el cajón se cierra solo.
      if (MenuVista.abierto() && e.target.closest("[data-cajon] a")) {
        MenuVista.cerrar(false);
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && MenuVista.abierto()) {
        MenuVista.cerrar(true);
        return;
      }
      MenuVista.atraparFoco(e);
    });
  }

  return { iniciar: iniciar };
})();
