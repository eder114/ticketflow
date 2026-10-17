// Vista: muestra y esconde las tarjetas del catálogo
var CatalogoVista = (function () {
  "use strict";

  function lista() {
    return document.querySelector("[data-lista-eventos]");
  }

  function tarjetas() {
    var caja = lista();
    return caja ? caja.querySelectorAll(".evento") : [];
  }

  function mostrar(visibles) {
    var todas = tarjetas();
    Array.prototype.forEach.call(todas, function (t) {
      t.hidden = visibles.indexOf(t) === -1;
    });

    var vacio = document.querySelector("[data-sin-resultados]");
    if (vacio) vacio.hidden = visibles.length > 0;

    var conteo = document.querySelector("[data-conteo]");
    if (conteo) {
      conteo.textContent =
        visibles.length === 1
          ? "1 evento disponible"
          : visibles.length + " eventos disponibles";
    }
  }

  // Una tarjeta armada con lo que devuelve la API. Se construye con
  // createElement y textContent: nada de pegar HTML con los datos de la base,
  // que es por donde se cuelan los scripts.
  function tarjeta(evento) {
    var categoria = CatalogoModelo.categoriaDe(evento);

    var art = document.createElement("article");
    art.className = "evento";
    art.dataset.ciudad = evento.ciudad;
    art.dataset.categoria = categoria;
    art.dataset.precio = String(evento.precio_base);
    art.dataset.fecha = FormatoModelo.fechaDeFiltro(evento.fecha_hora_inicio);
    art.dataset.busqueda = [evento.nombre, evento.teatro, evento.ciudad, categoria].join(" ");

    var caja = document.createElement("div");
    caja.className = "evento-img";
    var img = document.createElement("img");
    img.src = CatalogoModelo.imagenDe(categoria);
    img.alt = "Imagen de referencia de la categoría " + categoria;
    img.loading = "lazy";
    var etiqueta = document.createElement("span");
    etiqueta.className = "evento-cat";
    etiqueta.textContent = categoria;
    caja.appendChild(img);
    caja.appendChild(etiqueta);

    var cuerpo = document.createElement("div");
    cuerpo.className = "evento-cuerpo";

    var chip = document.createElement("span");
    chip.className = "estado-chip " + FormatoModelo.claseDeEstado(evento.estado);
    chip.textContent = FormatoModelo.textoDeEstado(evento.estado);

    var titulo = document.createElement("h3");
    titulo.textContent = evento.nombre;

    var meta = document.createElement("div");
    meta.className = "evento-meta";
    var donde = document.createElement("span");
    donde.textContent = evento.teatro + " · " + evento.ciudad;
    var cuando = document.createElement("span");
    cuando.textContent = FormatoModelo.fechaLarga(evento.fecha_hora_inicio);
    var cupos = document.createElement("span");
    cupos.textContent = Number(evento.cupos_disponibles) > 0
      ? FormatoModelo.numero(evento.cupos_disponibles) + " cupos disponibles"
      : "Sin cupos disponibles";
    meta.appendChild(donde);
    meta.appendChild(cuando);
    meta.appendChild(cupos);

    var pie = document.createElement("div");
    pie.className = "evento-pie";
    var precio = document.createElement("div");
    precio.className = "precio";
    precio.textContent = FormatoModelo.pesos(evento.precio_base);
    var small = document.createElement("small");
    small.textContent = "COP · DESDE";
    precio.appendChild(small);
    var boton = document.createElement("a");
    boton.href = "#/evento/" + evento.codigo_evento;
    boton.className = "btn btn-primario";
    boton.textContent = "Ver evento";
    pie.appendChild(precio);
    pie.appendChild(boton);

    cuerpo.appendChild(chip);
    cuerpo.appendChild(titulo);
    cuerpo.appendChild(meta);
    cuerpo.appendChild(pie);

    art.appendChild(caja);
    art.appendChild(cuerpo);
    return art;
  }

  // Reemplaza las tarjetas de ejemplo del HTML por las de la base de datos.
  function pintar(eventos) {
    var caja = lista();
    if (!caja) return;

    caja.textContent = "";
    eventos.forEach(function (evento) {
      caja.appendChild(tarjeta(evento));
    });
  }

  // Las ciudades del filtro salen de los eventos que hay, no de una lista fija.
  function pintarCiudades(eventos) {
    var select = document.getElementById("f-ciudad");
    if (!select) return;

    var ciudades = [];
    eventos.forEach(function (e) {
      if (ciudades.indexOf(e.ciudad) === -1) ciudades.push(e.ciudad);
    });
    ciudades.sort();

    var elegida = select.value;
    select.textContent = "";
    var todas = document.createElement("option");
    todas.value = "";
    todas.textContent = "Todas las ciudades";
    select.appendChild(todas);

    ciudades.forEach(function (ciudad) {
      var opcion = document.createElement("option");
      opcion.value = ciudad;
      opcion.textContent = ciudad;
      select.appendChild(opcion);
    });
    select.value = elegida;
  }

  // La portada muestra los tres primeros, sin filtros ni conteo.
  function pintarDestacados(eventos) {
    var caja = document.querySelector("[data-destacados]");
    if (!caja) return;

    caja.textContent = "";
    eventos.forEach(function (evento) {
      caja.appendChild(tarjeta(evento));
    });
  }

  function mensaje(texto) {
    var vacio = document.querySelector("[data-sin-resultados]");
    if (vacio) vacio.textContent = texto;
  }

  return {
    tarjetas: tarjetas,
    mostrar: mostrar,
    pintar: pintar,
    pintarCiudades: pintarCiudades,
    pintarDestacados: pintarDestacados,
    mensaje: mensaje
  };
})();
