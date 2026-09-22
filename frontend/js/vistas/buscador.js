// Vista: paneles del buscador (listas y calendario)
var BuscadorVista = (function () {
  "use strict";

  var FLECHA_IZQ = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
  var FLECHA_DER = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';

  function abrir(panel, contenedor) {
    if (panel.pop.parentNode !== contenedor) contenedor.appendChild(panel.pop);
    panel.pop.hidden = false;
    panel.chip.classList.add("abierto");
    panel.boton.setAttribute("aria-expanded", "true");
    var foco = panel.pop.querySelector('[aria-pressed="true"]:not(:disabled)') ||
      panel.pop.querySelector(".bq-dia.hoy:not(:disabled)") || panel.pop.querySelector("button:not(:disabled)");
    if (foco) foco.focus();
  }

  function cerrar(panel, devolverFoco) {
    panel.pop.hidden = true;
    panel.chip.classList.remove("abierto");
    panel.boton.setAttribute("aria-expanded", "false");
    if (devolverFoco) panel.boton.focus();
  }

  function fijarValor(chip, valor, texto) {
    chip.querySelector("input[type=hidden]").value = valor;
    chip.querySelector(".bq-valor").textContent = texto || chip.getAttribute("data-vacio");
    chip.classList.toggle("tiene-valor", !!valor);
  }

  function marcarOpcion(pop, elegida) {
    Array.prototype.forEach.call(pop.querySelectorAll(".bq-opcion"), function (o) {
      o.setAttribute("aria-pressed", String(o === elegida));
    });
  }

  function pintarCalendario(pop, mes, datos) {
    var html = '<div class="bq-cal-cab"><span class="bq-cal-mes" aria-live="polite">' + datos.titulo +
      '</span><span class="bq-cal-nav">' +
      '<button type="button" class="bq-circulo" data-mover="-1" aria-label="Mes anterior"' + (datos.esteMes ? " disabled" : "") + '>' +
      FLECHA_IZQ + '</button>' +
      '<button type="button" class="bq-circulo" data-mover="1" aria-label="Mes siguiente">' +
      FLECHA_DER + '</button>' +
      '</span></div><div class="bq-cal-grilla">';

    CalendarioModelo.DSEM.forEach(function (d) {
      html += '<span class="bq-cal-dsem" aria-hidden="true">' + d + "</span>";
    });
    for (var i = 0; i < datos.huecos; i++) html += '<span class="bq-dia fuera"></span>';
    datos.dias.forEach(function (d) {
      html += '<button type="button" class="bq-dia' + (d.hoy ? " hoy" : "") +
        '" data-fecha="' + d.clave + '" aria-pressed="' + d.elegido + '" aria-label="' + d.etiqueta + '"' +
        (d.pasado ? " disabled" : "") + ">" + d.numero + "</button>";
    });

    html += '</div><div class="bq-cal-pie"><button type="button" class="bq-texto-btn" data-accion="borrar">Borrar</button>' +
      '<button type="button" class="bq-texto-btn" data-accion="hoy">Hoy</button></div>';
    pop.innerHTML = html;
    pop.mes = mes;
  }

  function enfocarFlecha(pop, direccion) {
    var otra = pop.querySelector('[data-mover="' + direccion + '"]:not(:disabled)');
    if (otra) otra.focus();
  }

  return {
    abrir: abrir,
    cerrar: cerrar,
    fijarValor: fijarValor,
    marcarOpcion: marcarOpcion,
    pintarCalendario: pintarCalendario,
    enfocarFlecha: enfocarFlecha
  };
})();
