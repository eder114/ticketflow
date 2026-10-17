// Controlador: "Mis reservas" del cliente y el panel del organizador.
//
// Las dos pantallas trabajan con la misma lista de reservas; lo que cambia es
// quién puede hacer qué: el cliente solo cancela lo suyo, el agente confirma o
// cancela las reservas de sus eventos.
var ReservaControlador = (function () {
  "use strict";

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
    }).catch(function (error) {
      aviso("[data-mr-mensaje]", error.message, true);
    });
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

    ApiModelo.eventosMios().then(function (eventos) {
      EventoVista.pintarMisEventos(document.querySelector("[data-pa-eventos]"), eventos);
      vacio("[data-pa-sin-eventos]", eventos.length === 0);
    }).catch(function (error) {
      aviso("[data-pa-mensaje]", error.message, true);
    });

    ApiModelo.reservas().then(function (reservas) {
      ReservaVista.pintar(document.querySelector("[data-pa-reservas]"), reservas, {
        mostrarCliente: true,
        acciones: accionesDeAgente
      });
      vacio("[data-pa-sin-reservas]", reservas.length === 0);
    }).catch(function (error) {
      aviso("[data-pa-mensaje]", error.message, true);
    });
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
