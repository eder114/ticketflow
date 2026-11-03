// Controlador: conecta el inicio de sesión y los registros con la API
var AccesoControlador = (function () {
  "use strict";

  // Dónde lleva cada perfil después de entrar.
  var DESTINO = {
    cliente: "#/catalogo",
    agente: "#/panel-agente",
    administrador: "#/panel-admin"
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

  // Dónde quería ir la persona antes de que le pidiéramos la sesión. Se
  // guarda al pulsar "Reservar" sin haber entrado, y se usa una sola vez.
  var LLAVE_VOLVER = "ticketflow:volver-a";
  var VENCE = 30 * 60 * 1000;      // media hora; después ya no tiene sentido

  function recordarDestino(ruta) {
    try {
      sessionStorage.setItem(LLAVE_VOLVER, JSON.stringify({ ruta: ruta, cuando: Date.now() }));
    } catch (error) { /* en modo privado puede fallar; no pasa nada */ }
  }

  function destinoGuardado() {
    try {
      var crudo = sessionStorage.getItem(LLAVE_VOLVER);
      sessionStorage.removeItem(LLAVE_VOLVER);
      if (!crudo) return null;

      var guardado = JSON.parse(crudo);
      if (!guardado || !guardado.ruta) return null;
      if (Date.now() - guardado.cuando > VENCE) return null;
      return guardado.ruta;
    } catch (error) { return null; }
  }

  function entrar(sesion) {
    SesionModelo.guardar(sesion);
    SesionVista.actualizar(RutasModelo.actual());

    // Si venía de algún lado —porque puló "Reservar" sin haber entrado, o
    // porque se le venció la sesión ahí— se le devuelve a ese mismo sitio,
    // siempre que su perfil pueda verlo. Si no, al tablero que le toca.
    var volver = destinoGuardado();
    window.location.hash = (volver && puedeIr(volver))
      ? volver
      : (DESTINO[sesion.usuario.perfil] || "#/inicio");
  }

  /** Si el perfil que acaba de entrar tiene permiso para esa ruta. */
  function puedeIr(ruta) {
    var pantalla = String(ruta).replace(/^#?\//, "").split("/")[0];
    return !!pantalla && SesionModelo.puedeVer(pantalla);
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

  // El token dura ocho horas. Cuando vence, la API responde 401 y el modelo
  // avisa: aquí se cierra la sesión de verdad y se lleva a la persona al
  // formulario, en vez de dejarla con una sesión que ya no sirve y una
  // pantalla que falla cada vez que entra.
  function vigilarSesionVencida() {
    var avisando = false;

    document.addEventListener("ticketflow:sesion-vencida", function () {
      if (avisando || !SesionModelo.iniciada()) return;
      avisando = true;

      // Vuelve a donde estaba una vez entre otra vez.
      recordarDestino(window.location.hash.slice(1));
      SesionModelo.cerrar();
      SesionVista.actualizar();
      window.location.hash = "#/iniciar-sesion";

      window.setTimeout(function () {
        var form = document.querySelector('form[data-envio="sesion"]');
        if (form) {
          FormularioVista.mostrarMensaje(
            form,
            "La sesión se venció por seguridad. Vuelve a entrar para seguir donde ibas."
          );
        }
        avisando = false;
      }, 60);
    });
  }

  function iniciar() {
    // Cualquier enlace que diga a dónde volver deja la nota antes de irse al
    // formulario de inicio de sesión.
    document.addEventListener("click", function (e) {
      // Un evento puede venir de algo que no es un elemento (por ejemplo, uno
      // lanzado sobre el propio documento): ahí no hay nada que buscar.
      if (!e.target || !e.target.closest) return;
      var enlace = e.target.closest ? e.target.closest("[data-volver-a]") : null;
      if (enlace) recordarDestino(enlace.dataset.volverA);
    });
    cargarCiudades();
    vigilarSesionVencida();

    // Solo los de acceso: el de registrar eventos lo maneja su controlador.
    var MIOS = ["sesion", "registro-cliente", "registro-agente"];

    document.querySelectorAll("form[data-envio]").forEach(function (form) {
      if (MIOS.indexOf(form.dataset.envio) === -1) return;
      form.addEventListener("ticketflow:validado", function () {
        enviar(form, form.dataset.envio);
      });
    });
  }

  return { iniciar: iniciar };
})();
