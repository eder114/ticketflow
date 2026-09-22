// Controlador: botón del menú en celular
var MenuControlador = (function () {
  "use strict";

  function iniciar() {
    var menu = document.querySelector(".menu-btn");
    if (menu) {
      menu.addEventListener("click", function () {
        MenuVista.alternar(menu);
      });
    }
  }

  return { iniciar: iniciar };
})();
