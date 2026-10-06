// Vista: muestra una pantalla y esconde las demás
var PantallaVista = (function () {
  "use strict";

  function mostrar(nombre, opciones) {
    opciones = opciones || {};
    var destino = document.getElementById("vista-" + nombre);

    if (!destino) {
      destino = document.getElementById("vista-" + RutasModelo.INICIAL);
      nombre = RutasModelo.INICIAL;
    }

    Array.prototype.forEach.call(document.querySelectorAll(".vista"), function (v) {
      var activa = v === destino;
      v.classList.toggle("activa", activa);
      v.hidden = !activa;

      // Solo puede haber un <main> visible a la vez: el de la pantalla activa.
      var cuerpo = v.querySelector("main");
      if (cuerpo) cuerpo.hidden = !activa;
    });

    MenuVista.cerrar();

    if (!opciones.conservarScroll) window.scrollTo({ top: 0, behavior: "auto" });

    document.querySelectorAll(".nav a").forEach(function (a) {
      var suya = (a.getAttribute("href") || "").replace(/^#\/?/, "");
      var activo = suya === nombre;
      a.classList.toggle("activo", activo);
      // el lector de pantalla anuncia cuál es la pantalla actual
      if (activo) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    var t = destino.dataset.titulo;
    document.title = t ? t + " · TicketFlow" : "TicketFlow · Entradas para los mejores eventos de Colombia";

    // El foco se mueve al título solo cuando se cambia de pantalla. Al cargar
    // se deja quieto, para que el primer Tab llegue a "Saltar al contenido".
    var h1 = destino.querySelector("h1");
    if (h1 && !opciones.conservarScroll && !opciones.sinFoco) {
      h1.setAttribute("tabindex", "-1");
      h1.focus({ preventScroll: true });
    }
  }

  function irA(id, suave) {
    var destino = document.getElementById(id);
    if (destino) destino.scrollIntoView(suave ? { behavior: "smooth" } : undefined);
  }

  return {
    mostrar: mostrar,
    irA: irA
  };
})();
