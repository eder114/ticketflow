// Controlador: buscador del inicio (ciudad, fecha y tipo)
var BuscadorControlador = (function () {
  "use strict";

  var abierto = null;

  function cerrarPanel(devolverFoco) {
    if (!abierto) return;
    BuscadorVista.cerrar(abierto, devolverFoco);
    abierto = null;
  }

  function conectarChip(chip) {
    var boton = chip.querySelector(".bq-abrir");
    var pop = chip.querySelector(".bq-pop");
    var esCalendario = pop.classList.contains("bq-cal");
    var formulario = chip.closest(".buscador");

    boton.addEventListener("click", function (e) {
      e.stopPropagation();
      if (abierto && abierto.chip === chip) { cerrarPanel(false); return; }
      cerrarPanel(false);

      if (esCalendario) {
        var v = chip.querySelector("input[type=hidden]").value;
        var base = v ? new Date(v + "T00:00:00") : new Date();
        var mes = new Date(base.getFullYear(), base.getMonth(), 1);
        BuscadorVista.pintarCalendario(pop, mes, CalendarioModelo.datosMes(mes, v));
      }

      // En celular el panel va debajo del buscador; en escritorio, debajo del chip
      abierto = { chip: chip, pop: pop, boton: boton };
      BuscadorVista.abrir(abierto, window.innerWidth >= 1024 ? chip : formulario);
    });

    pop.addEventListener("click", function (e) {
      e.stopPropagation();
      var b = e.target.closest("button");
      if (!b || b.disabled) return;

      if (b.classList.contains("bq-opcion")) {
        BuscadorVista.marcarOpcion(pop, b);
        BuscadorVista.fijarValor(chip, b.getAttribute("data-valor"), b.getAttribute("data-valor"));
        cerrarPanel(true);
      } else if (b.hasAttribute("data-mover")) {
        var m = pop.mes;
        var nuevo = new Date(m.getFullYear(), m.getMonth() + parseInt(b.getAttribute("data-mover"), 10), 1);
        var elegido = chip.querySelector("input[type=hidden]").value;
        BuscadorVista.pintarCalendario(pop, nuevo, CalendarioModelo.datosMes(nuevo, elegido));
        BuscadorVista.enfocarFlecha(pop, b.getAttribute("data-mover"));
      } else if (b.hasAttribute("data-fecha")) {
        var clave = b.getAttribute("data-fecha");
        BuscadorVista.fijarValor(chip, clave, CalendarioModelo.textoCorto(clave));
        cerrarPanel(true);
      } else if (b.getAttribute("data-accion") === "borrar") {
        BuscadorVista.fijarValor(chip, "", "");
        cerrarPanel(true);
      } else if (b.getAttribute("data-accion") === "hoy") {
        var hoy = CalendarioModelo.iso(new Date());
        BuscadorVista.fijarValor(chip, hoy, CalendarioModelo.textoCorto(hoy));
        cerrarPanel(true);
      }
    });
  }

  function iniciar() {
    Array.prototype.forEach.call(document.querySelectorAll(".bq-chip"), conectarChip);

    document.addEventListener("click", function () { cerrarPanel(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && abierto) cerrarPanel(true);
    });
    window.addEventListener("resize", function () { cerrarPanel(false); });

    var buscador = document.querySelector(".buscador");
    if (buscador) {
      // Todavía no hay base de datos: buscar lleva a los eventos destacados
      buscador.addEventListener("submit", function (e) {
        e.preventDefault();
        PantallaVista.irA("eventos", true);
      });
    }
  }

  return { iniciar: iniciar };
})();
