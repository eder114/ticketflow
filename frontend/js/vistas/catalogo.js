// Vista: el catálogo de eventos.
//
// Pinta las tarjetas con lo que devuelve la API: la foto con su categoría, el
// precio, cuándo y dónde es, y cómo está de entradas. Todo se arma con
// createElement y textContent: nada de pegar HTML con datos de la base, que
// es por donde se cuelan los scripts.
var CatalogoVista = (function () {
  "use strict";

  function lista() {
    return document.querySelector("[data-lista-eventos]");
  }

  function tarjetas() {
    var caja = lista();
    return caja ? caja.querySelectorAll(".evento") : [];
  }

  // Cómo se ve en la tarjeta lo que dice el modelo sobre las entradas.
  var DISPONIBILIDAD = {
    agotado: { clase: "sin-cupos", icono: "⊘", texto: "Sin disponibilidad", agotado: true },
    ultimas: { clase: "pocos-cupos", icono: "⚠", texto: "Últimas entradas", agotado: false },
    disponible: { clase: "con-cupos", icono: "✓", texto: "Entradas disponibles", agotado: false }
  };

  function disponibilidad(evento) {
    return DISPONIBILIDAD[CatalogoModelo.disponibilidadDe(evento)];
  }

  function conIcono(texto, icono) {
    var linea = document.createElement("span");
    var marca = document.createElement("span");
    marca.setAttribute("aria-hidden", "true");
    marca.textContent = icono;
    linea.appendChild(marca);
    linea.appendChild(document.createTextNode(" " + texto));
    return linea;
  }

  function tarjeta(evento) {
    var categoria = CatalogoModelo.categoriaDe(evento);
    var estado = disponibilidad(evento);

    var art = document.createElement("article");
    art.className = "evento";
    art.dataset.ciudad = evento.ciudad;
    art.dataset.categoria = categoria;
    art.dataset.precio = String(evento.precio_base);
    art.dataset.fecha = FormatoModelo.fechaDeFiltro(evento.fecha_hora_inicio);
    art.dataset.cupos = String(evento.cupos_disponibles);
    art.dataset.busqueda = [evento.nombre, evento.teatro, evento.ciudad, categoria].join(" ");

    // --- la foto, con la categoría encima ---
    var caja = document.createElement("div");
    caja.className = "evento-img";
    if (estado.agotado) caja.classList.add("esta-agotado");

    var img = document.createElement("img");
    img.src = CatalogoModelo.imagenDe(categoria);
    img.alt = "Imagen de referencia de la categoría " + categoria;
    img.loading = "lazy";

    var etiqueta = document.createElement("span");
    etiqueta.className = "evento-cat";
    etiqueta.textContent = categoria;

    caja.appendChild(img);
    caja.appendChild(etiqueta);

    if (estado.agotado) {
      var cinta = document.createElement("span");
      cinta.className = "cinta-agotado";
      cinta.textContent = "AGOTADO";
      caja.appendChild(cinta);
    }

    // --- el cuerpo ---
    var cuerpo = document.createElement("div");
    cuerpo.className = "evento-cuerpo";

    var fila = document.createElement("div");
    fila.className = "evento-titulo";

    var titulo = document.createElement("h3");
    var enlace = document.createElement("a");
    enlace.href = "#/evento/" + evento.codigo_evento;
    enlace.textContent = evento.nombre;
    titulo.appendChild(enlace);

    var precio = document.createElement("span");
    precio.className = "chip-precio";
    precio.textContent = FormatoModelo.pesos(evento.precio_base);

    fila.appendChild(titulo);
    fila.appendChild(precio);

    var meta = document.createElement("div");
    meta.className = "evento-meta";
    meta.appendChild(conIcono(FormatoModelo.fechaLarga(evento.fecha_hora_inicio), "📅"));
    meta.appendChild(conIcono(evento.teatro + " · " + evento.ciudad, "📍"));

    var pie = document.createElement("div");
    pie.className = "evento-pie " + estado.clase;
    pie.appendChild(conIcono(estado.texto, estado.icono));

    cuerpo.appendChild(fila);
    cuerpo.appendChild(meta);
    cuerpo.appendChild(pie);

    art.appendChild(caja);
    art.appendChild(cuerpo);
    return art;
  }

  function pintar(eventos) {
    var caja = lista();
    if (!caja) return;

    caja.textContent = "";
    eventos.forEach(function (evento) {
      caja.appendChild(tarjeta(evento));
    });
  }

  function mostrar(visibles) {
    var vacio = document.querySelector("[data-sin-resultados]");
    if (vacio) vacio.hidden = visibles.length > 0;

    var conteo = document.querySelector("[data-conteo]");
    if (conteo) {
      conteo.textContent =
        visibles.length === 1
          ? "1 evento encontrado"
          : visibles.length + " eventos encontrados";
    }
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
    todas.textContent = "Toda Colombia";
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

  // Las tres tarjetas anchas del final del catálogo.
  function pintarRecomendados(eventos) {
    var caja = document.querySelector("[data-cat-recomendados]");
    if (!caja) return;

    caja.textContent = "";

    eventos.forEach(function (evento) {
      var categoria = CatalogoModelo.categoriaDe(evento);

      var art = document.createElement("article");
      art.className = "recomendado";

      var enlace = document.createElement("a");
      enlace.href = "#/evento/" + evento.codigo_evento;
      enlace.className = "recomendado-enlace";

      var img = document.createElement("img");
      img.src = CatalogoModelo.imagenDe(categoria);
      img.alt = "";
      img.loading = "lazy";

      var cuerpo = document.createElement("span");
      cuerpo.className = "recomendado-cuerpo";

      var chip = document.createElement("span");
      chip.className = "evento-cat";
      chip.textContent = categoria;

      var nombre = document.createElement("span");
      nombre.className = "recomendado-nombre";
      nombre.textContent = evento.nombre;

      var datos = document.createElement("span");
      datos.className = "recomendado-datos";
      datos.textContent = FormatoModelo.fechaCorta(evento.fecha_hora_inicio) +
                          " · desde " + FormatoModelo.pesos(evento.precio_base);

      cuerpo.appendChild(chip);
      cuerpo.appendChild(nombre);
      cuerpo.appendChild(datos);

      enlace.appendChild(img);
      enlace.appendChild(cuerpo);
      art.appendChild(enlace);
      caja.appendChild(art);
    });
  }

  function pintarTotal(cuantos) {
    var caja = document.querySelector("[data-cat-total]");
    if (!caja) return;

    caja.textContent = cuantos === 1
      ? "1 evento disponible en TicketFlow"
      : cuantos + " eventos disponibles en TicketFlow";
  }

  function pintarPaginas(pagina, paginas) {
    var caja = document.querySelector("[data-cat-paginas]");
    if (!caja) return;

    caja.hidden = paginas <= 1;
    document.querySelector("[data-cat-pagina]").textContent = "Página " + pagina + " de " + paginas;
    document.querySelector("[data-cat-anterior]").disabled = pagina <= 1;
    document.querySelector("[data-cat-siguiente]").disabled = pagina >= paginas;
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
    pintarRecomendados: pintarRecomendados,
    pintarTotal: pintarTotal,
    pintarPaginas: pintarPaginas,
    mensaje: mensaje
  };
})();
