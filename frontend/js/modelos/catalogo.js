// Modelo: las reglas del catálogo.
//
// Aquí vive lo que decide qué evento pasa los filtros, en qué orden van y de
// qué categoría es cada uno. No toca la página: recibe los eventos como los
// devuelve la API y responde con la lista ya lista para pintar.
var CatalogoModelo = (function () {
  "use strict";

  // Las ciudades del buscador vienen con tilde (Bogotá) y las de la base sin
  // ella (Bogota), así que se comparan sin tildes y sin distinguir mayúsculas.
  function llano(texto) {
    return String(texto)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();
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

  // Cómo está el evento de entradas.
  function disponibilidadDe(evento) {
    var libres = Number(evento.cupos_disponibles);
    var total = Number(evento.capacidad_total) || 1;

    if (libres <= 0) return "agotado";
    if (libres / total <= 0.1) return "ultimas";
    return "disponible";
  }

  function coincide(evento, filtro) {
    var categoria = categoriaDe(evento);

    if (filtro.ciudad && llano(evento.ciudad) !== llano(filtro.ciudad)) return false;
    if (filtro.categoria && llano(categoria) !== llano(filtro.categoria)) return false;
    if (filtro.precio && Number(evento.precio_base) > Number(filtro.precio)) return false;
    if (filtro.desde && FormatoModelo.fechaDeFiltro(evento.fecha_hora_inicio) < filtro.desde) return false;
    if (filtro.disponibilidad === "con-cupos" && disponibilidadDe(evento) === "agotado") return false;

    if (filtro.texto) {
      var donde = [evento.nombre, evento.teatro, evento.ciudad, categoria].join(" ");
      if (llano(donde).indexOf(llano(filtro.texto)) === -1) return false;
    }
    return true;
  }

  function filtrar(eventos, filtro) {
    return eventos.filter(function (evento) {
      return coincide(evento, filtro || {});
    });
  }

  function ordenar(eventos, como) {
    return eventos.slice().sort(function (a, b) {
      if (como === "precio") return Number(a.precio_base) - Number(b.precio_base);
      if (como === "nombre") return a.nombre.localeCompare(b.nombre, "es");
      if (como === "cupos") return Number(b.cupos_disponibles) - Number(a.cupos_disponibles);
      return new Date(a.fecha_hora_inicio) - new Date(b.fecha_hora_inicio);
    });
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
    llano: llano,
    categoriaDe: categoriaDe,
    categoriaDelBuscador: categoriaDelBuscador,
    imagenDe: imagenDe,
    enCartelera: enCartelera,
    disponibilidadDe: disponibilidadDe,
    coincide: coincide,
    filtrar: filtrar,
    ordenar: ordenar
  };
})();
