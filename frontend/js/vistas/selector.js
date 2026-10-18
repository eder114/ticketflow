// Vista: los desplegables con estilo propio.
//
// El <select> del navegador abre una lista gris que no se puede estilizar y
// se ve distinta en cada sistema. Aquí se le pone encima un botón y un panel
// con las mismas opciones, con los colores de la página. El <select> de
// verdad se queda debajo, escondido para la vista pero vivo: la validación,
// el envío del formulario y los lectores de pantalla siguen usándolo.
var SelectorVista = (function () {
  "use strict";

  function opcionesDe(select) {
    return Array.prototype.map.call(select.options, function (o) {
      return { valor: o.value, texto: o.textContent, deshabilitada: o.disabled };
    });
  }

  function textoElegido(select) {
    var o = select.options[select.selectedIndex];
    return o ? o.textContent : "";
  }

  function panel(select, caja) {
    var lista = document.createElement("div");
    lista.className = "selector-panel";
    lista.id = "panel-" + select.id;
    lista.setAttribute("role", "listbox");
    lista.setAttribute("aria-label", etiquetaDe(select));
    lista.hidden = true;

    opcionesDe(select).forEach(function (opcion, i) {
      var boton = document.createElement("button");
      boton.type = "button";
      boton.className = "selector-opcion";
      boton.dataset.valor = opcion.valor;
      boton.setAttribute("role", "option");
      boton.setAttribute("aria-selected", String(i === select.selectedIndex));
      if (opcion.deshabilitada) boton.disabled = true;

      var punto = document.createElement("span");
      punto.className = "selector-punto";
      punto.setAttribute("aria-hidden", "true");

      var texto = document.createElement("span");
      texto.textContent = opcion.texto;

      boton.appendChild(punto);
      boton.appendChild(texto);
      lista.appendChild(boton);
    });

    caja.appendChild(lista);
    return lista;
  }

  function etiquetaDe(select) {
    var etiqueta = select.id ? document.querySelector('label[for="' + select.id + '"]') : null;
    return etiqueta ? etiqueta.textContent.trim() : (select.name || "Opciones");
  }

  // Convierte un <select> en el desplegable bonito.
  function montar(select) {
    if (select.dataset.montado !== undefined) return;
    select.dataset.montado = "";

    var caja = document.createElement("div");
    caja.className = "selector";
    select.parentNode.insertBefore(caja, select);
    caja.appendChild(select);
    select.classList.add("selector-nativo");

    var boton = document.createElement("button");
    boton.type = "button";
    boton.className = "selector-boton";
    boton.setAttribute("aria-haspopup", "listbox");
    boton.setAttribute("aria-expanded", "false");
    boton.setAttribute("aria-label", etiquetaDe(select) + ": " + textoElegido(select));

    var valor = document.createElement("span");
    valor.className = "selector-valor";
    valor.textContent = textoElegido(select);

    var flecha = document.createElement("span");
    flecha.className = "selector-flecha";
    flecha.setAttribute("aria-hidden", "true");
    flecha.textContent = "⌄";

    boton.appendChild(valor);
    boton.appendChild(flecha);
    caja.insertBefore(boton, select);

    var lista = panel(select, caja);
    boton.setAttribute("aria-controls", lista.id);
  }

  function refrescar(select) {
    var caja = select.closest(".selector");
    if (!caja) return;

    var boton = caja.querySelector(".selector-boton");
    var lista = caja.querySelector(".selector-panel");
    if (!boton || !lista) return;

    boton.querySelector(".selector-valor").textContent = textoElegido(select);
    boton.setAttribute("aria-label", etiquetaDe(select) + ": " + textoElegido(select));

    // Cuando las opciones cambian (las ciudades llegan de la base), se vuelve
    // a armar el panel.
    var mismas = lista.querySelectorAll(".selector-opcion").length === select.options.length;
    if (!mismas) {
      lista.remove();
      var nueva = panel(select, caja);
      boton.setAttribute("aria-controls", nueva.id);
      lista = nueva;
    }

    lista.querySelectorAll(".selector-opcion").forEach(function (o, i) {
      o.setAttribute("aria-selected", String(i === select.selectedIndex));
      o.classList.toggle("elegida", i === select.selectedIndex);
    });

    var vacio = select.value === "";
    caja.classList.toggle("sin-elegir", vacio);
    caja.classList.toggle("con-error", select.getAttribute("aria-invalid") === "true");
  }

  function abrir(caja) {
    cerrarTodos(caja);
    caja.classList.add("abierto");
    caja.querySelector(".selector-panel").hidden = false;
    caja.querySelector(".selector-boton").setAttribute("aria-expanded", "true");

    var elegida = caja.querySelector(".selector-opcion.elegida") ||
                  caja.querySelector(".selector-opcion");
    if (elegida) elegida.focus();
  }

  function cerrar(caja, devolverFoco) {
    if (!caja || !caja.classList.contains("abierto")) return;

    caja.classList.remove("abierto");
    caja.querySelector(".selector-panel").hidden = true;
    var boton = caja.querySelector(".selector-boton");
    boton.setAttribute("aria-expanded", "false");
    if (devolverFoco) boton.focus();
  }

  function cerrarTodos(menos) {
    document.querySelectorAll(".selector.abierto").forEach(function (caja) {
      if (caja !== menos) cerrar(caja, false);
    });
  }

  return {
    montar: montar,
    refrescar: refrescar,
    abrir: abrir,
    cerrar: cerrar,
    cerrarTodos: cerrarTodos
  };
})();
