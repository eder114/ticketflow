// Modelo: rutas de la aplicación (#/inicio, #/iniciar-sesion, ...)
var RutasModelo = (function () {
  "use strict";

  var INICIAL = "inicio";

  // #/registro-cliente es una ruta; #eventos es un ancla dentro de la pantalla
  function esRuta() {
    var h = window.location.hash;
    return h === "" || /^#\//.test(h);
  }

  function actual() {
    var h = window.location.hash.replace(/^#\/?/, "").trim();
    return h === "" ? INICIAL : h;
  }

  return {
    INICIAL: INICIAL,
    esRuta: esRuta,
    actual: actual
  };
})();
