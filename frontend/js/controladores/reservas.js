// Controlador: "Mis reservas" del cliente y el panel del organizador.
//
// Las dos pantallas trabajan con la misma lista de reservas; lo que cambia es
// quién puede hacer qué: el cliente solo cancela lo suyo, el agente confirma o
// cancela las reservas de sus eventos.
var ReservaControlador = (function () {
  "use strict";

  // Los colores de las gráficas salen de la misma paleta del diseño.
  var COLORES = {
    confirmada: "#15803D",
    reservada: "#635BFF",
    cancelada: "#B91C1C"
  };

  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
               "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  function activa(reserva) {
    return reserva.estado !== "Cancelada";
  }

  function sumar(reservas, campo) {
    return reservas.reduce(function (total, r) { return total + Number(r[campo] || 0); }, 0);
  }

  function cuantas(reservas, estado) {
    return reservas.filter(function (r) { return r.estado === estado; }).length;
  }

  // Las reservas agrupadas por mes, de la más vieja a la más nueva, para la
  // gráfica de barras.
  function porMes(reservas, cuantosMeses) {
    var grupos = {};
    reservas.forEach(function (r) {
      var fecha = new Date(r.fecha_hora);
      if (isNaN(fecha.getTime())) return;

      var llave = fecha.getFullYear() + "-" + fecha.getMonth();
      if (!grupos[llave]) {
        grupos[llave] = {
          orden: fecha.getFullYear() * 12 + fecha.getMonth(),
          etiqueta: MESES[fecha.getMonth()].slice(0, 3),
          confirmadas: 0,
          reservadas: 0
        };
      }
      if (r.estado === "Confirmada") grupos[llave].confirmadas += Number(r.numero_entradas);
      if (r.estado === "Reservada") grupos[llave].reservadas += Number(r.numero_entradas);
    });

    return Object.keys(grupos)
      .map(function (llave) { return grupos[llave]; })
      .sort(function (a, b) { return a.orden - b.orden; })
      .slice(-cuantosMeses);
  }

  // "Hace 5 minutos", "ayer", "hace 3 días": para la lista de actividad.
  function hace(cadena) {
    var fecha = new Date(cadena);
    if (isNaN(fecha.getTime())) return "";

    var minutos = Math.round((Date.now() - fecha.getTime()) / 60000);
    if (minutos < 1) return "hace un momento";
    if (minutos < 60) return "hace " + minutos + (minutos === 1 ? " minuto" : " minutos");

    var horas = Math.round(minutos / 60);
    if (horas < 24) return "hace " + horas + (horas === 1 ? " hora" : " horas");

    var dias = Math.round(horas / 24);
    if (dias === 1) return "ayer";
    if (dias < 30) return "hace " + dias + " días";
    return FormatoModelo.fechaCorta(cadena);
  }

  function aviso(selector, texto, esError) {
    var caja = document.querySelector(selector);
    if (!caja) return;

    if (!texto) {
      caja.hidden = true;
      caja.textContent = "";
      return;
    }
    caja.hidden = false;
    caja.className = esError ? "aviso aviso-error" : "aviso";
    caja.textContent = texto;
  }

  function vacio(selector, mostrar) {
    var caja = document.querySelector(selector);
    if (caja) caja.hidden = !mostrar;
  }

  // ------------------------------------------- mis reservas (cliente) --

  function accionesDeCliente(reserva) {
    if (reserva.estado === "Cancelada") return [];
    return [{ texto: "Cancelar la reserva", estado: "Cancelada", pideCausa: true }];
  }

  function cargarMias() {
    if (!ApiModelo.hayApi()) {
      aviso("[data-mr-mensaje]", "No hay conexión con el servidor.", true);
      return;
    }

    ApiModelo.reservas().then(function (reservas) {
      ReservaVista.pintar(document.querySelector("[data-mr-lista]"), reservas, {
        acciones: accionesDeCliente
      });
      vacio("[data-mr-vacio]", reservas.length === 0);
      pintarResumenDeCliente(reservas);
    }).catch(function (error) {
      aviso("[data-mr-mensaje]", error.message, true);
    });
  }

  // Las cuatro cifras de arriba y la tarjeta del próximo evento.
  function pintarResumenDeCliente(reservas) {
    var vivas = reservas.filter(activa);
    var ahora = Date.now();
    var proximas = vivas.filter(function (r) {
      return new Date(r.fecha_evento).getTime() >= ahora;
    }).sort(function (a, b) {
      return new Date(a.fecha_evento) - new Date(b.fecha_evento);
    });

    TableroVista.pintarCifras("[data-mr-cifras]", [
      { icono: "📅", titulo: "Próximos eventos", valor: FormatoModelo.numero(proximas.length) },
      { icono: "🎟", titulo: "Entradas reservadas", valor: FormatoModelo.numero(sumar(vivas, "numero_entradas")) },
      { icono: "✔", titulo: "Reservas confirmadas", valor: FormatoModelo.numero(cuantas(reservas, "Confirmada")) },
      { icono: "$", titulo: "Total en reservas activas",
        valor: FormatoModelo.pesos(sumar(vivas, "valor_total")), destacada: true }
    ]);

    TableroVista.pintarProximo("[data-mr-proximo]", proximas[0] || null);
  }

  // ----------------------------------------------- panel del organizador --

  function accionesDeAgente(reserva) {
    if (reserva.estado === "Cancelada") return [];
    if (reserva.estado === "Confirmada") {
      return [{ texto: "Cancelar", estado: "Cancelada", pideCausa: true }];
    }
    return [
      { texto: "Confirmar", estado: "Confirmada", clase: "btn-primario" },
      { texto: "Cancelar", estado: "Cancelada", pideCausa: true }
    ];
  }

  function cargarPanel() {
    if (!ApiModelo.hayApi()) {
      aviso("[data-pa-mensaje]", "No hay conexión con el servidor.", true);
      return;
    }

    Promise.all([ApiModelo.eventosMios(), ApiModelo.reservas()])
      .then(function (respuestas) {
        var eventos = respuestas[0];
        var reservas = respuestas[1];

        EventoVista.pintarMisEventos(document.querySelector("[data-pa-eventos]"), eventos);
        vacio("[data-pa-sin-eventos]", eventos.length === 0);

        ReservaVista.pintar(document.querySelector("[data-pa-reservas]"), reservas, {
          mostrarCliente: true,
          acciones: accionesDeAgente
        });
        vacio("[data-pa-sin-reservas]", reservas.length === 0);

        pintarResumenDeAgente(eventos, reservas);
      }).catch(function (error) {
        aviso("[data-pa-mensaje]", error.message, true);
      });
  }

  function pintarResumenDeAgente(eventos, reservas) {
    var confirmadas = reservas.filter(function (r) { return r.estado === "Confirmada"; });
    var enCartelera = eventos.filter(CatalogoModelo.enCartelera);

    TableroVista.pintarCifras("[data-pa-cifras]", [
      { icono: "🎟", titulo: "Entradas vendidas",
        valor: FormatoModelo.numero(sumar(confirmadas, "numero_entradas")) },
      { icono: "$", titulo: "Ingresos confirmados",
        valor: FormatoModelo.pesos(sumar(confirmadas, "valor_total")), destacada: true },
      { icono: "🪑", titulo: "Cupos disponibles",
        valor: FormatoModelo.numero(sumar(enCartelera, "cupos_disponibles")),
        nota: enCartelera.length + (enCartelera.length === 1 ? " evento en cartelera" : " eventos en cartelera") },
      { icono: "⏳", titulo: "Reservas por responder",
        valor: FormatoModelo.numero(cuantas(reservas, "Reservada")) }
    ]);

    // Barras: entradas confirmadas y reservadas de los últimos seis meses.
    var meses = porMes(reservas, 6);
    if (meses.length) {
      GraficaVista.pintar(
        "[data-pa-barras]",
        GraficaVista.barras(
          meses.map(function (m) {
            return { etiqueta: m.etiqueta, valores: [m.confirmadas, m.reservadas] };
          }),
          [{ nombre: "Confirmadas", color: COLORES.confirmada },
           { nombre: "Reservadas", color: COLORES.reservada }],
          "Entradas por mes: " + meses.map(function (m) {
            return m.etiqueta + ", " + m.confirmadas + " confirmadas y " + m.reservadas + " reservadas";
          }).join("; ")
        ),
        [{ nombre: "Confirmadas", color: COLORES.confirmada,
           texto: FormatoModelo.numero(sumar(confirmadas, "numero_entradas")) },
         { nombre: "Reservadas", color: COLORES.reservada,
           texto: FormatoModelo.numero(sumar(reservas.filter(function (r) {
             return r.estado === "Reservada";
           }), "numero_entradas")) }]
      );
    } else {
      GraficaVista.vacia("[data-pa-barras]", "Todavía no hay reservas para graficar.");
    }

    // Dona: cómo están repartidas las reservas.
    var reparto = [
      { nombre: "Confirmadas", valor: cuantas(reservas, "Confirmada"), color: COLORES.confirmada },
      { nombre: "Reservadas", valor: cuantas(reservas, "Reservada"), color: COLORES.reservada },
      { nombre: "Canceladas", valor: cuantas(reservas, "Cancelada"), color: COLORES.cancelada }
    ];

    if (reservas.length) {
      var porcentaje = Math.round((cuantas(reservas, "Confirmada") / reservas.length) * 100);
      GraficaVista.pintar(
        "[data-pa-dona]",
        GraficaVista.dona(reparto, porcentaje + "%", "CONFIRMADAS",
          "Reparto de las reservas: " + reparto.map(function (r) {
            return r.valor + " " + r.nombre.toLowerCase();
          }).join(", ")),
        reparto.map(function (r) {
          return { nombre: r.nombre, color: r.color, texto: FormatoModelo.numero(r.valor) };
        })
      );
    } else {
      GraficaVista.vacia("[data-pa-dona]", "Todavía no hay reservas.");
    }

    pintarActividad("[data-pa-actividad]", reservas, true);
  }

  // Los últimos movimientos: las reservas más recientes, con su estado.
  function pintarActividad(selector, reservas, conCliente) {
    var ultimas = reservas.slice().sort(function (a, b) {
      return new Date(b.fecha_hora) - new Date(a.fecha_hora);
    }).slice(0, 6);

    TableroVista.pintarActividad(selector, ultimas.map(function (r) {
      var clase = r.estado === "Confirmada" ? "es-confirmada"
                : r.estado === "Cancelada" ? "es-cancelada" : "";
      return {
        clase: clase,
        titulo: "Reserva " + r.estado.toLowerCase() + " · " +
                FormatoModelo.pesos(r.valor_total),
        detalle: (conCliente ? r.cliente + " · " : "") + r.evento + " · " +
                 r.numero_entradas + (Number(r.numero_entradas) === 1 ? " entrada" : " entradas"),
        cuando: hace(r.fecha_hora)
      };
    }));
  }

  // En qué pantalla estamos, para saber dónde poner los mensajes y qué recargar.
  function pantalla() {
    return RutasModelo.actual() === "panel-agente" ? "panel" : "mias";
  }

  function recargar() {
    if (pantalla() === "panel") cargarPanel();
    else cargarMias();
  }

  function mensajeDe(texto, esError) {
    aviso(pantalla() === "panel" ? "[data-pa-mensaje]" : "[data-mr-mensaje]", texto, esError);
  }

  // ---------------------------------------------- cambios de estado --

  function cambiar(id, estado, causa) {
    mensajeDe("");

    ApiModelo.estadoDeReserva(id, estado, causa).then(function (reserva) {
      mensajeDe("La reserva " + reserva.id_reserva + " quedó en estado " + reserva.estado + ".");
      recargar();
    }).catch(function (error) {
      mensajeDe(error.message, true);
    });
  }

  function conectarBotones() {
    document.addEventListener("click", function (e) {
      var boton = e.target.closest("[data-estado][data-reserva-id]");
      if (boton) {
        if (boton.dataset.pideCausa !== undefined) {
          ReservaVista.mostrarCausa(boton, true);
        } else {
          cambiar(Number(boton.dataset.reservaId), boton.dataset.estado, null);
        }
        return;
      }

      var volver = e.target.closest("[data-cerrar-causa]");
      if (volver) ReservaVista.mostrarCausa(volver, false);
    });

    // El formulario de la causa: cancelar siempre pide decir por qué.
    document.addEventListener("submit", function (e) {
      var form = e.target.closest("[data-causa-de]");
      if (!form) return;

      e.preventDefault();
      var campo = form.querySelector("textarea");
      var error = form.querySelector(".error");

      if (campo.value.trim() === "") {
        campo.setAttribute("aria-invalid", "true");
        error.textContent = "Hay que decir por qué se cancela la reserva.";
        campo.focus();
        return;
      }
      campo.removeAttribute("aria-invalid");
      error.textContent = "";

      cambiar(Number(form.dataset.causaDe), "Cancelada", campo.value.trim());
    });
  }

  function cambiarEstadoDeEvento(codigo, estado, causa) {
    aviso("[data-pa-mensaje]", "");

    ApiModelo.estadoDeEvento(codigo, estado, causa).then(function (evento) {
      aviso("[data-pa-mensaje]", "El evento " + evento.nombre + " quedó en estado " +
                                 FormatoModelo.textoDeEstado(evento.estado) + ".");
      cargarPanel();
    }).catch(function (error) {
      aviso("[data-pa-mensaje]", error.message, true);
      cargarPanel();
    });
  }

  // Los selectores de estado de la tabla de eventos del organizador. Si el
  // estado elegido es Cancelado, primero se abre la fila que pide la causa.
  function conectarEstadosDeEvento() {
    document.addEventListener("change", function (e) {
      var select = e.target.closest("[data-estado-de]");
      if (!select) return;

      var codigo = Number(select.dataset.estadoDe);
      if (select.value === "Cancelado") {
        EventoVista.mostrarCausaDeEvento(codigo, true);
        return;
      }
      EventoVista.mostrarCausaDeEvento(codigo, false);
      cambiarEstadoDeEvento(codigo, select.value, null);
    });

    document.addEventListener("click", function (e) {
      var volver = e.target.closest("[data-cerrar-causa-evento]");
      if (!volver) return;

      var codigo = volver.dataset.cerrarCausaEvento;
      EventoVista.mostrarCausaDeEvento(codigo, false);

      // El desplegable vuelve al estado que tenía el evento.
      var select = document.querySelector('[data-estado-de="' + codigo + '"]');
      if (select) select.value = select.dataset.estadoAnterior;
    });

    // Borrar un evento. La base no deja borrar uno que todavia tiene
    // reservas, y ahi la API responde que esta relacionado con otros.
    document.addEventListener("click", function (e) {
      var boton = e.target.closest("[data-borrar-evento]");
      if (!boton) return;

      if (!window.confirm("¿Eliminar el evento " + boton.dataset.nombre + "?")) return;

      aviso("[data-pa-mensaje]", "");
      ApiModelo.eliminarEvento(boton.dataset.borrarEvento).then(function () {
        aviso("[data-pa-mensaje]", "Se eliminó el evento " + boton.dataset.nombre + ".");
        cargarPanel();
      }).catch(function (error) {
        aviso("[data-pa-mensaje]", error.message, true);
      });
    });

    document.addEventListener("submit", function (e) {
      var form = e.target.closest("[data-causa-evento]");
      if (!form) return;

      e.preventDefault();
      var campo = form.querySelector("textarea");
      var error = form.querySelector(".error");

      if (campo.value.trim() === "") {
        campo.setAttribute("aria-invalid", "true");
        error.textContent = "Hay que decir por qué se cancela el evento.";
        campo.focus();
        return;
      }
      campo.removeAttribute("aria-invalid");
      error.textContent = "";

      cambiarEstadoDeEvento(Number(form.dataset.causaEvento), "Cancelado", campo.value.trim());
    });
  }

  function iniciar() {
    if (!document.querySelector("[data-mr-lista]")) return;

    conectarBotones();
    conectarEstadosDeEvento();

    // Al entrar a la pantalla se limpia el aviso de la vez pasada y se vuelven
    // a pedir los datos.
    document.addEventListener("ticketflow:pantalla", function (e) {
      if (e.detail.pantalla === "mis-reservas") {
        aviso("[data-mr-mensaje]", "");
        cargarMias();
      }
      if (e.detail.pantalla === "panel-agente") {
        aviso("[data-pa-mensaje]", "");
        cargarPanel();
      }
    });
  }

  return { iniciar: iniciar };
})();
