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

  // Los desplegables del catálogo traen las ciudades como están en la base
  // (Bogota, sin tilde) y el buscador las muestra con tilde, así que se busca
  // la opción que diga lo mismo en vez de asignar el texto tal cual.
  function pasar(filtros, nombre, valor) {
    var campo = filtros.elements[nombre];
    if (!campo) return;

    if (!valor) { campo.value = ""; return; }

    if (campo.tagName === "SELECT") {
      var buscado = CatalogoModelo.llano(valor);
      var opcion = Array.prototype.filter.call(campo.options, function (o) {
        return CatalogoModelo.llano(o.value || o.textContent) === buscado;
      })[0];
      campo.value = opcion ? opcion.value : "";
      return;
    }
    campo.value = valor;
  }

  // Lo que se eligió arriba se copia en los filtros del catálogo, que son los
  // que de verdad esconden y muestran las tarjetas.
  function llevarAlCatalogo(buscador) {
    var filtros = document.querySelector("[data-filtros]");
    if (!filtros) {
      PantallaVista.irA("eventos", true);
      return;
    }

    pasar(filtros, "texto", buscador.elements.evento.value);
    pasar(filtros, "ciudad", buscador.elements.ciudad.value);
    pasar(filtros, "desde", buscador.elements.fecha.value);
    pasar(filtros, "categoria",
          CatalogoModelo.categoriaDelBuscador(buscador.elements.tipo.value));

    window.location.hash = "#/catalogo";
    filtros.dispatchEvent(new Event("change", { bubbles: true }));
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
      // Buscar lleva al catálogo con los filtros ya puestos.
      buscador.addEventListener("submit", function (e) {
        e.preventDefault();
        llevarAlCatalogo(buscador);
      });
    }
  }

  return { iniciar: iniciar };
})();
