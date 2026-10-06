// Controlador: conecta el inicio de sesión y los registros con la API
var AccesoControlador = (function () {
  "use strict";

  // Dónde lleva cada perfil después de entrar.
  var DESTINO = {
    cliente: "#/catalogo",
    agente: "#/crear-evento",
    administrador: "#/catalogo"
  };

  function valor(form, nombre) {
    var campo = form.elements[nombre];
    return campo ? String(campo.value).trim() : "";
  }

  // Los nombres de los campos del formulario no son los mismos de la API, así
  // que aquí se traducen. El id de la ciudad sale del value del desplegable.
  function datosDe(form, tipo) {
    if (tipo === "sesion") {
      return { correo: valor(form, "correo"), contrasena: valor(form, "clave") };
    }

    var comunes = {
      identificacion: valor(form, "identificacion"),
      nombres: valor(form, "nombres"),
      apellidos: valor(form, "apellidos"),
      correo: valor(form, "correo"),
      contrasena: valor(form, "clave"),
      id_ciudad: Number(valor(form, "ciudad")) || null
    };

    var telefono = valor(form, "telefono");
    comunes.telefonos = telefono ? [telefono] : [];

    if (tipo === "registro-agente") {
      comunes.experiencia = Number(valor(form, "experiencia")) || 0;
      comunes.comision = 0;
    }
    return comunes;
  }

  // El backend devuelve el detalle por campo; aquí se pinta cada error donde
  // corresponde, usando los mismos ids del formulario.
  var EQUIVALENTES = {
    identificacion: "identificacion",
    nombres: "nombres",
    apellidos: "apellidos",
    correo: "correo",
    contrasena: "clave",
    id_ciudad: "ciudad",
    experiencia: "experiencia"
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

  function entrar(sesion) {
    SesionModelo.guardar(sesion);
    SesionVista.actualizar(RutasModelo.actual());
    window.location.hash = DESTINO[sesion.usuario.perfil] || "#/inicio";
  }

  function enviar(form, tipo) {
    var datos = datosDe(form, tipo);

    var peticion =
      tipo === "sesion" ? ApiModelo.iniciarSesion(datos.correo, datos.contrasena)
      : tipo === "registro-cliente" ? ApiModelo.registrarCliente(datos)
      : ApiModelo.registrarAgente(datos);

    FormularioVista.ocupado(form, true);

    return peticion
      .then(function (sesion) {
        FormularioVista.ocupado(form, false);
        entrar(sesion);
      })
      .catch(function (error) {
        FormularioVista.ocupado(form, false);

        if (error instanceof ApiModelo.SinConexion) {
          // La página publicada no tiene backend: se queda con la validación
          // del navegador, igual que en el Sprint 1.
          FormularioVista.mostrarExito(form);
          return;
        }

        if (!pintarDetalles(form, error.detalles)) {
          FormularioVista.mostrarMensaje(form, error.message);
        }
      });
  }

  // Las ciudades vienen de la base de datos; mientras tanto quedan las del
  // HTML, para que el formulario sirva aunque el backend no esté levantado.
  function cargarCiudades() {
    var selectores = document.querySelectorAll("[data-ciudades]");
    if (!selectores.length || !ApiModelo.hayApi()) return;

    ApiModelo.ciudades().then(function (ciudades) {
      selectores.forEach(function (select) {
        var elegida = select.value;
        var primera = select.options[0];
        select.textContent = "";
        select.appendChild(primera);

        ciudades.forEach(function (c) {
          var opcion = document.createElement("option");
          opcion.value = String(c.id_ciudad);
          opcion.textContent = c.ciudad + " · " + c.departamento;
          select.appendChild(opcion);
        });
        select.value = elegida;
      });
    }).catch(function () {
      // Sin backend se quedan las ciudades que ya trae el HTML.
    });
  }

  function iniciar() {
    cargarCiudades();

    document.querySelectorAll("form[data-envio]").forEach(function (form) {
      form.addEventListener("ticketflow:validado", function () {
        enviar(form, form.dataset.envio);
      });
    });
  }

  return { iniciar: iniciar };
})();
