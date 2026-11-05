// Controlador: recuperar la contraseña con un código que llega al correo.
//
// La pantalla tiene dos pasos dentro de la misma vista: primero el correo y
// después el código con la contraseña nueva. Se guarda en memoria a qué correo
// se mandó, porque el segundo paso lo necesita y no vale la pena pedírselo
// otra vez al usuario.
var RecuperacionControlador = (function () {
  "use strict";

  var correoPedido = null;

  function paso(cual) {
    document.querySelectorAll("[data-rec-paso]").forEach(function (caja) {
      caja.hidden = caja.dataset.recPaso !== cual;
    });

    var titulo = document.querySelector("[data-rec-titulo]");
    if (titulo) {
      titulo.textContent = cual === "correo"
        ? "¿Olvidaste tu contraseña?"
        : "Revisa tu correo";
    }
  }

  function empezarDeCero() {
    correoPedido = null;
    paso("correo");

    ["rec-correo", "rec-codigo", "rec-clave", "rec-clave2"].forEach(function (id) {
      var campo = document.getElementById(id);
      if (!campo) return;
      campo.value = "";
      FormularioVista.limpiarError(campo);
    });

    var fuerza = document.getElementById("rec-fuerza");
    if (fuerza) fuerza.dataset.nivel = "0";

    document.querySelectorAll("#vista-recuperar form").forEach(function (form) {
      FormularioVista.limpiarMensaje(form);
    });
  }

  // El backend dice cuál campo falló; ese mensaje es más útil que el general.
  function pintarDetalle(form, error, porDefecto) {
    var detalles = error.detalles || {};
    var llaves = Object.keys(detalles);

    for (var i = 0; i < llaves.length; i++) {
      var campo = form.elements[llaves[i]];
      if (campo) {
        FormularioVista.mostrarError(campo, detalles[llaves[i]]);
        FormularioVista.enfocar(campo);
        return;
      }
    }
    FormularioVista.mostrarMensaje(form, llaves.length ? detalles[llaves[0]] : porDefecto);
  }

  // ------------------------------------------------------- paso 1: correo --

  function pedir(form) {
    var correo = form.elements.correo.value.trim();

    FormularioVista.limpiarMensaje(form);
    FormularioVista.ocupado(form, true);

    ApiModelo.pedirCodigo(correo).then(function (respuesta) {
      FormularioVista.ocupado(form, false);
      correoPedido = correo;
      paso("codigo");

      var aviso = document.querySelector("[data-rec-enviado]");
      if (aviso) aviso.textContent = respuesta.mensaje;

      var campo = document.getElementById("rec-codigo");
      if (campo) FormularioVista.enfocar(campo);
    }).catch(function (error) {
      FormularioVista.ocupado(form, false);

      if (error instanceof ApiModelo.SinConexion) {
        FormularioVista.mostrarMensaje(form,
          "No se pudo hablar con el servidor. Intenta otra vez en un momento.");
        return;
      }
      pintarDetalle(form, error, error.message);
    });
  }

  // ------------------------------- paso 2: el código y la contraseña nueva --

  function cambiar(form) {
    if (!correoPedido) {
      empezarDeCero();
      return;
    }

    var codigo = form.elements.codigo.value.trim();
    var contrasena = form.elements.contrasena.value;

    FormularioVista.limpiarMensaje(form);
    FormularioVista.ocupado(form, true);

    ApiModelo.cambiarContrasena(correoPedido, codigo, contrasena).then(function () {
      FormularioVista.ocupado(form, false);

      // Se guarda el correo para que el formulario de entrada lo traiga puesto.
      var recordado = correoPedido;
      correoPedido = null;

      window.location.hash = "#/iniciar-sesion";

      window.setTimeout(function () {
        var acceso = document.querySelector('form[data-envio="sesion"]');
        if (!acceso) return;

        if (acceso.elements.correo) acceso.elements.correo.value = recordado;
        FormularioVista.mostrarMensaje(
          acceso,
          "Tu contraseña quedó cambiada. Entra con la nueva.",
          false
        );
        if (acceso.elements.clave) FormularioVista.enfocar(acceso.elements.clave);
      }, 80);
    }).catch(function (error) {
      FormularioVista.ocupado(form, false);

      if (error instanceof ApiModelo.SinConexion) {
        FormularioVista.mostrarMensaje(form,
          "No se pudo hablar con el servidor. Intenta otra vez en un momento.");
        return;
      }
      pintarDetalle(form, error, error.message);
    });
  }

  // ------------------------------------------------------------- enlaces --

  function iniciar() {
    if (!document.getElementById("vista-recuperar")) return;

    document.querySelectorAll("[data-rec-pedir]").forEach(function (form) {
      form.addEventListener("ticketflow:validado", function () { pedir(form); });
    });
    document.querySelectorAll("[data-rec-cambiar]").forEach(function (form) {
      form.addEventListener("ticketflow:validado", function () { cambiar(form); });
    });

    document.addEventListener("click", function (e) {
      // Un evento puede venir de algo que no es un elemento (por ejemplo, uno
      // lanzado sobre el propio documento): ahí no hay nada que buscar.
      if (!e.target || !e.target.closest) return;
      var otro = e.target.closest("[data-rec-otro]");
      if (!otro) return;
      e.preventDefault();
      empezarDeCero();
      var campo = document.getElementById("rec-correo");
      if (campo) FormularioVista.enfocar(campo);
    });

    // Al entrar a la pantalla se arranca siempre por el primer paso: si no,
    // quien vuelve más tarde se encuentra pidiendo un código que ya venció.
    document.addEventListener("ticketflow:pantalla", function (e) {
      if (e.detail.pantalla === "recuperar") empezarDeCero();
    });
  }

  return { iniciar: iniciar };
})();
