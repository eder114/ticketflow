// Modelo: rutas de la aplicación (#/inicio, #/iniciar-sesion, #/evento/5, ...)
var RutasModelo = (function () {
  "use strict";

  var INICIAL = "inicio";

  // #/registro-cliente es una ruta; #eventos es un ancla dentro de la pantalla
  function esRuta() {
    var h = window.location.hash;
    return h === "" || /^#\//.test(h);
  }

  function partes() {
    var h = window.location.hash.replace(/^#\/?/, "").trim();
    return h === "" ? [INICIAL] : h.split("/");
  }

  // La pantalla es la primera parte: de #/evento/5 sale "evento".
  function actual() {
    return partes()[0] || INICIAL;
  }

  // Lo que viene después, cuando la pantalla habla de algo puntual: el código
  // del evento en #/evento/5.
  function parametro() {
    var p = partes()[1];
    return p ? decodeURIComponent(p) : null;
  }

  return {
    INICIAL: INICIAL,
    esRuta: esRuta,
    actual: actual,
    parametro: parametro
  };
})();
