// Modelo: hablar con la API
var ApiModelo = (function () {
  "use strict";

  // En desarrollo el backend corre aparte, en el puerto 4000. Cuando la página
  // está publicada en GitHub Pages no hay backend: ahí la aplicación se queda
  // trabajando con los datos de ejemplo.
  var BASE = (function () {
    if (window.TICKETFLOW_API) return window.TICKETFLOW_API;
    var h = window.location.hostname;
    if (h === "localhost" || h === "127.0.0.1" || h === "") return "http://localhost:4000/api";
    return null;
  })();

  function hayApi() {
    return BASE !== null;
  }

  // Error con el detalle por campo que devuelve el backend.
  function ErrorApi(mensaje, detalles, estado) {
    this.name = "ErrorApi";
    this.message = mensaje;
    this.detalles = detalles || {};
    this.estado = estado;
  }
  ErrorApi.prototype = Object.create(Error.prototype);

  function SinConexion() {
    this.name = "SinConexion";
    this.message = "No se pudo hablar con el servidor.";
  }
  SinConexion.prototype = Object.create(Error.prototype);

  function pedir(ruta, opciones) {
    opciones = opciones || {};
    if (!hayApi()) return Promise.reject(new SinConexion());

    var cabeceras = { "Content-Type": "application/json" };
    var sesion = SesionModelo.token && SesionModelo.token();
    if (sesion) cabeceras.Authorization = "Bearer " + sesion;

    return fetch(BASE + ruta, {
      method: opciones.metodo || "GET",
      headers: cabeceras,
      body: opciones.datos ? JSON.stringify(opciones.datos) : undefined
    }).then(
      function (respuesta) {
        return respuesta.text().then(function (texto) {
          var cuerpo = null;
          try { cuerpo = texto ? JSON.parse(texto) : null; } catch (e) { cuerpo = null; }

          if (respuesta.ok) return cuerpo;
          throw new ErrorApi(
            (cuerpo && cuerpo.error) || "No se pudo completar la operación.",
            cuerpo && cuerpo.detalles,
            respuesta.status
          );
        });
      },
      function () {
        // El servidor no respondió: no está levantado o no hay red.
        throw new SinConexion();
      }
    );
  }

  return {
    hayApi: hayApi,
    base: function () { return BASE; },
    ErrorApi: ErrorApi,
    SinConexion: SinConexion,

    iniciarSesion: function (correo, contrasena) {
      return pedir("/sesion", { metodo: "POST", datos: { correo: correo, contrasena: contrasena } });
    },
    registrarCliente: function (datos) {
      return pedir("/registro/cliente", { metodo: "POST", datos: datos });
    },
    registrarAgente: function (datos) {
      return pedir("/registro/agente", { metodo: "POST", datos: datos });
    },
    ciudades: function () {
      return pedir("/ciudades?conUbicacion=true");
    }
  };
})();
