// Controlador: los desplegables con estilo propio.
//
// Mantiene el <select> de verdad y el panel bonito diciendo lo mismo, y deja
// que todo se maneje con el teclado: flechas para moverse, Enter para elegir
// y Escape para cerrar.
var SelectorControlador = (function () {
  "use strict";

  function selects() {
    return document.querySelectorAll("select:not([data-sin-estilo])");
  }

  function montarTodos() {
    selects().forEach(SelectorVista.montar);
    selects().forEach(SelectorVista.refrescar);
  }

  function elegir(select, valor) {
    select.value = valor;
    SelectorVista.refrescar(select);
    // El resto de la aplicación escucha el change del select de siempre.
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function mover(caja, desde, pasos) {
    var opciones = Array.prototype.filter.call(
      caja.querySelectorAll(".selector-opcion"),
      function (o) { return !o.disabled; }
    );
    if (!opciones.length) return;

    var actual = opciones.indexOf(desde);
    var siguiente = actual + pasos;
    if (siguiente < 0) siguiente = 0;
    if (siguiente > opciones.length - 1) siguiente = opciones.length - 1;
    opciones[siguiente].focus();
  }

  function conectar() {
    document.addEventListener("click", function (e) {
      var boton = e.target.closest(".selector-boton");
      if (boton) {
        var caja = boton.closest(".selector");
        if (caja.classList.contains("abierto")) SelectorVista.cerrar(caja, true);
        else SelectorVista.abrir(caja);
        return;
      }

      var opcion = e.target.closest(".selector-opcion");
      if (opcion) {
        var suCaja = opcion.closest(".selector");
        elegir(suCaja.querySelector("select"), opcion.dataset.valor);
        SelectorVista.cerrar(suCaja, true);
        return;
      }

      // Un clic por fuera cierra el que esté abierto.
      if (!e.target.closest(".selector")) SelectorVista.cerrarTodos(null);
    });

    document.addEventListener("keydown", function (e) {
      var caja = e.target.closest(".selector");
      if (!caja) return;

      var enOpcion = e.target.classList.contains("selector-opcion");

      if (e.key === "Escape") {
        SelectorVista.cerrar(caja, true);
        return;
      }
      if (!caja.classList.contains("abierto")) {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          if (e.target.classList.contains("selector-boton")) {
            e.preventDefault();
            SelectorVista.abrir(caja);
          }
        }
        return;
      }
      if (!enOpcion) return;

      if (e.key === "ArrowDown") { e.preventDefault(); mover(caja, e.target, 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); mover(caja, e.target, -1); }
      else if (e.key === "Home") { e.preventDefault(); mover(caja, e.target, -999); }
      else if (e.key === "End") { e.preventDefault(); mover(caja, e.target, 999); }
      else if (e.key === "Tab") { SelectorVista.cerrar(caja, false); }
    });

    // Si el valor del select cambia desde el código (por ejemplo, el buscador
    // del inicio llenando los filtros), el botón se pone al día.
    document.addEventListener("change", function (e) {
      if (e.target.tagName === "SELECT") SelectorVista.refrescar(e.target);
    });
  }

  function iniciar() {
    montarTodos();
    conectar();

    // Las listas que se llenan después (ciudades, departamentos) se revisan
    // cada vez que se cambia de pantalla.
    document.addEventListener("ticketflow:pantalla", function () {
      window.setTimeout(montarTodos, 0);
    });
  }

  return { iniciar: iniciar, montarTodos: montarTodos };
})();
