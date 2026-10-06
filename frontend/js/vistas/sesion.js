// Vista: pinta el encabezado según quién inició sesión
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

  // El menú de la portada tiene anclas propias (#eventos, #categorias) que solo
  // funcionan ahí, así que ese no se reemplaza: solo se le agregan las entradas
  // del perfil. Los demás encabezados sí se arman completos.
  function pintarMenu(nav, rutaActual) {
    nav.querySelectorAll("[data-de-sesion]").forEach(function (a) { a.remove(); });

    var fijo = nav.dataset.fijo !== undefined;
    if (!fijo) nav.textContent = "";

    SesionModelo.menu().forEach(function (item) {
      if (fijo && nav.querySelector('a[href="' + item.ruta + '"]')) return;
      nav.appendChild(enlace(item, rutaActual));
    });
  }

  function pintarAcciones(caja) {
    caja.textContent = "";
    var usuario = SesionModelo.usuario();

    if (!usuario) {
      caja.insertAdjacentHTML(
        "beforeend",
        '<a href="#/iniciar-sesion" class="btn btn-secundario">Iniciar sesión</a>' +
        '<a href="#/registro-cliente" class="btn btn-primario">Registrarse</a>'
      );
      return;
    }

    var saludo = document.createElement("span");
    saludo.className = "sesion-nombre";
    saludo.textContent = usuario.nombre.split(" ")[0];

    var perfil = document.createElement("span");
    perfil.className = "sesion-perfil";
    perfil.textContent = usuario.perfil;

    var salir = document.createElement("button");
    salir.type = "button";
    salir.className = "btn btn-secundario";
    salir.dataset.cerrarSesion = "";
    salir.textContent = "Cerrar sesión";

    caja.appendChild(saludo);
    caja.appendChild(perfil);
    caja.appendChild(salir);
  }

  // Se llama en cada cambio de pantalla, para que todos los encabezados queden
  // mostrando lo mismo.
  function actualizar(rutaActual) {
    document.querySelectorAll(".encabezado .nav").forEach(function (nav) {
      pintarMenu(nav, rutaActual);
    });
    document.querySelectorAll("[data-acciones-sesion]").forEach(pintarAcciones);
  }

  return { actualizar: actualizar };
})();
