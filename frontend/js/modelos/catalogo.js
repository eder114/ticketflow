// Modelo: reglas del filtro del catálogo
var CatalogoModelo = (function () {
  "use strict";

  // Cada tarjeta trae sus datos en atributos data-, así el modelo no toca el DOM
  // más allá de leerlos.
  function datosDe(tarjeta) {
    return {
      ciudad: tarjeta.dataset.ciudad || "",
      categoria: tarjeta.dataset.categoria || "",
      precio: Number(tarjeta.dataset.precio || 0),
      fecha: tarjeta.dataset.fecha || ""
    };
  }

  function coincide(datos, filtro) {
    if (filtro.ciudad && datos.ciudad !== filtro.ciudad) return false;
    if (filtro.categoria && datos.categoria !== filtro.categoria) return false;
    if (filtro.precio && datos.precio > Number(filtro.precio)) return false;
    if (filtro.desde && datos.fecha && datos.fecha < filtro.desde) return false;
    return true;
  }

  function filtrar(tarjetas, filtro) {
    return Array.prototype.filter.call(tarjetas, function (t) {
      return coincide(datosDe(t), filtro);
    });
  }

  return {
    datosDe: datosDe,
    coincide: coincide,
    filtrar: filtrar
  };
})();
