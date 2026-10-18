// Vista: el cajón lateral del menú.
//
// En vez de apretar todos los enlaces en la barra de arriba, el menú se
// despliega por el lado derecho: ahí va el perfil de quien entró, sus
// pantallas y el botón de cerrar sesión. Es el mismo cajón en celular y en
// escritorio.
var MenuVista = (function () {
  "use strict";

  var ultimoBoton = null;

  function cajon() {
    return document.querySelector("[data-cajon]");
  }

  function abierto() {
    var caja = cajon();
    return !!caja && !caja.hidden;
  }

  function abrir(boton) {
    var caja = cajon();
    if (!caja) return;

    ultimoBoton = boton || null;
    caja.hidden = false;

    // El fondo no se mueve mientras el cajón está abierto.
    document.body.classList.add("con-cajon");

    // Se deja un respiro para que la animación arranque antes de mover el foco.
    window.requestAnimationFrame(function () {
      caja.classList.add("abierto");
      var panel = caja.querySelector(".cajon-panel");
      if (panel) panel.focus();
    });

    document.querySelectorAll("[data-abrir-cajon]").forEach(function (b) {
      b.setAttribute("aria-expanded", "true");
    });
  }

  function cerrar(devolverFoco) {
    var caja = cajon();
    if (!caja || caja.hidden) return;

    caja.classList.remove("abierto");
    document.body.classList.remove("con-cajon");

    document.querySelectorAll("[data-abrir-cajon]").forEach(function (b) {
      b.setAttribute("aria-expanded", "false");
    });

    // Se esconde cuando termina de deslizarse, para que no quede atrapando clics.
    window.setTimeout(function () {
      if (!caja.classList.contains("abierto")) caja.hidden = true;
    }, 200);

    if (devolverFoco && ultimoBoton) ultimoBoton.focus();
    ultimoBoton = null;
  }

  function alternar(boton) {
    if (abierto()) cerrar(true);
    else abrir(boton);
  }

  // El tabulador se queda dentro del cajón mientras está abierto.
  function atraparFoco(evento) {
    var caja = cajon();
    if (!abierto() || evento.key !== "Tab" || !caja) return;

    var enfocables = caja.querySelectorAll("a[href], button:not([disabled])");
    if (!enfocables.length) return;

    var primero = enfocables[0];
    var ultimo = enfocables[enfocables.length - 1];

    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primero.focus();
    }
  }

  return {
    abrir: abrir,
    cerrar: cerrar,
    alternar: alternar,
    abierto: abierto,
    atraparFoco: atraparFoco
  };
})();
