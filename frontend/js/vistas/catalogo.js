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

  // Cuántas entradas quedan, en barra: la barra llena es "todavía hay de
  // todo" y se va vaciando a medida que el evento se vende. El ancho lo pone
  // después la animación (js/vistas/efectos.js); queda anotado en data-libre
  // para que la barra se vea aunque las animaciones estén apagadas.
  function aforo(evento) {
    var total = Number(evento.capacidad_total) || 0;
    var libres = Math.max(Number(evento.cupos_disponibles) || 0, 0);
    var libre = total > 0 ? Math.min(Math.round((libres / total) * 100), 100) : 0;

    var caja = document.createElement("div");
    caja.className = "aforo";
    caja.dataset.libre = String(libre);
    if (libre <= 0) caja.classList.add("agotada");
    else if (libre <= 20) caja.classList.add("pocas");

    var datos = document.createElement("p");
    datos.className = "aforo-datos";

    var izquierda = document.createElement("span");
    izquierda.appendChild(document.createTextNode("Quedan "));
    var fuerte = document.createElement("strong");
    fuerte.textContent = FormatoModelo.numero(libres);
    izquierda.appendChild(fuerte);
    izquierda.appendChild(document.createTextNode(" de " + FormatoModelo.numero(total)));

    var derecha = document.createElement("span");
    derecha.textContent = libre + "% disponible";

    datos.appendChild(izquierda);
    datos.appendChild(derecha);

    var riel = document.createElement("div");
    riel.className = "aforo-riel";
    riel.setAttribute("role", "img");
    riel.setAttribute("aria-label", "Aforo disponible: " + libre + " por ciento");

    var relleno = document.createElement("span");
    relleno.className = "aforo-relleno";
    relleno.style.width = libre + "%";
    riel.appendChild(relleno);

    caja.appendChild(datos);
    caja.appendChild(riel);
    return caja;
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
    art.dataset.cuposLibres = String(evento.cupos_disponibles);
    art.dataset.busqueda = [evento.nombre, evento.teatro, evento.ciudad, categoria].join(" ");

    // --- la foto, con la categoría encima ---
    var caja = document.createElement("div");
    caja.className = "evento-img";
    if (estado.agotado) caja.classList.add("esta-agotado");

    var img = document.createElement("img");
    // La que subió el organizador manda; si no subió ninguna, queda la de
    // referencia de la categoría.
    img.src = evento.imagen || CatalogoModelo.imagenDe(categoria);
    img.alt = evento.imagen
      ? "Imagen del evento " + evento.nombre
      : "Imagen de referencia de la categoría " + categoria;
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

    // Cuánto falta para que empiece. En los eventos cancelados no se pone,
    // porque ahí la cuenta no significa nada.
    var cuenta = evento.estado === "Cancelado"
      ? null
      : FormatoModelo.faltan(evento.fecha_hora_inicio);

    if (cuenta) {
      var reloj = document.createElement("span");
      reloj.className = "evento-cuenta" + (cuenta.urgencia ? " " + cuenta.urgencia : "");
      reloj.dataset.cuenta = evento.fecha_hora_inicio;
      reloj.textContent = "⏳ " + cuenta.texto;
      caja.appendChild(reloj);
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
    cuerpo.appendChild(aforo(evento));

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

  // La cinta que se desliza debajo del hero de la portada. Va dos veces la
  // misma lista: la segunda copia es la que hace que el giro no se note, y
  // queda oculta para los lectores de pantalla para no repetir lo mismo.
  function pintarCinta(eventos) {
    var pista = document.querySelector("[data-cinta-pista]");
    var cinta = document.querySelector("[data-cinta]");
    if (!pista || !cinta) return;

    pista.textContent = "";
    if (!eventos.length) { cinta.hidden = true; return; }

    function copia(oculta) {
      var grupo = document.createElement("div");
      grupo.className = "cinta-pista-grupo";
      grupo.style.display = "contents";
      if (oculta) grupo.setAttribute("aria-hidden", "true");

      var sello = document.createElement("span");
      sello.className = "cinta-sello";
      sello.textContent = "En cartelera";
      grupo.appendChild(sello);

      eventos.forEach(function (evento) {
        var item = document.createElement("span");
        item.className = "cinta-item";

        var punto = document.createElement("span");
        punto.className = "cinta-punto";
        punto.setAttribute("aria-hidden", "true");

        var nombre = document.createElement("strong");
        nombre.textContent = evento.nombre;

        item.appendChild(punto);
        item.appendChild(nombre);
        item.appendChild(document.createTextNode(
          " · " + evento.ciudad + " · " + FormatoModelo.fechaCorta(evento.fecha_hora_inicio)
        ));
        grupo.appendChild(item);
      });
      return grupo;
    }

    pista.appendChild(copia(false));
    pista.appendChild(copia(true));
    cinta.hidden = false;
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
      img.src = evento.imagen || CatalogoModelo.imagenDe(categoria);
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
    pintarCinta: pintarCinta,
    pintarRecomendados: pintarRecomendados,
    pintarTotal: pintarTotal,
    pintarPaginas: pintarPaginas,
    mensaje: mensaje
  };
})();
