// Modelo: quién inició sesión y qué puede ver
var SesionModelo = (function () {
  "use strict";

  var LLAVE = "ticketflow.sesion";

  // Qué pantallas puede abrir cada perfil. Las que no están aquí son públicas.
  var PERMISOS = {
    "crear-evento": ["agente", "administrador"],
    "panel-agente": ["agente", "administrador"],
    "panel-admin": ["administrador"],
    "gestion": ["administrador"],
    "mis-reservas": ["cliente"],
    "reservar": ["cliente"],
    "reserva-lista": ["cliente"]
  };

  // Qué ve en el menú cada perfil. El icono es el que sale en la barra
  // lateral de los paneles y en el cajon.
  var MENU = {
    visitante: [
      { ruta: "#/inicio", texto: "Inicio", icono: "🏠" },
      { ruta: "#/catalogo", texto: "Catálogo", icono: "🎫" }
    ],
    cliente: [
      { ruta: "#/inicio", texto: "Inicio", icono: "🏠" },
      { ruta: "#/catalogo", texto: "Catálogo", icono: "🎫" },
      { ruta: "#/mis-reservas", texto: "Mis reservas", icono: "📋" }
    ],
    agente: [
      { ruta: "#/inicio", texto: "Inicio", icono: "🏠" },
      { ruta: "#/catalogo", texto: "Catálogo", icono: "🎫" },
      { ruta: "#/panel-agente", texto: "Ventas", icono: "📊" },
      { ruta: "#/crear-evento", texto: "Crear evento", icono: "➕" }
    ],
    administrador: [
      { ruta: "#/inicio", texto: "Inicio", icono: "🏠" },
      { ruta: "#/catalogo", texto: "Catálogo", icono: "🎫" },
      { ruta: "#/panel-agente", texto: "Reservas", icono: "📋" },
      { ruta: "#/crear-evento", texto: "Crear evento", icono: "➕" },
      { ruta: "#/panel-admin", texto: "Estadísticas", icono: "📊" },
      { ruta: "#/gestion", texto: "Datos", icono: "⚙" }
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

  function token() {
    return actual && actual.token ? actual.token : null;
  }

  return {
    guardar: guardar,
    token: token,
    cerrar: function () { guardar(null); },
    usuario: usuario,
    perfil: perfil,
    iniciada: haySesion,
    puedeVer: puedeVer,
    menu: menu
  };
})();
