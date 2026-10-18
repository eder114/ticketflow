// Vista: pinta el encabezado y el cajón según quién inició sesión
var SesionVista = (function () {
  "use strict";

  function enlace(item, rutaActual) {
    var a = document.createElement("a");
    a.href = item.ruta;
    a.textContent = item.texto;
    a.dataset.deSesion = "";
    if (item.ruta.replace(/^#\/?/, "") === rutaActual) {
      a.className = "activo";
      a.setAttribute("aria-current", "page");
    }
    return a;
  }

  // Las pantallas del perfil viven en el cajón lateral y en la barra lateral
  // de los paneles. La barra de arriba se queda con sus enlaces fijos, para
  // que no se llene de cosas.
  function pintarMenu(nav, rutaActual) {
    nav.querySelectorAll("[data-de-sesion]").forEach(function (a) { a.remove(); });
    nav.textContent = "";

    SesionModelo.menu().forEach(function (item) {
      nav.appendChild(enlace(item, rutaActual));
    });
  }

  function iniciales(nombre) {
    return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map(function (parte) {
      return parte.charAt(0).toUpperCase();
    }).join("");
  }

  // El botón del encabezado: con sesión muestra quién entró y abre el cajón.
  function chipDeUsuario(usuario) {
    var boton = document.createElement("button");
    boton.type = "button";
    boton.className = "chip-usuario";
    boton.dataset.abrirCajon = "";
    boton.setAttribute("aria-expanded", "false");
    boton.setAttribute("aria-label", "Abrir el menú de " + usuario.nombre);

    var circulo = document.createElement("span");
    circulo.className = "chip-avatar";
    circulo.setAttribute("aria-hidden", "true");
    circulo.textContent = iniciales(usuario.nombre);

    var nombre = document.createElement("span");
    nombre.className = "chip-nombre";
    nombre.textContent = usuario.nombre.split(" ")[0];

    var perfil = document.createElement("span");
    perfil.className = "chip-perfil";
    perfil.textContent = usuario.perfil;

    boton.appendChild(circulo);
    boton.appendChild(nombre);
    boton.appendChild(perfil);
    return boton;
  }

  function botonDeSalir() {
    var salir = document.createElement("button");
    salir.type = "button";
    salir.className = "btn btn-secundario";
    salir.dataset.cerrarSesion = "";
    salir.textContent = "Cerrar sesión";
    return salir;
  }

  function pintarAcciones(caja) {
    caja.textContent = "";
    var usuario = SesionModelo.usuario();
    var dentroDelCajon = caja.dataset.accionesSesion === "cajon";

    if (!usuario) {
      caja.insertAdjacentHTML(
        "beforeend",
        '<a href="#/iniciar-sesion" class="btn btn-secundario">Iniciar sesión</a>' +
        '<a href="#/registro-cliente" class="btn btn-primario">Registrarse</a>'
      );
      return;
    }

    // En el cajón y en los paneles va el botón de salir; en la barra de
    // arriba, el botón con el nombre que abre el cajón.
    if (dentroDelCajon || caja.closest(".tablero-lateral")) {
      caja.appendChild(botonDeSalir());
      return;
    }
    caja.appendChild(chipDeUsuario(usuario));
  }

  // Se llama en cada cambio de pantalla, para que el encabezado, el cajón y
  // las barras laterales queden mostrando lo mismo.
  function actualizar(rutaActual) {
    document.querySelectorAll("[data-menu-sesion]").forEach(function (nav) {
      pintarMenu(nav, rutaActual);
    });
    document.querySelectorAll("[data-acciones-sesion]").forEach(pintarAcciones);
    TableroVista.pintarUsuario();
  }

  return { actualizar: actualizar };
})();
