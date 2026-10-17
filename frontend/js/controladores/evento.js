// Controlador: detalle del evento, la reserva y el formulario de registro de
// eventos del organizador.
var EventoControlador = (function () {
  "use strict";

  // Mientras no hay API (la página publicada sola, sin backend) el detalle se
  // queda con el evento de ejemplo del HTML y con este precio.
  var PRECIO_EJEMPLO = 120000;

  var evento = null;

  function precio() {
    return evento ? Number(evento.precio_base) : PRECIO_EJEMPLO;
  }

  function entradas() {
    return document.getElementById("ev-entradas");
  }

  function cantidad() {
    var campo = entradas();
    var valor = parseInt(campo.value, 10);
    if (!valor || valor < 1) valor = 1;

    var maximo = parseInt(campo.max, 10) || 10;
    if (valor > maximo) valor = maximo;

    campo.value = String(valor);
    return valor;
  }

  function recalcular() {
    EventoVista.pintarTotal(precio(), cantidad());
  }

  // ----------------------------------------------------------- reservar --

  var ESTADOS_QUE_RECIBEN = ["Programado", "En Boleteria"];

  function puedeReservarse() {
    if (!evento) return true;
    return ESTADOS_QUE_RECIBEN.indexOf(evento.estado) !== -1 &&
           Number(evento.cupos_disponibles) > 0;
  }

  // El botón cambia según quién esté mirando el evento.
  function pintarAccion() {
    var perfil = SesionModelo.perfil();

    if (perfil === "visitante") {
      EventoVista.pintarAccion(EventoVista.envolver([
        EventoVista.enlace("Reservar", "#/iniciar-sesion"),
        EventoVista.ayuda("Hay que iniciar sesión para reservar.")
      ]));
      return;
    }

    if (perfil !== "cliente") {
      EventoVista.pintarAccion(EventoVista.envolver([
        EventoVista.enlace("Ver mis eventos", "#/panel-agente"),
        EventoVista.ayuda("Las reservas las hacen los clientes.")
      ]));
      return;
    }

    if (!puedeReservarse()) {
      EventoVista.pintarAccion(EventoVista.envolver([
        EventoVista.enlace("Ver otros eventos", "#/catalogo"),
        EventoVista.ayuda("Este evento ya no recibe reservas.")
      ]));
      return;
    }

    EventoVista.pintarAccion(EventoVista.envolver([
      EventoVista.boton("Reservar"),
      EventoVista.ayuda("La reserva queda en estado Reservada hasta que el organizador la confirma.")
    ]));
  }

  function reservar(boton) {
    if (!evento) return;

    boton.disabled = true;
    boton.textContent = "Reservando...";
    EventoVista.mensaje("");

    ApiModelo.crearReserva({
      codigo_evento: evento.codigo_evento,
      numero_entradas: cantidad(),
      observaciones: null
    }).then(function (reserva) {
      EventoVista.mensaje(
        "Reserva número " + reserva.id_reserva + " creada por " +
        reserva.numero_entradas + (reserva.numero_entradas === 1 ? " entrada" : " entradas") +
        ", total " + FormatoModelo.pesos(reserva.valor_total) + "."
      );
      // Los cupos ya cambiaron: se vuelve a leer el evento.
      cargar(String(evento.codigo_evento), { trasReservar: true });
    }).catch(function (error) {
      boton.disabled = false;
      boton.textContent = "Reservar";
      EventoVista.mensaje(error.message, true);
    });
  }

  // ------------------------------------------------------------ cargar --

  function cargar(codigo, opciones) {
    opciones = opciones || {};
    if (!codigo || !ApiModelo.hayApi()) {
      pintarAccion();
      recalcular();
      return;
    }

    if (!opciones.trasReservar) EventoVista.mensaje("");

    ApiModelo.evento(codigo).then(function (datos) {
      evento = datos;
      EventoVista.pintarDetalle(datos);
      EventoVista.limitarEntradas(datos);
      recalcular();

      if (opciones.trasReservar) {
        EventoVista.pintarAccion(EventoVista.envolver([
          EventoVista.enlace("Ver mis reservas", "#/mis-reservas"),
          EventoVista.ayuda("El organizador la confirma y te queda el cupo asegurado.")
        ]));
      } else {
        pintarAccion();
      }
    }).catch(function (error) {
      EventoVista.mensaje(
        error.estado === 404 ? "Este evento ya no está en el catálogo." : error.message,
        true
      );
    });
  }

  function iniciarDetalle() {
    var campo = entradas();
    if (!campo) return;

    campo.addEventListener("input", recalcular);
    campo.addEventListener("change", recalcular);

    document.addEventListener("click", function (e) {
      var boton = e.target.closest("[data-reservar]");
      if (boton) reservar(boton);
    });

    document.addEventListener("ticketflow:pantalla", function (e) {
      if (e.detail.pantalla === "evento") cargar(e.detail.parametro);
    });

    recalcular();
  }

  // ------------------------------- formulario de registro de eventos --

  function valor(form, nombre) {
    var campo = form.elements[nombre];
    return campo ? String(campo.value).trim() : "";
  }

  // Los nombres del formulario no son los de la API, así que aquí se traducen.
  function datosDelFormulario(form) {
    return {
      nombre: valor(form, "nombre"),
      descripcion: valor(form, "descripcion"),
      teatro: valor(form, "teatro"),
      fecha_hora_inicio: valor(form, "inicio"),
      fecha_hora_fin: valor(form, "fin"),
      capacidad_total: Number(valor(form, "capacidad")) || 0,
      precio_base: Number(valor(form, "precio")) || 0,
      observaciones: valor(form, "observaciones") || null,
      id_ciudad: Number(valor(form, "ciudad")) || null
    };
  }

  var EQUIVALENTES = {
    nombre: "nombre",
    descripcion: "descripcion",
    teatro: "teatro",
    fecha_hora_inicio: "inicio",
    fecha_hora_fin: "fin",
    capacidad_total: "capacidad",
    precio_base: "precio",
    id_ciudad: "ciudad",
    identificacion_agente: "nombre"
  };

  function pintarDetalles(form, detalles) {
    var primero = null;
    Object.keys(detalles || {}).forEach(function (llave) {
      var campo = form.elements[EQUIVALENTES[llave] || llave];
      if (!campo) return;
      FormularioVista.mostrarError(campo, detalles[llave]);
      if (!primero) primero = campo;
    });
    if (primero) FormularioVista.enfocar(primero);
    return primero !== null;
  }

  // Se guarda el evento y, si el organizador lo dejó en otro estado, se manda
  // el cambio aparte: el estado se mueve con su propia operación.
  function guardar(form) {
    var datos = datosDelFormulario(form);
    var estado = valor(form, "estado");
    var causa = valor(form, "causa");

    FormularioVista.ocupado(form, true);

    ApiModelo.crearEvento(datos).then(function (creado) {
      if (estado && estado !== creado.estado) {
        return ApiModelo.estadoDeEvento(creado.codigo_evento, estado, causa)
          .then(function (actualizado) { return actualizado; });
      }
      return creado;
    }).then(function (creado) {
      FormularioVista.ocupado(form, false);
      form.reset();
      EventoVista.alternarCausa("Programado");
      FormularioVista.mostrarMensaje(
        form,
        "Quedó registrado el evento " + creado.nombre + " con código " +
        creado.codigo_evento + ".",
        false
      );
    }).catch(function (error) {
      FormularioVista.ocupado(form, false);

      if (error instanceof ApiModelo.SinConexion) {
        // Sin backend el formulario se queda con la validación del navegador.
        FormularioVista.mostrarExito(form);
        return;
      }
      if (!pintarDetalles(form, error.detalles)) {
        FormularioVista.mostrarMensaje(form, error.message);
      }
    });
  }

  function iniciarFormulario() {
    var estado = document.getElementById("nv-estado");
    if (!estado) return;

    estado.addEventListener("change", function () {
      EventoVista.alternarCausa(estado.value);
    });
    EventoVista.alternarCausa(estado.value);

    // La fecha de finalización no puede quedar antes que la de inicio.
    var inicio = document.getElementById("nv-inicio");
    var fin = document.getElementById("nv-fin");
    if (inicio && fin) {
      inicio.addEventListener("change", function () {
        fin.min = inicio.value;
        if (fin.value && fin.value < inicio.value) fin.value = "";
      });
    }

    var form = estado.closest("form");
    form.addEventListener("ticketflow:validado", function () {
      guardar(form);
    });
  }

  function iniciar() {
    iniciarDetalle();
    iniciarFormulario();
  }

  return { iniciar: iniciar };
})();
