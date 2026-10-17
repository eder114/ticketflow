// Vista: las tarjetas de reservas, tanto las del cliente como las que ve el
// agente en su panel. Las dos pantallas pintan lo mismo; lo único que cambia
// son los botones que se le ponen a cada reserva.
var ReservaVista = (function () {
  "use strict";

  function dato(lista, titulo, valor) {
    var caja = document.createElement("div");
    var dt = document.createElement("dt");
    dt.textContent = titulo;
    var dd = document.createElement("dd");
    dd.textContent = valor;
    caja.appendChild(dt);
    caja.appendChild(dd);
    lista.appendChild(caja);
  }

  // El formulario de la causa aparece solo cuando se va a cancelar, porque es
  // ahí donde la causa es obligatoria.
  function formularioDeCausa(reserva) {
    var form = document.createElement("form");
    form.className = "form-causa";
    form.dataset.causaDe = String(reserva.id_reserva);
    form.hidden = true;

    var id = "causa-" + reserva.id_reserva;
    var etiqueta = document.createElement("label");
    etiqueta.setAttribute("for", id);
    etiqueta.textContent = "¿Por qué se cancela?";

    var campo = document.createElement("textarea");
    campo.id = id;
    campo.name = "causa";
    campo.rows = 2;
    campo.required = true;
    campo.maxLength = 500;
    campo.placeholder = "Por ejemplo: ya no puedo asistir.";

    var error = document.createElement("p");
    error.className = "error";
    error.setAttribute("role", "alert");

    var acciones = document.createElement("div");
    acciones.className = "form-causa-pie";
    var confirmar = document.createElement("button");
    confirmar.type = "submit";
    confirmar.className = "btn btn-primario";
    confirmar.textContent = "Cancelar la reserva";
    var volver = document.createElement("button");
    volver.type = "button";
    volver.className = "btn btn-secundario";
    volver.dataset.cerrarCausa = "";
    volver.textContent = "Dejarla como está";
    acciones.appendChild(confirmar);
    acciones.appendChild(volver);

    form.appendChild(etiqueta);
    form.appendChild(campo);
    form.appendChild(error);
    form.appendChild(acciones);
    return form;
  }

  function tarjeta(reserva, opciones) {
    var art = document.createElement("article");
    art.className = "reserva";
    art.dataset.reserva = String(reserva.id_reserva);

    var cabecera = document.createElement("div");
    cabecera.className = "reserva-cabecera";
    var titulo = document.createElement("h3");
    titulo.textContent = reserva.evento;
    var chip = document.createElement("span");
    chip.className = "estado-chip " + FormatoModelo.claseDeEstado(reserva.estado);
    chip.textContent = reserva.estado;
    cabecera.appendChild(titulo);
    cabecera.appendChild(chip);

    var datos = document.createElement("dl");
    datos.className = "reserva-datos";
    dato(datos, "Cuándo es", FormatoModelo.fechaLarga(reserva.fecha_evento));
    dato(datos, "Dónde", reserva.teatro + " · " + reserva.ciudad);
    dato(datos, "Entradas", FormatoModelo.numero(reserva.numero_entradas));
    dato(datos, "Total", FormatoModelo.pesos(reserva.valor_total));
    dato(datos, "Reservada el", FormatoModelo.fechaLarga(reserva.fecha_hora));
    if (opciones.mostrarCliente) dato(datos, "Cliente", reserva.cliente);
    if (reserva.observaciones) dato(datos, "Observaciones", reserva.observaciones);
    if (reserva.causa_cancelacion) dato(datos, "Causa de la cancelación", reserva.causa_cancelacion);

    art.appendChild(cabecera);
    art.appendChild(datos);

    var botones = opciones.acciones ? opciones.acciones(reserva) : [];
    if (botones.length) {
      var caja = document.createElement("div");
      caja.className = "reserva-acciones";
      botones.forEach(function (accion) {
        var boton = document.createElement("button");
        boton.type = "button";
        boton.className = "btn " + (accion.clase || "btn-secundario");
        boton.textContent = accion.texto;
        boton.dataset.reservaId = String(reserva.id_reserva);
        boton.dataset.estado = accion.estado;
        if (accion.pideCausa) boton.dataset.pideCausa = "";
        caja.appendChild(boton);
      });
      art.appendChild(caja);

      if (botones.some(function (a) { return a.pideCausa; })) {
        art.appendChild(formularioDeCausa(reserva));
      }
    }

    return art;
  }

  function pintar(contenedor, reservas, opciones) {
    if (!contenedor) return;
    opciones = opciones || {};

    contenedor.textContent = "";
    reservas.forEach(function (reserva) {
      contenedor.appendChild(tarjeta(reserva, opciones));
    });
  }

  function mostrarCausa(boton, abierta) {
    var art = boton.closest(".reserva");
    if (!art) return;
    var form = art.querySelector(".form-causa");
    if (!form) return;

    form.hidden = !abierta;
    art.querySelector(".reserva-acciones").hidden = abierta;
    if (abierta) form.querySelector("textarea").focus();
  }

  return {
    pintar: pintar,
    mostrarCausa: mostrarCausa
  };
})();
