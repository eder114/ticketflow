// Modelo: como se escriben los precios, las fechas y los estados
//
// La API devuelve numeros y fechas en bruto (120000, "2026-11-14T23:00:00Z").
// Aqui se convierten a lo que ve la gente, en un solo lugar, para que todas
// las pantallas lo escriban igual.
var FormatoModelo = (function () {
  "use strict";

  var MESES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  function pesos(valor) {
    return "$" + Math.round(Number(valor) || 0).toLocaleString("es-CO");
  }

  function numero(valor) {
    return (Number(valor) || 0).toLocaleString("es-CO");
  }

  function hora(fecha) {
    var h = fecha.getHours();
    var m = fecha.getMinutes();
    var tarde = h >= 12;
    var doce = h % 12 === 0 ? 12 : h % 12;
    return doce + ":" + (m < 10 ? "0" + m : m) + " " + (tarde ? "p. m." : "a. m.");
  }

  // 14 de noviembre de 2026 · 6:00 p. m.
  function fechaLarga(cadena) {
    var f = new Date(cadena);
    if (isNaN(f.getTime())) return "";
    return f.getDate() + " de " + MESES[f.getMonth()] + " de " + f.getFullYear() +
           " · " + hora(f);
  }

  // 14 nov 2026
  function fechaCorta(cadena) {
    var f = new Date(cadena);
    if (isNaN(f.getTime())) return "";
    return f.getDate() + " " + MESES[f.getMonth()].slice(0, 3) + " " + f.getFullYear();
  }

  // 2026-11-14, que es lo que entienden los input type=date de los filtros
  function fechaDeFiltro(cadena) {
    var f = new Date(cadena);
    if (isNaN(f.getTime())) return "";
    var mes = f.getMonth() + 1;
    var dia = f.getDate();
    return f.getFullYear() + "-" + (mes < 10 ? "0" + mes : mes) + "-" + (dia < 10 ? "0" + dia : dia);
  }

  // La clase del chip de color de cada estado, para eventos y para reservas.
  var CLASES = {
    "Programado": "estado-programado",
    "En Boleteria": "estado-boleteria",
    "En Vivo": "estado-vivo",
    "Finalizado": "estado-finalizado",
    "Cancelado": "estado-cancelado",
    "Reservada": "estado-programado",
    "Confirmada": "estado-boleteria",
    "Cancelada": "estado-cancelado"
  };

  var TEXTOS = {
    "En Boleteria": "En boletería",
    "En Vivo": "En vivo"
  };

  function claseDeEstado(estado) {
    return CLASES[estado] || "estado-programado";
  }

  function textoDeEstado(estado) {
    return TEXTOS[estado] || estado;
  }

  return {
    pesos: pesos,
    numero: numero,
    fechaLarga: fechaLarga,
    fechaCorta: fechaCorta,
    fechaDeFiltro: fechaDeFiltro,
    claseDeEstado: claseDeEstado,
    textoDeEstado: textoDeEstado
  };
})();
