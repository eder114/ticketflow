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
      v.classList.toggle("activa", v === destino);
      v.hidden = v !== destino;
    });

    MenuVista.cerrar();

    if (!opciones.conservarScroll) window.scrollTo({ top: 0, behavior: "auto" });

    document.querySelectorAll(".nav a").forEach(function (a) {
      var suya = (a.getAttribute("href") || "").replace(/^#\/?/, "");
      a.classList.toggle("activo", suya === nombre);
    });

    var t = destino.dataset.titulo;
    document.title = t ? t + " · TicketFlow" : "TicketFlow · Entradas para los mejores eventos de Colombia";

    var h1 = destino.querySelector("h1");
    if (h1 && !opciones.conservarScroll) {
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
