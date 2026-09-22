// Modelo: fechas del calendario del buscador
var CalendarioModelo = (function () {
  "use strict";

  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
               "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  var DSEM = ["DO", "LU", "MA", "MI", "JU", "VI", "SA"];

  // Fecha en formato 2026-09-22
  function iso(f) {
    return f.getFullYear() + "-" + String(f.getMonth() + 1).padStart(2, "0") + "-" + String(f.getDate()).padStart(2, "0");
  }

  // "2026-10-10" -> "10 oct"
  function textoCorto(clave) {
    var p = clave.split("-");
    return parseInt(p[2], 10) + " " + MESES[parseInt(p[1], 10) - 1].slice(0, 3);
  }

  // Datos de un mes para dibujarlo: título, días y cuáles ya pasaron
  function datosMes(mes, elegido) {
    var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    var primero = new Date(mes.getFullYear(), mes.getMonth(), 1);
    var diasMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    var nombre = MESES[mes.getMonth()];
    var dias = [];

    for (var d = 1; d <= diasMes; d++) {
      var f = new Date(mes.getFullYear(), mes.getMonth(), d);
      var clave = iso(f);
      dias.push({
        numero: d,
        clave: clave,
        hoy: f.getTime() === hoy.getTime(),
        elegido: clave === elegido,
        pasado: f < hoy,
        etiqueta: d + " de " + nombre + " de " + mes.getFullYear()
      });
    }

    return {
      titulo: nombre.charAt(0).toUpperCase() + nombre.slice(1) + " de " + mes.getFullYear(),
      esteMes: mes.getFullYear() === hoy.getFullYear() && mes.getMonth() === hoy.getMonth(),
      huecos: primero.getDay(),
      dias: dias
    };
  }

  return {
    DSEM: DSEM,
    iso: iso,
    textoCorto: textoCorto,
    datosMes: datosMes
  };
})();
