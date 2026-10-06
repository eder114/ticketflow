// Modelo: quién inició sesión y qué puede ver
var SesionModelo = (function () {
  "use strict";

  var LLAVE = "ticketflow.sesion";

  // Qué pantallas puede abrir cada perfil. Las que no están aquí son públicas.
  var PERMISOS = {
    "crear-evento": ["agente", "administrador"],
    "panel-agente": ["agente", "administrador"],
    "panel-admin": ["administrador"],
    "mis-reservas": ["cliente"]
  };

  // Qué ve en el menú cada perfil
  var MENU = {
    visitante: [
      { ruta: "#/inicio", texto: "Inicio" },
      { ruta: "#/catalogo", texto: "Catálogo" }
    ],
    cliente: [
      { ruta: "#/inicio", texto: "Inicio" },
      { ruta: "#/catalogo", texto: "Catálogo" },
      { ruta: "#/mis-reservas", texto: "Mis reservas" }
    ],
    agente: [
      { ruta: "#/inicio", texto: "Inicio" },
      { ruta: "#/catalogo", texto: "Catálogo" },
      { ruta: "#/crear-evento", texto: "Registrar evento" }
    ],
    administrador: [
      { ruta: "#/inicio", texto: "Inicio" },
      { ruta: "#/catalogo", texto: "Catálogo" },
      { ruta: "#/crear-evento", texto: "Registrar evento" },
      { ruta: "#/panel-admin", texto: "Reportes" }
    ]
  };

  function leerGuardada() {
    try {
      var crudo = window.localStorage.getItem(LLAVE);
      return crudo ? JSON.parse(crudo) : null;
    } catch (e) {
      // Navegación privada o almacenamiento bloqueado: se entra como visitante.
      return null;
    }
  }

  var actual = leerGuardada();

  function guardar(sesion) {
    actual = sesion;
    try {
      if (sesion) window.localStorage.setItem(LLAVE, JSON.stringify(sesion));
      else window.localStorage.removeItem(LLAVE);
    } catch (e) {
      // Si no se puede guardar, la sesión dura lo que dure la pestaña.
    }
  }

  function usuario() {
    return actual && actual.usuario ? actual.usuario : null;
  }

  function perfil() {
    var u = usuario();
    return u ? u.perfil : "visitante";
  }

  function haySesion() {
    return usuario() !== null;
  }

  function puedeVer(pantalla) {
    var permitidos = PERMISOS[pantalla];
    if (!permitidos) return true;
    return permitidos.indexOf(perfil()) !== -1;
  }

  function menu() {
    return MENU[perfil()] || MENU.visitante;
  }

  return {
    guardar: guardar,
    cerrar: function () { guardar(null); },
    usuario: usuario,
    perfil: perfil,
    iniciada: haySesion,
    puedeVer: puedeVer,
    menu: menu
  };
})();
