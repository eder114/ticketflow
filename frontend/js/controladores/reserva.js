// Controlador: la pantalla de reservar entradas y la de la reserva hecha.
//
// Son los dos últimos pasos del diseño: el cliente revisa sus datos y cuántas
// entradas quiere, confirma, y queda la pantalla con el código de la reserva.
var ReservaPantallaControlador = (function () {
  "use strict";

  var evento = null;
  var hecha = null;

  // El código que ve la gente: TF-2026-0007 sale de la fecha y del número de
  // la reserva, que es lo que de verdad guarda la base.
  function codigoDe(reserva) {
    var anio = new Date(reserva.fecha_hora).getFullYear() || new Date().getFullYear();
    return "TF-" + anio + "-" + String(reserva.id_reserva).padStart(4, "0");
  }

  function mensaje(texto) {
    var caja = document.querySelector("[data-rv-mensaje]");
    if (!caja) return;

    caja.hidden = !texto;
    caja.textContent = texto || "";
  }

  function entradas() {
    return document.getElementById("rv-entradas");
  }

  function tope() {
    if (!evento) return 10;
    return Math.max(Math.min(10, Number(evento.cupos_disponibles) || 0), 1);
  }

  function cantidad() {
    var campo = entradas();
    var valor = parseInt(campo.value, 10);
    if (!valor || valor < 1) valor = 1;
    if (valor > tope()) valor = tope();
    campo.value = String(valor);
    return valor;
  }

  function pintarCuentas() {
    if (!evento) return;

    var cuantas = cantidad();
    var precio = Number(evento.precio_base);

    document.querySelector("[data-rv-cantidad]").textContent = FormatoModelo.numero(cuantas);
    document.querySelector("[data-rv-unitario]").textContent = FormatoModelo.pesos(precio);
    document.querySelector("[data-rv-total]").textContent = FormatoModelo.pesos(precio * cuantas);
    document.querySelector("[data-rv-precio]").textContent =
      FormatoModelo.pesos(precio) + " por entrada";

    // Los botones se apagan en los extremos: si no, uno los aprieta y no pasa
    // nada, que es la peor respuesta que puede dar un botón.
    var menos = document.querySelector("[data-rv-menos]");
    var mas = document.querySelector("[data-rv-mas]");
    if (menos) menos.disabled = cuantas <= 1;
    if (mas) mas.disabled = cuantas >= tope();
  }

  function dato(caja, titulo, valor) {
    var grupo = document.createElement("div");
    grupo.className = "campo";

    var etiqueta = document.createElement("span");
    etiqueta.className = "dato-etiqueta";
    etiqueta.textContent = titulo;

    var texto = document.createElement("span");
    texto.className = "dato-valor";
    texto.textContent = valor;

    grupo.appendChild(etiqueta);
    grupo.appendChild(texto);
    caja.appendChild(grupo);
  }

  function pintarDatosDelCliente() {
    var caja = document.querySelector("[data-rv-datos]");
    var usuario = SesionModelo.usuario();
    if (!caja || !usuario) return;

    caja.textContent = "";
    dato(caja, "Nombre", usuario.nombre);
    dato(caja, "Correo", usuario.correo);
    dato(caja, "Identificación", usuario.identificacion);
    dato(caja, "Perfil", TableroVista.perfilEnLetras(usuario.perfil));
  }

  function tarjetaDeEvento(caja, evento) {
    caja.textContent = "";

    var categoria = CatalogoModelo.categoriaDe(evento);
    var tarjeta = document.createElement("div");
    tarjeta.className = "resumen-tarjeta";

    var foto = document.createElement("img");
    foto.src = evento.imagen || CatalogoModelo.imagenDe(categoria);
    foto.alt = evento.imagen
      ? "Imagen del evento " + evento.nombre
      : "Imagen de referencia de la categoría " + categoria;

    var cuerpo = document.createElement("div");

    var nombre = document.createElement("h3");
    nombre.textContent = evento.nombre;

    var cuando = document.createElement("p");
    cuando.textContent = FormatoModelo.fechaLarga(evento.fecha_hora_inicio);

    var donde = document.createElement("p");
    donde.textContent = evento.teatro + " · " + evento.ciudad;

    cuerpo.appendChild(nombre);
    cuerpo.appendChild(cuando);
    cuerpo.appendChild(donde);

    tarjeta.appendChild(foto);
    tarjeta.appendChild(cuerpo);
    caja.appendChild(tarjeta);
  }

  // ------------------------------------------------- pantalla de reserva --

  function cargar(codigo) {
    if (!codigo || !ApiModelo.hayApi()) return;

    mensaje("");
    ApiModelo.evento(codigo).then(function (datos) {
      evento = datos;

      var volver = document.querySelector("[data-volver-evento]");
      if (volver) volver.href = "#/evento/" + datos.codigo_evento;

      tarjetaDeEvento(document.querySelector("[data-rv-evento]"), datos);
      pintarDatosDelCliente();

      var campo = entradas();
      campo.max = String(tope());
      campo.value = "1";

      var cupos = document.querySelector("[data-rv-cupos]");
      cupos.textContent = Number(datos.cupos_disponibles) > 0
        ? "Quedan " + FormatoModelo.numero(datos.cupos_disponibles) + " cupos. Máximo " +
          tope() + (tope() === 1 ? " entrada" : " entradas") + " por reserva."
        : "Este evento ya no tiene cupos disponibles.";

      pintarCuentas();
    }).catch(function (error) {
      mensaje(error.estado === 404 ? "Este evento ya no está en el catálogo." : error.message);
    });
  }

  function confirmar(boton) {
    if (!evento) return;

    CargaVista.boton(boton, true, "Reservando…");
    mensaje("");

    var observaciones = document.getElementById("rv-observaciones").value.trim();

    ApiModelo.crearReserva({
      codigo_evento: evento.codigo_evento,
      numero_entradas: cantidad(),
      observaciones: observaciones || null
    }).then(function (reserva) {
      hecha = reserva;
      window.location.hash = "#/reserva-lista/" + reserva.id_reserva;
    }).catch(function (error) {
      CargaVista.boton(boton, false);
      mensaje(error.message);
    });
  }

  // --------------------------------------------- pantalla de confirmación --

  function pintarConfirmacion(reserva) {
    document.querySelector("[data-lt-codigo]").textContent = codigoDe(reserva);

    // El círculo y el chulo se dibujan solos al llegar a esta pantalla.
    CargaVista.chulo(document.querySelector(".lista-chulo"));

    var caja = document.querySelector("[data-lt-evento]");
    tarjetaDeEvento(caja, {
      nombre: reserva.evento,
      teatro: reserva.teatro,
      ciudad: reserva.ciudad,
      fecha_hora_inicio: reserva.fecha_evento,
      descripcion: ""
    });

    var cuentas = document.querySelector("[data-lt-cuentas]");
    cuentas.textContent = "";

    function fila(titulo, valor, total) {
      var grupo = document.createElement("div");
      if (total) grupo.className = "resumen-total";
      var dt = document.createElement("dt");
      dt.textContent = titulo;
      var dd = document.createElement("dd");
      dd.textContent = valor;
      grupo.appendChild(dt);
      grupo.appendChild(dd);
      cuentas.appendChild(grupo);
    }

    fila("Entradas", FormatoModelo.numero(reserva.numero_entradas));
    fila("Precio por entrada", FormatoModelo.pesos(reserva.precio_base));
    fila("Estado", reserva.estado);
    if (reserva.observaciones) fila("Observaciones", reserva.observaciones);
    fila("Total", FormatoModelo.pesos(reserva.valor_total), true);
  }

  function cargarConfirmacion(id) {
    if (!id || !ApiModelo.hayApi()) return;

    if (hecha && String(hecha.id_reserva) === String(id)) {
      pintarConfirmacion(hecha);
      return;
    }

    ApiModelo.reservas().then(function (reservas) {
      var reserva = reservas.filter(function (r) {
        return String(r.id_reserva) === String(id);
      })[0];
      if (reserva) pintarConfirmacion(reserva);
    }).catch(function () {
      // Si no se puede leer, la pantalla se queda con lo que ya muestra.
    });
  }

  // ------------------------------------------------------------ arranque --

  function iniciar() {
    var campo = entradas();
    if (!campo) return;

    campo.addEventListener("input", pintarCuentas);
    campo.addEventListener("change", pintarCuentas);

    document.addEventListener("click", function (e) {
      // Un evento puede venir de algo que no es un elemento (por ejemplo, uno
      // lanzado sobre el propio documento): ahí no hay nada que buscar.
      if (!e.target || !e.target.closest) return;
      if (e.target.closest("[data-rv-menos]")) {
        campo.value = String(Math.max(1, cantidad() - 1));
        pintarCuentas();
        return;
      }
      if (e.target.closest("[data-rv-mas]")) {
        campo.value = String(Math.min(tope(), cantidad() + 1));
        pintarCuentas();
        return;
      }
      var confirmarBoton = e.target.closest("[data-rv-confirmar]");
      if (confirmarBoton) confirmar(confirmarBoton);
    });

    document.addEventListener("ticketflow:pantalla", function (e) {
      if (e.detail.pantalla === "reservar") cargar(e.detail.parametro);
      if (e.detail.pantalla === "reserva-lista") cargarConfirmacion(e.detail.parametro);
    });
  }

  return { iniciar: iniciar };
})();
