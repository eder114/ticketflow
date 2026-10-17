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
      fecha: tarjeta.dataset.fecha || "",
      busqueda: tarjeta.dataset.busqueda || tarjeta.textContent
    };
  }

  // Las ciudades del buscador vienen con tilde (Bogotá) y las de la base sin
  // ella (Bogota), así que se comparan sin tildes y sin distinguir mayúsculas.
  function llano(texto) {
    return String(texto)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function coincide(datos, filtro) {
    if (filtro.ciudad && llano(datos.ciudad) !== llano(filtro.ciudad)) return false;
    if (filtro.categoria && llano(datos.categoria) !== llano(filtro.categoria)) return false;
    if (filtro.precio && datos.precio > Number(filtro.precio)) return false;
    if (filtro.desde && datos.fecha && datos.fecha < filtro.desde) return false;
    if (filtro.texto && llano(datos.busqueda).indexOf(llano(filtro.texto)) === -1) return false;
    return true;
  }

  function filtrar(tarjetas, filtro) {
    return Array.prototype.filter.call(tarjetas, function (t) {
      return coincide(datosDe(t), filtro);
    });
  }

  // La base de datos no guarda la categoría del evento: el enunciado no la
  // pide. Para el filtro y para la foto de la tarjeta se deduce del nombre y
  // de la descripción, y lo que no encaje en ninguna queda como Concierto.
  var CATEGORIAS = [
    { nombre: "Festival", palabras: /festival|carnaval|fest\b|expo/i, imagen: "festival-noche.jpg" },
    { nombre: "Teatro",   palabras: /teatro|obra|comedia|monologo|sinf|hay festival/i, imagen: "teatro-sala.jpg" },
    { nombre: "Deporte",  palabras: /clasico|partido|torneo|futbol|voleibol|liga/i, imagen: "futbol-seleccion.jpg" },
    { nombre: "Concierto", palabras: /./, imagen: "concierto-artista.jpg" }
  ];

  function categoriaDe(evento) {
    var texto = (evento.nombre || "") + " " + (evento.descripcion || "") + " " + (evento.teatro || "");
    for (var i = 0; i < CATEGORIAS.length; i++) {
      if (CATEGORIAS[i].palabras.test(texto)) return CATEGORIAS[i].nombre;
    }
    return "Concierto";
  }

  function imagenDe(categoria) {
    for (var i = 0; i < CATEGORIAS.length; i++) {
      if (CATEGORIAS[i].nombre === categoria) return "assets/img/" + CATEGORIAS[i].imagen;
    }
    return "assets/img/evento-ambiente.jpg";
  }

  // Los eventos que ya pasaron o que se cancelaron no se muestran en el
  // catálogo: nadie puede reservar ahí.
  function enCartelera(evento) {
    return evento.estado === "Programado" || evento.estado === "En Boleteria" ||
           evento.estado === "En Vivo";
  }

  // El buscador del inicio habla en plural (Conciertos) y las tarjetas en
  // singular (Concierto).
  var EQUIVALENTES = {
    "conciertos": "Concierto",
    "deportes": "Deporte",
    "festivales": "Festival",
    "teatro": "Teatro"
  };

  function categoriaDelBuscador(valor) {
    return EQUIVALENTES[llano(valor)] || valor;
  }

  return {
    datosDe: datosDe,
    coincide: coincide,
    llano: llano,
    categoriaDelBuscador: categoriaDelBuscador,
    filtrar: filtrar,
    categoriaDe: categoriaDe,
    imagenDe: imagenDe,
    enCartelera: enCartelera
  };
})();
