// Vista: las piezas del panel del organizador que vienen del diseño.
//
// La tarjeta del evento que viene, el aviso de aforo, las barras de ocupación
// y la tabla de reservas con su paginación.
var VentasVista = (function () {
  "use strict";

  // El código que ve la gente es el mismo de la pantalla de confirmación.
  function codigoDe(reserva) {
    var anio = new Date(reserva.fecha_hora).getFullYear() || 2026;
    return "TF-" + anio + "-" + String(reserva.id_reserva).padStart(4, "0");
  }

  function iniciales(nombre) {
    return String(nombre).split(/\s+/).filter(Boolean).slice(0, 2).map(function (p) {
      return p.charAt(0).toUpperCase();
    }).join("");
  }

  // ----------------------------------------------------- evento actual --

  function pintarEventoActual(evento) {
    var caja = document.querySelector("[data-pa-actual]");
    if (!caja) return;

    caja.textContent = "";

    if (!evento) {
      var vacio = document.createElement("p");
      vacio.className = "grafica-vacia";
      vacio.textContent = "No tienes eventos en cartelera. Registra uno para empezar a vender.";
      caja.appendChild(vacio);
      return;
    }

    var categoria = CatalogoModelo.categoriaDe(evento);

    var tarjeta = document.createElement("div");
    tarjeta.className = "evento-actual";

    var foto = document.createElement("div");
    foto.className = "evento-actual-foto";
    var img = document.createElement("img");
    img.src = CatalogoModelo.imagenDe(categoria);
    img.alt = "Imagen de referencia de la categoría " + categoria;
    var chip = document.createElement("span");
    chip.className = "estado-chip " + FormatoModelo.claseDeEstado(evento.estado);
    chip.textContent = FormatoModelo.textoDeEstado(evento.estado);
    foto.appendChild(img);
    foto.appendChild(chip);

    var cuerpo = document.createElement("div");
    cuerpo.className = "evento-actual-cuerpo";

    var nombre = document.createElement("h3");
    nombre.textContent = evento.nombre;

    var linea = document.createElement("p");
    linea.className = "evento-actual-linea";
    linea.textContent = FormatoModelo.fechaLarga(evento.fecha_hora_inicio) + " · " +
                        evento.teatro + ", " + evento.ciudad;

    var cupos = document.createElement("p");
    cupos.className = "evento-actual-cupos";
    cupos.textContent = FormatoModelo.numero(evento.cupos_disponibles) + " cupos libres de " +
                        FormatoModelo.numero(evento.capacidad_total);

    var acciones = document.createElement("div");
    acciones.className = "evento-actual-acciones";
    var ver = document.createElement("a");
    ver.href = "#/evento/" + evento.codigo_evento;
    ver.className = "btn btn-secundario btn-chico";
    ver.textContent = "Ver el evento";
    var editar = document.createElement("a");
    editar.href = "#/crear-evento/" + evento.codigo_evento;
    editar.className = "btn btn-chico btn-secundario";
    editar.textContent = "Editar";
    acciones.appendChild(ver);
    acciones.appendChild(editar);

    cuerpo.appendChild(nombre);
    cuerpo.appendChild(linea);
    cuerpo.appendChild(cupos);
    cuerpo.appendChild(acciones);

    tarjeta.appendChild(foto);
    tarjeta.appendChild(cuerpo);
    caja.appendChild(tarjeta);
  }

  // ------------------------------------------------------ aviso de aforo --

  function pintarAviso(eventos) {
    var caja = document.querySelector("[data-pa-inventario]");
    var seccion = document.querySelector("[data-pa-caja-aviso]");
    if (!caja || !seccion) return;

    // Los que ya van por encima del 85 % del aforo.
    var apretados = eventos.filter(function (e) {
      var total = Number(e.capacidad_total);
      return CatalogoModelo.enCartelera(e) && total > 0 &&
             (total - Number(e.cupos_disponibles)) / total >= 0.85;
    });

    seccion.hidden = apretados.length === 0;
    if (!apretados.length) return;

    caja.textContent = "";
    var lista = document.createElement("ul");
    lista.className = "lista-aviso";

    apretados.forEach(function (evento) {
      var total = Number(evento.capacidad_total);
      var vendido = Math.round(((total - Number(evento.cupos_disponibles)) / total) * 100);

      var li = document.createElement("li");
      var nombre = document.createElement("strong");
      nombre.textContent = evento.nombre;
      var texto = document.createElement("span");
      texto.textContent = " va en el " + vendido + " % del aforo: quedan " +
                          FormatoModelo.numero(evento.cupos_disponibles) + " cupos.";
      li.appendChild(nombre);
      li.appendChild(texto);
      lista.appendChild(li);
    });

    caja.appendChild(lista);
  }

  // --------------------------------------------------- ocupación por evento --

  function pintarOcupacion(eventos) {
    var caja = document.querySelector("[data-pa-ocupacion]");
    if (!caja) return;

    var enCartelera = eventos.filter(CatalogoModelo.enCartelera);
    caja.textContent = "";

    if (!enCartelera.length) {
      var vacio = document.createElement("p");
      vacio.className = "grafica-vacia";
      vacio.textContent = "No tienes eventos en cartelera.";
      caja.appendChild(vacio);
      return;
    }

    var lista = document.createElement("ul");
    lista.className = "barras-ocupacion";

    enCartelera.slice(0, 6).forEach(function (evento) {
      var total = Number(evento.capacidad_total) || 1;
      var apartadas = total - Number(evento.cupos_disponibles);
      var crudo = Math.max(0, Math.min(100, (apartadas / total) * 100));
      // Con aforos grandes el porcentaje redondeado siempre daría 0, así que
      // por debajo del 10 % se muestra con un decimal.
      var parte = crudo >= 10 ? Math.round(crudo) : Math.round(crudo * 10) / 10;

      var li = document.createElement("li");

      var fila = document.createElement("div");
      fila.className = "barra-fila";
      var nombre = document.createElement("span");
      nombre.className = "barra-nombre";
      nombre.textContent = evento.nombre;
      var cifra = document.createElement("span");
      cifra.className = "barra-cifra";
      cifra.textContent = FormatoModelo.numero(apartadas) + " de " +
                          FormatoModelo.numero(total) + " · " + parte + " %";
      fila.appendChild(nombre);
      fila.appendChild(cifra);

      var riel = document.createElement("div");
      riel.className = "barra-riel";
      riel.setAttribute("role", "img");
      riel.setAttribute("aria-label", evento.nombre + ": " + parte + " por ciento del aforo apartado, " +
                        FormatoModelo.numero(apartadas) + " de " + FormatoModelo.numero(total) + " entradas");
      var lleno = document.createElement("span");
      lleno.className = "barra-lleno";
      // Una pizca de ancho para que se note que ya hay algo apartado.
      lleno.style.width = apartadas > 0 ? Math.max(crudo, 1.5) + "%" : "0";
      riel.appendChild(lleno);

      li.appendChild(fila);
      li.appendChild(riel);
      lista.appendChild(li);
    });

    caja.appendChild(lista);
  }

  // ------------------------------------------------- tabla de reservas --

  function celda(fila, texto, clase) {
    var td = document.createElement("td");
    td.textContent = texto;
    if (clase) td.className = clase;
    fila.appendChild(td);
    return td;
  }

  function filaDeReserva(reserva, acciones) {
    var fila = document.createElement("tr");
    fila.dataset.reserva = String(reserva.id_reserva);

    var th = document.createElement("th");
    th.scope = "row";
    th.className = "celda-codigo";
    th.textContent = codigoDe(reserva);
    fila.appendChild(th);

    var comprador = document.createElement("td");
    var caja = document.createElement("span");
    caja.className = "comprador";
    var avatar = document.createElement("span");
    avatar.className = "comprador-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = iniciales(reserva.cliente);
    var nombre = document.createElement("span");
    nombre.textContent = reserva.cliente;
    caja.appendChild(avatar);
    caja.appendChild(nombre);
    comprador.appendChild(caja);
    fila.appendChild(comprador);

    celda(fila, reserva.evento);
    celda(fila, FormatoModelo.numero(reserva.numero_entradas));
    celda(fila, FormatoModelo.fechaCorta(reserva.fecha_hora));
    celda(fila, FormatoModelo.pesos(reserva.valor_total));

    var estado = document.createElement("td");
    var chip = document.createElement("span");
    chip.className = "estado-chip " + FormatoModelo.claseDeEstado(reserva.estado);
    chip.textContent = reserva.estado;
    estado.appendChild(chip);
    fila.appendChild(estado);

    var caja2 = document.createElement("td");
    caja2.className = "celda-acciones";
    (acciones || []).forEach(function (accion) {
      var boton = document.createElement("button");
      boton.type = "button";
      boton.className = "btn btn-chico " + (accion.clase || "btn-secundario");
      boton.textContent = accion.texto;
      boton.dataset.reservaId = String(reserva.id_reserva);
      boton.dataset.estado = accion.estado;
      if (accion.pideCausa) boton.dataset.pideCausa = "";
      caja2.appendChild(boton);
    });
    fila.appendChild(caja2);

    return fila;
  }

  // La fila que se abre debajo para escribir la causa de la cancelación.
  function filaDeCausa(reserva) {
    var fila = document.createElement("tr");
    fila.className = "fila-causa";
    fila.dataset.causaFila = String(reserva.id_reserva);
    fila.hidden = true;

    var celdaAncha = document.createElement("td");
    celdaAncha.colSpan = 8;

    var form = document.createElement("form");
    form.className = "form-causa";
    form.dataset.causaDe = String(reserva.id_reserva);

    var id = "causa-" + reserva.id_reserva;
    var etiqueta = document.createElement("label");
    etiqueta.setAttribute("for", id);
    etiqueta.textContent = "¿Por qué se cancela la reserva de " + reserva.cliente + "?";

    var campo = document.createElement("textarea");
    campo.id = id;
    campo.rows = 2;
    campo.maxLength = 500;
    campo.placeholder = "La causa queda guardada y sale en el reporte.";

    var error = document.createElement("p");
    error.className = "error";
    error.setAttribute("role", "alert");

    var pie = document.createElement("div");
    pie.className = "form-causa-pie";
    var confirmar = document.createElement("button");
    confirmar.type = "submit";
    confirmar.className = "btn btn-chico btn-primario";
    confirmar.textContent = "Cancelar la reserva";
    var volver = document.createElement("button");
    volver.type = "button";
    volver.className = "btn btn-chico btn-secundario";
    volver.dataset.cerrarCausa = "";
    volver.textContent = "Dejarla como está";
    pie.appendChild(confirmar);
    pie.appendChild(volver);

    form.appendChild(etiqueta);
    form.appendChild(campo);
    form.appendChild(error);
    form.appendChild(pie);
    celdaAncha.appendChild(form);
    fila.appendChild(celdaAncha);
    return fila;
  }

  function pintarTabla(reservas, acciones) {
    var cuerpo = document.querySelector("[data-pa-reservas]");
    if (!cuerpo) return;

    cuerpo.textContent = "";
    reservas.forEach(function (reserva) {
      var lista = acciones ? acciones(reserva) : [];
      cuerpo.appendChild(filaDeReserva(reserva, lista));

      if (lista.some(function (a) { return a.pideCausa; })) {
        cuerpo.appendChild(filaDeCausa(reserva));
      }
    });
  }

  function mostrarCausa(boton, abierta) {
    var fila = boton.closest("tr");
    if (!fila) return;

    var id = fila.dataset.reserva || boton.dataset.reservaId;
    var caja = document.querySelector('[data-causa-fila="' + id + '"]');
    if (!caja) return;

    caja.hidden = !abierta;
    if (abierta) caja.querySelector("textarea").focus();
  }

  function pintarConteo(mostradas, total) {
    var caja = document.querySelector("[data-pa-conteo]");
    if (caja) {
      caja.textContent = total === 0
        ? "No hay reservas que coincidan."
        : "Mostrando " + mostradas + " de " + total +
          (total === 1 ? " reserva" : " reservas");
    }
  }

  function pintarPaginas(pagina, paginas) {
    var caja = document.querySelector("[data-pa-paginas]");
    if (!caja) return;

    caja.hidden = paginas <= 1;
    document.querySelector("[data-pa-pagina]").textContent = "Página " + pagina + " de " + paginas;
    document.querySelector("[data-pa-anterior]").disabled = pagina <= 1;
    document.querySelector("[data-pa-siguiente]").disabled = pagina >= paginas;
  }

  return {
    codigoDe: codigoDe,
    pintarEventoActual: pintarEventoActual,
    pintarAviso: pintarAviso,
    pintarOcupacion: pintarOcupacion,
    pintarTabla: pintarTabla,
    mostrarCausa: mostrarCausa,
    pintarConteo: pintarConteo,
    pintarPaginas: pintarPaginas
  };
})();
